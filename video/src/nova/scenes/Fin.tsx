// Acte 4 : la promesse, puis le carton de fin (environ deux secondes).
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F } from "../theme";
import { ENTREE, K, prog, RESSORT, SCENES, SORTIE } from "../temps";
import { Etoile, Mots, useFormat } from "../ui";

type Props = { t: number };

export const LogoFinal: React.FC<Props> = ({ t }) => {
  const { u, vertical } = useFormat();
  const [debut] = SCENES.final;
  const pE = prog(t, K("nova_fin") - 0.2, K("nova_fin") + 0.5, RESSORT);
  const pN = prog(t, K("nova_fin") - 0.05, K("nova_fin") + 0.45, SORTIE);
  const pU = prog(t, K("cinq_minutes_fin") + 0.25, K("cinq_minutes_fin") + 0.75, SORTIE);
  const respire = 1 + 0.015 * Math.sin((t - debut) * 2.2);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: prog(t, debut, debut + 0.25) }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 * u, scale: String(respire) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 * u }}>
          <div style={{ scale: String(pE), rotate: `${(1 - pE) * -50}deg` }}>
            <Etoile taille={150 * u} lueur={0.9} />
          </div>
          <span style={{ fontFamily: F.titre, fontWeight: 600, fontSize: 168 * u, color: C.encre, letterSpacing: "-0.035em", lineHeight: 1, clipPath: `inset(0 ${(1 - pN) * 100}% 0 0)` }}>NOVA</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 * u, maxWidth: vertical ? 980 * u : undefined }}>
          <Mots texte="Reprenez n'importe quel projet" t={t} debut={K("reprenez") - 0.1} ecart={0.09} style={{ fontFamily: F.titre, fontWeight: 600, fontSize: (vertical ? 78 : 80) * u, color: C.encre, letterSpacing: "-0.02em", lineHeight: 1.1 }} />
          <Mots texte="en cinq minutes." t={t} debut={K("cinq_minutes_fin") - 0.42} ecart={0.12} style={{ fontFamily: F.titre, fontStyle: "italic", fontWeight: 400, fontSize: 100 * u, color: C.accent, lineHeight: 1.1, textShadow: `0 0 ${30 * u}px rgba(79,70,229,.25)` }} />
        </div>
        <div style={{ marginTop: 10 * u, display: "flex", alignItems: "center", gap: 14 * u, padding: `${14 * u}px ${30 * u}px`, borderRadius: 999, background: C.surface, border: `1.5px solid ${C.filet}`, boxShadow: "0 20px 40px -24px rgba(34,30,69,.4)", opacity: pU, translate: `0 ${(1 - pU) * 30 * u}px` }}>
          <Etoile taille={30 * u} />
          <span style={{ fontFamily: F.mono, fontWeight: 500, fontSize: 32 * u, color: C.encre }}>nova-projet360.vercel.app</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Carton de fin animé : crédit du projet (adapté du gabarit « made by »). */
export const Carton: React.FC<Props> = ({ t }) => {
  const { u } = useFormat();
  const [debut, fin] = SCENES.carton;
  const scintille = 0.75 + 0.25 * Math.sin((t - debut) * 9);
  const noir = prog(t, fin - 0.35, fin, ENTREE);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 * u }}>
        <div style={{ scale: String(prog(t, debut, debut + 0.5, RESSORT)), rotate: `${(t - debut) * 40}deg`, opacity: scintille }}>
          <Etoile taille={64 * u} couleur="#FFFFFF" lueur={1.2} />
        </div>
        <div style={{ fontFamily: F.mono, fontWeight: 500, fontSize: 26 * u, letterSpacing: "0.32em", color: C.sombreDoux, textTransform: "uppercase", opacity: prog(t, debut + 0.05, debut + 0.4) }}>réalisé par</div>
        <Mots texte="l'équipe Projet 360" t={t} debut={debut + 0.12} ecart={0.08} style={{ fontFamily: F.titre, fontWeight: 600, fontSize: 104 * u, color: "#FFFFFF", letterSpacing: "-0.02em", lineHeight: 1.05 }} />
        <div style={{ fontFamily: F.texte, fontSize: 32 * u, color: C.sombreTexte, opacity: prog(t, debut + 0.45, debut + 0.85), letterSpacing: "0.02em" }}>Hackathon CodeML · Poly AI · 2026</div>
      </div>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${noir})` }} />
    </AbsoluteFill>
  );
};
