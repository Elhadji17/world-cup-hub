// src/pages/QuizGame.jsx
// Quiz par catégorie — remplace Quiz.jsx pour les catégories spécifiques

import { useState, useEffect }  from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence }      from "framer-motion";
import { useAuth }                      from "../hooks/useAuth";
import { getCategoryById }              from "../data/quiz-categories";

const TIMER_MAX   = 15;
const MAX_LIVES   = 3;

function getMedal(score, total) {
  const pct = score / total;
  if (pct >= 0.9) return { emoji: "🥇", label: "Champion !",  color: "text-yellow-400" };
  if (pct >= 0.7) return { emoji: "🥈", label: "Expert",      color: "text-gray-300"   };
  if (pct >= 0.5) return { emoji: "🥉", label: "Confirmé",    color: "text-amber-600"  };
  return              { emoji: "⚽", label: "Continue !",   color: "text-blue-400"   };
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function QuizGame() {
  const { categoryId } = useParams();
  const navigate       = useNavigate();
  const { user }       = useAuth();
  const playerName     = user?.username ?? localStorage.getItem("playerName") ?? "Joueur";

  const category = getCategoryById(categoryId);
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  // Charger les questions dynamiquement
  useEffect(() => {
    if (!category) { setError("Catégorie introuvable."); setLoading(false); return; }

    import(`../data/${category.questions}`)
      .then(mod => {
        setQuestions(shuffle(mod.default).slice(0, category.count));
        setLoading(false);
      })
      .catch(() => {
        setError("Questions introuvables.");
        setLoading(false);
      });
  }, [categoryId]);

  // États du quiz
  const [current,        setCurrent]        = useState(0);
  const [score,          setScore]          = useState(0);
  const [lives,          setLives]          = useState(MAX_LIVES);
  const [timeLeft,       setTimeLeft]       = useState(TIMER_MAX);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult,     setShowResult]     = useState(false);
  const [isCorrect,      setIsCorrect]      = useState(false);
  const [finished,       setFinished]       = useState(false);
  const [ending,         setEnding]         = useState(false);
  const [streak,         setStreak]         = useState(0);

  const question = questions[current];
  const totalQ   = questions.length;

  // Timer
  useEffect(() => {
    if (loading || finished || showResult || !question) return;
    if (timeLeft === 0) { handleTimeout(); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, showResult, finished, loading, question]);

  function handleAnswer(option) {
    if (showResult) return;
    const correct = option === question.answer;
    setSelectedAnswer(option);
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(p => p + 1);
      setStreak(p => p + 1);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setStreak(0);
      if (newLives <= 0) {
        setTimeout(() => finishQuiz(score), 1800);
        return;
      }
    }
    setTimeout(() => goNext(correct), 1800);
  }

  function handleTimeout() {
    if (showResult) return;
    setSelectedAnswer(null);
    setIsCorrect(false);
    setShowResult(true);
    const newLives = lives - 1;
    setLives(newLives);
    setStreak(0);
    if (newLives <= 0) {
      setTimeout(() => finishQuiz(score), 1800);
      return;
    }
    setTimeout(() => goNext(false), 1800);
  }

  function goNext(wasCorrect) {
    const next = current + 1;
    if (next < totalQ) {
      setCurrent(next);
      setTimeLeft(TIMER_MAX);
      setShowResult(false);
      setSelectedAnswer(null);
    } else {
      finishQuiz(score + (wasCorrect ? 1 : 0));
    }
  }

  function finishQuiz(finalScore) {
    if (ending) return;
    setEnding(true);

    // Marquer le quiz du jour comme fait
    if (category?.isDaily) {
      localStorage.setItem("daily_quiz_date", new Date().toDateString());
    }

    // Sauvegarder
    const best = Number(localStorage.getItem(`best_${categoryId}`)) || 0;
    if (finalScore > best) localStorage.setItem(`best_${categoryId}`, finalScore);

    const history = JSON.parse(localStorage.getItem(`history_${categoryId}`)) || [];
    history.push({ score: finalScore, total: totalQ, date: Date.now() });
    localStorage.setItem(`history_${categoryId}`, JSON.stringify(history));

    setScore(finalScore);
    setFinished(true);
  }

  function btnClass(option) {
    if (!showResult) return "bg-white/10 hover:bg-white/20 border-white/20";
    if (option === question.answer) return "bg-green-500/80 border-green-400";
    if (option === selectedAnswer)  return "bg-red-500/80 border-red-400";
    return "bg-white/5 border-white/10 opacity-50";
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">{category?.emoji ?? "🧠"}</div>
        <p className="text-gray-400">Chargement des questions...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <Link to="/quiz" className="text-blue-400 underline">← Retour</Link>
      </div>
    </div>
  );

  // ── Résultat ───────────────────────────────────────────────────────────────
  if (finished) {
    const medal   = getMedal(score, totalQ);
    const best    = Number(localStorage.getItem(`best_${categoryId}`)) || 0;
    const history = JSON.parse(localStorage.getItem(`history_${categoryId}`)) || [];
    const avg     = history.length
      ? (history.reduce((a, g) => a + g.score, 0) / history.length).toFixed(1)
      : 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-green-900 text-white pb-16">
        <div className="max-w-xl mx-auto px-4 pt-10">

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8">
            <div className="text-7xl mb-3">{medal.emoji}</div>
            <h1 className="text-3xl font-bold">{playerName}</h1>
            <p className={`text-lg font-semibold mt-1 ${medal.color}`}>{medal.label}</p>
            <p className="text-sm text-gray-400 mt-1">{category?.title}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 rounded-2xl p-6 mb-5 text-center"
          >
            <div className="text-5xl font-bold mb-1">
              {score}<span className="text-2xl text-gray-400">/{totalQ}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-xl font-bold text-yellow-400">{best}</div>
                <div className="text-gray-400 text-xs">Meilleur</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-xl font-bold text-blue-400">{history.length}</div>
                <div className="text-gray-400 text-xs">Parties</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-xl font-bold text-green-400">{avg}</div>
                <div className="text-gray-400 text-xs">Moyenne</div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            {!category?.isDaily && (
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setCurrent(0); setScore(0); setLives(MAX_LIVES);
                  setTimeLeft(TIMER_MAX); setShowResult(false);
                  setSelectedAnswer(null); setFinished(false);
                  setEnding(false); setStreak(0);
                  setQuestions(shuffle(questions));
                }}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-2xl transition"
              >
                🔄 Rejouer
              </motion.button>
            )}

            <a href={`https://wa.me/?text=${encodeURIComponent(
              `🧠 ${score}/${totalQ} au Quiz ${category?.title} sur World Cup Hub !\n${medal.emoji} ${medal.label}\n🔥 https://world-cup-hub-kappa.vercel.app/quiz`
            )}`} target="_blank" rel="noopener noreferrer">
              <motion.button whileTap={{ scale: 0.97 }}
                className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl transition mt-3"
              >
                📲 Partager sur WhatsApp
              </motion.button>
            </a>

            <Link to="/quiz">
              <motion.button whileTap={{ scale: 0.97 }}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition mt-3"
              >
                ← Autres catégories
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Jeu ───────────────────────────────────────────────────────────────────
  const timerColor = timeLeft <= 5 ? "bg-red-500" : timeLeft <= 10 ? "bg-yellow-400" : "bg-green-400";
  const progress   = ((current + 1) / totalQ) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-blue-900 text-white pb-16">
      <div className="max-w-xl mx-auto px-4 pt-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link to="/quiz" className="text-gray-400 hover:text-white transition text-xl">←</Link>
          <div className="flex-1">
            <div className="text-sm font-bold">{category?.emoji} {category?.title}</div>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <span key={i} style={{ opacity: i < lives ? 1 : 0.2 }}>
                {i < lives ? "❤️" : "🖤"}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center mb-3 text-xs">
          <span className="text-gray-400">Q {current + 1}/{totalQ}</span>
          <div className="flex gap-2">
            {streak >= 3 && (
              <span className="bg-orange-500/30 text-orange-300 px-2 py-1 rounded-lg font-bold">
                🔥 {streak} série
              </span>
            )}
            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-lg font-bold">
              🎯 {score} pts
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full bg-white/10 rounded-full h-1.5 mb-4">
          <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}
            className="bg-blue-500 h-1.5 rounded-full" />
        </div>

        {/* Timer */}
        <div className="flex items-center gap-3 mb-5">
          <span className={`text-xl font-bold ${timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-yellow-400"}`}>
            ⏱️ {timeLeft}s
          </span>
          <div className="flex-1 bg-white/10 rounded-full h-2">
            <motion.div animate={{ width: `${(timeLeft / TIMER_MAX) * 100}%` }}
              transition={{ duration: 0.5 }}
              className={`h-2 rounded-full ${timerColor}`} />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div key={current}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-5 border border-white/10">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 font-semibold">
                {question?.category}
              </p>
              <h2 className="text-xl font-bold leading-snug">{question?.question}</h2>
            </div>

            <div className="grid gap-3">
              {question?.options.map((option, i) => (
                <motion.button key={i} whileTap={{ scale: showResult ? 1 : 0.97 }}
                  disabled={showResult} onClick={() => handleAnswer(option)}
                  className={`w-full text-left px-5 py-4 rounded-xl border font-semibold text-sm transition-all ${btnClass(option)}`}
                >
                  <span className="text-gray-400 mr-2">{["A","B","C","D"][i]}.</span>
                  {option}
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {showResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-4 p-4 rounded-xl text-center font-bold ${
                    isCorrect
                      ? "bg-green-500/20 border border-green-400/40 text-green-300"
                      : "bg-red-500/20 border border-red-400/40 text-red-300"
                  }`}
                >
                  {isCorrect
                    ? `✅ Bonne réponse ! ${streak >= 2 ? `🔥 Série de ${streak} !` : ""}`
                    : `❌ ${selectedAnswer === null ? "Temps écoulé — " : ""}Réponse : ${question?.answer}`
                  }
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
