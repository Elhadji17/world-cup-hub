import { StrictMode }        from 'react'
import { createRoot }        from 'react-dom/client'
import './index.css'
import App                   from './App.jsx'
import { AuthProvider }      from './hooks/useAuth.js'
import { GameStatsProvider } from './hooks/useGameStats.js'
import { registerSW }        from "virtual:pwa-register";

registerSW();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <GameStatsProvider>
        <App />
      </GameStatsProvider>
    </AuthProvider>
  </StrictMode>,
)
