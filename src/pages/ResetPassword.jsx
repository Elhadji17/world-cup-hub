// src/pages/ResetPassword.jsx
// Page de réinitialisation du mot de passe — accessible via /reset-password?token=xxx

import { useState, useEffect } from "react";
import { useNavigate }         from "react-router-dom";
import { motion }              from "framer-motion";

const API = import.meta.env.VITE_API_URL ?? "";
const TOKEN_KEY = "wch_token";
const USER_KEY  = "wch_user";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [token,       setToken]       = useState("");
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [success,     setSuccess]     = useState(false);

  // Récupérer le token depuis l'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
    else setError("Lien invalide — aucun token trouvé.");
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res  = await fetch(`${API}/api/auth/reset-password`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur.");

      // Connecter automatiquement
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY,  JSON.stringify(data.user));
      localStorage.setItem("playerName", data.user.username);

      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-blue-900 text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-2xl"
      >
        {/* En-tête */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">⚽</div>
          <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>
          <p className="text-sm text-gray-400 mt-1">World Cup Hub 2026</p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="text-5xl mb-4">✅</div>
            <p className="text-green-400 font-bold text-lg">Mot de passe mis à jour !</p>
            <p className="text-gray-400 text-sm mt-2">Redirection en cours...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nouveau mot de passe */}
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">
                Nouveau mot de passe
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

            {/* Confirmer */}
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">
                Confirmer le mot de passe
              </label>
              <input
                type={showPass ? "text" : "password"}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="répète le mot de passe"
                required minLength={6}
                className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition ${
                  confirm && password !== confirm
                    ? "border-red-500/60 focus:border-red-400"
                    : "border-white/20 focus:border-blue-400"
                }`}
              />
              {confirm && password !== confirm && (
                <p className="text-red-400 text-xs mt-1">Les mots de passe ne correspondent pas</p>
              )}
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
              disabled={loading || !token || password !== confirm}
              whileTap={{ scale: 0.97 }}
              className={`w-full py-3 rounded-xl font-bold text-white transition ${
                loading || !token || password !== confirm
                  ? "bg-blue-800 opacity-50 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {loading ? "⏳ Mise à jour..." : "Confirmer le nouveau mot de passe"}
            </motion.button>

          </form>
        )}

        <p className="text-center text-xs text-gray-600 mt-5">
          <a href="/" className="text-blue-400 hover:text-blue-300">← Retour à l'accueil</a>
        </p>
      </motion.div>
    </div>
  );
}
