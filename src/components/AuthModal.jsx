// src/components/AuthModal.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

export default function AuthModal({ onClose }) {
  const [mode,     setMode]     = useState("login");
  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const { login, register, loading, error } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    const result = mode === "login"
      ? await login(username, password)
      : await register(username, email, password);
    if (result.success) onClose();
  }

  return (
    <>
      {/* Overlay */}
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
      >
        <div
          onClick={e => e.stopPropagation()}
          className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          {/* En-tête */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {mode === "login" ? "👋 Connexion" : "🚀 Inscription"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition text-xl"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            {[
              { id: "login",    label: "Se connecter" },
              { id: "register", label: "S'inscrire"   },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                  mode === id
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Pseudo */}
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">
                Pseudo
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="ex: Elhadji17"
                required minLength={3} maxLength={20}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition"
              />
            </div>

            {/* Email — register seulement */}
            {mode === "register" && (
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ton@email.com"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition"
                />
              </div>
            )}

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
                  required minLength={6}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm"
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 text-red-300 text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className={`w-full py-3 rounded-xl font-bold text-white transition ${
                loading
                  ? "bg-blue-800 opacity-60 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {loading
                ? "⏳ Chargement..."
                : mode === "login" ? "Se connecter" : "Créer mon compte"
              }
            </motion.button>
          </form>

          {/* Footer */}
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
    </>
  );
}
