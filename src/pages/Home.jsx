import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-blue-900 text-white">

      {/* HEADER */}
      <header className="p-6 flex justify-between items-center">
        <h1 className="text-3xl md:text-5xl font-bold tracking-wide animate-pulse">
          ⚽ World Cup Hub
        </h1>

        <button className="bg-white text-black px-4 py-2 rounded-xl font-bold transition hover:scale-105 active:scale-95">
          Profil
        </button>
      </header>

      {/* HERO */}
      <section className="text-center mt-10 px-6">
        <h2 className="text-4xl md:text-6xl font-bold leading-tight">
          La Coupe du Monde<br />
          commence bientôt 🔥
        </h2>

        <p className="mt-6 text-lg md:text-2xl text-gray-300">
          Quiz • Pronostics • Match Center
        </p>
      </section>

      {/* CARDS */}
      <section className="mt-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">

          {/* QUIZ */}
          <div className="bg-white/90 backdrop-blur-lg text-black rounded-3xl p-8 shadow-xl transform transition duration-300 hover:scale-105 hover:shadow-2xl">

            <div className="text-6xl mb-6">🧠</div>

            <h3 className="text-3xl font-bold mb-4">
              Quiz Challenge
            </h3>

            <p className="text-gray-700 mb-6">
              Teste ton niveau football avec des questions Coupe du Monde.
            </p>

            <Link to="/quiz">
              <button className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold w-full transition hover:bg-green-700 active:scale-95">
                Jouer
              </button>
            </Link>
          </div>

          {/* PRONOSTICS */}
          <div className="bg-white/90 backdrop-blur-lg text-black rounded-3xl p-8 shadow-xl transform transition duration-300 hover:scale-105 hover:shadow-2xl">

            <div className="text-6xl mb-6">🔮</div>

            <h3 className="text-3xl font-bold mb-4">
              Pronostics
            </h3>

            <p className="text-gray-700 mb-6">
              Prédire les scores et les gagnants des matchs.
            </p>

            <Link to="/predictions">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold w-full transition hover:bg-blue-700 active:scale-95">
                Prédire
              </button>
            </Link>
          </div>

          {/* MATCH CENTER */}
          <div className="bg-white/90 backdrop-blur-lg text-black rounded-3xl p-8 shadow-xl transform transition duration-300 hover:scale-105 hover:shadow-2xl">

            <div className="text-6xl mb-6">📅</div>

            <h3 className="text-3xl font-bold mb-4">
              Match Center
            </h3>

            <p className="text-gray-700 mb-6">
              Retrouve les matchs, horaires et résultats.
            </p>

            <Link to="/matches">
              <button className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold w-full transition hover:bg-red-700 active:scale-95">
                Voir
              </button>
            </Link>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-10 text-gray-400 mt-20">
        ⚽ World Cup Hub 2026
      </footer>

    </div>
  );
}

export default Home;