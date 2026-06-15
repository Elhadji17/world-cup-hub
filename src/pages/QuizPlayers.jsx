// src/pages/QuizPlayers.jsx
// Mode Devine le joueur — images Wikimedia Commons via proxy backend
// Licence : Creative Commons — attribution dans le footer


import { motion, AnimatePresence } from "framer-motion";
import { useNavigate }             from "react-router-dom";
import { useAuth }                 from "../hooks/useAuth";
import playersData                 from "../data/questions-players.json";
import { useState, useEffect } from "react";


const MAX_LIVES = 3;
const TIMER_MAX = 30;

// Niveaux de flou : 20px → 12px → 6px → 2px → 0px
const BLUR_STEPS = [20, 12, 6, 2, 0];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getMedal(score, total) {
  const pct = score / total;
  if (pct >= 0.9) return { emoji: "🥇", label: "Scout Pro !",  color: "text-yellow-400" };
  if (pct >= 0.7) return { emoji: "🥈", label: "Expert",       color: "text-gray-300"   };
  if (pct >= 0.5) return { emoji: "🥉", label: "Confirmé",     color: "text-amber-600"  };
  return              { emoji: "⚽", label: "Continue !",    color: "text-blue-400"   };
}

// Composant image — flou CSS direct (plus fiable que Framer Motion)
function PlayerImage({ wikimedia, blur, showResult }) {
  const [status, setStatus] = useState("loading");

  // Reset au changement d'image
  useEffect(() => {
    setStatus("loading");
    // Vérifier immédiatement si déjà en cache
    const img = new Image();
    img.onload  = () => setStatus("ok");
    img.onerror = () => setStatus("error");
    img.src = wikimedia;
  }, [wikimedia]);

  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-gray-800 border border-white/10">

      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="text-4xl animate-bounce">⚽</div>
          <p className="text-gray-400 text-xs">Chargement...</p>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl">👤</div>
        </div>
      )}

      {status === "ok" && (
        <img
          src={wikimedia}
          alt="Devine ce joueur"
          style={{
            filter:         `blur(${blur}px)`,
            transition:     "filter 1s ease-out",
            width:          "100%",
            height:         "100%",
            objectFit:      "cover",
            objectPosition: "center 20%",
          }}
        />
      )}

      {status === "ok" && blur > 4 && !showResult && (
        <div className="absolute inset-0 flex items-end justify-center pb-4">
          <div className="bg-black/60 rounded-xl px-4 py-2 text-white text-sm font-bold">
            🔍 Qui est ce joueur ?
          </div>
        </div>
      )}
    </div>
  );
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
  const [blurStep,         setBlurStep]         = useState(0);
  const [selectedAnswer,   setSelectedAnswer]   = useState(null);
  const [showResult,       setShowResult]       = useState(false);
  const [isCorrect,        setIsCorrect]        = useState(false);
  const [finished,         setFinished]         = useState(false);
  const [ending,           setEnding]           = useState(false);
  const [streak,           setStreak]           = useState(0);
  const [hintsVisible,     setHintsVisible]     = useState(0);

  const question = questions[current];
  const totalQ   = questions.length;
  const blur     = BLUR_STEPS[blurStep] ?? 0;

  // Timer + défloutage toutes les 6s
  useEffect(() => {
    if (finished || showResult) return;
    if (timeLeft === 0) { handleTimeout(); return; }

    // Défloutage progressif
    const step = Math.min(Math.floor((TIMER_MAX - timeLeft) / 6), BLUR_STEPS.length - 1);
    if (step > blurStep) setBlurStep(step);

    // Indices visibles (1 toutes les 10s)
    const hints = Math.min(Math.floor((TIMER_MAX - timeLeft) / 10), 3);
    if (hints > hintsVisible) setHintsVisible(hints);

    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, showResult, finished]);

  function handleAnswer(option) {
    if (showResult) return;
    const correct = option === question.answer;
    setSelectedAnswer(option);
    setIsCorrect(correct);
    setShowResult(true);
    setBlurStep(BLUR_STEPS.length - 1); // révéler complètement
    setHintsVisible(3);

    if (correct) { setScore(p => p + 1); setStreak(p => p + 1); }
    else {
      const nl = lives - 1; setLives(nl); setStreak(0);
      if (nl <= 0) { setTimeout(() => finishQuiz(score), 2000); return; }
    }
    setTimeout(() => goNext(correct), 2000);
  }

  function handleTimeout() {
    if (showResult) return;
    setSelectedAnswer(null); setIsCorrect(false);
    setShowResult(true); setStreak(0);
    setBlurStep(BLUR_STEPS.length - 1);
    setHintsVisible(3);
    const nl = lives - 1; setLives(nl);
    if (nl <= 0) { setTimeout(() => finishQuiz(score), 2000); return; }
    setTimeout(() => goNext(false), 2000);
  }

  function goNext(wasCorrect) {
    const next = current + 1;
    if (next < totalQ) {
      setCurrent(next); setTimeLeft(TIMER_MAX); setBlurStep(0);
      setShowResult(false); setSelectedAnswer(null); setHintsVisible(0);
    } else finishQuiz(score + (wasCorrect ? 1 : 0));
  }

  function finishQuiz(finalScore) {
    if (ending) return;
    setEnding(true);
    const best = Number(localStorage.getItem("best_players")) || 0;
    if (finalScore > best) localStorage.setItem("best_players", finalScore);
    setScore(finalScore); setFinished(true);
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
              <p className="text-gray-400 text-sm mb-3">Joueurs reconnus</p>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-xl font-bold text-yellow-400">{best}</div>
                <div className="text-xs text-gray-400">Meilleur score</div>
              </div>
            </div>
            <div className="space-y-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate(0)}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-2xl transition">
                🔄 Rejouer
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate("/quiz")}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition">
                ← Autres catégories
              </motion.button>
              <a href={`https://wa.me/?text=${encodeURIComponent(
                `📸 J'ai reconnu ${score}/${totalQ} joueurs WC 2026 !\n${medal.emoji} ${medal.label}\n🔥 https://world-cup-hub-kappa.vercel.app/quiz/players`
              )}`} target="_blank" rel="noopener noreferrer">
                <motion.button whileTap={{ scale: 0.97 }}
                  className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl transition mt-3">
                  📲 Partager sur WhatsApp
                </motion.button>
              </a>
            </div>
            {/* Attribution Wikimedia */}
            <p className="text-xs text-gray-600 mt-6">
              📷 Photos sous licence Creative Commons — Wikimedia Commons
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Jeu ───────────────────────────────────────────────────────────────────
  const progress   = ((current + 1) / totalQ) * 100;
  const timerColor = timeLeft <= 8 ? "bg-red-500" : timeLeft <= 15 ? "bg-yellow-400" : "bg-green-400";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-purple-900 text-white pb-16">
      <div className="max-w-xl mx-auto px-4 pt-4">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigate("/quiz")} className="text-gray-400 hover:text-white transition">
            ← Retour
          </button>
          <span className="text-sm font-bold">📸 Devine le joueur</span>
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
          <span className="text-gray-400">Joueur {current + 1}/{totalQ}</span>
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
              transition={{ duration: 0.5 }} className={`h-2 rounded-full ${timerColor}`} />
          </div>
          <span className="text-xs text-gray-400">
            {blur === 0 ? "✅ Net" : `Flou ${blur}px`}
          </span>
        </div>

        {/* Image floutée via proxy */}
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="relative mb-4"
          >
            <PlayerImage
              wikimedia={question.image}
              blur={blur}
              showResult={showResult}
            />

            {/* Résultat overlay */}
            {showResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`absolute bottom-4 left-4 right-4 text-center px-4 py-3 rounded-xl font-bold text-lg ${
                  isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"
                }`}
              >
                {isCorrect ? `✅ ${question.answer} !` : `❌ C'était ${question.answer}`}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Indices progressifs */}
        <div className="mb-4 space-y-2">
          {question.hints.map((hint, i) => (
            <motion.div key={i}
              animate={{ opacity: hintsVisible > i ? 1 : 0.2 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border ${
                hintsVisible > i
                  ? "bg-purple-500/20 border-purple-400/30 text-white"
                  : "bg-white/5 border-white/10 text-gray-600"
              }`}
            >
              <span>{hintsVisible > i ? "💡" : "🔒"}</span>
              <span>{hintsVisible > i ? hint : `Indice ${i + 1} dans ${10 * (i + 1) - (TIMER_MAX - timeLeft)}s...`}</span>
            </motion.div>
          ))}
        </div>

        {/* Options 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          {question.options.map((option, i) => (
            <motion.button key={i}
              whileTap={{ scale: showResult ? 1 : 0.97 }}
              disabled={showResult}
              onClick={() => handleAnswer(option)}
              className={`py-4 px-3 rounded-xl border font-semibold text-sm transition-all text-center ${btnClass(option)}`}
            >
              {option}
            </motion.button>
          ))}
        </div>

        {/* Attribution */}
        {showResult && (
          <p className="text-xs text-gray-600 text-center mt-3">
            📷 {question.license ?? "CC — Wikimedia Commons"}
          </p>
        )}

      </div>
    </div>
  );
}
