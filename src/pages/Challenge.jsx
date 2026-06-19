// src/pages/Challenge.jsx
// Défi entre joueurs — partage ton équipe et affronte un ami

import { useState, useEffect }     from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link }         from "react-router-dom";
import { useAuth }                 from "../hooks/useAuth";
import { useGameStats }            from "../hooks/useGameStats.jsx";
import PlayerCard                   from "../components/PlayerCard";

const API      = import.meta.env.VITE_API_URL ?? "";
const TEAM_KEY = "wch_team";

function loadTeam() {
  try { 
    return Object.values(JSON.parse(localStorage.getItem(TEAM_KEY)) ?? {}).filter(Boolean); 
  } catch { 
    return []; 
  }
}

function calcRating(players) {
  if (!players?.length) return 0;
  return Math.round(players.reduce((s, p) => s + (p?.rating ?? 70), 0) / players.length);
}

function simulateMatch(ratingA, ratingB) {
  function goals(atk, def) {
    const diff = (atk - def) / 20;
    return Math.max(0, Math.round(Math.min(diff + (Math.random() * 2 - 0.5), 6)));
  }
  const scoreA = goals(ratingA, ratingB);
  const scoreB = goals(ratingB, ratingA);
  return { scoreA, scoreB };
}

// ── Page créer un défi ────────────────────────────────────────────────────
function CreateChallenge() {
  const { user }               = useAuth();
  const { coins }              = useGameStats();
  const [myTeam]               = useState(loadTeam);
  const [challengeId, setChallengeId] = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [copied,      setCopied]      = useState(false);

  const myRating = calcRating(myTeam);
  const shareUrl = challengeId    
    ? `${window.location.origin}/challenge/${challengeId}`    
    : null;

  async function createChallenge() {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("wch_token");
      const res   = await fetch(`${API}/api/quiz?action=challenge-create`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({ team: myTeam, rating: myRating }),
      });
      const data = await res.json();
      if (data.challengeId) setChallengeId(data.challengeId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: "World Cup Hub — Défi d'équipe !",
        text:  `⚽ ${user?.username} te défie sur World Cup Hub ! Mon équipe a une note de ${myRating}. Peux-tu faire mieux ?\n👉 ${shareUrl}`,
        url:   shareUrl,
      });
    } else {
      handleCopy();
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🆚</div>
          <p className="text-gray-400 mb-4">Connecte-toi pour défier un ami</p>
          <Link to="/">
            <button className="bg-green-500 text-white font-bold px-6 py-3 rounded-xl">
              Se connecter
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (myTeam.length < 5) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">⚽</div>
          <h2 className="text-xl font-bold mb-2">Équipe incomplète</h2>
          <p className="text-gray-400 mb-6">Tu as besoin d'au moins 5 joueurs pour lancer un défi !</p>
          <div className="flex gap-3 justify-center">
            <Link to="/team">
              <button className="bg-green-500 text-white font-bold px-5 py-3 rounded-xl">⚽ Mon équipe</button>
            </Link>
            <Link to="/cards">
              <button className="bg-purple-500 text-white font-bold px-5 py-3 rounded-xl">🃏 Cartes</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-black to-purple-900 text-white pb-20">
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold">🆚 Défi d'équipe</h1>
          <p className="text-xs text-gray-400">Défie un ami avec ton équipe</p>
        </div>
      </div>
      <div className="max-w-xl mx-auto px-4 pt-5 space-y-4">
        {/* Mon équipe */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-white">👥 Ton équipe</h3>
            <div className="text-2xl font-black text-yellow-400">{myRating}</div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {myTeam.slice(0, 6).map((p, i) => (
              <div key={i} className="shrink-0">
                <PlayerCard player={p} size="sm" animate={false} />
              </div>
            ))}
          </div>
        </div>

        {/* Créer le défi */}
        {!challengeId ? (
          <motion.button 
            whileTap={{ scale: 0.97 }}
            onClick={createChallenge}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-4 rounded-2xl text-lg transition"
          >
            {loading ? "⏳ Création..." : "🆚 Créer mon défi"}
          </motion.button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Lien généré */}
            <div className="bg-green-500/10 border border-green-400/20 rounded-2xl p-5">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🎯</div>
                <h3 className="font-black text-white text-lg">Défi créé !</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Code : <span className="text-green-400 font-black">{challengeId}</span>
                </p>
              </div>
              {/* URL */}
              <div className="bg-black/30 rounded-xl px-3 py-2 mb-4 flex items-center gap-2">
                <span className="text-xs text-gray-300 flex-1 truncate">{shareUrl}</span>
                <button onClick={handleCopy} className="text-xs text-green-400 font-bold shrink-0">
                  {copied ? "✅" : "📋"}
                </button>
              </div>
              {/* Boutons partage */}
              <div className="space-y-2">
                <motion.button 
                  whileTap={{ scale: 0.97 }} 
                  onClick={handleShare}
                  className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-3 rounded-xl transition"
                >
                  📲 Partager sur WhatsApp
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.97 }} 
                  onClick={handleCopy}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition"
                >
                  {copied ? "✅ Lien copié !" : "🔗 Copier le lien"}
                </motion.button>
              </div>
            </div>
            {/* Instructions */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h3 className="font-bold text-white mb-2">📋 Comment ça marche ?</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex gap-2"><span>1️⃣</span><span>Envoie le lien à ton ami</span></div>
                <div className="flex gap-2"><span>2️⃣</span><span>Il ouvre le lien et accepte le défi</span></div>
                <div className="flex gap-2"><span>3️⃣</span><span>Vos équipes s'affrontent automatiquement</span></div>
                <div className="flex gap-2"><span>4️⃣</span><span>Le résultat est affiché pour les deux !</span></div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Page accepter un défi ────────────────────────────────────────────────
function AcceptChallenge({ challengeId }) {
  const { user }   = useAuth();
  const [myTeam]   = useState(loadTeam);
  const [challenge, setChallenge] = useState(null);
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [accepting, setAccepting] = useState(false);

  const myRating = calcRating(myTeam);

  useEffect(() => {
    fetch(`${API}/api/quiz?action=challenge-get&id=${challengeId}`)
      .then(r => r.json())
      .then(data => setChallenge(data.challenge))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [challengeId]);

  async function acceptChallenge() {
    setAccepting(true);
    try {
      const res  = await fetch(`${API}/api/quiz?action=challenge-accept`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          id:             challengeId,
          opponentName:   user?.username ?? "Anonyme",
          opponentTeam:   myTeam,
          opponentRating: myRating,
        }),
      });
      const data = await res.json();
      if (data.result) setResult(data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setAccepting(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">⚽</div>
        <p className="text-gray-400">Chargement du défi...</p>
      </div>
    </div>
  );

  if (!challenge) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-xl font-bold mb-2">Défi introuvable</h2>
        <p className="text-gray-400 mb-4">Ce défi a peut-être expiré (7 jours max)</p>
        <Link to="/">
          <button className="bg-green-500 text-white font-bold px-6 py-3 rounded-xl">Accueil</button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-black to-blue-900 text-white pb-20">
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold">🆚 Défi reçu !</h1>
          <p className="text-xs text-gray-400">De {challenge.challenger}</p>
        </div>
      </div>
      <div className="max-w-xl mx-auto px-4 pt-5 space-y-4">
        {/* Résultat */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl p-6 text-center border ${
                result.winner === challenge.challenger ? "bg-red-500/20 border-red-400/40" :
                result.winner === "draw"               ? "bg-yellow-500/20 border-yellow-400/40" :
                                                         "bg-green-500/20 border-green-400/40"
              }`}
            >
              <div className="text-5xl mb-2">
                {result.winner === challenge.challenger ? "😔" : 
                 result.winner === "draw"               ? "🤝" : "🏆"}
              </div>
              <h2 className="text-2xl font-black text-white mb-3">
                {result.winner === challenge.challenger ? `${challenge.challenger} gagne !` : 
                 result.winner === "draw"               ? "Match nul !" :
                                                          `Tu gagnes !`}
              </h2>
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">{challenge.challenger}</div>
                  <div className="text-5xl font-black">{result.scoreA}</div>
                </div>
                <span className="text-2xl text-gray-400">-</span>
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">{user?.username ?? "Toi"}</div>
                  <div className="text-5xl font-black">{result.scoreB}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Infos challenger */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-white">⚔️ Équipe de {challenge.challenger}</h3>
            <div className="text-2xl font-black text-yellow-400">{challenge.challengerRating}</div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {challenge.challengerTeam?.slice(0, 6).map((p, i) => (
              <div key={i} className="shrink-0">
                <PlayerCard player={p} size="sm" animate={false} />
              </div>
            ))}
          </div>
        </div>

        {/* Mon équipe */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-white">👥 Ton équipe</h3>
            <div className="text-2xl font-black text-yellow-400">{myRating}</div>
          </div>
          {myTeam.length < 5 ? (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm mb-3">Tu n'as pas assez de joueurs !</p>
              <Link to="/team">
                <button className="bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-xl">⚽ Créer mon équipe</button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {myTeam.slice(0, 6).map((p, i) => (
                <div key={i} className="shrink-0">
                  <PlayerCard player={p} size="sm" animate={false} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comparaison notes */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="font-bold text-white mb-3 text-center">📊 Comparaison</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-center">
              <div className="text-2xl font-black text-yellow-400">{challenge.challengerRating}</div>
              <div className="text-xs text-gray-400">{challenge.challenger}</div>
            </div>
            <div className="text-gray-500 font-bold">VS</div>
            <div className="flex-1 text-center">
              <div className={`text-2xl font-black ${myRating >= challenge.challengerRating ? "text-green-400" : "text-red-400"}`}>
                {myRating}
              </div>
              <div className="text-xs text-gray-400">Toi</div>
            </div>
          </div>
          <div className="mt-3 w-full bg-white/10 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-green-400"
              style={{ width: `${Math.min((myRating / Math.max(challenge.challengerRating, myRating, 1)) * 100, 100)}%` }} 
            />
          </div>
        </div>

        {/* Bouton accepter */}
        {!result && (
          <motion.button 
            whileTap={{ scale: 0.97 }}
            onClick={acceptChallenge}
            disabled={accepting || myTeam.length < 5}
            className={`w-full font-black py-4 rounded-2xl text-lg transition ${
              myTeam.length < 5
                ? "bg-white/10 text-gray-500 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-400 text-white"
            }`}
          >
            {accepting ? "⏳ Match en cours..." : "⚔️ Accepter le défi !"}
          </motion.button>
        )}

        {result && (
          <div className="space-y-3">
            <Link to="/team">
              <motion.button whileTap={{ scale: 0.97 }} className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-2xl transition">
                ⚽ Améliorer mon équipe
              </motion.button>
            </Link>
            <Link to="/">
              <motion.button whileTap={{ scale: 0.97 }} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition">
                🏠 Accueil
              </motion.button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────
export default function Challenge() {
  const { id } = useParams();
  return id ? <AcceptChallenge challengeId={id} /> : <CreateChallenge />;
}