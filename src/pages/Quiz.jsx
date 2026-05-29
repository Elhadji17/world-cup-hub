import { useState } from "react";
import questions from "../data/questions.json";

function Quiz() {

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [playerName, setPlayerName] = useState(
  localStorage.getItem("playerName") || ""
  );

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


  function handleAnswer(option) {

    if (option === question.answer) {
      setScore(score + 1);
    }

    const next = current + 1;

    if (next < questions.length) {
      setCurrent(next);
    } else {
        const finalScore =
        option === question.answer
            ? score + 1
            : score;

        const bestScore =
        localStorage.getItem("bestScore") || 0;

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

        setFinished(true);
    }
  }

  if (finished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">

        <h1 className="text-5xl font-bold mb-6 text-center">
        🎉 Bravo {localStorage.getItem("playerName")}
        </h1>

        <p className="text-3xl">
          Score : {score} / {questions.length}
        </p>
        <p className="mt-4 text-xl text-green-400">
        Meilleur score :
        {localStorage.getItem("bestScore")}
        <div className="mt-8 w-full max-w-md">

        <h2 className="text-2xl font-bold mb-4 text-yellow-400">
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

                <span>
                {player.score}
                </span>
            </div>

            )
        )}

        </div>        
        
        </p>        
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

        <button
          onClick={() => {
            setCurrent(0);
            setScore(0);
            setFinished(false);
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

      {/* QUESTION */}
      <h2 className="text-3xl mb-10 text-center">
        {question.question}
      </h2>

      {/* OPTIONS */}
      <div className="grid gap-4 w-full max-w-md">

        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            className="bg-green-600 hover:bg-green-700 transition p-4 rounded-xl text-xl"
          >
            {option}
          </button>
        ))}

      </div>

      {/* SCORE */}
      <div className="mt-10 text-gray-300">
        Question {current + 1} / {questions.length}
      </div>

    </div>
  );
}

export default Quiz;