import { useState } from "react";

function Predictions() {

  const match = {
    teamA: "France",
    teamB: "Brésil"
  };

  const [choice, setChoice] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white flex flex-col items-center justify-center p-6">

      {/* TITLE */}
      <h1 className="text-4xl font-bold mb-10">
        🔮 Pronostics
      </h1>

      {/* MATCH CARD */}
      <div className="bg-white text-black p-8 rounded-3xl w-full max-w-md text-center">

        <h2 className="text-2xl font-bold mb-6">
          {match.teamA} vs {match.teamB}
        </h2>

        <p className="mb-6 text-gray-600">
          Qui va gagner ?
        </p>

        {/* OPTIONS */}
        <div className="grid gap-4">

          <button
            onClick={() => setChoice(match.teamA)}
            className={`p-4 rounded-xl font-bold transition ${
              choice === match.teamA ? "bg-green-600 text-white" : "bg-gray-200"
            }`}
          >
            {match.teamA}
          </button>

          <button
            onClick={() => setChoice("Draw")}
            className={`p-4 rounded-xl font-bold transition ${
              choice === "Draw" ? "bg-yellow-500 text-white" : "bg-gray-200"
            }`}
          >
            Match nul
          </button>

          <button
            onClick={() => setChoice(match.teamB)}
            className={`p-4 rounded-xl font-bold transition ${
              choice === match.teamB ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {match.teamB}
          </button>

        </div>

        {/* RESULT */}
        {choice && (
        <div className="mt-6">

            <div className="text-lg font-bold mb-4">
            Tu as choisi : {choice}
            </div>

        <a
        href={`https://wa.me/?text=${encodeURIComponent(
            `⚽ Mon pronostic : ${match.teamA} vs ${match.teamB} → ${choice} gagne sur World Cup Hub 🔥`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        >
        <button className="bg-green-500 hover:bg-green-600 transition px-6 py-3 rounded-xl font-bold text-white">
            Partager sur WhatsApp
        </button>
        </a>

        </div>
        )}

      </div>

    </div>
  );
}

export default Predictions;