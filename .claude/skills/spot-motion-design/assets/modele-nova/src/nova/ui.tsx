// Composants partagés du film NOVA : fonds, grain, étoile, texte cinétique, curseur, surlignages,
// cadre de navigateur, captures positionnées et caméra.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, ICONES } from "./theme";
import { alea, camera, Cle, prog, RESSORT, SORTIE, tw } from "./temps";
import boites from "./boites.json";

export const B = boites as Record<string, Record<string, { x: number; y: number; w: number; h: number }>>;

/** Format courant : largeur, hauteur, vertical (9:16) ou non, et unité relative au petit côté. */
export function useFormat() {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  return { W: width, H: height, vertical, u: Math.min(width, height) / 1080 };
}

/** Temps global en secondes. */
export function useT() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
}

export const Icone: React.FC<{ nom: string; taille: number; couleur?: string; trait?: number; style?: React.CSSProperties }> = ({ nom, taille, couleur, trait, style }) => (
  <svg
    viewBox="0 0 24 24"
    width={taille}
    height={taille}
    fill="none"
    stroke={couleur || "currentColor"}
    strokeWidth={trait || 2}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flex: "none", color: couleur, ...style }}
    dangerouslySetInnerHTML={{ __html: ICONES[nom] }}
  />
);

/** Scène sombre indigo : dégradé profond, grille qui dérive lentement, vignette. */
export const FondSombre: React.FC<{ t: number; intensite?: number }> = ({ t, intensite = 1 }) => {
  const { W, H, u } = useFormat();
  const pas = 84 * u;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 70% at 50% 42%, #2F2970 0%, #1C1844 46%, ${C.sombreProfond} 100%)` }}>
      <AbsoluteFill
        style={{
          opacity: 0.55 * intensite,
          backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
          backgroundSize: `${pas}px ${pas}px`,
          backgroundPosition: `${(-t * 6 * u) % pas}px ${(-t * 10 * u) % pas}px`,
          maskImage: "radial-gradient(ellipse 70% 65% at 50% 45%, #000 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 65% at 50% 45%, #000 30%, transparent 100%)",
        }}
      />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse ${W > H ? "75% 85%" : "95% 70%"} at 50% 50%, transparent 55%, rgba(8,6,20,.75) 100%)` }} />
    </AbsoluteFill>
  );
};

/** Scène papier : fond chaud, halo central, grille très légère. */
export const FondPapier: React.FC<{ t: number }> = ({ t }) => {
  const { u } = useFormat();
  const pas = 84 * u;
  return (
    <AbsoluteFill style={{ background: C.fond }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 65% 60% at 50% 45%, rgba(255,255,255,.85) 0%, rgba(255,255,255,0) 70%)" }} />
      <AbsoluteFill
        style={{
          opacity: 0.6,
          backgroundImage: `linear-gradient(rgba(29,26,54,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(29,26,54,.035) 1px, transparent 1px)`,
          backgroundSize: `${pas}px ${pas}px`,
          backgroundPosition: `${(-t * 5 * u) % pas}px ${(-t * 8 * u) % pas}px`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Grain de film : une texture décalée à chaque image (aucun coût de calcul). */
export const Grain: React.FC<{ opacite: number }> = ({ opacite }) => {
  const frame = useCurrentFrame();
  const n = Math.floor(frame / 2);
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: opacite,
        mixBlendMode: "overlay",
        backgroundImage: `url(${staticFile("texture/grain.png")})`,
        backgroundSize: "512px 512px",
        backgroundPosition: `${Math.floor(alea(n) * 512)}px ${Math.floor(alea(n + 99) * 512)}px`,
      }}
    />
  );
};

/** L'étoile NOVA, avec une lueur douce (réservée à la marque). */
export const Etoile: React.FC<{ taille: number; couleur?: string; lueur?: number; style?: React.CSSProperties }> = ({ taille, couleur = C.accent, lueur = 0, style }) => (
  <svg
    viewBox="0 0 24 24"
    width={taille}
    height={taille}
    style={{ overflow: "visible", filter: lueur ? `drop-shadow(0 0 ${taille * 0.12 * lueur}px rgba(79,70,229,${0.55 * lueur})) drop-shadow(0 0 ${taille * 0.35 * lueur}px rgba(139,92,246,${0.35 * lueur}))` : undefined, ...style }}
  >
    <path d="M12 1.5c.55 5.2 3.3 8 10.5 10.5-7.2 2.5-9.95 5.3-10.5 10.5-.55-5.2-3.3-8-10.5-10.5C8.7 9.5 11.45 6.7 12 1.5z" fill={couleur} />
  </svg>
);

/** Texte cinétique : chaque mot monte d'un masque, en léger décalé, avec un flou qui se dissipe. */
export const Mots: React.FC<{ texte: string; t: number; debut: number; ecart?: number; duree?: number; style?: React.CSSProperties; motStyle?: (i: number, mot: string) => React.CSSProperties | undefined }> = ({ texte, t, debut, ecart = 0.07, duree = 0.55, style, motStyle }) => {
  const mots = texte.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: "0.26em", ...style }}>
      {mots.map((m, i) => {
        const p = prog(t, debut + i * ecart, debut + i * ecart + duree);
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", padding: "0.06em 0.04em 0.12em", margin: "-0.06em -0.04em -0.12em" }}>
            <span
              style={{
                display: "inline-block",
                translate: `0 ${(1 - p) * 105}%`,
                opacity: Math.min(1, p * 1.6),
                filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined,
                ...(motStyle ? motStyle(i, m) : undefined),
              }}
            >
              {m}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Curseur (flèche) avec ombre ; clic = léger enfoncement et onde. */
export const Curseur: React.FC<{ x: number; y: number; taille: number; clic?: number; t: number; opacite?: number }> = ({ x, y, taille, clic, t, opacite = 1 }) => {
  const enfonce = clic !== undefined ? 1 - 0.18 * Math.max(0, 1 - Math.abs(t - clic) / 0.12) : 1;
  const onde = clic !== undefined ? prog(t, clic, clic + 0.55) : 0;
  return (
    <>
      {clic !== undefined && onde > 0 && onde < 1 ? (
        <div
          style={{
            position: "absolute",
            left: x - taille * 1.4 * onde,
            top: y - taille * 1.4 * onde,
            width: taille * 2.8 * onde,
            height: taille * 2.8 * onde,
            borderRadius: "50%",
            border: `${Math.max(2, taille * 0.08)}px solid rgba(79,70,229,${0.8 * (1 - onde)})`,
            background: `rgba(79,70,229,${0.18 * (1 - onde)})`,
          }}
        />
      ) : null}
      <svg
        viewBox="0 0 24 24"
        width={taille}
        height={taille}
        style={{ position: "absolute", left: x - taille * 0.18, top: y - taille * 0.1, opacity: opacite, scale: String(enfonce), transformOrigin: "20% 10%", filter: "drop-shadow(0 6px 10px rgba(20,16,50,.35))" }}
      >
        <path d="M4.5 2.5 19 12.2l-6.6 1.3-3.7 6.3z" fill="#fff" stroke={C.encre} strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
    </>
  );
};

/** Anneau de surlignage dessiné autour d'une zone (coordonnées déjà à l'échelle). */
export const Anneau: React.FC<{ x: number; y: number; w: number; h: number; t: number; debut: number; couleur?: string; rayon?: number; epaisseur?: number; marge?: number; fin?: number }> = ({ x, y, w, h, t, debut, couleur = C.accent, rayon = 18, epaisseur = 4, marge = 10, fin }) => {
  const p = prog(t, debut, debut + 0.45);
  const sortie = fin !== undefined ? 1 - prog(t, fin, fin + 0.3) : 1;
  if (p <= 0 || sortie <= 0) return null;
  const X = x - marge, Y = y - marge, L = w + 2 * marge, Hh = h + 2 * marge;
  const perimetre = 2 * (L + Hh);
  const pulse = 0.5 + 0.5 * Math.sin((t - debut) * 7);
  return (
    <svg style={{ position: "absolute", left: X - 20, top: Y - 20, width: L + 40, height: Hh + 40, overflow: "visible", opacity: sortie }}>
      <rect x={20} y={20} width={L} height={Hh} rx={rayon} fill={couleur} fillOpacity={0.07 * p} />
      <rect
        x={20}
        y={20}
        width={L}
        height={Hh}
        rx={rayon}
        fill="none"
        stroke={couleur}
        strokeWidth={epaisseur}
        strokeDasharray={perimetre}
        strokeDashoffset={perimetre * (1 - p)}
        style={{ filter: `drop-shadow(0 0 ${6 + 8 * pulse}px ${couleur})` }}
      />
    </svg>
  );
};

/** Fenêtre de navigateur sobre (barre claire, trois points, adresse). */
export const Fenetre: React.FC<{ largeur: number; hauteur: number; adresse?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ largeur, hauteur, adresse = "nova-projet360.vercel.app", children, style }) => {
  const barre = Math.round(largeur * 0.028);
  return (
    <div
      style={{
        position: "absolute",
        width: largeur,
        height: hauteur + barre,
        borderRadius: largeur * 0.014,
        overflow: "hidden",
        background: C.surface,
        boxShadow: "0 2px 6px rgba(34,30,69,.08), 0 50px 110px -40px rgba(34,30,69,.55), 0 0 0 1px rgba(34,30,69,.06)",
        ...style,
      }}
    >
      <div style={{ height: barre, display: "flex", alignItems: "center", gap: barre * 0.28, padding: `0 ${barre * 0.6}px`, background: "#EFEAE0", borderBottom: "1px solid #E3DCCE" }}>
        {["#E7695F", "#E8B34A", "#5DBA6A"].map((c) => (
          <span key={c} style={{ width: barre * 0.32, height: barre * 0.32, borderRadius: "50%", background: c, opacity: 0.85 }} />
        ))}
        <span style={{ marginLeft: barre * 0.5, flex: 1, height: barre * 0.58, borderRadius: barre, background: "#FFFDF8", display: "flex", alignItems: "center", paddingLeft: barre * 0.5, fontFamily: F.mono, fontSize: barre * 0.36, color: C.encre2 }}>
          {adresse}
        </span>
      </div>
      <div style={{ position: "relative", width: largeur, height: hauteur, overflow: "hidden" }}>{children}</div>
    </div>
  );
};

/** Capture de l'application, affichée à une échelle donnée (s = pixels écran par pixel d'image). */
export const Capture: React.FC<{ nom: string; s: number; largeur: number; hauteur: number; style?: React.CSSProperties }> = ({ nom, s, largeur, hauteur, style }) => (
  <Img src={staticFile(`captures/${nom}.png`)} style={{ position: "absolute", left: 0, top: 0, width: largeur * s, height: hauteur * s, ...style }} />
);

/** Boîte d'un élément dans une capture, mise à l'échelle. */
export function boite(capture: string, cle: string, s: number) {
  const b = B[capture] && B[capture][cle];
  if (!b) return { x: 0, y: 0, w: 0, h: 0 };
  return { x: b.x * s, y: b.y * s, w: b.w * s, h: b.h * s };
}

/** Plan caméra : le contenu (monde) est cadré sur un point avec un zoom ; flou de mouvement si ça va vite. */
export const Camera: React.FC<{ t: number; cles: Cle[]; children: React.ReactNode; flou?: boolean }> = ({ t, cles, children, flou = true }) => {
  const { W, H } = useFormat();
  const c = camera(t, cles);
  const avant = camera(t - 1 / 60, cles);
  const vitesse = Math.hypot((c.x - avant.x) * c.z, (c.y - avant.y) * c.z) + Math.abs(Math.log(c.z / avant.z)) * W * 0.5;
  const rayon = flou ? Math.min(7, Math.max(0, (vitesse - 6) * 0.22)) : 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: W,
          height: H,
          transformOrigin: "0 0",
          transform: `translate(${W / 2 - c.x * c.z}px, ${H / 2 - c.y * c.z}px) scale(${c.z})`,
          filter: rayon > 0.3 ? `blur(${rayon}px)` : undefined,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** Pastille (étiquette ronde) : icône + texte. */
export const Pastille: React.FC<{ icone?: string; texte: string; couleur: string; fond: string; taille: number; style?: React.CSSProperties; bordure?: string }> = ({ icone, texte, couleur, fond, taille, style, bordure }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: taille * 0.45,
      padding: `${taille * 0.42}px ${taille * 0.9}px ${taille * 0.42}px ${icone ? taille * 0.7 : taille * 0.9}px`,
      borderRadius: 999,
      background: fond,
      color: couleur,
      border: `${Math.max(1.5, taille * 0.07)}px solid ${bordure || couleur}`,
      fontFamily: F.texte,
      fontWeight: 600,
      fontSize: taille,
      lineHeight: 1.1,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {icone ? <Icone nom={icone} taille={taille * 1.15} couleur={couleur} /> : null}
    {texte}
  </div>
);

/** Apparition « ressort » (échelle et opacité) à partir d'un instant. */
export const apparition = (t: number, debut: number, duree = 0.5) => {
  const p = prog(t, debut, debut + duree, RESSORT);
  return { opacity: Math.min(1, prog(t, debut, debut + duree * 0.5)), scale: String(0.85 + 0.15 * p) };
};

/** Tremblement (secousse) amorti autour d'un instant. */
export function secousse(t: number, instant: number, force: number, duree = 0.35) {
  const p = (t - instant) / duree;
  if (p < 0 || p > 1) return { x: 0, y: 0 };
  const a = force * (1 - p) * (1 - p);
  const n = Math.floor(t * 60);
  return { x: (alea(n) - 0.5) * 2 * a, y: (alea(n + 7) - 0.5) * 2 * a };
}

export { tw, prog, SORTIE };
