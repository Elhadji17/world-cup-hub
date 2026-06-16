// src/pages/ShopCoins.jsx
// Acheter des coins avec Stripe

import { useState }              from "react";
import { motion }                from "framer-motion";
import { Link }                  from "react-router-dom";
import { useAuth }               from "../hooks/useAuth";
import { useGameStats }          from "../hooks/useGameStats.jsx";

const API = import.meta.env.VITE_API_URL ?? "";

const PACKS = [
  {
    id:     "coins_500",
    coins:  500,
    price:  "0,99€",
    bonus:  "",
    color:  "from-blue-700 to-blue-900",
    border: "border-blue-400/40",
    popular: false,
  },
  {
    id:     "coins_1200",
    coins:  1200,
    price:  "1,99€",
    bonus:  "+20% bonus",
    color:  "from-green-700 to-green-900",
    border: "border-green-400/40",
    popular: true,
  },
  {
    id:     "coins_3000",
    coins:  3000,
    price:  "4,99€",
    bonus:  "+50% bonus",
    color:  "from-purple-700 to-purple-900",
    border: "border-purple-400/40",
    popular: false,
  },
  {
    id:     "coins_7000",
    coins:  7000,
    price:  "9,99€",
    bonus:  "+75% bonus",
    color:  "from-yellow-600 to-amber-800",
    border: "border-yellow-400/40",
    popular: false,
  },
];

export default function ShopCoins() {
  const { user }           = useAuth();
  const { coins, refresh } = useGameStats();
  const [loading, setLoading] = useState(null);
  const [error,   setError]   = useState(null);

  async function handleBuy(pack) {
    if (!user) { setError("Connecte-toi pour acheter !"); return; }
    setLoading(pack.id);
    setError(null);

    try {
      const token = localStorage.getItem("wch_token");
      const res   = await fetch(`${API}/api/quiz?action=stripe-checkout`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({ packId: pack.id }),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error); return; }

      // Rediriger vers Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError("Erreur de connexion. Réessaie.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-900 via-black to-gray-900 text-white pb-20">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">💰 Acheter des Coins</h1>
            <p className="text-xs text-gray-400">Paiement sécurisé par Stripe</p>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-3 py-1 text-center">
            <div className="text-sm font-bold text-yellow-400">{coins} 💰</div>
            <div className="text-xs text-gray-400">mes coins</div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-6">

        {/* Info sécurité */}
        <div className="mb-5 bg-green-500/10 border border-green-400/20 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <div className="text-sm font-bold text-green-300">Paiement 100% sécurisé</div>
            <div className="text-xs text-gray-400">Propulsé par Stripe · CB, Apple Pay, Google Pay</div>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-400/40 rounded-xl px-4 py-3 text-red-300 text-sm text-center">
            ⚠️ {error}
          </div>
        )}

        {!user && (
          <div className="mb-5 bg-blue-500/10 border border-blue-400/20 rounded-xl px-4 py-3 text-center">
            <p className="text-blue-300 text-sm mb-2">Connecte-toi pour acheter des coins</p>
            <Link to="/">
              <button className="bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-xl">
                Se connecter
              </button>
            </Link>
          </div>
        )}

        {/* Packs */}
        <div className="grid gap-4">
          {PACKS.map((pack, i) => (
            <motion.div key={pack.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`relative rounded-2xl border overflow-hidden ${pack.border}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${pack.color} opacity-20`} />

              {pack.popular && (
                <div className="absolute top-3 right-3 bg-green-400 text-black text-xs font-black px-2 py-0.5 rounded-full">
                  ⭐ Populaire
                </div>
              )}

              <div className="relative flex items-center gap-4 p-5">
                <div className="text-5xl">💰</div>
                <div className="flex-1">
                  <div className="font-black text-white text-xl">{pack.coins.toLocaleString()} coins</div>
                  {pack.bonus && (
                    <div className="text-xs text-green-300 font-bold">{pack.bonus}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    ≈ {Math.floor(pack.coins / 100)} packs Bronze · {Math.floor(pack.coins / 800)} packs Or
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBuy(pack)}
                  disabled={loading === pack.id || !user}
                  className={`flex flex-col items-center px-5 py-3 rounded-xl font-black shrink-0 transition ${
                    loading === pack.id
                      ? "bg-white/10 text-gray-400 cursor-wait"
                      : user
                        ? "bg-yellow-400 text-black hover:bg-yellow-300"
                        : "bg-white/10 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {loading === pack.id ? "⏳" : pack.price}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Utilisation des coins */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-3">💡 À quoi servent les coins ?</h3>
          <div className="space-y-2 text-sm text-gray-300">
            {[
              ["🎁 Pack Bronze",  "100 coins"],
              ["⬜ Pack Argent",  "300 coins"],
              ["🟨 Pack Or",     "800 coins"],
              ["❤️ 1 Vie",       "50 coins"],
              ["⚡ Double coins", "200 coins"],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span>{label}</span>
                <span className="text-yellow-400 font-bold">{val}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Les coins sont des biens numériques virtuels non remboursables.
        </p>
      </div>
    </div>
  );
}
