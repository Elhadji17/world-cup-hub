// src/pages/Quiz.jsx
// Quiz par catégorie — coins + vies intégrés via useGameStats

import { useState, useEffect }          from "react";
import { motion, AnimatePresence }       from "framer-motion";
import { useNavigate, useParams }        from "react-router-dom";
import { useAuth }                       from "../hooks/useAuth";
import { useGameStats }                  from "../hooks/useGameStats";
import { getCategoryById }               from "../data/quiz-categories";

import questionsDefault  from "../data/questions.json";
import questionsWC       from "../data/questions-world-cup.json";
import questionsSN       from "../data/questions-senegal.json";
import questionsFR       from "../data/questions-france.json";
import questionsUCL      from "../data/questions-ucl.json";
import questionsDaily    from "../data/questions-daily.json";
import questionsBD       from "../data/questions-ballon-dor.json";

const QUESTIONS_MAP = {
  "world-cup":        questionsWC,
  "senegal":          questionsSN,
  "france":           questionsFR,
  "champions-league": questionsUCL,
  "ballon-dor":       questionsBD,
  "daily":            questionsDaily,
};

const TIMER_MAX = 15;

function getMedal(score, total) {
  const pct = score / total;
  if (pct >= 0.9) return { emoji: "🥇", label: "Champion !",  color: "text-yellow-400" };
  if (pct >= 0.7) return { emoji: "🥈", label: "Expert",      color: "text-gray-300"   };
  if (pct >= 0.5) return { emoji: "🥉", label: "Confirmé",    color: "text-amber-600"  };
  return              { emoji: "⚽", label: "Débutant",    color: "text-blue-400"   };
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function Quiz() {
  const { categoryId } = useParams();
  const navigate       = useNavigate();
  const { user }       = useAuth();
  const {
    coins, lives: globalLives, maxLives,
    submitResult,
  } = useGameStats();

  const category   = getCategoryById(categoryId) ?? getCategoryById("world-cup");
  const allQ       = QUESTIONS_MAP[category.id] ?? questionsWC;
  const playerName = user?.username ?? localStorage.getItem("playerName") ?? "Joueur";

  const [shuffledQ]      = useState(() => shuffle(allQ).slice(0, category.count));
  const [current,          setCurrent]          = useState(0);
  const [score,            setScore]            = useState(0);
  const [lives, setLives] = useState(Math.max(globalLives, 0));
  const [timeLeft,         setTimeLeft]         = useState(TIMER_MAX);
  const [selectedAnswer,   setSelectedAnswer]   = useState(null);
  const [showResult,       setShowResult]       = useState(false);
  const [isCorrect,        setIsCorrect]        = useState(false);
  const [finished,         setFinished]         = useState(false);
  const [ending,           setEnding]           = useState(false);
  const [streak,           setStreak]           = useState(0);
  const [fastAnswers,      setFastAnswers]      = useState(0);
  const [livesUsed,        setLivesUsed]        = useState(0);
  const [coinsEarned,      setCoinsEarned]      = useState(0);
  const [wrongAnswers,     setWrongAnswers]      = useState(0);

  const question = shuffledQ[current];
  const totalQ   = shuffledQ.length;
  const progress = ((current + 1) / totalQ) * 100;
  const xp       = score * 10;
  const level    = Math.floor(xp / 100) + 1;

  // Bloquer si plus de vies
  if (globalLives <= 0 && !finished) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-red-900 text-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-7xl mb-4">💔</div>
          <h1 className="text-2xl font-bold mb-2">Plus de vies !</h1>
          <p className="text-gray-400 mb-2">Tes vies se régénèrent automatiquement chaque heure.</p>
          <p className="text-gray-400 mb-6">Ou achète-en dans le Shop avec tes coins.</p>
          <div className="flex gap-3 justify-center">
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate("/shop")}
              className="bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl">
              🛒 Shop ({coins} 🪙)
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate("/quiz")}
              className="bg-white/10 text-white font-bold px-6 py-3 rounded-xl">
              ← Retour
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (finished || showResult) return;
    if (timeLeft === 0) { handleTimeout(); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, showResult, finished]);

  function handleAnswer(option) {
    if (showResult) return;
    const correct = option === question.answer;
    const fast    = timeLeft >= 10;
    setSelectedAnswer(option);
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(p => p + 1);
      setStreak(p => p + 1);
      if (fast) setFastAnswers(p => p + 1);
    } else {
      const nl = lives - 1;
      setLives(nl);
      setLivesUsed(p => p + 1);
      setWrongAnswers(p => p + 1);
      setStreak(0);
      if (nl <= 0) { setTimeout(() => finishQuiz(score), 1800); return; }
    }
    setTimeout(() => goNext(correct), 1800);
  }

  function handleTimeout() {
    if (showResult) return;
    setSelectedAnswer(null); setIsCorrect(false); setShowResult(true); setStreak(0);
    const nl = lives - 1;
    setLives(nl); setLivesUsed(p => p + 1); setWrongAnswers(p => p + 1);
    if (nl <= 0) { setTimeout(() => finishQuiz(score), 1800); return; }
    setTimeout(() => goNext(false), 1800);
  }

  function goNext(wasCorrect) {
    const next = current + 1;
    if (next < totalQ) {
      setCurrent(next); setTimeLeft(TIMER_MAX);
      setShowResult(false); setSelectedAnswer(null);
    } else finishQuiz(score + (wasCorrect ? 1 : 0));
  }

  async function finishQuiz(finalScore) {
    if (ending) return;
    setEnding(true);

    // Sauvegarder localement
    const best = Number(localStorage.getItem("bestScore")) || 0;
    if (finalScore > best) localStorage.setItem("bestScore", finalScore);
    const history = JSON.parse(localStorage.getItem("history")) || [];
    history.push({ score: finalScore, total: totalQ, category: category.id, date: Date.now() });
    localStorage.setItem("history", JSON.stringify(history));
    const lb = JSON.parse(localStorage.getItem("leaderboard")) || [];
    const existing = lb.findIndex(p => p.name === playerName && p.category === category.id);
    if (existing >= 0) {
    if (finalScore > lb[existing].score) lb[existing].score = finalScore;
    } else {
    lb.push({ name: playerName, score: finalScore, category: category.id });
    }
    lb.sort((a, b) => b.score - a.score);
    localStorage.setItem("leaderboard", JSON.stringify(lb.slice(0, 10)));

    // 1 partie = 1 vie globale consommée
    const result = await submitResult({
    correct:     finalScore,
    wrong:       wrongAnswers,
    streak:      streak,
    fastAnswers: fastAnswers,
    livesUsed:   1,
    });
    setCoinsEarned(result.coinsEarned ?? 0);

    setScore(finalScore);
    setFinished(true);
  }

  function btnClass(option) {
    if (!showResult) return "bg-white/10 hover:bg-white/20 border-white/20";
    if (option === question.answer) return "bg-green-500/80 border-green-400";
    if (option === selectedAnswer)  return "bg-red-500/80 border-red-400";
    return "bg-white/5 border-white/10 opacity-50";
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ÉCRAN RÉSULTAT
  // ══════════════════════════════════════════════════════════════════════════
  if (finished) {
    const medal   = getMedal(score, totalQ);
    const history = JSON.parse(localStorage.getItem("history")) || [];
    const best    = Number(localStorage.getItem("bestScore")) || 0;
    const avg     = history.length
      ? (history.reduce((a, g) => a + g.score, 0) / history.length).toFixed(1) : 0;
    const lb = JSON.parse(localStorage.getItem("leaderboard")) || [];

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-green-900 text-white pb-16">
        <div className="max-w-xl mx-auto px-4 pt-10">

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-6">
            <div className="text-6xl mb-2">{category.emoji}</div>
            <p className="text-sm text-gray-400 mb-3">{category.title}</p>
            <div className="text-7xl mb-3">{medal.emoji}</div>
            <h1 className="text-3xl font-bold mb-1">Bravo {playerName} !</h1>
            <p className={`text-lg font-semibold ${medal.color}`}>{medal.label}</p>
          </motion.div>

          {/* Score + Coins gagnés */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 rounded-2xl p-6 mb-4 text-center">
            <div className="text-5xl font-bold text-white mb-1">
              {score}<span className="text-2xl text-gray-400">/{totalQ}</span>
            </div>
            <div className="text-gray-400 text-sm mb-3">Score final · {category.title}</div>

            {/* Coins gagnés */}
            {coinsEarned > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-yellow-500/20 border border-yellow-400/40 rounded-xl px-4 py-2 mb-3">
                <span className="text-yellow-400 font-bold text-lg">+{coinsEarned} 🪙</span>
                <span className="text-gray-300 text-sm ml-2">coins gagnés !</span>
              </motion.div>
            )}

            <div className="grid grid-cols-4 gap-2 mt-2 text-sm">
              <div className="bg-white/5 rounded-xl p-2">
                <div className="text-lg font-bold text-yellow-400">{best}</div>
                <div className="text-gray-400 text-xs">Meilleur</div>
              </div>
              <div className="bg-white/5 rounded-xl p-2">
                <div className="text-lg font-bold text-blue-400">{history.length}</div>
                <div className="text-gray-400 text-xs">Parties</div>
              </div>
              <div className="bg-white/5 rounded-xl p-2">
                <div className="text-lg font-bold text-green-400">{avg}</div>
                <div className="text-gray-400 text-xs">Moyenne</div>
              </div>
              <div className="bg-white/5 rounded-xl p-2">
                <div className="text-lg font-bold text-orange-400">{coins}</div>
                <div className="text-gray-400 text-xs">🪙 coins</div>
              </div>
            </div>
          </motion.div>

          {/* Leaderboard local */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }} className="mb-6">
            <h2 className="text-lg font-bold mb-3 text-yellow-400">🏆 Classement local</h2>
            <div className="space-y-2">
              {lb.slice(0, 5).map((p, i) => (
                <div key={i} className={`flex justify-between items-center px-4 py-2 rounded-xl ${
                  p.name === playerName ? "bg-blue-600/30 border border-blue-400/40" : "bg-white/5"
                }`}>
                  <span className="text-sm">
                    {["🥇","🥈","🥉"][i] ?? `#${i+1}`} {p.name}
                    {p.name === playerName && <span className="text-xs text-blue-300 ml-1">(toi)</span>}
                  </span>
                  <span className="font-bold">{p.score}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Boutons */}
          <div className="space-y-3">
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate(0)}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-2xl transition">
              🔄 Rejouer {category.title}
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate("/quiz/leaderboard")}
              className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-4 rounded-2xl transition">
              🏆 Classement mondial
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate("/quiz")}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition">
              🧠 Changer de catégorie
            </motion.button>
            <a href={`https://wa.me/?text=${encodeURIComponent(
              `🧠 J'ai obtenu ${score}/${totalQ} au Quiz ${category.title} ! +${coinsEarned}🪙\n${medal.emoji} ${medal.label}\n🔥 https://world-cup-hub-kappa.vercel.app/quiz`
            )}`} target="_blank" rel="noopener noreferrer">
              <motion.button whileTap={{ scale: 0.97 }}
                className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl transition mt-3">
                📲 Partager sur WhatsApp
              </motion.button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ÉCRAN QUIZ
  // ══════════════════════════════════════════════════════════════════════════
  const timerColor = timeLeft <= 5 ? "bg-red-500" : timeLeft <= 10 ? "bg-yellow-400" : "bg-green-400";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-blue-900 text-white pb-16">
      <div className="max-w-xl mx-auto px-4 pt-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/quiz")}
              className="text-gray-400 hover:text-white transition text-xl">←</button>
            <div className="text-2xl">{category.emoji}</div>
            <div>
              <div className="font-bold text-sm">{category.title}</div>
              <div className="text-xs text-gray-400">{category.difficulty}</div>
            </div>
          </div>
          {/* Coins */}
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-3 py-1 text-center">
            <div className="text-sm font-bold text-yellow-400">{coins} 🪙</div>
          </div>
        </div>

        {/* Stats header */}
        <div className="flex justify-between items-center mb-4">
          {/* Vies */}
          <div className="flex gap-1">
            {Array.from({ length: maxLives }).map((_, i) => (
              <span key={i} style={{ opacity: i < lives ? 1 : 0.2 }}>
                {i < lives ? "❤️" : "🖤"}
              </span>
            ))}
          </div>
          <div className="flex gap-2 text-sm">
            {streak >= 3 && (
              <span className="bg-orange-500/30 text-orange-300 px-2 py-1 rounded-lg font-bold">
                🔥 {streak} série !
              </span>
            )}
            <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-lg font-bold">
              ⭐ Niv. {level}
            </span>
            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-lg font-bold">
              🎯 {score} pts
            </span>
          </div>
        </div>

        {/* Progression */}
        <div className="mb-2 flex justify-between text-xs text-gray-400">
          <span>Question {current + 1} / {totalQ}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 mb-5">
          <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}
            className="bg-blue-500 h-2 rounded-full" />
        </div>

        {/* Timer */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`text-2xl font-bold ${timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-yellow-400"}`}>
            ⏱️ {timeLeft}s
          </div>
          <div className="flex-1 bg-white/10 rounded-full h-2">
            <motion.div animate={{ width: `${(timeLeft / TIMER_MAX) * 100}%` }}
              transition={{ duration: 0.5 }}
              className={`h-2 rounded-full transition-colors ${timerColor}`} />
          </div>
          {/* Bonus rapide */}
          {timeLeft >= 10 && !showResult && (
            <span className="text-xs text-yellow-400 font-bold">⚡+10</span>
          )}
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div key={current}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 font-semibold">
                {category.title}
              </p>
              <h2 className="text-xl font-bold leading-snug">{question.question}</h2>
            </div>

            {/* Options */}
            <div className="grid gap-3">
              {question.options.map((option, i) => (
                <motion.button key={i}
                  whileTap={{ scale: showResult ? 1 : 0.97 }}
                  disabled={showResult}
                  onClick={() => handleAnswer(option)}
                  className={`w-full text-left px-5 py-4 rounded-xl border font-semibold text-sm transition-all ${btnClass(option)}`}
                >
                  <span className="text-gray-400 mr-2">{["A","B","C","D"][i]}.</span>
                  {option}
                </motion.button>
              ))}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {showResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`mt-4 p-4 rounded-xl text-center font-bold ${
                    isCorrect
                      ? "bg-green-500/20 border border-green-400/40 text-green-300"
                      : "bg-red-500/20 border border-red-400/40 text-red-300"
                  }`}
                >
                  {isCorrect ? (
                    <span>
                      ✅ Bonne réponse ! +10🪙
                      {timeLeft >= 10 && " ⚡+10🪙 rapide !"}
                      {streak >= 2 && ` 🔥 Série de ${streak} !`}
                    </span>
                  ) : (
                    <span>
                      ❌ {selectedAnswer === null ? "Temps écoulé" : "Mauvaise réponse"}
                      {" — "}Réponse : <span className="text-white">{question.answer}</span>
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
