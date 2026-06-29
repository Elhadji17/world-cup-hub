// src/components/MatchField.jsx
// Terrain tactique avec flèches de mouvement individuelles par joueur
// Style panel TV Canal+/beIN Sports - Option A (80%) + Option B (20%) + Tableau d'Analyse

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

const ADV_BASE = {
  GK:   { x:0.50, y:0.08 },
  DEF1: { x:0.85, y:0.21 }, DEF2: { x:0.62, y:0.24 },
  DEF3: { x:0.38, y:0.24 }, DEF4: { x:0.15, y:0.21 },
  MIL1: { x:0.76, y:0.38 }, MIL2: { x:0.50, y:0.40 }, MIL3: { x:0.24, y:0.38 },
  ATT1: { x:0.85, y:0.56 }, ATT2: { x:0.50, y:0.58 }, ATT3: { x:0.15, y:0.56 },
};

// ── Système de flèches par joueur selon phase ────────────────────────────
function getPlayerArrows(pid, basePos, phase) {
  const bx = basePos.x * W;
  const by = basePos.y * H;

  const arrows = {
    "mendy_16": { construction: [], attaque_placee: [], contre_attaque: [], defence_placee: [], transition_def: [] },
    "diatta_15": {
      construction:   [{ type:"droit", dx:0, dy:-0.08, color:"#4ade80", markerId:"green", label:"" }],
      progression:    [{ type:"droit", dx:0, dy:-0.15, color:"#4ade80", markerId:"green", label:"" }],
      attaque_placee: [{ type:"chemin", path:`M ${bx} ${by} L ${bx+15} ${by-60} L ${bx+25} ${by-100}`, color:"#4ade80", markerId:"green", label:"Overlap" }],
      contre_attaque: [{ type:"chemin", path:`M ${bx} ${by} L ${bx+20} ${by-80} L ${bx+30} ${by-130}`, color:"#f97316", markerId:"orange", label:"Sprint!" }],
      transition_def: [{ type:"droit", dx:0, dy:0.06, color:"#94a3b8", markerId:"slate", label:"" }],
      defence_placee: [],
    },
    "koulibaly_3": {
      construction:   [{ type:"court_pointille", dx:0, dy:-0.04, color:"#fbbf24", markerId:"amber", label:"Ligne" }],
      progression:    [{ type:"court_pointille", dx:0, dy:-0.05, color:"#fbbf24", markerId:"amber", label:"" }],
      attaque_placee: [{ type:"court_pointille", dx:0, dy:-0.03, color:"#fbbf24", markerId:"amber", label:"" }],
      contre_attaque: [{ type:"court_pointille", dx:0, dy:0.02,  color:"#f87171", markerId:"red", label:"Couverture" }],
      transition_def: [{ type:"court_pointille", dx:0, dy:0.04,  color:"#f87171", markerId:"red", label:"" }],
      defence_placee: [{ type:"court_pointille", dx:0, dy:0.02,  color:"#f87171", markerId:"red", label:"" }],
    },
    "niakhate_19": {
      construction:   [{ type:"court_pointille", dx:0, dy:-0.04, color:"#94a3b8", markerId:"slate", label:"" }],
      progression:    [{ type:"court_pointille", dx:0, dy:-0.06, color:"#94a3b8", markerId:"slate", label:"" }],
      attaque_placee: [{ type:"court_pointille", dx:0, dy:-0.04, color:"#94a3b8", markerId:"slate", label:"" }],
      contre_attaque: [{ type:"court_pointille", dx:0, dy:0.03,  color:"#f87171", markerId:"red", label:"" }],
      transition_def: [{ type:"court_pointille", dx:0, dy:0.05,  color:"#f87171", markerId:"red", label:"" }],
      defence_placee: [{ type:"court_pointille", dx:0, dy:0.03,  color:"#f87171", markerId:"red", label:"" }],
    },
    "diouf_25": {
      construction:   [{ type:"droit", dx:0, dy:-0.08, color:"#4ade80", markerId:"green", label:"" }],
      progression:    [{ type:"droit", dx:0, dy:-0.15, color:"#4ade80", markerId:"green", label:"" }],
      attaque_placee: [{ type:"chemin", path:`M ${bx} ${by} L ${bx-15} ${by-60} L ${bx-25} ${by-100}`, color:"#4ade80", markerId:"green", label:"Overlap" }],
      contre_attaque: [{ type:"chemin", path:`M ${bx} ${by} L ${bx-20} ${by-80} L ${bx-30} ${by-130}`, color:"#f97316", markerId:"orange", label:"Sprint!" }],
      transition_def: [{ type:"droit", dx:0, dy:0.06, color:"#94a3b8", markerId:"slate", label:"" }],
      defence_placee: [],
    },
    "gueye_5": {
      construction:   [{ type:"lateral", dx:-0.15, dy:0, color:"#60a5fa", markerId:"blue", label:"" }, { type:"lateral", dx:0.15,  dy:0, color:"#60a5fa", markerId:"blue", label:"" }],
      progression:    [{ type:"lateral", dx:-0.14, dy:0, color:"#60a5fa", markerId:"blue", label:"Couvre" }, { type:"lateral", dx:0.14,  dy:0, color:"#60a5fa", markerId:"blue", label:"" }],
      attaque_placee: [{ type:"lateral", dx:-0.16, dy:0, color:"#60a5fa", markerId:"blue", label:"Sentinelle" }, { type:"lateral", dx:0.16,  dy:0, color:"#60a5fa", markerId:"blue", label:"" }],
      contre_attaque: [{ type:"droit", dx:0, dy:0.05, color:"#f87171", markerId:"red", label:"Couverture" }],
      transition_def: [{ type:"droit", dx:0, dy:0.04, color:"#f87171", markerId:"red", label:"" }],
      defence_placee: [{ type:"lateral", dx:-0.18, dy:0, color:"#60a5fa", markerId:"blue", label:"" }, { type:"lateral", dx:0.18,  dy:0, color:"#60a5fa", markerId:"blue", label:"" }],
    },
    "camara_8": {
      construction:   [{ type:"droit", dx:0, dy:-0.08, color:"#4ade80", markerId:"green", label:"" }],
      progression:    [{ type:"droit", dx:0, dy:-0.18, color:"#4ade80", markerId:"green", label:"Box-to-box" }],
      attaque_placee: [{ type:"chemin", path:`M ${bx} ${by} Q ${bx+15} ${by-50} ${bx+10} ${by-100}`, color:"#4ade80", markerId:"green", label:"Surface !" }],
      contre_attaque: [{ type:"chemin", path:`M ${bx} ${by} L ${bx+5} ${by-120}`, color:"#f97316", markerId:"orange", label:"Sprint !" }],
      transition_def: [{ type:"droit", dx:0, dy:-0.10, color:"#fbbf24", markerId:"amber", label:"Presse" }],
      defence_placee: [{ type:"lateral", dx:-0.12, dy:0, color:"#60a5fa", markerId:"blue", label:"Couvre large" }, { type:"lateral", dx:0.12,  dy:0, color:"#60a5fa", markerId:"blue", label:"" }],
    },
    "gueye_26": {
      construction:   [{ type:"droit", dx:0, dy:-0.06, color:"#4ade80", markerId:"green", label:"" }],
      progression:    [{ type:"droit", dx:0, dy:-0.14, color:"#4ade80", markerId:"green", label:"" }],
      attaque_placee: [{ type:"chemin", path:`M ${bx} ${by} Q ${bx-8} ${by-50} ${bx-5} ${by-90}`, color:"#4ade80", markerId:"green", label:"Projection" }],
      contre_attaque: [{ type:"droit", dx:-0.04, dy:-0.16, color:"#f97316", markerId:"orange", label:"" }],
      transition_def: [{ type:"droit", dx:0, dy:0.06, color:"#94a3b8", markerId:"slate", label:"" }],
      defence_placee: [],
    },
    "sarr_18": {
      construction:   [],
      progression:    [{ type:"droit", dx:0, dy:-0.10, color:"#f97316", markerId:"orange", label:"" }],
      attaque_placee: [{ type:"droit", dx:0.04, dy:-0.14, color:"#f97316", markerId:"orange", label:"1v1" }],
      contre_attaque: [{ type:"droit", dx:0.02, dy:-0.22, color:"#ef4444", markerId:"red", label:"SPRINT" }],
      transition_def: [{ type:"droit", dx:0, dy:0.05, color:"#94a3b8", markerId:"slate", label:"" }],
      defence_placee: [{ type:"droit", dx:0, dy:-0.04, color:"#94a3b8", markerId:"slate", label:"" }],
    },
    "jackson_11": {
      construction:   [{ type:"droit", dx:0, dy:-0.12, color:"#f97316", markerId:"orange", label:"Pressing" }],
      progression:    [{ type:"droit", dx:0, dy:-0.14, color:"#f97316", markerId:"orange", label:"" }],
      attaque_placee: [{ type:"droit", dx:0, dy:-0.18, color:"#f97316", markerId:"orange", label:"Profondeur" }],
      contre_attaque: [{ type:"droit", dx:0, dy:-0.26, color:"#ef4444", markerId:"red", label:"Course !" }],
      transition_def: [{ type:"droit", dx:0, dy:-0.10, color:"#fbbf24", markerId:"amber", label:"Pressing" }],
      defence_placee: [{ type:"droit", dx:0, dy:-0.06, color:"#94a3b8", markerId:"slate", label:"" }],
    },
    "mane_10": {
      construction:   [{ type:"chemin", path:`M ${bx} ${by} Q ${bx+25} ${by+5} ${bx+35} ${by-15}`, color:"#f97316", markerId:"orange", label:"Décroche" }],
      progression:    [{ type:"chemin", path:`M ${bx} ${by} Q ${bx+30} ${by-20} ${bx+45} ${by-40}`, color:"#f97316", markerId:"orange", label:"" }],
      attaque_placee: [{ type:"chemin", path:`M ${bx} ${by} Q ${bx+40} ${by-30} ${bx+80} ${by-55}`, color:"#ef4444", markerId:"red", label:"Repique → axe" }],
      contre_attaque: [{ type:"chemin", path:`M ${bx} ${by} Q ${bx+30} ${by-40} ${bx+65} ${by-80}`, color:"#ef4444", markerId:"red", label:"Diagonale !" }],
      transition_def: [{ type:"court_pointille", dx:0.06, dy:-0.08, color:"#fbbf24", markerId:"amber", label:"Pressing" }],
      defence_placee: [{ type:"droit", dx:0, dy:-0.03, color:"#94a3b8", markerId:"slate", label:"" }],
    },
  };

  return arrows[pid]?.[phase] ?? [];
}

// ── Rendu composants individuels ─────────────────────────────────────────
function PlayerToken({ x, y, num, name, star, highlighted, color, borderColor }) {
  const r = star ? 13 : 11;
  return (
    <motion.g animate={{ x, y }} initial={{ x, y }} transition={{ duration: 1.6, ease: "easeInOut" }}>
      {highlighted && (
        <motion.circle r={r+7} fill="rgba(255,215,0,0.25)" animate={{ r: [r+5, r+11, r+5] }} transition={{ duration: 0.9, repeat: 3 }}/>
      )}
      <circle r={r} fill={color} stroke={borderColor} strokeWidth={star || highlighted ? 2.5 : 1.5}/>
      <text textAnchor="middle" y="3.5" fill="white" fontSize="7.5" fontWeight="600">{num}</text>
      <text textAnchor="middle" y="17" fill={star ? "#ffd700" : "rgba(255,255,255,0.75)"} fontSize="5.5">{name}</text>
    </motion.g>
  );
}

function Arrow({ arrow, bx, by }) {
  const markerUrl = `url(#arrow-${arrow.markerId || 'default'})`;
  if (arrow.type === "droit") {
    const ex = bx + (arrow.dx ?? 0) * W;
    const ey = by + (arrow.dy ?? 0) * H;
    return (
      <g>
        <line x1={bx} y1={by} x2={ex} y2={ey} stroke={arrow.color} strokeWidth="1.8" markerEnd={markerUrl} opacity="0.85"/>
        {arrow.label && <text x={(bx+ex)/2+6} y={(by+ey)/2} fill={arrow.color} fontSize="7.5" fontWeight="500">{arrow.label}</text>}
      </g>
    );
  }
  if (arrow.type === "lateral") {
    const ex = bx + arrow.dx * W;
    const ey = by;
    return (
      <g>
        <line x1={bx} y1={ey} x2={ex} y2={ey} stroke={arrow.color} strokeWidth="1.8" markerEnd={markerUrl} opacity="0.75"/>
        {arrow.label && <text x={(bx+ex)/2} y={ey-6} fill={arrow.color} fontSize="7" textAnchor="middle">{arrow.label}</text>}
      </g>
    );
  }
  if (arrow.type === "court_pointille") {
    const ex = bx + (arrow.dx ?? 0) * W;
    const ey = by + (arrow.dy ?? 0) * H;
    return (
      <g>
        <line x1={bx} y1={by} x2={ex} y2={ey} stroke={arrow.color} strokeWidth="1.5" strokeDasharray="3,2" markerEnd={markerUrl} opacity="0.65"/>
        {arrow.label && <text x={(bx+ex)/2+8} y={(by+ey)/2} fill={arrow.color} fontSize="7">{arrow.label}</text>}
      </g>
    );
  }
  if (arrow.type === "chemin") {
    return (
      <g>
        <path d={arrow.path} fill="none" stroke={arrow.color} strokeWidth="2" markerEnd={markerUrl} opacity="0.90"/>
        {arrow.label && (() => {
          const nums = arrow.path.match(/-?[\d.]+/g)?.map(Number) ?? [];
          const mx = nums[0] ? (nums[0] + (nums[nums.length-2] ?? nums[0])) / 2 + 8 : 0;
          const my = nums[1] ? (nums[1] + (nums[nums.length-1] ?? nums[1])) / 2 - 6 : 0;
          return <text x={mx} y={my} fill={arrow.color} fontSize="7.5" fontWeight="600">{arrow.label}</text>;
        })()}
      </g>
    );
  }
  return null;
}

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
}) {
  const [tacticalState,   setTacticalState]   = useState("bloc_median");
  const [possession,      setPossession]      = useState("me");
  const [ballX,           setBallX]           = useState(W / 2);
  const [ballY,           setBallY]           = useState(H / 2);
  const [flash,           setFlash]           = useState(null);
  const [lastMinute,      setLastMinute]      = useState(-1);
  const [highlightedNum,  setHighlightedNum]  = useState(null);
  const [tacticalLabel,   setTacticalLabel]   = useState("Bloc médian — construction");
  const [lastEvent,       setLastEvent]       = useState(null);
  const autoRef = useRef(null);

  const senFormation = FORMATIONS[formation] ?? FORMATIONS["4-3-3"];
  const currentPhase = getPhase(tacticalState, possession);

  // Synchronisation avec les événements
  useEffect(() => {
    if (!events.length) return;
    const visible = events.filter(e => e.minute <= currentMin);
    if (!visible.length) return;
    const last = visible[visible.length - 1];
    if (last.minute === lastMinute) return;
    setLastMinute(last.minute);
    setLastEvent(last);

    if (last.type === "goal" && (last.team === "me" || last.team === "sen")) {
      setTacticalState("celebration");
      setTacticalLabel("⚽ BUT DU SÉNÉGAL !");
      setFlash("goal_sen");
      setBallX(W / 2); setBallY(H * 0.06);
      const scorer = SEN_PLAYERS.find(p =>
        last.player && p.name.toLowerCase().split(".")[0].includes(last.player.toLowerCase().split(".")[0].substring(0,4))
      );
      setHighlightedNum(scorer?.num ?? null);
      setTimeout(() => {
        setFlash(null); setHighlightedNum(null);
        setPossession("ai"); setTacticalState("bloc_median");
        setTacticalLabel("Coup d'envoi adverse — bloc médian");
        setBallX(W/2); setBallY(H/2);
      }, 2800);

    } else if (last.type === "goal" && last.team === "ai") {
      setFlash("goal_adv"); setTacticalState("defence");
      setTacticalLabel("😰 But encaissé — on se regroupe");
      setBallX(W/2); setBallY(H*0.94); setPossession("ai");
      setTimeout(() => {
        setFlash(null); setPossession("me");
        setTacticalState("bloc_median");
        setTacticalLabel("Coup d'envoi — reprise");
        setBallX(W/2); setBallY(H/2);
      }, 2800);

    } else if (last.type === "shot" || last.type === "miss") {
      setTacticalState("attaque_placee");
      setTacticalLabel("🎯 Occasion dangereuse !");
      setBallX(W*(0.3+Math.random()*0.4)); setBallY(H*0.12);
      setTimeout(() => { setPossession("ai"); setTacticalState("bloc_median"); setTacticalLabel("Bloc médian"); }, 2000);

    } else if (last.type === "save") {
      setTacticalState("transition_def");
      setTacticalLabel("🧤 Parade — on repart !");
      setBallX(W*0.5); setBallY(H*0.10); setPossession("me");
      setTimeout(() => { setTacticalState("bloc_median"); setTacticalLabel("Construction"); }, 2000);

    } else if (last.type === "corner") {
      setTacticalState("attaque_placee");
      setTacticalLabel("🚩 Corner — Koulibaly monte !");
      setBallX(Math.random()<0.5 ? W*0.02 : W*0.98); setBallY(H*0.08);

    } else if (last.type === "text" && last.desc) {
      const d = last.desc.toLowerCase();
      if (d.includes("pressing"))       { setTacticalState("pressing_haut"); setTacticalLabel("⚡ Pressing haut — on monte !"); setPossession("me"); }
      else if (d.includes("contre"))    { setTacticalState("contre_attaque"); setTacticalLabel("⚡ Contre-attaque !"); setPossession("me"); }
      else if (d.includes("bloc bas"))  { setTacticalState("bloc_bas"); setTacticalLabel("🛡️ Bloc bas — on défend"); }
      else if (d.includes("norvège") || d.includes("irak") || d.includes("belgique")) {
        setPossession("ai"); setTacticalState("defence"); setTacticalLabel("🛡️ Défense — l'adversaire attaque");
      }
    }
  }, [currentMin, events]);

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
              <div style={{ color:"white", fontWeight:800, fontSize:"26px" }}>{flash==="goal_sen" ? "BUT ! 🇸🇳" : `BUT ! ${awayFlag}`}</div>
              <div style={{ color:"rgba(255,255,255,0.9)", fontSize:"38px", fontWeight:800 }}>{senScore} - {norScore}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <svg viewBox={`0 0 ${W} ${H+5}`} style={{ width:"100%", display:"block", borderRadius:"10px" }}>
        <defs>
          {/* Marqueurs individuels pour corriger le bug Safari sur context-stroke */}
          {['green', 'orange', 'red', 'blue', 'amber', 'slate', 'default'].map((id) => {
            const colors = { green: '#4ade80', orange: '#f97316', red: '#ef4444', blue: '#60a5fa', amber: '#fbbf24', slate: '#94a3b8', default: '#ffffff' };
            return (
              <marker key={id} id={`arrow-${id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M2 1L8 5L2 9" fill="none" stroke={colors[id]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </marker>
            );
          })}
        </defs>

        {/* Terrain */}
        <rect width={W} height={H} fill="#1e6b2f" rx="10"/>
        {[0,1,2,3,4,5,6,7].map(i => <rect key={i} x="0" y={i*(H/8)} width={W} height={H/8} fill={i%2===0?"rgba(0,0,0,0.05)":"transparent"}/>)}
        <rect x="8" y="8" width={W-16} height={H-16} fill="none" stroke="#2d8a42" strokeWidth="1.2" rx="6"/>
        <line x1="8" y1={H/2} x2={W-8} y2={H/2} stroke="#2d8a42" strokeWidth="1.2"/>
        <circle cx={W/2} cy={H/2} r="42" fill="none" stroke="#2d8a42" strokeWidth="1.2"/>
        <circle cx={W/2} cy={H/2} r="3" fill="#2d8a42"/>
        <rect x="88"  y="8"      width="164" height="82" fill="none" stroke="#2d8a42" strokeWidth="1"/>
        <rect x="118" y="8"      width="104" height="38" fill="none" stroke="#2d8a42" strokeWidth="1"/>
        <rect x="88"  y={H-90}   width="164" height="82" fill="none" stroke="#2d8a42" strokeWidth="1"/>
        <rect x="118" y={H-46}   width="104" height="38" fill="none" stroke="#2d8a42" strokeWidth="1"/>
        <rect x="122" y="4"    width="96" height="8" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5"/>
        <rect x="122" y={H-12} width="96" height="8" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5"/>

        {/* Lignes de formation */}
        <line x1="30" y1={H*0.77} x2={W-30} y2={H*0.77} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="5,4"/>
        <line x1="30" y1={H*0.61} x2={W-30} y2={H*0.61} stroke="rgba(255,255,255,0.10)" strokeWidth="1" strokeDasharray="5,4"/>
        <line x1="30" y1={H*0.43} x2={W-30} y2={H*0.43} stroke="rgba(255,255,255,0.10)" strokeWidth="1" strokeDasharray="5,4"/>

        {/* Adversaire */}
        {Object.entries(ADV_BASE).slice(0,11).map(([key, pos], i) => (
          <g key={`adv-${key}`}>
            <circle cx={pos.x*W} cy={pos.y*H} r="10" fill="#8b1c1c" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5"/>
            <text x={pos.x*W} y={pos.y*H+3.5} textAnchor="middle" fill="white" fontSize="7">{i===0?"GK":i<=4?"DEF":i<=7?"MIL":"ATT"}</text>
          </g>
        ))}

        {/* Flèches Sénégal */}
        {SEN_PLAYERS.map(p => {
          const base = senFormation[p.key];
          if (!base) return null;
          return getPlayerArrows(p.pid, base, currentPhase).map((arrow, i) => (
            <Arrow key={`arrow-${p.key}-${i}`} arrow={arrow} bx={base.x*W} by={base.y*H}/>
          ));
        })}

        {/* Joueurs Sénégal */}
        {SEN_PLAYERS.map(p => {
          const base = senFormation[p.key];
          if (!base) return null;
          const dynPos = p.pid ? calcPlayerPosition(p.pid, currentPhase, formation) : null;
          return <PlayerToken key={`sen-${p.key}`} x={dynPos ? dynPos.x*W : base.x*W} y={dynPos ? dynPos.y*H : base.y*H} num={p.num} name={p.name} star={p.star} highlighted={highlightedNum === p.num} color="#1a5c28" borderColor={p.star ? "#ffd700" : "rgba(255,255,255,0.85)"}/>;
        })}

        {/* Ballon */}
        <motion.g animate={{ x:ballX, y:ballY }} initial={{ x:W/2, y:H/2 }} transition={{ duration:0.85, ease:"easeOut" }}><circle r="6.5" fill="white" stroke="#bbb" strokeWidth="0.8"/><circle r="3" fill="#ccc"/></motion.g>

        {/* Indicateurs */}
        <rect x="8" y="8" width="82" height="17" fill={possession==="me"?"#14532d":"#7f1d1d"} rx="4" opacity="0.92"/>
        <text x="49" y="19.5" textAnchor="middle" fill="white" fontSize="8.5" fontWeight="600">{possession==="me" ? "🇸🇳 Balle" : `${awayFlag} Balle`}</text>
        <rect x={W/2-30} y={H/2-14} width="60" height="19" fill="rgba(0,0,0,0.70)" rx="5"/>
        <text x={W/2} y={H/2-1} textAnchor="middle" fill="white" fontSize="12" fontWeight="700">{senScore} - {norScore}</text>
        <text x={W/2} y={H-4} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="7">🇸🇳 SÉN ↑ · {awayFlag} {awayName.substring(0,3).toUpperCase()} ↓</text>
      </svg>

      {/* Légende tactique */}
      <motion.div key={tacticalLabel} initial={{ opacity:0, y:3 }} animate={{ opacity:1, y:0 }} style={{ marginTop:"5px", textAlign:"center", fontSize:"11px", minHeight:"17px", color: tacticalLabel.includes("BUT") ? "#4ade80" : tacticalLabel.includes("😰") ? "#f87171" : tacticalLabel.includes("⚡") ? "#fbbf24" : "#94a3b8", fontWeight: tacticalLabel.includes("BUT") || tacticalLabel.includes("⚡") ? 700 : 400 }}>{tacticalLabel}</motion.div>

      {/* Option B (20%) : Narration compacte */}
      {lastEvent?.desc && (
        <motion.div key={lastEvent.minute} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} style={{ marginTop:"6px", background:"rgba(0,0,0,0.55)", borderRadius:"8px", padding:"6px 10px", fontSize:"10px", color:"#cbd5e1", lineHeight:"1.5" }}><span style={{ color:"#94a3b8", fontFamily:"monospace", marginRight:"6px" }}>{lastEvent.minute}'</span><span style={{ color: lastEvent.type==="goal" ? (lastEvent.team==="me"||lastEvent.team==="sen" ? "#4ade80" : "#f87171") : "#cbd5e1", fontStyle:"italic" }}>{lastEvent.desc?.substring(0, 90)}{lastEvent.desc?.length > 90 ? "…" : ""}</span></motion.div>
      )}

      {/* ── NOUVEAU : Note du Consultant — Débrief Tactique en Direct ── */}
      <div style={{ marginTop: "10px", background: "rgba(15, 23, 42, 0.7)", borderRadius: "8px", padding: "10px", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
        <div style={{ fontSize: "11px", fontWeight: "700", color: "#38bdf8", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          🔍 Note Tactique Live ({formation})
        </div>
        <div style={{ fontSize: "10.5px", color: "#e2e8f0", lineHeight: "1.4" }}>
          {currentPhase === "construction" && "• Phase de relance basse. On aspire le premier rideau adverse. I. Gueye sécurise l'axe central, les latéraux commencent à écarter."}
          {currentPhase === "progression" && "• Le bloc équipe coulisse vers le milieu de terrain. Camara s'apprête à faire la transition vers notre ligne d'attaque."}
          {currentPhase === "attaque_placee" && "• Sadio Mané libère le couloir en repiquant vers l'axe pour provoquer les centraux, ouvrant la voie à la grosse montée de Diatta."}
          {currentPhase === "contre_attaque" && "• Transition éclair ! Les flèches rouges traduisent les courses à haute intensité dans le dos de la défense adverse."}
          {currentPhase === "defence_placee" && "• Organisation en bloc compact. Koulibaly gère la ligne de couverture. Interdiction absolue de se faire transpercer dans l'axe."}
          {currentPhase === "transition_def" && "• Perte de balle ! Transition défensive immédiate. Premier rideau de pressing haut activé pour forcer l'erreur adverse."}
        </div>
      </div>

      {/* ── NOUVEAU : Tableau Tactique des Rôles (Style Palette Canal+) ── */}
      <div style={{ marginTop: "8px", background: "rgba(30, 41, 59, 0.4)", borderRadius: "8px", padding: "8px", fontSize: "10px", color: "#94a3b8" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.5fr", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "4px", marginBottom: "4px", fontWeight: "600", color: "#cbd5e1" }}>
          <span>Joueur</span>
          <span>Rôle Profil</span>
          <span>Consigne Clé</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.5fr" }}><span style={{ color: "#ffd700", fontWeight: "500" }}>S. Mané (#10)</span><span style={{ color: "#ef4444" }}>Ailier Intérieur</span><span>Repiquage signature</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.5fr" }}><span style={{ color: "#fff" }}>K. Diatta (#15)</span><span style={{ color: "#4ade80" }}>Latéral Offensif</span><span>Prendre l'overlap</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.5fr" }}><span style={{ color: "#ffd700", fontWeight: "500" }}>L. Camara (#8)</span><span style={{ color: "#4ade80" }}>Box-to-box</span><span>Projection surface</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.5fr" }}><span style={{ color: "#fff" }}>I. Gueye (#5)</span><span style={{ color: "#60a5fa" }}>Sentinelle</span><span>Couverture latérale</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.5fr" }}><span style={{ color: "#fff" }}>Koulibaly (#3)</span><span style={{ color: "#fbbf24" }}>Défenseur Central</span><span>Tenable & Couverture</span></div>
        </div>
      </div>

      {/* Légende flèches */}
      <div style={{ display:"flex", gap:"12px", justifyContent:"center", marginTop:"8px", fontSize:"9px", color:"#64748b" }}>
        <span>— Mouvement</span>
        <span style={{ borderBottom:"1px dashed #64748b" }}>- - Fixe</span>
        <span style={{ color:"#f97316" }}>— Transition</span>
      </div>
    </div>
  );
}