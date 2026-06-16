// src/pages/ShareCard.jsx
// Carte de partage style FIFA Ultimate Team

import { useState, useRef }          from "react";
import { motion, AnimatePresence }   from "framer-motion";
import { useAuth }                   from "../hooks/useAuth";
import { useGameStats }              from "../hooks/useGameStats.jsx";

const COLLECTION_KEY = "wch_cards";
const TEAM_KEY       = "wch_team";

const MEDALS = [
  { min: 0,    emoji: "⚽", label: "Débutant",   color: "#94a3b8", rarity: "bronze"    },
  { min: 100,  emoji: "🥉", label: "Confirmé",   color: "#cd7f32", rarity: "bronze"    },
  { min: 300,  emoji: "🥈", label: "Expert",     color: "#c0c0c0", rarity: "silver"    },
  { min: 700,  emoji: "🥇", label: "Champion",   color: "#ffd700", rarity: "gold"      },
  { min: 1500, emoji: "👑", label: "Légendaire", color: "#a855f7", rarity: "legendary" },
];

const RARITY_STYLES = {
  bronze:    { bg1: "#78350f", bg2: "#92400e", bg3: "#b45309", accent: "#fbbf24", cardBg: "#451a03" },
  silver:    { bg1: "#374151", bg2: "#4b5563", bg3: "#6b7280", accent: "#e5e7eb", cardBg: "#1f2937" },
  gold:      { bg1: "#713f12", bg2: "#92400e", bg3: "#d97706", accent: "#fcd34d", cardBg: "#422006" },
  legendary: { bg1: "#4c1d95", bg2: "#6d28d9", bg3: "#8b5cf6", accent: "#c4b5fd", cardBg: "#2e1065" },
};

function getMedal(pts) {
  return [...MEDALS].reverse().find(m => pts >= m.min) ?? MEDALS[0];
}

function calcTeamRating() {
  try {
    const team    = JSON.parse(localStorage.getItem(TEAM_KEY)) ?? {};
    const players = Object.values(team).filter(Boolean);
    if (players.length === 0) return 0;
    return Math.round(players.reduce((s, p) => s + (p?.rating ?? 0), 0) / players.length);
  } catch { return 0; }
}

export default function ShareCard() {
  const canvasRef    = useRef(null);
  const fileRef      = useRef(null);
  const { user }     = useAuth();
  const { coins, totalPoints, lives } = useGameStats();

  const [userPhoto,   setUserPhoto]   = useState(null);
  const [supportMsg,  setSupportMsg]  = useState("Allez les Lions ! 🦁🇸🇳");
  const [imageUrl,    setImageUrl]    = useState(null);
  const [generating,  setGenerating]  = useState(false);

  const collection  = (() => { try { return JSON.parse(localStorage.getItem(COLLECTION_KEY)) ?? []; } catch { return []; } })();
  const teamRating  = calcTeamRating();
  const medal       = getMedal(totalPoints);
  const style       = RARITY_STYLES[medal.rarity];
  const uniqueCards = [...new Map(collection.map(c => [c.id, c])).values()].length;

  // Stats affichées sur la carte
  const CARD_STATS = [
    { label: "PTS",  value: Math.min(totalPoints, 99) },
    { label: "QUI",  value: Math.min(Math.round(totalPoints / 10), 99) },
    { label: "CAR",  value: Math.min(uniqueCards * 5, 99) },
    { label: "EQU",  value: Math.min(teamRating, 99) },
    { label: "COI",  value: Math.min(Math.round(coins / 10), 99) },
    { label: "VIE",  value: Math.min(lives * 15, 99) },
  ];

  // Note globale carte
  const cardRating = Math.min(
    Math.round((totalPoints / 20) + (uniqueCards * 2) + (teamRating / 3)),
    99
  );

  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setUserPhoto(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function generateCard() {
    setGenerating(true);
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const SCALE = 3; // Haute résolution
    const W = 300, H = 460;
    canvas.width  = W * SCALE;
    canvas.height = H * SCALE;
    ctx.scale(SCALE, SCALE);

    // ── Fond carte dégradé FIFA ───────────────────────────────────────────
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0,   style.bg1);
    bgGrad.addColorStop(0.6, style.bg2);
    bgGrad.addColorStop(1,   style.bg3);
    ctx.fillStyle = bgGrad;
    roundRect(ctx, 0, 0, W, H, 16);
    ctx.fill();

    // Reflet lumineux haut
    const shineGrad = ctx.createLinearGradient(0, 0, W * 0.6, H * 0.5);
    shineGrad.addColorStop(0, "rgba(255,255,255,0.12)");
    shineGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = shineGrad;
    roundRect(ctx, 0, 0, W, H, 16);
    ctx.fill();

    // Bordure dorée
    ctx.strokeStyle = style.accent;
    ctx.lineWidth   = 2.5;
    roundRect(ctx, 2, 2, W - 4, H - 4, 14);
    ctx.stroke();

    // ── PHOTO — occupe toute la hauteur supérieure ────────────────────────
    const photoH = 300;

    if (userPhoto) {
      await new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          ctx.save();
          roundRect(ctx, 0, 0, W, photoH, 14);
          ctx.clip();
          // Centrer et couvrir
          const scale = Math.max(W / img.width, photoH / img.height);
          const dw    = img.width  * scale;
          const dh    = img.height * scale;
          const dx    = (W - dw) / 2;
          const dy    = dh * 0.1 * -1; // Commencer à 10% en dessous du haut
          ctx.drawImage(img, dx, dy, dw, dh);
          ctx.restore();
          resolve();
        };
        img.src = userPhoto;
      });
    } else {
      // Grand avatar initiale
      const avatarGrad = ctx.createLinearGradient(0, 0, W, photoH);
      avatarGrad.addColorStop(0, style.bg3 + "cc");
      avatarGrad.addColorStop(1, style.bg1);
      ctx.fillStyle = avatarGrad;
      ctx.save();
      roundRect(ctx, 0, 0, W, photoH, 14);
      ctx.clip();
      ctx.fillRect(0, 0, W, photoH);
      ctx.restore();

      ctx.fillStyle = style.accent + "33";
      ctx.beginPath();
      ctx.arc(W / 2, photoH * 0.45, 80, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = style.accent;
      ctx.font      = "bold 90px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        user ? user.username.charAt(0).toUpperCase() : "?",
        W / 2, photoH * 0.45 + 32
      );
    }

    // Dégradé bas photo → fond carte
    const fadeGrad = ctx.createLinearGradient(0, photoH - 80, 0, photoH);
    fadeGrad.addColorStop(0, "rgba(0,0,0,0)");
    fadeGrad.addColorStop(1, style.bg1);
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(0, photoH - 80, W, 80);

    // ── NOTE + POSITION sur la photo (haut gauche) ───────────────────────
    ctx.fillStyle = style.accent;
    ctx.font      = "bold 44px Arial";
    ctx.textAlign = "left";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur  = 6;
    ctx.fillText(cardRating, 14, 52);

    ctx.font      = "bold 13px Arial";
    ctx.fillText(medal.label.toUpperCase().slice(0, 3), 14, 70);
    ctx.shadowBlur = 0;

    // Flag + WCH (haut droite)
    ctx.font      = "28px Arial";
    ctx.textAlign = "right";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur  = 4;
    ctx.fillText("🇸🇳", W - 12, 45);
    ctx.fillStyle = style.accent;
    ctx.font      = "bold 9px Arial";
    ctx.fillText("WCH 2026", W - 12, 60);
    ctx.shadowBlur = 0;

    // ── SECTION BAS — fond opaque ─────────────────────────────────────────
    ctx.fillStyle = style.cardBg + "ee";
    ctx.fillRect(0, photoH, W, H - photoH);

    // Nom joueur
    ctx.fillStyle = "white";
    ctx.font      = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText((user?.username ?? "JOUEUR").toUpperCase(), W / 2, photoH + 22);

    // Message de soutien
    ctx.fillStyle = style.accent;
    ctx.font      = "italic 10px Arial";
    ctx.fillText(supportMsg.slice(0, 30), W / 2, photoH + 37);

    // Ligne séparatrice
    ctx.strokeStyle = style.accent + "66";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(15, photoH + 46); ctx.lineTo(W - 15, photoH + 46);
    ctx.stroke();

    // ── Stats 3+3 style FIFA ──────────────────────────────────────────────
    const statsTop = photoH + 52;
    const col3W    = (W - 30) / 3;

    // Ligne 1
    CARD_STATS.slice(0, 3).forEach((stat, i) => {
      const x = 15 + i * col3W + col3W / 2;
      ctx.fillStyle = style.accent;
      ctx.font      = "bold 18px Arial";
      ctx.textAlign = "center";
      ctx.fillText(stat.value, x, statsTop + 16);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font      = "bold 8px Arial";
      ctx.fillText(stat.label, x, statsTop + 27);
    });

    // Separateur vertical entre les 3
    [col3W, col3W * 2].forEach(xOff => {
      ctx.strokeStyle = style.accent + "44";
      ctx.lineWidth   = 0.5;
      ctx.beginPath();
      ctx.moveTo(15 + xOff, statsTop + 4);
      ctx.lineTo(15 + xOff, statsTop + 30);
      ctx.stroke();
    });

    // Ligne entre les 2 rangées
    ctx.strokeStyle = style.accent + "44";
    ctx.lineWidth   = 0.5;
    ctx.beginPath();
    ctx.moveTo(15, statsTop + 35); ctx.lineTo(W - 15, statsTop + 35);
    ctx.stroke();

    // Ligne 2
    CARD_STATS.slice(3, 6).forEach((stat, i) => {
      const x = 15 + i * col3W + col3W / 2;
      ctx.fillStyle = style.accent;
      ctx.font      = "bold 18px Arial";
      ctx.textAlign = "center";
      ctx.fillText(stat.value, x, statsTop + 51);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font      = "bold 8px Arial";
      ctx.fillText(stat.label, x, statsTop + 62);
    });

    // Ligne séparatrice finale
    ctx.strokeStyle = style.accent + "66";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(15, statsTop + 70); ctx.lineTo(W - 15, statsTop + 70);
    ctx.stroke();

    // Footer
    ctx.fillStyle = style.accent;
    ctx.font      = "bold 9px Arial";
    ctx.textAlign = "center";
    ctx.fillText("⚽ WORLD CUP HUB 2026  ·  worldcuphub2026.vercel.app", W / 2, statsTop + 84);

    const url = canvas.toDataURL("image/png");
    setImageUrl(url);
    setGenerating(false);
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
    a.download = `wch-${user?.username ?? "joueur"}.png`;
    a.click();
  }

  function handleShare() {
    if (navigator.share) {
      fetch(imageUrl).then(r => r.blob()).then(blob => {
        const file = new File([blob], "worldcuphub.png", { type: "image/png" });
        navigator.share({
          title: "World Cup Hub 2026",
          text:  `${supportMsg}\n👉 worldcuphub2026.vercel.app`,
          files: [file],
        }).catch(() => handleDownload());
      });
    } else {
      handleDownload();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-purple-900 text-white pb-20">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold">🃏 Ma Carte de Fan</h1>
          <p className="text-xs text-gray-400">Style FIFA · Partage sur WhatsApp</p>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-xl mx-auto px-4 pt-5 space-y-4">

        {/* Aperçu rareté */}
        <div className={`rounded-2xl p-3 text-center border`}
          style={{ background: style.bg1, borderColor: style.accent + "66" }}>
          <p className="text-xs font-bold" style={{ color: style.accent }}>
            {medal.emoji} Ta rareté : {medal.label} — {totalPoints} pts
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Plus tu joues, plus ta carte est rare !</p>
        </div>

        {/* Upload photo */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-sm font-bold text-white mb-3">📷 Ta photo (optionnel)</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

          {userPhoto ? (
            <div className="flex items-center gap-3">
              <img src={userPhoto} alt="photo" className="w-16 h-16 rounded-full object-cover border-2 border-yellow-400" />
              <div className="flex-1">
                <p className="text-xs text-green-400 font-bold">✅ Photo ajoutée !</p>
                <button onClick={() => setUserPhoto(null)} className="text-xs text-red-400 mt-1">Supprimer</button>
              </div>
            </div>
          ) : (
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => fileRef.current.click()}
              className="w-full bg-white/10 hover:bg-white/20 border border-dashed border-white/30 rounded-xl py-4 text-gray-300 text-sm transition">
              📷 Ajouter ma photo
            </motion.button>
          )}
        </div>

        {/* Message de soutien */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-sm font-bold text-white mb-3">💬 Message de soutien</p>
          <input
            type="text"
            value={supportMsg}
            onChange={e => setSupportMsg(e.target.value)}
            maxLength={30}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400"
            placeholder="Allez les Lions ! 🦁🇸🇳"
          />
          <p className="text-xs text-gray-500 mt-1 text-right">{supportMsg.length}/30</p>
        </div>

        {/* Stats sur la carte */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-sm font-bold text-white mb-3">📊 Stats sur ta carte</p>
          <div className="grid grid-cols-3 gap-2">
            {CARD_STATS.map(({ label, value }) => (
              <div key={label} className="text-center bg-white/5 rounded-xl py-2">
                <div className="font-black text-yellow-400 text-lg">{value}</div>
                <div className="text-[10px] text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Générer */}
        {!imageUrl ? (
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={generateCard}
            disabled={generating}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-2xl text-lg transition">
            {generating ? "⏳ Génération..." : "🎨 Générer ma carte FIFA"}
          </motion.button>
        ) : (
          <div className="space-y-3">
            {/* Carte générée */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center">
              <img src={imageUrl} alt="Ma carte" className="rounded-2xl shadow-2xl max-w-[240px] w-full" />
            </motion.div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={handleShare}
              className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl transition">
              📲 Partager sur WhatsApp
            </motion.button>

            <motion.button whileTap={{ scale: 0.97 }} onClick={handleDownload}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition">
              💾 Télécharger
            </motion.button>

            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setImageUrl(null)}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition">
              🔄 Modifier et regénérer
            </motion.button>

            {/* Message à copier */}
            <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2 font-bold">📋 Message WhatsApp :</p>
              <p className="text-sm text-white leading-relaxed">
                {supportMsg} {"\n"}
                🏆 Rejoins-moi sur worldcuphub2026.vercel.app{"\n"}
                Quiz · Pronostics · Cartes FIFA{"\n"}
                #Sénégal #WorldCup2026
              </p>
              <button onClick={() => navigator.clipboard.writeText(
                `${supportMsg}\n🏆 Rejoins-moi sur worldcuphub2026.vercel.app\nQuiz · Pronostics · Cartes FIFA\n#Sénégal #WorldCup2026`
              )} className="mt-2 text-xs text-green-400 font-bold">
                📋 Copier le message
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
