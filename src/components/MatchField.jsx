// src/components/MatchField.jsx
// Terrain de football tactique — positions réalistes par formation
// Déplacements selon état du jeu (pressing, bloc bas, attaque, défense)
// Synchronisation avec les événements scénarisés

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence }      from "framer-motion";
import { PLAYER_PROFILES, getDynamicPosition, getBehaviourDescription } from "../data/playerProfiles";

const FIELD_W = 320;
const FIELD_H = 500;

// ── Positions par formation (x%, y%) ─────────────────────────────────────
// Sénégal joue vers le bas (GK en haut y~0.06)
// y=0 = but sénégalais, y=1 = but adverse
const FORMATIONS = {
  "4-3-3": {
    GK:   [0.50, 0.06],
    DEF1: [0.15, 0.20], DEF2: [0.37, 0.18], DEF3: [0.63, 0.18], DEF4: [0.85, 0.20],
    MIL1: [0.20, 0.38], MIL2: [0.50, 0.35], MIL3: [0.80, 0.38],
    ATT1: [0.15, 0.54], ATT2: [0.50, 0.52], ATT3: [0.85, 0.54],
  },
  "4-2-3-1": {
    GK:   [0.50, 0.06],
    DEF1: [0.15, 0.20], DEF2: [0.37, 0.18], DEF3: [0.63, 0.18], DEF4: [0.85, 0.20],
    MIL1: [0.30, 0.34], MIL2: [0.70, 0.34],
    MIL3: [0.15, 0.46], MIL4: [0.50, 0.44], MIL5: [0.85, 0.46],
    ATT1: [0.50, 0.58],
  },
  "4-4-2": {
    GK:   [0.50, 0.06],
    DEF1: [0.15, 0.20], DEF2: [0.37, 0.18], DEF3: [0.63, 0.18], DEF4: [0.85, 0.20],
    MIL1: [0.15, 0.38], MIL2: [0.38, 0.36], MIL3: [0.62, 0.36], MIL4: [0.85, 0.38],
    ATT1: [0.32, 0.54], ATT2: [0.68, 0.54],
  },
  "5-3-2": {
    GK:   [0.50, 0.06],
    DEF1: [0.10, 0.20], DEF2: [0.30, 0.17], DEF3: [0.50, 0.16], DEF4: [0.70, 0.17], DEF5: [0.90, 0.20],
    MIL1: [0.22, 0.36], MIL2: [0.50, 0.34], MIL3: [0.78, 0.36],
    ATT1: [0.35, 0.52], ATT2: [0.65, 0.52],
  },
};

// ── Décalages tactiques selon l état du jeu ───────────────────────────────
// dy = décalage vertical (positif = vers le bas = vers le but adverse)
// dx = décalage horizontal (élargissement/resserrement)
const TACTICAL_STATES = {
  // Sénégal en possession, construction depuis l arrière
  possession_build: {
    label: "Construction depuis l'arrière",
    GK:   { dy: 0.03,  spread: 1.0 },
    DEF:  { dy: 0.06,  spread: 1.1 }, // défenseurs montent légèrement
    MIL:  { dy: 0.04,  spread: 1.15 }, // milieux s écartent
    ATT:  { dy: 0.0,   spread: 1.2 }, // attaquants très larges
  },
  // Pressing haut — tout le monde monte
  pressing_haut: {
    label: "Pressing haut — on va les chercher !",
    GK:   { dy: 0.05,  spread: 1.0 },
    DEF:  { dy: 0.14,  spread: 1.05 },
    MIL:  { dy: 0.16,  spread: 1.1 },
    ATT:  { dy: 0.12,  spread: 1.0 },
  },
  // Attaque placée — on avance organisés
  attaque_placee: {
    label: "Attaque placée — progression organisée",
    GK:   { dy: 0.02,  spread: 1.0 },
    DEF:  { dy: 0.10,  spread: 1.05 },
    MIL:  { dy: 0.14,  spread: 1.1 },
    ATT:  { dy: 0.18,  spread: 1.15 },
  },
  // Bloc médian — équilibre attaque/défense
  bloc_median: {
    label: "Bloc médian — équilibre tactique",
    GK:   { dy: 0.0,   spread: 1.0 },
    DEF:  { dy: 0.04,  spread: 1.0 },
    MIL:  { dy: 0.06,  spread: 1.05 },
    ATT:  { dy: 0.08,  spread: 1.1 },
  },
  // Bloc bas — défense compacte
  bloc_bas: {
    label: "Bloc bas — on défend en bloc",
    GK:   { dy: -0.02, spread: 1.0 },
    DEF:  { dy: -0.04, spread: 0.9 }, // défenseurs reculent et se resserrent
    MIL:  { dy: -0.06, spread: 0.85 },
    ATT:  { dy: 0.0,   spread: 0.7 }, // attaquants restent hauts pour le contre
  },
  // Contre-attaque — explosion en profondeur
  contre_attaque: {
    label: "Contre-attaque — explosion en profondeur !",
    GK:   { dy: -0.02, spread: 1.0 },
    DEF:  { dy: -0.02, spread: 0.9 },
    MIL:  { dy: 0.08,  spread: 1.2 },
    ATT:  { dy: 0.22,  spread: 1.1 }, // attaquants explosent vers le but
  },
  // Phase défensive — l adversaire attaque
  defence: {
    label: "Phase défensive — on résiste !",
    GK:   { dy: -0.01, spread: 1.0 },
    DEF:  { dy: -0.03, spread: 0.85 },
    MIL:  { dy: -0.02, spread: 0.9 },
    ATT:  { dy: 0.04,  spread: 0.8 },
  },
  // But — célébration, joueurs qui convergent
  celebration: {
    label: "⚽ BUT DU SÉNÉGAL !!! 🇸🇳",
    GK:   { dy: 0.0,   spread: 1.0 },
    DEF:  { dy: 0.12,  spread: 1.3 },
    MIL:  { dy: 0.18,  spread: 1.4 },
    ATT:  { dy: 0.25,  spread: 1.5 }, // tous convergent vers le buteur
  },
};

// Mapping tactique → état initial selon la tactique choisie
const TACTIC_TO_STATE = {
  balanced: "bloc_median",
  attack:   "attaque_placee",
  press:    "pressing_haut",
  defense:  "bloc_bas",
};

// Joueurs Sénégal avec leurs profils individuels
const SEN_PLAYERS_433 = [
  { key: "GK",   num: 16, name: "Mendy",    role: "GK",  star: false, profileId: "mendy_16"    },
  { key: "DEF1", num: 15, name: "Diatta",   role: "DEF", star: false, profileId: "diatta_15"   },
  { key: "DEF2", num:  3, name: "Kouli.",   role: "DEF", star: false, profileId: "koulibaly_3" },
  { key: "DEF3", num: 19, name: "Niakh.",   role: "DEF", star: false, profileId: "niakhate_19" },
  { key: "DEF4", num: 25, name: "Diouf",    role: "DEF", star: false, profileId: "diouf_25"    },
  { key: "MIL1", num:  5, name: "I.Gueye",  role: "MIL", star: false, profileId: "gueye_5"     },
  { key: "MIL2", num:  8, name: "Camara",   role: "MIL", star: true,  profileId: "camara_8"    },
  { key: "MIL3", num: 26, name: "P.Gueye",  role: "MIL", star: false, profileId: "gueye_26"    },
  { key: "ATT1", num: 18, name: "I.Sarr",   role: "ATT", star: false, profileId: "sarr_18"     },
  { key: "ATT2", num: 11, name: "Jackson",  role: "ATT", star: false, profileId: "jackson_11"  },
  { key: "ATT3", num: 10, name: "Mané",     role: "ATT", star: true,  profileId: "mane_10"     },
];

// Norvège — positions miroir (joue vers le haut, GK en bas)
const NOR_BASE = {
  GK:   [0.50, 0.94],
  DEF1: [0.15, 0.80], DEF2: [0.37, 0.82], DEF3: [0.63, 0.82], DEF4: [0.85, 0.80],
  MIL1: [0.20, 0.65], MIL2: [0.50, 0.66], MIL3: [0.80, 0.65],
  ATT1: [0.15, 0.50], ATT2: [0.50, 0.48], ATT3: [0.85, 0.50],
};

const NOR_PLAYERS = [
  { key: "GK",   num:  1, name: "Nyland",   role: "GK",  star: false },
  { key: "DEF1", num: 14, name: "Ryerson",  role: "DEF", star: false },
  { key: "DEF2", num:  4, name: "Østig.",   role: "DEF", star: false },
  { key: "DEF3", num:  6, name: "Ajer",     role: "DEF", star: false },
  { key: "DEF4", num:  2, name: "Wolfe",    role: "DEF", star: false },
  { key: "MIL1", num:  8, name: "Berge",    role: "MIL", star: false },
  { key: "MIL2", num: 10, name: "Ødeg.",    role: "MIL", star: true  },
  { key: "MIL3", num: 16, name: "Thorst.",  role: "MIL", star: false },
  { key: "ATT1", num:  7, name: "Nusa",     role: "ATT", star: false },
  { key: "ATT2", num:  9, name: "Haaland",  role: "ATT", star: true  },
  { key: "ATT3", num: 11, name: "Sørloth",  role: "ATT", star: false },
];

// ── Calcul de la position d un joueur selon la formation + état tactique ──
function calcPosition(base, role, tacticalState, isHome = true) {
  const state = TACTICAL_STATES[tacticalState] ?? TACTICAL_STATES.bloc_median;
  const roleState = state[role] ?? { dy: 0, spread: 1 };

  let [bx, by] = base;

  // Décalage vertical (vers le bas pour attaque si home)
  const dy = isHome ? roleState.dy : -roleState.dy;
  by = Math.min(0.95, Math.max(0.05, by + dy));

  // Élargissement horizontal autour du centre (0.5)
  bx = 0.5 + (bx - 0.5) * roleState.spread;
  bx = Math.min(0.95, Math.max(0.05, bx));

  return { x: bx * FIELD_W, y: by * FIELD_H };
}

// ── Composant Joueur ──────────────────────────────────────────────────────
function Player({ pos, color, borderColor, num, name, star, highlighted, yellowCard }) {
  const r = star ? 12 : 10;
  return (
    <motion.g
      animate={{ x: pos.x, y: pos.y }}
      initial={{ x: pos.x, y: pos.y }}
      transition={{ duration: 1.4, ease: "easeInOut" }}
    >
      {/* Halo si joueur impliqué dans l action */}
      {highlighted && (
        <motion.circle r={r + 6} fill="rgba(255,215,0,0.3)"
          animate={{ r: [r+4, r+10, r+4] }}
          transition={{ duration: 0.8, repeat: 2 }}/>
      )}
      <circle r={r} fill={color} stroke={yellowCard ? "#ffd700" : borderColor}
        strokeWidth={star || highlighted ? 2.5 : 1.5}/>
      <text textAnchor="middle" y="3.5" fill="white" fontSize="7" fontWeight="600">{num}</text>
      <text textAnchor="middle" y="18" fill={star ? "#ffd700" : (color === "#1a6b2f" ? "#a8f0c0" : "#ffc0bb")} fontSize="5.5">{name}</text>
    </motion.g>
  );
}

// ── Composant principal ───────────────────────────────────────────────────
export default function MatchField({
  events        = [],
  currentMin    = 0,
  phase         = "idle",
  senScore      = 0,
  norScore      = 0,
  formation     = "4-3-3",
  tacticId      = "balanced",
  awayFlag      = "🇳🇴",
  awayName      = "Norvège",
}) {
  const [tacticalState,  setTacticalState]  = useState(TACTIC_TO_STATE[tacticId] ?? "bloc_median");
  const [ballX,          setBallX]          = useState(FIELD_W / 2);
  const [ballY,          setBallY]          = useState(FIELD_H / 2);
  const [flash,          setFlash]          = useState(null);
  const [lastMinute,     setLastMinute]     = useState(-1);
  const [highlightedNum, setHighlightedNum] = useState(null);
  const [tacticalLabel,  setTacticalLabel]  = useState("");
  const [possession,     setPossession]     = useState("me");
  const [behaviourDesc,  setBehaviourDesc]  = useState(""); // description comportement individuel
  const autoRef = useRef(null);

  // Formations disponibles pour Sénégal
  const senFormation = FORMATIONS[formation] ?? FORMATIONS["4-3-3"];

  // Mise à jour de l état tactique selon la tactique choisie
  useEffect(() => {
    const baseState = TACTIC_TO_STATE[tacticId] ?? "bloc_median";
    setTacticalState(baseState);
    setTacticalLabel(TACTICAL_STATES[baseState]?.label ?? "");
  }, [tacticId]);

  // Synchronisation avec les événements du match
  useEffect(() => {
    if (events.length === 0) return;
    const visible = events.filter(e => e.minute <= currentMin);
    if (visible.length === 0) return;
    const last = visible[visible.length - 1];
    if (last.minute === lastMinute) return;
    setLastMinute(last.minute);

    if (last.type === "goal" && (last.team === "me" || last.team === "sen")) {
      setTacticalState("celebration");
      setTacticalLabel("⚽ BUT DU SÉNÉGAL ! 🇸🇳");
      setBallX(FIELD_W / 2);
      setBallY(FIELD_H * 0.92);
      setFlash("goal_sen");
      const scorerPlayer = SEN_PLAYERS_433.find(p =>
        last.player && (p.name.toLowerCase().includes(last.player.toLowerCase().split(".")[0]) ||
        last.player.toLowerCase().includes(p.name.toLowerCase()))
      );
      setHighlightedNum(scorerPlayer?.num ?? null);
      if (scorerPlayer?.profileId) {
        const desc = getBehaviourDescription(scorerPlayer.profileId, "attaque");
        setBehaviourDesc(desc ? `✨ ${desc}` : "");
      }
      setTimeout(() => {
        setFlash(null);
        setHighlightedNum(null);
        setBehaviourDesc("");
        const baseState = TACTIC_TO_STATE[tacticId] ?? "bloc_median";
        setTacticalState(baseState);
        setTacticalLabel(TACTICAL_STATES[baseState]?.label ?? "");
        setPossession("ai");
        setBallX(FIELD_W / 2);
        setBallY(FIELD_H / 2);
      }, 2500);

    } else if (last.type === "goal" && last.team === "ai") {
      // But adverse
      setFlash("goal_nor");
      setTacticalState("defence");
      setTacticalLabel("😰 But encaissé — on repart !");
      setBallX(FIELD_W / 2);
      setBallY(FIELD_H * 0.08); // ballon dans le but sénégalais (haut)
      setPossession("ai");
      setTimeout(() => {
        setFlash(null);
        setPossession("me");
        setBallX(FIELD_W / 2);
        setBallY(FIELD_H / 2);
        setTacticalState(TACTIC_TO_STATE[tacticId] ?? "bloc_median");
        setTacticalLabel(TACTICAL_STATES[TACTIC_TO_STATE[tacticId]]?.label ?? "");
      }, 2500);

    } else if (last.type === "shot" || last.type === "miss") {
      setTacticalState("attaque_placee");
      setTacticalLabel("🎯 Occasion dangereuse !");
      setBallX(FIELD_W * (0.3 + Math.random() * 0.4));
      setBallY(FIELD_H * 0.82);
      setPossession("me");
      setTimeout(() => {
        setPossession("ai");
        setTacticalState("defence");
        setTacticalLabel(TACTICAL_STATES["defence"].label);
      }, 2000);

    } else if (last.type === "save") {
      setTacticalState("defence");
      setTacticalLabel("🧤 Parade décisive !");
      setBallX(FIELD_W * 0.5);
      setBallY(FIELD_H * 0.10);
      setPossession("me");
      setTimeout(() => {
        setTacticalState(TACTIC_TO_STATE[tacticId] ?? "bloc_median");
        setTacticalLabel(TACTICAL_STATES[TACTIC_TO_STATE[tacticId]]?.label ?? "");
      }, 2000);

    } else if (last.type === "corner") {
      setTacticalState("attaque_placee");
      setTacticalLabel("🚩 Corner — tous en surface !");
      setBallX(Math.random() < 0.5 ? FIELD_W * 0.02 : FIELD_W * 0.98);
      setBallY(FIELD_H * 0.88);
      setPossession("me");

    } else if (last.type === "yellow") {
      setTacticalLabel("🟨 Carton jaune !");
      setTimeout(() => {
        setTacticalLabel(TACTICAL_STATES[tacticalState]?.label ?? "");
      }, 2000);

    } else if (last.type === "text") {
      // Commentaire narratif — ajuster état selon le contexte
      if (last.desc?.toLowerCase().includes("pressing")) {
        setTacticalState("pressing_haut");
        setTacticalLabel(TACTICAL_STATES["pressing_haut"].label);
      } else if (last.desc?.toLowerCase().includes("contre")) {
        setTacticalState("contre_attaque");
        setTacticalLabel(TACTICAL_STATES["contre_attaque"].label);
      } else if (last.desc?.toLowerCase().includes("bloc")) {
        setTacticalState("bloc_bas");
        setTacticalLabel(TACTICAL_STATES["bloc_bas"].label);
      }
    }
  }, [currentMin, events]);

  // Animation automatique du ballon entre les événements
  useEffect(() => {
    if (phase !== "playing" && phase !== "playing2") return;
    autoRef.current = setInterval(() => {
      if (possession === "me") {
        // Sénégal a le ballon — simulation de progression
        setBallX(FIELD_W * (0.2 + Math.random() * 0.6));
        setBallY(FIELD_H * (0.35 + Math.random() * 0.45));
      } else {
        // Adversaire a le ballon
        setBallX(FIELD_W * (0.2 + Math.random() * 0.6));
        setBallY(FIELD_H * (0.15 + Math.random() * 0.35));
      }
    }, 2800);
    return () => clearInterval(autoRef.current);
  }, [phase, possession]);

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "340px", margin: "0 auto" }}>

      {/* Flash de but */}
      <AnimatePresence>
        {flash && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "absolute", inset: 0, zIndex: 10, borderRadius: "10px", pointerEvents: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: flash === "goal_sen" ? "rgba(22,120,50,0.90)" : "rgba(180,40,30,0.90)",
            }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "52px" }}>⚽</div>
              <div style={{ color: "white", fontWeight: 800, fontSize: "24px", letterSpacing: "1px" }}>
                {flash === "goal_sen" ? "BUT ! 🇸🇳" : `BUT ! ${awayFlag}`}
              </div>
              <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "36px", fontWeight: 800 }}>
                {senScore} - {norScore}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <svg viewBox={`0 0 ${FIELD_W} ${FIELD_H}`} style={{ width: "100%", display: "block", borderRadius: "10px" }}>

        {/* ── Terrain ── */}
        <rect width={FIELD_W} height={FIELD_H} fill="#1e6b2f" rx="10"/>
        {/* Rayures */}
        {[0,1,2,3,4,5,6,7,8].map(i => (
          <rect key={i} x="0" y={i * (FIELD_H/9)} width={FIELD_W} height={FIELD_H/9}
            fill={i%2===0 ? "rgba(0,0,0,0.06)" : "transparent"}/>
        ))}
        {/* Bordure */}
        <rect x="8" y="8" width={FIELD_W-16} height={FIELD_H-16} fill="none" stroke="#2d8a42" strokeWidth="1.5" rx="6"/>

        {/* Ligne médiane */}
        <line x1="8" y1={FIELD_H/2} x2={FIELD_W-8} y2={FIELD_H/2} stroke="#2d8a42" strokeWidth="1.2"/>
        <circle cx={FIELD_W/2} cy={FIELD_H/2} r="38" fill="none" stroke="#2d8a42" strokeWidth="1.2"/>
        <circle cx={FIELD_W/2} cy={FIELD_H/2} r="3" fill="#2d8a42"/>

        {/* Surface Sénégal (haut) */}
        <rect x="78" y="8" width="164" height="78" fill="none" stroke="#2d8a42" strokeWidth="1"/>
        <rect x="108" y="8" width="104" height="38" fill="none" stroke="#2d8a42" strokeWidth="1"/>
        <circle cx={FIELD_W/2} cy="78" r="22" fill="none" stroke="#2d8a42" strokeWidth="1"
          clipPath="url(#clipTop)"/>
        <clipPath id="clipTop"><rect x="0" y="78" width={FIELD_W} height={FIELD_H}/></clipPath>

        {/* Surface adverse (bas) */}
        <rect x="78" y={FIELD_H-86} width="164" height="78" fill="none" stroke="#2d8a42" strokeWidth="1"/>
        <rect x="108" y={FIELD_H-46} width="104" height="38" fill="none" stroke="#2d8a42" strokeWidth="1"/>
        <circle cx={FIELD_W/2} cy={FIELD_H-78} r="22" fill="none" stroke="#2d8a42" strokeWidth="1"
          clipPath="url(#clipBot)"/>
        <clipPath id="clipBot"><rect x="0" y="0" width={FIELD_W} height={FIELD_H-78}/></clipPath>

        {/* Buts */}
        <rect x="118" y="4" width="84" height="10" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
        <rect x="118" y={FIELD_H-14} width="84" height="10" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>

        {/* ── Joueurs Norvège (positions fixes miroir) ── */}
        {NOR_PLAYERS.map(p => {
          const base = NOR_BASE[p.key];
          if (!base) return null;
          // Décalage adverse selon possession
          const norDy = possession === "me" ? 0.06 : -0.08;
          const pos = { x: base[0] * FIELD_W, y: Math.min(0.95, Math.max(0.05, base[1] + norDy)) * FIELD_H };
          return (
            <Player key={`nor-${p.key}`} pos={pos}
              color="#a83228" borderColor={p.star ? "#ffd700" : "rgba(255,255,255,0.8)"}
              num={p.num} name={p.name} star={p.star} highlighted={false} yellowCard={false}/>
          );
        })}

        {/* ── Joueurs Sénégal (positions individuelles selon profil + état tactique) ── */}
        {SEN_PLAYERS_433.map(p => {
          const base = senFormation[p.key];
          if (!base) return null;

          // Position individuelle selon le profil du joueur
          const dynBase = getDynamicPosition(p.profileId, base, tacticalState);

          // Appliquer le décalage tactique global EN PLUS du comportement individuel
          const state = TACTICAL_STATES[tacticalState] ?? TACTICAL_STATES.bloc_median;
          const roleState = state[p.role] ?? { dy: 0, spread: 1 };
          const extraDy = roleState.dy;
          const finalBase = [
            dynBase[0],
            Math.min(0.95, Math.max(0.05, dynBase[1] + extraDy * 0.5)), // combiner les deux décalages
          ];

          const pos = {
            x: Math.min(0.95, Math.max(0.05, finalBase[0] * (roleState.spread ?? 1) + 0.5 * (1 - (roleState.spread ?? 1)))) * FIELD_W,
            y: finalBase[1] * FIELD_H,
          };

          const isHighlighted = highlightedNum === p.num;
          const profile = PLAYER_PROFILES[p.profileId];

          return (
            <Player key={`sen-${p.key}`} pos={pos}
              color="#1a6b2f" borderColor={p.star ? "#ffd700" : "rgba(255,255,255,0.85)"}
              num={p.num} name={p.name} star={p.star}
              highlighted={isHighlighted} yellowCard={false}/>
          );
        })}

        {/* ── Ballon ── */}
        <motion.g animate={{ x: ballX, y: ballY }} initial={{ x: FIELD_W/2, y: FIELD_H/2 }}
          transition={{ duration: 0.9, ease: "easeOut" }}>
          <circle r="6" fill="white" stroke="#ccc" strokeWidth="0.8"/>
          <circle r="3" fill="#bbb"/>
        </motion.g>

        {/* ── Indicateurs ── */}
        {/* Possession */}
        <rect x="8" y="8" width="80" height="17" fill={possession==="me" ? "#1a6b2f" : "#a83228"} rx="4" opacity="0.92"/>
        <text x="48" y="20" textAnchor="middle" fill="white" fontSize="8.5" fontWeight="600">
          {possession==="me" ? "🇸🇳 Balle" : `${awayFlag} Balle`}
        </text>

        {/* Score */}
        <rect x={FIELD_W/2-32} y={FIELD_H/2-14} width="64" height="19" fill="rgba(0,0,0,0.70)" rx="5"/>
        <text x={FIELD_W/2} y={FIELD_H/2-1} textAnchor="middle" fill="white" fontSize="11" fontWeight="700">
          {senScore} - {norScore}
        </text>

        {/* Étiquettes équipes */}
        <text x={FIELD_W/2} y="24" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7">🇸🇳 SÉN</text>
        <text x={FIELD_W/2} y={FIELD_H-6} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7">{awayFlag} {awayName.substring(0,3).toUpperCase()}</text>
      </svg>

      {/* ── Légende tactique ── */}
      <motion.div key={tacticalLabel}
        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          marginTop: "6px", textAlign: "center", fontSize: "11px",
          color: tacticalLabel.includes("BUT") ? "#4ade80" :
                 tacticalLabel.includes("😰") ? "#f87171" : "#94a3b8",
          fontWeight: tacticalLabel.includes("BUT") ? 700 : 400,
          minHeight: "18px",
        }}>
        {tacticalLabel}
      </motion.div>

      {/* ── Info joueur en action ── */}
      {behaviourDesc && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ textAlign: "center", fontSize: "10px", color: "#fbbf24", marginTop: "2px", fontStyle: "italic" }}>
          {behaviourDesc}
        </motion.div>
      )}

      {/* Légende */}
      <div style={{ display:"flex", gap:"16px", justifyContent:"center", marginTop:"6px", fontSize:"10px", color:"#64748b" }}>
        <span style={{ display:"flex", alignItems:"center", gap:"4px" }}>
          <svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="#1a6b2f" stroke="#ffd700" strokeWidth="1.5"/></svg>
          Joueur clé 🇸🇳
        </span>
        <span style={{ display:"flex", alignItems:"center", gap:"4px" }}>
          <svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="#a83228" stroke="#ffd700" strokeWidth="1.5"/></svg>
          Joueur clé {awayFlag}
        </span>
      </div>
    </div>
  );
}
