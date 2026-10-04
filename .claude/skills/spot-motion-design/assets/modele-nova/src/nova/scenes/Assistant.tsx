// Acte 3 : l'assistant. Une nouvelle tombe, on la colle, il prépare la mise à jour, vérifie, attend l'accord.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F } from "../theme";
import { Cle, ENTREE, K, P, prog, SCENES, SORTIE } from "../temps";
import { Anneau, apparition, boite, Camera, Capture, Curseur, Fenetre, Icone, Pastille, useFormat } from "../ui";
import { useFenetre } from "./Solution";

type Props = { t: number };

/** Le courriel du fournisseur (message d'essai de la démo, marqué EXEMPLE comme dans l'application). */
const Courriel: React.FC<{ u: number; largeur: number }> = ({ u, largeur }) => (
  <div style={{ width: largeur, borderRadius: 24 * u, background: C.surface, padding: `${22 * u}px ${26 * u}px`, boxShadow: "0 30px 70px -20px rgba(34,30,69,.55), 0 0 0 1px rgba(34,30,69,.06)", display: "flex", gap: 18 * u }}>
    <div style={{ width: 62 * u, height: 62 * u, borderRadius: "50%", background: "#EBF2F4", color: "#275563", display: "grid", placeItems: "center", fontFamily: F.texte, fontWeight: 600, fontSize: 24 * u, flex: "none" }}>JM</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 6 * u, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 * u, flexWrap: "wrap" }}>
        <span style={{ fontFamily: F.texte, fontWeight: 600, fontSize: 26 * u, color: C.encre }}>Julien Moreau · Boréal</span>
        <Pastille icone="alerte" texte="EXEMPLE" couleur={C.rouge} fond={C.rougeFond} taille={16 * u} />
      </div>
      <span style={{ fontFamily: F.texte, fontSize: 22 * u, color: C.encre2, display: "flex", alignItems: "center", gap: 8 * u }}><Icone nom="mail" taille={22 * u} couleur={C.encre2} />Objet : le runbook ne sera pas prêt à temps</span>
      <span style={{ fontFamily: F.texte, fontSize: 25 * u, color: C.encre, lineHeight: 1.35 }}>Nous proposons de décaler la mise en production au 29 octobre pour finaliser le rollback.</span>
    </div>
  </div>
);

export const Assistant: React.FC<Props> = ({ t }) => {
  const { u, vertical } = useFormat();
  const [debut, fin] = SCENES.assistant;
  return vertical ? <AssistantVertical t={t} debut={debut} fin={fin} u={u} /> : <AssistantLarge t={t} debut={debut} fin={fin} u={u} />;
};

const AssistantLarge: React.FC<{ t: number; debut: number; fin: number; u: number }> = ({ t, debut, fin, u }) => {
  const f = useFenetre();
  const s = f.s;
  const panneau = f.centre("assistant_accueil", "panneau");
  const saisie = f.centre("assistant_accueil", "saisie");
  const carte = f.centre("assistant_proposition", "carte");
  const appliquer = f.centre("assistant_proposition", "appliquer");
  const vue = { x: f.W / 2, y: f.H / 2, z: f.ajuste };
  const zCarte = f.zoomPour(carte.w, carte.h * 1.12, 0.86, 2.2);
  const cles: Cle[] = [
    { t: debut, ...vue },
    { t: K("collez") - 0.25, ...vue },
    { t: K("collez") + 0.5, x: panneau.x - panneau.w * 0.12, y: saisie.y - saisie.h * 1.6, z: 1.55 },
    { t: P(15) - 0.15, x: panneau.x - panneau.w * 0.12, y: saisie.y - saisie.h * 1.6, z: 1.55 },
    { t: P(15) + 0.55, x: carte.x, y: carte.y, z: zCarte },
    { t: fin, x: carte.x, y: carte.y + carte.h * 0.04, z: zCarte * 1.03 },
  ];
  const aCourriel = K("nouvelle") - 0.12;
  const pCourriel = prog(t, aCourriel, aCourriel + 0.5, SORTIE);
  const vol = prog(t, K("collez") - 0.05, K("collez") + 0.45, SORTIE);
  const largeurCourriel = 760 * u;
  // Le courriel part de la zone de travail et vole jusqu'au champ de l'assistant.
  const depart = { x: f.gauche + f.largeur * 0.36, y: f.haut + f.barre + f.hauteur * 0.2 };
  const cx = depart.x + (saisie.x - depart.x) * vol;
  const cy = depart.y + (saisie.y - depart.y) * vol;
  const proposition = prog(t, P(15) - 0.1, P(15) + 0.3);
  const applique = prog(t, K("accord") + 0.2, K("accord") + 0.5);
  const pc = prog(t, K("accord") - 0.75, K("accord") - 0.05, SORTIE);
  const curseur = { x: appliquer.x + appliquer.w * 0.2 + (1 - pc) * 260 * u, y: appliquer.y + (1 - pc) * 220 * u };
  const bs = (cle: string, capture = "assistant_proposition") => boite(capture, cle, s);
  return (
    <AbsoluteFill>
      <Camera t={t} cles={cles}>
        <div style={{ position: "absolute", left: f.gauche, top: f.haut, opacity: prog(t, debut, debut + 0.25) }}>
          <Fenetre largeur={f.largeur} hauteur={f.hauteur}>
            <Capture nom="assistant_accueil" s={s} largeur={2880} hauteur={1800} />
            {/* Le texte collé apparaît dans le champ */}
            <div style={{ position: "absolute", ...pos(bs("saisie", "assistant_accueil")), opacity: prog(t, K("collez") + 0.3, K("collez") + 0.5) * (1 - proposition) }}>
              <Capture nom="assistant_saisie_remplie" s={s} largeur={894} hauteur={176} />
            </div>
            <div style={{ position: "absolute", inset: 0, opacity: proposition * (1 - applique) }}>
              <Capture nom="assistant_proposition" s={s} largeur={2880} hauteur={1800} />
              <Anneau {...bs("liste")} t={t} debut={K("prepare") + 0.25} rayon={14 * s * 2} marge={4 * s * 2} />
              <Anneau {...bs("inchange")} t={t} debut={K("regles") - 0.05} couleur={C.vert} rayon={12 * s * 2} marge={4 * s * 2} />
              <Anneau {...bs("appliquer")} t={t} debut={K("accord") - 0.3} rayon={40 * s} marge={4 * s * 2} />
            </div>
            <div style={{ position: "absolute", inset: 0, opacity: applique }}>
              <Capture nom="assistant_applique" s={s} largeur={2880} hauteur={1800} />
              <Anneau {...boite("assistant_applique", "reponse", s)} t={t} debut={K("accord") + 0.45} couleur={C.vert} rayon={18 * s * 2} marge={4 * s * 2} />
            </div>
          </Fenetre>
        </div>
        {/* Badge : garde-fous vérifiés */}
        <div style={{ position: "absolute", left: carte.x + carte.w * 0.5 - 30 * u * s * 2, top: carte.y - carte.h * 0.5 - 14 * u * s * 2, ...apparition(t, K("regles") - 0.05, 0.45) }}>
          <Pastille icone="bouclier" texte="Garde-fous vérifiés" couleur="#FFFFFF" fond={C.vert} bordure={C.vert} taille={Math.max(12, 17 * s * 2)} />
        </div>
        {t > K("accord") - 0.8 && t < K("accord") + 0.7 ? <Curseur x={curseur.x} y={curseur.y} taille={Math.max(22, 34 * s * 2)} t={t} clic={K("accord") + 0.02} opacite={prog(t, K("accord") - 0.75, K("accord") - 0.5) * (1 - prog(t, K("accord") + 0.4, K("accord") + 0.65))} /> : null}
        {/* Le courriel du fournisseur */}
        {t > aCourriel && vol < 1 ? (
          <div style={{ position: "absolute", left: cx - largeurCourriel / 2, top: cy - 80 * u, translate: `${(1 - pCourriel) * 500 * u}px ${-(1 - pCourriel) * 120 * u}px`, scale: String(1 - vol * 0.55), opacity: Math.min(1, pCourriel * 2) * (1 - prog(t, K("collez") + 0.3, K("collez") + 0.45)), filter: vol > 0.02 && vol < 0.98 ? `blur(${Math.sin(vol * Math.PI) * 6}px)` : undefined }}>
            <Courriel u={u} largeur={largeurCourriel} />
          </div>
        ) : null}
      </Camera>
      <div style={{ position: "absolute", inset: 0, opacity: prog(t, fin - 0.18, fin, ENTREE), background: C.fond }} />
    </AbsoluteFill>
  );
};

const pos = (b: { x: number; y: number; w: number; h: number }) => ({ left: b.x, top: b.y, width: b.w, height: b.h, overflow: "hidden" as const });

/** Format vertical : le panneau de l'assistant (portrait) remplit l'écran. */
const AssistantVertical: React.FC<{ t: number; debut: number; fin: number; u: number }> = ({ t, debut, fin, u }) => {
  const { W, H } = useFormat();
  const hauteur = H * 0.84;
  const s = hauteur / 1800;
  const largeur = 960 * s;
  const gauche = (W - largeur) / 2;
  const haut = H * 0.1;
  const proposition = prog(t, P(15) - 0.1, P(15) + 0.3);
  const applique = prog(t, K("accord") + 0.2, K("accord") + 0.5);
  const b = (capture: string, cle: string) => boite(capture, cle, s);
  const app = b("assistant_panneau_proposition", "appliquer");
  const pc = prog(t, K("accord") - 0.75, K("accord") - 0.05, SORTIE);
  const aCourriel = K("nouvelle") - 0.12;
  const pCourriel = prog(t, aCourriel, aCourriel + 0.5, SORTIE);
  const vol = prog(t, K("collez") - 0.05, K("collez") + 0.45, SORTIE);
  const saisie = b("assistant_panneau_accueil", "saisie");
  const carte = b("assistant_panneau_proposition", "carte");
  const cles: Cle[] = [
    { t: debut, x: W / 2, y: H / 2, z: 1 },
    { t: P(15) + 0.1, x: W / 2, y: H / 2, z: 1 },
    { t: P(15) + 0.6, x: gauche + carte.x + carte.w / 2, y: haut + carte.y + carte.h / 2, z: 1.12 },
  ];
  return (
    <AbsoluteFill>
      <Camera t={t} cles={cles}>
        <div style={{ position: "absolute", left: gauche, top: haut, width: largeur, height: hauteur, borderRadius: 34 * u, overflow: "hidden", boxShadow: "0 60px 120px -40px rgba(34,30,69,.55), 0 0 0 1px rgba(34,30,69,.08)", opacity: prog(t, debut, debut + 0.3) }}>
          <Capture nom="assistant_panneau_accueil" s={s} largeur={960} hauteur={1800} />
          <div style={{ position: "absolute", ...pos(saisie), opacity: prog(t, K("collez") + 0.3, K("collez") + 0.5) * (1 - proposition) }}>
            <Capture nom="assistant_saisie_remplie" s={s} largeur={894} hauteur={176} />
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: proposition * (1 - applique) }}>
            <Capture nom="assistant_panneau_proposition" s={s} largeur={960} hauteur={1800} />
            <Anneau {...b("assistant_panneau_proposition", "liste")} t={t} debut={K("prepare") + 0.25} rayon={14 * s * 2} marge={4 * s * 2} />
            <Anneau {...app} t={t} debut={K("accord") - 0.3} rayon={40 * s} marge={4 * s * 2} />
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: applique }}>
            <Capture nom="assistant_panneau_applique" s={s} largeur={960} hauteur={1800} />
          </div>
          {t > K("accord") - 0.8 && t < K("accord") + 0.7 ? <Curseur x={app.x + app.w * 0.3 + (1 - pc) * 220 * u} y={app.y + app.h * 0.5 + (1 - pc) * 240 * u} taille={56 * u} t={t} clic={K("accord") + 0.02} opacite={prog(t, K("accord") - 0.75, K("accord") - 0.5) * (1 - prog(t, K("accord") + 0.4, K("accord") + 0.65))} /> : null}
        </div>
        <div style={{ position: "absolute", left: gauche + carte.x + carte.w - 340 * u, top: haut + carte.y - 40 * u, ...apparition(t, K("regles") - 0.05, 0.45) }}>
          <Pastille icone="bouclier" texte="Garde-fous vérifiés" couleur="#FFFFFF" fond={C.vert} bordure={C.vert} taille={30 * u} />
        </div>
        {t > aCourriel && vol < 1 ? (
          <div style={{ position: "absolute", left: W / 2 - 470 * u + (gauche + saisie.x + saisie.w / 2 - W / 2) * vol, top: H * 0.14 + (haut + saisie.y - H * 0.14) * vol, translate: `0 ${-(1 - pCourriel) * 300 * u}px`, scale: String(1 - vol * 0.5), opacity: Math.min(1, pCourriel * 2) * (1 - prog(t, K("collez") + 0.3, K("collez") + 0.45)) }}>
            <Courriel u={u} largeur={940 * u} />
          </div>
        ) : null}
      </Camera>
      <div style={{ position: "absolute", inset: 0, opacity: prog(t, fin - 0.18, fin, ENTREE), background: C.fond }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// 13. Une proposition reste une proposition ; le fournisseur ne valide jamais à votre place
// ---------------------------------------------------------------------------
export const GardeFou: React.FC<Props> = ({ t }) => {
  const { W, H, u, vertical } = useFormat();
  const [debut, fin] = SCENES.gardeFou;
  const bascule = P(17) - 0.3;
  const pb = prog(t, bascule, bascule + 0.55, SORTIE);
  // Héros après la proposition (élément 1826 × 1142)
  const lh = vertical ? W * 0.94 : W * (0.78 - 0.34 * pb);
  const sh = lh / 1826;
  const hh = 1142 * sh;
  const gaucheHeros = vertical ? (W - lh) / 2 : (W * (1 - 0.32 * pb) - lh) / 2;
  const hautHeros = vertical ? H * 0.5 - hh / 2 - pb * H * 0.3 : (H - hh) / 2;
  const aff = boite("hero_apres_proposition", "affiche", sh);
  const prop = boite("hero_apres_proposition", "proposition", sh);
  const pIn = prog(t, debut, debut + 0.4, SORTIE);
  // Panneau de l'assistant (garde-fou), portrait 960 × 1800
  const hp = vertical ? H * 0.62 : H * 0.9;
  const sp = hp / 1800;
  const lp = 960 * sp;
  const gaucheP = vertical ? (W - lp) / 2 : W * 0.66 - lp / 2;
  const hautP = vertical ? H - hp - H * 0.04 : (H - hp) / 2;
  const remarque = boite("assistant_panneau_gardefou", "remarque", sp);
  const liste = boite("assistant_panneau_gardefou", "liste", sp);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: gaucheHeros, top: hautHeros, width: lh, height: hh, opacity: pIn * (vertical ? 1 - pb * 0.85 : 1 - pb * 0.55), filter: pb > 0.02 ? `blur(${pb * 2}px)` : undefined, translate: `0 ${(1 - pIn) * 120 * u}px`, borderRadius: 40 * sh * 2, boxShadow: "0 50px 100px -40px rgba(34,30,69,.6)" }}>
        <Capture nom="hero_apres_proposition" s={sh} largeur={1826} hauteur={1142} style={{ borderRadius: 34 * sh * 2 }} />
        <Anneau {...aff} t={t} debut={K("proposition") - 0.1} couleur="#FFFFFF" rayon={20 * sh * 2} marge={10 * sh * 2} />
        <Anneau {...prop} t={t} debut={K("reste") - 0.05} couleur={C.ambreVif} rayon={60 * sh} marge={8 * sh * 2} />
        <div style={{ position: "absolute", left: aff.x + aff.w * (vertical ? 0.3 : 0.6), top: aff.y - (vertical ? 78 : 74) * u, ...apparition(t, K("proposition") + 0.05, 0.45) }}>
          <Pastille icone="verrou" texte="Date approuvée : inchangée" couleur={C.encre} fond="#FFFFFF" bordure="#FFFFFF" taille={(vertical ? 26 : 30) * u} />
        </div>
        <div style={{ position: "absolute", left: prop.x, top: prop.y + prop.h + 18 * u, ...apparition(t, K("reste") + 0.1, 0.45) }}>
          <Pastille icone="alerte" texte="Proposition, pas une décision" couleur="#4A2E00" fond={C.ambreVif} bordure={C.ambreVif} taille={(vertical ? 24 : 28) * u} />
        </div>
      </div>
      {t > bascule ? (
        <div style={{ position: "absolute", left: gaucheP, top: hautP, width: lp, height: hp, borderRadius: 30 * u, overflow: "hidden", translate: vertical ? `0 ${(1 - pb) * H * 0.7}px` : `${(1 - pb) * W * 0.6}px 0`, filter: pb < 0.98 ? `blur(${(1 - pb) * 12}px)` : undefined, boxShadow: "0 60px 120px -40px rgba(34,30,69,.55), 0 0 0 1px rgba(34,30,69,.08)" }}>
          <Capture nom="assistant_panneau_gardefou" s={sp} largeur={960} hauteur={1800} />
          <Anneau {...remarque} t={t} debut={K("fournisseur") - 0.1} couleur={C.ambre} rayon={18 * sp * 2} marge={4 * sp * 2} />
          <Anneau {...liste} t={t} debut={K("jamais") - 0.05} couleur={C.rouge} rayon={14 * sp * 2} marge={4 * sp * 2} />
        </div>
      ) : null}
      {t > bascule ? (
        <div style={{ position: "absolute", left: vertical ? W / 2 - 330 * u : gaucheP - 700 * u, top: vertical ? hautP - 90 * u : hautP + hp * 0.36, ...apparition(t, K("jamais") + 0.15, 0.5) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 * u, padding: `${20 * u}px ${28 * u}px`, borderRadius: 24 * u, background: C.sombre, color: "#FFFFFF", boxShadow: "0 30px 60px -20px rgba(34,30,69,.7)", maxWidth: 660 * u }}>
            <Icone nom="gardefou" taille={52 * u} couleur={C.ambreVif} />
            <span style={{ fontFamily: F.texte, fontWeight: 600, fontSize: 30 * u, lineHeight: 1.25 }}>Le fournisseur ne peut pas fermer une condition.</span>
          </div>
        </div>
      ) : null}
      <div style={{ position: "absolute", inset: 0, opacity: prog(t, fin - 0.2, fin, ENTREE), background: C.fond }} />
    </AbsoluteFill>
  );
};
