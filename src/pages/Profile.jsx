// Exemple dans ton fichier de page (ex: frontend/src/pages/Profile.jsx)
import CardComponent from '../components/CardComponent';

const testPlayer = {
  name: "Kylian Mbappé",
  nation: "France",
  flag: "🇫🇷",
  position: "Attaquant",
  rarity: "Légendaire", // Teste aussi 'Commun', 'Rare', 'Épique'
  rating: 99,
  final_att: 98,
  final_def: 36,
  type: "Technique",
  imageUrl: "https://via.placeholder.com/150/1e293b/ffffff?text=MBAPPE" // Fallback temporaire
};

export default function ProfilePage() {
  return (
    <div className="p-6 bg-slate-950 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">Mon Profil</h1>
      
      {/* BLOC DE TEST TEMPORAIRE */}
      <div className="mb-8 p-4 bg-slate-900 rounded-xl border border-white/5 flex flex-col items-center">
        <h2 className="text-sm uppercase tracking-wider text-amber-400 mb-4">🧪 Test Visuel Carte</h2>
        <CardComponent player={testPlayer} />
      </div>

      {/* Le reste de ton code de profil actuel... */}
    </div>
  );
}