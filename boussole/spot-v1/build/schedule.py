"""Feuille de minutage unique : scènes, repères image et repères son, tous dérivés de la VO.
Remotion (image) et les scripts audio (musique, effets) lisent build/schedule.json."""
import json, os
ROOT = os.path.abspath(os.path.dirname(__file__))
T = json.load(open(f"{ROOT}/timing.json"))
L = {l["id"]: l for l in T["lines"]}
W = lambda lid, i: L[lid]["words"][i]
FPS = 60

sc = {}
sc["A"] = [0.0, L["s2"]["t0"] - 0.12]
sc["B"] = [sc["A"][1], L["s3"]["t0"] - 0.22]
sc["C"] = [sc["B"][1], L["s3"]["t1"] + 0.12]
sc["D"] = [sc["C"][1], L["s5"]["t0"] - 0.06]
sc["E"] = [sc["D"][1], L["s6"]["t0"] - 0.12]
sc["F"] = [sc["E"][1], L["s7"]["t0"] - 0.15]
card1 = L["c1"]["t0"] - 0.12
sc["G"] = [sc["F"][1], card1]
land = card1 + 0.5
sc["CARD1"] = [card1, round(max(L["c2"]["t1"] + 0.6, land + 3.6), 3)]
sc["CARD2"] = [sc["CARD1"][1], sc["CARD1"][1] + 2.0]
total = sc["CARD2"][1]

s5 = L["s5"]["segs"]
cue = {
    # A : titre
    "a_title_in": L["s1"]["t0"] - 0.12,
    "a_rule": W("s1", 5)["t0"] + 0.15,
    # B : compte à rebours
    "b_counter_in": sc["B"][0],
    "b_lock": W("s2", 11)["t0"] + 0.28,
    # C : bascule, logo
    "c_collapse": sc["C"][0],
    "c_needle": sc["C"][0] + 0.22,
    "c_ring": sc["C"][0] + 0.32,
    "c_settle": sc["C"][0] + 0.62,
    # D : règles
    "d_panel_in": sc["D"][0],
    "d_text": sc["D"][0] + 0.18,
    "d_loupe_18h": sc["D"][0] + 0.45,
    "d_click_cutane": sc["D"][0] + 0.80,
    "d_loupe_sang": sc["D"][0] + 1.12,
    # E : chronologie IA
    "e_aiview": sc["E"][0],
    "e_masks": sc["E"][0] + 0.25,
    "e_click_generate": W("s5", 2)["t0"] - 0.05,
    "e_loading": W("s5", 2)["t0"],
    "e_timeline": W("s5", 2)["t0"] + 0.30,
    "e_source": s5[2][0] - 0.05,
    "e_never": s5[3][0] - 0.08,
    # F : validation humaine (7 clics réels)
    "f_in": sc["F"][0],
    "f_clicks": [round(L["s6"]["t0"] + 0.12 + i * 0.205, 3) for i in range(7)],
    "f_land": W("s6", 3)["t0"],
    # G : journal, scellé, altération
    "g_in": sc["G"][0],
    "g_links": W("s7", 1)["t0"],
    "g_seal": W("s7", 3)["t0"],
    "g_tamper_click": L["s7"]["t1"] + 0.08,
    "g_tamper_result": L["s7"]["t1"] + 0.18,
    # cartes
    "card1_in": card1,
    "card1_land": land,
    "card2_in": sc["CARD2"][0],
}
# Grille musicale : bascule (s3) et carte 1 sur des premiers temps, 4 mesures d'écart
tb, tc = L["s3"]["t0"], card1
bar = (tc - tb) / 4
music = {"bar": bar, "bpm": 240 / bar, "origin": tb - 2 * bar, "bascule": tb, "card": tc}
out = {"fps": FPS, "total": round(total, 3), "frames": int(round(total * FPS)), "scenes": sc,
       "cue": cue, "lines": T["lines"], "music": music}
json.dump(out, open(f"{ROOT}/schedule.json", "w"), ensure_ascii=False, indent=1)
print(json.dumps({k: [round(v[0], 2), round(v[1], 2)] for k, v in sc.items()}), "\ntotal", round(total, 2), "frames", out["frames"], "bpm", round(music["bpm"], 2))
