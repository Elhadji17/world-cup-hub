import { StrictMode }        from 'react'
import { createRoot }        from 'react-dom/client'
import './index.css'
import App                   from './App.jsx'
import { AuthProvider }      from './hooks/useAuth.js'
import { GameStatsProvider } from './hooks/useGameStats.jsx'
import { registerSW }        from "virtual:pwa-register";
import { Analytics } from "@vercel/analytics/react";

registerSW();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <GameStatsProvider>
        <App />
        <Analytics />  {/* ← ajoute ici */}
      </GameStatsProvider>
    </AuthProvider>
  </StrictMode>,
)