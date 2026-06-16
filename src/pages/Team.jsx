// src/pages/Team.jsx
// Formation d'équipe avec terrain de foot

import { useState, useEffect }     from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link }                    from "react-router-dom";
import { useAuth }                 from "../hooks/useAuth";
import PlayerCard                   from "../components/PlayerCard";

const COLLECTION_KEY = "wch_cards";
const TEAM_KEY       = "wch_team";
const API            = import.meta.env.VITE_API_URL ?? "";

function loadCollection() {
  try { return JSON.parse(localStorage.getItem(COLLECTION_KEY)) ?? []; }
  catch { return []; }
}
function loadTeam() {
  try { return JSON.parse(localStorage.getItem(TEAM_KEY)) ?? {}; }
  catch { return {}; }
}
function saveTeam(team) {
  localStorage.setItem(TEAM_KEY, JSON.stringify(team));
}

const FORMATIONS = {
  "4-3-3": {
    label: "4-3-3",
    positions: [
      { id: "GK",  label: "GK",  x: 50, y: 88, role: "GK"  },
      { id: "LB",  label: "LB",  x: 15, y: 68, role: "DEF" },
      { id: "CB1", label: "CB",  x: 35, y: 68, role: "DEF" },
      { id: "CB2", label: "CB",  x: 65, y: 68, role: "DEF" },
      { id: "RB",  label: "RB",  x: 85, y: 68, role: "DEF" },
      { id: "LM",  label: "LM",  x: 20, y: 45, role: "MIL" },
      { id: "CM",  label: "CM",  x: 50, y: 45, role: "MIL" },
      { id: "RM",  label: "RM",  x: 80, y: 45, role: "MIL" },
      { id: "LW",  label: "LW",  x: 20, y: 20, role: "ATT" },
      { id: "ST",  label: "ST",  x: 50, y: 15, role: "ATT" },
      { id: "RW",  label: "RW",  x: 80, y: 20, role: "ATT" },
    ],
  },
  "4-4-2": {
    label: "4-4-2",
    positions: [
      { id: "GK",  label: "GK",  x: 50, y: 88, role: "GK"  },
      { id: "LB",  label: "LB",  x: 15, y: 68, role: "DEF" },
      { id: "CB1", label: "CB",  x: 35, y: 68, role: "DEF" },
      { id: "CB2", label: "CB",  x: 65, y: 68, role: "DEF" },
      { id: "RB",  label: "RB",  x: 85, y: 68, role: "DEF" },
      { id: "LM",  label: "LM",  x: 15, y: 45, role: "MIL" },
      { id: "CM1", label: "CM",  x: 38, y: 45, role: "MIL" },
      { id: "CM2", label: "CM",  x: 62, y: 45, role: "MIL" },
      { id: "RM",  label: "RM",  x: 85, y: 45, role: "MIL" },
      { id: "ST1", label: "ST",  x: 33, y: 18, role: "ATT" },
      { id: "ST2", label: "ST",  x: 67, y: 18, role: "ATT" },
    ],
  },
  "3-5-2": {
    label: "3-5-2",
    positions: [
      { id: "GK",  label: "GK",  x: 50, y: 88, role: "GK"  },
      { id: "CB1", label: "CB",  x: 25, y: 68, role: "DEF" },
      { id: "CB2", label: "CB",  x: 50, y: 68, role: "DEF" },
      { id: "CB3", label: "CB",  x: 75, y: 68, role: "DEF" },
      { id: "LWB", label: "LWB", x: 10, y: 47, role: "MIL" },
      { id: "LM",  label: "LM",  x: 30, y: 42, role: "MIL" },
      { id: "CM",  label: "CM",  x: 50, y: 40, role: "MIL" },
      { id: "RM",  label: "RM",  x: 70, y: 42, role: "MIL" },
      { id: "RWB", label: "RWB", x: 90, y: 47, role: "MIL" },
      { id: "ST1", label: "ST",  x: 33, y: 18, role: "ATT" },
      { id: "ST2", label: "ST",  x: 67, y: 18, role: "ATT" },
    ],
  },
};

const ROLE_COLORS = {
  GK:  "bg-yellow-500",
  DEF: "bg-blue-500",
  MIL: "bg-green-500",
  ATT: "bg-red-500",
};

function calcTeamRating(team, positions) {
  const assigned = positions.filter(p => team[p.id]);
  if (assigned.length === 0) return 0;
  const total = assigned.reduce((sum, p) => sum + (team[p.id]?.rating ?? 0), 0);
  return Math.round(total / assigned.length);
}

export default function Team() {
  const { user }                    = useAuth();
  const [formation,  setFormation]  = useState("4-3-3");
  const [team,       setTeam]       = useState(loadTeam);
  const [collection, setCollection] = useState([]);
  const [selecting,  setSelecting]  = useState(null);
  const [saved,      setSaved]      = useState(false);

  const positions  = FORMATIONS[formation].positions;
  const teamRating = calcTeamRating(team, positions);
  const filledCount = positions.filter(p => team[p.id]).length;

  // Joueurs déjà utilisés (sauf poste en cours de sélection)
  const usedCount = {};
    Object.entries(team)
      .filter(([posId]) => posId !== selecting)
      .forEach(([, player]) => {
        if (player?.id) usedCount[player.id] = (usedCount[player.id] ?? 0) + 1;
      });

  // Charger collection
  useEffect(() => {
    const token = localStorage.getItem("wch_token");
    if (token) {
      fetch(`${API}/api/quiz?action=cards`, {
        headers: { "Authorization": `Bearer ${token}` },
      }).then(r => r.json()).then(data => {
        if (data.cards?.length > 0) setCollection(data.cards);
        else setCollection(loadCollection());
      }).catch(() => setCollection(loadCollection()));
    } else {
      setCollection(loadCollection());
    }
  }, []);

  function handleSelectPlayer(player) {
    if (!selecting) return;
    const newTeam = { ...team, [selecting]: player };
    setTeam(newTeam);
    saveTeam(newTeam);
    setSelecting(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleRemovePlayer(posId) {
    const newTeam = { ...team };
    delete newTeam[posId];
    setTeam(newTeam);
    saveTeam(newTeam);
  }

  const uniqueCards = [...new Map(collection.map(c => [c.id, c])).values()];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">⚽</div>
          <p className="text-gray-400 mb-4">Connecte-toi pour former ton équipe</p>
          <Link to="/"><button className="bg-green-500 text-white font-bold px-6 py-3 rounded-xl">Se connecter</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-black to-gray-900 text-white pb-20">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">⚽ Mon Équipe</h1>
            <p className="text-xs text-gray-400">{filledCount}/11 joueurs · Note {teamRating > 0 ? teamRating : "—"}</p>
          </div>
          {saved && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-xs text-green-400 font-bold">✅ Sauvegardé</motion.div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4">

        {/* Sélecteur formation */}
        <div className="flex bg-white/5 rounded-xl p-1 gap-1 mb-4">
          {Object.keys(FORMATIONS).map(f => (
            <button key={f} onClick={() => setFormation(f)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
                formation === f ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"
              }`}>
              {f}
            </button>
          ))}
        </div>

        {/* Note équipe */}
        {teamRating > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-4 bg-green-500/10 border border-green-400/20 rounded-xl px-4 py-3 flex justify-between items-center">
            <div>
              <div className="text-sm font-bold text-white">Note globale</div>
              <div className="text-xs text-gray-400">{filledCount}/11 postes remplis</div>
            </div>
            <div className="text-4xl font-black text-green-400">{teamRating}</div>
          </motion.div>
        )}

        {/* Terrain */}
        <div className="relative w-full rounded-2xl overflow-hidden mb-6"
          style={{ paddingBottom: "140%", background: "linear-gradient(180deg, #166534 0%, #15803d 25%, #16a34a 50%, #15803d 75%, #166534 100%)" }}>

          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 140" preserveAspectRatio="none">
            <rect x="3" y="3" width="94" height="134" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
            <line x1="3" y1="70" x2="97" y2="70" stroke="white" strokeWidth="0.4" strokeOpacity="0.4" />
            <circle cx="50" cy="70" r="12" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.4" />
            <rect x="25" y="3" width="50" height="18" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.4" />
            <rect x="25" y="119" width="50" height="18" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.4" />
            <rect x="38" y="1" width="24" height="4" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.4" />
            <rect x="38" y="135" width="24" height="4" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.4" />
          </svg>

          {positions.map(pos => {
            const player     = team[pos.id];
            const isSelecting = selecting === pos.id;
            return (
              <div key={pos.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                {player ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => setSelecting(pos.id)}
                  >
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full border-2 overflow-hidden ${
                        player.rarity === "legendary" ? "border-purple-400" :
                        player.rarity === "gold"      ? "border-yellow-400" :
                        player.rarity === "silver"    ? "border-gray-300"   : "border-amber-600"
                      }`}>
                        {player.image ? (
                          <img src={player.image} alt={player.name}
                            className="w-full h-full object-cover object-top"
                            onError={e => e.target.style.display = "none"} />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-lg">
                            {player.flag}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-black text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                        {player.rating}
                      </div>
                    </div>
                    <div className="text-white text-[9px] font-bold mt-0.5 bg-black/60 px-1 rounded whitespace-nowrap max-w-[60px] truncate text-center">
                      {player.name.split(" ").pop()}
                    </div>
                    <div className={`text-[8px] font-bold px-1 rounded ${ROLE_COLORS[pos.role]} text-white`}>
                      {pos.label}
                    </div>
                  </motion.div>
                ) : (
                  <motion.button whileTap={{ scale: 0.9 }}
                    onClick={() => setSelecting(pos.id)}
                    className={`flex flex-col items-center transition ${isSelecting ? "scale-110" : ""}`}
                  >
                    <div className={`w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center ${
                      isSelecting ? "border-white bg-white/20" : "border-white/40 bg-black/30"
                    }`}>
                      <span className="text-white/60 text-lg">+</span>
                    </div>
                    <div className={`text-[8px] font-bold px-1 rounded mt-0.5 ${ROLE_COLORS[pos.role]} text-white`}>
                      {pos.label}
                    </div>
                  </motion.button>
                )}
              </div>
            );
          })}
        </div>

        {/* Légende */}
        <div className="flex gap-2 justify-center mb-4 text-xs">
          {[["GK","bg-yellow-500"],["DEF","bg-blue-500"],["MIL","bg-green-500"],["ATT","bg-red-500"]].map(([role, color]) => (
            <div key={role} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <span className="text-gray-400">{role}</span>
            </div>
          ))}
        </div>

        {/* Info si collection vide */}
        {uniqueCards.length === 0 && (
          <div className="text-center py-6 bg-white/5 border border-white/10 rounded-2xl">
            <div className="text-4xl mb-3">🃏</div>
            <p className="text-gray-400 mb-3">Tu n'as pas encore de cartes !</p>
            <Link to="/cards">
              <button className="bg-purple-500 hover:bg-purple-400 text-white font-bold px-6 py-3 rounded-xl transition">
                🎁 Ouvrir des packs
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Sélecteur de joueur */}
      <AnimatePresence>
        {selecting && (
          <>
            <div className="fixed inset-0 z-20 bg-black/40" onClick={() => setSelecting(null)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-30 bg-gray-900 border-t border-white/10 rounded-t-2xl p-4 pb-20 max-h-80 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-sm font-bold text-white">
                    Poste : <span className="text-green-400">{positions.find(p => p.id === selecting)?.label}</span>
                  </p>
                  <p className="text-xs text-gray-400">{uniqueCards.length} cartes · {usedPlayerIds.length} déjà placés</p>
                </div>
                <div className="flex gap-2">
                  {team[selecting] && (
                    <button onClick={() => { handleRemovePlayer(selecting); setSelecting(null); }}
                      className="text-xs text-red-400 bg-red-400/10 px-3 py-1 rounded-lg">
                      ✕ Retirer
                    </button>
                  )}
                  <button onClick={() => setSelecting(null)}
                    className="text-xs text-gray-400 bg-white/10 px-3 py-1 rounded-lg">
                    Annuler
                  </button>
                </div>
              </div>

              {uniqueCards.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-sm mb-3">Aucune carte disponible</p>
                  <Link to="/cards" onClick={() => setSelecting(null)}>
                    <button className="bg-purple-500 text-white text-sm font-bold px-4 py-2 rounded-xl">
                      🎁 Ouvrir des packs
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {[...uniqueCards].sort((a, b) => b.rating - a.rating).map(card => {
                    const cardCount = collection.filter(c => c.id === card.id).length;
                    const placedCount = usedCount[card.id] ?? 0;
                    const isUsed = placedCount >= cardCount;
                    return (
                      <motion.div key={card.id}
                        whileTap={{ scale: isUsed ? 1 : 0.95 }}
                        onClick={() => !isUsed && handleSelectPlayer(card)}
                        className={`shrink-0 ${isUsed ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <PlayerCard player={card} size="sm" animate={false} />
                        {isUsed && (
                          <div className="text-center text-[10px] text-red-400 font-bold mt-1">Déjà placé</div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
