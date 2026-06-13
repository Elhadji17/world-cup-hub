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

function AnimatedRoutes() {
  const location = useLocation();

  return (
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

        <Route
          path="/quiz"
          element={
            <PageWrapper>
              <Quiz />
            </PageWrapper>
          }
        />

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

      </Routes>
    </AnimatePresence>
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