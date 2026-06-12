// src/components/AuthModal.jsx
// Formulaire Register / Login — connecté à /api/auth/register et /api/auth/login
// Utilise useAuth.js — JWT stocké dans localStorage

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

export default function AuthModal({ onClose }) {
  const [mode, setMode]         = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const { login, register, loading, error } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    let result;

    if (mode === "login") {
      result = await login(username, password);
    } else {
      result = await register(username, email, password);
    }

    if (result.success) onClose();
  }

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.92, y: 24 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
      >
        <div
          onClick={e => e.stopPropagation()}
          className="pointer-events-auto w-full max-w-sm bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-2xl"
        >

          {/* ── En-tête ── */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {mode === "login" ? "👋 Connexion" : "🚀 Inscription"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition text-xl leading-none"
            >
              ✕
            </button>
          </div>

          {/* ── Tabs mode ── */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            {["login", "register"].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                  mode === m
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {m === "login" ? "Se connecter" : "S'inscrire"}
              </button>
            ))}
          </div>

          {/* ── Formulaire ── */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username */}
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">
                Pseudo
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="ex: Elhadji17"
                required
                minLength={3}
                maxLength={20}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition"
              />
            </div>

            {/* Email (register uniquement) */}
            <AnimatePresence>
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{    opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ton@email.com"
                    required={mode === "register"}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="minimum 6 caractères"
                  required
                  minLength={6}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition text-sm"
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Erreur */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{    opacity: 0, y: -8 }}
                  className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 text-red-300 text-sm"
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bouton submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className={`w-full py-3 rounded-xl font-bold text-white transition ${
                loading
                  ? "bg-blue-800 opacity-60 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 active:scale-95"
              }`}
            >
              {loading
                ? "⏳ Chargement..."
                : mode === "login"
                  ? "Se connecter"
                  : "Créer mon compte"
              }
            </motion.button>

          </form>

          {/* ── Footer ── */}
          <p className="text-center text-xs text-gray-500 mt-5">
            {mode === "login" ? "Pas encore de compte ?" : "Déjà inscrit ?"}
            {" "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-blue-400 hover:text-blue-300 font-semibold transition"
            >
              {mode === "login" ? "S'inscrire" : "Se connecter"}
            </button>
          </p>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
