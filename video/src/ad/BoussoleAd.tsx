import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import S from "./data/schedule.json";
import B from "./data/boxes.json";
import {
  AMBER, CREAM, FONT, FPS, NAVY, ClickRing, DirBlur, LogoMark, Loupe, Outline, Panel, SlitWord, Stage, Tag,
  clamp01, cubicInOut, display, expoIn, expoOut, lerp, prog, quartOut, vel, Box,
} from "./kit";

// Spec ad Boussole, idée 1 « Compte à rebours ». Tout le minutage vient de schedule.json (dérivé de la VO).
// Toutes les vues de l'appli sont de vraies captures de /demo (assets_in/rec/16x9), bandeau « DONNÉES FICTIVES » visible.
const W = 1920, H = 1080;
const C = S.cue as unknown as Record<string, number> & { f_clicks: number[] };
const SC = S.scenes as Record<string, number[]>;
const LN: Record<string, (typeof S.lines)[number]> = {};
S.lines.forEach((l) => { LN[l.id] = l; });
const word = (id: string, i: number) => LN[id].words[i];
type Boxes = Record<string, Record<string, unknown>>;
const BX = B as unknown as Boxes;
const bx = (shot: string, key: string) => BX[shot][key] as Box;
const inScene = (t: number, k: string, pre = 0, post = 0) => t >= SC[k][0] - pre && t < SC[k][1] + post;

// ===================== A · « La preuve a une date d'expiration. » =====================
const SceneA: React.FC<{ t: number }> = ({ t }) => {
  const out = SC.A[1] - 0.2;
  const w = (i: number) => word("s1", i).t0 - 0.06;
  const lift = (tt: number) => -expoIn(prog(tt, out, 0.25)) * 70;
  const ruleK = expoOut(prog(t, C.a_rule, 0.55));
  const sweep = prog(t, C.a_rule + 0.1, 0.9);
  return (
    <DirBlur sx={0} sy={Math.abs(vel(lift, t)) * 0.6} style={{ position: "absolute", left: 200, top: 330, transform: `translateY(${lift(t)}px)`, opacity: 1 - prog(t, out + 0.1, 0.12) }}>
      <div style={display(124)}>
        <SlitWord t={t} at={w(0)} text="La" />{" "}
        <SlitWord t={t} at={w(1)} text="preuve" />{" "}
        <SlitWord t={t} at={w(2)} text="a" />{" "}
        <SlitWord t={t} at={w(3)} text="une" />{" "}
        <SlitWord t={t} at={w(4)} text="date" />
      </div>
      <div style={{ ...display(124), position: "relative", display: "inline-block", marginTop: 6 }}>
        <SlitWord t={t} at={w(5)} text="d'expiration." color={AMBER} />
        <div style={{ position: "absolute", left: 4, bottom: -18, height: 5, width: `${ruleK * 98}%`, background: AMBER, borderRadius: 3 }} />
        {/* repère de date sur la règle, comme une étiquette */}
        <div style={{ position: "absolute", right: 0, bottom: -58, fontFamily: FONT, fontSize: 24, letterSpacing: "0.3em", color: AMBER, opacity: expoOut(prog(t, C.a_rule + 0.25, 0.4)) }}>EXP · 24 H</div>
        <div style={{ position: "absolute", inset: "-10% -5%", background: `linear-gradient(100deg, transparent ${sweep * 120 - 30}%, rgba(255,240,215,0.35) ${sweep * 120 - 15}%, transparent ${sweep * 120}%)`, mixBlendMode: "screen", opacity: sweep > 0 && sweep < 1 ? 1 : 0 }} />
      </div>
    </DirBlur>
  );
};

// ===================== B · compte à rebours 24:00:00 → 00:00:00 =====================
const T0B = SC.B[0] + 0.22;
const remaining = (t: number) => 86400 * (1 - Math.pow(prog(t, T0B, C.b_lock - T0B), 2.3));
const COLS: { unit: number; base: number }[] = [
  { unit: 36000, base: 3 }, { unit: 3600, base: 10 }, { unit: 600, base: 6 }, { unit: 60, base: 10 }, { unit: 10, base: 6 }, { unit: 1, base: 10 },
];
const DigitCol: React.FC<{ t: number; unit: number; base: number; lh: number; dim: number }> = ({ t, unit, base, lh, dim }) => {
  const pos = (tt: number) => {
    const R = remaining(tt);
    const x = R / unit;
    // odomètre : le chiffre ne tourne qu'au passage de la colonne inférieure
    const fl = Math.floor(x), fr = x - fl;
    const lower = unit === 1 ? fr : clamp01((fr - (1 - 1 / Math.max(2, unit))) * Math.max(2, unit));
    return ((fl + (unit === 1 ? fr : cubicInOut(lower))) % base + base) % base;
  };
  const p = pos(t);
  let dv = Math.abs(p - pos(t - 1 / FPS)); if (dv > base / 2) dv = base - dv;
  const digits = [...Array(base).keys(), 0];
  return (
    <div style={{ height: lh, overflow: "hidden", display: "inline-block" }}>
      <DirBlur sx={0} sy={Math.min(48, dv * lh * 0.55)} style={{ transform: `translateY(${-p * lh}px)` }}>
        {digits.map((d, i) => <div key={i} style={{ height: lh, lineHeight: `${lh}px`, opacity: 1 - dim * 0.62 }}>{d}</div>)}
      </DirBlur>
    </div>
  );
};
const S2_WORDS: [string, number][] = [["Après", 0], ["24 h,", 1], ["le", 3], ["sang", 4], ["ne", 5], ["révèle", 6], ["plus", 7], ["la", 8], ["plupart", 9], ["des", 10], ["drogues.", 11]];
const Counter: React.FC<{ t: number; collapse: number }> = ({ t, collapse }) => {
  const lh = 270;
  const dim = expoOut(prog(t, C.b_lock, 0.35));
  const cols = COLS.map((c, i) => <DigitCol key={i} t={t} {...c} lh={lh} dim={dim} />);
  const colon = (k: number) => <span key={`c${k}`} style={{ display: "inline-block", lineHeight: `${lh}px`, height: lh, verticalAlign: "top", opacity: 1 - dim * 0.62, transform: "translateY(-14px)" }}>:</span>;
  const sx = collapse > 0 ? Math.abs(vel((tt) => expoIn(prog(tt, C.c_collapse, 0.24)), t)) * 900 : 0;
  return (
    <DirBlur sx={sx} sy={0} style={{ transform: `scaleX(${lerp(1, 0.006, collapse)})`, transformOrigin: "50% 50%" }}>
      <div style={{ ...display(262, 700), fontFeatureSettings: "'tnum' 1", letterSpacing: "-0.01em", lineHeight: 1, display: "flex", justifyContent: "center", color: collapse > 0.6 ? AMBER : CREAM }}>
        {cols[0]}{cols[1]}{colon(0)}{cols[2]}{cols[3]}{colon(1)}{cols[4]}{cols[5]}
      </div>
    </DirBlur>
  );
};
const SceneB: React.FC<{ t: number }> = ({ t }) => {
  const kin = expoOut(prog(t, SC.B[0] - 0.05, 0.5));
  const rise = (tt: number) => (1 - expoOut(prog(tt, SC.B[0] - 0.05, 0.5))) * 140;
  const collapse = expoIn(prog(t, C.c_collapse, 0.24));
  const fadeTxt = 1 - prog(t, C.c_collapse - 0.05, 0.15);
  const dim = expoOut(prog(t, C.b_lock, 0.35));
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <DirBlur sx={0} sy={Math.abs(vel(rise, t)) * 0.6} style={{ position: "absolute", left: 0, right: 0, top: 268 + rise(t), opacity: kin }}>
        <div style={{ textAlign: "center", fontFamily: FONT, fontSize: 30, fontWeight: 600, letterSpacing: "0.42em", color: CREAM, opacity: (0.75 - dim * 0.45) * fadeTxt, marginBottom: 6 }}>SANG · TOXICOLOGIE</div>
        <Counter t={t} collapse={collapse} />
      </DirBlur>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", opacity: fadeTxt }}>
        <div style={{ ...display(50, 560, { letterSpacing: "-0.01em", color: "rgba(246,241,234,0.92)" }) }}>
          {S2_WORDS.map(([w, i], k) => {
            const a = word("s2", i).t0 - 0.05;
            const e = expoOut(prog(t, a, 0.35));
            return (
              <span key={k} style={{ display: "inline-block", opacity: e, transform: `translateY(${(1 - e) * 18}px)`, filter: e < 1 ? `blur(${(1 - e) * 6}px)` : undefined, marginRight: "0.26em", color: w === "drogues." && dim > 0 ? AMBER : undefined }}>
                {w}
              </span>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", left: 80, bottom: 56, fontFamily: FONT, fontSize: 22, color: "rgba(246,241,234,0.5)", letterSpacing: "0.04em", opacity: kin * fadeTxt }}>Source : ANSI/ASB Standard 121</div>
    </div>
  );
};

// ===================== C · bascule : l'aiguille, la boussole, « On répare la première nuit. » =====================
const SceneC: React.FC<{ t: number }> = ({ t }) => {
  const nW = lerp(0.35, 4, expoOut(prog(t, C.c_needle, 0.42)));
  const nL = lerp(1.3, 1, expoOut(prog(t, C.c_needle, 0.42)));
  const ring = cubicInOut(prog(t, C.c_ring, 0.55));
  const appear = prog(t, C.c_collapse + 0.2, 0.06);
  const slide = expoOut(prog(t, C.c_settle, 0.6));
  const wm = expoOut(prog(t, C.c_settle + 0.08, 0.55));
  const out = SC.C[1] - 0.22;
  const up = (tt: number) => -expoIn(prog(tt, out, 0.26)) * 90;
  const glow = expoOut(prog(t, C.c_settle - 0.1, 0.8));
  const words: [string, number, boolean][] = [["On", 0, false], ["répare", 1, false], ["la", 2, false], ["première", 3, true], ["nuit.", 4, true]];
  return (
    <DirBlur sx={0} sy={Math.abs(vel(up, t)) * 0.55} style={{ position: "absolute", inset: 0, transform: `translateY(${up(t)}px)`, opacity: appear * (1 - prog(t, out + 0.05, 0.12)) }}>
      <div style={{ position: "absolute", left: W / 2 - 300 - slide * 360, top: 145, width: 600, height: 600, background: "radial-gradient(circle, rgba(232,163,61,0.28), rgba(232,163,61,0) 62%)", opacity: glow }} />
      <div style={{ position: "absolute", top: 350, left: 0, right: 0, height: 190, display: "flex", justifyContent: "center" }}>
        <div style={{ transform: `translateX(${-slide * 360}px)` }}>
          <LogoMark size={190} needleW={nW} needleLen={nL} ring={ring} />
        </div>
        <div style={{ position: "absolute", top: 8, left: W / 2 - 235, clipPath: `inset(-20% ${100 - wm * 100}% -20% 0)`, transform: `translateX(${(1 - wm) * -40}px)` }}>
          <div style={display(156, 760, { letterSpacing: "-0.035em" })}>Boussole</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 610, left: 0, right: 0, textAlign: "center" }}>
        <div style={display(84, 680)}>
          {words.map(([w, i, amb], k) => {
            const a = word("s3", i).t0 - 0.06;
            const e = expoOut(prog(t, a, 0.5));
            return (
              <span key={k} style={{ display: "inline-block", marginRight: "0.24em", opacity: clamp01(e * 1.4), letterSpacing: `${lerp(0.42, -0.02, e)}em`, filter: e < 1 ? `blur(${(1 - e) * 10}px)` : undefined, color: amb ? AMBER : CREAM }}>
                {w}
              </span>
            );
          })}
        </div>
      </div>
    </DirBlur>
  );
};

// ===================== D · règles (pas d'IA) =====================
const SceneD: React.FC<{ t: number }> = ({ t }) => {
  const a = SC.D[0], z = SC.D[1];
  const kin = (tt: number) => expoOut(prog(tt, a - 0.07, 0.6));
  const yy = (tt: number) => lerp(260, 0, kin(tt));
  const ox = (tt: number) => -expoIn(prog(tt, z - 0.2, 0.28)) * 900;
  const src = t >= C.d_click_cutane + 0.03 ? "k1_checklist_cutane" : "k0_checklist";
  const rows = BX.k0_checklist.rows as { row: Box; badge: Box }[];
  const textWords = ["Des", "règles", "calculent", "chaque", "délai."];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Panel
        src={src} s={0.94} x={650 + ox(t)} y={175 + yy(t)} ry={lerp(-17, -7, kin(t))} rx={lerp(8, 2, kin(t))}
        opacity={clamp01(kin(t) * 2)} by={Math.abs(vel(yy, t)) * 0.5} bx={Math.abs(vel(ox, t)) * 0.5}
        overlays={
          <>
            <Outline t={t} at={C.d_loupe_18h} until={C.d_loupe_sang} box={rows[0].row} />
            <ClickRing t={t} at={C.d_click_cutane} box={[80 + 10, 302 + 22, 24, 24]} />
            <Outline t={t} at={C.d_loupe_sang} box={rows[rows.length - 1].row} />
          </>
        }
      />
      <div style={{ position: "absolute", left: 110, top: 300, width: 560, transform: `translateX(${ox(t) * 0.6}px)` }}>
        <div style={display(86, 720, { lineHeight: 1.04 })}>
          {textWords.map((w, k) => (
            <React.Fragment key={k}>
              <SlitWord t={t} at={C.d_text + k * 0.07} text={w} color={k >= 3 ? AMBER : undefined} />{k === 1 || k === 2 ? <br /> : " "}
            </React.Fragment>
          ))}
        </div>
      </div>
      <Tag t={t} at={C.d_loupe_sang + 0.2} until={z + 0.1} text="RÈGLES · PAS D'IA" x={110 + ox(t) * 0.6} y={640} />
      <Loupe t={t} at={C.d_loupe_18h} until={C.d_loupe_sang} src={src} crop={[64, 296, 1152, 80]} zoom={1.5} x={96} y={900} />
      <Loupe t={t} at={C.d_loupe_sang} until={z} src={src} crop={[64, 740, 1152, 60]} zoom={1.5} x={96} y={915} />
    </div>
  );
};

// ===================== E · chronologie IA (Claude), sources, « ne juge personne » =====================
const SceneE: React.FC<{ t: number }> = ({ t }) => {
  const a = SC.E[0], z = SC.E[1];
  const kin = (tt: number) => expoOut(prog(tt, a - 0.06, 0.55));
  const travel = (tt: number) => lerp(40, -40, cubicInOut(prog(tt, a, z - a)));
  const px = (tt: number) => 211 + lerp(320, 0, kin(tt)) + travel(tt);
  // vers F : poussée de caméra continue (échelle et position)
  const push = (tt: number) => cubicInOut(prog(tt, z - 0.32, 0.4));
  const s = lerp(1.17, 1.3, push(t));
  const x = lerp(px(t), 128, push(t)), y = lerp(100, 20, push(t));
  const src = t >= C.e_timeline ? "t3_timeline" : t >= C.e_loading ? "t2_loading" : "t1_aiview";
  const never = expoOut(prog(t, C.e_never, 0.4)) * (1 - prog(t, z - 0.3, 0.25));
  const masks = BX.t1_aiview.masks as (number | string)[][];
  const ev0 = (BX.t3_timeline.events as { row: Box; quote: Box }[])[0];
  const src0 = BX.t3_timeline.src0 as Box[];
  const lineK = expoOut(prog(t, C.e_source, 0.55));
  const qx = ev0.quote[0], qy = ev0.quote[1] + 8;
  const sx_ = src0[0][0] + src0[0][2] + 4, sy_ = src0[0][1] + 8;
  const pathD = `M ${qx - 4} ${qy} C ${qx - 60} ${qy + 120}, ${sx_ + 60} ${sy_ + 140}, ${sx_} ${sy_ + 10}`;
  const neverLines = ["Aucun coupable désigné.", "Aucune note de crédibilité.", "Aucune reconnaissance faciale."];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Panel
        src={src} s={s} x={x} y={y} ry={lerp(9, 0, kin(t))} opacity={clamp01(kin(t) * 2)} bx={Math.abs(vel(px, t)) * 0.5}
        blur={never * 9} dim={never * 0.55}
        overlays={
          <>
            {masks.map((m, k) => <ClickRing key={k} t={t} at={C.e_masks + k * 0.11} box={m.slice(0, 4) as Box} scale={0.8} />)}
            <Outline t={t} at={C.e_masks + 0.1} until={C.e_click_generate} box={bx("t1_aiview", "panel")} pad={2} />
            <ClickRing t={t} at={C.e_click_generate} box={bx("t2_loading", "generate")} />
            {t >= C.e_timeline && <Outline t={t} at={C.e_timeline - 0.05} until={C.e_source} box={(BX.t3_timeline.label as Box[])[0]} pad={3} />}
            {lineK > 0 && (
              <svg width={1280} height={800} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
                {[ev0.quote, ...src0.filter((r) => r[2] > 8)].map((r, k) => (
                  <rect key={k} x={r[0] - 2} y={r[1]} width={(r[2] + 4) * lineK} height={r[3]} rx={3} fill="rgba(232,163,61,0.22)" />
                ))}
                {[ev0.quote, ...src0.filter((r) => r[2] > 8)].map((r, k) => (
                  <rect key={`u${k}`} x={r[0]} y={r[1] + r[3] - 1} width={r[2] * lineK} height={2} fill={AMBER} />
                ))}
                <path d={pathD} fill="none" stroke={AMBER} strokeWidth={2.5} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - lineK} />
              </svg>
            )}
          </>
        }
      />
      <Tag t={t} at={C.e_masks + 0.15} until={C.e_timeline} text="PSEUDONYMISÉ AVANT L'ENVOI À L'IA" x={80} y={968} />
      <Tag t={t} at={C.e_source} until={C.e_never} text="CHAQUE LIGNE CITE SA SOURCE" x={80} y={968} />
      <Loupe t={t} at={C.e_source + 0.12} until={C.e_never + 0.05} src="t3_timeline" crop={[674, 286, 526, 76]} zoom={2.3} x={96} y={640} />
      {never > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          {neverLines.map((l, k) => {
            const at = C.e_never + 0.12 + k * 0.2;
            const bar = expoOut(prog(t, at, 0.35));
            return (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 28, opacity: never }}>
                <div style={{ width: 40 * bar, height: 4, background: AMBER, borderRadius: 2 }} />
                <div style={display(78, 650)}><SlitWord t={t} at={at} text={l} /></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ===================== F · validation humaine (7 vrais clics) =====================
const V_SHOTS = ["v1_ok_0", "v2_ok_1", "v3_ok_2", "v4_ok_3", "v5_no_4", "v6_ok_5", "v7_ok_6"];
const SceneF: React.FC<{ t: number }> = ({ t }) => {
  const a = SC.F[0], z = SC.F[1];
  let src = "t3_timeline";
  C.f_clicks.forEach((c, i) => { if (t >= c + 0.03) src = V_SHOTS[i]; });
  const drift = (tt: number) => lerp(128, 96, cubicInOut(prog(tt, a, z - a)));
  const out = (tt: number) => expoIn(prog(tt, z - 0.22, 0.3));
  const y = (tt: number) => 20 - out(tt) * 1000;
  const land = expoOut(prog(t, C.f_land, 0.5)) * (1 - prog(t, z - 0.3, 0.2));
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Panel
        src={src} s={1.3} x={drift(t)} y={y(t)} by={Math.abs(vel(y, t)) * 0.5}
        overlays={
          <>
            {C.f_clicks.map((c, i) => <ClickRing key={i} t={t} at={c} box={(BX[V_SHOTS[i]].click as Box)} />)}
            {land > 0 && <div style={{ position: "absolute", left: 664, top: 280, width: 540, height: 520, borderRadius: 12, boxShadow: `inset 0 0 0 3px rgba(232,163,61,${0.9 * land})` }} />}
          </>
        }
      />
      <Tag t={t} at={a + 0.15} until={z} text="LE SOIGNANT VALIDE CHAQUE LIGNE" x={80} y={968} />
    </div>
  );
};

// ===================== G · journal chaîné SHA-256, scellé, altération détectée =====================
const SceneG: React.FC<{ t: number }> = ({ t }) => {
  const a = SC.G[0], z = SC.G[1];
  const kin = (tt: number) => expoOut(prog(tt, a - 0.06, 0.55));
  const y = (tt: number) => lerp(900, 30, kin(tt));
  const outK = expoIn(prog(t, z - 0.25, 0.3));
  const src = t >= C.g_tamper_result ? "x1_tamper" : "x0_export";
  const logs = BX.x0_export.logs as { row: Box; hash: Box }[];
  const badge = bx("x0_export", "badge");
  const sweep = prog(t, C.g_seal - 0.05, 0.6);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - outK }}>
      <Panel
        src={src} s={1.3} x={128} y={y(t)} rx={lerp(14, 0, kin(t))} by={Math.abs(vel(y, t)) * 0.5} blur={outK * 12}
        overlays={
          <>
            {logs.slice(0, 7).map((l, i) => {
              if (i === 0) return null;
              const k = expoOut(prog(t, C.g_links + (i - 1) * 0.1, 0.3));
              const y0 = logs[i - 1].hash[1] + 8, y1 = l.row[1] + 6;
              return (
                <React.Fragment key={i}>
                  <svg width={1280} height={800} style={{ position: "absolute", left: 0, top: 0 }}>
                    <path d={`M 659 ${y0} C 650 ${y0 + 6}, 650 ${y1 - 6}, 659 ${y1}`} fill="none" stroke={AMBER} strokeWidth={2.4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} strokeLinecap="round" />
                    <circle cx={659} cy={y1} r={2.8 * k} fill={AMBER} />
                  </svg>
                  <div style={{ position: "absolute", left: 704, top: logs[i - 1].hash[1] + 14, height: 2, width: 112 * k, background: AMBER, opacity: 0.85 }} />
                </React.Fragment>
              );
            })}
            {sweep > 0 && sweep < 1 && <div style={{ position: "absolute", left: badge[0], top: badge[1], width: badge[2], height: badge[3], borderRadius: 8, overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, bottom: 0, width: 240, left: lerp(-260, badge[2] + 20, quartOut(sweep)), background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)" }} />
            </div>}
            <Outline t={t} at={C.g_seal} until={C.g_tamper_click} box={badge} pad={3} />
            <ClickRing t={t} at={C.g_tamper_click} box={bx("x1_tamper", "tamper")} />
          </>
        }
      />
      <Tag t={t} at={a + 0.25} until={z + 0.2} text="JOURNAL CHAÎNÉ · SHA-256" x={1010} y={166} />
      <Loupe t={t} at={C.g_tamper_result + 0.02} until={z + 0.2} src="x1_tamper" crop={[74, 676, 800, 58]} zoom={2.1} x={120} y={750} />
    </div>
  );
};

// ===================== Carte 1 · logo, slogan, QR, URL (immobile pour scanner) =====================
const Card1: React.FC<{ t: number }> = ({ t }) => {
  const a = C.card1_in;
  const el = (k: number) => {
    const e = expoOut(prog(t, a + 0.05 + k * 0.07, 0.42));
    return { opacity: e, transform: `translateY(${(1 - e) * 22}px)`, filter: e < 0.999 ? `blur(${(1 - e) * 10}px)` : undefined } as React.CSSProperties;
  };
  const ring = expoOut(prog(t, a, 0.5));
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 92 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 34, ...el(0) }}>
        <LogoMark size={124} ring={ring} />
        <div style={display(128, 760, { letterSpacing: "-0.035em" })}>Boussole</div>
      </div>
      <div style={{ ...display(62, 600, { letterSpacing: "-0.015em" }), marginTop: 30, ...el(1) }}>
        L'IA guide, <span style={{ color: AMBER }}>l'humain décide.</span>
      </div>
      <div style={{ marginTop: 44, background: CREAM, borderRadius: 30, padding: 22, ...el(2) }}>
        <Img src={staticFile("qr-boussole.png")} style={{ width: 404, height: 404, display: "block" }} />
      </div>
      <div style={{ fontFamily: FONT, fontSize: 32, fontWeight: 560, color: "rgba(246,241,234,0.88)", marginTop: 26, letterSpacing: "0.01em", ...el(3) }}>sam-halimi.github.io/hackathon-codeML-SAA</div>
      <div style={{ fontFamily: FONT, fontSize: 21, color: "rgba(246,241,234,0.5)", marginTop: 10, letterSpacing: "0.12em", ...el(4) }}>PROTOTYPE · DONNÉES FICTIVES</div>
    </div>
  );
};

// ===================== Carte 2 · made by (remplaçant de « Spotify end card v2 ») =====================
const Card2: React.FC<{ t: number }> = ({ t }) => {
  const a = C.card2_in;
  const line = expoOut(prog(t, a + 0.25, 0.7));
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT, fontSize: 30, fontWeight: 560, letterSpacing: "0.42em", color: "rgba(246,241,234,0.6)", marginBottom: 18 }}>
        <SlitWord t={t} at={a + 0.08} text="MADE BY" />
      </div>
      <div style={display(132, 760, { letterSpacing: "-0.035em" })}><SlitWord t={t} at={a + 0.18} dur={0.55} text="riccardo bosso" /></div>
      <div style={{ width: 520 * line, height: 4, background: AMBER, borderRadius: 2, marginTop: 34 }} />
    </div>
  );
};

// ===================== composition =====================
export const BoussoleAd16x9: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const card1 = t >= C.card1_in - 0.05 && t < C.card2_in;
  const card1Out = expoIn(prog(t, C.card2_in - 0.22, 0.24));
  return (
    <AbsoluteFill style={{ background: NAVY, overflow: "hidden" }}>
      <Stage t={t} w={W} h={H} freezeGrain={t >= C.card1_land} />
      {inScene(t, "A") && <SceneA t={t} />}
      {(inScene(t, "B") || inScene(t, "C", 0, 0)) && t < C.c_collapse + 0.3 && <SceneB t={t} />}
      {t >= C.c_collapse + 0.18 && t < SC.C[1] + 0.05 && <SceneC t={t} />}
      {inScene(t, "D", 0.15, 0.05) && <SceneD t={t} />}
      {inScene(t, "E", 0.1, 0.12) && <SceneE t={t} />}
      {inScene(t, "F", 0.0, 0.1) && <SceneF t={t} />}
      {inScene(t, "G", 0.08, 0.05) && <SceneG t={t} />}
      {card1 && <div style={{ position: "absolute", inset: 0, opacity: 1 - card1Out, filter: card1Out > 0 ? `blur(${card1Out * 12}px)` : undefined }}><Card1 t={t} /></div>}
      {t >= C.card2_in - 0.02 && <Card2 t={t} />}
      <Audio src={staticFile("ad/mix.wav")} />
    </AbsoluteFill>
  );
};
export const AD_FRAMES = S.frames;
