// Lecture du corpus NOVA sans dépendance externe (Node 18+).
// Formats : .txt .md .csv .eml .xlsx .pdf .png .jpg
// Les PDF utilisent pdftotext / pdftoppm (poppler) s'ils sont installés ; sinon
// le PDF reste consultable dans le navigateur mais son texte n'est pas indexé.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

export const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

// ---------- Texte ----------

export function decoderTexte(buf) {
  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) buf = buf.subarray(3);
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch {
    return new TextDecoder('windows-1252').decode(buf);
  }
}

// ---------- ZIP (pour .xlsx et pour l'archive du kit) ----------

export function lireZip(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Archive ZIP illisible');
  const nb = buf.readUInt16LE(eocd + 10);
  let off = buf.readUInt32LE(eocd + 16);
  const fichiers = new Map();
  for (let k = 0; k < nb; k++) {
    if (buf.readUInt32LE(off) !== 0x02014b50) throw new Error('Répertoire ZIP invalide');
    const methode = buf.readUInt16LE(off + 10);
    const tailleC = buf.readUInt32LE(off + 20);
    const lenNom = buf.readUInt16LE(off + 28);
    const lenExtra = buf.readUInt16LE(off + 30);
    const lenCom = buf.readUInt16LE(off + 32);
    const offLocal = buf.readUInt32LE(off + 42);
    const nom = buf.toString('utf8', off + 46, off + 46 + lenNom);
    const debut = offLocal + 30 + buf.readUInt16LE(offLocal + 26) + buf.readUInt16LE(offLocal + 28);
    const brut = buf.subarray(debut, debut + tailleC);
    if (!nom.endsWith('/')) {
      fichiers.set(nom, methode === 0 ? Buffer.from(brut) : zlib.inflateRawSync(brut));
    }
    off += 46 + lenNom + lenExtra + lenCom;
  }
  return fichiers;
}

export function extraireZip(cheminZip, dossierCible) {
  const fichiers = lireZip(fs.readFileSync(cheminZip));
  for (const [nom, contenu] of fichiers) {
    const dest = path.join(dossierCible, nom);
    if (!dest.startsWith(path.resolve(dossierCible))) continue; // sécurité : pas de « ../ »
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, contenu);
  }
  return fichiers.size;
}

// ---------- XML minimal ----------

const ENTITES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
export const decoderXml = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENTITES[e] ?? m;
  });
const attr = (s, nom) => (s.match(new RegExp(`\\b${nom}="([^"]*)"`)) || [])[1];
const textesT = (xml) => [...xml.matchAll(/<(?:\w+:)?t\b[^>]*>([\s\S]*?)<\/(?:\w+:)?t>/g)].map((m) => decoderXml(m[1])).join('');

// ---------- XLSX ----------

export function lireXlsx(buf) {
  const z = lireZip(buf);
  const lire = (n) => (z.has(n) ? z.get(n).toString('utf8') : '');
  const partages = [...lire('xl/sharedStrings.xml').matchAll(/<(?:\w+:)?si\b[^>]*>([\s\S]*?)<\/(?:\w+:)?si>/g)].map((m) => textesT(m[1]));

  // Styles : couleur de fond et police en gras/blanche, pour un rendu fidèle.
  const styles = lire('xl/styles.xml');
  const bloc = (nom) => (styles.match(new RegExp(`<(?:\\w+:)?${nom}\\b[^>]*>([\\s\\S]*?)</(?:\\w+:)?${nom}>`)) || [])[1] || '';
  const fonds = [...bloc('fills').matchAll(/<(?:\w+:)?fill\b[^>]*>([\s\S]*?)<\/(?:\w+:)?fill>/g)].map((m) => {
    const c = m[1].match(/fgColor\b[^>]*rgb="(?:FF)?([0-9A-Fa-f]{6})"/);
    return /patternType="solid"/.test(m[1]) && c ? '#' + c[1] : null;
  });
  const polices = [...bloc('fonts').matchAll(/<(?:\w+:)?font\b[^>]*>([\s\S]*?)<\/(?:\w+:)?font>/g)].map((m) => ({
    gras: /<(?:\w+:)?b\s*\/>/.test(m[1]),
    couleur: (m[1].match(/color\b[^>]*rgb="(?:FF)?([0-9A-Fa-f]{6})"/) || [])[1],
  }));
  const xfs = [...bloc('cellXfs').matchAll(/<(?:\w+:)?xf\b([^>]*)/g)].map((m) => ({
    fond: fonds[+attr(m[1], 'fillId') || 0] || null,
    police: polices[+attr(m[1], 'fontId') || 0] || {},
  }));

  // Feuilles : ordre du classeur et cible des relations.
  const rels = Object.fromEntries([...lire('xl/_rels/workbook.xml.rels').matchAll(/<Relationship\b([^>]*)/g)].map((m) => [attr(m[1], 'Id'), attr(m[1], 'Target')]));
  const feuilles = [];
  for (const m of lire('xl/workbook.xml').matchAll(/<(?:\w+:)?sheet\b([^>]*)/g)) {
    const nom = decoderXml(attr(m[1], 'name') || 'Feuille');
    const rid = attr(m[1], 'r:id');
    let cible = rels[rid] || 'worksheets/sheet1.xml';
    cible = cible.startsWith('/') ? cible.slice(1) : 'xl/' + cible.replace(/^\.\//, '');
    const xml = lire(cible);
    const cellules = {};
    let maxLigne = 0, maxCol = 0;
    for (const c of xml.matchAll(/<(?:\w+:)?c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/(?:\w+:)?c>)/g)) {
      const ref = attr(c[1], 'r');
      if (!ref) continue;
      const t = attr(c[1], 't');
      const s = +attr(c[1], 's') || 0;
      const corps = c[2] || '';
      const v = (corps.match(/<(?:\w+:)?v>([\s\S]*?)<\/(?:\w+:)?v>/) || [])[1];
      const f = (corps.match(/<(?:\w+:)?f\b[^>]*>([\s\S]*?)<\/(?:\w+:)?f>/) || [])[1];
      let valeur = '';
      if (t === 's' && v !== undefined) valeur = partages[+v] ?? '';
      else if (t === 'inlineStr') valeur = textesT(corps);
      else if (v !== undefined) valeur = decoderXml(v);
      const { col, ligne } = decomposerRef(ref);
      maxLigne = Math.max(maxLigne, ligne);
      maxCol = Math.max(maxCol, col);
      const st = xfs[s] || {};
      cellules[ref] = { v: valeur };
      if (f) cellules[ref].f = decoderXml(f);
      if (st.fond) cellules[ref].fond = st.fond;
      if (st.police?.gras) cellules[ref].gras = true;
      if (st.police?.couleur) cellules[ref].couleur = '#' + st.police.couleur;
    }
    feuilles.push({ nom, cellules, maxLigne, maxCol });
  }
  return { feuilles };
}

export function decomposerRef(ref) {
  const m = /^([A-Z]+)(\d+)$/.exec(ref.toUpperCase());
  if (!m) return { col: 0, ligne: 0 };
  let col = 0;
  for (const ch of m[1]) col = col * 26 + (ch.charCodeAt(0) - 64);
  return { col, ligne: +m[2] };
}

// ---------- Courriel (.eml) ----------

function decoderMotsEncodes(s) {
  // RFC 2047 : =?utf-8?q?...?= ou =?utf-8?b?...?=
  return s
    .replace(/\?=\s+=\?/g, '?==?')
    .replace(/=\?([^?]+)\?([qQbB])\?([^?]*)\?=/g, (m, cs, enc, txt) => {
      let octets;
      if (enc.toLowerCase() === 'b') octets = Buffer.from(txt, 'base64');
      else octets = Buffer.from(txt.replace(/_/g, ' ').replace(/=([0-9A-Fa-f]{2})/g, (x, h) => String.fromCharCode(parseInt(h, 16))), 'latin1');
      try { return new TextDecoder(cs.toLowerCase()).decode(octets); } catch { return octets.toString('utf8'); }
    });
}

function separerEntetes(brut) {
  const i = brut.search(/\r?\n\r?\n/);
  const tete = i < 0 ? brut : brut.slice(0, i);
  const corps = i < 0 ? '' : brut.slice(i).replace(/^\r?\n\r?\n/, '');
  const entetes = {};
  for (const ligne of tete.replace(/\r?\n[ \t]+/g, ' ').split(/\r?\n/)) {
    const j = ligne.indexOf(':');
    if (j > 0) entetes[ligne.slice(0, j).trim().toLowerCase()] = ligne.slice(j + 1).trim();
  }
  return { entetes, corps };
}

function decoderCorps(corps, encodage) {
  encodage = (encodage || '').toLowerCase();
  if (encodage === 'base64') return Buffer.from(corps.replace(/\s+/g, ''), 'base64');
  if (encodage === 'quoted-printable') {
    const s = corps.replace(/=\r?\n/g, '');
    const octets = [];
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '=' && /^[0-9A-Fa-f]{2}$/.test(s.slice(i + 1, i + 3))) { octets.push(parseInt(s.slice(i + 1, i + 3), 16)); i += 2; }
      else octets.push(...Buffer.from(s[i], 'utf8'));
    }
    return Buffer.from(octets);
  }
  return Buffer.from(corps, 'utf8');
}

function parcourirPartie(brut, resultat) {
  const { entetes, corps } = separerEntetes(brut);
  const ct = entetes['content-type'] || 'text/plain';
  const frontiere = (ct.match(/boundary="?([^";]+)"?/i) || [])[1];
  if (/^multipart\//i.test(ct) && frontiere) {
    const morceaux = corps.split('--' + frontiere);
    for (const m of morceaux.slice(1)) {
      if (m.startsWith('--')) break;
      parcourirPartie(m.replace(/^\r?\n/, ''), resultat);
    }
    return entetes;
  }
  const disp = entetes['content-disposition'] || '';
  const nom = (disp.match(/filename\*?="?([^";]+)"?/i) || ct.match(/name="?([^";]+)"?/i) || [])[1];
  const octets = decoderCorps(corps, entetes['content-transfer-encoding']);
  if (nom || /attachment/i.test(disp)) {
    resultat.pieces.push({ nom: decoderMotsEncodes(nom || 'piece_jointe'), type: ct.split(';')[0].trim(), taille: octets.length, sha256: sha256(octets) });
  } else if (/^text\//i.test(ct)) {
    const cs = (ct.match(/charset="?([^";]+)"?/i) || [])[1] || 'utf-8';
    let t;
    try { t = new TextDecoder(cs.toLowerCase()).decode(octets); } catch { t = decoderTexte(octets); }
    resultat.textes.push(t.replace(/\r\n/g, '\n').trim());
  }
  return entetes;
}

export function lireEml(buf) {
  const brut = buf.toString('utf8');
  const resultat = { pieces: [], textes: [] };
  const e = parcourirPartie(brut, resultat);
  const h = (n) => decoderMotsEncodes(e[n] || '');
  return {
    entetes: { date: h('date'), de: h('from'), a: h('to'), cc: h('cc'), objet: h('subject'), messageId: h('message-id') },
    texte: resultat.textes.join('\n\n'),
    pieces: resultat.pieces,
  };
}

// ---------- PDF (poppler) ----------

let popplerDispo = null;
export function poppler() {
  if (popplerDispo === null) {
    try { execFileSync('pdftotext', ['-v'], { stdio: 'ignore' }); popplerDispo = true; } catch { popplerDispo = false; }
  }
  return popplerDispo;
}

export function lirePdf(chemin, dossierCache) {
  const buf = fs.readFileSync(chemin);
  const empreinte = sha256(buf);
  const fichierCache = dossierCache && path.join(dossierCache, empreinte + '.json');
  if (fichierCache && fs.existsSync(fichierCache)) return JSON.parse(fs.readFileSync(fichierCache, 'utf8'));
  let pages = [];
  let extraction = 'aucune';
  if (poppler()) {
    const texte = execFileSync('pdftotext', ['-layout', '-enc', 'UTF-8', chemin, '-'], { maxBuffer: 64 << 20 }).toString('utf8');
    pages = texte.split('\f').map((t) => ({ texte: t.replace(/\s+$/g, '') }));
    if (pages.length > 1 && pages[pages.length - 1].texte === '') pages.pop();
    pages.forEach((p, i) => {
      try {
        const png = execFileSync('pdftoppm', ['-png', '-r', '110', '-f', String(i + 1), '-l', String(i + 1), '-singlefile', chemin], { maxBuffer: 64 << 20 });
        p.image = 'data:image/png;base64,' + png.toString('base64');
      } catch { /* image facultative */ }
    });
    extraction = 'poppler';
  }
  const resultat = { pages, extraction };
  if (fichierCache && extraction !== 'aucune') {
    fs.mkdirSync(dossierCache, { recursive: true });
    fs.writeFileSync(fichierCache, JSON.stringify(resultat));
  }
  return resultat;
}

// ---------- Images ----------

export function dimensionsImage(buf) {
  if (buf.readUInt32BE(0) === 0x89504e47) return { largeur: buf.readUInt32BE(16), hauteur: buf.readUInt32BE(20) };
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) break;
      const marqueur = buf[i + 1];
      const lg = buf.readUInt16BE(i + 2);
      if (marqueur >= 0xc0 && marqueur <= 0xc3) return { largeur: buf.readUInt16BE(i + 7), hauteur: buf.readUInt16BE(i + 5) };
      i += 2 + lg;
    }
  }
  return null;
}

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.pdf': 'application/pdf', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };

// ---------- Inventaire ----------

export function listerFichiers(racine) {
  const res = [];
  const parcourir = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (e.name.startsWith('.')) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) parcourir(p);
      else res.push(path.relative(racine, p).split(path.sep).join('/'));
    }
  };
  parcourir(racine);
  return res;
}

// Lit un fichier du corpus et renvoie un « document » prêt pour l'application.
export function lireDocument(racine, chemin, { dossierCache, embarquerOriginaux = true } = {}) {
  const complet = path.join(racine, chemin);
  const buf = fs.readFileSync(complet);
  const ext = path.extname(chemin).toLowerCase();
  const doc = { chemin, ext, taille: buf.length, sha256: sha256(buf) };
  if (['.txt', '.md', '.csv', '.log', '.json'].includes(ext)) {
    doc.genre = 'texte';
    doc.texte = decoderTexte(buf).replace(/\r\n/g, '\n');
  } else if (ext === '.eml') {
    doc.genre = 'courriel';
    Object.assign(doc, lireEml(buf));
  } else if (ext === '.xlsx') {
    doc.genre = 'tableur';
    Object.assign(doc, lireXlsx(buf));
    if (embarquerOriginaux) doc.original = `data:${MIME[ext]};base64,` + buf.toString('base64');
  } else if (ext === '.pdf') {
    doc.genre = 'pdf';
    Object.assign(doc, lirePdf(complet, dossierCache));
    if (embarquerOriginaux) doc.original = 'data:application/pdf;base64,' + buf.toString('base64');
  } else if (MIME[ext]?.startsWith('image/')) {
    doc.genre = 'image';
    Object.assign(doc, dimensionsImage(buf) || {});
    doc.original = `data:${MIME[ext]};base64,` + buf.toString('base64');
  } else {
    doc.genre = 'autre';
  }
  return doc;
}

// Texte « à plat » d'un document, pour la recherche et la vérification des passages.
export function texteDocument(doc) {
  if (!doc) return '';
  if (doc.genre === 'texte') return doc.texte;
  if (doc.genre === 'courriel') {
    const e = doc.entetes;
    return [`De : ${e.de}`, `À : ${e.a}`, e.cc ? `Cc : ${e.cc}` : '', `Date : ${e.date}`, `Objet : ${e.objet}`, '', doc.texte, ...doc.pieces.map((p) => `Pièce jointe : ${p.nom}`)].filter((l) => l !== '').join('\n');
  }
  if (doc.genre === 'pdf') return doc.pages.map((p) => p.texte).join('\n\n');
  if (doc.genre === 'tableur') return doc.feuilles.map((f) => Object.entries(f.cellules).map(([r, c]) => `${r} ${c.v}`).join('\n')).join('\n');
  return '';
}
