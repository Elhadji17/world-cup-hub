// src/pages/Home.jsx — Mobile-first, design moderne


import { Link }                  from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth }               from "../hooks/useAuth";
import { useGameStats }          from "../hooks/useGameStats.jsx";
import AuthModal                 from "../components/AuthModal";
import { useState, useEffect } from "react";

const FEATURES = [
  {
    to:      "/quiz",
    emoji:   "🧠",
    title:   "Quiz Football",
    desc:    "7 catégories · 125 questions · Devine le joueur",
    color:   "from-green-500 to-emerald-700",
    border:  "border-green-400/30",
    btn:     "Jouer maintenant",
    btnCls:  "bg-green-500 hover:bg-green-400",
    auth:    false,
  },
  {
    to:      "/predictions",
    emoji:   "🔮",
    title:   "Pronostics",
    desc:    "Prédit les scores · Joker ×2 · Classement multijoueur",
    color:   "from-blue-500 to-indigo-700",
    border:  "border-blue-400/30",
    btn:     "Prédire",
    btnCls:  "bg-blue-500 hover:bg-blue-400",
    auth:    true,
  },
  {
    to:      "/matches",
    emoji:   "📅",
    title:   "Match Center",
    desc:    "Scores en direct · Heures locales · IA vs Réalité",
    color:   "from-red-500 to-orange-700",
    border:  "border-red-400/30",
    btn:     "Voir les matchs",
    btnCls:  "bg-red-500 hover:bg-red-400",
    auth:    false,
  },
  {
    to:      "/leaderboard",
    emoji:   "🏆",
    title:   "Classement",
    desc:    "Top joueurs · Points pronostics · Quiz mondial",
    color:   "from-yellow-500 to-amber-700",
    border:  "border-yellow-400/30",
    btn:     "Voir le classement",
    btnCls:  "bg-yellow-500 hover:bg-yellow-400 text-black",
    auth:    false,
  },
{
  to:     "/share-card",
  emoji:  "🃏",
  title:  "Ma Carte de Fan",
  desc:   "Génère ta carte avec ton pronostic Sénégal et partage sur WhatsApp",
  color:  "from-green-600 to-emerald-800",
  border: "border-green-400/30",
  btn:    "Générer ma carte",
  btnCls: "bg-green-500 hover:bg-green-400",
  auth:   false,
},
{
  to:     "/shop",
  emoji:  "🛒",
  title:  "Shop",
  desc:   "Achète des coins pour continuer ta progression sur le quiz",
  color:  "from-green-500 to-teal-700",
  border: "border-green-400/30",
  btn:    "Shop",
  btnCls: "bg-green-500 hover:bg-green-400",
  auth:   false,
},
{
  to:     "/cards",
  emoji:  "🃏",
  title:  "Cartes Joueurs",
  desc:   "Ouvre des packs · Collecte des stars · Légendaires rares",
  color:  "from-purple-600 to-pink-700",
  border: "border-purple-400/30",
  btn:    "Ouvrir des packs",
  btnCls: "bg-purple-500 hover:bg-purple-400",
  auth:   false,
},
];

const STATS = [
  { value: "72",  label: "Matchs WC 2026" },
  { value: "125", label: "Questions Quiz" },
  { value: "15",  label: "Joueurs à deviner" },
  { value: "48",  label: "Équipes nationales" },
];

export default function Home() {
  const { user, logout } = useAuth();
  const { coins, lives, totalPoints } = useGameStats();
  const [showAuth, setShowAuth] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }
    function handler(e) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const isIOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

  async function handleInstallClick() {
    if (isIOS) {
      alert("Pour installer : appuie sur Partager ⬆️ en bas de Safari, puis \"Sur l'écran d'accueil\"");
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstalled(true);
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Fond animé */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-black to-blue-900/40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative px-4 pt-12 pb-10 max-w-2xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6"
          >
            🔴 EN DIRECT · Coupe du Monde 2026
          </motion.div>

          {/* Titre */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-4"
          >
            Vis la Coupe du<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
              Monde 2026
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-base md:text-lg mb-8 leading-relaxed"
          >
            Quiz · Pronostics · Scores en direct · Classement mondial
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            {user ? (
              <>
                <Link to="/quiz">
                  <motion.button whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-2xl text-lg transition shadow-lg shadow-green-500/20">
                    🧠 Jouer au Quiz
                  </motion.button>
                </Link>
                <Link to="/predictions">
                  <motion.button whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-2xl text-lg transition border border-white/10">
                    🔮 Mes Pronostics
                  </motion.button>
                </Link>
              </>
            ) : (
              <>
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => setShowAuth(true)}
                  className="w-full sm:w-auto bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-2xl text-lg transition shadow-lg shadow-green-500/20">
                  🚀 Commencer gratuitement
                </motion.button>
                <Link to="/matches">
                  <motion.button whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-2xl text-lg transition border border-white/10">
                    📅 Voir les matchs
                  </motion.button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Stats joueur connecté */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 flex justify-center gap-4 text-sm"
            >
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
                <div className="text-green-400 font-bold text-lg">{totalPoints}</div>
                <div className="text-gray-400 text-xs">pts quiz</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
                <div className="text-yellow-400 font-bold text-lg">{coins}</div>
                <div className="text-gray-400 text-xs">coins</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
                <div className="text-red-400 font-bold text-lg">{lives}</div>
                <div className="text-gray-400 text-xs">vies</div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── INSTALLER L'APP ──────────────────────────────────────────────── */}
      {!isInstalled && (
        <section className="px-4 pb-6 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600/20 to-green-600/20 border border-blue-400/30 rounded-2xl p-4 flex items-center gap-4"
          >
            <div className="text-3xl shrink-0">📲</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-sm">Installe l'app sur ton téléphone</h3>
              <p className="text-xs text-gray-400">Accès en 1 clic depuis ton écran d'accueil</p>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleInstallClick}
              className="shrink-0 bg-white text-blue-700 font-bold text-xs px-4 py-2.5 rounded-xl">
              Installer
            </motion.button>
          </motion.div>
        </section>
      )}

      {/* ── STATS GLOBALES ────────────────────────────────────────────────── */}
      <section className="px-4 pb-8 max-w-2xl mx-auto">
        <div className="grid grid-cols-4 gap-2">
          {STATS.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center"
            >
              <div className="text-xl md:text-2xl font-black text-white">{value}</div>
              <div className="text-xs text-gray-400 mt-0.5 leading-tight">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section className="px-4 pb-10 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-gray-300 mb-4">Tout ce qu'il te faut ⚡</h2>
        <div className="grid grid-cols-1 gap-3">
          {FEATURES.map(({ to, emoji, title, desc, color, border, btn, btnCls, auth }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i }}
              className={`relative rounded-2xl border ${border} bg-gradient-to-r ${color} bg-opacity-10 overflow-hidden`}
            >
              {/* Fond dégradé subtil */}
              <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-10`} />

              <div className="relative flex items-center gap-4 p-4">
                {/* Emoji */}
                <div className="text-4xl shrink-0">{emoji}</div>

                {/* Texte */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-base">{title}</h3>
                  <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{desc}</p>
                </div>

                {/* Bouton */}
                {auth && !user ? (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAuth(true)}
                    className="shrink-0 bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl transition hover:bg-white/30"
                  >
                    Connexion
                  </motion.button>
                ) : (
                  <Link to={to} className="shrink-0">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className={`${btnCls} text-white text-xs font-bold px-3 py-2 rounded-xl transition`}
                    >
                      {btn}
                    </motion.button>
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── COMPTE À REBOURS ──────────────────────────────────────────────── */}
      <section className="px-4 pb-10 max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 border border-white/10 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h3 className="font-bold text-white text-lg mb-1">Coupe du Monde 2026</h3>
          <p className="text-gray-400 text-sm mb-4">Canada · USA · Mexique</p>
          <div className="flex justify-center gap-4">
            {[
              { v: "11", l: "Juin" },
              { v: "2026", l: "Année" },
              { v: "48", l: "Équipes" },
              { v: "104", l: "Matchs" },
            ].map(({ v, l }) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-black text-green-400">{v}</div>
                <div className="text-xs text-gray-400">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROFIL / CONNEXION ────────────────────────────────────────────── */}
      {user ? (
        <section className="px-4 pb-10 max-w-2xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-xl font-black">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-white">{user.username}</div>
                <div className="text-xs text-gray-400">{totalPoints} pts · {coins} coins · {lives} vies</div>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={logout}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition">
              Déconnexion
            </motion.button>
          </div>
        </section>
      ) : (
        <section className="px-4 pb-10 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-900/40 to-blue-900/40 border border-green-400/20 rounded-2xl p-6 text-center"
          >
            <div className="text-3xl mb-3">🎁</div>
            <h3 className="font-bold text-white text-lg mb-1">100 coins offerts à l'inscription</h3>
            <p className="text-gray-400 text-sm mb-4">Crée ton compte et commence à jouer gratuitement</p>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowAuth(true)}
              className="bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-3 rounded-2xl transition w-full">
              Créer mon compte
            </motion.button>
          </motion.div>
        </section>
      )}

      {/* Footer */}
      <footer className="text-center py-6 text-gray-600 text-xs border-t border-white/5">
        ⚽ World Cup Hub 2026 · Canada · USA · Mexique
      </footer>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </AnimatePresence>
    </div>
  );
}
