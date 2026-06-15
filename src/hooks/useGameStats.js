// src/hooks/useGameStats.js
// Context global GameStats — corrige React error #300

import {  
  createContext, 
  useContext, 
  useState,  
  useEffect, 
  useCallback, 
  useRef 
} from "react";

const API       = import.meta.env.VITE_API_URL ?? "";
const LOCAL_KEY = "wch_gamestats";
const MAX_LIVES     = 5;
const LIFE_REGEN_MS = 60 * 60 * 1000;

const DEFAULT = {  
  coins: 0, 
  lives: MAX_LIVES, 
  totalCoins: 0,  
  lastLifeAt: Date.now(), 
  freeHintsLeft: 0,
};

function load() { 
  try { 
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) ?? DEFAULT; 
  } catch { 
    return DEFAULT; 
  } 
}

function save(s) { 
  localStorage.setItem(LOCAL_KEY, JSON.stringify(s)); 
}

function getToken() { 
  return localStorage.getItem("wch_token"); 
}

const Ctx = createContext(null);

export function GameStatsProvider({ children }) {  
  const [stats, setStatsRaw] = useState(load);  
  const [loading, setLoading]  = useState(false);  
  const statsRef = useRef(stats);  

  // setStats met à jour le ref, le state et le localStorage  
  const setStats = useCallback((updater) => {    
    setStatsRaw(prev => {      
      const next = typeof updater === "function" ? updater(prev) : updater;      
      statsRef.current = next;      
      save(next);      
      return next;    
    });  
  }, []);  

  // Récupération des données depuis MongoDB  
  const refresh = useCallback(async () => {    
    const token = getToken();    
    if (!token) return;    
    try {      
      const res  = await fetch(`${API}/api/quiz?action=stats`, {        
        headers: { "Authorization": `Bearer ${token}` },      
      });      
      const data = await res.json();      
      if (data.coins != null) {        
        setStats({          
          coins:         data.coins,          
          lives:         data.lives,          
          totalCoins:    data.totalCoins,          
          lastLifeAt:    Date.now(),          
          freeHintsLeft: data.freeHintsLeft ?? 0,        
        });      
      }    
    } catch (err) {
      console.error("Erreur refresh stats:", err);
    }  
  }, [setStats]);  

  // Charger les données au montage du composant  
  useEffect(() => {    
    setLoading(true);    
    refresh().finally(() => setLoading(false));  
  }, [refresh]);  

  // Soumettre le résultat d'une partie de quiz  
  const submitResult = useCallback(async ({ correct, wrong, streak, fastAnswers = 0, livesUsed = 0 }) => {    
    const token = getToken();    
    const coinsEarned = (correct * 10) + (fastAnswers * 10) +      
      (streak >= 10 ? 80 : streak >= 5 ? 30 : 0);    
    
    // Mise à jour locale immédiate (optimiste)  
    setStats(prev => ({      
      ...prev,      
      coins:      prev.coins + coinsEarned,      
      totalCoins: prev.totalCoins + coinsEarned,      
      lives:      Math.max(0, prev.lives - livesUsed),      
      lastLifeAt: livesUsed > 0 ? Date.now() : prev.lastLifeAt,    
    }));    
    
    if (!token) return { coinsEarned };    
    
    // Synchronisation avec MongoDB en arrière-plan  
    try {      
      const res  = await fetch(`${API}/api/quiz?action=submit`, {        
        method:  "POST",        
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },        
        body:    JSON.stringify({ correct, wrong, streak, fastAnswers, livesUsed }),      
      });      
      const data = await res.json();      
      if (data.coins != null) {        
        setStats(prev => ({ ...prev, coins: data.coins, lives: data.lives }));        
        return { coinsEarned: data.coinsEarned ?? coinsEarned };      
      }    
    } catch (err) {
      console.error("Erreur submitResult:", err);
    }    
    return { coinsEarned };  
  }, [setStats]);  

  // Consommer une vie  
  const useLife = useCallback(() => {    
    setStats(prev => ({      
      ...prev,      
      lives:      Math.max(0, prev.lives - 1),      
      lastLifeAt: Date.now(),    
    }));  
  }, [setStats]);  

  // Acheter un objet dans la boutique (Shop)  
  const buyItem = useCallback(async (item) => {    
    const token = getToken();    
    if (!token) return { success: false, error: "Connecte-toi pour acheter." };    
    try {      
      const res  = await fetch(`${API}/api/quiz?action=shop`, {        
        method:  "POST",        
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },        
        body:    JSON.stringify({ item }),      
      });      
      const data = await res.json();      
      if (!res.ok) return { success: false, error: data.error };      
      setStats(prev => ({ ...prev, coins: data.coins, lives: data.lives }));      
      return { success: true, ...data };    
    } catch (err) {      
      return { success: false, error: err.message };    
    }  
  }, [setStats]);  

  const nextLifeIn = stats.lives >= MAX_LIVES ? null    
    : Math.max(0, LIFE_REGEN_MS - (Date.now() - (stats.lastLifeAt ?? Date.now())));  

  return (    
    <Ctx.Provider value={{      
      coins: stats.coins, 
      lives: stats.lives,      
      totalCoins: stats.totalCoins, 
      freeHintsLeft: stats.freeHintsLeft ?? 0,      
      nextLifeIn, 
      loading, 
      maxLives: MAX_LIVES,      
      submitResult, 
      useLife, 
      buyItem, 
      refresh,    
    }}>      
      {children}    
    </Ctx.Provider>  
  );
}

export function useGameStats() {  
  const ctx = useContext(Ctx);  
  if (!ctx) throw new Error("useGameStats doit être dans GameStatsProvider");  
  return ctx;
}