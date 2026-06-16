// src/pages/ShareCard.jsx
// Carte de partage personnalisée — canvas HTML → image téléchargeable

import { useState, useEffect, useRef } from "react";
import { motion }                       from "framer-motion";
import { useAuth }                      from "../hooks/useAuth";
import { useGameStats }                 from "../hooks/useGameStats.jsx";

const API            = import.meta.env.VITE_API_URL ?? "";
const COLLECTION_KEY = "wch_cards";
const TEAM_KEY       = "wch_team";

const MEDALS = [
  { min: 0,    emoji: "⚽", label: "Débutant"   },
  { min: 100,  emoji: "🥉", label: "Confirmé"   },
  { min: 300,  emoji: "🥈", label: "Expert"     },
  { min: 700,  emoji: "🥇", label: "Champion"   },
  { min: 1500, emoji: "👑", label: "Légendaire" },
];

function getMedal(pts) {
  return [...MEDALS].reverse().find(m => pts >= m.min) ?? MEDALS[0];
}

// Trouver le pronostic Sénégal
const SENEGAL_MATCH_IDS = [25, 26, 27, 28, 29, 30]; // IDs matchs Sénégal

export default function ShareCard() {
  const canvasRef               = useRef(null);
  const { user }                = useAuth();
  const { coins, totalPoints, lives } = useGameStats();
  const [pronos,   setPronos]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [generated, setGenerated] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const collection = (() => {
    try { return JSON.parse(localStorage.getItem(COLLECTION_KEY)) ?? []; }
    catch { return []; }
  })();

  const team = (() => {
    try { return JSON.parse(localStorage.getItem(TEAM_KEY)) ?? {}; }
    catch { return {}; }
  })();

  const teamRating = (() => {
    const players = Object.values(team).filter(Boolean);
    if (players.length === 0) return 0;
    return Math.round(players.reduce((s, p) => s + (p?.rating ?? 0), 0) / players.length);
  })();

  const medal       = getMedal(totalPoints);
  const uniqueCards = [...new Map(collection.map(c => [c.id, c])).values()];
  const goldCards   = collection.filter(c => c.rarity === "gold" || c.rarity === "legendary").length;

  // Charger pronostics
  useEffect(() => {
    const token = localStorage.getItem("wch_token");
    if (!token) { setLoading(false); return; }
    fetch(`${API}/api/predictions/me`, {
      headers: { "Authorization": `Bearer ${token}` },
    }).then(r => r.json())
      .then(data => setPronos(data.predictions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  // Trouver pronostic Sénégal
  const senegalProno = pronos.find(p =>
    SENEGAL_MATCH_IDS.includes(p.matchId) ||
    p.teamA?.includes("Sénégal") || p.teamB?.includes("Sénégal")
  );

  // Générer la carte canvas
  function generateCard() {
    const canvas  = canvasRef.current;
    const ctx     = canvas.getContext("2d");
    const W = 400, H = 700;
    canvas.width  = W;
    canvas.height = H;

    // Fond dégradé
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0,   "#0f172a");
    grad.addColorStop(0.4, "#1e3a5f");
    grad.addColorStop(1,   "#0f172a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Bordure verte
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth   = 3;
    ctx.strokeRect(8, 8, W - 16, H - 16);

    // Header
    ctx.fillStyle   = "#22c55e";
    ctx.font        = "bold 14px Arial";
    ctx.textAlign   = "center";
    ctx.fillText("⚽ WORLD CUP HUB 2026", W / 2, 40);

    // Ligne séparatrice
    ctx.strokeStyle = "#22c55e44";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(30, 52); ctx.lineTo(W - 30, 52);
    ctx.stroke();

    // Avatar cercle
    const avatarX = W / 2, avatarY = 100, avatarR = 40;
    const avatarGrad = ctx.createRadialGradient(avatarX, avatarY, 0, avatarX, avatarY, avatarR);
    avatarGrad.addColorStop(0, "#22c55e");
    avatarGrad.addColorStop(1, "#1e40af");
    ctx.fillStyle = avatarGrad;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
    ctx.fill();

    // Initiale avatar
    ctx.fillStyle = "white";
    ctx.font      = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      user ? user.username.charAt(0).toUpperCase() : "?",
      avatarX, avatarY + 13
    );

    // Nom joueur
    ctx.fillStyle = "white";
    ctx.font      = "bold 22px Arial";
    ctx.fillText(user?.username ?? "Joueur", W / 2, 165);

    // Médaille
    ctx.fillStyle = "#fbbf24";
    ctx.font      = "14px Arial";
    ctx.fillText(`${medal.emoji} ${medal.label} · ${totalPoints} pts`, W / 2, 188);

    // Ligne séparatrice
    ctx.strokeStyle = "#ffffff22";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(30, 205); ctx.lineTo(W - 30, 205);
    ctx.stroke();

    // ── Section pronostic Sénégal ──────────────────────────────────────────
    ctx.fillStyle = "#94a3b8";
    ctx.font      = "bold 11px Arial";
    ctx.fillText("🔮 MON PRONOSTIC SÉNÉGAL", W / 2, 228);

    if (senegalProno) {
      // Fond pronostic
      ctx.fillStyle = "#1e3a5f88";
      roundRect(ctx, 30, 238, W - 60, 70, 12);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.font      = "bold 18px Arial";
      ctx.fillText(
        `🇸🇳 Sénégal  ${senegalProno.scoreA} - ${senegalProno.scoreB}  ${getOpponentFlag(senegalProno)}`,
        W / 2, 270
      );
      ctx.fillStyle = "#94a3b8";
      ctx.font      = "12px Arial";
      ctx.fillText(
        senegalProno.isJoker ? "⭐ Joker posé sur ce match !" : "Match du groupe",
        W / 2, 295
      );
    } else {
      ctx.fillStyle = "#64748b";
      ctx.font      = "13px Arial";
      ctx.fillText("Aucun pronostic encore", W / 2, 268);
      ctx.fillStyle = "#22c55e";
      ctx.font      = "bold 12px Arial";
      ctx.fillText("→ Rejoins et pronostique !", W / 2, 288);
    }

    // Ligne séparatrice
    ctx.strokeStyle = "#ffffff22";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(30, 322); ctx.lineTo(W - 30, 322);
    ctx.stroke();

    // ── Stats ──────────────────────────────────────────────────────────────
    ctx.fillStyle = "#94a3b8";
    ctx.font      = "bold 11px Arial";
    ctx.fillText("📊 MES STATS", W / 2, 345);

    const stats = [
      { label: "Points Quiz",  value: totalPoints, color: "#fbbf24", x: W/4     },
      { label: "Coins",        value: coins,        color: "#fbbf24", x: W/2     },
      { label: "Cartes",       value: uniqueCards.length, color: "#a78bfa", x: 3*W/4 },
    ];

    stats.forEach(({ label, value, color, x }) => {
      ctx.fillStyle = color;
      ctx.font      = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText(value, x, 380);
      ctx.fillStyle = "#94a3b8";
      ctx.font      = "11px Arial";
      ctx.fillText(label, x, 398);
    });

    // Note équipe
    if (teamRating > 0) {
      ctx.fillStyle = "#1e3a5f88";
      roundRect(ctx, 30, 415, W - 60, 50, 12);
      ctx.fill();
      ctx.fillStyle = "#22c55e";
      ctx.font      = "bold 28px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`⚽ Note équipe : ${teamRating}`, W / 2, 448);
    }

    // Cartes or/légendaires
    if (goldCards > 0) {
      ctx.fillStyle = "#fbbf2488";
      roundRect(ctx, 30, 475, W - 60, 40, 10);
      ctx.fill();
      ctx.fillStyle = "#fbbf24";
      ctx.font      = "bold 14px Arial";
      ctx.fillText(`🟨 ${goldCards} carte${goldCards > 1 ? "s" : ""} Or/Légendaire${goldCards > 1 ? "s" : ""}`, W / 2, 500);
    }

    // Ligne séparatrice
    ctx.strokeStyle = "#ffffff22";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(30, 535); ctx.lineTo(W - 30, 535);
    ctx.stroke();

    // ── Appel à l'action ───────────────────────────────────────────────────
    ctx.fillStyle = "#94a3b8";
    ctx.font      = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Rejoins-moi sur", W / 2, 565);

    ctx.fillStyle   = "#22c55e";
    ctx.font        = "bold 16px Arial";
    ctx.fillText("worldcuphub2026.vercel.app", W / 2, 590);

    ctx.fillStyle = "#64748b";
    ctx.font      = "11px Arial";
    ctx.fillText("Quiz · Pronostics · Cartes · Équipe", W / 2, 612);

    // Hashtags
    ctx.fillStyle = "#1e40af";
    ctx.font      = "bold 12px Arial";
    ctx.fillText("#Sénégal #WorldCup2026 #LionsdelaTéranga", W / 2, 645);

    // Footer
    ctx.fillStyle = "#22c55e44";
    ctx.fillRect(0, H - 50, W, 50);
    ctx.fillStyle = "#22c55e";
    ctx.font      = "bold 13px Arial";
    ctx.fillText("⚽ WORLD CUP HUB 2026", W / 2, H - 20);

    // Convertir en image
    const url = canvas.toDataURL("image/png");
    setImageUrl(url);
    setGenerated(true);
  }

  function getOpponentFlag(prono) {
    if (!prono) return "";
    if (prono.teamA?.includes("Sénégal")) return prono.flagB ?? "🏳️";
    return prono.flagA ?? "🏳️";
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function handleDownload() {
    const a    = document.createElement("a");
    a.href     = imageUrl;
    a.download = `worldcuphub-${user?.username ?? "joueur"}.png`;
    a.click();
  }

  function handleShare() {
    if (navigator.share) {
      fetch(imageUrl)
        .then(r => r.blob())
        .then(blob => {
          const file = new File([blob], "worldcuphub.png", { type: "image/png" });
          navigator.share({
            title: "World Cup Hub 2026",
            text:  `Mon pronostic Sénégal sur worldcuphub2026.vercel.app 🦁🇸🇳`,
            files: [file],
          });
        });
    } else {
      handleDownload();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-black to-blue-900 text-white pb-20">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold">📲 Ma Carte</h1>
          <p className="text-xs text-gray-400">Génère ta carte et partage-la !</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-6">

        {/* Canvas caché */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Aperçu carte */}
        {!generated ? (
          <div className="text-center py-10">
            <div className="text-6xl mb-4">🃏</div>
            <p className="text-gray-400 mb-6">
              Génère ta carte personnalisée avec ton pronostic Sénégal, tes stats et ton équipe !
            </p>

            {/* Aperçu infos */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 text-left space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">👤 Joueur</span>
                <span className="font-bold">{user?.username ?? "Non connecté"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">🏆 Médaille</span>
                <span className="font-bold">{medal.emoji} {medal.label}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">🔮 Pronostic Sénégal</span>
                <span className="font-bold">
                  {senegalProno ? `${senegalProno.scoreA}-${senegalProno.scoreB}` : "Aucun"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">⚽ Note équipe</span>
                <span className="font-bold">{teamRating > 0 ? teamRating : "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">🃏 Cartes</span>
                <span className="font-bold">{uniqueCards.length}</span>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={generateCard}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-4 rounded-2xl text-lg transition"
            >
              {loading ? "⏳ Chargement..." : "🎨 Générer ma carte"}
            </motion.button>
          </div>
        ) : (
          <div>
            {/* Image générée */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center mb-6"
            >
              <img src={imageUrl} alt="Ma carte" className="rounded-2xl shadow-2xl max-w-[300px] w-full" />
            </motion.div>

            {/* Boutons partage */}
            <div className="space-y-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleShare}
                className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2">
                📲 Partager sur WhatsApp
              </motion.button>

              <motion.button whileTap={{ scale: 0.97 }} onClick={handleDownload}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition">
                💾 Télécharger l'image
              </motion.button>

              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setGenerated(false)}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition">
                🔄 Regénérer
              </motion.button>
            </div>

            {/* Message WhatsApp prêt */}
            <div className="mt-5 bg-green-500/10 border border-green-400/20 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2 font-bold">📋 Message à copier :</p>
              <p className="text-sm text-white">
                🦁 Allez les Lions ! 🇸🇳{"\n"}
                Je pronostique {senegalProno ? `Sénégal ${senegalProno.scoreA}-${senegalProno.scoreB}` : "une victoire du Sénégal"} !{"\n"}
                Rejoins-moi sur worldcuphub2026.vercel.app 🏆{"\n"}
                #Sénégal #WorldCup2026
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `🦁 Allez les Lions ! 🇸🇳\nJe pronostique ${senegalProno ? `Sénégal ${senegalProno.scoreA}-${senegalProno.scoreB}` : "une victoire du Sénégal"} !\nRejoins-moi sur worldcuphub2026.vercel.app 🏆\n#Sénégal #WorldCup2026`
                  );
                }}
                className="mt-2 text-xs text-green-400 font-bold hover:text-green-300"
              >
                📋 Copier le message
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
