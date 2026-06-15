import { Link, useLocation } from "react-router-dom";
import { useGameStats }      from "../hooks/useGameStats.jsx";

const LINKS = [
  { to: "/",            label: "Home",       emoji: "🏠" },
  { to: "/quiz",        label: "Quiz",       emoji: "🧠" },
  { to: "/predictions", label: "Pronostics", emoji: "🔮" },
  { to: "/matches",     label: "Matchs",     emoji: "📅" },
  { to: "/leaderboard", label: "Classement", emoji: "🏆" },
  { to: "/share",       label: "Partager",   emoji: "📲" },
  { to: "/shop",        label: "Shop",       emoji: "🛒" },
];

function Navbar() {
  const { pathname } = useLocation();
  const { coins, lives } = useGameStats();

  return (
    <div className="flex justify-between items-center px-4 py-3 bg-black text-white border-b border-gray-700">

      {/* Titre */}
      <Link to="/" className="font-bold text-xl hover:text-green-400 transition shrink-0">
        ⚽ World Cup Hub
      </Link>

      {/* Coins + Vies — centre */}
      <div className="flex items-center gap-2 text-xs font-bold">
        <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-lg">
          ❤️ {lives}
        </span>
        <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-lg">
          {coins} 🪙
        </span>
      </div>

      {/* Liens navigation */}
      <div className="flex gap-1 md:gap-2 text-sm md:text-base">
        {LINKS.map(({ to, label, emoji }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`px-2 py-1 rounded-lg transition font-medium ${
                active
                  ? "text-green-400 bg-green-400/10"
                  : "hover:text-green-400"
              }`}
            >
              <span className="hidden md:inline">{label}</span>
              <span className="md:hidden text-lg">{emoji}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Navbar;
