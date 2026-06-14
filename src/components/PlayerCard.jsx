import React from 'react';

const PlayerCard = ({ player }) => {
  const rarityStyles = {
    Commun: { border: 'border-slate-500', shadow: 'shadow-md', bgEffect: 'bg-slate-900', text: 'text-slate-400' },
    Rare: { border: 'border-blue-500', shadow: 'shadow-blue-500/30 shadow-lg', bgEffect: 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900', text: 'text-blue-400' },
    Épique: { border: 'border-purple-500', shadow: 'shadow-purple-500/40 shadow-xl', bgEffect: 'bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900', text: 'text-purple-400' },
    Légendaire: { border: 'border-amber-400', shadow: 'shadow-amber-500/50 shadow-2xl', bgEffect: 'bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900', text: 'text-amber-400' }
  };

  const styleIcons = { Physique: '⚡', Technique: '🎯', Tactique: '🧠' };
  const style = rarityStyles[player.rarity] || rarityStyles.Commun;

  return (
    <div className={`w-[230px] h-[330px] rounded-2xl border-2 ${style.border} ${style.bgEffect} ${style.shadow} flex flex-col justify-between p-3 select-none overflow-hidden text-white transition-all duration-300 hover:scale-105`}>
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col items-center leading-none">
          <span className="text-[10px] uppercase font-bold text-slate-400">{player.position.substring(0, 3)}.</span>
          <span className={`text-xl font-black ${style.text}`}>{player.rating}</span>
        </div>
        <div className="text-xl filter drop-shadow-md">{player.flag}</div>
      </div>

      {/* AVATAR (MIS À JOUR AVEC UNE VRAIE IMAGE) */}
      <div className="relative w-full h-[150px] flex items-center justify-center my-1">
        <div className="absolute w-[110px] h-[110px] rounded-full bg-slate-800/40 blur-sm border border-white/5" />
        <img 
          src={player.imageUrl} 
          alt={player.name} 
          className="h-full object-contain z-10 filter drop-shadow-[0_8px_8px_rgba(0,0,0,0.5)] transition-transform duration-300"
          onError={(e) => { 
            // Si l'image d'un autre joueur n'existe pas encore, on remet le petit bonhomme de secours
            e.target.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.className = 'text-4xl filter drop-shadow-md z-10';
            fallback.innerText = '🏃‍♂️';
            e.target.parentNode.appendChild(fallback);
          }}
        />
      </div>

      {/* IDENTITÉ */}
      <div className="text-center">
        <h3 className="text-sm font-black tracking-wider uppercase truncate max-w-full">
          {player.name}
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
          {player.nation}
        </span>
      </div>

      {/* STATS */}
      <div className="border-t border-white/10 pt-2 flex justify-between items-center px-2 bg-black/20 rounded-lg p-1.5 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <span className="text-[9px] text-slate-400 uppercase font-medium">ATT</span>
          <span className="text-base font-extrabold text-emerald-400">{player.final_att}</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-slate-800/80 w-7 h-7 rounded-full border border-white/10">
          <span className="text-sm">{styleIcons[player.type]}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[9px] text-slate-400 uppercase font-medium">DEF</span>
          <span className="text-base font-extrabold text-rose-400">{player.final_def}</span>
        </div>
      </div>

    </div>
  );
};

export default PlayerCard;