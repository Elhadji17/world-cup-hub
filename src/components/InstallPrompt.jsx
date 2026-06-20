// src/components/InstallPrompt.jsx
// Bannière incitant à installer la PWA sur l'écran d'accueil

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DISMISS_KEY = "wch_install_dismissed";

function isIOS() {
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches
    || window.navigator.standalone === true;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow]                     = useState(false);
  const [showIOSHelp, setShowIOSHelp]       = useState(false);

  useEffect(() => {
    if (isStandalone()) return; // déjà installée
    const dismissed = localStorage.getItem(DISMISS_KEY);
    const dismissedAt = dismissed ? Number(dismissed) : 0;
    const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    if (dismissed && daysSince < 7) return; // re-proposer après 7 jours

    if (isIOS()) {
      // iOS n'a pas d'event beforeinstallprompt — on affiche après un délai
      const t = setTimeout(() => setShow(true), 4000);
      return () => clearTimeout(t);
    }

    function handler(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShow(true), 2000);
    }
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (isIOS()) {
      setShowIOSHelp(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShow(false);
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShow(false);
    setShowIOSHelp(false);
  }

  return (
    <AnimatePresence>
      {show && !showIOSHelp && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <div className="bg-gradient-to-r from-green-600 to-blue-700 rounded-2xl p-4 shadow-2xl border border-white/20 flex items-center gap-3">
            <div className="text-3xl">⚽</div>
            <div className="flex-1">
              <div className="font-bold text-white text-sm">Installe World Cup Hub !</div>
              <div className="text-xs text-white/80">Accès rapide depuis ton écran d'accueil</div>
            </div>
            <button onClick={handleInstall}
              className="bg-white text-green-700 font-bold text-sm px-4 py-2 rounded-xl shrink-0">
              Installer
            </button>
            <button onClick={handleDismiss} className="text-white/60 hover:text-white text-lg shrink-0 px-1">
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {showIOSHelp && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
            onClick={e => e.stopPropagation()}
            className="bg-gray-900 border-t border-white/10 rounded-t-3xl p-6 w-full max-w-md"
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">📲</div>
              <h3 className="text-white font-bold text-lg">Installer sur iPhone</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                <span className="text-xl">1️⃣</span>
                <span>Appuie sur le bouton <strong className="text-white">Partager</strong> ⬆️ en bas de Safari</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                <span className="text-xl">2️⃣</span>
                <span>Choisis <strong className="text-white">"Sur l'écran d'accueil"</strong></span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                <span className="text-xl">3️⃣</span>
                <span>Appuie sur <strong className="text-white">"Ajouter"</strong></span>
              </div>
            </div>
            <button onClick={handleDismiss}
              className="w-full mt-5 bg-green-500 text-white font-bold py-3 rounded-xl">
              Compris !
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
