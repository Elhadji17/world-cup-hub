// src/pages/Shop.jsx
// Shop — acheter vies, boosts avec coins + compte à rebours prochaine vie

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStats } from "../hooks/useGameStats.jsx";
import { useAuth }      from "../hooks/useAuth";

const MAX_LIVES = 5;

const ITEMS = [
  {
    id:     "life_1",
    emoji:  "❤️",
    title:  "1 Vie",
    desc:   "Récupère une vie immédiatement",
    cost:   50,
    color:  "from-red-600 to-red-800",
    border: "border-red-400/40",
  },
  {
    id:     "life_3",
    emoji:  "❤️❤️❤️",
    title:  "3 Vies",
    desc:   "Pack économique — 3 vies d'un coup",
    cost:   120,
    color:  "from-red-700 to-pink-800",
    border: "border-pink-400/40",
    badge:  "🔥 -20%",
  },
  {
    id:     "double_1h",
    emoji:  "⚡",
    title:  "Double Coins 1h",
    desc:   "×2 sur tous les coins pendant 1 heure",
    cost:   200,
    color:  "from-yellow-600 to-orange-700",
    border: "border-yellow-400/40",
    badge:  "⭐ Populaire",
  },
  {
    id:     "hints_3",
    emoji:  "💡",
    title:  "3 Indices Gratuits",
    desc:   "Pour le mode Devine le joueur",
    cost:   80,
    color:  "from-purple-600 to-purple-800",
    border: "border-purple-400/40",
  },
];

// Formater le temps restant
function formatTime(ms) {
  if (!ms || ms <= 0) return null;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}min`;
  if (m > 0) return `${m}min ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

// Compte à rebours prochaine vie
function LiveCountdown({ nextLifeIn, lives }) {
  const [remaining, setRemaining] = useState(nextLifeIn);

  useEffect(() => {
    setRemaining(nextLifeIn);
    if (!nextLifeIn || nextLifeIn <= 0) return;
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1000) { clearInterval(interval); return 0; }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [nextLifeIn]);

  if (lives >= MAX_LIVES || !remaining) return null;

  const pct = Math.max(0, Math.min(100, 100 - (remaining / (60 * 60 * 1000)) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 bg-red-500/10 border border-red-400/30 rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">⏳</span>
          <div>
            <div className="text-sm font-bold text-white">Prochaine vie gratuite</div>
            <div className="text-xs text-gray-400">dans {formatTime(remaining)}</div>
          </div>
        </div>
        <div className="text-2xl font-black text-red-400">
          {formatTime(remaining)}
        </div>
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1 }}
          className="h-2 bg-gradient-to-r from-red-500 to-orange-400 rounded-full"
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>0min</span>
        <span>60min</span>
      </div>
    </motion.div>
  );
}

export default function Shop() {
  const { user }                              = useAuth();
  const { coins, lives, maxLives, buyItem, nextLifeIn, refresh } = useGameStats();
  const [buying,  setBuying]                  = useState(null);
  const [message, setMessage]                 = useState(null);

  // Rafraîchir au montage
  useEffect(() => { refresh(); }, []);

  async function handleBuy(item) {
    if (!user) {
      setMessage({ type: "error", text: "Connecte-toi pour acheter !" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    if (coins < item.cost) {
      setMessage({ type: "error", text: `Pas assez de coins ! (${coins}/${item.cost})` });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setBuying(item.id);
    const result = await buyItem(item.id);
    setBuying(null);

    if (result.success) {
      setMessage({ type: "success", text: `✅ ${item.title} acheté ! (-${item.cost} coins)` });
    } else {
      setMessage({ type: "error", text: `⚠️ ${result.error}` });
    }
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-900 via-black to-gray-900 text-white pb-20">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🛒 Shop</h1>
            <p className="text-xs text-gray-400">Dépense tes coins intelligemment</p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-3 py-1.5 text-center">
              <div className="text-lg font-bold text-yellow-400">{coins}</div>
              <div className="text-xs text-gray-400">coins</div>
            </div>
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-3 py-1.5 text-center">
              <div className="text-lg font-bold text-red-400">{lives}</div>
              <div className="text-xs text-gray-400">vies</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-5">

        {/* Vies actuelles avec cœurs */}
        <div className="mb-5 bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-white">Tes vies</span>
            <span className="text-xs text-gray-400">{lives} disponible{lives > 1 ? "s" : ""}</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: Math.max(lives, MAX_LIVES) }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`text-2xl ${i < lives ? "opacity-100" : "opacity-20"}`}
              >
                {i < lives ? "❤️" : "🖤"}
              </motion.span>
            ))}
            {lives > MAX_LIVES && (
              <span className="text-xs text-red-400 font-bold ml-1 self-center">
                +{lives - MAX_LIVES} bonus
              </span>
            )}
          </div>
        </div>

        {/* Compte à rebours prochaine vie */}
        <LiveCountdown nextLifeIn={nextLifeIn} lives={lives} />

        {/* Message feedback */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold text-center ${
                message.type === "success"
                  ? "bg-green-500/20 border border-green-400/40 text-green-300"
                  : "bg-red-500/20 border border-red-400/40 text-red-300"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Note connexion */}
        {!user && (
          <div className="mb-5 bg-blue-500/10 border border-blue-400/20 rounded-xl px-4 py-3 text-xs text-blue-300 text-center">
            💡 Connecte-toi pour acheter et synchroniser tes coins
          </div>
        )}

        {/* Articles */}
        <div className="grid gap-4">
          {ITEMS.map((item, i) => {
            const canAfford = coins >= item.cost;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`relative rounded-2xl border p-5 bg-gradient-to-br ${item.color} bg-opacity-20 ${item.border}`}
              >
                {item.badge && (
                  <div className="absolute top-3 right-3 bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className="text-4xl shrink-0">{item.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-300">{item.desc}</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: canAfford ? 0.95 : 1 }}
                    onClick={() => handleBuy(item)}
                    disabled={buying === item.id}
                    className={`flex flex-col items-center px-4 py-2 rounded-xl font-bold transition shrink-0 ${
                      buying === item.id
                        ? "bg-white/10 text-gray-400 cursor-wait"
                        : canAfford
                          ? "bg-yellow-400 text-black hover:bg-yellow-300"
                          : "bg-white/10 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <span className="text-lg">{buying === item.id ? "⏳" : "💰"}</span>
                    <span className="text-sm">{item.cost}</span>
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
        <Link to="/shop/coins"
          className="block mb-5 bg-yellow-500/20 border border-yellow-400/30 rounded-2xl px-5 py-4 text-center hover:bg-yellow-500/30 transition">
          <div className="text-lg font-black text-yellow-400">💳 Acheter des coins</div>
          <div className="text-xs text-gray-400">Paiement sécurisé · CB · Apple Pay · Google Pay</div>
        </Link>

        {/* Comment gagner des coins */}
        <div className="mt-8 bg-white/5 rounded-2xl p-5 border border-white/10">
          <h2 className="font-bold text-white mb-3">💰 Comment gagner des coins</h2>
          <div className="space-y-2 text-sm text-gray-300">
            {[
              ["✅ Bonne réponse",        "+10 coins"],
              ["⚡ Réponse rapide (<5s)", "+10 bonus"],
              ["🔥 Série de 5",           "+30 bonus"],
              ["🔥 Série de 10",          "+80 bonus"],
              ["🎁 Inscription",           "+100 offerts"],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between items-center">
                <span>{label}</span>
                <span className="text-yellow-400 font-bold">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
