/* Règles partagées par l'application (navigateur) et par outils/verifier.mjs (Node).
   Aucune dépendance. Expose globalThis.NOVA_COMMUN. */
(function (racine) {
  'use strict';

  // ---------- Libellés (chaque couleur a toujours un libellé texte) ----------

  const ETATS = {
    // Conditions de go-live, tickets et actions
    ouvert: { libelle: 'Ouvert', ton: 'rouge', icone: '●' },
    correctif_annonce: { libelle: 'Correctif annoncé, non livré', ton: 'rouge', icone: '●' },
    correctif_livre: { libelle: 'Correctif livré, validation en attente', ton: 'ambre', icone: '◐' },
    en_cours: { libelle: 'En cours', ton: 'ambre', icone: '◐' },
    en_attente: { libelle: 'En attente', ton: 'ambre', icone: '◐' },
    a_faire: { libelle: 'À faire', ton: 'rouge', icone: '○' },
    non_fait: { libelle: 'Non fait', ton: 'rouge', icone: '○' },
    partiel: { libelle: 'Partiellement fait', ton: 'ambre', icone: '◐' },
    valide: { libelle: 'Validé / fermé', ton: 'vert', icone: '✓' },
    fait: { libelle: 'Fait', ton: 'vert', icone: '✓' },
    rouvert: { libelle: 'Rouvert', ton: 'rouge', icone: '●' },
    annule: { libelle: 'Annulé', ton: 'gris', icone: '–' },
  };

  // Nature d'une information : on ne confond jamais ces quatre niveaux.
  const NATURES = {
    proposition: { libelle: 'Proposition', ton: 'bleu', aide: "Quelqu'un suggère ; rien n'est décidé." },
    decision_approuvee: { libelle: 'Décision approuvée', ton: 'violet', aide: "L'autorité compétente a approuvé (comité, chargé de projet)." },
    correctif_livre: { libelle: 'Correctif livré', ton: 'ambre', aide: "Le fournisseur a livré ou déployé ; pas encore accepté." },
    validation_obtenue: { libelle: 'Validation obtenue', ton: 'vert', aide: "L'équipe responsable a re-testé et accepté." },
    information: { libelle: 'Information', ton: 'gris', aide: 'Fait, constat ou rappel, sans décision.' },
    probleme: { libelle: 'Problème signalé', ton: 'rouge', aide: 'Anomalie ou risque constaté.' },
    document: { libelle: 'Document', ton: 'gris', aide: 'Création ou mise à jour de document.' },
    finance: { libelle: 'Finances', ton: 'gris', aide: 'Facture, paiement ou montant.' },
  };

  const ETATS_FERMES = ['valide', 'fait'];

  // ---------- Texte ----------

  const sansAccents = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');

  // Uniformise espaces, apostrophes et guillemets (sans changer la longueur utile).
  function uniformiserCaractere(c) {
    if (/\s/.test(c) || c === ' ' || c === ' ') return ' ';
    if ('’‘`´'.includes(c)) return "'";
    if ('“”'.includes(c)) return '"';
    if ('–—'.includes(c)) return '-';
    return c;
  }

  // Version normalisée + table de correspondance vers les positions d'origine.
  function normaliserAvecIndex(texte, options) {
    const ignorerCasse = options && options.ignorerCasse;
    const sortie = [];
    const index = [];
    let espace = false;
    for (let i = 0; i < texte.length; i++) {
      let c = uniformiserCaractere(texte[i]);
      if (c === ' ') {
        if (espace || sortie.length === 0) continue;
        espace = true;
      } else {
        espace = false;
        if (ignorerCasse) c = sansAccents(c).toLowerCase();
        // Le markdown gras (**) est ignoré pour la comparaison.
        if (c === '*') continue;
      }
      sortie.push(c);
      index.push(i);
    }
    while (sortie.length && sortie[sortie.length - 1] === ' ') { sortie.pop(); index.pop(); }
    return { texte: sortie.join(''), index };
  }

  // Trouve un passage (et éventuellement une fin) dans un texte.
  // Renvoie { debut, fin } en positions du texte d'origine, ou null.
  function trouverPassage(texte, passage, jusqua) {
    if (!texte || !passage) return null;
    for (const ignorerCasse of [false, true]) {
      const t = normaliserAvecIndex(texte, { ignorerCasse });
      const p = normaliserAvecIndex(passage, { ignorerCasse }).texte;
      const i = t.texte.indexOf(p);
      if (i < 0) continue;
      let finNorm = i + p.length;
      if (jusqua) {
        const q = normaliserAvecIndex(jusqua, { ignorerCasse }).texte;
        const j = t.texte.indexOf(q, i);
        if (j < 0) return null;
        finNorm = j + q.length;
      }
      return { debut: t.index[i], fin: t.index[finNorm - 1] + 1 };
    }
    return null;
  }

  // Plage de cellules « B3:D5 » -> liste de références.
  function cellulesDePlage(plage) {
    const parties = String(plage).toUpperCase().split(':');
    const dec = (r) => {
      const m = /^([A-Z]+)(\d+)$/.exec(r);
      if (!m) return null;
      let c = 0;
      for (const ch of m[1]) c = c * 26 + (ch.charCodeAt(0) - 64);
      return { c, l: +m[2] };
    };
    const a = dec(parties[0]);
    const b = dec(parties[1] || parties[0]);
    if (!a || !b) return [];
    const res = [];
    for (let l = Math.min(a.l, b.l); l <= Math.max(a.l, b.l); l++)
      for (let c = Math.min(a.c, b.c); c <= Math.max(a.c, b.c); c++) res.push(lettreColonne(c) + l);
    return res;
  }
  function lettreColonne(n) {
    let s = '';
    while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
    return s;
  }

  // ---------- Mises à jour (événements) ----------

  const copie = (o) => JSON.parse(JSON.stringify(o));

  // Retrouve un élément modifiable à partir d'une cible « collection/ID ».
  function resoudreCible(etat, cible) {
    const [coll, id] = String(cible).split('/');
    if (coll === 'questions') return etat.questions.find((q) => q.id === id);
    if (coll === 'actions') return etat.actions.find((a) => a.id === id);
    if (coll === 'conditions') return etat.synthese.conditions.find((c) => c.id === id);
    if (coll === 'synthese') return etat.synthese[id];
    if (coll === 'risques') return (etat.risques || []).find((r) => r.id === id);
    return undefined;
  }

  // Garde-fous : une proposition ne devient jamais une décision, une livraison
  // n'est jamais une validation. Renvoie la liste des erreurs (vide si OK).
  function controlerImpact(impact, evenement) {
    const erreurs = [];
    const nature = impact.nature || evenement.nature;
    const m = impact.modifs || {};
    const nom = impact.cible || impact.ajouter || '?';
    if (!NATURES[nature]) erreurs.push(`${nom} : nature inconnue « ${nature} ».`);
    if (!impact.passage && !impact.justification)
      erreurs.push(`${nom} : indiquez le passage de la source qui justifie ce changement.`);
    if (impact.cible === 'synthese/date_mep' && ('approuvee' in m || 'texte' in m)) {
      if (nature !== 'decision_approuvee')
        erreurs.push("La date approuvée ne peut changer que par une « Décision approuvée ». Une proposition s'ajoute dans « Propositions en attente ».");
      if (!m.autorite) erreurs.push('Décision de date : indiquez qui a approuvé (autorite).');
    }
    if ('etat' in m && ETATS_FERMES.includes(m.etat) && /^conditions\//.test(impact.cible || '')) {
      if (nature !== 'validation_obtenue')
        erreurs.push(`${impact.cible} : une condition ne se ferme qu'avec une « Validation obtenue » (pas un correctif livré).`);
      if (evenement.source && evenement.source.autorite === 'fournisseur')
        erreurs.push(`${impact.cible} : une déclaration du fournisseur ne peut pas fermer une condition ; il faut la validation de l'équipe responsable.`);
    }
    if (nature === 'proposition' && 'etat' in m && ETATS_FERMES.includes(m.etat))
      erreurs.push(`${nom} : une proposition ne peut pas fermer un élément.`);
    if ('etat' in m && !ETATS[m.etat]) erreurs.push(`${nom} : état inconnu « ${m.etat} ».`);
    return erreurs;
  }

  // Applique les événements dans l'ordre sur une copie de l'état initial.
  // L'état initial n'est jamais modifié : la version de base reste consultable.
  function appliquerEvenements(base, evenements) {
    const etat = copie(base);
    const journal = [];
    const erreurs = [];
    etat.synthese.propositions = etat.synthese.propositions || [];
    for (const ev of evenements || []) {
      if (ev.actif === false) continue;
      const entree = { evenement: ev.id, titre: ev.titre, date: ev.date, impacts: [], refuses: [] };
      for (const impact of ev.impacts || []) {
        const errs = controlerImpact(impact, ev);
        if (errs.length) { erreurs.push(...errs.map((e) => `${ev.id} : ${e}`)); entree.refuses.push({ impact, erreurs: errs }); continue; }
        const nature = impact.nature || ev.nature;
        const preuve = { source: ev.source && ev.source.id, repere: impact.repere || 'Nouvelle source', passage: impact.passage, role: (NATURES[nature] || {}).libelle };
        if (impact.ajouter) {
          const obj = Object.assign(copie(impact.objet || {}), { _ajoute_par: ev.id });
          obj.preuves = (obj.preuves || []).concat(impact.passage ? [preuve] : []);
          if (impact.ajouter === 'actions') etat.actions.push(obj);
          else if (impact.ajouter === 'propositions') etat.synthese.propositions.push(Object.assign({ nature: 'proposition' }, obj));
          else if (impact.ajouter === 'chronologie') etat.chronologie.push(obj);
          else if (impact.ajouter === 'risques') (etat.risques = etat.risques || []).push(obj);
          else { erreurs.push(`${ev.id} : collection inconnue « ${impact.ajouter} ».`); continue; }
          entree.impacts.push({ type: 'ajout', collection: impact.ajouter, id: obj.id, titre: obj.titre || obj.texte, nature });
          continue;
        }
        const cible = resoudreCible(etat, impact.cible);
        if (!cible) { erreurs.push(`${ev.id} : cible introuvable « ${impact.cible} ».`); continue; }
        const avant = {};
        for (const [champ, valeur] of Object.entries(impact.modifs || {})) {
          avant[champ] = cible[champ];
          cible[champ] = valeur;
        }
        if (impact.note) (cible.notes_maj = cible.notes_maj || []).push({ evenement: ev.id, date: ev.date, texte: impact.note, nature });
        if (impact.passage) cible.preuves = (cible.preuves || []).concat([preuve]);
        (cible._modifie_par = cible._modifie_par || []).push(ev.id);
        entree.impacts.push({ type: 'modification', cible: impact.cible, avant, apres: impact.modifs || {}, note: impact.note, nature });
      }
      // L'événement lui-même entre dans la chronologie.
      etat.chronologie.push({
        id: ev.id, date: (ev.date || '').slice(0, 10), heure: (ev.date || '').slice(11, 16), titre: ev.titre,
        nature: ev.nature, sujets: ev.sujets || [], resume: ev.resume, sources: ev.source ? [ev.source.id] : [], _ajoute_par: ev.id,
      });
      if (ev.date) etat.meta.date_situation_maj = ev.date;
      journal.push(entree);
    }
    etat.chronologie.sort((a, b) => (a.date + (a.heure || '')).localeCompare(b.date + (b.heure || '')));
    return { etat, journal, erreurs };
  }

  // Sources « indépendantes » : une copie ou une pièce jointe identique ne compte pas deux fois.
  function groupesIndependants(idsSources, sourcesParId) {
    const racineDe = (id) => {
      let cur = id;
      const vus = new Set();
      while (sourcesParId[cur] && sourcesParId[cur].copie_de && !vus.has(cur)) { vus.add(cur); cur = sourcesParId[cur].copie_de; }
      return cur;
    };
    return [...new Set(idsSources.map(racineDe))];
  }

  racine.NOVA_COMMUN = {
    ETATS, NATURES, ETATS_FERMES, sansAccents, trouverPassage, normaliserAvecIndex,
    cellulesDePlage, lettreColonne, controlerImpact, appliquerEvenements, resoudreCible, groupesIndependants, copie,
  };
})(typeof window !== 'undefined' ? window : globalThis);
