// src/components/PlayerCard.jsx
// Carte joueur style FIFA Ultimate Team

import { useState } from "react";
import { motion }   from "framer-motion";

const RARITY_STYLES = {
  bronze:    { bg: "from-amber-900 via-amber-700 to-amber-800",    border: "border-amber-500",    text: "text-amber-200",    glow: "0 0 20px rgba(205,127,50,0.6)"  },
  silver:    { bg: "from-gray-600 via-gray-400 to-gray-500",        border: "border-gray-300",     text: "text-gray-100",     glow: "0 0 20px rgba(192,192,192,0.6)" },
  gold:      { bg: "from-yellow-700 via-yellow-500 to-amber-600",   border: "border-yellow-300",   text: "text-yellow-100",   glow: "0 0 20px rgba(255,215,0,0.7)"   },
  legendary: { bg: "from-purple-900 via-purple-600 to-pink-700",    border: "border-purple-300",   text: "text-purple-100",   glow: "0 0 30px rgba(168,85,247,0.8)"  },
};

const STAT_COLORS = {
  PAC: "text-green-300",
  TIR: "text-red-300",
  PAS: "text-blue-300",
  DRI: "text-yellow-300",
  DEF: "text-cyan-300",
  PHY: "text-orange-300",
};

export default function PlayerCard({ player, size = "md", animate = true, onClick }) {
  const [imgError, setImgError] = useState(false);
  const style = RARITY_STYLES[player.rarity] ?? RARITY_STYLES.bronze;

  const sizes = {
    sm: { card: "w-28 h-40",  img: "h-16", name: "text-xs", rating: "text-lg", stat: "text-[9px]" },
    md: { card: "w-40 h-56",  img: "h-24", name: "text-sm", rating: "text-2xl", stat: "text-xs"  },
    lg: { card: "w-56 h-80",  img: "h-36", name: "text-base", rating: "text-3xl", stat: "text-sm" },
  };
  const s = sizes[size] ?? sizes.md;

  const card = (
    <div
      onClick={onClick}
      className={`relative ${s.card} rounded-xl border-2 ${style.border} bg-gradient-to-b ${style.bg} overflow-hidden cursor-pointer select-none`}
      style={{ boxShadow: animate ? style.glow : "none" }}
    >
      {/* Badge rareté */}
      <div className={`absolute top-1.5 left-1.5 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-black/40 ${style.text}`}>
        {player.rarity === "legendary" ? "💎 LÉGEND." : player.rarity === "gold" ? "🟨 OR" : player.rarity === "silver" ? "⬜ ARGENT" : "🟫 BRONZE"}
      </div>

      {/* Note globale */}
      <div className={`absolute top-1.5 right-1.5 ${s.rating} font-black ${style.text} drop-shadow-lg`}>
        {player.rating}
      </div>

      {/* Photo joueur */}
      <div className={`${s.img} w-full overflow-hidden mt-4`}>
        {player.image && !imgError ? (
          <img
            src={player.image}
            alt={player.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {player.flag}
          </div>
        )}
      </div>

      {/* Infos joueur */}
      <div className="px-2 py-1">
        <div className={`${s.name} font-black text-white text-center truncate drop-shadow`}>
          {player.name.split(" ").pop()}
        </div>
        <div className="flex items-center justify-center gap-1 mb-1">
          <span className="text-[9px] text-white/70 font-bold">{player.position}</span>
          <span className="text-[9px]">{player.flag}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-x-2 gap-y-0.5">
          {Object.entries(player.stats).map(([key, val]) => (
            <div key={key} className="flex items-center gap-0.5">
              <span className={`${s.stat} font-black ${STAT_COLORS[key] ?? "text-white"}`}>{val}</span>
              <span className={`${s.stat} text-white/50 font-semibold`}>{key}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reflet brillant */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none rounded-xl" />
    </div>
  );

  if (!animate) return card;

  return (
    <motion.div
      whileHover={{ scale: 1.05, rotateY: 5 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {card}
    </motion.div>
  );
}
