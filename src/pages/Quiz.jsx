import { useState } from "react";
import questions from "../data/questions.json";

function Quiz() {

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[current];

  function handleAnswer(option) {

    if (option === question.answer) {
      setScore(score + 1);
    }

    const next = current + 1;

    if (next < questions.length) {
      setCurrent(next);
    } else {
      setFinished(true);
    }
  }

  if (finished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">

        <h1 className="text-5xl font-bold mb-6">
          🎉 Quiz terminé
        </h1>

        <p className="text-3xl">
          Score : {score} / {questions.length}
        </p>

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