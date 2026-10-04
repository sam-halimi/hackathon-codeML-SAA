// Spot NOVA : assemblage des scènes sur le minutage de la voix.
// Une seule source pour les deux formats (16:9 et 9:16) : chaque scène adapte sa mise en page.
import React from "react";
import { AbsoluteFill } from "remotion";
import "./theme";
import { NomScene, SCENES } from "./temps";
import { FondPapier, FondSombre, Grain, useT } from "./ui";
import { Avalanche, CinqMinutes, Dates, FauxVert, Facture, Horloge, QuiCroire, Rebours } from "./scenes/Douleur";
import { Contradictions, Logo, Preuve, UnEcran } from "./scenes/Solution";
import { Assistant, GardeFou } from "./scenes/Assistant";
import { Carton, LogoFinal } from "./scenes/Fin";

const RENDUS: Record<NomScene, React.FC<{ t: number }>> = {
  horloge: Horloge,
  rebours: Rebours,
  avalanche: Avalanche,
  vert: FauxVert,
  dates: Dates,
  facture: Facture,
  quiCroire: QuiCroire,
  cinq: CinqMinutes,
  logo: Logo,
  ecran: UnEcran,
  preuve: Preuve,
  contradictions: Contradictions,
  assistant: Assistant,
  gardeFou: GardeFou,
  final: LogoFinal,
  carton: Carton,
};
const NOMS = Object.keys(SCENES) as NomScene[];

export const NovaSpot: React.FC = () => {
  const t = useT();
  const papier = t >= SCENES.logo[0] + 0.6 && t < SCENES.carton[0];
  const sombre = t < SCENES.logo[0] + 0.7 || t >= SCENES.carton[0];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {sombre ? <FondSombre t={t} intensite={t >= SCENES.quiCroire[0] && t < SCENES.logo[0] ? 0.35 : 1} /> : null}
      {papier ? <FondPapier t={t} /> : null}
      {NOMS.map((nom) => {
        const [a, b] = SCENES[nom];
        if (t < a || t >= b) return null;
        const Rendu = RENDUS[nom];
        return <Rendu key={nom} t={t} />;
      })}
      <Grain opacite={papier ? 0.05 : 0.09} />
    </AbsoluteFill>
  );
};
