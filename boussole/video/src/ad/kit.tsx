import React from "react";
import { continueRender, delayRender, Img, staticFile } from "remotion";

// Charte Boussole (app/src/index.css)
export const NAVY = "#0F1B2D";
export const CREAM = "#F6F1EA";
export const AMBER = "#E8A33D";
export const FPS = 60;

// Police : Inter (OFL, police de l'appli), axe opsz pour le rendu « display ».
// Remplaçable par SF Pro Display en changeant FONT et les fichiers chargés ci-dessous.
export const FONT = "InterAd, 'Inter', system-ui, sans-serif";
const fontHandle = delayRender("police InterAd");
Promise.all(
  [
    ["ad/fonts/inter-latin-opsz-normal.woff2", "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"],
    ["ad/fonts/inter-latin-ext-opsz-normal.woff2", "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1E00-1E9F,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+A720-A7FF"],
  ].map(([f, range]) => {
    const face = new FontFace("InterAd", `url(${staticFile(f)}) format('woff2')`, { weight: "100 900", unicodeRange: range });
    return face.load().then((ff) => document.fonts.add(ff));
  }),
).then(() => continueRender(fontHandle));

export const display = (size: number, weight = 700, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: FONT,
  fontSize: size,
  fontWeight: weight,
  fontVariationSettings: "'opsz' 32",
  letterSpacing: "-0.022em",
  lineHeight: 1.08,
  color: CREAM,
  ...extra,
});

// ---------- temps et courbes (aucun rebond, aucun ressort) ----------
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const prog = (t: number, a: number, d: number) => clamp01((t - a) / d);
export const expoOut = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
export const expoIn = (x: number) => (x <= 0 ? 0 : Math.pow(2, 10 * x - 10));
export const cubicInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const quartOut = (x: number) => 1 - Math.pow(1 - x, 4);
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
/** vitesse (px par image) d'une position définie par une fonction du temps */
export const vel = (fn: (t: number) => number, t: number) => fn(t) - fn(t - 1 / FPS);

// ---------- flou de mouvement directionnel (filtre SVG) ----------
let blurSeq = 0;
export const DirBlur: React.FC<{ sx: number; sy: number; style?: React.CSSProperties; inline?: boolean; children: React.ReactNode }> = ({ sx, sy, style, inline, children }) => {
  const id = React.useMemo(() => `db${blurSeq++}`, []);
  const on = sx > 0.15 || sy > 0.15;
  return (
    <>
      {on && (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={id} x="-30%" y="-60%" width="160%" height="220%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={`${Math.min(sx, 60).toFixed(2)} ${Math.min(sy, 60).toFixed(2)}`} />
          </filter>
        </svg>
      )}
      <div style={{ display: inline ? "inline-block" : "block", filter: on ? `url(#${id})` : undefined, ...style }}>{children}</div>
    </>
  );
};

// ---------- mot qui monte à travers une fente ----------
export const SlitWord: React.FC<{ text: string; t: number; at: number; dur?: number; color?: string; out?: number; outDur?: number; style?: React.CSSProperties }> = ({
  text, t, at, dur = 0.42, color, out, outDur = 0.22, style,
}) => {
  const y = (tt: number) => {
    const inn = (1 - expoOut(prog(tt, at, dur))) * 112;
    const o = out !== undefined ? -expoIn(prog(tt, out, outDur)) * 112 : 0;
    return inn + o;
  };
  const v = Math.abs(vel(y, t));
  return (
    <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: "0.12em", marginBottom: "-0.12em", paddingRight: "0.02em" }}>
      <DirBlur inline sx={0} sy={v * 0.09 * 10} style={{ transform: `translateY(${y(t)}%)`, color, ...style }}>
        {text}
      </DirBlur>
    </span>
  );
};

// ---------- logo (app/src/components/Demo.tsx → Logo), animable ----------
export const LogoMark: React.FC<{ size: number; needleW?: number; needleLen?: number; ring?: number; color?: string }> = ({
  size, needleW = 4, needleLen = 1, ring = 1, color = AMBER,
}) => {
  const top = 16 - 11 * needleLen, bot = 16 + 11 * needleLen;
  const circ = 2 * Math.PI * 14;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ overflow: "visible", display: "block" }}>
      <circle cx="16" cy="16" r="14" fill="none" stroke={color} strokeWidth="2" strokeDasharray={circ} strokeDashoffset={circ * (1 - ring)} transform="rotate(-90 16 16)" strokeLinecap="round" />
      <path d={`M16 ${top} L${16 + needleW} 16 L16 ${bot} L${16 - needleW} 16 Z`} fill={color} />
    </svg>
  );
};

// ---------- fond : bleu nuit, lueur ambre qui dérive, grain fin ----------
export const Stage: React.FC<{ t: number; w: number; h: number; freezeGrain?: boolean }> = ({ t, w, h, freezeGrain }) => {
  const gx = w * (0.62 + 0.1 * Math.sin(t * 0.21) + 0.04 * Math.sin(t * 0.53 + 1));
  const gy = h * (0.42 + 0.12 * Math.cos(t * 0.17) + 0.03 * Math.sin(t * 0.61));
  const g2x = w * (0.22 + 0.08 * Math.cos(t * 0.13 + 2)), g2y = h * (0.78 + 0.06 * Math.sin(t * 0.19));
  const f = freezeGrain ? 7 : Math.floor(t * FPS);
  const ox = (f * 137) % 1024, oy = (f * 251) % 1024;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: NAVY }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(${w * 0.55}px ${h * 0.6}px at ${gx}px ${gy}px, rgba(232,163,61,0.17), rgba(232,163,61,0.05) 45%, rgba(232,163,61,0) 70%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(${w * 0.45}px ${h * 0.45}px at ${g2x}px ${g2y}px, rgba(232,163,61,0.07), rgba(232,163,61,0) 70%)` }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(4,8,16,0.55) 100%)" }} />
      <Grain ox={ox} oy={oy} />
    </>
  );
};
export const Grain: React.FC<{ ox: number; oy: number }> = ({ ox, oy }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", mixBlendMode: "overlay", opacity: 0.07, pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: -ox, top: -oy, width: 3072, height: 2048, display: "flex", flexWrap: "wrap" }}>
      {[0, 1, 2, 3, 4, 5].map((i) => <Img key={i} src={staticFile("ad/grain.png")} style={{ width: 1024, height: 1024, display: "block" }} />)}
    </div>
  </div>
);

// ---------- panneau d'interface réelle (capture /demo 1280x800 @2x) ----------
export const UI_W = 1280, UI_H = 800;
export type Box = number[];
export const Panel: React.FC<{
  src: string; s: number; x: number; y: number; rx?: number; ry?: number; blur?: number; dim?: number; opacity?: number;
  bx?: number; by?: number; overlays?: React.ReactNode; xfade?: { src: string; k: number };
}> = ({ src, s, x, y, rx = 0, ry = 0, blur = 0, dim = 0, opacity = 1, bx = 0, by = 0, overlays, xfade }) => (
  <div style={{ position: "absolute", inset: 0, perspective: 2400, perspectiveOrigin: "50% 45%", opacity }}>
    <DirBlur sx={bx} sy={by} style={{ position: "absolute", inset: 0 }}>
      <div
        style={{
          position: "absolute", left: x, top: y, width: UI_W * s, height: UI_H * s,
          transform: `rotateX(${rx}deg) rotateY(${ry}deg)`, transformOrigin: "50% 50%",
          borderRadius: 16, overflow: "hidden",
          boxShadow: "0 50px 140px rgba(0,0,0,0.6), 0 0 0 1px rgba(246,241,234,0.10)",
          filter: blur > 0.1 || dim > 0.01 ? `blur(${blur}px) brightness(${1 - dim})` : undefined,
        }}
      >
        <Img src={staticFile(`ad/rec/${src}.png`)} style={{ width: "100%", height: "100%", display: "block" }} />
        {xfade && xfade.k > 0 && <Img src={staticFile(`ad/rec/${xfade.src}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: xfade.k }} />}
        <div style={{ position: "absolute", left: 0, top: 0, width: UI_W, height: UI_H, transform: `scale(${s})`, transformOrigin: "0 0" }}>{overlays}</div>
      </div>
    </DirBlur>
  </div>
);

/** onde ambre unique à l'endroit d'un vrai clic (coordonnées CSS de la capture) */
export const ClickRing: React.FC<{ t: number; at: number; box: Box; scale?: number }> = ({ t, at, box, scale = 1 }) => {
  const k = prog(t, at - 0.04, 0.55);
  if (k <= 0 || k >= 1) return null;
  const cx = box[0] + box[2] / 2, cy = box[1] + box[3] / 2;
  const r = lerp(8, 44, expoOut(k)) * scale;
  return (
    <>
      <div style={{ position: "absolute", left: cx - r, top: cy - r, width: 2 * r, height: 2 * r, borderRadius: "50%", border: `${3 * scale}px solid ${AMBER}`, opacity: 1 - k }} />
      <div style={{ position: "absolute", left: cx - 7, top: cy - 7, width: 14, height: 14, borderRadius: "50%", background: AMBER, opacity: (1 - prog(t, at, 0.18)) * 0.9 }} />
    </>
  );
};

/** contour ambre qui se dessine autour d'une zone réelle */
export const Outline: React.FC<{ t: number; at: number; box: Box; until?: number; pad?: number }> = ({ t, at, box, until = 99, pad = 4 }) => {
  const k = expoOut(prog(t, at, 0.4)) * (1 - prog(t, until, 0.2));
  if (k <= 0) return null;
  const [x, y, w, h] = [box[0] - pad, box[1] - pad, box[2] + 2 * pad, box[3] + 2 * pad];
  const per = 2 * (w + h);
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill="rgba(232,163,61,0.10)" fillOpacity={k} stroke={AMBER} strokeWidth={2.5} strokeDasharray={per} strokeDashoffset={per * (1 - k)} />
    </svg>
  );
};

/** loupe : agrandissement net d'une zone de la vraie capture (le panneau entier, bandeau compris, reste dans le cadre) */
export const Loupe: React.FC<{ t: number; at: number; until: number; src: string; crop: Box; zoom: number; x: number; y: number }> = ({ t, at, until, src, crop, zoom, x, y }) => {
  const kin = expoOut(prog(t, at, 0.32)), kout = expoIn(prog(t, until - 0.18, 0.18));
  if (kin <= 0 || kout >= 1) return null;
  const sy = (1 - kin) * 30 + kout * -20;
  const b = Math.abs(vel((tt) => (1 - expoOut(prog(tt, at, 0.32))) * 30, t)) * 0.8;
  return (
    <DirBlur sx={0} sy={b} style={{ position: "absolute", left: x, top: y + sy, opacity: kin * (1 - kout), transform: `scale(${0.94 + 0.06 * kin})`, transformOrigin: "50% 50%" }}>
      <div style={{ width: crop[2] * zoom, height: crop[3] * zoom, overflow: "hidden", borderRadius: 14, position: "relative", boxShadow: `0 30px 80px rgba(0,0,0,0.55), 0 0 0 2px ${AMBER}` }}>
        <Img src={staticFile(`ad/rec/${src}.png`)} style={{ position: "absolute", width: UI_W * zoom, height: UI_H * zoom, left: -crop[0] * zoom, top: -crop[1] * zoom, maxWidth: "none" }} />
      </div>
    </DirBlur>
  );
};

/** étiquette (pas une pastille qui rebondit) : un filet ambre se trace, le texte se révèle de gauche à droite */
export const Tag: React.FC<{ t: number; at: number; until: number; text: string; x: number; y: number; size?: number }> = ({ t, at, until, text, x, y, size = 26 }) => {
  const k = expoOut(prog(t, at, 0.45)), ko = expoIn(prog(t, until - 0.2, 0.2));
  if (k <= 0 || ko >= 1) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: 1 - ko, display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 54 * k, height: 3, background: AMBER, borderRadius: 2 }} />
      <div style={{ clipPath: `inset(-20% ${100 - 100 * k}% -20% 0)`, background: "rgba(15,27,45,0.92)", border: "1px solid rgba(232,163,61,0.45)", borderRadius: 10, padding: "12px 20px", fontFamily: FONT, fontVariationSettings: "'opsz' 20", fontWeight: 650, fontSize: size, letterSpacing: "0.14em", color: AMBER, whiteSpace: "nowrap" }}>
        {text}
      </div>
    </div>
  );
};
