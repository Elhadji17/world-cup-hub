import React, { useState, useEffect, useRef } from "react";

// Données tactiques et profils de joueurs importés originellement
const PLAYER_PROFILES = {
  "mendy_16": { rating: 7.2, role: "Gardien Libéro", desc: "Assure la relance et gère la profondeur hors de sa boîte." },
  "diatta_15": { rating: 7.5, role: "Latéral Offensif / Piston", desc: "Prend le couloir droit pour créer le surnombre." },
  "koulibaly_3": { rating: 8.1, role: "Défenseur Central Couverture", desc: "Tient la ligne et couvre les montées des latéraux." },
  "niakhate_19": { rating: 7.4, role: "Défenseur Central Relanceur", desc: "Assure la première passe verticale vers le milieu." },
  "diouf_25": { rating: 7.3, role: "Latéral Moderne", desc: "Combine solidité défensive et dédoublements côté gauche." },
  "gueye_5": { rating: 7.6, role: "Sentinelle Devant la Défense", desc: "Coupe les lignes de passes et couvre latéralement." },
  "camara_8": { rating: 8.3, role: "Milieu Box-to-Box", desc: "Harcèle au pressing et se projette dans la surface adverse." },
  "gueye_26": { rating: 7.2, role: "Milieu Relayeur Gauche", desc: "Distribue le jeu et soutient Sadio Mané." },
  "sarr_18": { rating: 7.8, role: "Ailier de Débordement", desc: "Utilise sa vitesse sur l'aile droite pour centrer." },
  "jackson_11": { rating: 7.9, role: "Buteur de Profondeur", desc: "Pèse sur la charnière centrale et décroche." },
  "mane_10": { rating: 8.5, role: "Ailier Intérieur Gauche", desc: "Repique vers l'axe sur son pied droit pour frapper." }
};

// Calculateur de position dynamique originel
function calcPlayerPosition(pid, phase, formation) {
  const FORMATIONS = {
    "4-3-3": {
      GK:   { x: 0.50, y: 0.92 },
      DEF1: { x: 0.85, y: 0.79 }, DEF2: { x: 0.62, y: 0.76 },
      DEF3: { x: 0.38, y: 0.76 }, DEF4: { x: 0.15, y: 0.79 },
      MIL1: { x: 0.76, y: 0.62 }, MIL2: { x: 0.50, y: 0.60 }, MIL3: { x: 0.24, y: 0.62 },
      ATT1: { x: 0.85, y: 0.44 }, ATT2: { x: 0.50, y: 0.42 }, ATT3: { x: 0.15, y: 0.44 },
    },
    "4-2-3-1": {
      GK:   { x: 0.50, y: 0.92 },
      DEF1: { x: 0.85, y: 0.79 }, DEF2: { x: 0.62, y: 0.76 },
      DEF3: { x: 0.38, y: 0.76 }, DEF4: { x: 0.15, y: 0.79 },
      MIL1: { x: 0.68, y: 0.65 }, MIL2: { x: 0.32, y: 0.65 },
      MIL3: { x: 0.85, y: 0.52 }, MIL4: { x: 0.50, y: 0.50 }, MIL5: { x: 0.15, y: 0.52 },
      ATT1: { x: 0.50, y: 0.38 },
    },
    "4-4-2": {
      GK:   { x: 0.50, y: 0.92 },
      DEF1: { x: 0.85, y: 0.79 }, DEF2: { x: 0.62, y: 0.76 },
      DEF3: { x: 0.38, y: 0.76 }, DEF4: { x: 0.15, y: 0.79 },
      MIL1: { x: 0.85, y: 0.60 }, MIL2: { x: 0.62, y: 0.58 },
      MIL3: { x: 0.38, y: 0.58 }, MIL4: { x: 0.15, y: 0.60 },
      ATT1: { x: 0.65, y: 0.42 }, ATT2: { x: 0.35, y: 0.42 },
    },
    "5-3-2": {
      GK:   { x: 0.50, y: 0.92 },
      DEF1: { x: 0.92, y: 0.79 }, DEF2: { x: 0.72, y: 0.76 }, DEF3: { x: 0.50, y: 0.74 },
      DEF4: { x: 0.28, y: 0.76 }, DEF5: { x: 0.08, y: 0.79 },
      MIL1: { x: 0.76, y: 0.60 }, MIL2: { x: 0.50, y: 0.58 }, MIL3: { x: 0.24, y: 0.60 },
      ATT1: { x: 0.65, y: 0.42 }, ATT2: { x: 0.35, y: 0.42 },
    },
  };

  const currentForm = FORMATIONS[formation] || FORMATIONS["4-3-3"];
  let key = null;
  if (pid === "mendy_16") key = "GK";
  else if (pid === "diatta_15") key = "DEF1";
  else if (pid === "koulibaly_3") key = "DEF2";
  else if (pid === "niakhate_19") key = "DEF3";
  else if (pid === "diouf_25") key = "DEF4";
  else if (pid === "gueye_5") key = "MIL1";
  else if (pid === "camara_8") key = "MIL2";
  else if (pid === "gueye_26") key = "MIL3";
  else if (pid === "sarr_18") key = "ATT1";
  else if (pid === "jackson_11") key = "ATT2";
  else if (pid === "mane_10") key = "ATT3";

  if (!key || !currentForm[key]) return { x: 0.5, y: 0.5 };
  const base = currentForm[key];

  let dx = 0;
  let dy = 0;

  switch (phase) {
    case "construction":
      if (key.startsWith("DEF")) dy = 0.02;
      if (key === "MIL1") dy = 0.04;
      break;
    case "progression":
      dy = -0.04;
      break;
    case "attaque_placee":
      dy = -0.08;
      if (key === "DEF1") { dx = 0.02; dy = -0.12; }
      if (key === "DEF4") { dx = -0.02; dy = -0.12; }
      if (key === "ATT3") { dx = 0.06; } // Mané repique vers l'axe
      break;
    case "contre_attaque":
      dy = -0.10;
      if (key.startsWith("ATT")) dy = -0.15;
      break;
    case "defence_placee":
      dy = 0.05;
      if (key.startsWith("MIL")) dy = 0.06;
      break;
    case "transition_def":
      dy = 0.02;
      break;
    default:
      break;
  }

  return {
    x: Math.max(0.05, Math.min(0.95, base.x + dx)),
    y: Math.max(0.05, Math.min(0.95, base.y + dy))
  };
}

const W = 340;
const H = 490;

const FORMATIONS = {
  "4-3-3": {
    GK:   { x:0.50, y:0.92 },
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

function getPlayerArrows(pid, basePos, phase, formation) {
  const bx = basePos.x * W;
  const by = basePos.y * H;

  const arrows = {
    "mendy_16": {
      construction:   [],
      attaque_placee: [],
      contre_attaque: [],
      defence_placee: [],
      transition_def: [],
    },
    "diatta_15": {
      construction:   [{ type:"droit", dx:0, dy:-0.08, color:"#4ade80", label:"" }],
      progression:    [{ type:"droit", dx:0, dy:-0.15, color:"#4ade80", label:"" }],
      attaque_placee: [{ type:"chemin", path:`M ${bx} ${by} L ${bx+15} ${by-60} L ${bx+25} ${by-100}`, color:"#4ade80", label:"Overlap" }],
      contre_attaque: [{ type:"chemin", path:`M ${bx} ${by} L ${bx+20} ${by-80} L ${bx+30} ${by-130}`, color:"#f97316", label:"Sprint!" }],
      transition_def: [{ type:"droit", dx:0, dy:0.06, color:"#94a3b8", label:"" }],
      defence_placee: [],
    },
    "koulibaly_3": {
      construction:   [{ type:"court_pointille", dx:0, dy:-0.04, color:"#fbbf24", label:"Ligne" }],
      progression:    [{ type:"court_pointille", dx:0, dy:-0.05, color:"#fbbf24", label:"" }],
      attaque_placee: [{ type:"court_pointille", dx:0, dy:-0.03, color:"#fbbf24", label:"" }],
      contre_attaque: [{ type:"court_pointille", dx:0, dy:0.02,  color:"#f87171", label:"Couverture" }],
      transition_def: [{ type:"court_pointille", dx:0, dy:0.04,  color:"#f87171", label:"" }],
      defence_placee: [{ type:"court_pointille", dx:0, dy:0.02,  color:"#f87171", label:"" }],
    },
    "niakhate_19": {
      construction:   [{ type:"court_pointille", dx:0, dy:-0.04, color:"#94a3b8", label:"" }],
      progression:    [{ type:"court_pointille", dx:0, dy:-0.06, color:"#94a3b8", label:"" }],
      attaque_placee: [{ type:"court_pointille", dx:0, dy:-0.04, color:"#94a3b8", label:"" }],
      contre_attaque: [{ type:"court_pointille", dx:0, dy:0.03,  color:"#f87171", label:"" }],
      transition_def: [{ type:"court_pointille", dx:0, dy:0.05,  color:"#f87171", label:"" }],
      defence_placee: [{ type:"court_pointille", dx:0, dy:0.03,  color:"#f87171", label:"" }],
    },
    "diouf_25": {
      construction:   [{ type:"droit", dx:0, dy:-0.08, color:"#4ade80", label:"" }],
      progression:    [{ type:"droit", dx:0, dy:-0.15, color:"#4ade80", label:"" }],
      attaque_placee: [{ type:"chemin", path:`M ${bx} ${by} L ${bx-15} ${by-60} L ${bx-25} ${by-100}`, color:"#4ade80", label:"Overlap" }],
      contre_attaque: [{ type:"chemin", path:`M ${bx} ${by} L ${bx-20} ${by-80} L ${bx-30} ${by-130}`, color:"#f97316", label:"Sprint!" }],
      transition_def: [{ type:"droit", dx:0, dy:0.06, color:"#94a3b8", label:"" }],
      defence_placee: [],
    },
    "gueye_5": {
      construction:   [
        { type:"lateral", dx:-0.15, dy:0, color:"#60a5fa", label:"" },
        { type:"lateral", dx:0.15,  dy:0, color:"#60a5fa", label:"" },
      ],
      progression:    [
        { type:"lateral", dx:-0.14, dy:0, color:"#60a5fa", label:"Couvre" },
        { type:"lateral", dx:0.14,  dy:0, color:"#60a5fa", label:"" },
      ],
      attaque_placee: [
        { type:"lateral", dx:-0.16, dy:0, color:"#60a5fa", label:"Sentinelle" },
        { type:"lateral", dx:0.16,  dy:0, color:"#60a5fa", label:"" },
      ],
      contre_attaque: [{ type:"droit", dx:0, dy:0.05, color:"#f87171", label:"Couverture" }],
      transition_def: [{ type:"droit", dx:0, dy:0.04, color:"#f87171", label:"" }],
      defence_placee: [
        { type:"lateral", dx:-0.18, dy:0, color:"#60a5fa", label:"" },
        { type:"lateral", dx:0.18,  dy:0, color:"#60a5fa", label:"" },
      ],
    },
    "camara_8": {
      construction:   [{ type:"droit", dx:0, dy:-0.08, color:"#4ade80", label:"" }],
      progression:    [{ type:"droit", dx:0, dy:-0.18, color:"#4ade80", label:"Box-to-box" }],
      attaque_placee: [{ type:"chemin", path:`M ${bx} ${by} Q ${bx+15} ${by-50} ${bx+10} ${by-100}`, color:"#4ade80", label:"Surface !" }],
      contre_attaque: [{ type:"chemin", path:`M ${bx} ${by} L ${bx+5} ${by-120}`, color:"#f97316", label:"Sprint !" }],
      transition_def: [{ type:"droit", dx:0, dy:-0.10, color:"#fbbf24", label:"Presse" }],
      defence_placee: [
        { type:"lateral", dx:-0.12, dy:0, color:"#60a5fa", label:"Couvre large" },
        { type:"lateral", dx:0.12,  dy:0, color:"#60a5fa", label:"" },
      ],
    },
    "gueye_26": {
      construction:   [{ type:"droit", dx:0, dy:-0.06, color:"#4ade80", label:"" }],
      progression:    [{ type:"droit", dx:0, dy:-0.14, color:"#4ade80", label:"" }],
      attaque_placee: [{ type:"chemin", path:`M ${bx} ${by} Q ${bx-8} ${by-50} ${bx-5} ${by-90}`, color:"#4ade80", label:"Projection" }],
      contre_attaque: [{ type:"droit", dx:-0.04, dy:-0.16, color:"#f97316", label:"" }],
      transition_def: [{ type:"droit", dx:0, dy:0.06, color:"#94a3b8", label:"" }],
      defence_placee: [],
    },
    "sarr_18": {
      construction:   [],
      progression:    [{ type:"droit", dx:0, dy:-0.10, color:"#f97316", label:"" }],
      attaque_placee: [{ type:"droit", dx:0.04, dy:-0.14, color:"#f97316", label:"1v1" }],
      contre_attaque: [{ type:"droit", dx:0.02, dy:-0.22, color:"#ef4444", label:"SPRINT" }],
      transition_def: [{ type:"droit", dx:0, dy:0.05, color:"#94a3b8", label:"" }],
      defence_placee: [{ type:"droit", dx:0, dy:-0.04, color:"#94a3b8", label:"" }],
    },
    "jackson_11": {
      construction:   [{ type:"droit", dx:0, dy:-0.12, color:"#f97316", label:"Pressing" }],
      progression:    [{ type:"droit", dx:0, dy:-0.14, color:"#f97316", label:"" }],
      attaque_placee: [{ type:"droit", dx:0, dy:-0.18, color:"#f97316", label:"Profondeur" }],
      contre_attaque: [{ type:"droit", dx:0, dy:-0.26, color:"#ef4444", label:"Course !" }],
      transition_def: [{ type:"droit", dx:0, dy:-0.10, color:"#fbbf24", label:"Pressing" }],
      defence_placee: [{ type:"droit", dx:0, dy:-0.06, color:"#94a3b8", label:"" }],
    },
    "mane_10": {
      construction:   [{ type:"chemin", path:`M ${bx} ${by} Q ${bx+25} ${by+5} ${bx+35} ${by-15}`, color:"#f97316", label:"Décroche" }],
      progression:    [{ type:"chemin", path:`M ${bx} ${by} Q ${bx+30} ${by-20} ${bx+45} ${by-40}`, color:"#f97316", label:"" }],
      attaque_placee: [{ type:"chemin", path:`M ${bx} ${by} Q ${bx+40} ${by-30} ${bx+80} ${by-55}`, color:"#ef4444", label:"Repique → axe" }],
      contre_attaque: [{ type:"chemin", path:`M ${bx} ${by} Q ${bx+30} ${by-40} ${bx+65} ${by-80}`, color:"#ef4444", label:"Diagonale !" }],
      transition_def: [{ type:"court_pointille", dx:0.06, dy:-0.08, color:"#fbbf24", label:"Pressing" }],
      defence_placee: [{ type:"droit", dx:0, dy:-0.03, color:"#94a3b8", label:"" }],
    },
  };

  const phaseArrows = arrows[pid]?.[phase] ?? [];
  return phaseArrows;
}

function PlayerToken({ x, y, num, name, star, highlighted, color, borderColor }) {
  const r = star ? 13 : 11;
  return (
    <g style={{ transform: `translate(${x}px, ${y}px)`, transition: "transform 1.4s cubic-bezier(0.25, 1, 0.5, 1)" }}>
      {highlighted && (
        <circle r={r+7} fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3,2" className="animate-pulse" />
      )}
      <circle r={r} fill={color} stroke={borderColor} strokeWidth={star || highlighted ? 2.5 : 1.5} />
      <text textAnchor="middle" y="3.5" fill="white" fontSize="7.5" fontWeight="700">{num}</text>
      <text textAnchor="middle" y="17" fill={star ? "#ffd700" : "rgba(255,255,255,0.75)"} fontSize="5.5" fontWeight="600">{name}</text>
    </g>
  );
}

function Arrow({ arrow, bx, by }) {
  const markerId = "arrowhead";
  if (arrow.type === "droit") {
    const ex = bx + (arrow.dx ?? 0) * W;
    const ey = by + (arrow.dy ?? 0) * H;
    return (
      <g>
        <line x1={bx} y1={by} x2={ex} y2={ey}
          stroke={arrow.color} strokeWidth="1.8" markerEnd={`url(#${markerId})`} opacity="0.85" />
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
          stroke={arrow.color} strokeWidth="1.8" markerEnd={`url(#${markerId})`} opacity="0.75" />
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
          markerEnd={`url(#${markerId})`} opacity="0.65" />
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
          stroke={arrow.color} strokeWidth="2" markerEnd={`url(#${markerId})`} opacity="0.90" />
        {arrow.label && (() => {
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

export function MatchField({
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

  // Synchronisation avec les événements du match (Props d'origine)
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
      else if (d.includes("norvège") || d.includes("irak") || d.includes("belgique") || d.includes("bel")) {
        setPossession("ai"); setTacticalState("defence"); setTacticalLabel("🛡️ Défense — l'adversaire attaque");
      }
    }
  }, [currentMin, events]);

  // Animation ballon entre les événements (Props d'origine)
  useEffect(() => {
    if (phase !== "playing" && phase !== "playing2" && phase !== "active") return;
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
    <div className="relative w-full max-w-[360px] mx-auto bg-slate-900 rounded-xl overflow-hidden p-3 shadow-2xl border border-slate-800">

      {/* Flash de but consolidé (reproduction pure AnimatePresence) */}
      {flash && (
        <div 
          className="absolute inset-0 z-20 rounded-xl pointer-events-none flex flex-col items-center justify-center transition-all duration-300 ease-out"
          style={{
            background: flash === "goal_sen" ? "rgba(20,110,50,0.94)" : "rgba(160,30,30,0.94)",
          }}
        >
          <div className="text-center animate-bounce">
            <div className="text-6xl mb-2">⚽</div>
            <div className="text-white font-extrabold text-2xl uppercase tracking-wider">
              {flash === "goal_sen" ? "BUT ! SÉNÉGAL 🇸🇳" : `BUT ! ${awayFlag} ${awayName}`}
            </div>
            <div className="text-yellow-400 font-black text-5xl mt-3">
              {senScore} - {norScore}
            </div>
          </div>
        </div>
      )}

      {/* Terrain Tactique SVG d'origine */}
      <svg viewBox={`0 0 ${W} ${H+5}`} className="w-full h-auto block rounded-lg bg-emerald-950">
        <defs>
          <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </marker>
        </defs>

        {/* ── Terrain ── */}
        <rect width={W} height={H} fill="#1e6b2f" rx="10" />
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
        <line x1="30" y1={H*0.77} x2={W-30} y2={H*0.77}
          stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="5,4"/>
        <line x1="30" y1={H*0.61} x2={W-30} y2={H*0.61}
          stroke="rgba(255,255,255,0.10)" strokeWidth="1" strokeDasharray="5,4"/>
        <line x1="30" y1={H*0.43} x2={W-30} y2={H*0.43}
          stroke="rgba(255,255,255,0.10)" strokeWidth="1" strokeDasharray="5,4"/>

        {/* ── Adversaire — pions simples ── */}
        {Object.entries(ADV_BASE).slice(0,11).map(([key, pos], i) => (
          <g key={`adv-${key}`}>
            <circle cx={pos.x*W} cy={pos.y*H} r="10"
              fill="#8b1c1c" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
            <text x={pos.x*W} y={pos.y*H+3.5} textAnchor="middle"
              fill="white" fontSize="7" fontFamily="sans-serif">
              {i===0?"GK":i<=4?"DEF":i<=7?"MIL":"ATT"}
            </text>
          </g>
        ))}

        {/* ── Flèches Sénégal d'origine ── */}
        {SEN_PLAYERS.map(p => {
          const base = senFormation[p.key];
          if (!base) return null;
          const bx = base.x * W;
          const by = base.y * H;
          const arrows = getPlayerArrows(p.pid, base, currentPhase, formation);
          return arrows.map((arrow, i) => (
            <Arrow key={`arrow-${p.key}-${i}`} arrow={arrow} bx={bx} by={by}/>
          ));
        })}

        {/* ── Joueurs Sénégal animés de manière fluide sans framer-motion lourd ── */}
        {SEN_PLAYERS.map(p => {
          const base = senFormation[p.key];
          if (!base) return null;
          const dynPos = p.pid ? calcPlayerPosition(p.pid, currentPhase, formation) : null;
          const fx = dynPos ? dynPos.x * W : base.x * W;
          const fy = dynPos ? dynPos.y * H : base.y * H;
          return (
            <PlayerToken key={`sen-${p.key}`}
              x={fx} y={fy}
              num={p.num} name={p.name} star={p.star}
              highlighted={highlightedNum === p.num}
              color="#1a5c28"
              borderColor={p.star ? "#ffd700" : "rgba(255,255,255,0.85)"} />
          );
        })}

        {/* ── Ballon fluide ── */}
        <g style={{ transform: `translate(${ballX}px, ${ballY}px)`, transition: "transform 0.85s ease-out" }}>
          <circle r="6.5" fill="white" stroke="#bbb" strokeWidth="0.8" />
          <circle r="3" fill="#334155" />
        </g>

        {/* ── Indicateurs TV d'origine ── */}
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

      {/* ── Légende tactique dynamique ── */}
      <div 
        className="mt-2 text-center text-xs min-h-[18px] transition-all duration-300"
        style={{
          color: tacticalLabel.includes("BUT") ? "#4ade80" :
                 tacticalLabel.includes("😰") ? "#f87171" :
                 tacticalLabel.includes("⚡") ? "#fbbf24" : "#94a3b8",
          fontWeight: tacticalLabel.includes("BUT") || tacticalLabel.includes("⚡") ? 700 : 400,
        }}
      >
        {tacticalLabel}
      </div>

      {/* ── Option B (20%) : Narration compacte ── */}
      {lastEvent?.desc && (
        <div className="mt-2 bg-slate-950/60 rounded-lg p-2 text-[11px] text-slate-300 leading-relaxed border border-slate-800/40 animate-fadeIn">
          <span className="text-amber-500 font-mono mr-1.5 font-bold">
            {lastEvent.minute}'
          </span>
          <span className={lastEvent.type === "goal" ? (lastEvent.team === "me" || lastEvent.team === "sen" ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold") : "text-slate-300 italic"}>
            {lastEvent.desc}
          </span>
        </div>
      )}

      {/* Légende flèches */}
      <div className="flex gap-3 justify-center mt-3 text-[10px] text-slate-500 font-medium">
        <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-emerald-400 inline-block"></span> Mouvement</span>
        <span className="flex items-center gap-1"><span className="w-2 h-0.5 border-t border-dashed border-yellow-400 inline-block"></span> Tient position</span>
        <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-orange-500 inline-block"></span> Sprint</span>
      </div>
    </div>
  );
}

// Simulation d'événements de match pour la régie interactive
const MATCH_TIMELINE_EVENTS = [
  { minute: 5, type: "text", desc: "Le Sénégal pose le jeu. Relance basse et construction patiente orchestrée par Kalidou Koulibaly." },
  { minute: 15, type: "text", desc: "Contre-attaque éclair lancée par Lamine Camara vers Ismaïla Sarr sur l'aile droite !" },
  { minute: 28, type: "shot", desc: "🎯 Grosse occasion ! Enchaînement rapide de Nicolas Jackson, sa frappe est repoussée." },
  { minute: 38, type: "text", desc: "Bloc bas compact des Lions de la Téranga. Mendy rassure sa défense sur un centre aérien." },
  { minute: 44, type: "goal", team: "sen", player: "Mane", desc: "⚽ BUT DU SÉNÉGAL ! Sadio Mané repique depuis la gauche et enroule un délice au second poteau !" },
  { minute: 58, type: "save", desc: "🧤 Parade décisive d'Édouard Mendy sur un tir puissant de la Belgique !" },
  { minute: 67, type: "corner", desc: "🚩 Corner pour le Sénégal. Koulibaly s'impose dans les airs, le ballon frôle la barre." },
  { minute: 75, type: "goal", team: "ai", desc: "⚽ BUT BELGIQUE ! Égalisation des Diables Rouges sur une tête plongeante." },
  { minute: 86, type: "text", desc: "⚡ Pressing haut agressif des Sénégalais pour étouffer les dernières relances adverses." }
];

export default function App() {
  const [currentMin, setCurrentMin] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [formation, setFormation] = useState("4-3-3");
  const [senScore, setSenScore] = useState(0);
  const [norScore, setNorScore] = useState(0);

  // Gérer la mise à jour des scores selon la timeline des événements
  useEffect(() => {
    const goalsBeforeMin = MATCH_TIMELINE_EVENTS.filter(e => e.type === "goal" && e.minute <= currentMin);
    const sen = goalsBeforeMin.filter(g => g.team === "sen").length;
    const ai = goalsBeforeMin.filter(g => g.team === "ai").length;
    setSenScore(sen);
    setNorScore(ai);
  }, [currentMin]);

  // Horloge du match
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentMin(prev => {
          if (prev >= 90) {
            setIsPlaying(false);
            return 90;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row justify-center items-center p-4 gap-6 font-sans">
      
      {/* Colonne gauche : Panneau Régie et Pilotage de Match */}
      <div className="w-full max-w-[380px] bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4">
        <div>
          <div className="text-cyan-400 text-xs font-bold uppercase tracking-widest">REGIE CANAL+ SPORT</div>
          <h1 className="text-xl font-black mt-1">Palette Tactique Live</h1>
          <p className="text-xs text-slate-400 mt-1">Testez la réaction du terrain en pilotant la timeline du match ou en déclenchant des événements.</p>
        </div>

        {/* Chronomètre et Play/Pause */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Temps du Match</span>
            <span className="text-3xl font-mono font-bold text-amber-500">{currentMin} : 00'</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-3 rounded-full flex items-center justify-center transition ${isPlaying ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
            >
              {isPlaying ? (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            <button
              onClick={() => { setCurrentMin(0); setIsPlaying(false); }}
              className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-300 transition"
            >
              <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 4.75" /></svg>
            </button>
          </div>
        </div>

        {/* Formation Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Système Sénégalais</label>
          <div className="grid grid-cols-4 gap-2">
            {["4-3-3", "4-2-3-1", "4-4-2", "5-3-2"].map(f => (
              <button
                key={f}
                onClick={() => setFormation(f)}
                className={`py-1.5 text-xs font-bold rounded-md border transition ${formation === f ? 'bg-emerald-600 border-emerald-500 text-white shadow-md' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Simulateur d'événements rapides */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Accès rapide aux temps forts</span>
          <div className="grid grid-cols-3 gap-1.5">
            {MATCH_TIMELINE_EVENTS.map(e => (
              <button
                key={e.minute}
                onClick={() => { setCurrentMin(e.minute); setIsPlaying(false); }}
                className={`py-1 px-2 text-[10px] font-semibold border rounded-md transition text-left overflow-hidden text-ellipsis whitespace-nowrap ${currentMin === e.minute ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:border-slate-700'}`}
              >
                {e.minute}' - {e.type === "goal" ? "⚽ But" : e.type === "save" ? "🧤 Parade" : "📝 Jeu"}
              </button>
            ))}
          </div>
        </div>

        {/* Infos de match courantes */}
        <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg flex flex-col gap-1 text-[11px] text-slate-400">
          <div className="flex justify-between">
            <span>Possession par défaut :</span>
            <span className="text-emerald-400 font-bold">Sénégal 🇸🇳</span>
          </div>
          <div className="flex justify-between">
            <span>Adversaire du soir :</span>
            <span className="text-rose-400 font-bold">Belgique 🇧🇪</span>
          </div>
        </div>
      </div>

      {/* Colonne droite : Le Terrain Tactique (MatchField.jsx autonome d'origine) */}
      <div className="flex flex-col items-center">
        <MatchField
          events={MATCH_TIMELINE_EVENTS}
          currentMin={currentMin}
          phase={isPlaying ? "playing" : "idle"}
          senScore={senScore}
          norScore={norScore}
          formation={formation}
          awayFlag="🇧🇪"
          awayName="Belgique"
        />
      </div>

    </div>
  );
}