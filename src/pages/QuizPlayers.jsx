// src/pages/QuizPlayers.jsx
// Mode Devine le joueur — silhouette → révélation progressive

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate }             from "react-router-dom";
import { useAuth }                 from "../hooks/useAuth";

const MAX_LIVES  = 3;
const TIMER_MAX  = 30;

// Questions sans images — on joue sur le flou textuel et les indices visuels
const PLAYERS = [
  {
    id: "pl001",
    emoji: "🇦🇷",
    silhouette: "⬛⬛⬛\n⬛🟡⬛\n⬛⬛⬛",
    answer: "Lionel Messi",
    options: ["Cristiano Ronaldo", "Lionel Messi", "Neymar Jr", "Kylian Mbappé"],
    hints: ["8 Ballons d'Or 🏆", "Argentine 🇦🇷", "Inter Miami 🇺🇸"],
    number: "10",
    color: "from-blue-700 to-white",
  },
  {
    id: "pl002",
    emoji: "🇵🇹",
    answer: "Cristiano Ronaldo",
    options: ["Lionel Messi", "Cristiano Ronaldo", "Karim Benzema", "Zlatan Ibrahimović"],
    hints: ["5 Ballons d'Or 🏆", "Portugal 🇵🇹", "Al-Nassr 🇸🇦"],
    number: "7",
    color: "from-red-600 to-green-700",
  },
  {
    id: "pl003",
    emoji: "🇫🇷",
    answer: "Kylian Mbappé",
    options: ["Kylian Mbappé", "Vinicius Jr", "Erling Haaland", "Pedri"],
    hints: ["Soulier d'Or WC 2022 👟", "France 🇫🇷", "Real Madrid 🏆"],
    number: "10",
    color: "from-blue-800 to-red-600",
  },
  {
    id: "pl004",
    emoji: "🇸🇳",
    answer: "Sadio Mané",
    options: ["Mohamed Salah", "Sadio Mané", "Riyad Mahrez", "Achraf Hakimi"],
    hints: ["Ballon d'Or Africain 2022 🌍", "Sénégal 🇸🇳", "Al-Nassr 🇸🇦"],
    number: "10",
    color: "from-green-700 to-yellow-500",
  },
  {
    id: "pl005",
    emoji: "🇧🇷",
    answer: "Neymar Jr",
    options: ["Neymar Jr", "Vinicius Jr", "Rodrygo", "Gabriel Jesus"],
    hints: ["Transfert record 222M€ 💰", "Brésil 🇧🇷", "Al-Hilal 🇸🇦"],
    number: "10",
    color: "from-yellow-500 to-green-700",
  },
  {
    id: "pl006",
    emoji: "🇳🇴",
    answer: "Erling Haaland",
    options: ["Erling Haaland", "Robert Lewandowski", "Harry Kane", "Victor Osimhen"],
    hints: ["36 buts en PL 2022-23 🎯", "Norvège 🇳🇴", "Manchester City 🔵"],
    number: "9",
    color: "from-sky-500 to-white",
  },
  {
    id: "pl007",
    emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    answer: "Harry Kane",
    options: ["Harry Kane", "Marcus Rashford", "Bukayo Saka", "Phil Foden"],
    hints: ["Recordman buts Angleterre ⚽", "Angleterre 🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Bayern Munich 🔴"],
    number: "9",
    color: "from-red-700 to-white",
  },
  {
    id: "pl008",
    emoji: "🇧🇷",
    answer: "Vinicius Jr",
    options: ["Rodrygo", "Vinicius Jr", "Endrick", "Gabriel Martinelli"],
    hints: ["Ballon d'Or 2024 🏆", "Brésil 🇧🇷", "Real Madrid 🤍"],
    number: "7",
    color: "from-yellow-400 to-green-600",
  },
  {
    id: "pl009",
    emoji: "🇭🇷",
    answer: "Luka Modrić",
    options: ["Luka Modrić", "Ivan Rakitić", "Mateo Kovačić", "Marcelo Brozović"],
    hints: ["Ballon d'Or 2018 🏆", "Croatie 🇭🇷", "Real Madrid 🤍"],
    number: "10",
    color: "from-red-600 to-white",
  },
  {
    id: "pl010",
    emoji: "🇧🇪",
    answer: "Kevin De Bruyne",
    options: ["Kevin De Bruyne", "Eden Hazard", "Romelu Lukaku", "Axel Witsel"],
    hints: ["Meilleur passeur PL 🎯", "Belgique 🇧🇪", "Manchester City 🔵"],
    number: "17",
    color: "from-red-700 to-yellow-400",
  },
  {
    id: "pl011",
    emoji: "🇫🇷",
    answer: "Antoine Griezmann",
    options: ["Antoine Griezmann", "Ousmane Dembélé", "Olivier Giroud", "Kingsley Coman"],
    hints: ["Soulier d'Or Euro 2016 👟", "France 🇫🇷", "Atlético Madrid 🔴"],
    number: "7",
    color: "from-red-600 to-white",
  },
  {
    id: "pl012",
    emoji: "🇪🇬",
    answer: "Mohamed Salah",
    options: ["Mohamed Salah", "Sadio Mané", "Riyad Mahrez", "Hakim Ziyech"],
    hints: ["Pharaon de Liverpool 🔴", "Égypte 🇪🇬", "Liverpool 🔴"],
    number: "11",
    color: "from-red-700 to-white",
  },
  {
    id: "pl013",
    emoji: "🇵🇱",
    answer: "Robert Lewandowski",
    options: ["Robert Lewandowski", "Karim Benzema", "Romelu Lukaku", "Edin Džeko"],
    hints: ["41 buts Bundesliga 2020-21 🎯", "Pologne 🇵🇱", "FC Barcelona 🔵🔴"],
    number: "9",
    color: "from-red-600 to-white",
  },
  {
    id: "pl014",
    emoji: "🇸🇳",
    answer: "Kalidou Koulibaly",
    options: ["Kalidou Koulibaly", "Virgil van Dijk", "Marquinhos", "Rúben Dias"],
    hints: ["Ancien capitaine Sénégal 🦁", "Sénégal 🇸🇳", "Al-Hilal 🇸🇦"],
    number: "3",
    color: "from-green-700 to-yellow-500",
  },
  {
    id: "pl015",
    emoji: "🇪🇸",
    answer: "Pedri",
    options: ["Pedri", "Gavi", "Ferran Torres", "Ansu Fati"],
    hints: ["Trophée Kopa 2021 🏆", "Espagne 🇪🇸", "FC Barcelona 🔵🔴"],
    number: "8",
    color: "from-red-700 to-yellow-400",
  },
];

// Niveaux de révélation : ce qu'on montre à chaque étape
const REVEAL_STEPS = [
  { label: "Numéro de maillot", key: "number" },
  { label: "Couleurs du pays",  key: "color"  },
  { label: "Emoji drapeau",     key: "emoji"  },
];

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

export default function QuizPlayers() {
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const playerName = user?.username ?? localStorage.getItem("playerName") ?? "Joueur";

  const [questions]        = useState(() => shuffle(PLAYERS));
  const [current,            setCurrent]            = useState(0);
  const [score,              setScore]              = useState(0);
  const [lives,              setLives]              = useState(MAX_LIVES);
  const [timeLeft,           setTimeLeft]           = useState(TIMER_MAX);
  const [revealStep,         setRevealStep]         = useState(0);
  const [selectedAnswer,     setSelectedAnswer]     = useState(null);
  const [showResult,         setShowResult]         = useState(false);
  const [isCorrect,          setIsCorrect]          = useState(false);
  const [finished,           setFinished]           = useState(false);
  const [ending,             setEnding]             = useState(false);
  const [streak,             setStreak]             = useState(0);

  const question = questions[current];
  const totalQ   = questions.length;

  // Timer + révélation progressive toutes les 10s
  useEffect(() => {
    if (finished || showResult) return;
    if (timeLeft === 0) { handleTimeout(); return; }

    const newStep = Math.min(Math.floor((TIMER_MAX - timeLeft) / 10), REVEAL_STEPS.length);
    if (newStep > revealStep) setRevealStep(newStep);

    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, showResult, finished]);

  function handleAnswer(option) {
    if (showResult) return;
    const correct = option === question.answer;
    setSelectedAnswer(option);
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) { setScore(p => p + 1); setStreak(p => p + 1); }
    else {
      const nl = lives - 1;
      setLives(nl); setStreak(0);
      if (nl <= 0) { setTimeout(() => finishQuiz(score), 2000); return; }
    }
    setTimeout(() => goNext(correct), 2000);
  }

  function handleTimeout() {
    if (showResult) return;
    setSelectedAnswer(null); setIsCorrect(false); setShowResult(true); setStreak(0);
    const nl = lives - 1; setLives(nl);
    if (nl <= 0) { setTimeout(() => finishQuiz(score), 2000); return; }
    setTimeout(() => goNext(false), 2000);
  }

  function goNext(wasCorrect) {
    const next = current + 1;
    if (next < totalQ) {
      setCurrent(next); setTimeLeft(TIMER_MAX); setRevealStep(0);
      setShowResult(false); setSelectedAnswer(null);
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
          <button onClick={() => navigate("/quiz")} className="text-gray-400 hover:text-white">← Retour</button>
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
            {streak >= 3 && <span className="bg-orange-500/30 text-orange-300 px-2 py-1 rounded-lg font-bold">🔥 {streak}</span>}
            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-lg font-bold">🎯 {score} pts</span>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full bg-white/10 rounded-full h-1.5 mb-4">
          <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}
            className="bg-purple-500 h-1.5 rounded-full" />
        </div>

        {/* Timer */}
        <div className="flex items-center gap-3 mb-5">
          <span className={`text-lg font-bold ${timeLeft <= 8 ? "text-red-400 animate-pulse" : "text-yellow-400"}`}>
            ⏱️ {timeLeft}s
          </span>
          <div className="flex-1 bg-white/10 rounded-full h-2">
            <motion.div animate={{ width: `${(timeLeft / TIMER_MAX) * 100}%` }}
              transition={{ duration: 0.5 }} className={`h-2 rounded-full ${timerColor}`} />
          </div>
        </div>

        {/* Carte joueur — révélation progressive */}
        <AnimatePresence mode="wait">
          <motion.div key={current}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative rounded-2xl p-8 mb-5 border border-white/10 bg-gradient-to-br ${question.color} bg-opacity-20 overflow-hidden`}
            style={{ minHeight: "200px" }}
          >
            {/* Silhouette du joueur */}
            <div className="text-center">
              <motion.div
                animate={{ opacity: 1 }}
                className="text-8xl mb-4 select-none"
                style={{ filter: showResult ? "none" : revealStep < 2 ? "blur(0px)" : "none" }}
              >
                {/* Toujours montrer la silhouette, révéler le drapeau après 20s */}
                {revealStep >= 2 ? question.emoji : "🕵️"}
              </motion.div>

              {/* Numéro de maillot — révélé après 10s */}
              <AnimatePresence>
                {(revealStep >= 1 || showResult) && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="inline-block bg-black/40 rounded-xl px-6 py-3 mb-2"
                  >
                    <span className="text-5xl font-black text-white">#{question.number}</span>
                    <p className="text-xs text-gray-300 mt-1">Numéro de maillot</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Révélation finale */}
              {showResult && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  className={`mt-3 px-6 py-3 rounded-xl font-bold text-xl ${
                    isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  }`}
                >
                  {isCorrect ? `✅ ${question.answer} !` : `❌ C'était ${question.answer}`}
                </motion.div>
              )}
            </div>

            {/* Indicateur de révélation */}
            {!showResult && (
              <div className="absolute top-3 right-3 text-xs text-white/60">
                {revealStep < REVEAL_STEPS.length
                  ? `🔓 Révélation dans ${10 - (TIMER_MAX - timeLeft) % 10}s`
                  : "🔓 Tout révélé"
                }
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Indices */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">
            💡 Indices révélés ({revealStep}/{REVEAL_STEPS.length})
          </p>
          <div className="space-y-2">
            {question.hints.map((hint, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: revealStep > i || showResult ? 1 : 0.2, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition ${
                  revealStep > i || showResult
                    ? "bg-purple-500/20 border border-purple-400/30 text-white"
                    : "bg-white/5 border border-white/10 text-gray-600"
                }`}
              >
                <span>{revealStep > i || showResult ? "✅" : "🔒"}</span>
                <span>{revealStep > i || showResult ? hint : `Indice ${i + 1}...`}</span>
              </motion.div>
            ))}
          </div>
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

      </div>
    </div>
  );
}
