// src/pages/QuizPlayers.jsx
// Mode Devine le joueur — image floutée progressivement

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence }           from "framer-motion";
import { useNavigate }                       from "react-router-dom";
import { useAuth }                           from "../hooks/useAuth";
import playersData                           from "../data/questions-players.json";

const MAX_LIVES  = 3;
const TIMER_MAX  = 30; // plus de temps car image floutée
const BLUR_STEPS = [20, 12, 6, 2, 0]; // flou progressif

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getMedal(score, total) {
  const pct = score / total;
  if (pct >= 0.9) return { emoji: "🥇", label: "Scout Pro !", color: "text-yellow-400" };
  if (pct >= 0.7) return { emoji: "🥈", label: "Expert",      color: "text-gray-300"  };
  if (pct >= 0.5) return { emoji: "🥉", label: "Confirmé",    color: "text-amber-600" };
  return              { emoji: "⚽", label: "Débutant",    color: "text-blue-400"  };
}

export default function QuizPlayers() {
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const playerName = user?.username ?? localStorage.getItem("playerName") ?? "Joueur";

  const [questions]      = useState(() => shuffle(playersData));
  const [current,          setCurrent]          = useState(0);
  const [score,            setScore]            = useState(0);
  const [lives,            setLives]            = useState(MAX_LIVES);
  const [timeLeft,         setTimeLeft]         = useState(TIMER_MAX);
  const [blurStep,         setBlurStep]         = useState(0); // index dans BLUR_STEPS
  const [selectedAnswer,   setSelectedAnswer]   = useState(null);
  const [showResult,       setShowResult]       = useState(false);
  const [isCorrect,        setIsCorrect]        = useState(false);
  const [finished,         setFinished]         = useState(false);
  const [ending,           setEnding]           = useState(false);
  const [hintsUsed,        setHintsUsed]        = useState(0);
  const [showHint,         setShowHint]         = useState(null); // 1|2|3
  const [imgError,         setImgError]         = useState(false);
  const [streak,           setStreak]           = useState(0);

  const question = questions[current];
  const totalQ   = questions.length;
  const blur     = BLUR_STEPS[blurStep] ?? 0;

  // ── Timer + défloutage progressif ────────────────────────────────────────
  useEffect(() => {
    if (finished || showResult) return;
    if (timeLeft === 0) { handleTimeout(); return; }

    // Défloutage toutes les 6 secondes
    const newStep = Math.min(
      Math.floor((TIMER_MAX - timeLeft) / 6),
      BLUR_STEPS.length - 1
    );
    if (newStep > blurStep) setBlurStep(newStep);

    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, showResult, finished]);

  function handleAnswer(option) {
    if (showResult) return;
    const correct = option === question.answer;
    setSelectedAnswer(option);
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      // Bonus points selon la rapidité (moins de défloutage = plus de points)
      setScore(p => p + 1);
      setStreak(p => p + 1);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setStreak(0);
      if (newLives <= 0) {
        setTimeout(() => finishQuiz(score), 2000);
        return;
      }
    }
    setTimeout(() => goNext(correct), 2000);
  }

  function handleTimeout() {
    if (showResult) return;
    setSelectedAnswer(null);
    setIsCorrect(false);
    setShowResult(true);
    setStreak(0);
    const newLives = lives - 1;
    setLives(newLives);
    if (newLives <= 0) {
      setTimeout(() => finishQuiz(score), 2000);
      return;
    }
    setTimeout(() => goNext(false), 2000);
  }

  function useHint(hintNum) {
    if (showHint === hintNum) { setShowHint(null); return; }
    setShowHint(hintNum);
    setHintsUsed(p => Math.max(p, hintNum));
    // Utiliser un indice accélère le défloutage
    setBlurStep(p => Math.min(p + 1, BLUR_STEPS.length - 1));
  }

  function goNext(wasCorrect) {
    const next = current + 1;
    if (next < totalQ) {
      setCurrent(next);
      setTimeLeft(TIMER_MAX);
      setBlurStep(0);
      setShowResult(false);
      setSelectedAnswer(null);
      setShowHint(null);
      setHintsUsed(0);
      setImgError(false);
    } else {
      finishQuiz(score + (wasCorrect ? 1 : 0));
    }
  }

  function finishQuiz(finalScore) {
    if (ending) return;
    setEnding(true);
    const best = Number(localStorage.getItem("best_players")) || 0;
    if (finalScore > best) localStorage.setItem("best_players", finalScore);
    setScore(finalScore);
    setFinished(true);
  }

  function btnClass(option) {
    if (!showResult) return "bg-white/10 hover:bg-white/20 border-white/20";
    if (option === question.answer) return "bg-green-500/80 border-green-400";
    if (option === selectedAnswer)  return "bg-red-500/80 border-red-400";
    return "bg-white/5 border-white/10 opacity-40";
  }

  // ── Résultat ──────────────────────────────────────────────────────────────
  if (finished) {
    const medal = getMedal(score, totalQ);
    const best  = Number(localStorage.getItem("best_players")) || 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-purple-900 text-white pb-16">
        <div className="max-w-xl mx-auto px-4 pt-10 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="text-7xl mb-3">{medal.emoji}</div>
            <h1 className="text-3xl font-bold mb-1">Bravo {playerName} !</h1>
            <p className={`text-lg font-semibold mb-6 ${medal.color}`}>{medal.label}</p>

            <div className="bg-white/10 rounded-2xl p-6 mb-6">
              <div className="text-5xl font-bold mb-1">
                {score}<span className="text-2xl text-gray-400">/{totalQ}</span>
              </div>
              <p className="text-gray-400 text-sm">Joueurs reconnus</p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-xl font-bold text-yellow-400">{best}</div>
                  <div className="text-xs text-gray-400">Meilleur</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-xl font-bold text-orange-400">{hintsUsed}</div>
                  <div className="text-xs text-gray-400">Indices utilisés</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => navigate(0)}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-2xl transition"
              >
                🔄 Rejouer
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/quiz")}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition"
              >
                ← Autres catégories
              </motion.button>
              <a href={`https://wa.me/?text=${encodeURIComponent(
                `📸 J'ai reconnu ${score}/${totalQ} joueurs sur World Cup Hub !\n${medal.emoji} ${medal.label}\n🔥 https://world-cup-hub-kappa.vercel.app/quiz/players`
              )}`} target="_blank" rel="noopener noreferrer">
                <motion.button whileTap={{ scale: 0.97 }}
                  className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl transition mt-3"
                >
                  📲 Partager sur WhatsApp
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Jeu ───────────────────────────────────────────────────────────────────
  const timerColor  = timeLeft <= 8 ? "bg-red-500" : timeLeft <= 15 ? "bg-yellow-400" : "bg-green-400";
  const progress    = ((current + 1) / totalQ) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-purple-900 text-white pb-16">
      <div className="max-w-xl mx-auto px-4 pt-4">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigate("/quiz")}
            className="text-gray-400 hover:text-white transition">← Retour</button>
          <div className="text-sm font-bold">📸 Devine le joueur</div>
          <div className="flex gap-1">
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <span key={i} style={{ opacity: i < lives ? 1 : 0.2 }}>
                {i < lives ? "❤️" : "🖤"}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between text-xs mb-3">
          <span className="text-gray-400">Q {current + 1}/{totalQ}</span>
          <div className="flex gap-2">
            {streak >= 3 && (
              <span className="bg-orange-500/30 text-orange-300 px-2 py-1 rounded-lg font-bold">
                🔥 {streak}
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
            className="bg-purple-500 h-1.5 rounded-full" />
        </div>

        {/* Timer */}
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-lg font-bold ${timeLeft <= 8 ? "text-red-400 animate-pulse" : "text-yellow-400"}`}>
            ⏱️ {timeLeft}s
          </span>
          <div className="flex-1 bg-white/10 rounded-full h-2">
            <motion.div animate={{ width: `${(timeLeft / TIMER_MAX) * 100}%` }}
              transition={{ duration: 0.5 }}
              className={`h-2 rounded-full ${timerColor}`} />
          </div>
          <span className="text-xs text-gray-400">
            Flou : {blur === 0 ? "✅ Net" : `${blur}px`}
          </span>
        </div>

        {/* Image floutée */}
        <AnimatePresence mode="wait">
          <motion.div key={current}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="relative mb-4 rounded-2xl overflow-hidden bg-gray-800 border border-white/10"
            style={{ height: "280px" }}
          >
            {!imgError ? (
              <motion.img
                src={question.image}
                alt="Devine ce joueur"
                onError={() => setImgError(true)}
                animate={{ filter: `blur(${blur}px)` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-2">👤</div>
                  <p className="text-sm">Image non disponible</p>
                </div>
              </div>
            )}

            {/* Overlay flou label */}
            {blur > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-sm font-bold">
                  🔍 Qui est ce joueur ?
                </div>
              </div>
            )}

            {/* Révélation */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`absolute inset-0 flex items-end justify-center pb-4 ${
                  isCorrect ? "bg-green-500/20" : "bg-red-500/20"
                }`}
              >
                <div className={`px-6 py-3 rounded-xl font-bold text-lg ${
                  isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"
                }`}>
                  {isCorrect ? `✅ ${question.answer} !` : `❌ C'était ${question.answer}`}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Indices */}
        {!showResult && (
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map(n => {
              const hint = question[`hint${n}`];
              return (
                <button key={n}
                  onClick={() => useHint(n)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    showHint === n
                      ? "bg-purple-600 border-purple-400 text-white"
                      : hintsUsed >= n
                        ? "bg-purple-900/40 border-purple-500/40 text-purple-300"
                        : "bg-white/10 border-white/20 text-gray-400 hover:bg-white/20"
                  }`}
                >
                  {showHint === n ? hint : `💡 Indice ${n}`}
                </button>
              );
            })}
          </div>
        )}

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {question.options.map((option, i) => (
            <motion.button key={i}
              whileTap={{ scale: showResult ? 1 : 0.97 }}
              disabled={showResult}
              onClick={() => handleAnswer(option)}
              className={`py-3 px-4 rounded-xl border font-semibold text-sm transition-all text-left ${btnClass(option)}`}
            >
              {option}
            </motion.button>
          ))}
        </div>

      </div>
    </div>
  );
}
