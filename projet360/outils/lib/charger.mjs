// Charge les données de l'équipe, les événements et le corpus, puis prépare
// tout ce dont l'application a besoin. Utilisé par construire.mjs et verifier.mjs.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { extraireZip, listerFichiers, lireDocument, texteDocument, poppler } from './corpus.mjs';

export const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DOSSIER_DONNEES = path.join(RACINE, 'donnees');
export const DOSSIER_CORPUS = path.join(RACINE, 'corpus');
const NOM_KIT = 'Projet360_NOVA_ETUDIANTS';

// Règles communes (le même fichier que dans le navigateur).
export function chargerCommun() {
  const bac = {};
  vm.runInNewContext(fs.readFileSync(path.join(RACINE, 'app', 'commun.js'), 'utf8'), bac);
  return bac.NOVA_COMMUN;
}

export function lireJson(chemin) {
  const texte = fs.readFileSync(chemin, 'utf8');
  try {
    return JSON.parse(texte);
  } catch (e) {
    // Message lisible : numéro de ligne de l'erreur de syntaxe.
    const pos = +((e.message.match(/position (\d+)/) || [])[1] || -1);
    const ligne = pos >= 0 ? texte.slice(0, pos).split('\n').length : '?';
    throw new Error(`JSON invalide dans ${path.relative(RACINE, chemin)} (vers la ligne ${ligne}) : ${e.message}\n  Astuce : vérifiez les virgules et les guillemets autour de cette ligne.`);
  }
}

// Trouve (ou extrait) le dossier du corpus.
export function trouverCorpus(journal = console) {
  const candidats = [path.join(DOSSIER_CORPUS, NOM_KIT), DOSSIER_CORPUS];
  for (const c of candidats) {
    if (fs.existsSync(path.join(c, 'README.txt')) && fs.existsSync(path.join(c, '01_Courriels'))) return c;
  }
  // Pas de dossier : on cherche une archive .zip dans corpus/ et on l'extrait.
  if (fs.existsSync(DOSSIER_CORPUS)) {
    const zips = fs.readdirSync(DOSSIER_CORPUS).filter((f) => f.toLowerCase().endsWith('.zip'));
    for (const z of zips) {
      journal.log(`Extraction de corpus/${z}…`);
      extraireZip(path.join(DOSSIER_CORPUS, z), DOSSIER_CORPUS);
      for (const c of candidats) if (fs.existsSync(path.join(c, '01_Courriels'))) return c;
      // Archive qui contient une autre archive (cas du kit « participants »).
      const internes = listerFichiers(DOSSIER_CORPUS).filter((f) => f.toLowerCase().endsWith('.zip') && !zips.includes(f));
      for (const zi of internes) {
        extraireZip(path.join(DOSSIER_CORPUS, zi), DOSSIER_CORPUS);
        for (const c of candidats) if (fs.existsSync(path.join(c, '01_Courriels'))) return c;
      }
    }
  }
  throw new Error(
    `Corpus introuvable. Placez le dossier « ${NOM_KIT} » (ou l'archive NOVA_ETUDIANTS.zip) dans :\n  ${DOSSIER_CORPUS}`,
  );
}

export function chargerEvenements() {
  const dossier = path.join(DOSSIER_DONNEES, 'evenements');
  const lire = (d) =>
    fs.existsSync(d)
      ? fs.readdirSync(d).filter((f) => f.endsWith('.json')).sort().flatMap((f) => {
          const contenu = lireJson(path.join(d, f));
          return (Array.isArray(contenu) ? contenu : [contenu]).map((ev) => Object.assign(ev, { _fichier: path.relative(RACINE, path.join(d, f)) }));
        })
      : [];
  const integres = lire(dossier).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const exemples = lire(path.join(dossier, 'exemples'));
  return { integres, exemples };
}

// Charge tout. options.embarquer : inclure les fichiers originaux (PDF, images…) en base64.
export function toutCharger({ embarquer = true, journal = console } = {}) {
  const avertissements = [];
  const operations = lireJson(path.join(DOSSIER_DONNEES, 'NOVA_OPERATIONS.json'));
  // Texte du tutoriel d'accueil (modifiable sans toucher au code).
  const fichierGuide = path.join(DOSSIER_DONNEES, 'guide.json');
  if (fs.existsSync(fichierGuide)) operations.guide = lireJson(fichierGuide);
  // Dossier vierge (version « nouveau projet ») : même structure, aucune donnée.
  const fichierVierge = path.join(DOSSIER_DONNEES, 'vierge.json');
  const vierge = fs.existsSync(fichierVierge) ? lireJson(fichierVierge) : null;
  if (vierge && operations.guide && operations.guide.vierge) vierge.guide = operations.guide.vierge;
  const { integres, exemples } = chargerEvenements();
  const racineCorpus = trouverCorpus(journal);
  const dossierCache = path.join(DOSSIER_CORPUS, '.cache_extraction');
  if (!poppler()) avertissements.push("pdftotext/pdftoppm (poppler) introuvable : le texte des nouveaux PDF ne sera pas indexé (le PDF reste consultable).");

  // Sources déclarées par les événements (nouvelles sources).
  const sourcesEvenements = [];
  for (const ev of [...integres, ...exemples]) {
    if (ev.source && ev.source.id && !operations.sources.some((s) => s.id === ev.source.id)) {
      sourcesEvenements.push(Object.assign({ autorite: 'officielle', _evenement: ev.id, _exemple: exemples.includes(ev) }, ev.source));
    }
  }

  // Fichiers du corpus non déclarés : ajoutés automatiquement (recherche possible).
  const fichiers = listerFichiers(racineCorpus);
  const declares = new Set([...operations.sources, ...sourcesEvenements].map((s) => s.chemin).filter(Boolean));
  for (const f of fichiers) {
    if (!declares.has(f)) {
      const id = 'AUTO-' + path.basename(f).replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9]+/g, '-').toUpperCase();
      operations.sources.push({ id, chemin: f, titre: path.basename(f), date: null, auteur: 'Non renseigné', autorite: 'officielle', remarque: 'Ajouté automatiquement : fichier présent dans le corpus mais pas encore décrit dans NOVA_OPERATIONS.json.', _auto: true });
      avertissements.push(`Fichier du corpus non décrit dans les données : ${f} (ajouté comme ${id}).`);
    }
  }

  const documents = {};
  const toutesSources = [...operations.sources, ...sourcesEvenements];
  for (const s of toutesSources) {
    if (s.chemin) {
      // Les nouvelles sources peuvent être dans le kit ou directement dans corpus/ (ex. corpus/nouvelles_sources/).
      const racine = [racineCorpus, DOSSIER_CORPUS].find((r) => fs.existsSync(path.join(r, s.chemin)));
      if (!racine) { avertissements.push(`Source ${s.id} : fichier introuvable (${s.chemin}).`); continue; }
      documents[s.id] = lireDocument(racine, s.chemin, { dossierCache, embarquerOriginaux: embarquer });
    } else if (s.texte) {
      documents[s.id] = { genre: 'texte', texte: s.texte, chemin: '(texte collé dans l\'événement)', ext: '.txt', taille: s.texte.length };
    }
  }

  // Doublons : fichiers identiques (empreinte SHA-256) et courriels de même Message-ID.
  const parEmpreinte = {};
  for (const [id, d] of Object.entries(documents)) if (d.sha256) (parEmpreinte[d.sha256] = parEmpreinte[d.sha256] || []).push(id);
  const doublons = Object.values(parEmpreinte).filter((ids) => ids.length > 1);
  const parMessageId = {};
  for (const [id, d] of Object.entries(documents)) if (d.entetes?.messageId) (parMessageId[d.entetes.messageId] = parMessageId[d.entetes.messageId] || []).push(id);
  for (const ids of Object.values(parMessageId)) if (ids.length > 1 && !doublons.some((g) => ids.every((i) => g.includes(i)))) doublons.push(ids);
  // Pièces jointes identiques à un fichier séparé.
  for (const [id, d] of Object.entries(documents)) {
    for (const p of d.pieces || []) {
      const ids = parEmpreinte[p.sha256];
      if (ids) p.identique_a = ids;
    }
  }

  return { operations, vierge, evenements: integres, exemples, documents, doublons, avertissements, racineCorpus, sourcesEvenements, texteDocument };
}
