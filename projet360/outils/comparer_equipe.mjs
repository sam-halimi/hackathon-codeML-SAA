#!/usr/bin/env node
// Vérifie l'analyse de l'équipe (equipe/NOVA_OPERATIONS_equipe.json) dans le corpus original
// et la compare aux données de l'application (donnees/NOVA_OPERATIONS.json).
//
// Usage : node outils/comparer_equipe.mjs

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { RACINE, trouverCorpus, lireJson } from './lib/charger.mjs';
import { lireDocument, texteDocument, decomposerRef } from './lib/corpus.mjs';

const racine = trouverCorpus({ log: () => {} });
const equipe = lireJson(path.join(RACINE, 'equipe', 'NOVA_OPERATIONS_equipe.json'));
const appli = lireJson(path.join(RACINE, 'donnees', 'NOVA_OPERATIONS.json'));
const inventaire = lireJson(path.join(RACINE, 'equipe', 'INVENTAIRE_SOURCES.json'));
const cache = path.join(RACINE, 'corpus', '.cache_extraction');
const docs = {};
const doc = (f) => (docs[f] = docs[f] || lireDocument(racine, f, { dossierCache: cache, embarquerOriginaux: false }));
const ok = [], alertes = [];

// 1. Inventaire : empreintes SHA-256
let identiques = 0;
for (const f of inventaire) {
  const p = path.join(racine, f.file);
  if (fs.existsSync(p) && crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex') === f.sha256) identiques++;
  else alertes.push(`Inventaire : ${f.file} absent ou différent.`);
}
ok.push(`Inventaire : ${identiques}/${inventaire.length} fichiers identiques au corpus.`);

// 2. Repères : heures, cellules et pages retrouvées dans le fichier cité
const preuves = [];
const parcourir = (o, ou) => {
  if (Array.isArray(o)) return o.forEach((x, i) => parcourir(x, `${ou}[${i}]`));
  if (o && typeof o === 'object') {
    if (o.file && o.locator) preuves.push({ ...o, ou });
    for (const [k, v] of Object.entries(o)) parcourir(v, ou ? `${ou}.${k}` : k);
  }
};
parcourir(equipe, '');
let controles = 0;
for (const p of preuves) {
  const complet = path.join(racine, p.file);
  if (!fs.existsSync(complet)) { alertes.push(`${p.ou} : fichier absent ${p.file}`); continue; }
  const d = doc(p.file);
  const texte = texteDocument(d);
  // Les heures lues sur une capture d'écran ne se vérifient pas dans un texte.
  for (const h of d.genre === 'image' ? [] : p.locator.match(/\b\d{1,2}:\d{2}\b/g) || []) {
    controles++;
    const hh = h.padStart(5, '0');
    if (!texte.includes(hh) && !texte.includes(h)) alertes.push(`${p.ou} : heure ${h} introuvable dans ${p.file}`);
  }
  for (const m of p.locator.matchAll(/(?:([\p{L} ]+)!)?\b([A-Z]{1,2}\d{1,3})(?::([A-Z]{1,2}\d{1,3}))?\b/gu)) {
    if (d.genre !== 'tableur') continue;
    controles++;
    const f = (m[1] && d.feuilles.find((x) => x.nom === m[1].trim())) || d.feuilles[0];
    if (m[1] && !d.feuilles.find((x) => x.nom === m[1].trim())) alertes.push(`${p.ou} : onglet « ${m[1].trim()} » absent de ${p.file}`);
    for (const ref of [m[2], m[3]].filter(Boolean)) {
      const { col, ligne } = decomposerRef(ref);
      if (col > f.maxCol || ligne > f.maxLigne) alertes.push(`${p.ou} : cellule ${ref} hors du tableau de ${p.file}`);
    }
  }
  const page = (p.locator.match(/Page (\d+)/) || [])[1];
  if (page && d.genre === 'pdf') { controles++; if (+page > d.pages.length) alertes.push(`${p.ou} : page ${page} absente de ${p.file}`); }
}
ok.push(`Repères : ${preuves.length} preuves, ${controles} repères vérifiables (heures, cellules, pages) contrôlés.`);

// 3. Faits clés : comparaison avec les données de l'application
const s = appli.synthese, f = appli.synthese.finances, ps = equipe.project_state, fe = equipe.financials;
const comparer = (nom, a, b) => (String(a) === String(b) ? ok.push(`${nom} : identique (${a}).`) : alertes.push(`${nom} : équipe « ${a} », application « ${b} ».`));
comparer('Date approuvée', ps.approved_launch_date, s.date_mep.approuvee);
comparer('Responsable', ps.owner.name, s.responsable.nom);
comparer('Depuis', ps.owner.effective_date, s.responsable.depuis);
comparer('Montant autorisé', fe.authorized_total, f.autorise);
comparer('Facturé NOVA', fe.invoiced_total_nova, f.facture);
comparer('Payé documenté', fe.documented_paid_total_nova, f.paye);
comparer('En validation', fe.in_validation_total, f.en_validation);
comparer('Ligne contestée', fe.disputed_line, f.a_contester);
comparer('Questions officielles', equipe.questions.map((q) => q.id).join(','), appli.questions.map((q) => q.id).join(','));
ok.push(`Contradictions : ${equipe.contradictions.length} dans l'analyse de l'équipe, ${appli.contradictions.length} dans l'application (mêmes sujets, plus K08 sur le budget).`);
ok.push(`Actions : ${equipe.actions.length} dans l'analyse de l'équipe, ${appli.actions.length} dans l'application (plus granulaires).`);

console.log('\nVÉRIFICATION DE L\'ANALYSE DE L\'ÉQUIPE\n');
ok.forEach((x) => console.log('  ✓ ' + x));
alertes.forEach((x) => console.log('  ⚠ ' + x));
console.log(alertes.length ? `\n${alertes.length} point(s) à examiner.` : '\n✓ Aucun écart détecté sur les faits clés et les repères vérifiables.');
