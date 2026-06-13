import { Link, useLocation } from "react-router-dom";

const LINKS = [
  { to: "/",            label: "Home",       emoji: "🏠" },
  { to: "/quiz",        label: "Quiz",       emoji: "🧠" },
  { to: "/predictions", label: "Pronostics", emoji: "🔮" },
  { to: "/matches",     label: "Matchs",     emoji: "📅" },
  { to: "/leaderboard", label: "Classement", emoji: "🏆" },
  { to: "/share", label: "Partager", emoji: "📲" },
];

function Navbar() {
  const { pathname } = useLocation();

  return (
    <div className="flex justify-between items-center p-4 bg-black text-white border-b border-gray-700">

      <h1 className="font-bold text-xl">
        ⚽ World Cup Hub
      </h1>

      <div className="flex gap-1 md:gap-4 text-sm md:text-base">
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
