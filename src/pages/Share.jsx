// src/pages/Share.jsx
// Carte de partage personnalisée — pronostics + stats du joueur

import { useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { MATCHES, FLAGS } from "../data/matches";
import { getMedal, agreesWithAI } from "../utils/scoring";
import { AI_PREDICTIONS } from "../data/aiPredictions";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "wch_predictions";

function loadPredictions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

function getOutcome(a, b) {
  if (a > b) return "V";
  if (b > a) return "D";
  return "N";
}

export default function Share() {
  const { user }       = useAuth();
  const cardRef        = useRef(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const playerName  = user?.username ?? localStorage.getItem("playerName") ?? "Joueur";
  const predictions = loadPredictions();
  const savedCount  = Object.keys(predictions).length;
  const medal       = getMedal((user?.totalPoints ?? 0));

  // Stats du joueur
  const stats = useMemo(() => {
    const preds = Object.entries(predictions);
    const withAI = preds.filter(([id, pred]) => {
      const ai = AI_PREDICTIONS[+id];
      if (!ai) return false;
      return agreesWithAI(pred, { scoreA: ai.scoreA, scoreB: ai.scoreB });
    }).length;

    // Groupes couverts
    const groupsCovered = [...new Set(
      preds.map(([id]) => MATCHES.find(m => m.id === +id)?.group).filter(Boolean)
    )];

    return { withAI, againstAI: preds.length - withAI, groupsCovered };
  }, [predictions]);

  // 6 derniers pronostics pour la carte
  const recentPreds = useMemo(() => {
    return Object.entries(predictions)
      .slice(-6)
      .map(([id, pred]) => {
        const match = MATCHES.find(m => m.id === +id);
        if (!match) return null;
        return { match, pred };
      })
      .filter(Boolean);
  }, [predictions]);

  // Partage WhatsApp
  function shareWhatsApp() {
    const lines = recentPreds.map(({ match, pred }) =>
      `${FLAGS[match.teamA] ?? ""} ${match.teamA} ${pred.scoreA}–${pred.scoreB} ${match.teamB} ${FLAGS[match.teamB] ?? ""}`
    ).join("\n");

    const text =
      `⚽ Mes pronostics World Cup 2026 — ${playerName} ${medal.emoji}\n\n` +
      `${lines}\n\n` +
      `${savedCount} matchs pronostiqués · ${stats.withAI} accords avec l'IA\n` +
      `🔥 Rejoins-moi sur World Cup Hub !\n` +
      `https://worldcuphub2026.vercel.app`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  // Partage Twitter/X
  function shareTwitter() {
    const text =
      `⚽ Je pronostique la Coupe du Monde 2026 sur @WorldCupHub !\n` +
      `${savedCount} matchs pronostiqués ${medal.emoji}\n` +
      `worldcuphub2026.vercel.app`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  }

  // Copier le lien
  function copyLink() {
    navigator.clipboard.writeText("https://worldcuphub2026.vercel.app");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-black to-blue-900 text-white pb-16">

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold">📲 Partager</h1>
          <p className="text-xs text-gray-400 mt-0.5">Ta carte de pronostics personnalisée</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-6">

        {/* ── CARTE DE PARTAGE ── */}
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-green-800 via-black to-blue-900 rounded-3xl p-6 border border-white/10 shadow-2xl mb-6"
        >
          {/* Logo + titre */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs text-green-400 font-bold uppercase tracking-widest">World Cup Hub</div>
              <div className="text-xl font-bold text-white">Mes Pronostics 2026</div>
            </div>
            <div className="text-4xl">⚽</div>
          </div>

          {/* Profil joueur */}
          <div className="flex items-center gap-4 bg-white/10 rounded-2xl px-4 py-3 mb-5">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {playerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-white text-lg">{playerName}</div>
              <div className="text-xs text-gray-300">{medal.emoji} {medal.label}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-2xl font-bold text-yellow-400">{savedCount}</div>
              <div className="text-xs text-gray-400">pronostics</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-green-400">{stats.withAI}</div>
              <div className="text-xs text-gray-400">Avec l'IA</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-orange-400">{stats.againstAI}</div>
              <div className="text-xs text-gray-400">Défi IA</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-blue-400">{stats.groupsCovered.length}</div>
              <div className="text-xs text-gray-400">Groupes</div>
            </div>
          </div>

          {/* Derniers pronostics */}
          {recentPreds.length > 0 ? (
            <div className="space-y-2 mb-4">
              <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">
                Mes derniers pronostics
              </div>
              {recentPreds.map(({ match, pred }) => {
                const outcome = getOutcome(pred.scoreA, pred.scoreB);
                return (
                  <div
                    key={match.id}
                    className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span>{FLAGS[match.teamA] ?? "🏳️"}</span>
                      <span className="truncate text-xs text-gray-300">{match.teamA}</span>
                    </div>
                    <div className="mx-2 font-bold text-white text-center">
                      {pred.scoreA} – {pred.scoreB}
                      {pred.isJoker && <span className="ml-1 text-yellow-400 text-xs">⭐</span>}
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className="truncate text-xs text-gray-300 text-right">{match.teamB}</span>
                      <span>{FLAGS[match.teamB] ?? "🏳️"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm py-4">
              Aucun pronostic encore — commence sur /predictions !
            </div>
          )}

          {/* Footer carte */}
          <div className="text-center text-xs text-gray-500 mt-2">
            world-cup-hub-kappa.vercel.app
          </div>
        </motion.div>

        {/* ── BOUTONS DE PARTAGE ── */}
        <div className="space-y-3">

          {/* WhatsApp */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={shareWhatsApp}
            className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-green-500/20"
          >
            <span className="text-2xl">📲</span>
            Partager sur WhatsApp
          </motion.button>

          {/* Twitter/X */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={shareTwitter}
            className="w-full flex items-center justify-center gap-3 bg-black hover:bg-gray-900 text-white font-bold py-4 rounded-2xl border border-white/20 transition"
          >
            <span className="text-2xl">𝕏</span>
            Partager sur X / Twitter
          </motion.button>

          {/* Générer sa carte FIFA */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/share-card")}
            className="w-full flex items-center justify-center gap-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-2xl transition"
          >
            <span className="text-2xl">🃏</span>
            Générer ma carte de fan FIFA
          </motion.button>

          {/* Copier le lien */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={copyLink}
            className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition"
          >
            <span className="text-xl">{copied ? "✅" : "🔗"}</span>
            {copied ? "Lien copié !" : "Copier le lien"}
          </motion.button>

        </div>

        {/* Note */}
        <p className="text-center text-xs text-gray-600 mt-6">
          Invite tes amis à rejoindre le classement ⚽
        </p>

      </div>
    </div>
  );
}
