// src/pages/Home.jsx — Mobile-first, simplifié autour de Match comme feature phare

import { useState, useEffect }     from "react";
import { Link }                    from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth }                 from "../hooks/useAuth";
import { useGameStats }            from "../hooks/useGameStats.jsx";
import AuthModal                   from "../components/AuthModal";

// Découverte secondaire — grille compacte 2x2
const DISCOVER = [
  { to: "/cards",       emoji: "🃏", title: "Cartes" },
  { to: "/leaderboard",  emoji: "🏆", title: "Classement" },
  { to: "/matches",     emoji: "📅", title: "Matchs" },
  { to: "/share-card",  emoji: "🪪", title: "Ma carte fan" },
];

export default function Home() {
  const { user, logout } = useAuth();
  const { coins, lives, totalPoints } = useGameStats();
  const [showAuth, setShowAuth] = useState(false);

  // Installation PWA — bandeau discret
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

  // Destination intelligente : /team si équipe incomplète (< 5 joueurs), sinon /match
  function getMatchDestination() {
    try {
      const team = JSON.parse(localStorage.getItem("wch_team")) ?? {};
      const filledCount = Object.values(team).filter(Boolean).length;
      return filledCount >= 5 ? "/match" : "/team";
    } catch {
      return "/team";
    }
  }
  const [matchDestination, setMatchDestination] = useState("/team");
  useEffect(() => { setMatchDestination(getMatchDestination()); }, []);

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
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-black to-blue-900/40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative px-4 pt-10 pb-6 max-w-2xl mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-bold px-4 py-1.5 rounded-full mb-5"
          >
            🔴 EN DIRECT · Coupe du Monde 2026
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-3"
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
            className="text-gray-400 text-sm md:text-base mb-6"
          >
            Compose. Joue. Défie tes amis.
          </motion.p>

          {/* Stats joueur connecté */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex justify-center gap-3 text-sm mb-6"
            >
              <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-center">
                <div className="text-green-400 font-bold text-base">{totalPoints}</div>
                <div className="text-gray-400 text-[10px]">pts</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-center">
                <div className="text-yellow-400 font-bold text-base">{coins}</div>
                <div className="text-gray-400 text-[10px]">coins</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-center">
                <div className="text-red-400 font-bold text-base">{lives}</div>
                <div className="text-gray-400 text-[10px]">vies</div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── ACTION PRINCIPALE : MATCH ───────────────────────────────────────── */}
      <section className="px-4 pb-3 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {user ? (
            <Link to={matchDestination}>
              <motion.div whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 to-emerald-700 p-5 flex items-center gap-4 shadow-lg shadow-green-500/20"
              >
                <div className="text-4xl shrink-0">⚽</div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-black text-white text-lg">
                    {matchDestination === "/match" ? "Jouer un match" : "Composer mon équipe"}
                  </h2>
                  <p className="text-xs text-green-100 mt-0.5">
                    {matchDestination === "/match"
                      ? "Tactiques · Mi-temps · Rôles de joueurs"
                      : "5 joueurs minimum pour jouer un match"}
                  </p>
                </div>
                <div className="text-2xl shrink-0 text-white/80">→</div>
              </motion.div>
            </Link>
          ) : (
            <motion.button whileTap={{ scale: 0.98 }}
              onClick={() => setShowAuth(true)}
              className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 to-emerald-700 p-5 flex items-center gap-4 shadow-lg shadow-green-500/20"
            >
              <div className="text-4xl shrink-0">⚽</div>
              <div className="flex-1 min-w-0 text-left">
                <h2 className="font-black text-white text-lg">Commencer gratuitement</h2>
                <p className="text-xs text-green-100 mt-0.5">100 coins offerts · Compose ton équipe · Joue</p>
              </div>
              <div className="text-2xl shrink-0 text-white/80">→</div>
            </motion.button>
          )}
        </motion.div>
      </section>

      {/* ── RACCOURCIS QUIZ / PRONOSTICS ───────────────────────────────────── */}
      <section className="px-4 pb-4 max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-2">
          <Link to="/quiz">
            <motion.div whileTap={{ scale: 0.96 }}
              className="bg-blue-500/15 border border-blue-400/20 rounded-2xl p-3.5 flex flex-col gap-1.5"
            >
              <div className="text-xl">🧠</div>
              <div className="text-sm font-bold text-white">Quiz</div>
            </motion.div>
          </Link>
          {user ? (
            <Link to="/predictions">
              <motion.div whileTap={{ scale: 0.96 }}
                className="bg-amber-500/15 border border-amber-400/20 rounded-2xl p-3.5 flex flex-col gap-1.5"
              >
                <div className="text-xl">🔮</div>
                <div className="text-sm font-bold text-white">Pronostics</div>
              </motion.div>
            </Link>
          ) : (
            <motion.button whileTap={{ scale: 0.96 }}
              onClick={() => setShowAuth(true)}
              className="bg-amber-500/15 border border-amber-400/20 rounded-2xl p-3.5 flex flex-col gap-1.5 text-left"
            >
              <div className="text-xl">🔮</div>
              <div className="text-sm font-bold text-white">Pronostics</div>
            </motion.button>
          )}
        </div>
      </section>

      {/* ── DÉCOUVRIR PLUS ───────────────────────────────────────────────── */}
      <section className="px-4 pb-5 max-w-2xl mx-auto">
        <p className="text-[11px] uppercase tracking-wide text-gray-500 font-bold mb-2 px-1">Découvrir plus</p>
        <div className="grid grid-cols-2 gap-2">
          {DISCOVER.map(({ to, emoji, title }) => (
            <Link to={to} key={to}>
              <motion.div whileTap={{ scale: 0.96 }}
                className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2"
              >
                <span className="text-lg">{emoji}</span>
                <span className="text-xs font-bold text-gray-200">{title}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── INSTALLER L'APP — bandeau discret ───────────────────────────────── */}
      {!isInstalled && (
        <section className="px-4 pb-5 max-w-2xl mx-auto">
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleInstallClick}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-between"
          >
            <span className="text-xs text-gray-400 flex items-center gap-2">
              📲 Installer l'app sur ton téléphone
            </span>
            <span className="text-xs font-bold text-blue-400">Installer</span>
          </motion.button>
        </section>
      )}

      {/* ── PROFIL / CONNEXION ────────────────────────────────────────────── */}
      {user ? (
        <section className="px-4 pb-8 max-w-2xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-base font-black">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-white text-sm">{user.username}</div>
                <div className="text-[11px] text-gray-400">{totalPoints} pts · {coins} coins · {lives} vies</div>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={logout}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition">
              Déconnexion
            </motion.button>
          </div>
        </section>
      ) : (
        <section className="px-4 pb-8 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-900/40 to-blue-900/40 border border-green-400/20 rounded-2xl p-5 text-center"
          >
            <div className="text-2xl mb-2">🎁</div>
            <h3 className="font-bold text-white text-base mb-1">100 coins offerts à l'inscription</h3>
            <p className="text-gray-400 text-xs mb-3">Crée ton compte et commence à jouer gratuitement</p>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowAuth(true)}
              className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-2.5 rounded-2xl transition w-full text-sm">
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
