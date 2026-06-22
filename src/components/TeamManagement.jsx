// src/components/TeamManagement.jsx
import React, { useState } from "react";
import { getPlayerLiveRating } from "../utils/tacticalEngine";

export default function TeamManagement({ titulars, bench, formation, onSubstitute, onChangeFormation }) {
  const [selectedTitular, setSelectedTitular] = useState(null);

  const formationsDisponibles = ["4-3-3", "4-4-2", "5-3-2", "4-2-3-1"];

  return (
    <div className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-xl mb-6">
      
      {/* 1. SÉLECTEUR DE FORMATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">Tactique du Sénégal</h3>
          <p className="text-xs text-slate-400">Sélectionnez le schéma de Pape Thiaw</p>
        </div>
        <div className="flex gap-2">
          {formationsDisponibles.map((f) => (
            <button
              key={f}
              onClick={() => onChangeFormation(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                formation === f
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* 2. LISTE DES TITULAIRES & LOGIQUE DE REMPLACEMENT */}
      <div className="mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          {selectedTitular ? "👉 Sélectionnez le remplaçant ci-dessous pour :" : "11 de Départ (Cliquez pour remplacer)"}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {titulars.map((player) => {
            const liveRating = getPlayerLiveRating(player);
            const isSelected = selectedTitular?.id === player.id;

            return (
              <button
                key={player.id}
                onClick={() => setSelectedTitular(isSelected ? null : player)}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500 shadow-md"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-xs font-bold">
                    {player.number}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-200">{player.name}</p>
                    <p className="text-[10px] font-mono text-slate-400">{player.position} • Cond: {player.condition}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400">{liveRating}</span>
                  <p className="text-[9px] text-slate-500">Note Live</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. LE BANC DE TOUCHE (S'affiche ou s'active pour le remplacement) */}
      {selectedTitular && (
        <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 animate-pulse-subtle">
          <div className="flex justify-between items-center mb-2">
            <h5 className="text-xs font-bold text-amber-400">Faire entrer à la place de {selectedTitular.name} :</h5>
            <button 
              onClick={() => setSelectedTitular(null)}
              className="text-[10px] text-slate-400 hover:text-white underline"
            >
              Annuler
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {bench.map((sub) => {
              const liveRating = getPlayerLiveRating(sub);
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    onSubstitute(selectedTitular.id, sub);
                    setSelectedTitular(null); // Réinitialise après le changement
                  }}
                  className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-lg text-left transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                      {sub.position}
                    </span>
                    <span className="text-xs font-medium text-slate-300">{sub.name}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400 font-bold">{liveRating}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}