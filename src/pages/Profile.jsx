// src/pages/Profile.jsx
// Page profil joueur — stats, cartes, pronostics

import { useState, useEffect }     from "react";
import { motion }                   from "framer-motion";
import { Link, useNavigate }        from "react-router-dom";
import { useAuth }                  from "../hooks/useAuth";
import { useGameStats }             from "../hooks/useGameStats.jsx";
import PlayerCard                   from "../components/PlayerCard";

const API          = import.meta.env.VITE_API_URL ?? "";
const COLLECTION_KEY = "wch_cards";

function loadCollection() {
  try { 
    return JSON.parse(localStorage.getItem(COLLECTION_KEY)) ?? []; 
  } catch { 
    return []; 
  }
}

const MEDALS = [
  { min: 0,    emoji: "⚽", label: "Débutant",   color: "text-gray-400"   },
  { min: 100,  emoji: "🥉", label: "Confirmé",   color: "text-amber-600"  },
  { min: 300,  emoji: "🥈", label: "Expert",     color: "text-gray-300"   },
  { min: 700,  emoji: "🥇", label: "Champion",   color: "text-yellow-400" },
  { min: 1500, emoji: "👑", label: "Légendaire", color: "text-purple-400" },
];

function getMedal(points) {
  return [...MEDALS].reverse().find(m => points >= m.min) ?? MEDALS[0];
}

export default function Profile() {
  const navigate          = useNavigate();
  const { user, logout }  = useAuth();
  const { coins, lives, totalPoints, totalCoins, maxLives } = useGameStats();
  const [collection, setCollection] = useState(loadCollection);
  const [pronos,     setPronos]     = useState([]);
  const [quizRank,   setQuizRank]   = useState(null);
  const [loading,    setLoading]    = useState(true);

  const medal = getMedal(totalPoints);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("wch_token");

    // Charger collection MongoDB
    fetch(`${API}/api/quiz?action=cards`, {
      headers: { "Authorization": `Bearer ${token}` },
    })
    .then(r => r.json())
    .then(data => {
      if (data.cards?.length > 0) setCollection(data.cards);
    })
    .catch(() => {});

    // Charger pronostics
    fetch(`${API}/api/predictions/me`, {
      headers: { "Authorization": `Bearer ${token}` },
    })
    .then(r => r.json())
    .then(data => {
      setPronos(data.predictions ?? []);
    })
    .catch(() => {});

    // Charger rang quiz
    fetch(`${API}/api/quiz?action=leaderboard&limit=100`)
      .then(r => r.json())
      .then(data => {
        const me = data.leaderboard?.find(e => e.username === user.username);
        if (me) setQuizRank(me.rank);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">👤</div>
          <p className="text-gray-400 mb-4">Connecte-toi pour voir ton profil</p>
          <Link to="/">
            <button className="bg-green-500 text-white font-bold px-6 py-3 rounded-xl">
              Se connecter
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Stats collection
  const uniqueCards = [...new Map(collection.map(c => [c.id, c])).values()];
  const legendCards = collection.filter(c => c.rarity === "legendary").length;
  const goldCards   = collection.filter(c => c.rarity === "gold").length;

  // Stats pronostics
  const totalPronos  = pronos.length;
  const scoredPronos = pronos.filter(p => p.points !== null);
  const totalPts     = scoredPronos.reduce((a, p) => a + (p.points ?? 0), 0);
  const exactScores  = scoredPronos.filter(p => p.points >= 15).length;

  // Stats quiz
  const history    = JSON.parse(localStorage.getItem("history")) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-purple-900 text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">👤 Profil</h1>
          <motion.button 
            whileTap={{ scale: 0.95 }} 
            onClick={logout}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
          >
            Déconnexion
          </motion.button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-4">
        {/* ── Carte identité ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-900/60 to-blue-900/60 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-3xl font-black shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-black text-white">{user.username}</h2>
              <div className={`text-sm font-bold ${medal.color}`}>
                {medal.emoji} {medal.label}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{user.email}</div>
            </div>
          </div>

          {/* Barre progression médaille */}
          <div className="mt-4">
            {(() => {
              const next = MEDALS.find(m => m.min > totalPoints);
              if (!next) return <p className="text-xs text-purple-300">🏆 Rang maximum atteint !</p>;
              const prev = getMedal(totalPoints);
              const pct  = Math.min(100, ((totalPoints - prev.min) / (next.min - prev.min)) * 100);
              return (                
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{medal.label}</span>
                    <span>{next.label} ({next.min - totalPoints} pts restants)</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${pct}%` }}                      
                      transition={{ duration: 0.8 }}                      
                      className="h-2 bg-gradient-to-r from-purple-500 to-blue-400 rounded-full" 
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </motion.div>

        {/* ── Stats globales ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}          
          transition={{ delay: 0.1 }}          
          className="grid grid-cols-3 gap-3"
        >
          {[            
            { label: "Points Quiz",   value: totalPoints, color: "text-yellow-400", icon: "🏆" },            
            { label: "Coins",         value: coins,       color: "text-yellow-300", icon: "💰" },            
            { label: "Vies",          value: `${lives}`,  color: "text-red-400",    icon: "❤️" },          
          ].map(({ label, value, color, icon }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className={`text-xl font-black ${color}`}>{value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* ── Quiz ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}          
          transition={{ delay: 0.2 }}          
          className="bg-white/5 border border-white/10 rounded-2xl p-5"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">🧠 Quiz</h3>
            <Link to="/quiz" className="text-xs text-blue-400 hover:text-blue-300">Jouer →</Link>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xl font-black text-yellow-400">{totalPoints}</div>
              <div className="text-xs text-gray-400">pts totaux</div>
            </div>
            <div>
              <div className="text-xl font-black text-blue-400">{history.length}</div>
              <div className="text-xs text-gray-400">parties</div>
            </div>
            <div>
              <div className="text-xl font-black text-green-400">
                {quizRank ? `#${quizRank}` : "—"}
              </div>
              <div className="text-xs text-gray-400">classement</div>
            </div>
          </div>
        </motion.div>

        {/* ── Pronostics ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}          
          transition={{ delay: 0.3 }}          
          className="bg-white/5 border border-white/10 rounded-2xl p-5"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">🔮 Pronostics</h3>
            <Link to="/predictions" className="text-xs text-blue-400 hover:text-blue-300">Voir →</Link>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xl font-black text-green-400">{totalPts}</div>
              <div className="text-xs text-gray-400">pts pronostics</div>
            </div>
            <div>
              <div className="text-xl font-black text-blue-400">{totalPronos}</div>
              <div className="text-xs text-gray-400">pronostics</div>
            </div>
            <div>
              <div className="text-xl font-black text-yellow-400">{exactScores}</div>
              <div className="text-xs text-gray-400">scores exacts</div>
            </div>
          </div>
        </motion.div>

        {/* ── Collection cartes ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}          
          transition={{ delay: 0.4 }}          
          className="bg-white/5 border border-white/10 rounded-2xl p-5"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">🃏 Cartes ({uniqueCards.length})</h3>
            <Link to="/cards" className="text-xs text-blue-400 hover:text-blue-300">Voir tout →</Link>
          </div>
          {uniqueCards.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm mb-3">Aucune carte pour l'instant</p>
              <Link to="/cards">
                <button className="bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl">
                  🎁 Ouvrir des packs
                </button>
              </Link>
            </div>
          ) : (
            <div>
              {/* Stats raretés */}
              <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                {[                  
                  { label: "💎", count: legendCards,                                        color: "text-purple-400" },                  
                  { label: "🟨", count: goldCards,                                          color: "text-yellow-400" },                  
                  { label: "⬜", count: collection.filter(c=>c.rarity==="silver").length,   color: "text-gray-300"   },                  
                  { label: "🟫", count: collection.filter(c=>c.rarity==="bronze").length,   color: "text-amber-500"  },                
                ].map(({ label, count, color }) => (
                  <div key={label} className="bg-white/5 rounded-xl p-2">
                    <div className={`text-lg font-black ${color}`}>{count}</div>
                    <div className="text-[10px] text-gray-400">{label}</div>
                  </div>
                ))}
              </div>
              {/* Aperçu des meilleures cartes */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[...uniqueCards]
                  .sort((a, b) => b.rating - a.rating)
                  .slice(0, 5)
                  .map((card, i) => (
                    <div key={i} className="shrink-0">
                      <PlayerCard player={card} size="sm" animate={false} />
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}