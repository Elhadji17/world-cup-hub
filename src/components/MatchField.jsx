// src/components/MatchField.jsx
// Terrain de football animé — pions qui bougent selon la zone de jeu
// Fix: utilise motion.g + translateX/Y au lieu de motion.circle cx/cy

import { useState, useEffect }     from "react";
import { motion, AnimatePresence } from "framer-motion";

const FIELD_W = 320;
const FIELD_H = 480;

const SEN_BASE = {
  GK:   [0.50, 0.08], DEF1: [0.15, 0.22], DEF2: [0.35, 0.20],
  DEF3: [0.65, 0.20], DEF4: [0.85, 0.22], MIL1: [0.20, 0.38],
  MIL2: [0.50, 0.36], MIL3: [0.80, 0.38], ATT1: [0.15, 0.52],
  ATT2: [0.50, 0.50], ATT3: [0.85, 0.52],
};

const NOR_BASE = {
  GK:   [0.50, 0.92], DEF1: [0.15, 0.78], DEF2: [0.35, 0.80],
  DEF3: [0.65, 0.80], DEF4: [0.85, 0.78], MIL1: [0.20, 0.64],
  MIL2: [0.50, 0.66], MIL3: [0.80, 0.64], ATT1: [0.15, 0.50],
  ATT2: [0.50, 0.48], ATT3: [0.85, 0.50],
};

const ZONE_DY = {
  defense: { sen: -0.05, nor: +0.05 },
  milieu:  { sen:  0,    nor:  0    },
  attaque: { sen: +0.08, nor: -0.05 },
  surface: { sen: +0.14, nor: -0.10 },
};

const SEN_PLAYERS = [
  { key: "GK",   num: 16, name: "Mendy",   star: false },
  { key: "DEF1", num: 15, name: "Diatta",  star: false },
  { key: "DEF2", num:  3, name: "Kouli",   star: false },
  { key: "DEF3", num: 19, name: "Niakh",   star: false },
  { key: "DEF4", num: 25, name: "Diouf",   star: false },
  { key: "MIL1", num:  5, name: "I.Gueye", star: false },
  { key: "MIL2", num:  8, name: "Camara",  star: true  },
  { key: "MIL3", num: 26, name: "P.Gueye", star: false },
  { key: "ATT1", num: 18, name: "I.Sarr",  star: false },
  { key: "ATT2", num: 11, name: "Jackson", star: false },
  { key: "ATT3", num: 10, name: "Mané",    star: true  },
];

const NOR_PLAYERS = [
  { key: "GK",   num:  1, name: "Nyland",   star: false },
  { key: "DEF1", num: 14, name: "Ryerson",  star: false },
  { key: "DEF2", num:  4, name: "Østigård", star: false },
  { key: "DEF3", num:  6, name: "Ajer",     star: false },
  { key: "DEF4", num:  2, name: "Wolfe",    star: false },
  { key: "MIL1", num:  8, name: "Berge",    star: false },
  { key: "MIL2", num: 10, name: "Ødegaard", star: true  },
  { key: "MIL3", num: 16, name: "Thorst.",  star: false },
  { key: "ATT1", num:  7, name: "Nusa",     star: false },
  { key: "ATT2", num:  9, name: "Haaland",  star: true  },
  { key: "ATT3", num: 11, name: "Sørloth",  star: false },
];

function Player({ base, dy, color, borderColor, num, name, star }) {
  const x = base[0] * FIELD_W;
  const y = Math.min(0.95, Math.max(0.05, base[1] + dy)) * FIELD_H;
  const r = star ? 11 : 9;

  return (
    <motion.g
      animate={{ x, y }}
      initial={{ x, y }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      <circle r={r} fill={color} stroke={borderColor} strokeWidth={star ? 2 : 1.5}/>
      <text textAnchor="middle" y="3" fill="white" fontSize="7" fontWeight="500">{num}</text>
      <text textAnchor="middle" y="17" fill={star ? "#ffd700" : (color === "#1a8c3c" ? "#b8f0c8" : "#ffc0bb")} fontSize="6">{name}</text>
    </motion.g>
  );
}

export default function MatchField({ events = [], currentMin = 0, phase = "idle", senScore = 0, norScore = 0 }) {
  const [possession, setPossession] = useState("me");
  const [zone,       setZone]       = useState("milieu");
  const [ballX,      setBallX]      = useState(FIELD_W / 2);
  const [ballY,      setBallY]      = useState(FIELD_H / 2);
  const [flash,      setFlash]      = useState(null);
  const [lastMinute, setLastMinute] = useState(-1);

  useEffect(() => {
    if (events.length === 0) return;
    const visible = events.filter(e => e.minute <= currentMin);
    if (visible.length === 0) return;
    const last = visible[visible.length - 1];
    if (last.minute === lastMinute) return;
    setLastMinute(last.minute);

    if (last.type === "goal") {
      setPossession(last.team === "me" ? "ai" : "me");
      setZone("milieu");
      setBallX(FIELD_W / 2);
      setBallY(FIELD_H / 2);
      setFlash(last.team === "me" ? "goal_sen" : "goal_nor");
      setTimeout(() => setFlash(null), 1800);
    } else if (last.type === "miss" || last.type === "save") {
      setPossession(last.team === "me" ? "ai" : "me");
      setZone("milieu");
      setBallX(FIELD_W * (0.3 + Math.random() * 0.4));
      setBallY(FIELD_H * (last.team === "me" ? 0.65 + Math.random() * 0.1 : 0.25 + Math.random() * 0.1));
    } else if (last.type === "corner") {
      setZone("surface");
      setBallX(FIELD_W * (Math.random() < 0.5 ? 0.03 : 0.97));
      setBallY(FIELD_H * (last.team === "me" ? 0.90 : 0.10));
    }
  }, [currentMin, events]);

  // Animation de fond — le ballon bouge entre les événements
  useEffect(() => {
    if (phase !== "playing" && phase !== "playing2") return;
    const id = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.25) setPossession(p => p === "me" ? "ai" : "me");
      if (rand < 0.5)  setZone(z => {
        const zs = ["defense","milieu","attaque","surface"];
        return zs[(zs.indexOf(z) + 1) % zs.length];
      });
      setBallX(FIELD_W * (0.15 + Math.random() * 0.7));
      setBallY(FIELD_H * (0.1 + Math.random() * 0.8));
    }, 3500);
    return () => clearInterval(id);
  }, [phase]);

  const { sen: senDy, nor: norDy } = ZONE_DY[zone] ?? ZONE_DY.milieu;

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "320px", margin: "0 auto" }}>

      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "absolute", inset: 0, zIndex: 10, borderRadius: "8px", pointerEvents: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: flash === "goal_sen" ? "rgba(26,140,60,0.88)" : "rgba(192,57,43,0.88)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "44px" }}>⚽</div>
              <div style={{ color: "white", fontWeight: 700, fontSize: "22px" }}>
                {flash === "goal_sen" ? "BUT ! 🇸🇳" : "BUT ! 🇳🇴"}
              </div>
              <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "30px", fontWeight: 700 }}>
                {senScore} - {norScore}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <svg viewBox={`0 0 ${FIELD_W} ${FIELD_H}`} style={{ width: "100%", display: "block", borderRadius: "8px" }}>
        {/* Terrain */}
        <rect width={FIELD_W} height={FIELD_H} fill="#2d7a3a" rx="8"/>
        <rect x="8" y="8" width={FIELD_W-16} height={FIELD_H-16} fill="none" stroke="#3d9a4a" strokeWidth="1" rx="4"/>
        {[0,1,2,3,4,5,6,7].map(i => (
          <rect key={i} x="8" y={8 + i*58} width={FIELD_W-16} height="29" fill={i%2===0?"rgba(0,0,0,0.04)":"transparent"}/>
        ))}

        {/* Ligne médiane */}
        <line x1="8" y1={FIELD_H/2} x2={FIELD_W-8} y2={FIELD_H/2} stroke="#3d9a4a" strokeWidth="1"/>
        <circle cx={FIELD_W/2} cy={FIELD_H/2} r="35" fill="none" stroke="#3d9a4a" strokeWidth="1"/>
        <circle cx={FIELD_W/2} cy={FIELD_H/2} r="3" fill="#3d9a4a"/>

        {/* Surfaces */}
        <rect x="80" y="8" width="160" height="70" fill="none" stroke="#3d9a4a" strokeWidth="1"/>
        <rect x="110" y="8" width="100" height="35" fill="none" stroke="#3d9a4a" strokeWidth="1"/>
        <rect x="80" y={FIELD_H-78} width="160" height="70" fill="none" stroke="#3d9a4a" strokeWidth="1"/>
        <rect x="110" y={FIELD_H-43} width="100" height="35" fill="none" stroke="#3d9a4a" strokeWidth="1"/>

        {/* Buts */}
        <rect x="120" y="4" width="80" height="9" fill="none" stroke="white" strokeWidth="1.5"/>
        <rect x="120" y={FIELD_H-13} width="80" height="9" fill="none" stroke="white" strokeWidth="1.5"/>

        {/* Joueurs Sénégal */}
        {SEN_PLAYERS.map(p => (
          <Player key={`sen-${p.key}`} base={SEN_BASE[p.key]} dy={senDy}
            color="#1a8c3c" borderColor={p.star ? "#ffd700" : "white"}
            num={p.num} name={p.name} star={p.star}/>
        ))}

        {/* Joueurs Norvège */}
        {NOR_PLAYERS.map(p => (
          <Player key={`nor-${p.key}`} base={NOR_BASE[p.key]} dy={norDy}
            color="#c0392b" borderColor={p.star ? "#ffd700" : "white"}
            num={p.num} name={p.name} star={p.star}/>
        ))}

        {/* Ballon */}
        <motion.g animate={{ x: ballX, y: ballY }} initial={{ x: FIELD_W/2, y: FIELD_H/2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}>
          <circle r="5.5" fill="white" stroke="#999" strokeWidth="0.5"/>
          <circle r="2.5" fill="#bbb"/>
        </motion.g>

        {/* Indicateurs */}
        <rect x="8" y="8" width="76" height="16" fill={possession==="me"?"#1a8c3c":"#c0392b"} rx="3" opacity="0.9"/>
        <text x="46" y="19" textAnchor="middle" fill="white" fontSize="8" fontWeight="500">
          {possession==="me" ? "🇸🇳 balle" : "🇳🇴 balle"}
        </text>

        <rect x={FIELD_W-84} y="8" width="76" height="16" fill="rgba(0,0,0,0.45)" rx="3"/>
        <text x={FIELD_W-46} y="19" textAnchor="middle" fill="white" fontSize="8" fontWeight="500">
          {zone==="defense"?"Défense":zone==="milieu"?"Milieu":zone==="attaque"?"Attaque":"Surface"}
        </text>

        {/* Score central */}
        <rect x={FIELD_W/2-28} y={FIELD_H/2-13} width="56" height="17" fill="rgba(0,0,0,0.65)" rx="4"/>
        <text x={FIELD_W/2} y={FIELD_H/2-1} textAnchor="middle" fill="white" fontSize="10" fontWeight="500">
          {senScore} - {norScore}
        </text>
      </svg>

      <div style={{ display:"flex", gap:"12px", justifyContent:"center", marginTop:"6px", fontSize:"10px", color:"var(--color-text-secondary)" }}>
        <span style={{ display:"flex", alignItems:"center", gap:"4px" }}>
          <svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="#1a8c3c" stroke="#ffd700" strokeWidth="1.5"/></svg>
          Joueur clé Sénégal
        </span>
        <span style={{ display:"flex", alignItems:"center", gap:"4px" }}>
          <svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="#c0392b" stroke="#ffd700" strokeWidth="1.5"/></svg>
          Joueur clé Norvège
        </span>
      </div>
    </div>
  );
}
