function Matches() {

  const matches = [
    {
      teamA: "France",
      teamB: "Brésil",
      date: "11 Juin",
      time: "20:00"
    },
    {
      teamA: "Argentine",
      teamB: "Espagne",
      date: "12 Juin",
      time: "18:00"
    },
    {
      teamA: "Allemagne",
      teamB: "Portugal",
      date: "13 Juin",
      time: "21:00"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

      {/* TITLE */}
      <h1 className="text-4xl font-bold mb-10 text-center">
        📅 Match Center
      </h1>

      {/* LIST */}
      <div className="grid gap-6 max-w-2xl mx-auto">

        {matches.map((match, index) => (
          <div
            key={index}
            className="bg-gray-800 p-6 rounded-2xl shadow-lg"
          >

            {/* TEAMS */}
            <h2 className="text-2xl font-bold text-center mb-3">
              {match.teamA} vs {match.teamB}
            </h2>

            {/* DATE */}
            <p className="text-center text-gray-300">
              📅 {match.date}
            </p>

            {/* TIME */}
            <p className="text-center text-gray-300">
              ⏰ {match.time}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Matches;
