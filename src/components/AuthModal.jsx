// src/components/AuthModal.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

const API = import.meta.env.VITE_API_URL ?? "";

export default function AuthModal({ onClose }) {
  const [mode,       setMode]       = useState("login");
  const [username,   setUsername]   = useState("");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [showPass,   setShowPass]   = useState(false);

  // État pour "mot de passe oublié"
  const [forgotMode,    setForgotMode]    = useState(false);
  const [forgotEmail,   setForgotEmail]   = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent,    setForgotSent]    = useState(false);
  const [forgotError,   setForgotError]   = useState(null);

  const { login, register, loading, error } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    const result = mode === "login"
      ? await login(username, password)
      : await register(username, email, password);
    if (result.success) onClose();
  }

  async function handleForgot(e) {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError(null);
    try {
      const res  = await fetch(`${API}/api/auth/forgot-password`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur.");
      setForgotSent(true);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  }

  // ── Mode Mot de passe oublié ────────────────────────────────────────────
  if (forgotMode) {
    return (
      <>
        <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />

        <motion.div key="modal" initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <div onClick={e => e.stopPropagation()}
            className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-2xl">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">🔑 Mot de passe oublié</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>

            {forgotSent ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">📧</div>
                <p className="text-green-400 font-bold mb-2">Email envoyé !</p>
                <p className="text-gray-400 text-sm">
                  Vérifie ta boîte mail et clique sur le lien de réinitialisation.
                  Le lien est valable 1 heure.
                </p>
                <button onClick={() => { setForgotMode(false); setForgotSent(false); }}
                  className="mt-6 text-blue-400 hover:text-blue-300 text-sm font-semibold">
                  ← Retour à la connexion
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                <p className="text-gray-400 text-sm">
                  Entre ton email et on t'envoie un lien pour réinitialiser ton mot de passe.
                </p>

                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    type="email" value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="ton@email.com" required
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition"
                  />
                </div>

                {forgotError && (
                  <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 text-red-300 text-sm">
                    ⚠️ {forgotError}
                  </div>
                )}

                <motion.button type="submit" disabled={forgotLoading} whileTap={{ scale: 0.97 }}
                  className={`w-full py-3 rounded-xl font-bold text-white transition ${
                    forgotLoading ? "bg-blue-800 opacity-60 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
                  }`}
                >
                  {forgotLoading ? "⏳ Envoi en cours..." : "Envoyer le lien"}
                </motion.button>

                <button type="button" onClick={() => setForgotMode(false)}
                  className="w-full text-center text-xs text-gray-500 hover:text-gray-300 transition">
                  ← Retour à la connexion
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </>
    );
  }

  // ── Mode Login / Register ───────────────────────────────────────────────
  return (
    <>
      <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />

      <motion.div key="modal" initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
      >
        <div onClick={e => e.stopPropagation()}
          className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-2xl">

          {/* En-tête */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {mode === "login" ? "👋 Connexion" : "🚀 Inscription"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition text-xl">✕</button>
          </div>

          {/* Tabs */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            {[
              { id: "login",    label: "Se connecter" },
              { id: "register", label: "S'inscrire"   },
            ].map(({ id, label }) => (
              <button key={id} onClick={() => setMode(id)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                  mode === id ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">Pseudo</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="ex: Elhadji17" required minLength={3} maxLength={20}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition"
              />
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="ton@email.com" required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">Mot de passe</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="minimum 6 caractères" required minLength={6}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 transition"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm">
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Mot de passe oublié — seulement en mode login */}
            {mode === "login" && (
              <div className="text-right">
                <button type="button" onClick={() => setForgotMode(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition">
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 text-red-300 text-sm">
                ⚠️ {error}
              </div>
            )}

            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
              className={`w-full py-3 rounded-xl font-bold text-white transition ${
                loading ? "bg-blue-800 opacity-60 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {loading ? "⏳ Chargement..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
            </motion.button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-5">
            {mode === "login" ? "Pas encore de compte ?" : "Déjà inscrit ?"}
            {" "}
            <button onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-blue-400 hover:text-blue-300 font-semibold transition">
              {mode === "login" ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </motion.div>
    </>
  );
}
