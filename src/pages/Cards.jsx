// src/pages/Cards.jsx
// Système de cartes — Packs + Collection

import { useState, useEffect }     from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate }             from "react-router-dom";
import { useAuth }                 from "../hooks/useAuth";
import { useGameStats }            from "../hooks/useGameStats.jsx";
import { PACKS, openPack, PLAYERS } from "../data/players-cards";
import PlayerCard                   from "../components/PlayerCard";

const COLLECTION_KEY = "wch_cards";

function loadCollection() {
  try { return JSON.parse(localStorage.getItem(COLLECTION_KEY)) ?? []; }
  catch { return []; }
}

function saveCollection(cards) {
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(cards));
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function Cards() {
  const navigate                  = useNavigate();
  const { user }                  = useAuth();
  const { coins, buyItem } = useGameStats();
  const [tab,         setTab]     = useState("packs"); // packs | collection
  const [collection,  setCollection] = useState(loadCollection);
  const [opening,     setOpening] = useState(null);   // pack en cours d'ouverture
  const [newCards,    setNewCards] = useState([]);     // cartes tirées
  const [revealed,    setRevealed] = useState([]);     // cartes révélées une à une
  const [message,     setMessage] = useState(null);

  function showMsg(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleBuyPack(pack) {
    if (!user) { showMsg("error", "Connecte-toi pour acheter un pack !"); return; }
    if (coins < pack.cost) { showMsg("error", `Pas assez de coins ! (${coins}/${pack.cost})`); return; }

    // Déduire les coins via MongoDB
    const result = await buyItem(`pack_${pack.id}`);
    if (!result.success) { showMsg("error", result.error ?? "Erreur achat."); return; }

    // Ouvrir le pack
    setOpening(pack);
    const cards = openPack(pack);
    setNewCards(cards);
    setRevealed([]);

    // Révéler les cartes une par une
    for (let i = 0; i < cards.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      setRevealed(prev => [...prev, i]);
    }

    // Ajouter à la collection
    const newCollection = [...collection, ...cards];
    setCollection(newCollection);
    saveCollection(newCollection);
  }

  function closeOpening() {
    setOpening(null);
    setNewCards([]);
    setRevealed([]);
  }

  // Stats collection
  const collectionByRarity = {
    legendary: collection.filter(c => c.rarity === "legendary").length,
    gold:      collection.filter(c => c.rarity === "gold").length,
    silver:    collection.filter(c => c.rarity === "silver").length,
    bronze:    collection.filter(c => c.rarity === "bronze").length,
  };

  const uniqueCards = [...new Map(collection.map(c => [c.id, c])).values()];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-blue-900 text-white pb-20">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🃏 Cartes</h1>
            <p className="text-xs text-gray-400">{uniqueCards.length} cartes uniques · {collection.length} total</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-3 py-1 text-center">
              <div className="text-sm font-bold text-yellow-400">{coins} 💰</div>
              <div className="text-xs text-gray-400">coins</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4">

        {/* Onglets */}
        <div className="flex bg-white/5 rounded-xl p-1 gap-1 mb-5">
          <button onClick={() => setTab("packs")}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
              tab === "packs" ? "bg-purple-500 text-white" : "text-gray-400 hover:text-white"
            }`}>
            🎁 Packs
          </button>
          <button onClick={() => setTab("collection")}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
              tab === "collection" ? "bg-blue-500 text-white" : "text-gray-400 hover:text-white"
            }`}>
            📚 Collection ({uniqueCards.length})
          </button>
        </div>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold text-center ${
                message.type === "success"
                  ? "bg-green-500/20 border border-green-400/40 text-green-300"
                  : "bg-red-500/20 border border-red-400/40 text-red-300"
              }`}>
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PACKS ── */}
        {tab === "packs" && (
          <div>
            {/* Stats raretés */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[
                { label: "💎 Légend.", count: collectionByRarity.legendary, color: "text-purple-400" },
                { label: "🟨 Or",      count: collectionByRarity.gold,      color: "text-yellow-400" },
                { label: "⬜ Argent",  count: collectionByRarity.silver,    color: "text-gray-300"   },
                { label: "🟫 Bronze",  count: collectionByRarity.bronze,    color: "text-amber-500"  },
              ].map(({ label, count, color }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
                  <div className={`text-lg font-black ${color}`}>{count}</div>
                  <div className="text-[10px] text-gray-400">{label}</div>
                </div>
              ))}
            </div>

            {/* Liste des packs */}
            <div className="space-y-4">
              {PACKS.map((pack, i) => (
                <motion.div key={pack.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-2xl border ${pack.border} overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${pack.color} opacity-20`} />
                  {pack.badge && (
                    <div className="absolute top-3 right-3 bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {pack.badge}
                    </div>
                  )}
                  <div className="relative flex items-center gap-4 p-5">
                    <div className="text-5xl">{pack.emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-black text-white text-lg">{pack.name}</h3>
                      <p className="text-sm text-gray-300 mb-1">{pack.desc}</p>
                      <div className="flex gap-2 text-xs">
                        {Object.entries(pack.probabilities).filter(([,v]) => v > 0).map(([rarity, prob]) => (
                          <span key={rarity} className="bg-black/30 px-2 py-0.5 rounded-full text-gray-300">
                            {rarity === "legendary" ? "💎" : rarity === "gold" ? "🟨" : rarity === "silver" ? "⬜" : "🟫"} {Math.round(prob * 100)}%
                          </span>
                        ))}
                      </div>
                    </div>
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={() => handleBuyPack(pack)}
                      disabled={coins < pack.cost}
                      className={`flex flex-col items-center px-4 py-3 rounded-xl font-bold shrink-0 transition ${
                        coins >= pack.cost
                          ? "bg-yellow-400 text-black hover:bg-yellow-300"
                          : "bg-white/10 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <span className="text-xl">💰</span>
                      <span className="text-sm font-black">{pack.cost}</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── COLLECTION ── */}
        {tab === "collection" && (
          <div>
            {uniqueCards.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🃏</div>
                <p className="text-gray-400 mb-2">Aucune carte pour l'instant</p>
                <p className="text-sm text-gray-500">Achète des packs pour obtenir des cartes !</p>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setTab("packs")}
                  className="mt-4 bg-purple-500 hover:bg-purple-400 text-white font-bold px-6 py-3 rounded-xl transition">
                  🎁 Voir les packs
                </motion.button>
              </div>
            ) : (
              <div>
                {/* Groupé par rareté */}
                {["legendary", "gold", "silver", "bronze"].map(rarity => {
                  const rarityCards = uniqueCards.filter(c => c.rarity === rarity);
                  if (rarityCards.length === 0) return null;
                  const labels = { legendary: "💎 Légendaires", gold: "🟨 Or", silver: "⬜ Argent", bronze: "🟫 Bronze" };
                  return (
                    <div key={rarity} className="mb-6">
                      <h3 className="text-sm font-bold text-gray-300 mb-3">{labels[rarity]} ({rarityCards.length})</h3>
                      <div className="flex flex-wrap gap-3">
                        {rarityCards.map((card, i) => (
                          <motion.div key={`${card.id}-${i}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <PlayerCard player={card} size="sm" />
                            {/* Nombre d'exemplaires */}
                            {collection.filter(c => c.id === card.id).length > 1 && (
                              <div className="text-center text-xs text-yellow-400 font-bold mt-1">
                                ×{collection.filter(c => c.id === card.id).length}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ANIMATION OUVERTURE PACK ── */}
      <AnimatePresence>
        {opening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center mb-8"
            >
              <div className="text-6xl mb-2">{opening.emoji}</div>
              <h2 className="text-2xl font-black text-white">{opening.name}</h2>
              <p className="text-gray-400 text-sm">Tes cartes sont révélées...</p>
            </motion.div>

            {/* Cartes révélées */}
            <div className="flex gap-4 justify-center flex-wrap mb-8">
              {newCards.map((card, i) => (
                <motion.div key={i}
                  initial={{ rotateY: 180, opacity: 0, scale: 0.5 }}
                  animate={revealed.includes(i)
                    ? { rotateY: 0, opacity: 1, scale: 1 }
                    : { rotateY: 180, opacity: 0.3, scale: 0.8 }
                  }
                  transition={{ duration: 0.6, type: "spring" }}
                >
                  {revealed.includes(i) ? (
                    <PlayerCard player={card} size="md" animate={false} />
                  ) : (
                    <div className="w-40 h-56 rounded-xl bg-gradient-to-b from-purple-800 to-purple-900 border-2 border-purple-400 flex items-center justify-center">
                      <span className="text-4xl">🃏</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {revealed.length === newCards.length && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={closeOpening}
                className="bg-purple-500 hover:bg-purple-400 text-white font-bold px-8 py-4 rounded-2xl transition text-lg"
              >
                ✅ Ajouter à ma collection
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
