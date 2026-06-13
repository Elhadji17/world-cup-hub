// src/pages/Admin.jsx
// Page admin — entrer les vrais résultats des matchs
// Protégée par ADMIN_SECRET (jamais exposé dans le code)

import { useState } from "react";
import { motion } from "framer-motion";
import { MATCHES, FLAGS } from "../data/matches";

const API = import.meta.env.VITE_API_URL ?? "";

export default function Admin() {
  const [secret,    setSecret]    = useState("");
  const [matchId,   setMatchId]   = useState("");
  const [realScoreA, setRealScoreA] = useState("");
  const [realScoreB, setRealScoreB] = useState("");
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const selectedMatch = MATCHES.find(m => m.id === +matchId);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res  = await fetch(`${API}/api/admin/results`, {
        method:  "POST",
        headers: {
          "Content-Type":   "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({
          matchId:    +matchId,
          realScoreA: +realScoreA,
          realScoreB: +realScoreB,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur.");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white pb-16">

      {/* Header */}
      <div className="bg-black/60 border-b border-white/10 px-4 py-4">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold">⚙️ Admin — Résultats</h1>
          <p className="text-xs text-gray-400 mt-1">
            Entrer les vrais scores pour calculer les points des joueurs
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-8">

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Secret admin */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">
              🔑 Clé admin
            </label>
            <input
              type="password"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              placeholder="ADMIN_SECRET"
              required
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
            />
          </div>

          {/* Sélection du match */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">
              ⚽ Match
            </label>
            <select
              value={matchId}
              onChange={e => setMatchId(e.target.value)}
              required
              className="w-full bg-gray-800 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition"
            >
              <option value="">-- Choisir un match --</option>
              {MATCHES.map(m => (
                <option key={m.id} value={m.id}>
                  #{m.id} · Gr.{m.group} · {m.teamA} vs {m.teamB} · {m.date}
                </option>
              ))}
            </select>
          </div>

          {/* Aperçu du match sélectionné */}
          {selectedMatch && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="text-center">
                <div className="text-3xl">{FLAGS[selectedMatch.teamA] ?? "🏳️"}</div>
                <div className="text-sm font-bold mt-1">{selectedMatch.teamA}</div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number" min="0" max="20"
                  value={realScoreA}
                  onChange={e => setRealScoreA(e.target.value)}
                  placeholder="0" required
                  className="w-14 h-14 text-center text-2xl font-bold bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition"
                />
                <span className="text-white/40 text-xl">–</span>
                <input
                  type="number" min="0" max="20"
                  value={realScoreB}
                  onChange={e => setRealScoreB(e.target.value)}
                  placeholder="0" required
                  className="w-14 h-14 text-center text-2xl font-bold bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:border-yellow-400 transition"
                />
              </div>
              <div className="text-center">
                <div className="text-3xl">{FLAGS[selectedMatch.teamB] ?? "🏳️"}</div>
                <div className="text-sm font-bold mt-1">{selectedMatch.teamB}</div>
              </div>
            </motion.div>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 text-red-300 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Succès */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/20 border border-green-500/40 rounded-xl px-4 py-3 text-green-300 text-sm"
            >
              ✅ {result.message}<br />
              📊 {result.updated} pronostic(s) mis à jour · Score réel : {result.result}
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading || !matchId || !secret}
            whileTap={{ scale: 0.97 }}
            className={`w-full py-3 rounded-xl font-bold text-white transition ${
              loading || !matchId || !secret
                ? "bg-white/10 cursor-not-allowed opacity-50"
                : "bg-yellow-500 hover:bg-yellow-400 text-black"
            }`}
          >
            {loading ? "⏳ Calcul en cours..." : "Valider le résultat"}
          </motion.button>

        </form>

        <p className="text-center text-xs text-gray-600 mt-8">
          Cette page n'est pas référencée dans la navbar — accès via /admin uniquement.
        </p>
      </div>
    </div>
  );
}
