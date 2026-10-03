#!/usr/bin/env node
// Vérifie que chaque preuve renvoie à un passage, une page, des cellules ou une
// zone d'image qui existe vraiment dans le corpus, et que les règles du défi
// sont respectées (dix questions, actions complètes, garde-fous des mises à jour).
//
// Usage : node outils/verifier.mjs

import { toutCharger, chargerCommun } from './lib/charger.mjs';
import { texteDocument, decomposerRef } from './lib/corpus.mjs';

export function verifier(charge, C) {
  const { operations: op, documents, doublons, evenements, exemples, sourcesEvenements } = charge;
  const erreurs = [];
  const infos = [];
  const sourcesParId = Object.fromEntries([...op.sources, ...sourcesEvenements].map((s) => [s.id, s]));

  // 1. Date de situation fixe.
  if (op.meta.date_situation !== '2026-09-30T09:00:00-04:00')
    erreurs.push(`meta.date_situation doit rester 2026-09-30T09:00:00-04:00 (trouvé : ${op.meta.date_situation}).`);

  // 2. Identifiants de sources uniques et autorités connues.
  const vus = new Set();
  for (const s of op.sources) {
    if (vus.has(s.id)) erreurs.push(`Identifiant de source en double : ${s.id}.`);
    vus.add(s.id);
    if (!op.autorites[s.autorite]) erreurs.push(`Source ${s.id} : autorité inconnue « ${s.autorite} ».`);
    if (s.copie_de && !sourcesParId[s.copie_de]) erreurs.push(`Source ${s.id} : copie_de « ${s.copie_de} » introuvable.`);
  }

  // 3. Doublons détectés automatiquement : ils doivent être déclarés comme copies.
  for (const groupe of doublons) {
    const racines = new Set(C.groupesIndependants(groupe, sourcesParId));
    if (racines.size > 1) erreurs.push(`Fichiers identiques non déclarés comme copies : ${groupe.join(', ')} (ajoutez "copie_de").`);
    else infos.push(`Copie reconnue : ${groupe.join(' = ')}.`);
  }
  for (const [id, d] of Object.entries(documents))
    for (const p of d.pieces || []) if (p.identique_a) infos.push(`Pièce jointe de ${id} (${p.nom}) = ${p.identique_a.join(', ')} : une seule preuve.`);

  // 4. Toutes les preuves, où qu'elles soient dans les données.
  let nbPreuves = 0;
  const controlerPreuve = (p, ou) => {
    nbPreuves++;
    const doc = documents[p.source];
    if (!sourcesParId[p.source]) return erreurs.push(`${ou} : source « ${p.source} » inconnue.`);
    if (!doc) return erreurs.push(`${ou} : document de la source ${p.source} non chargé.`);
    if (p.passage) {
      let texte = texteDocument(doc);
      if (doc.genre === 'pdf' && p.page) {
        const page = doc.pages[p.page - 1];
        if (!page) return erreurs.push(`${ou} : page ${p.page} absente de ${p.source}.`);
        texte = page.texte;
      }
      if (doc.genre === 'pdf' && !doc.pages.length) return infos.push(`${ou} : texte PDF non disponible (poppler absent), passage non vérifié.`);
      if (!C.trouverPassage(texte, p.passage, p.jusqua))
        erreurs.push(`${ou} : passage introuvable dans ${p.source}${p.jusqua ? ' (ou fin « ' + p.jusqua.slice(0, 40) + '… » introuvable)' : ''} :\n      « ${p.passage.slice(0, 110)} »`);
    }
    if (p.cellules) {
      if (doc.genre !== 'tableur') return erreurs.push(`${ou} : « cellules » sur une source qui n'est pas un tableur (${p.source}).`);
      const f = p.feuille ? doc.feuilles.find((x) => x.nom === p.feuille) : doc.feuilles[0];
      if (!f) return erreurs.push(`${ou} : feuille « ${p.feuille} » absente de ${p.source}.`);
      const hors = C.cellulesDePlage(p.cellules).filter((ref) => {
        const { col, ligne } = decomposerRef(ref);
        return col > f.maxCol || ligne > f.maxLigne;
      });
      if (hors.length) erreurs.push(`${ou} : plage ${p.cellules} hors du tableau de ${p.source} (dernière cellule : ${C.lettreColonne(f.maxCol)}${f.maxLigne}).`);
    }
    if (p.zone) {
      if (doc.genre !== 'image') return erreurs.push(`${ou} : « zone » sur une source qui n'est pas une image (${p.source}).`);
      const z = p.zone;
      if (doc.largeur && (z.x < 0 || z.y < 0 || z.x + z.w > doc.largeur || z.y + z.h > doc.hauteur))
        erreurs.push(`${ou} : zone hors de l'image ${p.source} (${doc.largeur}×${doc.hauteur}).`);
    }
    if (!p.passage && !p.cellules && !p.zone && !p.page) infos.push(`${ou} : preuve sans repère précis (source ${p.source} entière).`);
  };
  const parcourir = (obj, chemin) => {
    if (Array.isArray(obj)) return obj.forEach((x, i) => parcourir(x, `${chemin}[${i}]`));
    if (obj && typeof obj === 'object') {
      if (typeof obj.source === 'string' && (obj.passage || obj.cellules || obj.zone || obj.page || obj.repere)) controlerPreuve(obj, chemin);
      for (const [k, v] of Object.entries(obj)) if (k !== 'sources' || !Array.isArray(v) || typeof v[0] !== 'object') parcourir(v, chemin ? `${chemin}.${k}` : k);
    }
  };
  parcourir({ ...op, sources: undefined }, '');

  // 5. Les dix questions officielles.
  const attendues = ['Q01', 'Q02', 'Q03', 'Q04', 'Q05', 'Q06', 'Q07', 'Q08', 'Q09', 'Q10'];
  for (const id of attendues) {
    const q = op.questions.find((x) => x.id === id);
    if (!q) { erreurs.push(`Question officielle ${id} absente.`); continue; }
    if (!q.reponse_courte) erreurs.push(`${id} : réponse courte manquante.`);
    if (!q.preuves?.length) erreurs.push(`${id} : aucune preuve.`);
    const groupes = C.groupesIndependants((q.preuves || []).map((p) => p.source), sourcesParId);
    infos.push(`${id} : ${q.preuves?.length || 0} preuves, ${groupes.length} sources indépendantes.`);
  }

  // 6. Actions et conditions.
  const idsActions = new Set(op.actions.map((a) => a.id));
  for (const a of op.actions) {
    const ou = `Action ${a.id}`;
    if (!a.responsable) erreurs.push(`${ou} : responsable manquant.`);
    if (!['confirme', 'propose'].includes(a.responsable_statut)) erreurs.push(`${ou} : responsable_statut doit être « confirme » ou « propose ».`);
    if (!['engagement', 'recommandation'].includes(a.type)) erreurs.push(`${ou} : type doit être « engagement » ou « recommandation ».`);
    if (!C.ETATS[a.etat]) erreurs.push(`${ou} : état inconnu « ${a.etat} ».`);
    if (!a.echeance && !/à confirmer/i.test(a.echeance_texte || '')) erreurs.push(`${ou} : sans date connue, l'échéance doit indiquer « À confirmer ».`);
    if (a.echeance && !/^\d{4}-\d{2}-\d{2}$/.test(a.echeance)) erreurs.push(`${ou} : échéance au format AAAA-MM-JJ attendue.`);
    if (!a.preuves?.length) erreurs.push(`${ou} : aucune preuve.`);
  }
  for (const c of op.synthese.conditions) {
    if (!C.ETATS[c.etat]) erreurs.push(`Condition ${c.id} : état inconnu « ${c.etat} ».`);
    for (const a of c.actions || []) if (!idsActions.has(a)) erreurs.push(`Condition ${c.id} : action ${a} introuvable.`);
  }
  if (op.synthese.conditions.length !== 3) erreurs.push('Il doit y avoir exactement trois conditions de go-live.');

  // 7. Événements : garde-fous appliqués.
  for (const [nom, liste] of [['intégrés', evenements], ['exemples', exemples]]) {
    if (!liste.length) continue;
    // Chaque passage cité par un impact doit exister dans la source de l'événement.
    for (const ev of liste) {
      const doc = ev.source && documents[ev.source.id];
      if (!doc) { erreurs.push(`Événement ${ev.id} : source « ${ev.source?.id} » sans texte ni fichier lisible.`); continue; }
      const texte = texteDocument(doc);
      (ev.impacts || []).forEach((im, i) => {
        nbPreuves++;
        if (im.passage && texte && !C.trouverPassage(texte, im.passage))
          erreurs.push(`Événement ${ev.id}, impact ${i + 1} : passage introuvable dans la source ${ev.source.id} :\n      « ${im.passage.slice(0, 110)} »`);
      });
    }
    const { erreurs: errs, journal } = C.appliquerEvenements(op, liste);
    errs.forEach((e) => erreurs.push(`Événement (${nom}) ${e}`));
    journal.forEach((j) => infos.push(`Événement ${j.evenement} (${nom}) : ${j.impacts.length} impact(s) appliqué(s), ${j.refuses.length} refusé(s).`));
  }

  return { erreurs, infos, nbPreuves };
}

// Exécution directe
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('verifier.mjs')) {
  try {
    const charge = toutCharger({ embarquer: false });
    const C = chargerCommun();
    const { erreurs, infos, nbPreuves } = verifier(charge, C);
    console.log(`\nVÉRIFICATION — ${Object.keys(charge.documents).length} documents, ${nbPreuves} preuves contrôlées\n`);
    if (process.argv.includes('--details')) infos.forEach((i) => console.log('  · ' + i));
    else infos.filter((i) => /^Q\d\d/.test(i)).forEach((i) => console.log('  · ' + i));
    charge.avertissements.forEach((a) => console.log('  ⚠ ' + a));
    if (erreurs.length) {
      console.log(`\n✗ ${erreurs.length} erreur(s) :`);
      erreurs.forEach((e) => console.log('  ✗ ' + e));
      process.exit(1);
    }
    console.log('\n✓ Aucune erreur : toutes les preuves pointent vers un passage, une page, des cellules ou une zone existante.');
  } catch (e) {
    console.error('\n✗ ' + e.message);
    process.exit(1);
  }
}
