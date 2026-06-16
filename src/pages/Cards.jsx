// src/pages/Cards.jsx
// Système de cartes — Packs + Collection + Échange doublons

import { useState, useEffect }     from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth }                 from "../hooks/useAuth";
import { useGameStats }            from "../hooks/useGameStats.jsx";
import { PACKS, openPack }         from "../data/players-cards";
import PlayerCard                   from "../components/PlayerCard";

const COLLECTION_KEY = "wch_cards";
const API = import.meta.env.VITE_API_URL ?? "";

// Coins gagnés par échange selon rareté
const EXCHANGE_COINS = {
  legendary: 200,
  gold:      100,
  silver:    30,
  bronze:    15,
};

function loadCollection() {
  try { return JSON.parse(localStorage.getItem(COLLECTION_KEY)) ?? []; }
  catch { return []; }
}

function saveLocal(cards) {
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(cards));
}

async function saveToMongoDB(cards) {
  const token = localStorage.getItem("wch_token");
  if (!token) return;
  try {
    await fetch(`${API}/api/quiz?action=save-cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ cards }),
    });
  } catch {}
}

export default function Cards() {
  const { user }           = useAuth();
  const { coins, buyItem, refresh } = useGameStats();
  const [tab,         setTab]        = useState("packs");
  const [collection,  setCollection] = useState(loadCollection);
  const [opening,     setOpening]    = useState(null);
  const [newCards,    setNewCards]   = useState([]);
  const [revealed,    setRevealed]   = useState([]);
  const [message,     setMessage]    = useState(null);
  const [syncing,     setSyncing]    = useState(false);
  const [exchanging,  setExchanging] = useState(null); // id carte en cours d'échange

  function showMsg(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  // Charger collection depuis MongoDB au montage
  useEffect(() => {
    const token = localStorage.getItem("wch_token");
    if (!token) return;
    setSyncing(true);
    fetch(`${API}/api/quiz?action=cards`, {
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.cards?.length > 0) {
          setCollection(data.cards);
          saveLocal(data.cards);
        }
      })
      .catch(() => {})
      .finally(() => setSyncing(false));
  }, []);

  async function handleBuyPack(pack) {
    if (!user) { showMsg("error", "Connecte-toi pour acheter un pack !"); return; }
    if (coins < pack.cost) { showMsg("error", `Pas assez de coins ! (${coins}/${pack.cost})`); return; }

    const result = await buyItem(`pack_${pack.id}`);
    if (!result.success) { showMsg("error", result.error ?? "Erreur achat."); return; }

    setOpening(pack);
    const cards = openPack(pack);
    setNewCards(cards);
    setRevealed([]);

    for (let i = 0; i < cards.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      setRevealed(prev => [...prev, i]);
    }

    const newCollection = [...collection, ...cards];
    setCollection(newCollection);
    saveLocal(newCollection);
    saveToMongoDB(newCollection);
  }

  function closeOpening() {
    setOpening(null);
    setNewCards([]);
    setRevealed([]);
  }

  // Échanger UN doublon contre des coins
  async function handleExchange(card) {
    const count = collection.filter(c => c.id === card.id).length;
    if (count < 2) return;

    setExchanging(card.id);

    // Supprimer UN exemplaire de la collection
    const idx = collection.findLastIndex(c => c.id === card.id);
    const newCollection = [...collection];
    newCollection.splice(idx, 1);
    setCollection(newCollection);
    saveLocal(newCollection);
    saveToMongoDB(newCollection);

    // Ajouter les coins via backend
    const coinsGained = EXCHANGE_COINS[card.rarity] ?? 15;
    const token = localStorage.getItem("wch_token");
    if (token) {
      try {
        await fetch(`${API}/api/quiz?action=exchange`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ rarity: card.rarity }),
        });
        await refresh(); // Rafraîchir les coins
      } catch {}
    }

    showMsg("success", `+${coinsGained} 💰 coins pour ${card.name} en double !`);
    setExchanging(null);
  }

  // Stats collection
  const collectionByRarity = {
    legendary: collection.filter(c => c.rarity === "legendary").length,
    gold:      collection.filter(c => c.rarity === "gold").length,
    silver:    collection.filter(c => c.rarity === "silver").length,
    bronze:    collection.filter(c => c.rarity === "bronze").length,
  };

  const uniqueCards = [...new Map(collection.map(c => [c.id, c])).values()];
  const totalDoublons = collection.length - uniqueCards.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-blue-900 text-white pb-20">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🃏 Cartes</h1>
            <p className="text-xs text-gray-400">
              {uniqueCards.length} uniques · {collection.length} total
              {totalDoublons > 0 && <span className="text-yellow-400"> · {totalDoublons} doublon{totalDoublons > 1 ? "s" : ""}</span>}
              {syncing ? " · 🔄 Sync..." : " · ✅ Sauvegardé"}
            </p>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-3 py-1 text-center">
            <div className="text-sm font-bold text-yellow-400">{coins} 💰</div>
            <div className="text-xs text-gray-400">coins</div>
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

            {/* Info échange */}
            <div className="mb-5 bg-yellow-500/10 border border-yellow-400/20 rounded-xl px-4 py-3 text-xs text-yellow-200">
              💡 Les doublons peuvent être échangés contre des coins dans ta collection !
              <span className="block mt-1 text-gray-400">
                🟫 +15 · ⬜ +30 · 🟨 +100 · 💎 +200 coins
              </span>
            </div>

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
                      <div className="flex gap-2 text-xs flex-wrap">
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
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setTab("packs")}
                  className="mt-4 bg-purple-500 hover:bg-purple-400 text-white font-bold px-6 py-3 rounded-xl transition">
                  🎁 Voir les packs
                </motion.button>
              </div>
            ) : (
              <div>
                {/* Info si doublons */}
                {totalDoublons > 0 && (
                  <div className="mb-4 bg-yellow-500/10 border border-yellow-400/20 rounded-xl px-4 py-3 text-xs text-yellow-200">
                    🔄 Tu as <span className="font-bold">{totalDoublons} doublon{totalDoublons > 1 ? "s" : ""}</span> — clique sur "Échanger" pour les convertir en coins !
                  </div>
                )}

                {["legendary", "gold", "silver", "bronze"].map(rarity => {
                  const rarityCards = uniqueCards.filter(c => c.rarity === rarity);
                  if (rarityCards.length === 0) return null;
                  const labels = { legendary: "💎 Légendaires", gold: "🟨 Or", silver: "⬜ Argent", bronze: "🟫 Bronze" };
                  return (
                    <div key={rarity} className="mb-6">
                      <h3 className="text-sm font-bold text-gray-300 mb-3">{labels[rarity]} ({rarityCards.length})</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {rarityCards.map((card, i) => {
                          const count    = collection.filter(c => c.id === card.id).length;
                          const isDouble = count > 1;
                          return (
                            <motion.div key={`${card.id}-${i}`}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex flex-col items-center"
                            >
                              <div className="relative">
                                <PlayerCard player={card} size="sm" animate={!isDouble} />
                                {/* Badge doublon */}
                                {isDouble && (
                                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
                                    ×{count}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-gray-400 mt-1 text-center truncate w-full">
                                {card.name.split(" ").pop()}
                              </div>
                              {/* Bouton échanger si doublon */}
                              {isDouble && (
                                <motion.button
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleExchange(card)}
                                  disabled={exchanging === card.id}
                                  className="mt-1 bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-400/40 text-yellow-300 text-xs font-bold px-3 py-1 rounded-lg transition w-full text-center"
                                >
                                  {exchanging === card.id ? "⏳" : `🔄 +${EXCHANGE_COINS[card.rarity]} 💰`}
                                </motion.button>
                              )}
                            </motion.div>
                          );
                        })}
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
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-center mb-8">
              <div className="text-6xl mb-2">{opening.emoji}</div>
              <h2 className="text-2xl font-black text-white">{opening.name}</h2>
              <p className="text-gray-400 text-sm">Tes cartes sont révélées...</p>
            </motion.div>

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
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
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
