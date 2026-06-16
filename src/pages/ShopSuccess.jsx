// src/pages/ShopSuccess.jsx
// Page de succès après paiement Stripe

import { useEffect, useState }  from "react";
import { Link }                 from "react-router-dom";
import { motion }               from "framer-motion";
import { useGameStats }         from "../hooks/useGameStats.jsx";

export default function ShopSuccess() {
  const { refresh, coins } = useGameStats();
  const [refreshed, setRefreshed] = useState(false);

  useEffect(() => {
    // Rafraîchir les coins depuis MongoDB après paiement
    setTimeout(async () => {
      await refresh();
      setRefreshed(true);
    }, 2000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-black to-gray-900 text-white flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-8xl mb-6"
        >
          🎉
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>
          <h1 className="text-3xl font-black text-white mb-2">Paiement réussi !</h1>
          <p className="text-gray-400 mb-6">Tes coins ont été ajoutés à ton compte.</p>

          {refreshed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-yellow-500/20 border border-yellow-400/40 rounded-2xl px-6 py-4 mb-6">
              <div className="text-3xl font-black text-yellow-400">{coins} 💰</div>
              <div className="text-sm text-gray-400">coins disponibles</div>
            </motion.div>
          )}

          <div className="space-y-3">
            <Link to="/cards">
              <motion.button whileTap={{ scale: 0.97 }}
                className="w-full bg-purple-500 hover:bg-purple-400 text-white font-bold py-4 rounded-2xl transition">
                🎁 Ouvrir des packs de cartes
              </motion.button>
            </Link>
            <Link to="/shop">
              <motion.button whileTap={{ scale: 0.97 }}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition">
                🛒 Retour au Shop
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
