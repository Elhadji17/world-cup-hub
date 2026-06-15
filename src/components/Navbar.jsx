// src/components/Navbar.jsx
// Desktop : navbar horizontale complète
// Mobile  : top bar simplifiée + bottom navigation

import { Link, useLocation } from "react-router-dom";
import { useGameStats }      from "../hooks/useGameStats.jsx";
import { useAuth }           from "../hooks/useAuth";

// Liens bottom nav mobile — 5 max
const BOTTOM_LINKS = [
  { to: "/",            label: "Home",      emoji: "🏠" },
  { to: "/quiz",        label: "Quiz",      emoji: "🧠" },
  { to: "/predictions", label: "Pronostics",emoji: "🔮" },
  { to: "/matches",     label: "Matchs",    emoji: "📅" },
  { to: "/leaderboard", label: "Classement",emoji: "🏆" },
];

// Liens desktop complets
const DESKTOP_LINKS = [
  { to: "/",            label: "Home"       },
  { to: "/quiz",        label: "Quiz"       },
  { to: "/predictions", label: "Pronostics" },
  { to: "/matches",     label: "Matchs"     },
  { to: "/leaderboard", label: "Classement" },
  { to: "/share",       label: "Partager"   },
  { to: "/shop",        label: "Shop"       },
];

export default function Navbar() {
  const { pathname }          = useLocation();
  const { coins, lives }      = useGameStats();
  const { user }              = useAuth();

  return (
    <>
      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3 max-w-6xl mx-auto">

          {/* Logo */}
          <Link to="/" className="font-black text-lg text-white hover:text-green-400 transition">
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

          {/* Coins + Vies — toujours visible */}
          <div className="flex items-center gap-2">
            <Link to="/shop" className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 transition">
              <span className="text-red-400 text-sm font-bold">❤️ {lives}</span>
              <span className="text-white/20">|</span>
              <span className="text-yellow-400 text-sm font-bold">{coins} C</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── BOTTOM NAV — mobile seulement ───────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-t border-white/10 safe-area-pb">
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
        </div>
      </nav>

      {/* Espace pour le bottom nav sur mobile */}
      
    </>
  );
}
