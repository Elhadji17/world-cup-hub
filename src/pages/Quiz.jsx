
import questions from "../data/questions.json";
import { useState, useEffect } from "react";

function Quiz() {

    const [current, setCurrent] = useState(0);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [playerName, setPlayerName] = useState(localStorage.getItem("playerName") || "");
    const [timeLeft, setTimeLeft] = useState(15);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [lives, setLives] = useState(3);
    const xp = score * 10;
    const level = Math.floor(xp / 100) + 1;
    const [ending, setEnding] = useState(false);
    

    function savePlayer() {
    if (playerName.trim() === "") return;

    localStorage.setItem("playerName", playerName);
    window.location.reload();
    }

    if (!localStorage.getItem("playerName")) {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">

        <h1 className="text-4xl font-bold mb-8">
            ⚽ Entre ton pseudo
        </h1>

        <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Ton pseudo"
        className="p-4 rounded-xl text-black w-full max-w-md bg-white"
        />

        <button
            onClick={savePlayer}
            className="mt-6 bg-green-600 px-6 py-3 rounded-xl font-bold"
        >
            Commencer
        </button>

        </div>
    );
    }

  const question = questions[current];
  useEffect(() => {
    if (finished || showResult) return;

    if (timeLeft === 0) {
        handleTimeout();
        return;
    }

    const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, showResult, finished]);

  useEffect(() => {
        if (lives <= 0 && !finished) {
            finishQuiz(score + (isCorrect ? 1 : 0));
        }
    }, [lives]);


  function handleAnswer(option) {
    if (showResult) return;

    const correct = option === question.answer;

    setSelectedAnswer(option);
    setIsCorrect(correct);

    if (correct) {
        setScore((prev) => prev + 1);
    }
    if (!correct) {
        setLives(prev => prev - 1);
    }

    setShowResult(true);

    setTimeout(() => {
        goToNextQuestion();
    }, 2000);
  }

  function handleTimeout() {
    if (showResult) return;
    setSelectedAnswer(null);
    setIsCorrect(false);
    setShowResult(true);

    setTimeout(() => {
        goToNextQuestion();
    }, 2000);
  }
  function goToNextQuestion() {
    const next = current + 1;

    if (next < questions.length) {
        setCurrent(next);
        setTimeLeft(15);
        setShowResult(false);
        setSelectedAnswer(null);
    } else {
        finishQuiz(score + (isCorrect ? 1 : 0));
    }
    }

    function getButtonClass(option) {
        if (!showResult) {
            return "bg-green-600 hover:bg-green-700";
        }

        if (option === question.answer) {
            return "bg-green-500";
        }

        if (option === selectedAnswer && option !== question.answer) {
            return "bg-red-500";
        }

        return "bg-gray-700";
    }

    function finishQuiz(finalScore = score) {
        if (ending) return;
        setEnding(true);

        const bestScore =
            Number(localStorage.getItem("bestScore")) || 0;

        if (finalScore > bestScore) {
            localStorage.setItem("bestScore", finalScore);
        }

        const leaderboard =
            JSON.parse(localStorage.getItem("leaderboard")) || [];

        leaderboard.push({
            name: localStorage.getItem("playerName"),
            score: finalScore
        });

        leaderboard.sort((a, b) => b.score - a.score);

        localStorage.setItem(
            "leaderboard",
            JSON.stringify(leaderboard.slice(0, 10))
        );

        const history =
            JSON.parse(localStorage.getItem("history")) || [];

        history.push({
            score: finalScore,
            total: questions.length,
            date: Date.now()
        });

        localStorage.setItem(
            "history",
            JSON.stringify(history)
        );

        setFinished(true);
    }

    if (finished) {
    const history =
        JSON.parse(localStorage.getItem("history")) || [];

    const gamesPlayed = history.length;

    const average =
        gamesPlayed === 0
        ? 0
        : (
            history.reduce((acc, game) => acc + game.score, 0) /
            gamesPlayed
            ).toFixed(1);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">

        <h1 className="text-5xl font-bold mb-6 text-center">
            🎉 Bravo {localStorage.getItem("playerName")}
        </h1>

        {/* SCORE */}
        <p className="text-3xl">
            Score : {score} / {questions.length}
        </p>

        {/* BEST SCORE */}
        <p className="mt-4 text-xl text-green-400">
            Meilleur score : {localStorage.getItem("bestScore")}
        </p>

        {/* 📊 STATS */}
        <div className="mt-6 text-center">
            <h2 className="text-2xl font-bold text-blue-400 mb-3">
            📊 Tes statistiques
            </h2>

            <p>Parties jouées : {gamesPlayed}</p>
            <p>
            Moyenne : {average} / {questions.length}
            </p>
        </div>

        {/* WHATSAPP */}
        <a
            href={`https://wa.me/?text=${encodeURIComponent(
            `🔥 J'ai obtenu ${score}/${questions.length} sur World Cup Hub ⚽`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
        >
            <button className="mt-6 bg-green-500 hover:bg-green-600 transition px-6 py-3 rounded-xl font-bold">
            Partager sur WhatsApp
            </button>
        </a>

        {/* LEADERBOARD */}
        <div className="mt-10 w-full max-w-md">

            <h2 className="text-2xl font-bold mb-4 text-yellow-400 text-center">
            🏆 Leaderboard
            </h2>

            {(JSON.parse(localStorage.getItem("leaderboard")) || []).map(
            (player, index) => (
                <div
                key={index}
                className="flex justify-between bg-gray-800 p-3 rounded-xl mb-2"
                >
                <span>
                    #{index + 1} {player.name}
                </span>

                <span>{player.score}</span>
                </div>
            )
            )}

        </div>

        {/* REPLAY */}
        <button
            
            onClick={() => {
                setCurrent(0);
                setScore(0);
                setFinished(false);
                setLives(3);
                setTimeLeft(15);
                setShowResult(false);
                setSelectedAnswer(null);
            }}
            className="mt-8 bg-green-600 px-6 py-3 rounded-xl"
        >
            Rejouer
        </button>

        </div>
    );
    }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">

    {/* Barre de progression */}
    <div className="w-full max-w-2xl mb-6">
    <div className="flex justify-between text-sm text-gray-300 mb-2">
        <span>Question {current + 1}</span>
        <span>{questions.length}</span>
    </div>

    <div className="w-full bg-gray-700 rounded-full h-3">

        <div
        className="bg-green-500 h-3 rounded-full transition-all duration-500"
        style={{
            width: `${((current + 1) / questions.length) * 100}%`
        }}
        />

    </div>

    {/* Affichage du chronomètre */}
    <div className="mb-6 text-center">

        <div className="text-4xl font-bold text-yellow-400">
            ⏱️ {timeLeft}s
        </div>

    </div>

    {/* Barre de temps dynamique */}
    <div className="w-64 bg-gray-700 h-2 rounded-full mx-auto mt-2">
        <div
            className="bg-yellow-400 h-2 rounded-full transition-all"
            style={{
                width: `${(timeLeft / 15) * 100}%`
            }}
        />
    </div>    
    
    {/* carte de progression */}
    <div className="flex gap-4 mb-8">

        <div className="bg-gray-800 px-4 py-2 rounded-xl">
            🎯 {score} points
        </div>

        <div className="bg-gray-800 px-4 py-2 rounded-xl">
            📈 {Math.round((current / questions.length) * 100)}%
        </div>

        </div>    

    {/* Ajouter des vies */}
    <div className="text-red-400 text-2xl">
        {"❤️".repeat(lives)}
        </div>

    <div className="bg-yellow-500 text-black px-4 py-2 rounded-xl">
        ⭐ XP : {xp}
        </div>

    <div className="bg-purple-600 px-4 py-2 rounded-xl">
        ⭐ Niveau {level}
    </div>        
    
    {/* Statistiques pendant la partie */}
    <div className="mb-8 flex gap-6">

        <div className="bg-gray-800 px-4 py-2 rounded-xl">
            🎯 Score : {score}
        </div>

        <div className="bg-gray-800 px-4 py-2 rounded-xl">
            ⚽ {Math.round(
            (score / Math.max(current, 1)) * 100
            ) || 0}%
        </div>

        </div>    

    </div>
      {/* QUESTION */}
      <h2 className="text-3xl mb-10 text-center">
        {question.question}
      </h2>

      {/* OPTIONS */}
      <div className="grid gap-4 w-full max-w-md">

        {question.options.map((option, index) => (
          <button
            disabled={showResult}
            key={index}
            onClick={() => handleAnswer(option)}
            className={`
                ${getButtonClass(option)}
                ${showResult ? "opacity-70" : ""}
                transition-all duration-300
                p-4 rounded-xl text-xl font-bold
                `}
          >
            {option}
          </button>
        ))}

      </div>

      {/* Réponse correcte ou non */}
      {showResult && (

        <div className="mt-8 text-center">

            {isCorrect ? (

            <div className="text-green-400 text-2xl font-bold">
                ✅ Bonne réponse !
            </div>

            ) : (

            <div>
                <div className="text-red-400 text-2xl font-bold">
                ❌ Mauvaise réponse
                </div>

                <div className="mt-2 text-yellow-400">
                Bonne réponse :
                {" "}
                {question.answer}
                </div>
            </div>

            )}

        </div>

        )}
      
      {/* SCORE */}
      <div className="mt-10 text-gray-300">
        Question {current + 1} / {questions.length}
      </div>

    </div>
  );
}

export default Quiz;