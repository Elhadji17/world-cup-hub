// src/components/Navbar.jsx
// Desktop : navbar horizontale complète
// Mobile  : top bar + bottom nav + drawer "Plus"

import { useState }             from "react";
import { Link, useLocation }    from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStats }         from "../hooks/useGameStats.jsx";
import { useAuth }              from "../hooks/useAuth";

// Bottom nav — 5 liens principaux
const BOTTOM_LINKS = [
  { to: "/",            label: "Home",     emoji: "🏠" },
  { to: "/quiz",        label: "Quiz",     emoji: "🧠" },
  { to: "/predictions", label: "Pronos",   emoji: "🔮" },
  { to: "/profile",     label: "Profil",   emoji: "👤" },
];

// Liens desktop complets
const DESKTOP_LINKS = [
  { to: "/",            label: "Home"       },
  { to: "/quiz",        label: "Quiz"       },
  { to: "/predictions", label: "Pronostics" },
  { to: "/matches",     label: "Matchs"     },
  { to: "/leaderboard", label: "Classement" },
  { to: "/cards",       label: "Cartes"     },
  { to: "/shop",        label: "Shop"       },
  { to: "/share",       label: "Partager"   },
  { to: "/profile",     label: "Profil"     },
  { to: "/team", label: "Équipe" },
];

// Liens dans le drawer "Plus"
const DRAWER_LINKS = [
  { to: "/matches",     label: "Match Center", emoji: "📅" },
  { to: "/leaderboard", label: "Classement",   emoji: "🏆" },
  { to: "/cards",       label: "Cartes",       emoji: "🃏" },
  { to: "/shop",        label: "Shop",         emoji: "🛒" },
  { to: "/share",       label: "Partager",     emoji: "📲" },
  { to: "/team", label: "Mon Équipe", emoji: "⚽" },
  { to: "/badges", label: "Badges", emoji: "🏅" },
];

export default function Navbar() {
  const { pathname }     = useLocation();
  const { coins, lives } = useGameStats();
  const { user }         = useAuth();
  const [drawer, setDrawer] = useState(false);

  return (
    <>
      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3 max-w-6xl mx-auto">

          {/* Logo */}
          <Link to="/" className="font-black text-lg text-white hover:text-green-400 transition shrink-0">
            ⚽ World Cup Hub
          </Link>

          {/* Desktop — liens */}
          <nav className="hidden md:flex items-center gap-1">
            {DESKTOP_LINKS.map(({ to, label }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                    active
                      ? "text-green-400 bg-green-400/10"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Droite : coins/vies + avatar */}
          <div className="flex items-center gap-2">
            {/* Coins + Vies */}
            <Link to="/shop"
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 transition">
              <span className="text-red-400 text-sm font-bold">❤️ {lives}</span>
              <span className="text-white/20">|</span>
              <span className="text-yellow-400 text-sm font-bold">{coins} C</span>
            </Link>

            {/* Avatar profil */}
            <Link to="/profile"
              className="w-9 h-9 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-sm font-black text-white hover:scale-105 transition shrink-0">
              {user ? user.username.charAt(0).toUpperCase() : "👤"}
            </Link>
          </div>
        </div>
      </header>

      {/* ── BOTTOM NAV — mobile seulement ───────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-t border-white/10">
        <div className="flex items-center justify-around px-2 py-2">
          {BOTTOM_LINKS.map(({ to, label, emoji }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition min-w-[56px] ${
                  active
                    ? "text-green-400 bg-green-400/10"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span className="text-xl leading-none">{emoji}</span>
                <span className={`text-[10px] font-semibold leading-none ${
                  active ? "text-green-400" : "text-gray-500"
                }`}>
                  {label}
                </span>
              </Link>
            );
          })}

          {/* Bouton Plus */}
          <button
            onClick={() => setDrawer(true)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition min-w-[56px] ${
              drawer ? "text-green-400 bg-green-400/10" : "text-gray-400"
            }`}
          >
            <span className="text-xl leading-none">···</span>
            <span className="text-[10px] font-semibold leading-none text-gray-500">Plus</span>
          </button>
        </div>
      </nav>

      {/* ── DRAWER "PLUS" ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {drawer && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
              className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer du bas */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-white/10 rounded-t-3xl pb-8"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-4">
                <div className="w-10 h-1 bg-white/20 rounded-full" />
              </div>

              <div className="px-4">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">
                  Plus de sections
                </p>

                <div className="grid grid-cols-1 gap-2">
                  {DRAWER_LINKS.map(({ to, label, emoji }) => {
                    const active = pathname === to;
                    return (
                      <Link key={to} to={to}
                        onClick={() => setDrawer(false)}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition ${
                          active
                            ? "bg-green-400/10 text-green-400"
                            : "bg-white/5 text-white hover:bg-white/10"
                        }`}
                      >
                        <span className="text-2xl">{emoji}</span>
                        <span className="font-semibold">{label}</span>
                        {active && <span className="ml-auto text-green-400">✓</span>}
                      </Link>
                    );
                  })}
                </div>

                {/* Coins/vies dans le drawer */}
                <div className="mt-4 flex gap-3">
                  <Link to="/shop" onClick={() => setDrawer(false)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-gray-300">Coins</span>
                    <span className="text-yellow-400 font-bold">{coins} 💰</span>
                  </Link>
                  <Link to="/shop" onClick={() => setDrawer(false)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-gray-300">Vies</span>
                    <span className="text-red-400 font-bold">❤️ {lives}</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
