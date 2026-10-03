#!/usr/bin/env node
// Construit le rendu autonome : un seul fichier HTML qui contient l'application,
// les données de l'équipe et tous les documents du corpus (aucun serveur requis).
//
// Usage : node outils/construire.mjs
// Résultat : dist/NOVA_Projet360.html (s'ouvre par double-clic, hors connexion)

import fs from 'node:fs';
import path from 'node:path';
import { toutCharger, chargerCommun, RACINE } from './lib/charger.mjs';
import { verifier } from './verifier.mjs';

const debut = Date.now();
const lire = (f) => fs.readFileSync(path.join(RACINE, f), 'utf8');

try {
  console.log('1/3  Lecture des données et du corpus…');
  const charge = toutCharger({ embarquer: true });
  const C = chargerCommun();

  console.log('2/3  Vérification des preuves…');
  const { erreurs, nbPreuves } = verifier(charge, C);
  charge.avertissements.forEach((a) => console.log('     ⚠ ' + a));
  if (erreurs.length) {
    console.log(`     ✗ ${erreurs.length} erreur(s) — le rendu est construit quand même, mais corrigez-les :`);
    erreurs.forEach((e) => console.log('       ✗ ' + e));
  } else console.log(`     ✓ ${nbPreuves} preuves vérifiées, aucune erreur.`);

  console.log('3/3  Assemblage du fichier autonome…');
  const maintenant = new Date();
  const donnees = {
    operations: charge.operations,
    evenements: charge.evenements,
    exemples: charge.exemples,
    documents: charge.documents,
    doublons: charge.doublons,
    construit_le: maintenant.toLocaleString('fr-CA', { timeZone: 'America/Montreal', dateStyle: 'long', timeStyle: 'short' }),
    verification: { erreurs, nbPreuves },
  };
  // « < » est échappé pour que le JSON ne puisse jamais fermer la balise <script>.
  const json = JSON.stringify(donnees).replace(/</g, '\\u003c');
  const scripts = ['app/commun.js', 'app/app.js', 'app/espaces.js', 'app/mises_a_jour.js']
    .filter((f) => fs.existsSync(path.join(RACINE, f)))
    .map((f) => `<script>\n${lire(f).replace(/<\/script/gi, '<\\/script')}\n</script>`)
    .join('\n');
  const html = lire('app/index.html')
    .replace('<!--STYLES-->', () => `<style>\n${lire('app/styles.css')}\n</style>`)
    .replace('<!--DONNEES-->', () => `<script id="nova-donnees" type="application/json">${json}</script>`)
    .replace('<!--SCRIPTS-->', () => scripts);

  const sortie = path.join(RACINE, 'dist', 'NOVA_Projet360.html');
  fs.mkdirSync(path.dirname(sortie), { recursive: true });
  fs.writeFileSync(sortie, html);
  const ko = Math.round(fs.statSync(sortie).size / 1024);
  console.log(`\n✓ Rendu autonome créé : ${path.relative(process.cwd(), sortie) || sortie} (${ko} ko, ${((Date.now() - debut) / 1000).toFixed(1)} s)`);
  console.log('  Ouvrez-le par double-clic dans Chrome, Edge ou Firefox. Aucune connexion requise.');
} catch (e) {
  console.error('\n✗ ' + e.message);
  process.exit(1);
}
