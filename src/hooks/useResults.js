// src/hooks/useResults.js
// Récupère les vrais scores depuis /api/results
// Met en cache 60 secondes

import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

export function useResults() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_() {
      try {
        const res  = await fetch(`${API}/api/results`);
        const data = await res.json();
        if (res.ok) setResults(data.results ?? {});
      } catch (err) {
        console.warn("[useResults]", err.message);
      } finally {
        setLoading(false);
      }
    }
    fetch_();
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetch_, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Récupérer le score d'un match
  const getResult = (matchId) => results[matchId] ?? null;

  return { results, loading, getResult };
}
