import Footer from './Footer';
import Nav from './Nav';
import { Heart, X, Star } from 'lucide-react';
import { useState } from 'react';

// function Home() {
// 	return (
// 		<div>
// 			<Nav />
// 			<h1>Home</h1>
// 			<Footer />
// 		</div>
// 	)
// }

// export default Homeimport React, { useState } from 'react';

// Type pour le profil utilisateur
interface UserProfile {
  id: number;
  name: string;
  age: number;
  location: string;
  bio: string;
  interests: string[];
  imageUrl: string;
}

// Composant principal de la page d'accueil
const Home: React.FC = () => {
  // Données d'exemple de profils d'utilisateurs
  const sampleProfiles: UserProfile[] = [
    {
      id: 1,
      name: 'Sophie',
      age: 28,
      location: 'Paris',
      bio: `'Après avoir été recruté par une école américaine pour poursuivre mes études et jouer au football avant d'éventuelles détections pour jouer en professionnel, je me suis envolé vers la Californie en janvier 2021 avec pour objectif de réaliser mes rêves, devenir footballeur. À travers cette aventure, j'ai pu apprendre énormément de choses, comme me débrouiller tout seul sans ma famille à mes côtés pour m'épauler et améliorer mon anglais.
J'ai pris énormément de plaisir à jouer au football là-bas, surtout avec un soleil quotidien que je n'avais pas l'habitude d'avoir, moi qui ai passé ma vie à jouer dans le froid parisien. Malheureusement pour moi, un jour, en plein entraînement, j'ai commencé à sentir une douleur au niveau de mes mollets. Jamais je n'aurais pu imaginer que cette blessure me forcerait à rentrer, mais force était de constater que je n'avais pas le choix. En rentrant en France, j'ai parlé avec mon frère pour lui faire savoir que je souhaitais continuer mes études en programmation informatique que j'avais commencées aux États-Unis. C'est à ce moment-là qu'il m'a convaincu de faire l'école 42 que lui était en train de faire'`,
      interests: ['Voyage', 'Photographie', 'Cuisine', 'Yoga'],
      imageUrl: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/a3725331dd734ee68547afc30097f500_9366/Pantalon_de_survetement_Adicolor_Classics_SST_Rouge_IM4543_23_hover_model.jpg'
    },
    {
      id: 2,
      name: 'Thomas',
      age: 32,
      location: 'Lyon',
      bio: 'Sportif et entrepreneur. Je cherche quelqu\'un avec qui partager mes aventures.',
      interests: ['Sport', 'Business', 'Randonnée', 'Cinéma'],
      imageUrl: 'https://placehold.co/400x400/png'
    },
    {
      id: 3,
      name: 'Emma',
      age: 26,
      location: 'Bordeaux',
      bio: 'Artiste dans l\'âme, j\'aime peindre et jouer de la musique. À la recherche d\'une âme créative.',
      interests: ['Art', 'Musique', 'Théâtre', 'Lecture'],
      imageUrl: 'https://placehold.co/400x400/png'
    }
  ];

  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [direction, setDirection] = useState<'none' | 'left' | 'right' | 'up'>('none');
  const [profiles, setProfiles] = useState(sampleProfiles);

  // Gestion du swipe
  const handleSwipe = (dir: 'left' | 'right' | 'up') => {
    setDirection(dir);
    
    // Animation timeout
    setTimeout(() => {
      if (currentProfileIndex < profiles.length - 1) {
        setCurrentProfileIndex(prevIndex => prevIndex + 1);
      } else {
        // Recharge les profils quand on a atteint la fin
        setCurrentProfileIndex(0);
      }
      setDirection('none');
    }, 300);
  };

  // Profil actuel
  const currentProfile = profiles[currentProfileIndex];

  return (
    <div className="from-pink-50 to-purple-100 flex flex-col items-center justify-between w-screen h-screen" >
      <Nav />
	  {/* Slogan */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-purple-800">Trouvez l'amour en un swipe</h1>
      </div>

      {/* Carte de profil */}
      <div 
        className={`relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 ease-out
          ${direction === 'left' ? 'translate-x-full opacity-0' : 
            direction === 'right' ? '-translate-x-full opacity-0' : 
            direction === 'up' ? 'translate-y-full opacity-0' : 'translate-x-0 opacity-100'}`}
      >
        {/* Image de profil */}
        <div className="relative h-80 w-full">
          <img 
            src={currentProfile.imageUrl} 
            alt={`Photo de ${currentProfile.name}`} 
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
            <h2 className="text-2xl font-bold">{currentProfile.name}, {currentProfile.age}</h2>
            <p className="flex items-center gap-1">
              <span>📍</span>{currentProfile.location}
            </p>
          </div>
        </div>

        {/* Infos du profil */}
        <div className="p-4">
          <p className="mb-3 text-gray-700">{currentProfile.bio}</p>
          <h3 className="font-semibold mb-2 text-purple-800">Centres d'intérêt</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {currentProfile.interests.map((interest, index) => (
              <span 
                key={index} 
                className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="px-4 pb-6 flex justify-center gap-6 items-center">
          <button 
            onClick={() => handleSwipe('left')}
            className="bg-white rounded-full p-4 shadow-lg text-red-500 hover:bg-red-50 transition-colors"
          >
            <X size={32} />
          </button>
          <button 
            onClick={() => handleSwipe('up')}
            className="bg-white rounded-full p-4 shadow-lg text-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Star size={32} />
          </button>
          <button 
            onClick={() => handleSwipe('right')}
            className="bg-white rounded-full p-4 shadow-lg text-green-500 hover:bg-green-50 transition-colors"
          >
            <Heart size={32} />
          </button>
        </div>
      </div>

      {/* Compteur de profils
      <div className="mt-6 text-purple-700">
        Profil {currentProfileIndex + 1} sur {profiles.length}
      </div> */}

      {/* Section supplémentaire d'inscription
      <div className="mt-16 text-center bg-white p-8 rounded-xl shadow-lg max-w-xl">
        <h2 className="text-3xl font-bold text-purple-800 mb-4">Prêt(e) à trouver l'amour?</h2>
        <p className="text-gray-700 mb-6">Rejoignez notre communauté et commencez votre aventure amoureuse dès maintenant.</p>
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-colors text-lg">
          S'inscrire gratuitement
        </button>
      </div> */}
	  <Footer />
    </div>
  );
};

export default Home;