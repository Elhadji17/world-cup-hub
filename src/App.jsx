import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Predictions from "./pages/Predictions";
import Matches from "./pages/Matches";
import Navbar from "./components/Navbar";
import LeaderboardPage from "./pages/Leaderboard";
import Admin from "./pages/Admin";
import Share from "./pages/Share";
import ResetPassword from "./pages/ResetPassword";
import Cards from "./pages/Cards";
import QuizHub  from "./pages/QuizHub";
import QuizPlayers from "./pages/QuizPlayers";
import Shop           from "./pages/Shop";
import Profile from "./pages/Profile";





function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div className="pb-16 md:pb-0">  {/* ← ajoute ce div */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

        <Route
          path="/"
          element={
            <PageWrapper>
              <Home />
            </PageWrapper>
          }
        />

        <Route path="/quiz" element={<PageWrapper><QuizHub /></PageWrapper>} />
        <Route path="/quiz/players" element={<PageWrapper><QuizPlayers /></PageWrapper>} />
        <Route path="/quiz/:categoryId" element={<PageWrapper><Quiz /></PageWrapper>} />

        <Route
          path="/predictions"
          element={
            <PageWrapper>
              <Predictions />
            </PageWrapper>
          }
        />

        <Route
          path="/matches"
          element={
            <PageWrapper>
              <Matches />
            </PageWrapper>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <PageWrapper>
              <LeaderboardPage />
            </PageWrapper>
          }
        />
        <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
        <Route path="/share" element={<PageWrapper><Share /></PageWrapper>} />
        <Route path="/reset-password" element={<PageWrapper><ResetPassword /></PageWrapper>} />
        <Route path="/shop"            element={<PageWrapper><Shop /></PageWrapper>} />
        <Route path="/cards" element={<PageWrapper><Cards /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
        
        
        

      </Routes>
      </AnimatePresence>
    </div>
  );
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}