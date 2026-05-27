import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="flex justify-between items-center p-4 bg-black text-white border-b border-gray-700">

      <h1 className="font-bold text-xl">
        ⚽ World Cup Hub
      </h1>

      <div className="flex gap-4 text-sm md:text-base">

        <Link to="/" className="hover:text-green-400">
          Home
        </Link>

        <Link to="/quiz" className="hover:text-green-400">
          Quiz
        </Link>

        <Link to="/predictions" className="hover:text-green-400">
          Pronostics
        </Link>

        <Link to="/matches" className="hover:text-green-400">
          Matchs
        </Link>

      </div>

    </div>
  );
}

export default Navbar;