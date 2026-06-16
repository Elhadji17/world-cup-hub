// src/pages/ShareCard.jsx
// Carte de fan style FIFA — totalement personnalisable

import { useState, useRef } from "react";
import { motion }           from "framer-motion";
import { useAuth }          from "../hooks/useAuth";

const RARITY_STYLES = {
  bronze:    { bg1: "#78350f", bg2: "#92400e", bg3: "#b45309", accent: "#fbbf24", cardBg: "#451a03", label: "🟫 Bronze"    },
  silver:    { bg1: "#1f2937", bg2: "#374151", bg3: "#4b5563", accent: "#e5e7eb", cardBg: "#111827", label: "⬜ Argent"    },
  gold:      { bg1: "#713f12", bg2: "#92400e", bg3: "#d97706", accent: "#fcd34d", cardBg: "#422006", label: "🟨 Or"        },
  legendary: { bg1: "#4c1d95", bg2: "#6d28d9", bg3: "#8b5cf6", accent: "#c4b5fd", cardBg: "#2e1065", label: "💎 Légendaire"},
};

const POSITIONS = ["ATT", "MIL", "DEF", "GK"];
const FLAGS     = ["🇸🇳", "🇫🇷", "🇲🇦", "🇨🇲", "🇩🇿", "🇨🇮", "🇳🇬", "🇧🇷", "🇦🇷", "🇩🇪", "🇪🇸", "🇵🇹", "🌍"];
const STAT_KEYS = ["PAC", "TIR", "PAS", "DRI", "DEF", "PHY"];

function calcRating(stats) {
  const vals = Object.values(stats);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function StatSlider({ label, value, onChange }) {
  const color = value >= 85 ? "text-green-400" : value >= 70 ? "text-yellow-400" : "text-red-400";
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-8 font-bold">{label}</span>
      <input type="range" min="40" max="99" value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="flex-1 h-1.5 accent-yellow-400" />
      <span className={`text-sm font-black w-6 text-right ${color}`}>{value}</span>
    </div>
  );
}

export default function ShareCard() {
  const canvasRef  = useRef(null);
  const fileRef    = useRef(null);
  const { user }   = useAuth();

  // Personnalisation
  const [playerName, setPlayerName] = useState(user?.username ?? "MON NOM");
  const [position,   setPosition]   = useState("ATT");
  const [flag,       setFlag]       = useState("🇸🇳");
  const [rarity,     setRarity]     = useState("gold");
  const [supportMsg, setSupportMsg] = useState("Allez les Lions ! 🦁🇸🇳");
  const [userPhoto,  setUserPhoto]  = useState(null);
  const [stats,      setStats]      = useState({ PAC: 85, TIR: 82, PAS: 78, DRI: 88, DEF: 65, PHY: 80 });
  const [imageUrl,   setImageUrl]   = useState(null);
  const [generating, setGenerating] = useState(false);

  const style  = RARITY_STYLES[rarity];
  const rating = calcRating(stats);

  function updateStat(key, val) {
    setStats(prev => ({ ...prev, [key]: val }));
  }

  function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setUserPhoto(ev.target.result);
    reader.readAsDataURL(file);
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

  async function generateCard() {
    setGenerating(true);
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");

    const SCALE = 8;
    const W = 300, H = 460;
    canvas.width  = W * SCALE;
    canvas.height = H * SCALE;
    ctx.scale(SCALE, SCALE);

    // ── Fond ──────────────────────────────────────────────────────────────
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0,   style.bg1);
    bgGrad.addColorStop(0.5, style.bg2);
    bgGrad.addColorStop(1,   style.bg3);
    ctx.fillStyle = bgGrad;
    roundRect(ctx, 0, 0, W, H, 16);
    ctx.fill();

    // Reflet
    const shine = ctx.createLinearGradient(0, 0, W * 0.6, H * 0.5);
    shine.addColorStop(0, "rgba(255,255,255,0.13)");
    shine.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = shine;
    roundRect(ctx, 0, 0, W, H, 16);
    ctx.fill();

    // Bordure
    ctx.strokeStyle = style.accent;
    ctx.lineWidth   = 2.5;
    roundRect(ctx, 2, 2, W - 4, H - 4, 14);
    ctx.stroke();

    // ── PHOTO ─────────────────────────────────────────────────────────────
    const photoH = 295;

    if (userPhoto) {
      await new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          ctx.save();
          roundRect(ctx, 0, 0, W, photoH, 14);
          ctx.clip();
          const scale = Math.max(W / img.width, photoH / img.height);
          const dw = img.width  * scale;
          const dh = img.height * scale;
          const dx = (W - dw) / 2;
          const dy = dh * 0.05 * -1;
          ctx.drawImage(img, dx, dy, dw, dh);
          ctx.restore();
          resolve();
        };
        img.src = userPhoto;
      });
    } else {
      // Avatar initiale
      ctx.save();
      roundRect(ctx, 0, 0, W, photoH, 14);
      ctx.clip();
      const ag = ctx.createLinearGradient(0, 0, W, photoH);
      ag.addColorStop(0, style.bg3 + "cc");
      ag.addColorStop(1, style.bg1);
      ctx.fillStyle = ag;
      ctx.fillRect(0, 0, W, photoH);
      ctx.fillStyle = style.accent + "33";
      ctx.beginPath();
      ctx.arc(W / 2, photoH * 0.45, 85, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = style.accent;
      ctx.font      = "bold 95px Arial";
      ctx.textAlign = "center";
      ctx.fillText(playerName.charAt(0).toUpperCase(), W / 2, photoH * 0.45 + 34);
      ctx.restore();
    }

    // Dégradé bas photo
    const fade = ctx.createLinearGradient(0, photoH - 90, 0, photoH);
    fade.addColorStop(0, "rgba(0,0,0,0)");
    fade.addColorStop(1, style.bg1);
    ctx.fillStyle = fade;
    ctx.fillRect(0, photoH - 90, W, 90);

    // ── NOTE + POSITION (haut gauche sur photo) ───────────────────────────
    ctx.shadowColor = "rgba(0,0,0,0.9)";
    ctx.shadowBlur  = 8;
    ctx.fillStyle   = style.accent;
    ctx.font        = "bold 46px Arial";
    ctx.textAlign   = "left";
    ctx.fillText(rating, 14, 54);
    ctx.font        = "bold 14px Arial";
    ctx.fillText(position, 14, 72);
    ctx.shadowBlur  = 0;

    // Flag + WCH (haut droite)
    ctx.font        = "30px Arial";
    ctx.textAlign   = "right";
    ctx.shadowBlur  = 4;
    ctx.fillText(flag, W - 12, 46);
    ctx.fillStyle   = style.accent;
    ctx.font        = "bold 9px Arial";
    ctx.fillText("WCH 2026", W - 12, 60);
    ctx.shadowBlur  = 0;

    // ── SECTION BAS ───────────────────────────────────────────────────────
    ctx.fillStyle = style.cardBg + "ee";
    ctx.fillRect(0, photoH, W, H - photoH);

    // Nom
    ctx.fillStyle = "white";
    ctx.font      = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(playerName.toUpperCase().slice(0, 16), W / 2, photoH + 22);

    // Message
    ctx.fillStyle = style.accent;
    ctx.font      = "italic 10px Arial";
    ctx.fillText(supportMsg.slice(0, 28), W / 2, photoH + 36);

    // Ligne
    ctx.strokeStyle = style.accent + "66";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(15, photoH + 44); ctx.lineTo(W - 15, photoH + 44);
    ctx.stroke();

    // ── STATS 3+3 ─────────────────────────────────────────────────────────
    const statsTop = photoH + 50;
    const colW     = (W - 30) / 3;
    const statList = Object.entries(stats);

    statList.forEach(([key, val], i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x   = 15 + col * colW + colW / 2;
      const y   = statsTop + row * 42;

      ctx.fillStyle = style.accent;
      ctx.font      = "bold 19px Arial";
      ctx.textAlign = "center";
      ctx.fillText(val, x, y + 16);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font      = "bold 8px Arial";
      ctx.fillText(key, x, y + 27);

      // Séparateur vertical
      if (col < 2) {
        ctx.strokeStyle = style.accent + "33";
        ctx.lineWidth   = 0.5;
        ctx.beginPath();
        ctx.moveTo(15 + (col + 1) * colW, y + 3);
        ctx.lineTo(15 + (col + 1) * colW, y + 30);
        ctx.stroke();
      }
    });

    // Ligne entre rangées
    ctx.strokeStyle = style.accent + "44";
    ctx.lineWidth   = 0.5;
    ctx.beginPath();
    ctx.moveTo(15, statsTop + 33); ctx.lineTo(W - 15, statsTop + 33);
    ctx.stroke();

    // Ligne finale
    ctx.strokeStyle = style.accent + "66";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(15, statsTop + 78); ctx.lineTo(W - 15, statsTop + 78);
    ctx.stroke();

    // Footer
    ctx.fillStyle = style.accent;
    ctx.font      = "bold 9px Arial";
    ctx.textAlign = "center";
    ctx.fillText("⚽ WORLD CUP HUB 2026  ·  worldcuphub2026.vercel.app", W / 2, statsTop + 91);

    const url = canvas.toDataURL("image/png");
    setImageUrl(url);
    setGenerating(false);
  }

  function handleDownload() {
    const a = document.createElement("a");
    a.href  = imageUrl;
    a.download = `wch-${playerName}.png`;
    a.click();
  }

  function handleShare() {
    if (navigator.share) {
      fetch(imageUrl).then(r => r.blob()).then(blob => {
        const file = new File([blob], "worldcuphub.png", { type: "image/png" });
        navigator.share({
          title: "World Cup Hub 2026",
          text:  `${supportMsg}\n👉 worldcuphub2026.vercel.app\n#Sénégal #WorldCup2026`,
          files: [file],
        }).catch(() => handleDownload());
      });
    } else handleDownload();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-purple-900 text-white pb-20">

      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold">🃏 Ma Carte de Fan</h1>
          <p className="text-xs text-gray-400">Style FIFA · Personnalise et partage !</p>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-xl mx-auto px-4 pt-5 space-y-4">

        {/* ── Rareté ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-sm font-bold text-white mb-3">✨ Rareté de ta carte</p>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(RARITY_STYLES).map(([key, s]) => (
              <motion.button key={key} whileTap={{ scale: 0.95 }}
                onClick={() => setRarity(key)}
                className={`py-2 rounded-xl text-xs font-bold transition border ${
                  rarity === key ? "border-white text-white" : "border-white/20 text-gray-400"
                }`}
                style={{ background: rarity === key ? s.bg2 : "transparent" }}
              >
                {s.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Photo ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-sm font-bold text-white mb-3">📷 Ta photo</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          {userPhoto ? (
            <div className="flex items-center gap-3">
              <img src={userPhoto} alt="photo" className="w-16 h-16 rounded-full object-cover border-2 border-yellow-400" />
              <div>
                <p className="text-xs text-green-400 font-bold">✅ Photo ajoutée !</p>
                <button onClick={() => setUserPhoto(null)} className="text-xs text-red-400">Supprimer</button>
              </div>
            </div>
          ) : (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => fileRef.current.click()}
              className="w-full bg-white/10 hover:bg-white/20 border border-dashed border-white/30 rounded-xl py-4 text-gray-300 text-sm transition">
              📷 Ajouter ma photo
            </motion.button>
          )}
        </div>

        {/* ── Infos joueur ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-bold text-white">👤 Infos joueur</p>

          <div>
            <label className="text-xs text-gray-400">Nom sur la carte</label>
            <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)}
              maxLength={16}
              className="w-full mt-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400">Position</label>
              <div className="flex gap-1 mt-1 flex-wrap">
                {POSITIONS.map(p => (
                  <button key={p} onClick={() => setPosition(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      position === p ? "bg-yellow-400 text-black" : "bg-white/10 text-gray-300"
                    }`}>{p}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400">Pays</label>
              <div className="flex gap-1 mt-1 flex-wrap">
                {FLAGS.map(f => (
                  <button key={f} onClick={() => setFlag(f)}
                    className={`text-lg transition rounded ${flag === f ? "scale-125" : "opacity-60"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400">Message de soutien</label>
            <input type="text" value={supportMsg} onChange={e => setSupportMsg(e.target.value)}
              maxLength={28}
              className="w-full mt-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400" />
          </div>
        </div>

        {/* ── Stats personnalisées ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-bold text-white">📊 Tes stats</p>
            <div className="text-2xl font-black text-yellow-400">{rating}</div>
          </div>
          <div className="space-y-3">
            {STAT_KEYS.map(key => (
              <StatSlider key={key} label={key} value={stats[key]}
                onChange={val => updateStat(key, val)} />
            ))}
          </div>
        </div>

        {/* ── Générer ── */}
        {!imageUrl ? (
          <motion.button whileTap={{ scale: 0.97 }} onClick={generateCard} disabled={generating}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-2xl text-lg transition">
            {generating ? "⏳ Génération..." : "🎨 Générer ma carte FIFA"}
          </motion.button>
        ) : (
          <div className="space-y-3">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center">
              <img src={imageUrl} alt="Ma carte" className="rounded-2xl shadow-2xl max-w-[220px] w-full" />
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
              🔄 Modifier
            </motion.button>

            {/* Message WhatsApp */}
            <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2 font-bold">📋 Message à copier :</p>
              <p className="text-sm text-white leading-relaxed">
                {supportMsg}{"\n"}
                🏆 Rejoins-moi sur worldcuphub2026.vercel.app{"\n"}
                Quiz · Pronostics · Cartes FIFA{"\n"}
                #Sénégal #WorldCup2026 #LionsdelaTéranga
              </p>
              <button onClick={() => navigator.clipboard.writeText(
                `${supportMsg}\n🏆 Rejoins-moi sur worldcuphub2026.vercel.app\nQuiz · Pronostics · Cartes FIFA\n#Sénégal #WorldCup2026 #LionsdelaTéranga`
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
