// src/pages/Quiz.jsx
// Quiz WC 2026 — design moderne + auth intégré + animations

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence }           from "framer-motion";
import { Link }                              from "react-router-dom";
import { useAuth }                           from "../hooks/useAuth";
import questions                             from "../data/questions.json";

// ── Constantes ────────────────────────────────────────────────────────────────
const TIMER_MAX   = 15;
const MAX_LIVES   = 3;
const POINTS_CORRECT = 10;
const POINTS_FAST    = 5;  // bonus si réponse en < 5s

// ── Utilitaires ───────────────────────────────────────────────────────────────
function getMedal(score, total) {
  const pct = score / total;
  if (pct >= 0.9) return { emoji: "🥇", label: "Champion !", color: "text-yellow-400" };
  if (pct >= 0.7) return { emoji: "🥈", label: "Expert",     color: "text-gray-300"   };
  if (pct >= 0.5) return { emoji: "🥉", label: "Confirmé",   color: "text-amber-600"  };
  return              { emoji: "⚽", label: "Débutant",   color: "text-blue-400"   };
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── Composant ─────────────────────────────────────────────────────────────────
export default function Quiz() {
  const { user } = useAuth();
  const playerName = user?.username ?? localStorage.getItem("playerName") ?? "Joueur";

  // Mélanger les questions au démarrage
  const [shuffledQ]      = useState(() => shuffle(questions));
  const [current,        setCurrent]        = useState(0);
  const [score,          setScore]          = useState(0);
  const [lives,          setLives]          = useState(MAX_LIVES);
  const [timeLeft,       setTimeLeft]       = useState(TIMER_MAX);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult,     setShowResult]     = useState(false);
  const [isCorrect,      setIsCorrect]      = useState(false);
  const [finished,       setFinished]       = useState(false);
  const [ending,         setEnding]         = useState(false);
  const [streak,         setStreak]         = useState(0);  // série de bonnes réponses

  const question    = shuffledQ[current];
  const totalQ      = shuffledQ.length;
  const xp          = score * POINTS_CORRECT;
  const level       = Math.floor(xp / 100) + 1;
  const progress    = ((current + 1) / totalQ) * 100;

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (finished || showResult) return;
    if (timeLeft === 0) { handleTimeout(); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, showResult, finished]);

 

  // ── Répondre ───────────────────────────────────────────────────────────────
  function handleAnswer(option) {
    if (showResult) return;
    const correct = option === question.answer;
    setSelectedAnswer(option);
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      const bonus = timeLeft >= 10 ? POINTS_FAST : 0;
      setScore(p => p + 1);
      setStreak(p => p + 1);
    } 
    if (!correct) {
        const newLives = lives - 1;
        setLives(newLives);
        setStreak(0);
        if (newLives <= 0) {
            setShowResult(true);
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
    if (newLives <= 0) {
        setShowResult(true);
        setTimeout(() => finishQuiz(score), 1800);
        return;
    }
    setStreak(0);
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

  // ── Fin du quiz ────────────────────────────────────────────────────────────
  function finishQuiz(finalScore) {
    if (ending) return;
    setEnding(true);

    // Sauvegarder localement
    const best = Number(localStorage.getItem("bestScore")) || 0;
    if (finalScore > best) localStorage.setItem("bestScore", finalScore);

    const history = JSON.parse(localStorage.getItem("history")) || [];
    history.push({ score: finalScore, total: totalQ, date: Date.now() });
    localStorage.setItem("history", JSON.stringify(history));

    const lb = JSON.parse(localStorage.getItem("leaderboard")) || [];
    lb.push({ name: playerName, score: finalScore });
    lb.sort((a, b) => b.score - a.score);
    localStorage.setItem("leaderboard", JSON.stringify(lb.slice(0, 10)));

    setScore(finalScore);
    setFinished(true);
  }

  function replay() {
    setCurrent(0);
    setScore(0);
    setLives(MAX_LIVES);
    setTimeLeft(TIMER_MAX);
    setShowResult(false);
    setSelectedAnswer(null);
    setFinished(false);
    setEnding(false);
    setStreak(0);
  }

  // ── Couleur bouton ─────────────────────────────────────────────────────────
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
    const medal    = getMedal(score, totalQ);
    const history  = JSON.parse(localStorage.getItem("history")) || [];
    const best     = Number(localStorage.getItem("bestScore")) || 0;
    const avg      = history.length
      ? (history.reduce((a, g) => a + g.score, 0) / history.length).toFixed(1)
      : 0;
    const lb = JSON.parse(localStorage.getItem("leaderboard")) || [];

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-green-900 text-white pb-16">
        <div className="max-w-xl mx-auto px-4 pt-10">

          {/* Résultat principal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8"
          >
            <div className="text-7xl mb-4">{medal.emoji}</div>
            <h1 className="text-3xl font-bold mb-1">
              Bravo {playerName} !
            </h1>
            <p className={`text-lg font-semibold ${medal.color}`}>{medal.label}</p>
          </motion.div>

          {/* Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 rounded-2xl p-6 mb-4 text-center"
          >
            <div className="text-5xl font-bold text-white mb-1">
              {score}<span className="text-2xl text-gray-400">/{totalQ}</span>
            </div>
            <div className="text-gray-400 text-sm">Score final</div>

            <div className="grid grid-cols-3 gap-3 mt-4 text-center text-sm">
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

          {/* Leaderboard local */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="text-lg font-bold mb-3 text-yellow-400">🏆 Classement local</h2>
            <div className="space-y-2">
              {lb.slice(0, 5).map((p, i) => (
                <div key={i}
                  className={`flex justify-between items-center px-4 py-2 rounded-xl ${
                    p.name === playerName ? "bg-blue-600/30 border border-blue-400/40" : "bg-white/5"
                  }`}
                >
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
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={replay}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-2xl transition"
            >
              🔄 Rejouer
            </motion.button>

            <a href={`https://wa.me/?text=${encodeURIComponent(
              `🧠 J'ai obtenu ${score}/${totalQ} au Quiz World Cup Hub !\n${medal.emoji} ${medal.label}\n🔥 https://world-cup-hub-kappa.vercel.app/quiz`
            )}`} target="_blank" rel="noopener noreferrer">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl transition mt-3"
              >
                📲 Partager sur WhatsApp
              </motion.button>
            </a>

            <Link to="/">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition mt-3"
              >
                🏠 Retour à l'accueil
              </motion.button>
            </Link>
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

        {/* ── Header stats ── */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-1 text-xl">
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
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

        {/* ── Barre de progression ── */}
        <div className="mb-2 flex justify-between text-xs text-gray-400">
          <span>Question {current + 1} / {totalQ}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 mb-5">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
            className="bg-blue-500 h-2 rounded-full"
          />
        </div>

        {/* ── Timer ── */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`text-2xl font-bold ${timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-yellow-400"}`}>
            ⏱️ {timeLeft}s
          </div>
          <div className="flex-1 bg-white/10 rounded-full h-2">
            <motion.div
              animate={{ width: `${(timeLeft / TIMER_MAX) * 100}%` }}
              transition={{ duration: 0.5 }}
              className={`h-2 rounded-full transition-colors ${timerColor}`}
            />
          </div>
        </div>

        {/* ── Question ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 font-semibold">
                {question.category ?? "Culture foot"}
              </p>
              <h2 className="text-xl font-bold leading-snug">{question.question}</h2>
            </div>

            {/* ── Options ── */}
            <div className="grid gap-3">
              {question.options.map((option, i) => (
                <motion.button
                  key={i}
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

            {/* ── Feedback ── */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-4 p-4 rounded-xl text-center font-bold ${
                    isCorrect
                      ? "bg-green-500/20 border border-green-400/40 text-green-300"
                      : "bg-red-500/20 border border-red-400/40 text-red-300"
                  }`}
                >
                  {isCorrect ? (
                    <span>✅ Bonne réponse ! {streak >= 2 ? `🔥 Série de ${streak} !` : ""}</span>
                  ) : (
                    <span>
                      ❌ Mauvaise réponse
                      {selectedAnswer === null && " (temps écoulé)"}
                      {" — "}
                      Réponse : <span className="text-white">{question.answer}</span>
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
