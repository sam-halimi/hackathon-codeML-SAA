// Acte 1 : la douleur. Mercredi 9 h, trois semaines avant le lancement, 64 documents qui se contredisent.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F } from "../theme";
import { alea, env, ENTREE, K, P, prog, RESSORT, SCENES, SORTIE, tw } from "../temps";
import { apparition, Curseur, Etoile, Icone, Mots, Pastille, secousse, useFormat } from "../ui";

type Props = { t: number };
const blanc = "#FFFFFF";

/** Sortie « fouettée » commune : le plan file vers le haut avec un flou de mouvement. */
function sortieFouet(t: number, fin: number, distance: number) {
  const p = prog(t, fin - 0.22, fin, ENTREE);
  return { translate: `0 ${-p * distance}px`, filter: p > 0.02 ? `blur(${p * 14}px)` : undefined, opacity: 1 - p * 0.6 };
}

// ---------------------------------------------------------------------------
// 1. Mercredi, 9 h
// ---------------------------------------------------------------------------
export const Horloge: React.FC<Props> = ({ t }) => {
  const { u, vertical } = useFormat();
  const [, fin] = SCENES.horloge;
  const r = 128 * u;
  const seconde = Math.floor(t);
  const fraction = t - seconde;
  const saut = fraction < 0.16 ? RESSORT(fraction / 0.16) : 1;
  const angleSec = (seconde - 1 + saut) * 6;
  const lueur = prog(t, K("neuf"), K("neuf") + 0.25) * (1 - prog(t, K("neuf") + 0.25, K("neuf") + 1.2));
  const pousse = tw(t, 0, fin, 1, 1.06, (x) => x);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", scale: String(pousse), ...sortieFouet(t, fin, 120 * u) }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 * u }}>
        <div style={{ fontFamily: F.mono, fontWeight: 500, fontSize: 25 * u, letterSpacing: "0.22em", color: C.sombreDoux, textTransform: "uppercase", opacity: prog(t, 0.05, 0.6) }}>
          30 septembre 2026 · Montréal
        </div>
        <svg width={r * 2 + 20} height={r * 2 + 20} viewBox={`${-r - 10} ${-r - 10} ${r * 2 + 20} ${r * 2 + 20}`} style={{ ...apparition(t, 0.05, 0.7), overflow: "visible", filter: lueur > 0.01 ? `drop-shadow(0 0 ${30 * lueur * u}px rgba(196,191,236,${0.7 * lueur}))` : undefined }}>
          <circle r={r} fill="rgba(255,255,255,.03)" stroke="rgba(220,217,240,.35)" strokeWidth={2.5 * u} />
          {Array.from({ length: 60 }, (_, i) => {
            const a = (i * 6 * Math.PI) / 180;
            const long = i % 5 === 0 ? 16 * u : 7 * u;
            return <line key={i} x1={Math.sin(a) * (r - 10 * u)} y1={-Math.cos(a) * (r - 10 * u)} x2={Math.sin(a) * (r - 10 * u - long)} y2={-Math.cos(a) * (r - 10 * u - long)} stroke={i % 5 === 0 ? "rgba(255,255,255,.75)" : "rgba(255,255,255,.28)"} strokeWidth={i % 5 === 0 ? 3 * u : 1.6 * u} strokeLinecap="round" />;
          })}
          {/* 9 h 00 : petite aiguille sur 9, grande sur 12 */}
          <line x1={0} y1={0} x2={-r * 0.5} y2={0} stroke={blanc} strokeWidth={7 * u} strokeLinecap="round" />
          <line x1={0} y1={0} x2={0} y2={-r * 0.74} stroke={blanc} strokeWidth={5 * u} strokeLinecap="round" />
          <g style={{ transform: `rotate(${angleSec}deg)` }}>
            <line x1={0} y1={r * 0.16} x2={0} y2={-r * 0.82} stroke={C.rougeVif} strokeWidth={2.4 * u} strokeLinecap="round" />
          </g>
          <circle r={7 * u} fill={C.rougeVif} />
        </svg>
        <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", alignItems: "baseline", gap: vertical ? 0 : 34 * u }}>
          <Mots texte="Mercredi," t={t} debut={K("mercredi") - 0.05} style={{ fontFamily: F.titre, fontStyle: "italic", fontWeight: 400, fontSize: 170 * u, color: blanc, letterSpacing: "-0.02em", lineHeight: 1 }} />
          <Mots texte="9 h 00" t={t} debut={K("neuf") - 0.08} ecart={0.05} style={{ fontFamily: F.mono, fontWeight: 500, fontSize: 132 * u, color: C.sombreEm, lineHeight: 1 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 2. Trois semaines, à vous de trancher
// ---------------------------------------------------------------------------
export const Rebours: React.FC<Props> = ({ t }) => {
  const { u, vertical } = useFormat();
  const [debut, fin] = SCENES.rebours;
  const arrivee = K("trois_semaines") + 0.12;
  const v = tw(t, debut + 0.1, arrivee, 30, 22, SORTIE);
  const n = Math.round(v);
  const bosse = 1 + 0.06 * Math.max(0, 1 - Math.abs(v - n) * 4);
  const decide = K("trancher") - 0.15;
  const hesite = Math.sin((t - decide) * 4.2) * 150 * u;
  const sec = secousse(t, arrivee, 6 * u);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...sortieFouet(t, fin, 140 * u) }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 * u, translate: `${sec.x}px ${sec.y}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 * u, fontFamily: F.mono, fontWeight: 500, fontSize: 26 * u, letterSpacing: "0.18em", color: C.sombreDoux, textTransform: "uppercase", opacity: prog(t, debut, debut + 0.4) }}>
          <Icone nom="calendrier" taille={30 * u} couleur={C.sombreDoux} />
          Mise en production approuvée
        </div>
        <div style={{ fontFamily: F.mono, fontWeight: 500, fontSize: 250 * u, color: blanc, lineHeight: 1, letterSpacing: "-0.04em", scale: String(bosse), opacity: prog(t, debut, debut + 0.25), textShadow: `0 0 ${40 * u}px rgba(196,191,236,.35)` }}>
          J−{n}
        </div>
        <div style={{ fontFamily: F.titre, fontWeight: 600, fontSize: 78 * u, color: C.sombreEm, ...apparition(t, arrivee - 0.25, 0.5) }}>22 octobre 2026</div>
        <div style={{ position: "relative", marginTop: 46 * u, display: "flex", flexDirection: vertical ? "column" : "row", gap: vertical ? 26 * u : 70 * u, alignItems: "center" }}>
          <div style={apparition(t, decide, 0.45)}>
            <Pastille icone="valide" texte="GO" couleur={C.vertVif} fond="rgba(61,220,140,.08)" taille={52 * u} />
          </div>
          <div style={{ fontFamily: F.titre, fontStyle: "italic", fontSize: 64 * u, color: C.sombreDoux, ...apparition(t, decide + 0.08, 0.45) }}>ou</div>
          <div style={apparition(t, decide + 0.16, 0.45)}>
            <Pastille icone="interdit" texte="PAS DE GO" couleur={C.rougeVif} fond="rgba(255,107,94,.08)" taille={52 * u} />
          </div>
          {t > decide + 0.35 ? (
            <div style={{ position: "absolute", left: "50%", top: vertical ? "45%" : "70%" }}>
              <Curseur x={vertical ? 0 : hesite} y={vertical ? hesite * 0.9 : 30 * u} taille={64 * u} t={t} opacite={prog(t, decide + 0.35, decide + 0.6)} />
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 3. Soixante-quatre documents
// ---------------------------------------------------------------------------
type Doc = { id: string; titre: string; fichier: string; type: "courriel" | "compte_rendu" | "facture" | "tableau" | "ticket" | "capture" | "pdf" };
const DOCS: Doc[] = [
  { id: "E05", titre: "Risque sur la date du 15 octobre", fichier: "E05_Retard_integration.eml", type: "courriel" },
  { id: "M04", titre: "Comité de direction du 10 septembre", fichier: "M04_Transcript_Comite_direction_10sept.txt", type: "compte_rendu" },
  { id: "INV-003", titre: "Facture INV-003", fichier: "INV-003.pdf", type: "facture" },
  { id: "PLAN-V3", titre: "Plan projet v3 (12 septembre)", fichier: "Plan_Projet_NOVA_v3_12sept.xlsx", type: "tableau" },
  { id: "SEC-210", titre: "Audit admin incomplet sur export", fichier: "SEC-210.txt", type: "ticket" },
  { id: "E09", titre: "Cible du 22 octobre et conditions", fichier: "E09_Rappel_mise_en_production.eml", type: "courriel" },
  { id: "M06", titre: "Comité de direction du 26 septembre", fichier: "M06_Transcript_Comite_26sept.txt", type: "compte_rendu" },
  { id: "OPS-601-CAP", titre: "Capture du runbook (25 septembre)", fichier: "OPS-601_runbook.png", type: "capture" },
  { id: "E11", titre: "Brouillon : projet au vert", fichier: "E11_Communication_statut.eml", type: "courriel" },
  { id: "REGISTRE-RISQUES", titre: "Registre des risques (29 septembre)", fichier: "Registre_Risques_29sept.xlsx", type: "tableau" },
  { id: "INV-778", titre: "Facture INV-778 (projet ORION)", fichier: "INV-778_Projet_ORION.pdf", type: "facture" },
  { id: "ACC-303", titre: "Focus clavier de la fenêtre modale", fichier: "ACC-303.txt", type: "ticket" },
  { id: "E06", titre: "Transition de la charge de projet", fichier: "E06_Transition_charge_projet.eml", type: "courriel" },
  { id: "M05", titre: "Suivi de livraison du 18 septembre", fichier: "M05_CR_Suivi_18sept.txt", type: "compte_rendu" },
  { id: "CR-04", titre: "Optimisation mobile (brouillon)", fichier: "CR-04_Optimisation_mobile_BROUILLON.pdf", type: "facture" },
  { id: "PLAN-V2", titre: "Plan projet v2", fichier: "Plan_Projet_NOVA_v2.xlsx", type: "tableau" },
  { id: "E08", titre: "SEC-210 : correctif déployé", fichier: "E08_Correctif_journalisation.eml", type: "courriel" },
  { id: "TEAMS-19SEPT", titre: "Teams : 19 septembre (sécurité)", fichier: "Teams_19sept_Securite.txt", type: "compte_rendu" },
  { id: "INV-002", titre: "Facture INV-002", fichier: "INV-002.pdf", type: "facture" },
  { id: "RAPPORT-STATUT", titre: "Rapport de statut du 21 septembre", fichier: "Rapport_Statut_21sept.pdf", type: "pdf" },
  { id: "E07", titre: "INV-003 : référence CR-04 ?", fichier: "E07_Facture_003_question.eml", type: "courriel" },
  { id: "M03", titre: "Comité du 27 août", fichier: "M03_CR_Comite_27aout.txt", type: "compte_rendu" },
  { id: "INV-001", titre: "Facture INV-001", fichier: "INV-001.pdf", type: "facture" },
  { id: "DATA-401-CSV", titre: "Échantillon DATA-401 (CSV)", fichier: "DATA-401_echantillon.csv", type: "tableau" },
];
const ICONE_DOC: Record<Doc["type"], string> = { courriel: "mail", compte_rendu: "texte", facture: "facture", tableau: "tableur", ticket: "texte", capture: "image", pdf: "pdf" };
const TEINTE: Record<Doc["type"], [string, string]> = {
  courriel: [C.accentPale, C.accentFonce], compte_rendu: ["#EBF2F4", "#275563"], facture: [C.rougeFond, C.rouge],
  tableau: [C.vertFond, C.vert], ticket: ["#FCF3DE", C.ambre], capture: ["#F8EEF5", "#852B67"], pdf: ["#F1EEE7", "#57534B"],
};

const CarteDoc: React.FC<{ d: Doc; u: number; actif: number }> = ({ d, u, actif }) => {
  const [fond, encre] = TEINTE[d.type];
  return (
    <div style={{ width: 372 * u, padding: `${18 * u}px ${20 * u}px`, borderRadius: 20 * u, background: C.surface, display: "flex", gap: 16 * u, alignItems: "flex-start",
      boxShadow: `0 ${18 * u}px ${40 * u}px -${18 * u}px rgba(8,6,20,.7), 0 0 0 ${actif * 3 * u}px rgba(196,191,236,${actif}), 0 0 ${actif * 40 * u}px rgba(139,92,246,${actif * 0.6})` }}>
      <div style={{ width: 56 * u, height: 56 * u, borderRadius: 16 * u, background: fond, display: "grid", placeItems: "center", flex: "none" }}>
        <Icone nom={ICONE_DOC[d.type]} taille={28 * u} couleur={encre} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 * u, minWidth: 0 }}>
        <span style={{ fontFamily: F.mono, fontWeight: 500, fontSize: 19 * u, color: encre, letterSpacing: "0.03em" }}>{d.id}</span>
        <span style={{ fontFamily: F.texte, fontWeight: 600, fontSize: 23 * u, color: C.encre, lineHeight: 1.2 }}>{d.titre}</span>
        <span style={{ fontFamily: F.mono, fontSize: 14 * u, color: C.encre3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 270 * u }}>{d.fichier}</span>
      </div>
    </div>
  );
};

const CATEGORIES: { cle: "courriels" | "comptes_rendus" | "factures" | "tableaux"; mot: string; types: Doc["type"][] }[] = [
  { cle: "courriels", mot: "Courriels", types: ["courriel"] },
  { cle: "comptes_rendus", mot: "Comptes rendus", types: ["compte_rendu"] },
  { cle: "factures", mot: "Factures", types: ["facture"] },
  { cle: "tableaux", mot: "Tableaux", types: ["tableau"] },
];

export const Avalanche: React.FC<Props> = ({ t }) => {
  const { W, H, u, vertical } = useFormat();
  const [debut, fin] = SCENES.avalanche;
  const depart = debut + 0.12;
  const duree = K("tableaux") + 0.3 - depart;
  const compteur = Math.max(1, Math.round(1 + 63 * prog(t, depart, depart + duree, (x) => 1 - Math.pow(1 - x, 1.6))));
  const categorie = CATEGORIES.slice().reverse().find((c) => t >= K(c.cle) - 0.08);
  const zoom = tw(t, debut, fin, 1.07, 0.97, (x) => x);
  const amplitude = tw(t, debut, fin, 0, 4 * u, (x) => x);
  const n = Math.floor(t * 60);
  const eclat = prog(t, fin - 0.25, fin, ENTREE);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: String(zoom + eclat * 0.25), translate: `${(alea(n) - 0.5) * amplitude}px ${(alea(n + 3) - 0.5) * amplitude}px`, filter: eclat > 0.02 ? `blur(${eclat * 18}px)` : undefined, opacity: 1 - eclat * 0.7 }}>
        {DOCS.map((d, i) => {
          const arrivee = depart + Math.pow(i / (DOCS.length - 1), 0.85) * (duree - 0.35);
          const p = prog(t, arrivee, arrivee + 0.55, SORTIE);
          if (p <= 0) return null;
          const angle = alea(i * 3.1) * Math.PI * 2;
          const xFinal = W / 2 + (alea(i * 7.7) - 0.5) * (vertical ? W * 0.62 : W * 0.74);
          const yFinal = H / 2 + 30 * u + (alea(i * 5.3) - 0.5) * (vertical ? H * 0.62 : H * 0.6);
          const dist = Math.max(W, H) * 0.9;
          const x = xFinal + Math.cos(angle) * dist * (1 - p);
          const y = yFinal + Math.sin(angle) * dist * (1 - p);
          const rot = (alea(i * 2.3) - 0.5) * 28 + (1 - p) * (alea(i) - 0.5) * 120;
          const actif = categorie && categorie.types.indexOf(d.type) >= 0 ? prog(t, K(categorie.cle) - 0.08, K(categorie.cle) + 0.2) : 0;
          return (
            <div key={d.id} style={{ position: "absolute", left: x - 186 * u, top: y - 60 * u, rotate: `${rot}deg`, scale: String((1.12 - 0.12 * p) * (1 + actif * 0.07)), filter: p < 0.98 ? `blur(${(1 - p) * 14}px)` : undefined, zIndex: actif > 0 ? 50 : i }}>
              <CarteDoc d={d} u={u} actif={actif} />
            </div>
          );
        })}
      </AbsoluteFill>
      {/* Compteur */}
      <div style={{ position: "absolute", left: vertical ? 0 : 84 * u, right: vertical ? 0 : undefined, top: vertical ? 120 * u : 70 * u, display: "flex", flexDirection: "column", alignItems: vertical ? "center" : "flex-start", opacity: prog(t, debut, debut + 0.3) * (1 - eclat) }}>
        <span style={{ fontFamily: F.mono, fontWeight: 500, fontSize: 24 * u, letterSpacing: "0.2em", color: C.sombreDoux }}>DOCUMENTS</span>
        <span style={{ fontFamily: F.mono, fontWeight: 500, fontSize: 128 * u, color: blanc, lineHeight: 1, textShadow: "0 8px 30px rgba(8,6,20,.8)" }}>{compteur}</span>
      </div>
      {/* Catégories, au mot près */}
      {CATEGORIES.map((c, i) => {
        const a = K(c.cle) - 0.1;
        const b = i < CATEGORIES.length - 1 ? K(CATEGORIES[i + 1].cle) - 0.1 : fin;
        if (t < a - 0.05 || t > b + 0.3) return null;
        const pIn = prog(t, a, a + 0.35);
        const pOut = prog(t, b, b + 0.25, ENTREE);
        return (
          <div key={c.cle} style={{ position: "absolute", left: 0, right: 0, bottom: vertical ? 260 * u : 96 * u, display: "flex", justifyContent: "center", opacity: pIn * (1 - pOut) * (1 - eclat), translate: `0 ${(1 - pIn) * 50 * u - pOut * 50 * u}px` }}>
            <div style={{ padding: `${10 * u}px ${44 * u}px ${18 * u}px`, borderRadius: 999, background: "rgba(18,15,40,.82)", boxShadow: "0 20px 60px -10px rgba(8,6,20,.9)", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontFamily: F.titre, fontStyle: "italic", fontWeight: 400, fontSize: 112 * u, color: blanc, lineHeight: 1.05 }}>{c.mot}</span>
              <span style={{ height: 6 * u, width: `${pIn * 100}%`, borderRadius: 6 * u, background: `linear-gradient(90deg, ${C.accent}, ${C.violet})`, marginTop: 4 * u }} />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 4. « La sécurité est au vert » : faux
// ---------------------------------------------------------------------------
export const FauxVert: React.FC<Props> = ({ t }) => {
  const { u, vertical } = useFormat();
  const [debut, fin] = SCENES.vert;
  const arrivee = Math.max(debut + 0.05, K("rapport") - 0.12);
  const p = prog(t, arrivee, arrivee + 0.38, SORTIE);
  const vert = K("vert");
  const pulse = prog(t, vert - 0.05, vert + 0.15) * (1 - prog(t, vert + 0.15, vert + 0.45));
  const glitchA = vert + 0.2, glitchB = vert + 0.46;
  const glitch = t >= glitchA && t <= glitchB;
  const rouge = t > glitchA + 0.12;
  const n = Math.floor(t * 60);
  const sec = secousse(t, arrivee + 0.05, 10 * u, 0.3);
  const sec2 = secousse(t, glitchA + 0.12, 12 * u, 0.3);
  const largeur = vertical ? 940 * u : 1060 * u;
  const ligne = (libelle: string, commentaire: string, decalage: number) => {
    const g = glitch ? (alea(n + decalage) - 0.5) * 28 * u : 0;
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 * u, padding: `${20 * u}px ${30 * u}px`, borderRadius: 18 * u, background: "#FBF8F1", border: `1px solid ${C.filet}` }}>
        <span style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: F.texte, fontWeight: 600, fontSize: 40 * u, color: C.encre, lineHeight: 1.15 }}>{libelle}</span>
          <span style={{ fontFamily: F.texte, fontSize: 26 * u, color: C.encre2 }}>{commentaire}</span>
        </span>
        <span style={{ position: "relative", translate: `${g}px 0` }}>
          {glitch ? (
            <>
              <span style={{ position: "absolute", inset: 0, translate: `${-6 * u}px 0`, opacity: 0.7, mixBlendMode: "multiply", filter: "hue-rotate(160deg)" }}>
                <Pastille icone="valide" texte="VERT" couleur={C.vert} fond={C.vertFond} taille={34 * u} />
              </span>
              <span style={{ position: "absolute", inset: 0, translate: `${6 * u}px 0`, opacity: 0.7, mixBlendMode: "multiply" }}>
                <Pastille icone="interdit" texte="NON VALIDÉ" couleur={C.rouge} fond={C.rougeFond} taille={34 * u} />
              </span>
            </>
          ) : null}
          <span style={{ display: "inline-block", filter: pulse > 0.02 && !rouge ? `drop-shadow(0 0 ${22 * pulse * u}px rgba(61,220,140,.9))` : undefined, scale: String(1 + pulse * 0.08) }}>
            {rouge ? <Pastille icone="interdit" texte="NON VALIDÉ" couleur={C.rouge} fond={C.rougeFond} taille={34 * u} /> : <Pastille icone="valide" texte="VERT" couleur={C.vert} fond={C.vertFond} taille={34 * u} />}
          </span>
        </span>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...sortieFouet(t, fin, 120 * u) }}>
      <div style={{ width: largeur, translate: `${sec.x + sec2.x}px ${sec.y + sec2.y}px`, scale: String(1.18 - 0.18 * p), opacity: Math.min(1, p * 2), filter: p < 0.98 ? `blur(${(1 - p) * 16}px)` : undefined }}>
        <div style={{ borderRadius: 30 * u, background: C.surface, padding: 40 * u, boxShadow: "0 60px 120px -40px rgba(8,6,20,.85)", display: "flex", flexDirection: "column", gap: 20 * u }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 * u, marginBottom: 8 * u }}>
            <div style={{ width: 76 * u, height: 76 * u, borderRadius: 22 * u, background: "#F1EEE7", display: "grid", placeItems: "center" }}>
              <Icone nom="pdf" taille={38 * u} couleur="#57534B" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 * u }}>
              <span style={{ fontFamily: F.mono, fontWeight: 500, fontSize: 22 * u, color: C.encre2, letterSpacing: "0.05em" }}>Rapport_Statut_21sept.pdf</span>
              <span style={{ fontFamily: F.titre, fontWeight: 600, fontSize: 50 * u, color: C.encre, letterSpacing: "-0.015em" }}>Rapport de statut du 21 septembre</span>
            </div>
          </div>
          {ligne("Sécurité", "« Correctif SEC-210 livré »", 1)}
          {ligne("Accessibilité", "« Correctifs appliqués »", 5)}
        </div>
        <div style={{ marginTop: 26 * u, textAlign: "center", fontFamily: F.texte, fontStyle: "italic", fontSize: 34 * u, color: C.sombreTexte, opacity: prog(t, glitchB - 0.1, glitchB + 0.15) }}>
          « Préparé avant la dernière vérification détaillée de certains tickets. » Aucune des deux n'est validée.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 5. Le plan dit le 15, le comité a décidé le 22
// ---------------------------------------------------------------------------
export const Dates: React.FC<Props> = ({ t }) => {
  const { W, H, u, vertical } = useFormat();
  const [, fin] = SCENES.dates;
  const aPlan = K("plan") - 0.12, aComite = K("comite") - 0.15, choc = K("vingt_deux");
  const sec = secousse(t, choc, 16 * u, 0.4);
  const flash = prog(t, choc, choc + 0.06) * (1 - prog(t, choc + 0.06, choc + 0.4));
  const carteW = vertical ? 900 * u : 760 * u;
  const pos = (cote: -1 | 1) => (vertical ? { left: W / 2 - carteW / 2, top: H / 2 + cote * 420 * u - 250 * u } : { left: W / 2 + cote * 470 * u - carteW / 2, top: H / 2 - 270 * u });
  const entree = (a: number, cote: -1 | 1) => {
    const p = prog(t, a, a + 0.45, SORTIE);
    return { opacity: Math.min(1, p * 2), translate: vertical ? `0 ${(1 - p) * cote * 300 * u}px` : `${(1 - p) * cote * 400 * u}px 0`, filter: p < 0.98 ? `blur(${(1 - p) * 14}px)` : undefined };
  };
  const cellule = (txt: string, cible: boolean, flex: number) => (
    <span style={{ padding: `${12 * u}px ${16 * u}px`, borderRight: `1px solid ${C.filet}`, fontFamily: /\d{4}-/.test(txt) || /^P-/.test(txt) ? F.mono : F.texte, fontSize: 26 * u, color: C.encre, fontWeight: cible ? 600 : 400, background: cible ? "rgba(79,70,229,.10)" : undefined, outline: cible ? `${3 * u}px solid ${C.accent}` : undefined, outlineOffset: -3 * u, flex, whiteSpace: "nowrap" }}>{txt}</span>
  );
  return (
    <AbsoluteFill style={sortieFouet(t, fin, 120 * u)}>
     <AbsoluteFill style={{ translate: `${sec.x}px ${sec.y}px` }}>
      {/* Plan v3 : un tableur */}
      <div style={{ position: "absolute", width: carteW, ...pos(-1), ...entree(aPlan, -1) }}>
        <div style={{ borderRadius: 26 * u, background: C.surface, overflow: "hidden", boxShadow: "0 50px 100px -40px rgba(8,6,20,.9)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 * u, padding: `${22 * u}px ${26 * u}px`, borderBottom: `1px solid ${C.filet}` }}>
            <Icone nom="tableur" taille={38 * u} couleur={C.vert} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: F.mono, fontWeight: 500, fontSize: 19 * u, color: C.encre2 }}>Plan_Projet_NOVA_v3_12sept.xlsx</span>
              <span style={{ fontFamily: F.titre, fontWeight: 600, fontSize: 38 * u, color: C.encre }}>Plan projet v3</span>
            </div>
          </div>
          {[["ID", "Activité", "Fin planifiée"], ["P-05", "Préparation exploitation", "2026-10-10"], ["P-06", "Mise en production", "2026-10-15"]].map((r, i) => (
            <div key={i} style={{ display: "flex", borderBottom: `1px solid ${C.filet}`, background: i === 0 ? "#EFEAE0" : undefined }}>
              {i === 0 ? r.map((x, k) => <span key={x} style={{ flex: k === 1 ? 2.2 : 1, padding: `${10 * u}px ${16 * u}px`, fontFamily: F.mono, fontSize: 18 * u, color: C.encre2, letterSpacing: "0.06em", textTransform: "uppercase" }}>{x}</span>) : r.map((x, k) => <React.Fragment key={k}>{cellule(x, i === 2 && k === 2 && t > K("quinze") - 0.1, k === 1 ? 2.2 : 1)}</React.Fragment>)}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24 * u, textAlign: "center", fontFamily: F.titre, fontWeight: 600, fontSize: 104 * u, color: blanc, lineHeight: 1, ...apparition(t, K("quinze") - 0.1, 0.45) }}>15 octobre</div>
      </div>
      {/* Comité de direction */}
      <div style={{ position: "absolute", width: carteW, ...pos(1), ...entree(aComite, 1) }}>
        <div style={{ borderRadius: 26 * u, background: C.surface, overflow: "hidden", boxShadow: "0 50px 100px -40px rgba(8,6,20,.9)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 * u, padding: `${22 * u}px ${26 * u}px`, borderBottom: `1px solid ${C.filet}` }}>
            <Icone nom="marteau" taille={38 * u} couleur={C.accentFonce} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: F.mono, fontWeight: 500, fontSize: 19 * u, color: C.encre2 }}>M04 · Comité de direction · 10 septembre</span>
              <span style={{ fontFamily: F.titre, fontWeight: 600, fontSize: 38 * u, color: C.encre }}>Décision approuvée</span>
            </div>
          </div>
          <div style={{ padding: `${26 * u}px ${26 * u}px ${30 * u}px`, display: "flex", alignItems: "center", gap: 16 * u, fontFamily: F.texte, fontSize: 30 * u, color: C.encre }}>
            <Pastille icone="valide" texte="Approuvée" couleur={C.vert} fond={C.vertFond} taille={26 * u} />
            Mise en production : <strong>22 octobre 2026</strong>
          </div>
        </div>
        <div style={{ marginTop: 24 * u, textAlign: "center", fontFamily: F.titre, fontWeight: 600, fontSize: 104 * u, color: blanc, lineHeight: 1, ...apparition(t, choc - 0.08, 0.4) }}>22 octobre</div>
      </div>
      {/* Le conflit */}
      <div style={{ position: "absolute", left: 0, right: 0, top: vertical ? H / 2 - 120 * u : H / 2 - 90 * u, display: "flex", justifyContent: "center", ...apparition(t, choc, 0.35) }}>
        <span style={{ fontFamily: F.titre, fontWeight: 600, fontSize: 210 * u, color: C.rougeVif, lineHeight: 1, textShadow: `0 0 ${50 * u}px rgba(255,107,94,.6)` }}>≠</span>
      </div>
      <AbsoluteFill style={{ background: `rgba(255,107,94,${flash * 0.18})` }} />
     </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 6. Une facture qui glisse
// ---------------------------------------------------------------------------
export const Facture: React.FC<Props> = ({ t }) => {
  const { u, vertical } = useFormat();
  const [debut, fin] = SCENES.facture;
  const arrivee = Math.max(debut + 0.05, K("facture") - 0.15);
  const p = prog(t, arrivee, arrivee + 0.45, SORTIE);
  const balaye = prog(t, K("dix_huit") - 0.05, K("dix_huit") + 0.45);
  const zoom = tw(t, K("dix_huit") - 0.2, fin, 1, 1.16, (x) => x);
  const largeur = vertical ? 950 * u : 1200 * u;
  const ligne = (libelle: string, montant: string, cible: boolean) => (
    <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${22 * u}px ${28 * u}px`, borderBottom: `1px solid ${C.filet}`, overflow: "hidden" }}>
      {cible ? <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${balaye * 100}%`, background: "rgba(255,107,94,.16)", borderRight: balaye > 0 && balaye < 1 ? `${4 * u}px solid ${C.rougeVif}` : undefined }} /> : null}
      <span style={{ position: "relative", fontFamily: F.texte, fontSize: 34 * u, color: cible && balaye > 0.5 ? C.rouge : C.encre, fontWeight: cible ? 600 : 400 }}>{libelle}</span>
      <span style={{ position: "relative", fontFamily: F.mono, fontWeight: 500, fontSize: 36 * u, color: cible && balaye > 0.5 ? C.rouge : C.encre, scale: String(cible ? 1 + 0.12 * balaye * (1 - prog(t, K("dix_huit") + 0.45, K("dix_huit") + 0.9)) : 1) }}>{montant}</span>
    </div>
  );
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...sortieFouet(t, fin, 120 * u) }}>
      <div style={{ width: largeur, scale: String((1.1 - 0.1 * p) * zoom), opacity: Math.min(1, p * 2), translate: `0 ${(1 - p) * 200 * u}px`, filter: p < 0.98 ? `blur(${(1 - p) * 14}px)` : undefined }}>
        <div style={{ borderRadius: 30 * u, background: C.surface, overflow: "hidden", boxShadow: "0 60px 120px -40px rgba(8,6,20,.85)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${30 * u}px ${30 * u}px ${24 * u}px`, borderBottom: `2px solid ${C.encre}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 * u }}>
              <div style={{ width: 76 * u, height: 76 * u, borderRadius: 22 * u, background: C.rougeFond, display: "grid", placeItems: "center" }}>
                <Icone nom="facture" taille={38 * u} couleur={C.rouge} />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontFamily: F.mono, fontWeight: 500, fontSize: 22 * u, color: C.encre2 }}>INV-003.pdf · Boréal Numérique · 2026-09-22</span>
                <span style={{ fontFamily: F.titre, fontWeight: 600, fontSize: 54 * u, color: C.encre }}>Facture INV-003</span>
              </div>
            </div>
            {vertical ? null : <Pastille icone="calendrier" texte="En validation" couleur={C.ambre} fond="#FCF3DE" taille={26 * u} />}
          </div>
          {ligne("Développement phase 1 - jalon 3", "36 000 $", false)}
          {ligne("Optimisation interface mobile - CR-04", "18 000 $", true)}
          <div style={{ display: "flex", justifyContent: "space-between", padding: `${24 * u}px ${28 * u}px`, background: "#FBF8F1" }}>
            <span style={{ fontFamily: F.texte, fontWeight: 600, fontSize: 34 * u, color: C.encre }}>Total</span>
            <span style={{ fontFamily: F.mono, fontWeight: 500, fontSize: 36 * u, color: C.encre }}>54 000 $</span>
          </div>
        </div>
        <div style={{ marginTop: 30 * u, display: "flex", justifyContent: "center", ...apparition(t, K("personne") - 0.1, 0.45) }}>
          <Pastille icone="interdit" texte="CR-04 n'a jamais été approuvée" couleur={C.rougeVif} fond="rgba(255,107,94,.12)" taille={38 * u} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 7. Qui croire ?
// ---------------------------------------------------------------------------
export const QuiCroire: React.FC<Props> = ({ t }) => {
  const { W, H, u } = useFormat();
  const [debut, fin] = SCENES.quiCroire;
  const tempete = 1 - prog(t, debut, debut + 0.32, ENTREE);
  const p = prog(t, P(6) - 0.06, P(6) + 0.35, SORTIE);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {tempete > 0.01
        ? DOCS.slice(0, 10).map((d, i) => {
            const a = alea(i * 9.1) * Math.PI * 2;
            const r = (0.15 + (1 - tempete) * 0.9) * Math.max(W, H) * (0.4 + alea(i) * 0.4);
            return (
              <div key={d.id} style={{ position: "absolute", left: W / 2 + Math.cos(a + (1 - tempete) * 2) * r - 186 * u, top: H / 2 + Math.sin(a + (1 - tempete) * 2) * r - 60 * u, rotate: `${(alea(i * 4) - 0.5) * 90 + (1 - tempete) * 180}deg`, opacity: tempete, filter: `blur(${(1 - tempete) * 20 + 4}px)` }}>
                <CarteDoc d={d} u={u} actif={0} />
              </div>
            );
          })
        : null}
      <div style={{ fontFamily: F.titre, fontStyle: "italic", fontWeight: 400, fontSize: 168 * u, color: blanc, letterSpacing: `${(1 - p) * 0.12}em`, opacity: p * env(t, debut, fin + 0.05, 0.01, 0.2), scale: String(1.08 - 0.08 * p), filter: p < 0.98 ? `blur(${(1 - p) * 12}px)` : undefined }}>
        Qui croire ?
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 8. Et si vous aviez la réponse en cinq minutes ?
// ---------------------------------------------------------------------------
export const CinqMinutes: React.FC<Props> = ({ t }) => {
  const { u, vertical } = useFormat();
  const [, fin] = SCENES.cinq;
  const aube = prog(t, fin - 0.6, fin, (x) => x * x);
  const ligne2 = K("cinq_minutes") - 0.32;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 * u, opacity: 1 - prog(t, fin - 0.35, fin - 0.05), translate: `0 ${-aube * 60 * u}px` }}>
        <Mots texte="Et si vous aviez la réponse" t={t} debut={P(7) - 0.05} ecart={0.11} style={{ fontFamily: F.titre, fontWeight: 600, fontSize: (vertical ? 92 : 96) * u, color: blanc, letterSpacing: "-0.02em", maxWidth: vertical ? 960 * u : undefined, lineHeight: 1.1 }} />
        <Mots
          texte="en 5 minutes ?"
          t={t}
          debut={ligne2}
          ecart={0.13}
          style={{ fontFamily: F.titre, fontStyle: "italic", fontWeight: 400, fontSize: 150 * u, color: blanc, lineHeight: 1.05 }}
          motStyle={(i) => (i === 1 || i === 2 ? { color: "#B9B2FF", textShadow: `0 0 ${36 * u}px rgba(124,108,255,.85), 0 0 ${90 * u}px rgba(139,92,246,.55)` } : undefined)}
        />
      </div>
      {/* Une nouvelle étoile se lève : elle ouvre le passage vers la solution. */}
      {aube > 0 ? (
        <div style={{ position: "absolute", left: "50%", top: "50%", translate: "-50% -50%", scale: String(0.2 + aube * 2.2), opacity: Math.min(1, aube * 3) }}>
          <Etoile taille={160 * u} couleur="#FFFFFF" lueur={1 + aube * 2} />
        </div>
      ) : null}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(255,253,248,${aube}) 0%, rgba(246,243,236,${aube * aube}) ${20 + aube * 60}%, rgba(246,243,236,0) ${30 + aube * 70}%)` }} />
    </AbsoluteFill>
  );
};
