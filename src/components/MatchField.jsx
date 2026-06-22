// src/components/MatchField.jsx
// Terrain de football animé — les pions se déplacent selon la zone de possession et les actions
// Utilisé par le Simulateur Tactique pour visualiser le match en temps réel

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence }      from "framer-motion";

// ── Positions de base par zone de possession ─────────────────────────────
// Chaque zone = positions x,y (en % du terrain, 0-100)
// Sénégal joue vers le bas (GK en haut), Norvège vers le haut (GK en bas)

const FIELD_W = 320;
const FIELD_H = 480;

// Positions initiales de la formation 4-3-3 du Sénégal (attaque vers le bas)
const SEN_BASE_POSITIONS = {
  GK:   { x: 0.5,  y: 0.08 },
  DEF1: { x: 0.15, y: 0.22 },
  DEF2: { x: 0.35, y: 0.20 },
  DEF3: { x: 0.65, y: 0.20 },
  DEF4: { x: 0.85, y: 0.22 },
  MIL1: { x: 0.2,  y: 0.38 },
  MIL2: { x: 0.5,  y: 0.36 },
  MIL3: { x: 0.8,  y: 0.38 },
  ATT1: { x: 0.15, y: 0.52 },
  ATT2: { x: 0.5,  y: 0.50 },
  ATT3: { x: 0.85, y: 0.52 },
};

// Positions initiales de la formation 4-3-3 de la Norvège (attaque vers le haut)
const NOR_BASE_POSITIONS = {
  GK:   { x: 0.5,  y: 0.92 },
  DEF1: { x: 0.15, y: 0.78 },
  DEF2: { x: 0.35, y: 0.80 },
  DEF3: { x: 0.65, y: 0.80 },
  DEF4: { x: 0.85, y: 0.78 },
  MIL1: { x: 0.2,  y: 0.64 },
  MIL2: { x: 0.5,  y: 0.66 },
  MIL3: { x: 0.8,  y: 0.64 },
  ATT1: { x: 0.15, y: 0.50 },
  ATT2: { x: 0.5,  y: 0.48 },
  ATT3: { x: 0.85, y: 0.50 },
};

// Décalages selon la zone de possession — quand le Sénégal attaque, ses joueurs avancent
const ZONE_OFFSETS = {
  // [sénégal_dy, norvège_dy] — dy en % du terrain
  defense:  { sen: -0.05, nor: +0.05 }, // Sénégal défend → recule
  milieu:   { sen: 0,     nor: 0     }, // Milieu → positions neutres
  attaque:  { sen: +0.08, nor: -0.05 }, // Sénégal attaque → avance
  surface:  { sen: +0.14, nor: -0.10 }, // Sénégal en surface → tous vers le but
};

// Inverts pour quand c'est la Norvège qui a la balle
function getPositionsForPossession(possession, zone) {
  const offsets = ZONE_OFFSETS[zone] ?? ZONE_OFFSETS.milieu;
  const senDy = possession === "me" ? offsets.sen : -offsets.nor;
  const norDy = possession === "me" ? offsets.nor : -offsets.sen;

  return { senDy, norDy };
}

// Joueurs du Sénégal avec numéros
const SEN_PLAYERS = [
  { key: "GK",   num: 16, name: "Mendy",    star: false },
  { key: "DEF1", num: 15, name: "Diatta",   star: false },
  { key: "DEF2", num:  3, name: "Kouli",    star: false },
  { key: "DEF3", num: 19, name: "Niakh",    star: false },
  { key: "DEF4", num: 25, name: "Diouf",    star: false },
  { key: "MIL1", num:  5, name: "I.Gueye",  star: false },
  { key: "MIL2", num:  8, name: "Camara",   star: true  },
  { key: "MIL3", num: 26, name: "P.Gueye",  star: false },
  { key: "ATT1", num: 18, name: "I.Sarr",   star: false },
  { key: "ATT2", num: 11, name: "Jackson",  star: false },
  { key: "ATT3", num: 10, name: "Mané",     star: true  },
];

const NOR_PLAYERS = [
  { key: "GK",   num:  1, name: "Nyland",  star: false },
  { key: "DEF1", num: 14, name: "Ryerson", star: false },
  { key: "DEF2", num:  4, name: "Østigård",star: false },
  { key: "DEF3", num:  6, name: "Ajer",    star: false },
  { key: "DEF4", num:  2, name: "Wolfe",   star: false },
  { key: "MIL1", num:  8, name: "Berge",   star: false },
  { key: "MIL2", num: 10, name: "Ødegaard",star: true  },
  { key: "MIL3", num: 16, name: "Thorst.", star: false },
  { key: "ATT1", num:  7, name: "Nusa",    star: false },
  { key: "ATT2", num:  9, name: "Haaland", star: true  },
  { key: "ATT3", num: 11, name: "Sørloth", star: false },
];

export default function MatchField({ events = [], currentMin = 0, phase = "idle", senScore = 0, norScore = 0 }) {
  const [possession, setPossession]   = useState("me");
  const [zone,       setZone]         = useState("milieu");
  const [ballPos,    setBallPos]      = useState({ x: 0.5, y: 0.5 });
  const [lastEvent,  setLastEvent]    = useState(null);
  const [flash,      setFlash]        = useState(null); // "goal_sen" | "goal_nor"

  // Synchroniser l'état du terrain avec les événements du match
  useEffect(() => {
    if (events.length === 0) return;
    const visible = events.filter(e => e.minute <= currentMin);
    if (visible.length === 0) return;

    const last = visible[visible.length - 1];
    if (last === lastEvent) return;
    setLastEvent(last);

    // Mettre à jour possession et zone selon le type d'événement
    if (last.type === "goal") {
      const scorer = last.team;
      setPossession(scorer === "me" ? "ai" : "me"); // relance adverse après but
      setZone("milieu");
      setBallPos({ x: 0.5, y: 0.5 });
      setFlash(scorer === "me" ? "goal_sen" : "goal_nor");
      setTimeout(() => setFlash(null), 1500);
    } else if (last.type === "miss" || last.type === "save") {
      setPossession(last.team === "me" ? "ai" : "me");
      setZone("milieu");
      setBallPos(last.team === "me"
        ? { x: 0.4 + Math.random() * 0.2, y: 0.7 + Math.random() * 0.1 }
        : { x: 0.4 + Math.random() * 0.2, y: 0.2 + Math.random() * 0.1 });
    } else if (last.type === "corner") {
      setZone("surface");
      setBallPos(last.team === "me"
        ? { x: Math.random() < 0.5 ? 0.05 : 0.95, y: 0.88 }
        : { x: Math.random() < 0.5 ? 0.05 : 0.95, y: 0.12 });
    } else if (last.type === "header") {
      setZone("surface");
    } else if (last.type === "yellow") {
      // Carton jaune — léger déplacement
      setBallPos({ x: 0.3 + Math.random() * 0.4, y: 0.3 + Math.random() * 0.4 });
    }
  }, [currentMin, events]);

  // Animation du ballon qui suit la progression du jeu
  useEffect(() => {
    if (phase !== "playing" && phase !== "playing2") return;

    const interval = setInterval(() => {
      // Simuler la progression de zone aléatoire entre les événements
      const rand = Math.random();
      if (rand < 0.3) {
        setPossession(p => p === "me" ? "ai" : "me");
        setZone("milieu");
      } else if (rand < 0.6) {
        setZone(z => {
          const zones = ["defense", "milieu", "attaque", "surface"];
          const idx = zones.indexOf(z);
          return zones[Math.min(idx + 1, zones.length - 1)];
        });
      }

      // Ballon bouge aléatoirement dans la zone courante
      setBallPos({
        x: 0.2 + Math.random() * 0.6,
        y: possession === "me"
          ? 0.4 + Math.random() * 0.5
          : 0.1 + Math.random() * 0.5,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [phase, possession]);

  const { senDy, norDy } = getPositionsForPossession(possession, zone);

  function getPos(base, dy) {
    return {
      x: base.x * FIELD_W,
      y: Math.min(0.95, Math.max(0.05, base.y + dy)) * FIELD_H,
    };
  }

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "320px", margin: "0 auto" }}>

      {/* Flash de but */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute", inset: 0, zIndex: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: flash === "goal_sen" ? "rgba(26,140,60,0.85)" : "rgba(192,57,43,0.85)",
              borderRadius: "8px", pointerEvents: "none",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px" }}>⚽</div>
              <div style={{ color: "white", fontWeight: 700, fontSize: "24px" }}>
                {flash === "goal_sen" ? "BUT ! 🇸🇳" : "BUT ! 🇳🇴"}
              </div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "32px", fontWeight: 700 }}>
                {senScore} - {norScore}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <svg
        viewBox={`0 0 ${FIELD_W} ${FIELD_H}`}
        style={{ width: "100%", display: "block", borderRadius: "8px" }}
      >
        {/* Terrain */}
        <rect width={FIELD_W} height={FIELD_H} fill="#2d7a3a" rx="8"/>
        <rect x="8" y="8" width={FIELD_W-16} height={FIELD_H-16} fill="none" stroke="#3d9a4a" stroke-width="1" rx="4"/>

        {/* Rayures du terrain */}
        {[0,1,2,3,4,5,6,7].map(i => (
          <rect key={i} x="8" y={8 + i * 58} width={FIELD_W-16} height="29"
            fill={i % 2 === 0 ? "rgba(0,0,0,0.04)" : "transparent"}/>
        ))}

        {/* Ligne médiane */}
        <line x1="8" y1={FIELD_H/2} x2={FIELD_W-8} y2={FIELD_H/2} stroke="#3d9a4a" stroke-width="1"/>
        <circle cx={FIELD_W/2} cy={FIELD_H/2} r="35" fill="none" stroke="#3d9a4a" stroke-width="1"/>
        <circle cx={FIELD_W/2} cy={FIELD_H/2} r="3" fill="#3d9a4a"/>

        {/* Surface Sénégal (haut, attaque vers le bas) */}
        <rect x="80" y="8" width="160" height="70" fill="none" stroke="#3d9a4a" stroke-width="1"/>
        <rect x="110" y="8" width="100" height="35" fill="none" stroke="#3d9a4a" stroke-width="1"/>

        {/* Surface Norvège (bas) */}
        <rect x="80" y={FIELD_H-78} width="160" height="70" fill="none" stroke="#3d9a4a" stroke-width="1"/>
        <rect x="110" y={FIELD_H-43} width="100" height="35" fill="none" stroke="#3d9a4a" stroke-width="1"/>

        {/* Buts */}
        <rect x="120" y="4" width="80" height="10" fill="none" stroke="white" stroke-width="1.5"/>
        <rect x="120" y={FIELD_H-14} width="80" height="10" fill="none" stroke="white" stroke-width="1.5"/>

        {/* Joueurs Sénégal */}
        {SEN_PLAYERS.map(({ key, num, name, star }) => {
          const base = SEN_BASE_POSITIONS[key];
          const pos  = getPos(base, senDy);
          return (
            <motion.g key={`sen-${key}`}
              animate={{ cx: pos.x, cy: pos.y }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >
              <motion.circle
                animate={{ cx: pos.x, cy: pos.y }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                r={star ? 11 : 9}
                fill="#1a8c3c"
                stroke={star ? "#ffd700" : "white"}
                strokeWidth={star ? 2 : 1.5}
              />
              <motion.text
                animate={{ x: pos.x, y: pos.y + 3 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                textAnchor="middle" fill="white" fontSize="7" fontWeight="500"
              >
                {num}
              </motion.text>
              <motion.text
                animate={{ x: pos.x, y: pos.y + 16 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                textAnchor="middle" fill={star ? "#ffd700" : "#b8f0c8"} fontSize="6"
              >
                {name}
              </motion.text>
            </motion.g>
          );
        })}

        {/* Joueurs Norvège */}
        {NOR_PLAYERS.map(({ key, num, name, star }) => {
          const base = NOR_BASE_POSITIONS[key];
          const pos  = getPos(base, norDy);
          return (
            <motion.g key={`nor-${key}`}
              animate={{ cx: pos.x, cy: pos.y }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >
              <motion.circle
                animate={{ cx: pos.x, cy: pos.y }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                r={star ? 11 : 9}
                fill="#c0392b"
                stroke={star ? "#ffd700" : "white"}
                strokeWidth={star ? 2 : 1.5}
              />
              <motion.text
                animate={{ x: pos.x, y: pos.y + 3 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                textAnchor="middle" fill="white" fontSize="7" fontWeight="500"
              >
                {num}
              </motion.text>
              <motion.text
                animate={{ x: pos.x, y: pos.y + 16 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                textAnchor="middle" fill={star ? "#ffd700" : "#ffc0bb"} fontSize="6"
              >
                {name}
              </motion.text>
            </motion.g>
          );
        })}

        {/* Ballon */}
        <motion.g
          animate={{ cx: ballPos.x * FIELD_W, cy: ballPos.y * FIELD_H }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.circle
            animate={{ cx: ballPos.x * FIELD_W, cy: ballPos.y * FIELD_H }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            r="6" fill="white" stroke="#999" strokeWidth="0.5"
          />
          <motion.circle
            animate={{ cx: ballPos.x * FIELD_W, cy: ballPos.y * FIELD_H }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            r="3" fill="#bbb"
          />
        </motion.g>

        {/* Indicateur de possession */}
        <rect x="8" y="8" width="72" height="16" fill={possession === "me" ? "#1a8c3c" : "#c0392b"} rx="3" opacity="0.9"/>
        <text x="44" y="19" textAnchor="middle" fill="white" fontSize="8" fontWeight="500">
          {possession === "me" ? "🇸🇳 balle" : "🇳🇴 balle"}
        </text>

        {/* Zone active */}
        <rect x={FIELD_W-80} y="8" width="72" height="16" fill="rgba(0,0,0,0.4)" rx="3"/>
        <text x={FIELD_W-44} y="19" textAnchor="middle" fill="white" fontSize="8" fontWeight="500">
          {zone === "defense" ? "Défense" : zone === "milieu" ? "Milieu" : zone === "attaque" ? "Attaque" : "Surface"}
        </text>

        {/* Score */}
        <rect x={FIELD_W/2-30} y={FIELD_H/2-14} width="60" height="18" fill="rgba(0,0,0,0.6)" rx="4"/>
        <text x={FIELD_W/2} y={FIELD_H/2-2} textAnchor="middle" fill="white" fontSize="10" fontWeight="500">
          {senScore} - {norScore}
        </text>
      </svg>

      {/* Légende */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "6px", fontSize: "10px", color: "var(--color-text-secondary)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="#1a8c3c" stroke="#ffd700" strokeWidth="1.5"/></svg>
          Joueur clé Sénégal
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="#c0392b" stroke="#ffd700" strokeWidth="1.5"/></svg>
          Joueur clé Norvège
        </span>
      </div>
    </div>
  );
}
