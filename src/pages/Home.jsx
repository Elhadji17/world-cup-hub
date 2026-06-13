// src/pages/Home.jsx
// Mis à jour : bouton Profil ouvre AuthModal, affiche le vrai user connecté

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import AuthModal from "../components/AuthModal";

function Home() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-blue-900 text-white">

      {/* HEADER */}
      <header className="p-6 flex justify-between items-center">
        <h1 className="text-3xl md:text-5xl font-bold tracking-wide animate-pulse">
          ⚽ World Cup Hub
        </h1>

        {/* Bouton Profil / Connexion */}
        {user ? (
          <div className="flex items-center gap-3">
            <p className="text-green-400 text-sm font-semibold">
              Bienvenue {user.username} ⚽
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl font-bold transition hover:bg-white/20"
            >
              Déconnexion
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAuth(true)}
            className="bg-white text-black px-4 py-2 rounded-xl font-bold transition hover:scale-105 active:scale-95"
          >
            Connexion
          </motion.button>
        )}
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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.05, rotate: 0.5 }}
            whileTap={{ scale: 0.97 }}
            className="bg-white/90 backdrop-blur-lg text-black rounded-3xl p-8 shadow-xl"
          >
            <div className="text-6xl mb-6">🧠</div>
            <h3 className="text-3xl font-bold mb-4">Quiz Challenge</h3>
            <p className="text-gray-700 mb-6">
              Teste ton niveau football avec des questions Coupe du Monde.
            </p>
            <Link to="/quiz">
              <button className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold w-full transition hover:bg-green-700 active:scale-95">
                Jouer
              </button>
            </Link>
          </motion.div>

          {/* PRONOSTICS */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05, rotate: -0.5 }}
            whileTap={{ scale: 0.97 }}
            className="bg-white/90 backdrop-blur-lg text-black rounded-3xl p-8 shadow-xl"
          >
            <div className="text-6xl mb-6">🔮</div>
            <h3 className="text-3xl font-bold mb-4">Pronostics</h3>
            <p className="text-gray-700 mb-6">
              Prédire les scores et les gagnants des matchs.
            </p>
            {user ? (
              <Link to="/predictions">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold w-full transition hover:bg-blue-700 active:scale-95">
                  Prédire
                </button>
              </Link>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold w-full transition hover:bg-blue-700 active:scale-95"
              >
                Connexion requise
              </button>
            )}
          </motion.div>

          {/* MATCH CENTER */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="bg-white/90 backdrop-blur-lg text-black rounded-3xl p-8 shadow-xl"
          >
            <div className="text-6xl mb-6">📅</div>
            <h3 className="text-3xl font-bold mb-4">Match Center</h3>
            <p className="text-gray-700 mb-6">
              Retrouve les matchs, horaires et résultats.
            </p>
            <Link to="/matches">
              <button className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold w-full transition hover:bg-red-700 active:scale-95">
                Voir
              </button>
            </Link>
          </motion.div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-10 text-gray-400 mt-20">
        ⚽ World Cup Hub 2026
      </footer>

      {/* AUTH MODAL */}
      <AnimatePresence>{showAuth && <AuthModal onClose={() => setShowAuth(false)} />}</AnimatePresence>

    </div>
  );
}

export default Home;
