import React, { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, RotateCcw, Users, Shield, Zap, Target, 
  TrendingUp, Compass, Award, AlertTriangle, Check, RefreshCw 
} from "lucide-react";

const PLAYER_PROFILES = {
  "mendy_16": { rating: 82, role: "Gardien", desc: "Assure la relance et gère la profondeur." },
  "diaw_23": { rating: 74, role: "Gardien intérimaire", desc: "Solide sur sa ligne, remplace Mendy blessé." },
  "diatta_15": { rating: 78, role: "Latéral Offensif", desc: "Prend le couloir droit pour créer le surnombre." },
  "koulibaly_3": { rating: 83, role: "Défenseur Central Couverture", desc: "Tient la ligne et couvre les montées." },
  "niakhate_19": { rating: 79, role: "Défenseur Central Relanceur", desc: "Assure la première passe verticale." },
  "diouf_25": { rating: 77, role: "Latéral Moderne", desc: "Combine solidité défensive et dédoublements." },
  "gueye_5": { rating: 76, role: "Sentinelle devant la défense", desc: "Coupe les lignes de passes." },
  "camara_8": { rating: 82, role: "Milieu Box-to-Box", desc: "Harcèle au pressing et se projette dans la surface." },
  "gueye_26": { rating: 79, role: "Milieu Relayeur Gauche", desc: "Distribue le jeu et soutient Sadio Mané." },
  "diarra_21": { rating: 77, role: "Milieu Énergique", desc: "Apporte de l'agressivité au pressing." },
  "sarr_18": { rating: 85, role: "Ailier de Débordement", desc: "Utilise sa vitesse sur l'aile droite." },
  "jackson_11": { rating: 81, role: "Buteur de Profondeur", desc: "Pèse sur la charnière centrale." },
  "ndiaye_13": { rating: 79, role: "Milieu Offensif / Super-Sub", desc: "S'infiltre intelligemment entre les lignes." },
  "mane_10": { rating: 85, role: "Ailier Intérieur Gauche", desc: "Repique vers l'axe sur son pied droit pour frapper." }
};

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

const TACTICS = [
  { id: "balanced", name: "Équilibré", emoji: "⚖️", desc: "Bloc compact, transitions fluides et construction sécurisée.", color: "from-blue-500 to-indigo-500", attackMod: 1.0, defenseMod: 1.0, staminaMod: 1.0 },
  { id: "offensive", name: "Attaque Totale", emoji: "🔥", desc: "Pressing ultra-haut, pistons projetés. Plus d'occasions mais vulnérable aux contres.", color: "from-red-500 to-orange-500", attackMod: 1.6, defenseMod: 0.6, staminaMod: 1.5 },
  { id: "counter", name: "Contre-Attaque", emoji: "⚡", desc: "Bloc bas hermétique et relances explosives sur Mané et Sarr.", color: "from-amber-500 to-yellow-500", attackMod: 1.2, defenseMod: 1.2, staminaMod: 0.9 },
  { id: "defensive", name: "Verrou Téranga", emoji: "🛡️", desc: "Reconstitution stricte du bloc bas. Idéal pour conserver un score.", color: "from-emerald-500 to-teal-500", attackMod: 0.5, defenseMod: 1.8, staminaMod: 0.8 }
];

const INITIAL_SEN_PLAYERS = [
  { key:"GK",   num:23, name:"M. Diaw",     role:"GK",  star:false, pid:"diaw_23", stamina: 100 },
  { key:"DEF1", num:15, name:"K. Diatta",   role:"DEF", star:false, pid:"diatta_15", stamina: 100 },
  { key:"DEF2", num:3,  name:"Koulibaly",   role:"DEF", star:true,  pid:"koulibaly_3", stamina: 100 },
  { key:"DEF3", num:19, name:"M. Niakhaté", role:"DEF", star:false, pid:"niakhate_19", stamina: 100 },
  { key:"DEF4", num:25, name:"M. Diouf",    role:"DEF", star:false, pid:"diouf_25", stamina: 100 },
  { key:"MIL1", num:5,  name:"I. Gueye",    role:"MIL", star:false, pid:"gueye_5", stamina: 100 },
  { key:"MIL2", num:8,  name:"L. Camara",   role:"MIL", star:true,  pid:"camara_8", stamina: 100 },
  { key:"MIL3", num:21, name:"H. Diarra",   role:"MIL", star:false, pid:"diarra_21", stamina: 100 },
  { key:"ATT1", num:18, name:"I. Sarr",     role:"ATT", star:false, pid:"sarr_18", stamina: 100 },
  { key:"ATT2", num:11, name:"N. Jackson",  role:"ATT", star:false, pid:"jackson_11", stamina: 100 },
  { key:"ATT3", num:10, name:"S. Mané",     role:"ATT", star:true,  pid:"mane_10", stamina: 100 },
];

const ADV_BASE = {
  GK:   { x:0.50, y:0.08 },
  DEF1: { x:0.85, y:0.21 }, DEF2: { x:0.62, y:0.24 },
  DEF3: { x:0.38, y:0.24 }, DEF4: { x:0.15, y:0.21 },
  MIL1: { x:0.76, y:0.38 }, MIL2: { x:0.50, y:0.40 }, MIL3: { x:0.24, y:0.38 },
  ATT1: { x:0.85, y:0.56 }, ATT2: { x:0.50, y:0.58 }, ATT3: { x:0.15, y:0.56 },
};

const BELGIUM_PLAYERS = [
  { name: "K. Casteels",   number: 1,  star: false },
  { name: "T. Castagne",   number: 2,  star: false },
  { name: "W. Faes",       number: 4,  star: false },
  { name: "J. Vertonghen", number: 5,  star: false },
  { name: "T. Hazard",     number: 3,  star: false },
  { name: "A. Onana",      number: 8,  star: false },
  { name: "Y. Tielemans",  number: 6,  star: false },
  { name: "K. De Bruyne",  number: 7,  star: true  },
  { name: "J. Doku",       number: 11, star: false },
  { name: "R. Lukaku",     number: 9,  star: true  },
  { name: "L. Trossard",   number: 14, star: false }
];

// Generates football scenarios responsive to user selection
function generateProceduralEvent(minute, tacticId, formation, scoreSen, scoreBel, activeLineup) {
  const hasMane = activeLineup.some(p => p.pid === "mane_10" && p.stamina > 25);
  const hasJackson = activeLineup.some(p => p.pid === "jackson_11" && p.stamina > 25);
  const hasNdiaye = activeLineup.some(p => p.pid === "ndiaye_13");

  // Probabilities influenced by tactics and formation
  const r = Math.random();

  if (tacticId === "offensive") {
    if (r < 0.35) {
      return {
        minute,
        type: "goal",
        team: "sen",
        player: hasMane ? "Mané" : "Jackson",
        desc: `⚽ BUT SÉNÉGALAIS ! En configuration d'attaque totale, le Sénégal étouffe la Belgique. ${hasMane ? "Sadio Mané repique et enroule" : "Nicolas Jackson coupe le centre"} de Diatta !`,
        ballPos: { x: 0.5, y: 0.1 }
      };
    } else if (r < 0.65) {
      return {
        minute,
        type: "goal",
        team: "ai",
        desc: `😰 BUT BELGE ! Pris en contre-attaque rapide en raison du bloc ultra-haut sénégalais. Kevin De Bruyne décale Jérémy Doku qui ajuste Diaw.`,
        ballPos: { x: 0.5, y: 0.9 }
      };
    } else {
      return {
        minute,
        type: "shot",
        desc: `🎯 Grosse occasion de but pour le Sénégal ! Le système offensif permet à Lamine Camara de frapper de loin, Casteels s'interpose en deux temps !`,
        ballPos: { x: 0.45, y: 0.15 }
      };
    }
  }

  if (tacticId === "defensive") {
    if (r < 0.15) {
      return {
        minute,
        type: "goal",
        team: "sen",
        player: "Jackson",
        desc: `⚽ BUT DE FILOU ! Sur l'une de leurs rares incursions, les Lions marquent sur corner grâce à un coup de tête de Koulibaly dévié !`,
        ballPos: { x: 0.52, y: 0.08 }
      };
    } else if (r < 0.30) {
      return {
        minute,
        type: "save",
        desc: `🧤 Parade impériale de Mory Diaw ! Le bloc bas protège parfaitement la surface, forçant Lukaku à tenter un tir difficile capté avec autorité.`,
        ballPos: { x: 0.5, y: 0.91 }
      };
    } else {
      return {
        minute,
        type: "text",
        desc: `🛡️ Tactique Verrou activée : le Sénégal dresse une muraille infranchissable en ${formation}. De Bruyne s'impatiente au milieu de terrain.`,
        ballPos: { x: 0.5, y: 0.72 }
      };
    }
  }

  if (tacticId === "counter") {
    if (r < 0.40) {
      return {
        minute,
        type: "goal",
        team: "sen",
        player: hasNdiaye ? "Ndiaye" : "Mane",
        desc: `⚡ TRANSITION FULGURANTE ! Récupération basse de Gueye, transition laser vers ${hasNdiaye ? "Iliman Ndiaye" : "Sadio Mané"} qui s'en va battre Casteels en un contre un !`,
        ballPos: { x: 0.5, y: 0.08 }
      };
    } else {
      return {
        minute,
        type: "text",
        desc: `⚡ Contre-attaque rapide initiée par Ismaïla Sarr sur l'aile droite. Son centre fort devant le but manque de peu d'être coupé par Jackson.`,
        ballPos: { x: 0.78, y: 0.25 }
      };
    }
  }

  // Balanced State
  if (r < 0.25) {
    return {
      minute,
      type: "shot",
      desc: `🎯 Frappe tendue de Nicolas Jackson après un bon relais de Camara. Le ballon rase le montant droit de la Belgique !`,
      ballPos: { x: 0.55, y: 0.18 }
    };
  } else if (r < 0.45) {
    return {
      minute,
      type: "save",
      desc: `🧤 Mory Diaw capte une tentative lointaine de Tielemans après un bon travail de conservation belge.`,
      ballPos: { x: 0.5, y: 0.89 }
    };
  } else {
    return {
      minute,
      type: "text",
      desc: `⚽ Jeu équilibré au milieu de terrain. Les deux blocs se neutralisent tactiquement dans cette configuration.`,
      ballPos: { x: 0.5, y: 0.5 }
    };
  }
}

function calcPlayerPosition(pid, phase, formation) {
  const currentForm = FORMATIONS[formation] || FORMATIONS["4-3-3"];
  let key = null;
  if (["diaw_23", "mendy_16"].includes(pid)) key = "GK";
  else if (pid === "diatta_15") key = "DEF1";
  else if (pid === "koulibaly_3") key = "DEF2";
  else if (pid === "niakhate_19") key = "DEF3";
  else if (pid === "diouf_25") key = "DEF4";
  else if (pid === "gueye_5") key = "MIL1";
  else if (["camara_8", "diarra_21"].includes(pid)) key = "MIL2";
  else if (["gueye_26", "ndiaye_13"].includes(pid)) key = "MIL3";
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
      dy = -0.09;
      if (key === "DEF1") { dx = 0.03; dy = -0.14; }
      if (key === "DEF4") { dx = -0.03; dy = -0.14; }
      if (key === "ATT3") { dx = 0.07; } 
      break;
    case "contre_attaque":
      dy = -0.14;
      if (key.startsWith("ATT")) dy = -0.19;
      break;
    case "defence_placee":
      dy = 0.07;
      if (key.startsWith("MIL")) dy = 0.09;
      break;
    case "transition_def":
      dy = 0.04;
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

function PlayerToken({ x, y, num, name, star, highlighted, color, borderColor, stamina }) {
  const r = star ? 13 : 11;
  const isLowStamina = stamina < 30;

  return (
    <g style={{ transform: `translate(${x}px, ${y}px)`, transition: "transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)" }}>
      {highlighted && (
        <circle r={r+7} fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="3,2" className="animate-pulse" />
      )}
      <circle r={r} fill={color} stroke={borderColor} strokeWidth={star || highlighted ? 2.5 : 1.5} />
      
      {/* Stamina radial ring indicator */}
      <circle r={r+2} fill="none" stroke={isLowStamina ? "#ef4444" : "#10b981"} strokeWidth="1.2" 
              strokeDasharray={`${(stamina / 100) * (2 * Math.PI * (r+2))}, 100`} />

      <text textAnchor="middle" y="3.5" fill="white" fontSize="8" fontWeight="700">{num}</text>
      <text textAnchor="middle" y="18" fill={star ? "#ffd700" : "rgba(255,255,255,0.75)"} fontSize="6" fontWeight="600">{name}</text>
    </g>
  );
}

function getPhase(tacticId) {
  const map = {
    balanced: "progression",
    offensive: "attaque_placee",
    counter: "contre_attaque",
    defensive: "defence_placee"
  };
  return map[tacticId] ?? "progression";
}

// Generates movement run arrows dynamically depending on the selected tactic & current positions
function getTacticalArrows(tacticId, formation, W, H, senFormation) {
  const arrows = [];
  
  const getCoords = (key) => {
    const base = senFormation[key];
    if (!base) return null;
    const phase = getPhase(tacticId);
    const dynPos = calcPlayerPosition(key === "GK" ? "diaw_23" : "other", phase, formation);
    return { x: dynPos.x * W, y: dynPos.y * H };
  };

  if (tacticId === "offensive") {
    // Mane (ATT3 - left wing) cuts inside with curve path
    const pMane = getCoords("ATT3");
    if (pMane) {
      arrows.push({
        id: "mane-run",
        d: `M ${pMane.x} ${pMane.y} Q ${pMane.x + 35} ${pMane.y - 15} ${pMane.x + 45} ${pMane.y - 50}`,
        color: "#fbbf24", // Amber repique run
        marker: "url(#arrow-yellow)"
      });
    }
    // Sarr (ATT1 - right wing) overflows vertical
    const pSarr = getCoords("ATT1");
    if (pSarr) {
      arrows.push({
        id: "sarr-run",
        d: `M ${pSarr.x} ${pSarr.y} L ${pSarr.x} ${pSarr.y - 60}`,
        color: "#38bdf8", // Sky blue run
        marker: "url(#arrow-blue)"
      });
    }
    // Diatta (DEF1 - fullback) overlaps on the right flank
    const pDiatta = getCoords("DEF1");
    if (pDiatta) {
      arrows.push({
        id: "diatta-overlap",
        d: `M ${pDiatta.x} ${pDiatta.y} Q ${pDiatta.x + 20} ${pDiatta.y - 30} ${pDiatta.x} ${pDiatta.y - 75}`,
        color: "#34d399", // Emerald overlap run
        marker: "url(#arrow-green)"
      });
    }
  } else if (tacticId === "counter") {
    // Lightning transitions: Direct vertical pass from defensive mid (Gueye) to Mane
    const pGueye = getCoords("MIL1");
    const pMane = getCoords("ATT3");
    if (pGueye && pMane) {
      arrows.push({
        id: "counter-pass",
        d: `M ${pGueye.x} ${pGueye.y} L ${pMane.x + 10} ${pMane.y + 15}`,
        color: "#fbbf24", // Yellow laser pass
        marker: "url(#arrow-yellow)",
        isPass: true
      });
    }
    // Jackson (ATT2) deep run behind the defence
    const pJackson = getCoords("ATT2");
    if (pJackson) {
      arrows.push({
        id: "jackson-run",
        d: `M ${pJackson.x} ${pJackson.y} L ${pJackson.x} ${pJackson.y - 65}`,
        color: "#f87171", // Red strike run
        marker: "url(#arrow-red)"
      });
    }
  } else if (tacticId === "defensive") {
    // Inward defensive coverage arrows for block compaction
    const pDef1 = getCoords("DEF1");
    const pDef2 = getCoords("DEF2");
    if (pDef1 && pDef2) {
      arrows.push({
        id: "compact-right",
        d: `M ${pDef1.x} ${pDef1.y} L ${pDef2.x + 20} ${pDef2.y + 10}`,
        color: "#10b981", // Compact screen run
        marker: "url(#arrow-green)"
      });
    }
    const pDef4 = getCoords("DEF4");
    const pDef3 = getCoords("DEF3");
    if (pDef4 && pDef3) {
      arrows.push({
        id: "compact-left",
        d: `M ${pDef4.x} ${pDef4.y} L ${pDef3.x - 20} ${pDef3.y + 10}`,
        color: "#10b981",
        marker: "url(#arrow-green)"
      });
    }
  } else {
    // Balanced
    const pMil2 = getCoords("MIL2");
    const pAtt2 = getCoords("ATT2");
    if (pMil2 && pAtt2) {
      arrows.push({
        id: "balanced-distribution",
        d: `M ${pMil2.x} ${pMil2.y} L ${pAtt2.x} ${pAtt2.y + 25}`,
        color: "#38bdf8",
        marker: "url(#arrow-blue)"
      });
    }
  }
  return arrows;
}

export function MatchField({
  events = [], currentMin = 0, phase = "idle",
  senScore = 0, norScore = 0,
  formation = "4-3-3", tacticId = "balanced",
  awayFlag = "🇧🇪", awayName = "Belgique",
  activePlayers = INITIAL_SEN_PLAYERS,
  ballPos, momentumVal
}) {
  const [tacticalState, setTacticalState] = useState("bloc_median");
  const [ballX, setBallX] = useState(W / 2);
  const [ballY, setBallY] = useState(H / 2);
  const [flash, setFlash] = useState(null);
  const [lastMinute, setLastMinute] = useState(-1);
  const [highlightedNum, setHighlightedNum] = useState(null);
  const [tacticalLabel, setTacticalLabel] = useState("Jeu en cours — phase tactique active");
  const [lastEvent, setLastEvent] = useState(null);

  const senFormation = FORMATIONS[formation] ?? FORMATIONS["4-3-3"];
  const currentPhase = getPhase(tacticId);
  const tacticalArrows = getTacticalArrows(tacticId, formation, W, H, senFormation);

  // Sync ball position with dynamic engine events
  useEffect(() => {
    if (ballPos) {
      setBallX(ballPos.x * W);
      setBallY(ballPos.y * H);
    }
  }, [ballPos]);

  useEffect(() => {
    if (!events.length) return;
    const last = events[events.length - 1];
    if (last.minute === lastMinute) return;
    setLastMinute(last.minute);
    setLastEvent(last);

    if (last.type === "goal" && last.team === "sen") {
      setFlash("goal_sen");
      setTacticalLabel("⚽ BUT SÉNÉGALAIS !");
      const scorer = activePlayers.find(p =>
        last.player && p.name.toLowerCase().split(".")[0].includes(last.player.toLowerCase().split(".")[0].substring(0,4))
      );
      setHighlightedNum(scorer?.num ?? null);
      setTimeout(() => {
        setFlash(null); 
        setHighlightedNum(null);
        setTacticalLabel("Le jeu reprend tactiquement");
      }, 2500);
    } else if (last.type === "goal" && last.team === "ai") {
      setFlash("goal_adv");
      setTacticalLabel("😰 But encaissé — réajustement tactique requis");
      setTimeout(() => {
        setFlash(null);
      }, 2500);
    } else if (last.type === "save") {
      setTacticalLabel("🧤 Parade décisive des Sénégalais !");
    } else if (last.type === "shot") {
      setTacticalLabel("🎯 Occasion chaude sénégalaise !");
    } else if (last.type === "text") {
      setTacticalLabel(last.desc);
    }
  }, [events, activePlayers, lastMinute]);

  return (
    <div className="relative w-full max-w-[360px] mx-auto bg-slate-900 rounded-xl overflow-hidden p-3 shadow-2xl border border-slate-800">
      
      {/* TV Goal Replay Overlay */}
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

      {/* SVG Canvas Pitch representation */}
      <svg viewBox={`0 0 ${W} ${H+5}`} className="w-full h-auto block rounded-lg bg-emerald-950">
        {/* Dynamic Glowing Arrow Definitions */}
        <defs>
          <marker id="arrow-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
          </marker>
          <marker id="arrow-yellow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
          </marker>
          <marker id="arrow-green" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399" />
          </marker>
          <marker id="arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f87171" />
          </marker>
        </defs>

        <rect width={W} height={H} fill="#1e6b2f" rx="10" />
        {[0,1,2,3,4,5,6,7].map(i => (
          <rect key={i} x="0" y={i*(H/8)} width={W} height={H/8}
            fill={i%2===0?"rgba(0,0,0,0.05)":"transparent"}/>
        ))}
        <rect x="8" y="8" width={W-16} height={H-16} fill="none" stroke="#2d8a42" strokeWidth="1.2" rx="6"/>
        <line x1="8" y1={H/2} x2={W-8} y2={H/2} stroke="#2d8a42" strokeWidth="1.2"/>
        <circle cx={W/2} cy={H/2} r="42" fill="none" stroke="#2d8a42" strokeWidth="1.2"/>
        <circle cx={W/2} cy={H/2} r="3" fill="#2d8a42"/>
        <rect x="88"  y="8"      width="164" height="82" fill="none" stroke="#2d8a42" strokeWidth="1"/>
        <rect x="118" y="8"      width="104" height="38" fill="none" stroke="#2d8a42" strokeWidth="1"/>
        <rect x="88"  y={H-90}   width="164" height="82" fill="none" stroke="#2d8a42" strokeWidth="1"/>
        <rect x="118" y={H-46}   width="104" height="38" fill="none" stroke="#2d8a42" strokeWidth="1"/>

        {}
        {/* Render dynamic tactical arrows */}
        {tacticalArrows.map(arrow => (
          <path
            key={arrow.id}
            d={arrow.d}
            fill="none"
            stroke={arrow.color}
            strokeWidth={arrow.isPass ? 2 : 2.5}
            strokeDasharray={arrow.isPass ? "3,4" : "5,4"}
            markerEnd={arrow.marker}
            className="transition-all duration-1000 ease-in-out"
            style={{ opacity: 0.8 }}
          />
        ))}

        {/* Dynamic Belgian defensive deployment based on state */}
        {Object.entries(ADV_BASE).slice(0, 11).map(([key, pos], i) => {
          const advPlayer = BELGIUM_PLAYERS[i] || { name: "Adv.", number: 99, star: false };
          return (
            <g key={`adv-${key}`}>
              <circle cx={pos.x*W} cy={pos.y*H} r={advPlayer.star ? 12 : 10}
                fill="#8b1c1c" stroke={advPlayer.star ? "#ffd700" : "rgba(255,255,255,0.55)"} strokeWidth={advPlayer.star ? 2 : 1.5} />
              <text x={pos.x*W} y={pos.y*H+3.5} textAnchor="middle" fill="white" fontSize="7.5" fontWeight="700">
                {advPlayer.number}
              </text>
              <text x={pos.x*W} y={pos.y*H+17} textAnchor="middle" fill={advPlayer.star ? "#ffd700" : "rgba(255,180,180,0.75)"} fontSize="5.5" fontWeight="600">
                {advPlayer.name.split(" ").pop()}
              </text>
            </g>
          );
        })}

        {/* Dynamic positioning of Senegal players based on formation */}
        {activePlayers.map(p => {
          const base = senFormation[p.key];
          if (!base) return null;
          const dynPos = p.pid ? calcPlayerPosition(p.pid, currentPhase, formation) : null;
          const fx = dynPos ? dynPos.x * W : base.x * W;
          const fy = dynPos ? dynPos.y * H : base.y * H;
          const isSub = !INITIAL_SEN_PLAYERS.some(orig => orig.pid === p.pid);

          return (
            <PlayerToken key={`sen-${p.key}`}
              x={fx} y={fy}
              num={p.num} name={p.name.split(" ").pop()} star={p.star}
              highlighted={highlightedNum === p.num}
              color={isSub ? "#1d4ed8" : "#1a5c28"}
              borderColor={isSub ? "#3b82f6" : p.star ? "#ffd700" : "rgba(255,255,255,0.85)"}
              stamina={p.stamina} />
          );
        })}

        {/* Animated Match Ball */}
        <g style={{ transform: `translate(${ballX}px, ${ballY}px)`, transition: "transform 0.85s ease-out" }}>
          <circle r="6" fill="white" stroke="#bbb" strokeWidth="0.8" />
          <circle r="2.5" fill="#334155" />
        </g>

        {/* Interactive scoreboard elements on pitch */}
        <rect x={W/2-30} y={H/2-14} width="60" height="19" fill="rgba(0,0,0,0.70)" rx="5"/>
        <text x={W/2} y={H/2-1} textAnchor="middle" fill="white" fontSize="12"
          fontFamily="sans-serif" fontWeight="700">{senScore} - {norScore}</text>

        <text x={W/2} y={H-4} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="7" fontFamily="sans-serif">
          🇸🇳 SÉN ↑ · 🇧🇪 BEL ↓
        </text>
      </svg>

      {/* Narrative and tactical logs */}
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

      {lastEvent?.desc && (
        <div className="mt-2 bg-slate-950/60 rounded-lg p-2 text-[11px] text-slate-300 leading-relaxed border border-slate-800/40 animate-fadeIn">
          <span className="text-amber-500 font-mono mr-1.5 font-bold">
            {lastEvent.minute}'
          </span>
          <span className="text-slate-300 italic">
            {lastEvent.desc}
          </span>
        </div>
      )}

      {/* Stamina & highlight legend */}
      <div className="flex gap-3 justify-center mt-3 text-[9px] text-slate-500 font-medium">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border border-emerald-500 inline-block"></span> Endurance OK</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border border-rose-500 inline-block"></span> Fatigue Critique</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-600 rounded-full inline-block"></span> Remplaçant</span>
      </div>
    </div>
  );
}

function PauseTactiquePanel({
  currentMin, homeScore, awayScore,
  tactic, activePlayers, senegalBench,
  onResume, onSubstitute, pendingTactic, setPendingTactic
}) {
  const [activeTab, setActiveTab] = useState("tactic");
  const [subTarget, setSubTarget] = useState(null);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-emerald-950/80 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">PAUSE TACTIQUE DIRECTE</span>
            <h2 className="text-lg font-black text-white">{currentMin}' — Vestiaire & Stratégie</h2>
          </div>
          <div className="text-xl font-bold text-yellow-500 bg-slate-950/50 px-3 py-1 rounded">
            {homeScore} - {awayScore}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800">
          <button 
            onClick={() => setActiveTab("tactic")}
            className={`flex-1 py-2.5 text-xs font-bold transition ${activeTab === "tactic" ? "border-b-2 border-emerald-400 text-emerald-400" : "text-slate-400"}`}
          >
            🎯 Directives Stratégiques
          </button>
          <button 
            onClick={() => setActiveTab("subs")}
            className={`flex-1 py-2.5 text-xs font-bold transition ${activeTab === "subs" ? "border-b-2 border-emerald-400 text-emerald-400" : "text-slate-400"}`}
          >
            🔄 Remplacements ({senegalBench.length} disponibles)
          </button>
        </div>

        <div className="p-4 max-h-[380px] overflow-y-auto">
          {activeTab === "tactic" && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 mb-2">Configurez la directive globale de vos Lions de la Téranga :</p>
              {TACTICS.map(t => {
                const isSelected = (pendingTactic || tactic).id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setPendingTactic(t)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center gap-3 ${
                      isSelected ? "border-emerald-500 bg-emerald-500/10 text-white" : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-2xl">{t.emoji}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm text-white">{t.name}</h4>
                        <span className="text-[10px] text-slate-500">Stamina: {t.staminaMod}x</span>
                      </div>
                      <p className="text-xs text-slate-400">{t.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === "subs" && (
            <div className="space-y-3">
              {!subTarget ? (
                <>
                  <p className="text-xs text-slate-400">Sélectionnez le joueur titulaire fatigué à sortir :</p>
                  <div className="grid grid-cols-2 gap-2">
                    {activePlayers.map(p => {
                      const isLow = p.stamina < 30;
                      return (
                        <button
                          key={p.pid}
                          onClick={() => setSubTarget(p)}
                          className={`p-2.5 border rounded-lg text-left text-xs transition flex flex-col gap-1 ${
                            isLow ? "bg-rose-950/30 border-rose-900/50 hover:border-rose-600" : "bg-slate-950/50 border-slate-800 hover:border-emerald-500"
                          }`}
                        >
                          <div className="flex justify-between w-full font-bold">
                            <span className="text-slate-200 truncate">{p.name}</span>
                            <span className="text-slate-400">#{p.num}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-500">{p.role}</span>
                            <span className={isLow ? "text-rose-400 font-extrabold animate-pulse" : "text-emerald-400 font-bold"}>
                              ⚡ {p.stamina}%
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/40 text-xs">
                    <span className="text-rose-400">Joueur Sortant : <strong>{subTarget.name} ({subTarget.stamina}% Stamina)</strong></span>
                    <button onClick={() => setSubTarget(null)} className="text-slate-400 underline hover:text-white">Annuler</button>
                  </div>
                  <p className="text-xs text-slate-400">Choisissez une arme fraîche sur le banc sénégalais :</p>
                  <div className="space-y-2">
                    {senegalBench.map(b => (
                      <button
                        key={b.pid}
                        onClick={() => {
                          onSubstitute(subTarget, b);
                          setSubTarget(null);
                        }}
                        className="w-full p-3 bg-slate-950/60 border border-slate-800 hover:border-emerald-500/50 rounded-xl flex justify-between items-center transition"
                      >
                        <div className="text-left">
                          <h4 className="font-bold text-white text-sm">{b.name}</h4>
                          <span className="text-xs text-slate-400">{PLAYER_PROFILES[b.pid]?.role || b.role}</span>
                        </div>
                        <span className="text-xs text-emerald-400 font-bold bg-emerald-950/40 px-2 py-1 rounded">
                          Faire Entrer ➜
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
          <button
            onClick={() => onResume(null)}
            className="flex-1 py-2.5 bg-slate-800 text-slate-200 font-bold rounded-xl text-xs hover:bg-slate-700 transition"
          >
            ▶ Continuer sans modification
          </button>
          {pendingTactic && pendingTactic.id !== tactic.id && (
            <button
              onClick={() => onResume(pendingTactic)}
              className="flex-1 py-2.5 bg-emerald-600 text-white font-black rounded-xl text-xs hover:bg-emerald-500 shadow-lg transition"
            >
              ✓ Appliquer & Reprendre
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default function App() {
  const [currentMin, setCurrentMin] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [formation, setFormation] = useState("4-3-3");
  const [tactic, setTactic] = useState(TACTICS[0]);
  const [pendingTactic, setPendingTactic] = useState(null);
  const [showPause, setShowPause] = useState(false);
  
  const [activePlayers, setActivePlayers] = useState(INITIAL_SEN_PLAYERS);
  const [senScore, setSenScore] = useState(0);
  const [belScore, setBelScore] = useState(0);
  const [matchEvents, setMatchEvents] = useState([
    { minute: 0, type: "text", desc: "Seattle Stadium 2026. Coup d'envoi du choc de Gala Sénégal vs Belgique devant 65 000 spectateurs !" }
  ]);

  // Momentum tracker (0 to 100, where 50 is balanced, higher means Senegal is dominating)
  const [momentum, setMomentum] = useState(50);
  const [ballPosition, setBallPosition] = useState({ x: 0.5, y: 0.5 });

  const [senegalBench, setSenegalBench] = useState([
    { key:"MIL3", num:13, name:"I. Ndiaye",  role:"MIL", star:false, pid:"ndiaye_13", stamina: 100 },
    { key:"MIL3", num:26, name:"P. Gueye",  role:"MIL", star:false, pid:"gueye_26", stamina: 100 },
    { key:"GK",   num:16, name:"É. Mendy",  role:"GK",  star:false, pid:"mendy_16", stamina: 100 }
  ]);

  // Coach real-time recommendation advice box
  const [coachAdvice, setCoachAdvice] = useState("Consignes initiales validées. Surveillez l'endurance de Sadio Mané et de Kalidou Koulibaly.");

  // Game Loop Match Tick Simulator
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentMin(prevMin => {
          if (prevMin >= 90) {
            setIsPlaying(false);
            return 90;
          }

          const nextMin = prevMin + 1;

          // 1. Manage dynamic stamina depletion based on active tactics
          setActivePlayers(currPlayers => 
            currPlayers.map(p => {
              const baseDepletion = 0.4;
              const multiplier = tactic.staminaMod;
              const finalStamina = Math.max(0, parseFloat((p.stamina - (baseDepletion * multiplier)).toFixed(1)));
              return { ...p, stamina: finalStamina };
            })
          );

          // 2. Dynamically shift momentum depending on chosen tactic and player fatigue
          setMomentum(prevMom => {
            const hasFatigued = activePlayers.some(p => p.stamina < 30);
            let shift = 0;
            if (tactic.id === "offensive") shift = 1.5;
            if (tactic.id === "counter") shift = 0.5;
            if (tactic.id === "defensive") shift = -1.2;
            if (hasFatigued) shift -= 1.0; // Fatigue decreases momentum!

            return Math.max(15, Math.min(85, prevMom + shift + (Math.random() * 4 - 2)));
          });

          // 3. Trigger dynamic actions based on Tactic/Formation every 5-6 minutes
          if (nextMin % 6 === 0) {
            const ev = generateProceduralEvent(nextMin, tactic.id, formation, senScore, belScore, activePlayers);
            setMatchEvents(prev => [...prev, ev]);

            if (ev.type === "goal") {
              if (ev.team === "sen") {
                setSenScore(s => s + 1);
              } else {
                setBelScore(b => b + 1);
              }
            }

            if (ev.ballPos) {
              setBallPosition(ev.ballPos);
            }
          } else {
            // Ball standard dribble simulation based on possession/momentum
            const attackZone = tactic.id === "offensive" ? 0.25 : tactic.id === "defensive" ? 0.72 : 0.48;
            setBallPosition({
              x: parseFloat((0.2 + Math.random() * 0.6).toFixed(2)),
              y: parseFloat((attackZone + (Math.random() * 0.15 - 0.075)).toFixed(2))
            });
          }

          // 4. Generate Live Coach Insights based on game situations
          const lowStamPlayers = activePlayers.filter(p => p.stamina < 30);
          if (lowStamPlayers.length > 0) {
            setCoachAdvice(`⚠️ Coach : ${lowStamPlayers[0].name} est à court de carburant. Faites pause ⏸️ pour faire entrer du sang frais !`);
          } else if (belScore > senScore) {
            setCoachAdvice("📋 Coach : Menés au score ! Passez en mode 'Attaque Totale' ou insérez Iliman Ndiaye.");
          } else if (senScore > belScore && tactic.id === "offensive") {
            setCoachAdvice("📋 Coach : Nous menons ! Sécurisez le score avec le 'Verrou Téranga' pour éviter le contre.");
          } else {
            setCoachAdvice("📋 Coach : Bloc en place. Ajustez le système selon les opportunités belges.");
          }

          return nextMin;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, tactic, formation, activePlayers, senScore, belScore]);

  const handleLiveSubstitute = (outPlayer, inPlayer) => {
    setActivePlayers(prev => prev.map(p => p.pid === outPlayer.pid ? { ...inPlayer, key: outPlayer.key } : p));
    setSenegalBench(prev => prev.filter(b => b.pid !== inPlayer.pid));
    
    // Inject the substitution announcement as a dynamic game event
    setMatchEvents(prev => [...prev, {
      minute: currentMin,
      type: "text",
      desc: `🔄 Changement tactique : ${inPlayer.name} remplace ${outPlayer.name} pour redynamiser le onze !`
    }]);
    setShowPause(false);
  };

  const handlePauseResume = (newTactic) => {
    if (newTactic) {
      setTactic(newTactic);
      setMatchEvents(prev => [...prev, {
        minute: currentMin,
        type: "text",
        desc: `⚡ Ajustement Vestiaire : Le Sénégal adopte une stratégie de type "${newTactic.name}".`
      }]);
    }
    setShowPause(false);
    setIsPlaying(true);
  };

  const resetSimulation = () => {
    setCurrentMin(0);
    setIsPlaying(false);
    setSenScore(0);
    setBelScore(0);
    setActivePlayers(INITIAL_SEN_PLAYERS);
    setSenegalBench([
      { key:"MIL3", num:13, name:"I. Ndiaye",  role:"MIL", star:false, pid:"ndiaye_13", stamina: 100 },
      { key:"MIL3", num:26, name:"P. Gueye",  role:"MIL", star:false, pid:"gueye_26", stamina: 100 },
      { key:"GK",   num:16, name:"É. Mendy",  role:"GK",  star:false, pid:"mendy_16", stamina: 100 }
    ]);
    setMatchEvents([
      { minute: 0, type: "text", desc: " Seattle Stadium 2026. Coup d'envoi du choc de Gala Sénégal vs Belgique devant 65 000 spectateurs !" }
    ]);
    setMomentum(50);
    setBallPosition({ x: 0.5, y: 0.5 });
    setCoachAdvice("Match réinitialisé. Prêt à lancer le plan de jeu.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row justify-center items-center p-4 gap-6 font-sans">
      
      {/* Interactive tactical dressing-room layout popin */}
      {showPause && (
        <PauseTactiquePanel
          currentMin={currentMin}
          homeScore={senScore}
          awayScore={belScore}
          tactic={tactic}
          activePlayers={activePlayers}
          senegalBench={senegalBench}
          pendingTactic={pendingTactic}
          setPendingTactic={setPendingTactic}
          onResume={handlePauseResume}
          onSubstitute={handleLiveSubstitute}
        />
      )}

      {/* Regie control and tactical dashboard panel */}
      <div className="w-full max-w-[380px] bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4">
        <div>
          <div className="text-cyan-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> REGIE CANAL+ SPORT DIRECT
          </div>
          <h1 className="text-xl font-black mt-1">Simulateur de Coaching MVP</h1>
          <p className="text-xs text-slate-400 mt-1">Configurez les variables tactiques en direct et observez les conséquences sur le scénario du match.</p>
        </div>

        {/* Live Match Clock and Action triggers */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Chrono Virtuel</span>
            <span className="text-3xl font-mono font-bold text-amber-500">{currentMin} : 00'</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (isPlaying) {
                  setIsPlaying(false);
                  setPendingTactic(tactic);
                  setShowPause(true);
                } else {
                  setIsPlaying(true);
                }
              }}
              className={`p-3 rounded-full flex items-center justify-center transition ${isPlaying ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
              title={isPlaying ? "Faire Pause & Ajuster Stratégie" : "Démarrer Simulation Directe"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <button
              onClick={resetSimulation}
              className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-300 transition"
              title="Réinitialiser Match"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Momentum Dominance Tracker */}
        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-emerald-400">🇸🇳 Sénégal ({Math.round(momentum)}%)</span>
            <span className="text-rose-400">Belgique ({Math.round(100 - momentum)}%)</span>
          </div>
          <div className="w-full bg-rose-950/50 h-2.5 rounded-full overflow-hidden flex">
            <div 
              className="bg-emerald-500 h-full transition-all duration-700"
              style={{ width: `${momentum}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-500 text-center italic">Domination dynamique du match en direct</span>
        </div>

        {/* System of play Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-cyan-400" /> Système Sénégalais
          </label>
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

        {/* Real-time Tactic selection feedback */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-cyan-400" /> Directives Actives
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TACTICS.map(t => (
              <button
                key={t.id}
                onClick={() => setTactic(t)}
                className={`p-2 text-xs font-bold rounded-lg border transition text-left flex items-center gap-1.5 ${tactic.id === t.id ? 'bg-emerald-600/20 border-emerald-500 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'}`}
              >
                <span>{t.emoji}</span>
                <span>{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Coach real-time recommendation advice box */}
        <div className="bg-amber-950/20 border border-amber-800/50 p-3 rounded-lg flex items-start gap-2 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold">Conseiller Tactique</span>
            <p className="text-slate-300 text-[11px] leading-relaxed font-medium">{coachAdvice}</p>
          </div>
        </div>
      </div>

      {/* Main Pitch Simulator Frame */}
      <div className="flex flex-col items-center">
        <MatchField
          events={matchEvents}
          currentMin={currentMin}
          phase={isPlaying ? "playing" : "idle"}
          senScore={senScore}
          norScore={belScore}
          formation={formation}
          tacticId={tactic.id}
          activePlayers={activePlayers}
          ballPos={ballPosition}
          momentumVal={momentum}
          awayFlag="🇧🇪"
          awayName="Belgique"
        />
      </div>

    </div>
  );
}