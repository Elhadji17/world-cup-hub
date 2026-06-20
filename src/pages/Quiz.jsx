// src/pages/Quiz.jsx
import { useState, useEffect, useRef }  from "react";
import { motion, AnimatePresence }       from "framer-motion";
import { useNavigate, useParams }        from "react-router-dom";
import { useAuth }                       from "../hooks/useAuth";
import { useGameStats }                  from "../hooks/useGameStats";
import { getCategoryById }               from "../data/quiz-categories";
import { LEVELS, QUESTIONS_PER_LEVEL, getLevelQuestions, getCategoryLevel } from "../data/quiz-levels";

import questionsWC   from "../data/questions-world-cup.json";
import questionsSN   from "../data/questions-senegal.json";
import questionsFR   from "../data/questions-france.json";
import questionsUCL  from "../data/questions-ucl.json";
import questionsDaily from "../data/questions-daily.json";
import questionsBD   from "../data/questions-ballon-dor.json";

const QUESTIONS_MAP = {
  "world-cup":        questionsWC,
  "senegal":          questionsSN,
  "france":           questionsFR,
  "champions-league": questionsUCL,
  "ballon-dor":       questionsBD,
  "daily":            questionsDaily,
};

const TIMER_MAX = 15;
const API       = import.meta.env.VITE_API_URL ?? "";

function getMedal(score, total) {
  const pct = score / total;
  if (pct >= 0.9) return { emoji: "🥇", label: "Champion !",  color: "text-yellow-400" };
  if (pct >= 0.7) return { emoji: "🥈", label: "Expert",      color: "text-gray-300"   };
  if (pct >= 0.5) return { emoji: "🥉", label: "Confirmé",    color: "text-amber-600"  };
  return              { emoji: "⚽", label: "Débutant",    color: "text-blue-400"   };
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

// Fusionne les questions vues locales et celles du backend (le backend fait foi en cas de conflit)
function mergeSeen(localSeen, backendSeen) {
  return [...new Set([...(localSeen ?? []), ...(backendSeen ?? [])])];
}

export default function Quiz() {
  const { categoryId } = useParams();
  const navigate       = useNavigate();
  const { user }       = useAuth();
  const { coins, lives: globalLives, maxLives, submitResult, refresh } = useGameStats();

  const category   = getCategoryById(categoryId) ?? getCategoryById("world-cup");
  const allQ       = QUESTIONS_MAP[category.id] ?? questionsWC;
  const playerName = user?.username ?? localStorage.getItem("playerName") ?? "Joueur";

  // Snapshot des vies au début
  const [startLives] = useState(() => Math.max(globalLives, 0));
  const currentLevel  = getCategoryLevel(category.id);

  // Progression synchronisée — chargée depuis le backend avant de générer les questions
  const [progressReady, setProgressReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("wch_token");
    if (!token) { setProgressReady(true); return; }

    (async () => {
      try {
        const res  = await fetch(`${API}/api/quiz?action=get-progress`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.seenQuestions) {
          // Fusionner avec ce qui existe déjà en local (au cas où une partie locale
          // n'aurait pas encore été synchronisée) puis ré-écrire localStorage
          const seenKey   = `wch_seen_${category.id}`;
          const localSeen = JSON.parse(localStorage.getItem(seenKey)) ?? [];
          const backendSeen = data.seenQuestions[category.id] ?? [];
          const merged = mergeSeen(localSeen, backendSeen);
          localStorage.setItem(seenKey, JSON.stringify(merged));
        }
      } catch {
        // Hors-ligne ou erreur réseau — on continue avec ce qu'on a en local
      } finally {
        setProgressReady(true);
      }
    })();
  }, [category.id]);

  const [shuffledQ, setShuffledQ] = useState([]);

  useEffect(() => {
    if (!progressReady) return;
    const questions = getLevelQuestions(allQ, category.id);
    setShuffledQ(shuffle(questions).slice(0, QUESTIONS_PER_LEVEL));
  }, [progressReady]);

  const [current,        setCurrent]        = useState(0);
  const [score,          setScore]          = useState(0);
  const [lives,          setLives]          = useState(() => Math.max(globalLives, 0));
  const [timeLeft,       setTimeLeft]       = useState(TIMER_MAX);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult,     setShowResult]     = useState(false);
  const [isCorrect,      setIsCorrect]      = useState(false);
  const [finished,       setFinished]       = useState(false);
  const [ending,         setEnding]         = useState(false);
  const [streak,         setStreak]         = useState(0);
  const [fastAnswers,    setFastAnswers]    = useState(0);
  const [coinsEarned,    setCoinsEarned]    = useState(0);
  const [wrongAnswers,   setWrongAnswers]   = useState(0);
  const [levelUp,        setLevelUp]        = useState(false);
  const [newLevelIdx,    setNewLevelIdx]    = useState(0);
  const [localCoins,     setLocalCoins]     = useState(coins);

  const livesUsedRef = useRef(0);

  const question = shuffledQ[current];
  const totalQ   = shuffledQ.length;
  const progress = totalQ > 0 ? ((current + 1) / totalQ) * 100 : 0;

  useEffect(() => { setLocalCoins(coins); }, [coins]);

  // Timer
  useEffect(() => {
    if (!progressReady || finished || showResult || !question) return;
    if (timeLeft === 0) { handleTimeout(); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, showResult, finished, progressReady, question]);

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
      const bonus = fast ? 10 : 0;
      setLocalCoins(p => p + 10 + bonus);
      if (fast) setFastAnswers(p => p + 1);
      setTimeout(() => goNext(true), 1800);
    } else {
      const nl = lives - 1;
      setLives(nl);
      livesUsedRef.current += 1;
      setWrongAnswers(p => p + 1);
      setStreak(0);
      if (nl <= 0) { setTimeout(() => finishQuiz(score), 1800); return; }
      // Rester sur la question — style Duolingo
      setTimeout(() => {
        setShowResult(false);
        setSelectedAnswer(null);
      }, 1800);
    }
  }

  function handleTimeout() {
    if (showResult) return;
    setSelectedAnswer(null); setIsCorrect(false); setShowResult(true); setStreak(0);
    const nl = lives - 1;
    setLives(nl);
    livesUsedRef.current += 1;
    setWrongAnswers(p => p + 1);
    if (nl <= 0) { setTimeout(() => finishQuiz(score), 1800); return; }
    setTimeout(() => {
      setShowResult(false);
      setSelectedAnswer(null);
      setTimeLeft(TIMER_MAX);
    }, 1800);
  }

  function goNext(wasCorrect) {
    const next = current + 1;
    if (next < totalQ) {
      setCurrent(next); setTimeLeft(TIMER_MAX);
      setShowResult(false); setSelectedAnswer(null);
    } else {
      finishQuiz(score + (wasCorrect ? 1 : 0));
    }
  }

  // Sauvegarde la progression vers le backend — source de vérité partagée entre appareils
  async function saveProgressToBackend(categoryId, seenIds) {
    const token = localStorage.getItem("wch_token");
    if (!token) return;
    try {
      await fetch(`${API}/api/quiz?action=save-progress`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({ categoryId, seenIds }),
      });
    } catch {
      // Pas grave si ça échoue — la prochaine sauvegarde réussie rattrapera
    }
  }

  async function finishQuiz(finalScore) {
    if (ending) return;
    setEnding(true);

    // Sauvegarder questions jouées — localStorage en cache rapide + backend en source de vérité
    const seenKey = `wch_seen_${category.id}`;
    const seen    = JSON.parse(localStorage.getItem(seenKey)) ?? [];
    const played  = shuffledQ.slice(0, current + 1).map(q => q.id);
    const newSeen = [...new Set([...seen, ...played])];
    localStorage.setItem(seenKey, JSON.stringify(newSeen));
    await saveProgressToBackend(category.id, newSeen);

    // Détecter level up
    const prevLevelIdx = Math.min(Math.floor(seen.length / QUESTIONS_PER_LEVEL), LEVELS.length - 1);
    const nextLevelIdx = Math.min(Math.floor(newSeen.length / QUESTIONS_PER_LEVEL), LEVELS.length - 1);
    if (nextLevelIdx > prevLevelIdx) {
      setLevelUp(true);
      setNewLevelIdx(nextLevelIdx);
    }

    // Sauvegarder localement
    const best = Number(localStorage.getItem("bestScore")) || 0;
    if (finalScore > best) localStorage.setItem("bestScore", finalScore);
    const history = JSON.parse(localStorage.getItem("history")) || [];
    history.push({ score: finalScore, total: totalQ, category: category.id, date: Date.now() });
    localStorage.setItem("history", JSON.stringify(history));

    const result = await submitResult({
      correct:     finalScore,
      wrong:       wrongAnswers,
      streak:      streak,
      fastAnswers: fastAnswers,
      livesUsed:   livesUsedRef.current,
    });
    await refresh();
    setCoinsEarned(result.coinsEarned ?? 0);
    setScore(finalScore);
    setFinished(true);
  }

  function btnClass(option) {
    if (!showResult) return "bg-white/10 hover:bg-white/20 border-white/20";
    if (isCorrect && option === question.answer) return "bg-green-500/80 border-green-400";
    if (!isCorrect && option === selectedAnswer)  return "bg-red-500/80 border-red-400";
    return "bg-white/5 border-white/10 opacity-50";
  }

  // ── Écran chargement progression ────────────────────────────────────────
  if (!progressReady || shuffledQ.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">{category?.emoji ?? "🧠"}</div>
          <p className="text-gray-400">Chargement de ta progression...</p>
        </div>
      </div>
    );
  }

  // ── Écran plus de vies ────────────────────────────────────────────────────
  if (startLives <= 0 && !finished) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-red-900 text-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-7xl mb-4">💔</div>
          <h1 className="text-2xl font-bold mb-2">Plus de vies !</h1>
          <p className="text-gray-400 mb-2">Tes vies se régénèrent automatiquement toutes les 30 min.</p>
          <p className="text-gray-400 mb-6">Ou achète-en dans le Shop.</p>
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

  // ── Écran résultat ────────────────────────────────────────────────────────
  if (finished) {
    const medal   = getMedal(score, totalQ);
    const history = JSON.parse(localStorage.getItem("history")) || [];
    const best    = Number(localStorage.getItem("bestScore")) || 0;
    const avg     = history.length
      ? (history.reduce((a, g) => a + g.score, 0) / history.length).toFixed(1) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-green-900 text-white pb-16">
        <div className="max-w-xl mx-auto px-4 pt-10">

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-6">
            <div className="text-6xl mb-2">{category.emoji}</div>
            <p className="text-sm text-gray-400 mb-1">{category.title}</p>
            <p className="text-xs text-gray-500 mb-3">
              Niveau {currentLevel.level} — {currentLevel.label} {currentLevel.emoji}
            </p>
            <div className="text-7xl mb-3">{medal.emoji}</div>
            <h1 className="text-3xl font-bold mb-1">Bravo {playerName} !</h1>
            <p className={`text-lg font-semibold ${medal.color}`}>{medal.label}</p>

            {/* Level Up */}
            {levelUp && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 bg-yellow-500/20 border border-yellow-400/40 rounded-2xl px-6 py-4">
                <div className="text-3xl mb-1">🎉</div>
                <div className="text-yellow-400 font-black text-lg">
                  Niveau {LEVELS[newLevelIdx]?.level} débloqué !
                </div>
                <div className="text-sm text-gray-300">
                  {LEVELS[newLevelIdx]?.emoji} {LEVELS[newLevelIdx]?.label}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Score */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 rounded-2xl p-6 mb-4 text-center">
            <div className="text-5xl font-bold text-white mb-1">
              {score}<span className="text-2xl text-gray-400">/{totalQ}</span>
            </div>
            <div className="text-gray-400 text-sm mb-3">Score final</div>

            {coinsEarned > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-yellow-500/20 border border-yellow-400/40 rounded-xl px-4 py-2 mb-3">
                <span className="text-yellow-400 font-bold text-lg">+{coinsEarned} 🪙</span>
                <span className="text-gray-300 text-sm ml-2">coins gagnés !</span>
              </motion.div>
            )}

            <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
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
            </div>
          </motion.div>

          <div className="space-y-3">
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => navigate(0)}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-2xl transition">
              ▶ Niveau suivant
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate("/leaderboard")}
              className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-4 rounded-2xl transition">
              🏆 Classement mondial
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate("/quiz")}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition">
              🧠 Changer de catégorie
            </motion.button>
            <a href={`https://wa.me/?text=${encodeURIComponent(
              `🧠 J'ai obtenu ${score}/${totalQ} au Quiz ${category.title} !\n+${coinsEarned}🪙 · ${medal.emoji} ${medal.label}\n👉 worldcuphub2026.vercel.app/quiz`
            )}`} target="_blank" rel="noopener noreferrer">
              <motion.button whileTap={{ scale: 0.97 }}
                className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl transition mt-1">
                📲 Partager sur WhatsApp
              </motion.button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Écran quiz ────────────────────────────────────────────────────────────
  const timerColor = timeLeft <= 5 ? "bg-red-500" : timeLeft <= 10 ? "bg-yellow-400" : "bg-green-400";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-blue-900 text-white pb-16">
      <div className="max-w-xl mx-auto px-4 pt-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={() => {
              if (window.confirm("⚠️ Quitter ? Ta progression sera perdue.")) navigate("/quiz");
            }} className="text-gray-400 hover:text-white transition text-xl">←</button>
            <div className="text-2xl">{category.emoji}</div>
            <div>
              <div className="font-bold text-sm">{category.title}</div>
              <div className="text-xs text-gray-400">
                Niv. {currentLevel.level} {currentLevel.emoji}
              </div>
            </div>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-3 py-1 text-center">
            <div className="text-sm font-bold text-yellow-400">{localCoins} 🪙</div>
          </div>
        </div>

        {/* Vies + streak */}
        <div className="flex justify-between items-center mb-4">
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
          {timeLeft >= 10 && !showResult && (
            <span className="text-xs text-yellow-400 font-bold">⚡+10</span>
          )}
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div key={`${current}-${showResult}`}
            initial={{ opacity: 0, x: showResult ? 0 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 font-semibold">
                {category.title}
              </p>
              <h2 className="text-xl font-bold leading-snug">{question.question}</h2>
            </div>

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
                      ❌ {selectedAnswer === null ? "Temps écoulé !" : "Mauvaise réponse ! Réessaie 🔄"}
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
