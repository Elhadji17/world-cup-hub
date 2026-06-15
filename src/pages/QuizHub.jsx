// src/pages/QuizHub.jsx
import { useState }      from "react";
import { useNavigate }   from "react-router-dom";
import { motion }        from "framer-motion";
import { CATEGORIES }    from "../data/quiz-categories";
import { useAuth }       from "../hooks/useAuth";
import { useGameStats }  from "../hooks/useGameStats.jsx";

const DIFFICULTY_COLOR = {
  "Facile":    "text-green-400  bg-green-400/10  border-green-400/30",
  "Moyen":     "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  "Difficile": "text-red-400    bg-red-400/10    border-red-400/30",
  "Varié":     "text-purple-400 bg-purple-400/10 border-purple-400/30",
};

function isDailyDone() {
  return localStorage.getItem("daily_quiz_date") === new Date().toDateString();
}

export default function QuizHub() {
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const { coins, lives, totalCoins, totalPoints, maxLives } = useGameStats();
  const playerName = user?.username ?? localStorage.getItem("playerName") ?? "Joueur";
  const [dailyDone] = useState(isDailyDone);

  const history = JSON.parse(localStorage.getItem("history")) || [];

  function handleSelect(cat) {
    if (cat.isDaily && dailyDone) return;
    if (cat.isPlayers) { navigate("/quiz/players"); return; }
    navigate(`/quiz/${cat.id}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-blue-900 text-white pb-16">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🧠 Quiz Hub</h1>
            <p className="text-xs text-gray-400">Choisis ta catégorie, {playerName} !</p>
          </div>
          <div className="flex gap-3 items-center">
            {/* Vies */}
            <div className="text-center">
              <div className="flex gap-0.5">
                {Array.from({ length: Math.min(lives, 5) }).map((_, i) => (
                  <span key={i} className="text-sm">❤️</span>
                ))}
                {lives > 5 && <span className="text-xs text-red-400 font-bold ml-1">+{lives - 5}</span>}
              </div>
              <div className="text-xs text-gray-400">{lives} vie{lives > 1 ? "s" : ""}</div>
            </div>
            {/* Coins */}
            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-3 py-1 text-center">
              <div className="text-sm font-bold text-yellow-400">{coins} 🪙</div>
              <div className="text-xs text-gray-400">{history.length} parties</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">

        {/* Classement mondial */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate("/quiz/leaderboard")}
          className="mb-5 bg-yellow-500/10 border border-yellow-400/30 rounded-2xl px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-yellow-500/20 transition"
        >
          <div>
            <div className="text-sm font-bold text-yellow-400">🏆 Tes points totaux</div>
            <div className="text-xs text-gray-400">Voir le classement mondial</div>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{totalPoints} pts</div>
        </motion.div>

        {/* Grille catégories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CATEGORIES.map((cat, i) => {
            const locked = cat.isDaily && dailyDone;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileTap={{ scale: locked ? 1 : 0.97 }}
                onClick={() => handleSelect(cat)}
                className={`relative rounded-2xl border p-5 cursor-pointer transition-all ${cat.border} ${
                  locked
                    ? "opacity-50 cursor-not-allowed bg-white/5"
                    : `bg-gradient-to-br ${cat.color} bg-opacity-20 hover:brightness-110`
                }`}
              >
                {locked && (
                  <div className="absolute top-3 right-3 bg-gray-600 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                    ✅ Fait aujourd'hui
                  </div>
                )}
                <div className="text-4xl mb-3">{cat.emoji}</div>
                <h2 className="text-lg font-bold text-white mb-1">{cat.title}</h2>
                <p className="text-xs text-gray-300 mb-3 leading-relaxed">{cat.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${DIFFICULTY_COLOR[cat.difficulty]}`}>
                    {cat.difficulty}
                  </span>
                  <span className="text-xs text-gray-400">{cat.count} questions</span>
                </div>
                {cat.isDaily && !locked && (
                  <div className="mt-2 text-xs text-orange-300 font-semibold">🔥 Nouveau chaque jour !</div>
                )}
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-600 mt-8">
          Le Quiz du Jour se renouvelle à minuit ⚡
        </p>
      </div>
    </div>
  );
}
