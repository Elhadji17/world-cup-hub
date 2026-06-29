// src/components/MatchField.jsx
// Terrain tactique avec flèches de mouvement individuelles par joueur
// Style panel TV Canal+/beIN Sports
// Option A (80%) : terrain + flèches | Option B (20%) : narration compacte

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence }      from "framer-motion";
import { PLAYER_PROFILES, calcPlayerPosition, tacticToPhase, getLiveRating } from "../data/playerProfiles";

const W = 340;
const H = 490;

// ── Formations Sénégal — positions de base (x%, y%) ─────────────────────
const FORMATIONS = {
  "4-3-3": {
    GK:   { x:0.50, y:0.92 }, // Sénégal joue vers le haut (GK en bas)
    DEF1: { x:0.85, y:0.79 }, DEF2: { x:0.62, y:0.76 },
    DEF3: { x:0.38, y:0.76 }, DEF4: { x:0.15, y:0.79 },
    MIL1: { x:0.76, y:0.62 }, MIL2: { x:0.50, y:0.60 }, MIL3: { x:0.24, y:0.62 },
    ATT1: { x:0.85, y:0.44 }, ATT2: { x:0.50, y:0.42 }, ATT3: { x:0.15, y:0.44 },
  },
  "4-2-3-1": {
    GK:   { x:0.50, y:0.92 },
    DEF1: { x:0.85, y:0.79 }, DEF2: { x:0.62, y:0.76 },
    DEF3: { x:0.38, y:0.76 }, DEF4: { x:0.15, y:0.79 },
    MIL1: { x:0.68, y:0.65 }, MIL2: { x:0.32, y:0.65 },
    MIL3: { x:0.85, y:0.52 }, MIL4: { x:0.50, y:0.50 }, MIL5: { x:0.15, y:0.52 },
    ATT1: { x:0.50, y:0.38 },
  },
  "4-4-2": {
    GK:   { x:0.50, y:0.92 },
    DEF1: { x:0.85, y:0.79 }, DEF2: { x:0.62, y:0.76 },
    DEF3: { x:0.38, y:0.76 }, DEF4: { x:0.15, y:0.79 },
    MIL1: { x:0.85, y:0.60 }, MIL2: { x:0.62, y:0.58 },
    MIL3: { x:0.38, y:0.58 }, MIL4: { x:0.15, y:0.60 },
    ATT1: { x:0.65, y:0.42 }, ATT2: { x:0.35, y:0.42 },
  },
  "5-3-2": {
    GK:   { x:0.50, y:0.92 },
    DEF1: { x:0.92, y:0.79 }, DEF2: { x:0.72, y:0.76 }, DEF3: { x:0.50, y:0.74 },
    DEF4: { x:0.28, y:0.76 }, DEF5: { x:0.08, y:0.79 },
    MIL1: { x:0.76, y:0.60 }, MIL2: { x:0.50, y:0.58 }, MIL3: { x:0.24, y:0.60 },
    ATT1: { x:0.65, y:0.42 }, ATT2: { x:0.35, y:0.42 },
  },
};

// ── Joueurs Sénégal avec leurs profils ───────────────────────────────────
const SEN_PLAYERS = [
  { key:"GK",   num:16, name:"Mendy",   role:"GK",  star:false, pid:"mendy_16"    },
  { key:"DEF1", num:15, name:"Diatta",  role:"DEF", star:false, pid:"diatta_15"   },
  { key:"DEF2", num:3,  name:"Kouli.",  role:"DEF", star:false, pid:"koulibaly_3" },
  { key:"DEF3", num:19, name:"Niakh.",  role:"DEF", star:false, pid:"niakhate_19" },
  { key:"DEF4", num:25, name:"Diouf",   role:"DEF", star:false, pid:"diouf_25"    },
  { key:"MIL1", num:5,  name:"I.Gueye", role:"MIL", star:false, pid:"gueye_5"     },
  { key:"MIL2", num:8,  name:"Camara",  role:"MIL", star:true,  pid:"camara_8"    },
  { key:"MIL3", num:26, name:"P.Gueye", role:"MIL", star:false, pid:"gueye_26"    },
  { key:"ATT1", num:18, name:"I.Sarr",  role:"ATT", star:false, pid:"sarr_18"     },
  { key:"ATT2", num:11, name:"Jackson", role:"ATT", star:false, pid:"jackson_11"  },
  { key:"ATT3", num:10, name:"Mané",    role:"ATT", star:true,  pid:"mane_10"     },
];

// Adversaire — positions miroir (joue vers le bas)
const ADV_BASE = {
  GK:   { x:0.50, y:0.08 },
  DEF1: { x:0.85, y:0.21 }, DEF2: { x:0.62, y:0.24 },
  DEF3: { x:0.38, y:0.24 }, DEF4: { x:0.15, y:0.21 },
  MIL1: { x:0.76, y:0.38 }, MIL2: { x:0.50, y:0.40 }, MIL3: { x:0.24, y:0.38 },
  ATT1: { x:0.85, y:0.56 }, ATT2: { x:0.50, y:0.58 }, ATT3: { x:0.15, y:0.56 },
};

// ── Système de flèches par joueur selon phase + formation ─────────────────
// Chaque joueur a ses propres flèches qui reflètent son vrai comportement
function getPlayerArrows(pid, basePos, phase, formation) {
  const bx = basePos.x * W;
  const by = basePos.y * H;

  const arrows = {
    // Mendy — sort légèrement sur les centres
    "mendy_16": {
      construction:   [],
      attaque_placee: [],
      contre_attaque: [],
      defence_placee: [],
      transition_def: [],
    },

    // Diatta — montée couloir droit longue et directe
    "diatta_15": {
      construction:   [{ type:"droit", dx:0, dy:-0.08, color:"#4ade80", label:"" }],
      progression:    [{ type:"droit", dx:0, dy:-0.15, color:"#4ade80", label:"" }],
      attaque_placee: [{ type:"chemin", path:`M ${bx} ${by} L ${bx+15} ${by-60} L ${bx+25} ${by-100}`, color:"#4ade80", label:"" }],
      contre_attaque: [{ type:"chemin", path:`M ${bx} ${by} L ${bx+20} ${by-80} L ${bx+30} ${by-130}`, color:"#f97316", label:"" }],
      transition_def: [{ type:"droit", dx:0, dy:0.06, color:"#94a3b8", label:"" }],
      defence_placee: [],
    },

    // Koulibaly — flèche très courte pointillée (tient sa ligne)
    "koulibaly_3": {
      construction:   [{ type:"court_pointille", dx:0, dy:-0.04, color:"#fbbf24", label:"" }],
      progression:    [{ type:"court_pointille", dx:0, dy:-0.05, color:"#fbbf24", label:"" }],
      attaque_placee: [{ type:"court_pointille", dx:0, dy:-0.03, color:"#fbbf24", label:"" }],
      contre_attaque: [{ type:"court_pointille", dx:0, dy:0.02,  color:"#f87171", label:"" }],
      transition_def: [{ type:"court_pointille", dx:0, dy:0.04,  color:"#f87171", label:"" }],
      defence_placee: [{ type:"court_pointille", dx:0, dy:0.02,  color:"#f87171", label:"" }],
    },

    // Niakhaté — similaire à Koulibaly mais légèrement plus mobile
    "niakhate_19": {
      construction:   [{ type:"court_pointille", dx:0, dy:-0.04, color:"#94a3b8", label:"" }],
      progression:    [{ type:"court_pointille", dx:0, dy:-0.06, color:"#94a3b8", label:"" }],
      attaque_placee: [{ type:"court_pointille", dx:0, dy:-0.04, color:"#94a3b8", label:"" }],
      contre_attaque: [{ type:"court_pointille", dx:0, dy:0.03,  color:"#f87171", label:"" }],
      transition_def: [{ type:"court_pointille", dx:0, dy:0.05,  color:"#f87171", label:"" }],
      defence_placee: [{ type:"court_pointille", dx:0, dy:0.03,  color:"#f87171", label:"" }],
    },

    // Diouf — montée couloir gauche (miroir de Diatta)
    "diouf_25": {
      construction:   [{ type:"droit", dx:0, dy:-0.08, color:"#4ade80", label:"" }],
      progression:    [{ type:"droit", dx:0, dy:-0.15, color:"#4ade80", label:"" }],
      attaque_placee: [{ type:"chemin", path:`M ${bx} ${by} L ${bx-15} ${by-60} L ${bx-25} ${by-100}`, color:"#4ade80", label:"" }],
      contre_attaque: [{ type:"chemin", path:`M ${bx} ${by} L ${bx-20} ${by-80} L ${bx-30} ${by-130}`, color:"#f97316", label:"" }],
      transition_def: [{ type:"droit", dx:0, dy:0.06, color:"#94a3b8", label:"" }],
      defence_placee: [],
    },

    // I.Gueye — sentinelle : flèches latérales, reste bas
    "gueye_5": {
      construction:   [
        { type:"lateral", dx:-0.15, dy:0, color:"#60a5fa", label:"" },
        { type:"lateral", dx:0.15,  dy:0, color:"#60a5fa", label:"" },
      ],
      progression:    [
        { type:"lateral", dx:-0.14, dy:0, color:"#60a5fa", label:"" },
        { type:"lateral", dx:0.14,  dy:0, color:"#60a5fa", label:"" },
      ],
      attaque_placee: [
        { type:"lateral", dx:-0.16, dy:0, color:"#60a5fa", label:"" },
        { type:"lateral", dx:0.16,  dy:0, color:"#60a5fa", label:"" },
      ],
      contre_attaque: [{ type:"droit", dx:0, dy:0.05, color:"#f87171", label:"" }],
      transition_def: [{ type:"droit", dx:0, dy:0.04, color:"#f87171", label:"" }],
      defence_placee: [
        { type:"lateral", dx:-0.18, dy:0, color:"#60a5fa", label:"" },
        { type:"lateral", dx:0.18,  dy:0, color:"#60a5fa", label:"" },
      ],
    },

    // Camara — box-to-box : grande flèche vers l'avant
    "camara_8": {
      construction:   [{ type:"droit", dx:0, dy:-0.08, color:"#4ade80", label:"" }],
      progression:    [{ type:"droit", dx:0, dy:-0.18, color:"#4ade80", label:"" }],
      attaque_placee: [{ type:"chemin", path:`M ${bx} ${by} Q ${bx+15} ${by-50} ${bx+10} ${by-100}`, color:"#4ade80", label:"" }],
      contre_attaque: [{ type:"chemin", path:`M ${bx} ${by} L ${bx+5} ${by-120}`, color:"#f97316", label:"" }],
      transition_def: [{ type:"droit", dx:0, dy:-0.10, color:"#fbbf24", label:"" }],
      defence_placee: [
        { type:"lateral", dx:-0.12, dy:0, color:"#60a5fa", label:"" },
        { type:"lateral", dx:0.12,  dy:0, color:"#60a5fa", label:"" },
      ],
    },

    // P.Gueye — projection offensive milieu gauche
    "gueye_26": {
      construction:   [{ type:"droit", dx:0, dy:-0.06, color:"#4ade80", label:"" }],
      progression:    [{ type:"droit", dx:0, dy:-0.14, color:"#4ade80", label:"" }],
      attaque_placee: [{ type:"chemin", path:`M ${bx} ${by} Q ${bx-8} ${by-50} ${bx-5} ${by-90}`, color:"#4ade80", label:"" }],
      contre_attaque: [{ type:"droit", dx:-0.04, dy:-0.16, color:"#f97316", label:"" }],
      transition_def: [{ type:"droit", dx:0, dy:0.06, color:"#94a3b8", label:"" }],
      defence_placee: [],
    },

    // I.Sarr — couloir droit très offensif, reste large
    "sarr_18": {
      construction:   [],
      progression:    [{ type:"droit", dx:0, dy:-0.10, color:"#f97316", label:"" }],
      attaque_placee: [{ type:"droit", dx:0.04, dy:-0.14, color:"#f97316", label:"" }],
      contre_attaque: [{ type:"droit", dx:0.02, dy:-0.22, color:"#ef4444", label:"" }],
      transition_def: [{ type:"droit", dx:0, dy:0.05, color:"#94a3b8", label:"" }],
      defence_placee: [{ type:"droit", dx:0, dy:-0.04, color:"#94a3b8", label:"" }],
    },

    // Jackson — axe central profondeur
    "jackson_11": {
      construction:   [{ type:"droit", dx:0, dy:-0.12, color:"#f97316", label:"" }],
      progression:    [{ type:"droit", dx:0, dy:-0.14, color:"#f97316", label:"" }],
      attaque_placee: [{ type:"droit", dx:0, dy:-0.18, color:"#f97316", label:"" }],
      contre_attaque: [{ type:"droit", dx:0, dy:-0.26, color:"#ef4444", label:"" }],
      transition_def: [{ type:"droit", dx:0, dy:-0.10, color:"#fbbf24", label:"" }],
      defence_placee: [{ type:"droit", dx:0, dy:-0.06, color:"#94a3b8", label:"" }],
    },

    // Mané — SIGNATURE : courbe depuis gauche vers le centre
    "mane_10": {
      construction:   [{ type:"chemin", path:`M ${bx} ${by} Q ${bx+25} ${by+5} ${bx+35} ${by-15}`, color:"#f97316", label:"" }],
      progression:    [{ type:"chemin", path:`M ${bx} ${by} Q ${bx+30} ${by-20} ${bx+45} ${by-40}`, color:"#f97316", label:"" }],
      // ← SA VRAIE SIGNATURE : rentre vers l'axe pour frapper du pied droit
      attaque_placee: [{ type:"chemin", path:`M ${bx} ${by} Q ${bx+40} ${by-30} ${bx+80} ${by-55}`, color:"#ef4444", label:"" }],
      contre_attaque: [{ type:"chemin", path:`M ${bx} ${by} Q ${bx+30} ${by-40} ${bx+65} ${by-80}`, color:"#ef4444", label:"" }],
      transition_def: [{ type:"court_pointille", dx:0.06, dy:-0.08, color:"#fbbf24", label:"" }],
      defence_placee: [{ type:"droit", dx:0, dy:-0.03, color:"#94a3b8", label:"" }],
    },
  };

  const phaseArrows = arrows[pid]?.[phase] ?? [];
  return phaseArrows;
}

// ── Composant Joueur ──────────────────────────────────────────────────────
function PlayerToken({ x, y, num, name, star, highlighted, color, borderColor }) {
  const r = star ? 13 : 11;
  return (
    <motion.g animate={{ x, y }} initial={{ x, y }}
      transition={{ duration: 1.6, ease: "easeInOut" }}>
      {highlighted && (
        <motion.circle r={r+7} fill="rgba(255,215,0,0.25)"
          animate={{ r: [r+5, r+11, r+5] }}
          transition={{ duration: 0.9, repeat: 3 }}/>
      )}
      <circle r={r} fill={color} stroke={borderColor} strokeWidth={star || highlighted ? 2.5 : 1.5}/>
      <text textAnchor="middle" y="3.5" fill="white" fontSize="7.5" fontWeight="600">{num}</text>
      <text textAnchor="middle" y="17" fill={star ? "#ffd700" : "rgba(255,255,255,0.75)"} fontSize="5.5">{name}</text>
    </motion.g>
  );
}

// ── Composant Flèche ──────────────────────────────────────────────────────
function Arrow({ arrow, bx, by }) {
  if (arrow.type === "droit") {
    const ex = bx + (arrow.dx ?? 0) * W;
    const ey = by + (arrow.dy ?? 0) * H;
    return (
      <g>
        <line x1={bx} y1={by} x2={ex} y2={ey}
          stroke={arrow.color} strokeWidth="1.8" markerEnd="url(#arrowhead)" opacity="0.85"/>
        {arrow.label && (
          <text x={(bx+ex)/2+6} y={(by+ey)/2}
            fill={arrow.color} fontSize="7.5" fontFamily="sans-serif" fontWeight="500">{arrow.label}</text>
        )}
      </g>
    );
  }
  if (arrow.type === "lateral") {
    const ex = bx + arrow.dx * W;
    const ey = by;
    return (
      <g>
        <line x1={bx} y1={ey} x2={ex} y2={ey}
          stroke={arrow.color} strokeWidth="1.8" markerEnd="url(#arrowhead)" opacity="0.75"/>
        {arrow.label && (
          <text x={(bx+ex)/2} y={ey-6}
            fill={arrow.color} fontSize="7" fontFamily="sans-serif" textAnchor="middle">{arrow.label}</text>
        )}
      </g>
    );
  }
  if (arrow.type === "court_pointille") {
    const ex = bx + (arrow.dx ?? 0) * W;
    const ey = by + (arrow.dy ?? 0) * H;
    return (
      <g>
        <line x1={bx} y1={by} x2={ex} y2={ey}
          stroke={arrow.color} strokeWidth="1.5" strokeDasharray="3,2"
          markerEnd="url(#arrowhead)" opacity="0.65"/>
        {arrow.label && (
          <text x={(bx+ex)/2+8} y={(by+ey)/2}
            fill={arrow.color} fontSize="7" fontFamily="sans-serif">{arrow.label}</text>
        )}
      </g>
    );
  }
  if (arrow.type === "chemin") {
    return (
      <g>
        <path d={arrow.path} fill="none"
          stroke={arrow.color} strokeWidth="2" markerEnd="url(#arrowhead)" opacity="0.90"/>
        {arrow.label && (() => {
          // Trouver point milieu du chemin approximatif
          const nums = arrow.path.match(/-?[\d.]+/g)?.map(Number) ?? [];
          const mx = nums[0] ? (nums[0] + (nums[nums.length-2] ?? nums[0])) / 2 + 8 : 0;
          const my = nums[1] ? (nums[1] + (nums[nums.length-1] ?? nums[1])) / 2 - 6 : 0;
          return (
            <text x={mx} y={my} fill={arrow.color} fontSize="7.5"
              fontFamily="sans-serif" fontWeight="600">{arrow.label}</text>
          );
        })()}
      </g>
    );
  }
  return null;
}

// ── Mapping état tactique → phase ────────────────────────────────────────
function getPhase(tacticalState, possession) {
  if (possession !== "me") {
    if (["pressing_haut"].includes(tacticalState)) return "transition_def";
    return "defence_placee";
  }
  const map = {
    pressing_haut:   "attaque_placee",
    attaque_placee:  "attaque_placee",
    contre_attaque:  "contre_attaque",
    bloc_bas:        "defence_placee",
    bloc_median:     "progression",
    celebration:     "attaque_placee",
    defence:         "transition_def",
    possession_build:"construction",
  };
  return map[tacticalState] ?? "progression";
}

// ── Composant principal ───────────────────────────────────────────────────
export default function MatchField({
  events = [], currentMin = 0, phase = "idle",
  senScore = 0, norScore = 0,
  formation = "4-3-3", tacticId = "balanced",
  awayFlag = "🇧🇪", awayName = "Belgique",
  awayPlayers = [],
  timelineEvents = [],
  activePlayers = [], // joueurs actuellement sur le terrain (avec remplacements)
}) {
  const [tacticalState,   setTacticalState]   = useState("bloc_median");
  const [currentPhase,    setCurrentPhase]    = useState("progression");
  const [possession,      setPossession]      = useState("me");
  const [ballX,           setBallX]           = useState(W / 2);
  const [ballY,           setBallY]           = useState(H / 2);
  const [flash,           setFlash]           = useState(null);
  const [lastMinute,      setLastMinute]      = useState(-1);
  const [highlightedNum,  setHighlightedNum]  = useState(null);
  const [tacticalLabel,   setTacticalLabel]   = useState("Bloc médian — construction");
  const [momentum, setMomentum] = useState(50); // toujours partir à 50%
  const autoRef  = useRef(null);

  const senFormation = FORMATIONS[formation] ?? FORMATIONS["4-3-3"];

  // Helper : met à jour tacticalState + currentPhase + label + momentum
  function applyPhase(state, label, poss, momentumDelta = 0) {
    setTacticalState(state);
    setCurrentPhase(getPhase(state, poss ?? possession));
    setTacticalLabel(label);
    if (poss !== undefined) setPossession(poss);
    if (momentumDelta !== 0) {
      setMomentum(prev => Math.min(95, Math.max(5, prev + momentumDelta)));
    }
  }

  // Influence du changement de tactique sur le momentum — seulement quand la tactique change
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const tacticMomentum = {
      attack:   +6,
      press:    +4,
      balanced:  0,
      defense:  -4,
    };
    const delta = tacticMomentum[tacticId] ?? 0;
    if (delta !== 0) setMomentum(prev => Math.min(85, Math.max(15, prev + delta)));
  }, [tacticId]);

  // Réinitialiser quand on change de mi-temps — momentum préservé
  useEffect(() => {
    setLastMinute(-1);
    // Le momentum continue entre les deux mi-temps, pas de reset
    applyPhase("bloc_median", "Bloc médian — construction", "me");
  }, [events]);

  // Synchronisation avec les événements du simulateur
  useEffect(() => {
    if (!events.length) return;
    const visible = events.filter(e => e.minute <= currentMin);
    if (!visible.length) return;
    const last = visible[visible.length - 1];
    if (last.minute === lastMinute) return;
    setLastMinute(last.minute);

    if (last.type === "goal" && (last.team === "me" || last.team === "sen")) {
      applyPhase("celebration", "⚽ BUT DU SÉNÉGAL !", "me", +18);
      setFlash("goal_sen");
      setBallX(W / 2); setBallY(H * 0.06);
      const scorer = SEN_PLAYERS.find(p =>
        last.player && p.name.toLowerCase().split(".")[0].includes(last.player.toLowerCase().split(".")[0].substring(0,4))
      );
      setHighlightedNum(scorer?.num ?? null);
      setTimeout(() => {
        setFlash(null); setHighlightedNum(null);
        applyPhase("bloc_median", "Coup d'envoi adverse — bloc médian", "ai", -5);
        setBallX(W/2); setBallY(H/2);
      }, 2800);

    } else if (last.type === "goal" && last.team === "ai") {
      setFlash("goal_adv");
      applyPhase("defence", "😰 But encaissé — on se regroupe", "ai", -18);
      setBallX(W/2); setBallY(H*0.94);
      setTimeout(() => {
        setFlash(null);
        applyPhase("bloc_median", "Coup d'envoi — reprise", "me", +3);
        setBallX(W/2); setBallY(H/2);
      }, 2800);

    } else if (last.type === "shot" || last.type === "miss") {
      applyPhase("attaque_placee", "🎯 Occasion dangereuse !", "me", +8);
      setBallX(W*(0.3+Math.random()*0.4)); setBallY(H*0.12);
      setTimeout(() => { applyPhase("bloc_median", "Bloc médian", "ai", -4); }, 2000);

    } else if (last.type === "save") {
      applyPhase("possession_build", "🧤 Parade — on repart !", "me", +6);
      setBallX(W*0.5); setBallY(H*0.10);
      setTimeout(() => { applyPhase("bloc_median", "Construction", "me"); }, 2000);

    } else if (last.type === "corner") {
      applyPhase("attaque_placee", "🚩 Corner — Koulibaly monte !", "me", +5);
      setBallX(Math.random()<0.5 ? W*0.02 : W*0.98); setBallY(H*0.08);

    } else if (last.type === "yellow") {
      setMomentum(prev => Math.min(95, Math.max(5, prev + (last.team === "ai" ? +4 : -4))));

    } else if (last.type === "text" && last.desc) {
      const d = last.desc.toLowerCase();
      if (d.includes("pressing"))          applyPhase("pressing_haut",   "⚡ Pressing haut — on monte !", "me", +6);
      else if (d.includes("contre"))       applyPhase("contre_attaque",  "⚡ Contre-attaque !", "me", +5);
      else if (d.includes("bloc bas"))     applyPhase("bloc_bas",        "🛡️ Bloc bas — on défend", "me", -3);
      else if (d.includes("construction")) applyPhase("possession_build","Construction depuis l'arrière", "me", +2);
      else if (d.includes("relance"))      applyPhase("possession_build","Construction — relance basse", "me", +2);
      else if (
        d.includes("belgique") || d.includes("lukaku") ||
        d.includes("de bruyne") || d.includes("norvège") || d.includes("adversaire")
      ) applyPhase("defence", "🛡️ Défense — l'adversaire attaque", "ai", -5);
    }
  }, [currentMin, events]);

  // Animation ballon
  useEffect(() => {
    if (phase !== "playing" && phase !== "playing2") return;
    autoRef.current = setInterval(() => {
      if (possession === "me") {
        setBallX(W*(0.15+Math.random()*0.70));
        setBallY(H*(0.20+Math.random()*0.55));
      } else {
        setBallX(W*(0.15+Math.random()*0.70));
        setBallY(H*(0.10+Math.random()*0.38));
      }
    }, 3200);
    return () => clearInterval(autoRef.current);
  }, [phase, possession]);

  return (
    <div style={{ width:"100%", maxWidth:"360px", margin:"0 auto" }}>

      {/* Flash de but */}
      <AnimatePresence>
        {flash && (
          <motion.div initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
            style={{
              position:"absolute", inset:0, zIndex:20, borderRadius:"10px", pointerEvents:"none",
              display:"flex", alignItems:"center", justifyContent:"center",
              background: flash==="goal_sen" ? "rgba(20,110,50,0.92)" : "rgba(160,30,30,0.92)",
            }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:"52px" }}>⚽</div>
              <div style={{ color:"white", fontWeight:800, fontSize:"26px" }}>
                {flash==="goal_sen" ? "BUT ! 🇸🇳" : `BUT ! ${awayFlag}`}
              </div>
              <div style={{ color:"rgba(255,255,255,0.9)", fontSize:"38px", fontWeight:800 }}>
                {senScore} - {norScore}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <svg viewBox={`0 0 ${W} ${H+5}`} style={{ width:"100%", display:"block", borderRadius:"10px" }}>
        <defs>
          <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </marker>
        </defs>

        {/* ── Terrain ── */}
        <rect width={W} height={H} fill="#1e6b2f" rx="10"/>
        {[0,1,2,3,4,5,6,7].map(i => (
          <rect key={i} x="0" y={i*(H/8)} width={W} height={H/8}
            fill={i%2===0?"rgba(0,0,0,0.05)":"transparent"}/>
        ))}
        <rect x="8" y="8" width={W-16} height={H-16} fill="none" stroke="#2d8a42" strokeWidth="1.2" rx="6"/>
        <line x1="8" y1={H/2} x2={W-8} y2={H/2} stroke="#2d8a42" strokeWidth="1.2"/>
        <circle cx={W/2} cy={H/2} r="42" fill="none" stroke="#2d8a42" strokeWidth="1.2"/>
        <circle cx={W/2} cy={H/2} r="3" fill="#2d8a42"/>
        {/* Surfaces */}
        <rect x="88"  y="8"      width="164" height="82" fill="none" stroke="#2d8a42" strokeWidth="1"/>
        <rect x="118" y="8"      width="104" height="38" fill="none" stroke="#2d8a42" strokeWidth="1"/>
        <rect x="88"  y={H-90}   width="164" height="82" fill="none" stroke="#2d8a42" strokeWidth="1"/>
        <rect x="118" y={H-46}   width="104" height="38" fill="none" stroke="#2d8a42" strokeWidth="1"/>
        {/* Buts */}
        <rect x="122" y="4"    width="96" height="8" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5"/>
        <rect x="122" y={H-12} width="96" height="8" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5"/>

        {/* ── Lignes de formation (visuelles) ── */}
        {/* Ligne défensive */}
        <line x1="30" y1={H*0.77} x2={W-30} y2={H*0.77}
          stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="5,4"/>
        {/* Ligne de milieu */}
        <line x1="30" y1={H*0.61} x2={W-30} y2={H*0.61}
          stroke="rgba(255,255,255,0.10)" strokeWidth="1" strokeDasharray="5,4"/>
        {/* Ligne attaque */}
        <line x1="30" y1={H*0.43} x2={W-30} y2={H*0.43}
          stroke="rgba(255,255,255,0.10)" strokeWidth="1" strokeDasharray="5,4"/>

        {/* ── Adversaire — vrais numéros ── */}
        {(() => {
          const advKeys = Object.keys(ADV_BASE);
          // Numéros adverses — utilisés si awayPlayers fourni, sinon numéros génériques
          const advNums = awayPlayers?.length > 0
            ? awayPlayers.map(p => p.number)
            : [1, 2, 4, 5, 3, 8, 6, 7, 11, 9, 14];
          const advNames = awayPlayers?.length > 0
            ? awayPlayers.map(p => p.name.split(".").pop()?.trim().substring(0,6) ?? "")
            : advKeys.map((k,i) => ["GK","Cst.","Faes","Vtgn","Hzd","Ona.","Tel.","DeBr.","Doku","Lkk","Trs."][i] ?? "");
          const isStarAdv = awayPlayers?.length > 0
            ? awayPlayers.map(p => (p.ratingBase ?? 0) >= 88)
            : [false,false,false,false,false,false,false,true,false,true,false];
          return advKeys.slice(0,11).map((key, i) => {
            const pos = ADV_BASE[key];
            if (!pos) return null;
            return (
              <g key={`adv-${key}`}>
                <circle cx={pos.x*W} cy={pos.y*H} r={isStarAdv[i] ? 12 : 10}
                  fill="#8b1c1c"
                  stroke={isStarAdv[i] ? "#ffd700" : "rgba(255,255,255,0.55)"}
                  strokeWidth={isStarAdv[i] ? 2 : 1.5}/>
                <text x={pos.x*W} y={pos.y*H+3.5} textAnchor="middle"
                  fill="white" fontSize="7" fontFamily="sans-serif" fontWeight="600">
                  {advNums[i] ?? i+1}
                </text>
                <text x={pos.x*W} y={pos.y*H+17} textAnchor="middle"
                  fill={isStarAdv[i] ? "#ffd700" : "rgba(255,180,180,0.75)"}
                  fontSize="5.5" fontFamily="sans-serif">
                  {advNames[i]}
                </text>
              </g>
            );
          });
        })()}

        {/* ── Flèches Sénégal ── */}
        {/* ── Construire la liste effective des joueurs (titulaires ou remplaçants) ── */}
        {(() => {
          // Si activePlayers fourni, construire une map position→joueur actuel
          // en respectant l'ordre de SEN_PLAYERS (GK, DEF1..4, MIL1..3, ATT1..3)
          const effectivePlayers = SEN_PLAYERS.map((p, idx) => {
            if (!activePlayers.length) return { ...p, isSub: false };
            // Associer par index dans la liste activePlayers (même ordre que SEN_PLAYERS)
            const ap = activePlayers[idx];
            if (!ap) return { ...p, isSub: false };
            const isSub = ap.id !== p.pid;
            return {
              ...p,
              effectivePid: ap.id,
              displayNum:   ap.number ?? p.num,
              displayName:  ap.name?.split(" ").pop()?.substring(0, 7) ?? p.name,
              isSub,
            };
          });

          return (
            <>
              {/* Flèches */}
              {effectivePlayers.map(p => {
                const base = senFormation[p.key];
                if (!base) return null;
                const bx = base.x * W;
                const by = base.y * H;
                const pid = p.effectivePid ?? p.pid;
                const arrows = getPlayerArrows(pid, base, currentPhase, formation);
                return arrows.map((arrow, i) => (
                  <Arrow key={`arrow-${p.key}-${i}`} arrow={arrow} bx={bx} by={by}/>
                ));
              })}

              {/* Pions joueurs */}
              {effectivePlayers.map(p => {
                const base = senFormation[p.key];
                if (!base) return null;
                const pid = p.effectivePid ?? p.pid;
                const dynPos = pid ? calcPlayerPosition(pid, currentPhase, formation) : null;
                // Clamper dans les limites du terrain SVG (évite les pions fantômes hors terrain)
                const rawX = dynPos ? dynPos.x * W : base.x * W;
                const rawY = dynPos ? dynPos.y * H : base.y * H;
                const fx = Math.min(W - 14, Math.max(14, rawX));
                const fy = Math.min(H - 14, Math.max(14, rawY));
                return (
                  <PlayerToken key={`sen-${p.key}`}
                    x={fx} y={fy}
                    num={p.displayNum ?? p.num}
                    name={p.displayName ?? p.name}
                    star={p.star}
                    highlighted={highlightedNum === p.num}
                    color={p.isSub ? "#1a4c78" : "#1a5c28"}
                    borderColor={p.isSub ? "#60a5fa" : p.star ? "#ffd700" : "rgba(255,255,255,0.85)"}/>
                );
              })}
            </>
          );
        })()}

        {/* ── Ballon ── */}
        <motion.g animate={{ x:ballX, y:ballY }} initial={{ x:W/2, y:H/2 }}
          transition={{ duration:0.85, ease:"easeOut" }}>
          <circle r="6.5" fill="white" stroke="#bbb" strokeWidth="0.8"/>
          <circle r="3" fill="#ccc"/>
        </motion.g>

        {/* ── Indicateurs ── */}
        <rect x="8" y="8" width="82" height="17" fill={possession==="me"?"#14532d":"#7f1d1d"} rx="4" opacity="0.92"/>
        <text x="49" y="19.5" textAnchor="middle" fill="white" fontSize="8.5"
          fontFamily="sans-serif" fontWeight="600">
          {possession==="me" ? "🇸🇳 Balle" : `${awayFlag} Balle`}
        </text>

        <rect x={W/2-30} y={H/2-14} width="60" height="19" fill="rgba(0,0,0,0.70)" rx="5"/>
        <text x={W/2} y={H/2-1} textAnchor="middle" fill="white" fontSize="12"
          fontFamily="sans-serif" fontWeight="700">{senScore} - {norScore}</text>

        {/* Étiquettes équipes */}
        <text x={W/2} y={H-4} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="7" fontFamily="sans-serif">
          🇸🇳 SÉN ↑ · {awayFlag} {awayName.substring(0,3).toUpperCase()} ↓
        </text>
      </svg>

      {/* ── Légende tactique ── */}
      <motion.div key={tacticalLabel}
        initial={{ opacity:0, y:3 }} animate={{ opacity:1, y:0 }}
        style={{
          marginTop:"5px", textAlign:"center", fontSize:"11px", minHeight:"17px",
          color: tacticalLabel.includes("BUT") ? "#4ade80" :
                 tacticalLabel.includes("😰") ? "#f87171" :
                 tacticalLabel.includes("⚡") ? "#fbbf24" : "#94a3b8",
          fontWeight: tacticalLabel.includes("BUT") || tacticalLabel.includes("⚡") ? 700 : 400,
        }}>
        {tacticalLabel}
      </motion.div>

      {/* ── Jauge de Momentum — toujours visible ── */}
      <div style={{ marginTop:"8px", padding:"0 4px" }}>
        {/* Labels */}
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px", fontSize:"9px", fontWeight:600 }}>
          <span style={{ color:"#4ade80" }}>🇸🇳 Sénégal</span>
          <span style={{
            fontSize:"10px", fontWeight:700,
            color: momentum >= 60 ? "#4ade80" : momentum <= 40 ? "#f87171" : "#94a3b8",
          }}>
            {momentum >= 70 ? "Domination 🇸🇳" :
             momentum >= 58 ? "Légère maîtrise 🇸🇳" :
             momentum >= 45 ? "Match équilibré ⚖️" :
             momentum >= 32 ? "Pression belge 🇧🇪" :
             "Domination 🇧🇪"}
          </span>
          <span style={{ color:"#f87171" }}>{awayFlag} {awayName.substring(0,3)}</span>
        </div>

        {/* Barre */}
        <div style={{
          width:"100%", height:"8px",
          background:"rgba(248,113,113,0.35)",
          borderRadius:"4px", overflow:"hidden",
          position:"relative",
        }}>
          <motion.div
            animate={{ width: `${momentum}%` }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            style={{
              height:"100%",
              background: momentum >= 55
                ? "linear-gradient(90deg, #16a34a, #4ade80)"
                : momentum <= 45
                ? "linear-gradient(90deg, #166534, #4ade80)"
                : "linear-gradient(90deg, #16a34a, #86efac)",
              borderRadius:"4px",
            }}
          />
          {/* Marqueur central */}
          <div style={{
            position:"absolute", top:0, left:"50%",
            width:"2px", height:"100%",
            background:"rgba(255,255,255,0.4)",
            transform:"translateX(-50%)",
          }}/>
        </div>

        {/* Valeurs numériques */}
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:"3px", fontSize:"8.5px", color:"#64748b" }}>
          <span>{momentum}%</span>
          <span>{100 - momentum}%</span>
        </div>
      </div>

      {/* Légende flèches */}
      <div style={{ display:"flex", gap:"12px", justifyContent:"center", marginTop:"5px", fontSize:"9.5px", color:"#64748b" }}>
        <span>— Mouvement</span>
        <span style={{ borderBottom:"1px dashed #64748b" }}>- - Tient position</span>
        <span style={{ color:"#f97316" }}>— Contre</span>
      </div>

    </div>
  );
}
