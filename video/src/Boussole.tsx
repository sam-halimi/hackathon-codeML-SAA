import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Clip démo muet de 40 s. Tous les plans d'interface viennent de l'enregistrement
// réel de l'application (public/rec/demo.webm, capturé avec Playwright).
const NAVY = "#0F1B2D";
const CREAM = "#F6F1EA";
const AMBER = "#E8A33D";
const ALERT = "#C8553D";
const FONT = "Inter, 'DejaVu Sans', system-ui, sans-serif";
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);

type Shot = {
  from: number; // secondes dans le clip
  dur: number;
  src: number; // secondes dans l'enregistrement
  caption: string;
  zoom?: [number, number]; // échelle début -> fin
  origin?: string; // transform-origin
  pill?: string;
};

const SHOTS: Shot[] = [
  { from: 3, dur: 4.5, src: 2.5, caption: "Elle consent étape par étape. Elle peut refuser, et décider plus tard.", zoom: [1, 1.12], origin: "50% 30%" },
  { from: 7.5, dur: 4, src: 7, caption: "30 h depuis les faits. Substance soupçonnée.", zoom: [1.05, 1.15], origin: "30% 30%" },
  { from: 11.5, dur: 4, src: 11.5, caption: "Moteur de règles, pas d'IA : les délais se recalculent.", zoom: [1, 1.08], origin: "50% 40%", pill: "RÈGLES · PAS D'IA" },
  { from: 15.5, dur: 4.5, src: 17.6, caption: "Ce que l'IA voit : jamais son nom.", zoom: [1.1, 1.35], origin: "20% 45%", pill: "PSEUDONYMISATION" },
  { from: 20, dur: 6, src: 22.3, caption: "Chaque ligne cite sa source. Le trou de mémoire est signalé sans jugement.", zoom: [1, 1.1], origin: "75% 50%", pill: "IA · SUGGESTIONS" },
  { from: 26, dur: 3, src: 28.5, caption: "L'IA est une secrétaire, jamais un juge. L'humain valide.", zoom: [1.15, 1.2], origin: "75% 85%" },
  { from: 29, dur: 6, src: 32, caption: "Journal chaîné SHA-256 : toute retouche se voit.", zoom: [1, 1.1], origin: "50% 40%" },
];

const Caption: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", bottom: 60, width: "100%", display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ background: "rgba(15,27,45,0.88)", color: CREAM, fontFamily: FONT, fontSize: 44, fontWeight: 600, padding: "18px 34px", borderRadius: 14, maxWidth: 1500, textAlign: "center" }}>
        {text}
      </div>
    </div>
  );
};

const Pill: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = spring({ frame: frame - 6, fps, config: { damping: 14 } });
  return (
    <div style={{ position: "absolute", top: 70, right: 70, transform: `scale(${sc})`, background: AMBER, color: NAVY, fontFamily: FONT, fontWeight: 800, fontSize: 30, padding: "12px 24px", borderRadius: 999, letterSpacing: 1 }}>
      {text}
    </div>
  );
};

const UiShot: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const [z0, z1] = shot.zoom ?? [1, 1];
  const scale = interpolate(frame, [0, s(shot.dur)], [z0, z1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: NAVY }}>
      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: shot.origin ?? "50% 50%" }}>
        <OffthreadVideo src={staticFile("rec/demo.webm")} trimBefore={s(shot.src)} muted style={{ width: "100%", height: "100%" }} />
      </AbsoluteFill>
      {shot.pill && <Pill text={shot.pill} />}
      <Caption text={shot.caption} />
    </AbsoluteFill>
  );
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const l1 = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" });
  const l2 = interpolate(frame, [30, 45], [0, 1], { extrapolateRight: "clamp" });
  const red = interpolate(frame, [55, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const out = interpolate(frame, [80, 90], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: NAVY, justifyContent: "center", alignItems: "center", fontFamily: FONT, color: CREAM, opacity: out }}>
      <div style={{ fontSize: 150, fontWeight: 800, color: AMBER, opacity: l1, fontVariantNumeric: "tabular-nums" }}>3:00</div>
      <div style={{ fontSize: 64, fontWeight: 700, marginTop: 30, opacity: l2 }}>
        La preuve a une date d'
        <span style={{ color: `rgb(${interpolate(red, [0, 1], [246, 200])},${interpolate(red, [0, 1], [241, 85])},${interpolate(red, [0, 1], [234, 61])})` }}>expiration</span>.
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const needle = interpolate(spring({ frame, fps, config: { damping: 9 } }), [0, 1], [-140, 0]);
  const fade = interpolate(frame, [15, 30], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: NAVY, fontFamily: FONT, color: CREAM, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 120 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <svg width="130" height="130" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="none" stroke={AMBER} strokeWidth="1.6" />
            <path d="M16 5 L20 16 L16 27 L12 16 Z" fill={AMBER} style={{ transform: `rotate(${needle}deg)`, transformOrigin: "16px 16px" }} />
          </svg>
          <div style={{ fontSize: 120, fontWeight: 800 }}>Boussole</div>
        </div>
        <div style={{ fontSize: 56, marginTop: 30, opacity: fade }}>
          L'IA guide. <span style={{ color: AMBER }}>L'humain décide.</span>
        </div>
        <div style={{ fontSize: 30, marginTop: 40, opacity: fade, color: "rgba(246,241,234,0.75)" }}>sam-halimi.github.io/hackathon-codeML-SAA</div>
        <div style={{ fontSize: 24, marginTop: 14, opacity: fade, color: ALERT }}>Prototype · données 100 % fictives</div>
      </div>
      <div style={{ opacity: fade, background: CREAM, padding: 20, borderRadius: 24 }}>
        <Img src={staticFile("qr-boussole.png")} style={{ width: 420, height: 420, display: "block" }} />
        <div style={{ color: NAVY, textAlign: "center", fontSize: 28, fontWeight: 700, marginTop: 8 }}>Scannez pour essayer</div>
      </div>
    </AbsoluteFill>
  );
};

export const BoussoleDemo: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY }}>
    <Sequence durationInFrames={s(3)}>
      <Hook />
    </Sequence>
    {SHOTS.map((shot) => (
      <Sequence key={shot.from} from={s(shot.from)} durationInFrames={s(shot.dur)}>
        <UiShot shot={shot} />
      </Sequence>
    ))}
    <Sequence from={s(35)} durationInFrames={s(5)}>
      <EndCard />
    </Sequence>
  </AbsoluteFill>
);

// Version courte 15 s : accroche, checklist, IA, export, carte de fin.
export const BoussoleShort: React.FC = () => (
  <AbsoluteFill style={{ background: NAVY }}>
    <Sequence durationInFrames={s(2.5)}>
      <Hook />
    </Sequence>
    <Sequence from={s(2.5)} durationInFrames={s(3)}>
      <UiShot shot={{ ...SHOTS[2], dur: 3 }} />
    </Sequence>
    <Sequence from={s(5.5)} durationInFrames={s(3)}>
      <UiShot shot={{ ...SHOTS[4], dur: 3 }} />
    </Sequence>
    <Sequence from={s(8.5)} durationInFrames={s(3)}>
      <UiShot shot={{ ...SHOTS[6], dur: 3, src: 34.5 }} />
    </Sequence>
    <Sequence from={s(11.5)} durationInFrames={s(3.5)}>
      <EndCard />
    </Sequence>
  </AbsoluteFill>
);
