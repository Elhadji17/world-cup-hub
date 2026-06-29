// src/components/PaletteTactique.jsx
// Panneau Régie Tactique — accessible uniquement via bouton Pause
// Complètement séparé de la simulation principale

import { useState, useEffect, useRef } from "react";

export default function PaletteTactique({
  timelineEvents = [],
  formation,
  onFormationChange,
  onClose,
  awayFlag = "🇧🇪",
  awayName = "Belgique",
}) {
  const [min,       setMin]       = useState(0);
  const [playing,   setPlaying]   = useState(false);
  const [senScore,  setSenScore]  = useState(0);
  const [advScore,  setAdvScore]  = useState(0);
  const [lastEvent, setLastEvent] = useState(null);
  const timerRef = useRef(null);

  // Chronomètre interne — indépendant du match
  useEffect(() => {
    if (!playing) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setMin(prev => {
        if (prev >= 93) { setPlaying(false); return 93; }
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(timerRef.current);
  }, [playing]);

  // Mise à jour score + dernier événement selon la minute
  useEffect(() => {
    const visible = timelineEvents.filter(e => e.minute <= min);
    const goals   = visible.filter(e => e.type === "goal");
    setSenScore(goals.filter(g => g.team === "me" || g.team === "sen").length);
    setAdvScore(goals.filter(g => g.team === "ai").length);
    if (visible.length > 0) setLastEvent(visible[visible.length - 1]);
    else setLastEvent(null);
  }, [min, timelineEvents]);

  function jumpTo(minute) {
    setMin(minute);
    setPlaying(false);
  }

  function reset() {
    setMin(0);
    setPlaying(false);
    setSenScore(0);
    setAdvScore(0);
    setLastEvent(null);
  }

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:50,
      background:"rgba(0,0,0,0.85)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"16px",
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width:"100%", maxWidth:"420px",
        background:"#0f172a",
        border:"1px solid rgba(51,65,85,0.7)",
        borderRadius:"16px",
        overflow:"hidden",
        boxShadow:"0 25px 50px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div style={{
          padding:"14px 16px",
          borderBottom:"1px solid rgba(51,65,85,0.5)",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          background:"rgba(2,6,23,0.8)",
        }}>
          <div>
            <div style={{ fontSize:"9px", color:"#22d3ee", fontWeight:700, letterSpacing:"2px" }}>
              RÉGIE TACTIQUE
            </div>
            <div style={{ fontSize:"13px", fontWeight:700, color:"white" }}>
              🇸🇳 Sénégal vs {awayFlag} {awayName}
            </div>
          </div>
          <button onClick={onClose} style={{
            width:"32px", height:"32px", borderRadius:"50%",
            border:"1px solid rgba(71,85,105,0.6)",
            background:"rgba(30,41,59,0.8)",
            color:"#94a3b8", cursor:"pointer", fontSize:"16px",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>×</button>
        </div>

        <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:"12px" }}>

          {/* Chronomètre + Score + Contrôles */}
          <div style={{
            background:"rgba(2,6,23,0.7)",
            border:"1px solid rgba(51,65,85,0.5)",
            borderRadius:"10px", padding:"12px",
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <div>
              <div style={{ fontSize:"9px", color:"#64748b", letterSpacing:"1px", marginBottom:"2px" }}>
                TEMPS DU MATCH
              </div>
              <div style={{ fontSize:"28px", fontWeight:800, color:"#f59e0b", fontFamily:"monospace" }}>
                {String(min).padStart(2,"0")}'
              </div>
              <div style={{ fontSize:"18px", fontWeight:700, color:"white", marginTop:"2px" }}>
                {senScore} - {advScore}
              </div>
            </div>
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={() => setPlaying(p => !p)} style={{
                width:"40px", height:"40px", borderRadius:"50%", border:"none",
                background: playing ? "#f59e0b" : "#16a34a",
                color:"white", cursor:"pointer", fontSize:"16px",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                {playing ? "⏸" : "▶"}
              </button>
              <button onClick={reset} style={{
                width:"40px", height:"40px", borderRadius:"50%",
                border:"1px solid rgba(71,85,105,0.5)",
                background:"rgba(30,41,59,0.7)",
                color:"#94a3b8", cursor:"pointer", fontSize:"16px",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>↺</button>
            </div>
          </div>

          {/* Barre de progression cliquable */}
          <div>
            <div style={{ fontSize:"9px", color:"#64748b", letterSpacing:"1px", marginBottom:"6px" }}>
              PROGRESSION DU MATCH
            </div>
            <div
              style={{
                width:"100%", height:"6px",
                background:"rgba(51,65,85,0.5)",
                borderRadius:"3px", cursor:"pointer", position:"relative",
              }}
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct  = (e.clientX - rect.left) / rect.width;
                jumpTo(Math.round(pct * 93));
              }}
            >
              <div style={{
                width:`${(min/93)*100}%`, height:"100%",
                background:"#16a34a", borderRadius:"3px",
                transition:"width 0.3s",
              }}/>
              {/* Marqueurs d'événements sur la barre */}
              {timelineEvents.map(e => (
                <div key={e.minute} style={{
                  position:"absolute", top:"-4px",
                  left:`${(e.minute/93)*100}%`,
                  width:"3px", height:"14px", borderRadius:"1.5px",
                  background: e.type==="goal"
                    ? (e.team==="me"||e.team==="sen" ? "#4ade80" : "#f87171")
                    : "#f59e0b",
                  transform:"translateX(-50%)",
                }}/>
              ))}
            </div>
          </div>

          {/* Formation */}
          <div>
            <div style={{ fontSize:"9px", color:"#64748b", letterSpacing:"1px", marginBottom:"6px" }}>
              SYSTÈME SÉNÉGALAIS
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"6px" }}>
              {["4-3-3","4-2-3-1","4-4-2","5-3-2"].map(f => (
                <button key={f} onClick={() => onFormationChange?.(f)} style={{
                  padding:"6px 0", fontSize:"11px", fontWeight:700,
                  borderRadius:"6px", cursor:"pointer", transition:"all 0.15s",
                  border: formation === f ? "1px solid #22c55e" : "1px solid rgba(51,65,85,0.5)",
                  background: formation === f ? "rgba(34,197,94,0.15)" : "rgba(30,41,59,0.6)",
                  color: formation === f ? "#4ade80" : "#94a3b8",
                }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Accès rapide aux temps forts */}
          <div>
            <div style={{ fontSize:"9px", color:"#64748b", letterSpacing:"1px", marginBottom:"6px" }}>
              TEMPS FORTS
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"5px" }}>
              {timelineEvents.map(e => (
                <button key={e.minute} onClick={() => jumpTo(e.minute)} style={{
                  padding:"5px 6px", fontSize:"10px", fontWeight:600,
                  borderRadius:"6px", cursor:"pointer", transition:"all 0.15s",
                  textAlign:"left", overflow:"hidden",
                  border: min === e.minute
                    ? (e.type==="goal"
                        ? (e.team==="me"||e.team==="sen" ? "1px solid #4ade80" : "1px solid #f87171")
                        : "1px solid #f59e0b")
                    : "1px solid rgba(51,65,85,0.4)",
                  background: min === e.minute
                    ? (e.type==="goal"
                        ? (e.team==="me"||e.team==="sen" ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)")
                        : "rgba(245,158,11,0.1)")
                    : "rgba(15,23,42,0.6)",
                  color: min === e.minute
                    ? (e.type==="goal"
                        ? (e.team==="me"||e.team==="sen" ? "#4ade80" : "#f87171")
                        : "#f59e0b")
                    : "#64748b",
                }}>
                  {e.minute}'{" "}
                  {e.type==="goal" ? "⚽" : e.type==="save" ? "🧤" : e.type==="corner" ? "🚩" : e.type==="shot" ? "🎯" : e.type==="sub" ? "🔄" : "▸"}
                  {" "}{e.player || (e.type==="goal" ? "But" : "Jeu")}
                </button>
              ))}
            </div>
          </div>

          {/* Narration de l'événement actif */}
          {lastEvent?.desc && (
            <div style={{
              padding:"8px 10px",
              background:"rgba(2,6,23,0.8)",
              borderRadius:"8px",
              borderLeft:`3px solid ${
                lastEvent.type==="goal"
                  ? (lastEvent.team==="me"||lastEvent.team==="sen" ? "#4ade80" : "#f87171")
                  : "#f59e0b"
              }`,
              fontSize:"11px", color:"#cbd5e1", lineHeight:"1.5",
            }}>
              <span style={{ color:"#94a3b8", fontFamily:"monospace", marginRight:"6px", fontWeight:700 }}>
                {lastEvent.minute}'
              </span>
              <span style={{
                color: lastEvent.type==="goal"
                  ? (lastEvent.team==="me"||lastEvent.team==="sen" ? "#4ade80" : "#f87171")
                  : "#e2e8f0",
                fontStyle: lastEvent.type==="text" ? "italic" : "normal",
              }}>
                {lastEvent.desc}
              </span>
            </div>
          )}

          {/* Bouton fermer */}
          <button onClick={onClose} style={{
            width:"100%", padding:"10px",
            borderRadius:"8px", border:"1px solid rgba(51,65,85,0.5)",
            background:"rgba(30,41,59,0.6)",
            color:"#94a3b8", cursor:"pointer",
            fontSize:"12px", fontWeight:600,
          }}>
            ← Retour à la simulation
          </button>

        </div>
      </div>
    </div>
  );
}
