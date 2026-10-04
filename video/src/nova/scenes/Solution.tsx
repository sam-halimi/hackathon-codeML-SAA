// Acte 2 : la solution. L'étoile NOVA se lève, puis les vraies interfaces de l'application.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F } from "../theme";
import { Cle, ENTREE, K, P, prog, RESSORT, SCENES, SORTIE, tw } from "../temps";
import { Anneau, B, boite, Camera, Capture, Curseur, Etoile, Fenetre, Icone, Mots, Pastille, apparition, useFormat } from "../ui";

type Props = { t: number };

/** Mise en place d'une capture plein écran (2880 × 1800) dans une fenêtre de navigateur centrée. */
export function useFenetre(largeurRel?: number) {
  const { W, H, vertical } = useFormat();
  const largeur = Math.round(W * (largeurRel || (vertical ? 0.93 : 0.84)));
  const s = largeur / 2880;
  const barre = Math.round(largeur * 0.028);
  const hauteur = Math.round(1800 * s);
  const gauche = (W - largeur) / 2;
  const haut = (H - hauteur - barre) / 2;
  /** Centre (monde) d'une boîte de la capture. */
  const centre = (capture: string, cle: string) => {
    const b = boite(capture, cle, s);
    return { x: gauche + b.x + b.w / 2, y: haut + barre + b.y + b.h / 2, w: b.w, h: b.h };
  };
  /** Zoom qui fait tenir une zone (largeur × hauteur à l'écran) dans le cadre. */
  const zoomPour = (w: number, h: number, marge = 0.82, max = 2.6) => Math.max(0.8, Math.min(max, (W * marge) / w, (H * marge) / h));
  const ajuste = Math.min(1, (H * 0.94) / (hauteur + barre), (W * 0.96) / largeur);
  return { W, H, vertical, largeur, s, barre, hauteur, gauche, haut, centre, zoomPour, ajuste };
}

// ---------------------------------------------------------------------------
// 9. Voici Nova : la mémoire de votre projet
// ---------------------------------------------------------------------------
export const Logo: React.FC<Props> = ({ t }) => {
  const { W, H, u, vertical } = useFormat();
  const [debut, fin] = SCENES.logo;
  const rayon = prog(t, debut - 0.05, debut + 0.55, SORTIE) * Math.hypot(W, H) * 0.6;
  const pEtoile = prog(t, debut + 0.05, debut + 0.75, RESSORT);
  const glisse = prog(t, K("nova") - 0.12, K("nova") + 0.45, SORTIE);
  const sortie = prog(t, fin - 0.42, fin, ENTREE);
  const taille = 210 * u;
  const decalage = vertical ? 0 : -330 * u * glisse;
  return (
    <AbsoluteFill>
      {/* Le papier s'ouvre depuis l'étoile */}
      <AbsoluteFill style={{ clipPath: `circle(${rayon}px at 50% 50%)`, background: C.fond }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", scale: String(1 - sortie * 0.45), translate: `${-sortie * W * 0.32}px ${-sortie * H * 0.38}px`, opacity: 1 - sortie, filter: sortie > 0.02 ? `blur(${sortie * 10}px)` : undefined }}>
        {/* Rayons */}
        {Array.from({ length: 14 }, (_, i) => {
          const p = prog(t, debut + 0.15, debut + 1.1, SORTIE);
          const a = (i / 14) * 360;
          return (
            <div key={i} style={{ position: "absolute", left: W / 2 + decalage, top: H / 2 - (vertical ? 150 * u * glisse : 0), width: 2 * u, height: (90 + (i % 3) * 40) * u, background: `linear-gradient(${C.accent}, transparent)`, opacity: (1 - p) * 0.7, transformOrigin: "50% 0", rotate: `${a}deg`, translate: `0 ${(0.4 + p * 1.6) * taille * 0.6}px` }} />
          );
        })}
        <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", alignItems: "center", gap: vertical ? 30 * u : 0 }}>
          <div style={{ translate: vertical ? `0 ${(1 - glisse) * 140 * u}px` : `${decalage + 330 * u * glisse}px 0`, scale: String(pEtoile), rotate: `${(1 - pEtoile) * -40}deg` }}>
            <Etoile taille={taille} lueur={2 - pEtoile * 1.4} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginLeft: vertical ? 0 : 36 * u, alignItems: vertical ? "center" : "flex-start", clipPath: vertical ? undefined : `inset(0 ${(1 - glisse) * 100}% 0 0)`, opacity: vertical ? glisse : 1 }}>
            <span style={{ fontFamily: F.titre, fontWeight: 600, fontSize: 196 * u, color: C.encre, letterSpacing: "-0.035em", lineHeight: 0.95 }}>NOVA</span>
            <Mots texte="Mémoire de projet" t={t} debut={K("memoire") - 0.12} ecart={0.08} style={{ fontFamily: F.titre, fontStyle: "italic", fontWeight: 400, fontSize: 72 * u, color: C.encre2, justifyContent: vertical ? "center" : "flex-start" }} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 10. La date, les conditions, ce qui bloque : un seul écran
// ---------------------------------------------------------------------------
export const UnEcran: React.FC<Props> = ({ t }) => {
  const f = useFenetre();
  const [debut, fin] = SCENES.ecran;
  const entree = prog(t, debut, debut + 0.75, SORTIE);
  const aff = f.centre("accueil", "affiche");
  const c1 = f.centre("accueil", "c1"), c2 = f.centre("accueil", "c2"), c3 = f.centre("accueil", "c3");
  const conds = { x: (Math.min(c1.x - c1.w / 2, c3.x - c3.w / 2) + Math.max(c2.x + c2.w / 2, c1.x + c1.w / 2)) / 2, y: (c1.y + c3.y) / 2, w: Math.max(c2.x + c2.w / 2, c1.x + c1.w / 2) - (c1.x - c1.w / 2), h: c3.y - c1.y + c3.h };
  const vue = { x: f.W / 2, y: f.H / 2, z: f.ajuste };
  const zc = Math.min(2.4, (f.W * 0.9) / c1.w);
  const cles: Cle[] = f.vertical ? [
    { t: debut, ...vue },
    { t: K("la_date") - 0.15, ...vue },
    { t: K("la_date") + 0.45, x: aff.x, y: aff.y, z: (f.W * 0.94) / aff.w },
    { t: K("conditions") - 0.12, x: aff.x, y: aff.y, z: (f.W * 0.94) / aff.w },
    { t: K("conditions") + 0.4, x: c1.x, y: c1.y, z: zc },
    { t: K("conditions") + 0.55, x: c1.x, y: c1.y, z: zc },
    { t: K("conditions") + 0.95, x: c2.x, y: c2.y, z: zc },
    { t: K("bloque") - 0.15, x: c2.x, y: c2.y, z: zc },
    { t: K("bloque") + 0.3, x: c3.x, y: c3.y, z: zc },
    { t: K("un_seul_ecran") - 0.25, x: c3.x, y: c3.y, z: zc },
    { t: K("un_seul_ecran") + 0.5, ...vue },
  ] : [
    { t: debut, ...vue },
    { t: K("la_date") - 0.15, ...vue },
    { t: K("la_date") + 0.45, x: aff.x, y: aff.y + aff.h * 0.1, z: f.zoomPour(aff.w, aff.h * 1.6) },
    { t: K("conditions") - 0.12, x: aff.x, y: aff.y + aff.h * 0.1, z: f.zoomPour(aff.w, aff.h * 1.6) },
    { t: K("conditions") + 0.45, x: conds.x, y: conds.y - conds.h * 0.35, z: f.zoomPour(conds.w * 1.12, conds.h * 3.6) },
    { t: K("un_seul_ecran") - 0.25, x: conds.x, y: conds.y - conds.h * 0.35, z: f.zoomPour(conds.w * 1.12, conds.h * 3.6) },
    { t: K("un_seul_ecran") + 0.5, ...vue },
  ];
  const s = f.s;
  const bAff = boite("accueil", "affiche", s);
  const rouge = t >= K("bloque") - 0.05;
  return (
    <AbsoluteFill style={{ perspective: 1800 }}>
      <Camera t={t} cles={cles}>
        <div style={{ position: "absolute", left: f.gauche, top: f.haut, translate: `0 ${(1 - entree) * f.H * 0.55}px`, rotate: `x ${(1 - entree) * 24}deg`, opacity: Math.min(1, entree * 2), transformOrigin: "50% 100%" }}>
          <Fenetre largeur={f.largeur} hauteur={f.hauteur}>
            <Capture nom="accueil" s={s} largeur={2880} hauteur={1800} />
            <Anneau {...bAff} t={t} debut={K("la_date") - 0.05} fin={K("conditions") - 0.1} couleur="#FFFFFF" rayon={20 * s * 2} marge={14 * s * 2} />
            {(["c1", "c2", "c3"] as const).map((c, i) => (
              <React.Fragment key={c}>
                <Anneau {...boite("accueil", c, s)} t={t} debut={K("conditions") + i * 0.2} fin={K("bloque") - 0.05} couleur="#C4BFEC" rayon={50 * s} marge={8 * s * 2} />
                {rouge ? <Anneau {...boite("accueil", c, s)} t={t} debut={K("bloque") - 0.05 + i * 0.12} fin={K("un_seul_ecran") + 0.2} couleur={C.rougeVif} rayon={50 * s} marge={8 * s * 2} /> : null}
              </React.Fragment>
            ))}
          </Fenetre>
        </div>
      </Camera>
      <div style={{ position: "absolute", inset: 0, opacity: prog(t, fin - 0.2, fin, ENTREE), background: C.fond }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 11. Chaque réponse a sa preuve : un clic, le document au passage exact
// ---------------------------------------------------------------------------
export const Preuve: React.FC<Props> = ({ t }) => {
  const f = useFenetre();
  const [debut, fin] = SCENES.preuve;
  const s = f.s;
  const carte = f.centre("questions_q08", "reponse");
  const bouton = f.centre("questions_q08", "preuve1");
  const lignes = f.centre("preuve_sec210", "lignes");
  const clic = K("clic");
  const ouverture = prog(t, clic + 0.05, clic + 0.55, SORTIE);
  const zCarte = f.zoomPour(carte.w, carte.h * 2.4);
  const cles: Cle[] = f.vertical ? [
    { t: debut, x: carte.x, y: carte.y, z: (f.W * 0.94) / carte.w },
    { t: K("preuve") - 0.2, x: carte.x, y: carte.y, z: (f.W * 0.94) / carte.w },
    { t: K("preuve") + 0.45, x: bouton.x - bouton.w * 0.22, y: bouton.y, z: 2.0 },
    { t: clic + 0.02, x: bouton.x - bouton.w * 0.22, y: bouton.y, z: 2.0 },
    { t: clic + 0.55, x: f.W / 2, y: f.H / 2, z: f.ajuste },
    { t: K("passage") - 0.3, x: f.W / 2, y: f.H / 2, z: f.ajuste },
    { t: K("passage") + 0.35, x: lignes.x - lignes.w * 0.18, y: lignes.y, z: 2.1 },
  ] : [
    { t: debut, x: carte.x, y: carte.y - carte.h * 0.2, z: zCarte * 0.94 },
    { t: K("preuve") - 0.2, x: carte.x, y: carte.y - carte.h * 0.2, z: zCarte },
    { t: K("preuve") + 0.45, x: bouton.x, y: bouton.y - bouton.h * 0.2, z: f.zoomPour(bouton.w, bouton.h * 3.2) },
    { t: clic + 0.02, x: bouton.x, y: bouton.y - bouton.h * 0.2, z: f.zoomPour(bouton.w, bouton.h * 3.2) },
    { t: clic + 0.55, x: f.W / 2, y: f.H / 2, z: f.ajuste },
    { t: K("passage") - 0.3, x: f.W / 2, y: f.H / 2, z: f.ajuste },
    { t: K("passage") + 0.35, x: lignes.x, y: lignes.y, z: f.zoomPour(lignes.w, lignes.h * 2.2) },
  ];
  // Trajet du curseur (repère monde) : du bas à droite jusqu'au bouton « Preuve ».
  const pc = prog(t, K("preuve") - 0.1, clic - 0.08, SORTIE);
  const cx = bouton.x + bouton.w * 0.36 + (1 - pc) * f.W * 0.3;
  const cy = bouton.y + (1 - pc) * f.H * 0.35;
  const balayage = prog(t, K("passage") + 0.2, K("passage") + 1.0, (x) => x);
  const bl = boite("preuve_sec210", "lignes", s);
  return (
    <AbsoluteFill>
      <Camera t={t} cles={cles}>
        <div style={{ position: "absolute", left: f.gauche, top: f.haut, opacity: prog(t, debut, debut + 0.25) }}>
          <Fenetre largeur={f.largeur} hauteur={f.hauteur}>
            <Capture nom="questions_q08" s={s} largeur={2880} hauteur={1800} />
            <Anneau {...boite("questions_q08", "preuve1", s)} t={t} debut={K("preuve") + 0.1} fin={clic + 0.1} rayon={28 * s} marge={6 * s * 2} />
            {/* La preuve s'ouvre en grandissant depuis le bouton cliqué */}
            {ouverture > 0 ? (
              <div style={{ position: "absolute", inset: 0, opacity: Math.min(1, ouverture * 2.5), transformOrigin: `${(bouton.x - f.gauche) / f.largeur * 100}% ${(bouton.y - f.haut - f.barre) / f.hauteur * 100}%`, scale: String(0.12 + 0.88 * ouverture), filter: ouverture < 0.98 ? `blur(${(1 - ouverture) * 10}px)` : undefined }}>
                <Capture nom="preuve_sec210" s={s} largeur={2880} hauteur={1800} />
                {balayage > 0 && balayage < 1 ? (
                  <div style={{ position: "absolute", left: bl.x, top: bl.y, width: bl.w, height: bl.h, overflow: "hidden", mixBlendMode: "multiply" }}>
                    <div style={{ position: "absolute", top: 0, bottom: 0, width: bl.w * 0.25, left: -bl.w * 0.25 + balayage * bl.w * 1.25, background: "linear-gradient(90deg, rgba(79,70,229,0), rgba(79,70,229,.28), rgba(79,70,229,0))" }} />
                  </div>
                ) : null}
                <Anneau {...bl} t={t} debut={K("passage") - 0.1} rayon={10 * s * 2} marge={6 * s * 2} />
              </div>
            ) : null}
          </Fenetre>
        </div>
        {t < clic + 0.5 ? <Curseur x={cx} y={cy} taille={Math.max(26, 44 * s * 2)} t={t} clic={clic} opacite={prog(t, K("preuve") - 0.1, K("preuve") + 0.15) * (1 - prog(t, clic + 0.25, clic + 0.5))} /> : null}
      </Camera>
      <div style={{ position: "absolute", inset: 0, opacity: prog(t, fin - 0.18, fin, ENTREE), background: C.fond }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 12. Les contradictions sont tranchées ; chaque action a un responsable
// ---------------------------------------------------------------------------
export const Contradictions: React.FC<Props> = ({ t }) => {
  const { W, H, u, vertical } = useFormat();
  const [debut, fin] = SCENES.contradictions;
  const bascule = P(13) - 0.3;
  // Contradiction K01 (élément 2384 × 830)
  const lk = W * (vertical ? 1.7 : 0.84);
  const sk = lk / 2384;
  const hk = 830 * sk;
  const pan = prog(t, K("contradictions") + 0.35, K("contradictions") + 0.8);
  const pIn = prog(t, debut, debut + 0.45, SORTIE);
  const pOut = prog(t, bascule - 0.05, bascule + 0.3, ENTREE);
  const perime = boite("contradiction_k01", "perime", sk);
  const valide = boite("contradiction_k01", "valide", sk);
  const trait = prog(t, K("contradictions") + 0.2, K("contradictions") + 0.6);
  // Tableau des actions (élément 2380 × 3910, on montre les trois premières lignes)
  const la = W * (vertical ? 1.5 : 0.8);
  const sa = la / 2380;
  const gaucheA = vertical ? W / 2 - B.actions_tableau.resp1.x * sa : (W - la) / 2;
  const visible = (B.actions_tableau.ligne3.y + B.actions_tableau.ligne3.h) * sa;
  const aIn = prog(t, bascule, bascule + 0.5, SORTIE);
  return (
    <AbsoluteFill>
      {t < bascule + 0.35 ? (
        <div style={{ position: "absolute", left: vertical ? W / 2 - (perime.x + perime.w / 2) * (1 - pan) - (valide.x + valide.w / 2) * pan : (W - lk) / 2, top: (H - hk) / 2 - (vertical ? 60 * u : 30 * u), width: lk, height: hk, translate: `${(1 - pIn) * W * 0.9 - pOut * W * 0.9}px 0`, filter: pIn < 0.98 || pOut > 0.02 ? `blur(${(1 - pIn + pOut) * 16}px)` : undefined, borderRadius: 26 * sk * 2, boxShadow: "0 50px 100px -40px rgba(34,30,69,.45)" }}>
          <Capture nom="contradiction_k01" s={sk} largeur={2384} hauteur={830} style={{ borderRadius: 22 * sk * 2 }} />
          {/* Le périmé est barré, ce qui fait foi est confirmé */}
          <div style={{ position: "absolute", left: perime.x + perime.w * 0.06, top: perime.y + perime.h * 0.38, width: perime.w * 0.88 * trait, height: Math.max(3, 6 * sk * 2), background: C.rouge, borderRadius: 6, rotate: "-2deg", transformOrigin: "0 50%", boxShadow: `0 0 ${12 * sk * 2}px rgba(163,34,26,.5)` }} />
          <Anneau {...valide} t={t} debut={K("contradictions") + 0.5} couleur={C.vert} rayon={26 * sk * 2} marge={8 * sk * 2} />
          <div style={{ position: "absolute", left: valide.x + valide.w - 40 * u, top: valide.y - 34 * u, ...apparition(t, K("contradictions") + 0.6, 0.45) }}>
            <Pastille icone="valide" texte="Fait foi" couleur="#FFFFFF" fond={C.vert} bordure={C.vert} taille={28 * u} />
          </div>
        </div>
      ) : null}
      {t > bascule - 0.05 ? (
        <div style={{ position: "absolute", left: gaucheA, top: (H - visible) / 2, width: la, height: visible, overflow: "hidden", borderRadius: 26 * sa * 2, translate: `0 ${(1 - aIn) * H * 0.8}px`, filter: aIn < 0.98 ? `blur(${(1 - aIn) * 14}px)` : undefined, boxShadow: "0 50px 100px -40px rgba(34,30,69,.45)", background: C.surface }}>
          <Capture nom="actions_tableau" s={sa} largeur={2380} hauteur={3910} />
          {(["resp1", "resp2", "resp3"] as const).map((r, i) => (
            <Anneau key={r} {...boite("actions_tableau", r, sa)} t={t} debut={K("responsable") - 0.15 + i * 0.16} rayon={16 * sa * 2} marge={-4 * sa * 2} />
          ))}
        </div>
      ) : null}
      <div style={{ position: "absolute", inset: 0, opacity: prog(t, fin - 0.18, fin, ENTREE), background: C.fond }} />
    </AbsoluteFill>
  );
};

export { Icone, tw };
