// Charte NOVA « Papier & indigo », reprise de l'application (projet360/app/styles.css).
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const C = {
  fond: "#F6F3EC",
  surface: "#FFFDF8",
  encre: "#1D1A36",
  encre2: "#57526E",
  encre3: "#8E889E",
  filet: "#E3DCCE",
  sombre: "#221E45",
  sombreProfond: "#120F28",
  sombreTexte: "#DCD9F0",
  sombreDoux: "#A9A4D0",
  sombreEm: "#C4BFEC",
  accent: "#4F46E5",
  accentFonce: "#3D35C4",
  accentPale: "#EEEDFC",
  violet: "#8B5CF6",
  rouge: "#A3221A",
  rougeVif: "#FF6B5E",
  rougeFond: "#FCEFEA",
  vert: "#15693F",
  vertVif: "#3DDC8C",
  vertFond: "#ECF5EC",
  ambre: "#7E4B00",
  ambreVif: "#FFC966",
};

export const F = {
  titre: '"Fraunces", Georgia, serif',
  texte: '"Source Sans 3", system-ui, sans-serif',
  mono: '"Source Code Pro", ui-monospace, monospace',
};

// Polices de la marque (licence SIL OFL, public/fonts/OFL.txt), chargées avant chaque image.
loadFont({ family: "Fraunces", url: staticFile("fonts/fraunces-latin-600-normal.woff2"), weight: "600", style: "normal" });
loadFont({ family: "Fraunces", url: staticFile("fonts/fraunces-latin-400-italic.woff2"), weight: "400", style: "italic" });
loadFont({ family: "Source Sans 3", url: staticFile("fonts/source-sans-3-latin-400-normal.woff2"), weight: "400", style: "normal" });
loadFont({ family: "Source Sans 3", url: staticFile("fonts/source-sans-3-latin-400-italic.woff2"), weight: "400", style: "italic" });
loadFont({ family: "Source Sans 3", url: staticFile("fonts/source-sans-3-latin-600-normal.woff2"), weight: "600", style: "normal" });
loadFont({ family: "Source Code Pro", url: staticFile("fonts/source-code-pro-latin-500-normal.woff2"), weight: "500", style: "normal" });

// Icônes Lucide (licence ISC) utilisées dans le film, et l'étoile NOVA.
export const ICONES: Record<string, string> = {
  nova: '<path d="M12 1.5c.55 5.2 3.3 8 10.5 10.5-7.2 2.5-9.95 5.3-10.5 10.5-.55-5.2-3.3-8-10.5-10.5C8.7 9.5 11.45 6.7 12 1.5z" fill="currentColor" stroke="none"/>',
  mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
  texte: '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  tableur: '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  facture: '<path d="M12 17V7"/><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8"/><path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z"/>',
  pdf: '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/>',
  bouclier: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  verrou: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  coche: '<path d="M20 6 9 17l-5-5"/>',
  interdit: '<circle cx="12" cy="12" r="10"/><path d="M4.929 4.929 19.07 19.071"/>',
  etincelles: '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
  alerte: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  marteau: '<path d="m14 13-8.381 8.38a1 1 0 0 1-3.001-3l8.384-8.381"/><path d="m16 16 6-6"/><path d="m21.5 10.5-8-8"/><path d="m8 8 6-6"/><path d="m8.5 7.5 8 8"/>',
  calendrier: '<path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M8 13h.01"/><path d="M12 13h.01"/><path d="M16 13h.01"/><path d="M8 17h.01"/><path d="M12 17h.01"/><path d="M16 17h.01"/>',
  valide: '<circle cx="12" cy="12" r="10"/><path d="m16 9-5.5 5.5L8 12"/>',
  croix: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  gardefou: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  bulle: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
};
