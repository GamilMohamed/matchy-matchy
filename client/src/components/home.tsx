import React, { useState, useEffect } from 'react';
import Footer from './Footer';
import Nav from './Nav';
import { Heart, X, Star, MapPin, Filter } from 'lucide-react';

// User profile type with additional fields for matching
interface UserProfile {
  id: number;
  name: string;
  age: number;
  location: string;
  latitude?: number;
  longitude?: number;
  bio: string;
  interests: string[];
  imageUrl: string;
  gender: string;
  sexualPreference: string[];
  maxDistance?: number;
  ageRange?: { min: number; max: number };
}

// Current user (logged in user)
interface CurrentUser extends UserProfile {
  maxDistance: number;
  ageRange: { min: number; max: number };
}

// Filter data to send to backend
interface FilterData {
  userId: number;
  maxDistance: number;
  ageRange: { min: number; max: number };
  interests: string[];
  gender?: string;
  sexualPreference?: string[];
}

const Home: React.FC = () => {
  // Sample current user
  const currentUser: CurrentUser = {
    id: 0,
    name: 'You',
    age: 30,
    location: 'Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    bio: 'Looking for meaningful connections',
    interests: ['Voyage', 'Cinéma', 'Cuisine', 'Art'],
    imageUrl: 'https://placehold.co/400x400/png',
    gender: 'non-binary',
    sexualPreference: ['male', 'female', 'non-binary'],
    maxDistance: 50, // km
    ageRange: { min: 25, max: 40 }
  };

  // Sample profiles database
  const allProfiles: UserProfile[] = [
    {
      id: 1,
      name: 'Sophie',
      age: 28,
      location: 'Paris',
      latitude: 48.8566, 
      longitude: 2.3522,
      bio: `Après avoir été recruté par une école américaine pour poursuivre mes études et jouer au football avant d'éventuelles détections pour jouer en professionnel, je me suis envolé vers la Californie en janvier 2021 avec pour objectif de réaliser mes rêves, devenir footballeur. À travers cette aventure, j'ai pu apprendre énormément de choses, comme me débrouiller tout seul sans ma famille à mes côtés pour m'épauler et améliorer mon anglais.
J'ai pris énormément de plaisir à jouer au football là-bas, surtout avec un soleil quotidien que je n'avais pas l'habitude d'avoir, moi qui ai passé ma vie à jouer dans le froid parisien. Malheureusement pour moi, un jour, en plein entraînement, j'ai commencé à sentir une douleur au niveau de mes mollets. Jamais je n'aurais pu imaginer que cette blessure me forcerait à rentrer, mais force était de constater que je n'avais pas le choix. En rentrant en France, j'ai parlé avec mon frère pour lui faire savoir que je souhaitais continuer mes études en programmation informatique que j'avais commencées aux États-Unis. C'est à ce moment-là qu'il m'a convaincu de faire l'école 42 que lui était en train de faire'`,
      interests: ['Voyage', 'Photographie', 'Cuisine', 'Yoga'],
      imageUrl: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/a3725331dd734ee68547afc30097f500_9366/Pantalon_de_survetement_Adicolor_Classics_SST_Rouge_IM4543_23_hover_model.jpg',
      gender: 'female',
      sexualPreference: ['male', 'non-binary']
    },
    {
      id: 2,
      name: 'Thomas',
      age: 32,
      location: 'Lyon',
      latitude: 45.7640,
      longitude: 4.8357,
      bio: 'Sportif et entrepreneur. Je cherche quelqu\'un avec qui partager mes aventures.',
      interests: ['Sport', 'Business', 'Randonnée', 'Cinéma'],
      imageUrl: 'https://placehold.co/400x400/png',
      gender: 'male',
      sexualPreference: ['female']
    },
    {
      id: 3,
      name: 'Emma',
      age: 26,
      location: 'Bordeaux',
      latitude: 44.8378,
      longitude: -0.5792,
      bio: 'Artiste dans l\'âme, j\'aime peindre et jouer de la musique. À la recherche d\'une âme créative.',
      interests: ['Art', 'Musique', 'Théâtre', 'Lecture'],
      imageUrl: 'https://placehold.co/400x400/png',
      gender: 'female',
      sexualPreference: ['female', 'non-binary']
    },
    {
      id: 4,
      name: 'Jean',
      age: 35,
      location: 'Marseille',
      latitude: 43.2965,
      longitude: 5.3698,
      bio: 'Passionné de sports nautiques et de cuisine méditerranéenne.',
      interests: ['Plongée', 'Cuisine', 'Voile', 'Photographie'],
      imageUrl: 'https://placehold.co/400x400/png',
      gender: 'male',
      sexualPreference: ['male', 'non-binary']
    },
    {
      id: 5,
      name: 'Alex',
      age: 29,
      location: 'Nice',
      latitude: 43.7102,
      longitude: 7.2620,
      bio: 'Non-binaire, passionné(e) de technologie et d\'arts numériques.',
      interests: ['Tech', 'Art numérique', 'Jeux vidéo', 'Voyage'],
      imageUrl: 'https://placehold.co/400x400/png',
      gender: 'non-binary',
      sexualPreference: ['female', 'male', 'non-binary']
    }
  ];

  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [direction, setDirection] = useState<'none' | 'left' | 'right' | 'up'>('none');
  const [matchedProfiles, setMatchedProfiles] = useState<UserProfile[]>([]);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  
  // This new state will hold all filter data in a format ready to send to backend
  const [filterData, setFilterData] = useState<FilterData>({
    userId: currentUser.id,
    maxDistance: currentUser.maxDistance,
    ageRange: currentUser.ageRange,
    interests: [],
    gender: currentUser.gender,
    sexualPreference: currentUser.sexualPreference
  });

  // Local filter state for UI display
  const [filters, setFilters] = useState({
    maxDistance: currentUser.maxDistance,
    ageRange: currentUser.ageRange,
    interests: [] as string[]
  });

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate common interests score (percentage of matched interests)
  const calculateCommonInterestsScore = (profile1: UserProfile, profile2: UserProfile): number => {
    const commonInterests = profile1.interests.filter(interest => 
      profile2.interests.includes(interest)
    );
    return (commonInterests.length / profile1.interests.length) * 100;
  };

  // Check if two profiles match based on sexual preference
  const checkSexualPreferenceMatch = (profile1: UserProfile, profile2: UserProfile): boolean => {
    return (
      profile1.sexualPreference.includes(profile2.gender) &&
      profile2.sexualPreference.includes(profile1.gender)
    );
  };

  // Apply all matching criteria to generate suggested profiles
  const findMatches = () => {
    const matches = allProfiles.filter(profile => {
      // Don't include current user in matches
      if (profile.id === currentUser.id) return false;

      // Check mutual sexual preference match
      const preferenceMatch = checkSexualPreferenceMatch(currentUser, profile);
      if (!preferenceMatch) return false;

      // Check distance if coordinates are available
      if (currentUser.latitude && currentUser.longitude && 
          profile.latitude && profile.longitude) {
        const distance = calculateDistance(
          currentUser.latitude, currentUser.longitude,
          profile.latitude, profile.longitude
        );
        if (distance > filters.maxDistance) return false;
      }

      // Check age range
      if (profile.age < filters.ageRange.min || profile.age > filters.ageRange.max) return false;

      // Check interest filters if any are selected
      if (filters.interests.length > 0) {
        const hasMatchingInterests = profile.interests.some(interest => 
          filters.interests.includes(interest)
        );
        if (!hasMatchingInterests) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort by common interests score (higher is better)
      const scoreA = calculateCommonInterestsScore(currentUser, a);
      const scoreB = calculateCommonInterestsScore(currentUser, b);
      return scoreB - scoreA;
    });

    return matches;
  };

  // Update matches when filters change
  useEffect(() => {
    const newMatches = findMatches();
    setMatchedProfiles(newMatches);
    setCurrentProfileIndex(0);
  }, [filters]);

  // Initialize matches on component mount
  useEffect(() => {
    setMatchedProfiles(findMatches());
  }, []);

  // Handle swipe actions
  const handleSwipe = (dir: 'left' | 'right' | 'up') => {
    setDirection(dir);
    
    // Animation timeout
    setTimeout(() => {
      if (currentProfileIndex < matchedProfiles.length - 1) {
        setCurrentProfileIndex(prevIndex => prevIndex + 1);
      } else {
        // Reset to beginning when we reach the end
        setCurrentProfileIndex(0);
      }
      setDirection('none');
    }, 300);
  };

  // Update filters and prepare data for backend
  const handleFilterChange = (newFilters: typeof filters) => {
    // Update the local filter state
    setFilters(newFilters);
    
    // Update the backend-ready filter data
    setFilterData({
      ...filterData,
      maxDistance: newFilters.maxDistance,
      ageRange: newFilters.ageRange,
      interests: newFilters.interests
    });
    
    // Close the filter menu
    setIsFilterMenuOpen(false);
    
    // Here you could also send the updated filter data to the backend
  };
  
  // Send filter data to backend
  const handleSubmit = () => {
    // Prepare the data for sending to the backend
    
    // Here you would make your API call, for example:
    /*
    	JSON {
        maxDistance: filters.maxDistance,
        ageRange: filters.ageRange,
        interests: filters.interests,
        gender: currentUser.gender,
        sexualPreference: currentUser.sexualPreference
    	}
    	const json = JSON.stringify(newFilters);
    */
    const dataToSend = JSON.stringify(filterData);
    console.log('Sending filter data to backend:', dataToSend);
  };

  // Get current profile
  const currentProfile = matchedProfiles[currentProfileIndex];

  // Handle case when no matches are found
  if (matchedProfiles.length === 0) {
    return (
      <div className="from-pink-50 to-purple-100 flex flex-col items-center justify-between w-screen h-screen" >
        <Nav />
        <div className="text-center max-w-md px-4">
          <h1 className="text-4xl font-bold text-purple-800 mb-6">Aucun profil trouvé</h1>
          <p className="text-gray-700 mb-8">Essayez d'élargir vos critères de recherche pour découvrir plus de personnes.</p>
          <button 
            onClick={() => setIsFilterMenuOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-colors text-lg"
          >
            Modifier les filtres
          </button>
        </div>
        {/* Render filter menu here so it's available when no matches are found */}
        {isFilterMenuOpen && (
          <div className="absolute top-1/4 right-1/2 transform translate-x-1/2 bg-white p-4 rounded-xl shadow-lg z-20 w-80">
            <h3 className="font-bold text-purple-800 mb-3">Filtres</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance maximale: {filters.maxDistance} km
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="200"
                  value={filters.maxDistance}
                  onChange={(e) => setFilters({...filters, maxDistance: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Âge: {filters.ageRange.min} - {filters.ageRange.max} ans
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="18"
                    max={filters.ageRange.max}
                    value={filters.ageRange.min}
                    onChange={(e) => setFilters({
                      ...filters, 
                      ageRange: {...filters.ageRange, min: parseInt(e.target.value)}
                    })}
                    className="w-1/2 p-1 border rounded"
                  />
                  <input
                    type="number"
                    min={filters.ageRange.min}
                    max="100"
                    value={filters.ageRange.max}
                    onChange={(e) => setFilters({
                      ...filters, 
                      ageRange: {...filters.ageRange, max: parseInt(e.target.value)}
                    })}
                    className="w-1/2 p-1 border rounded"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Centres d'intérêt
                </label>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(allProfiles.flatMap(p => p.interests))).map((interest, idx) => (
                    <button
                      type="button" // Important: type="button" pour éviter la soumission du formulaire
                      key={idx}
                      onClick={() => {
                        if (filters.interests.includes(interest)) {
                          setFilters({
                            ...filters,
                            interests: filters.interests.filter(i => i !== interest)
                          });
                        } else {
                          setFilters({
                            ...filters,
                            interests: [...filters.interests, interest]
                          });
                        }
                      }}
                      className={`text-sm px-2 py-1 rounded-full ${
                        filters.interests.includes(interest)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button 
                  type="button" // Important: type="button" pour éviter la soumission du formulaire
                  onClick={() => setIsFilterMenuOpen(false)}
                  className="px-3 py-1 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Appliquer
                </button>
              </div>
            </form>
          </div>
        )}
        <Footer />
      </div>
    );
  }

  return (
    <div className="from-pink-50 to-purple-100 flex flex-col items-center justify-between w-screen h-screen" >
      <Nav />
      
      {/* Filter button */}
      <div className="absolute top-16 right-4 z-10">
        <button 
          onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
          className="bg-purple-600 text-white p-2 rounded-full shadow-lg"
        >
          <Filter size={24} />
        </button>
      </div>

      {/* Filter menu */}
      {isFilterMenuOpen && (
        <div className="absolute top-28 right-4 bg-white p-4 rounded-xl shadow-lg z-20 w-80">
          <h3 className="font-bold text-purple-800 mb-3">Filtres</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distance maximale: {filters.maxDistance} km
            </label>
            <input 
              type="range" 
              min="1" 
              max="200"
              value={filters.maxDistance}
              onChange={(e) => setFilters({...filters, maxDistance: parseInt(e.target.value)})}
              className="w-full"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Âge: {filters.ageRange.min} - {filters.ageRange.max} ans
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="18"
                max={filters.ageRange.max}
                value={filters.ageRange.min}
                onChange={(e) => setFilters({
                  ...filters, 
                  ageRange: {...filters.ageRange, min: parseInt(e.target.value)}
                })}
                className="w-1/2 p-1 border rounded"
              />
              <input
                type="number"
                min={filters.ageRange.min}
                max="100"
                value={filters.ageRange.max}
                onChange={(e) => setFilters({
                  ...filters, 
                  ageRange: {...filters.ageRange, max: parseInt(e.target.value)}
                })}
                className="w-1/2 p-1 border rounded"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Centres d'intérêt
            </label>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(allProfiles.flatMap(p => p.interests))).map((interest, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (filters.interests.includes(interest)) {
                      setFilters({
                        ...filters,
                        interests: filters.interests.filter(i => i !== interest)
                      });
                    } else {
                      setFilters({
                        ...filters,
                        interests: [...filters.interests, interest]
                      });
                    }
                  }}
                  className={`text-sm px-2 py-1 rounded-full ${
                    filters.interests.includes(interest)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <button 
              onClick={() => setIsFilterMenuOpen(false)}
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button 
              onClick={() => handleFilterChange(filters)}
              className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}

      {/* Slogan */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-purple-800">Trouvez l'amour en un swipe</h1>
      </div>

      {/* Matching stats */}
      <div className="text-sm text-purple-700 mb-2">
        {matchedProfiles.length} profil(s) correspondant à vos critères
      </div>

      {/* Profile card */}
      {currentProfile && (
        <div 
          className={`relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 ease-out
            ${direction === 'left' ? 'translate-x-full opacity-0' : 
              direction === 'right' ? '-translate-x-full opacity-0' : 
              direction === 'up' ? 'translate-y-full opacity-0' : 'translate-x-0 opacity-100'}`}
        >
          {/* Profile image */}
          <div className="relative h-80 w-full">
            <img 
              src={currentProfile.imageUrl} 
              alt={`Photo de ${currentProfile.name}`} 
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
              <h2 className="text-2xl font-bold">{currentProfile.name}, {currentProfile.age}</h2>
              <p className="flex items-center gap-1">
                <MapPin size={16} />
                {currentProfile.location}
                {currentUser.latitude && currentUser.longitude && 
                 currentProfile.latitude && currentProfile.longitude && (
                  <span className="text-sm ml-1">
                    ({Math.round(calculateDistance(
                      currentUser.latitude, currentUser.longitude,
                      currentProfile.latitude, currentProfile.longitude
                    ))} km)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Profile info */}
          <div className="p-4">
            <p className="mb-3 text-gray-700">{currentProfile.bio}</p>
            
            {/* Common interests section */}
            <div className="mb-3">
              <h3 className="font-semibold mb-1 text-purple-800">Points communs</h3>
              <div className="text-sm text-purple-700">
                <p>{calculateCommonInterestsScore(currentUser, currentProfile).toFixed(0)}% d'intérêts en commun</p>
              </div>
            </div>
            
            <h3 className="font-semibold mb-2 text-purple-800">Centres d'intérêt</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {currentProfile.interests.map((interest, index) => (
                <span 
                  key={index} 
                  className={`px-3 py-1 rounded-full text-sm ${
                    currentUser.interests.includes(interest)
                      ? 'bg-purple-200 text-purple-800 font-medium'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
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
      )}

      <Footer />
    </div>
  );
};

export default Home;