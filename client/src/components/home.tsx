import React, { useState, useEffect } from 'react';
import Footer from './Footer';
import Nav from './Nav';
import { Heart, X, Star, MapPin, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MenuFilter from './MenuFilter'; // Import du composant MenuFilter

// Déplacer l'interface UserProfile dans un fichier types.ts serait idéal
// mais pour l'exemple, je la garde ici
export interface UserProfile {
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
  // Ajout de propriétés optionnelles pour les filtres actifs de l'interface
  activeFilters?: {
    interests: string[];
  };
}

const Home: React.FC = () => {
  // Données initiales de l'utilisateur actuel
  const navigate = useNavigate(); // Hook pour la navigation

  // Fonction pour gérer le clic sur le profil et rediriger vers la page utilisateur
  const handleProfileClick = (username: string) => {
    navigate(`/user/${username}`);
  };

  const initialUserProfile: UserProfile = {
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
    ageRange: { min: 25, max: 40 },
    activeFilters: {
      interests: [] // Intérêts sélectionnés pour le filtrage
    }
  };

  // Un seul état pour toutes les données utilisateur et préférences
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);

  // Sample profiles database
  const allProfiles: UserProfile[] = [
    {
      id: 1,
      name: 'Sophie',
      age: 28,
      location: 'Paris',
      latitude: 48.8566, 
      longitude: 2.3522,
      bio: '',
      interests: ['Voyage', 'Photographie', 'Cuisine', 'Yoga'],
      imageUrl: 'https://placehold.co/400x400/png',
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
      bio: 'Amoureuse de voyages et de photographie, je cherche quelqu\'un avec qui explorer le monde et partager de bons petits plats.',
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

  // Extraction de tous les intérêts uniques pour le menu de filtre
  const allUniqueInterests = Array.from(new Set(allProfiles.flatMap(p => p.interests)));

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
      if (profile.id === userProfile.id) return false;

      // Check mutual sexual preference match
      const preferenceMatch = checkSexualPreferenceMatch(userProfile, profile);
      if (!preferenceMatch) return false;

      // Check distance if coordinates are available
      if (userProfile.latitude && userProfile.longitude && 
          profile.latitude && profile.longitude && userProfile.maxDistance) {
        const distance = calculateDistance(
          userProfile.latitude, userProfile.longitude,
          profile.latitude, profile.longitude
        );
        if (distance > userProfile.maxDistance) return false;
      }

      // Check age range
      if (userProfile.ageRange && (profile.age < userProfile.ageRange.min || profile.age > userProfile.ageRange.max)) return false;

      // Check interest filters if any are selected
      if (userProfile.activeFilters?.interests.length) {
        const hasMatchingInterests = profile.interests.some(interest => 
          userProfile.activeFilters?.interests.includes(interest)
        );
        if (!hasMatchingInterests) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort by common interests score (higher is better)
      const scoreA = calculateCommonInterestsScore(userProfile, a);
      const scoreB = calculateCommonInterestsScore(userProfile, b);
      return scoreB - scoreA;
    });

    return matches;
  };

  // Update matches when filters change
  useEffect(() => {
    const newMatches = findMatches();
    setMatchedProfiles(newMatches);
    setCurrentProfileIndex(0);
  }, [userProfile]);

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
  
  // Fonctions pour les filtres - ces fonctions seront passées au composant MenuFilter
  const handleDistanceChange = (distance: number) => {
    setUserProfile(prev => ({
      ...prev,
      maxDistance: distance
    }));
  };
  
  const handleMinAgeChange = (minAge: number) => {
    setUserProfile(prev => ({
      ...prev,
      ageRange: {
        ...prev.ageRange!,
        min: minAge
      }
    }));
  };
  
  const handleMaxAgeChange = (maxAge: number) => {
    setUserProfile(prev => ({
      ...prev,
      ageRange: {
        ...prev.ageRange!,
        max: maxAge
      }
    }));
  };
  
  const handleInterestToggle = (interest: string) => {
    setUserProfile(prev => {
      const currentInterests = prev.activeFilters?.interests || [];
      const updatedInterests = currentInterests.includes(interest)
        ? currentInterests.filter(i => i !== interest)
        : [...currentInterests, interest];
        
      return {
        ...prev,
        activeFilters: {
          ...prev.activeFilters,
          interests: updatedInterests
        }
      };
    });
  };

// Appliquer tous les filtres
  const handleSubmitFilters = () => {
    // Mettre à jour l'API ou effectuer d'autres actions au besoin
    /*
        JSON {
          distance: userProfile.gender,
          age: ageRange: {
            min: userProfile.ageRange?.min,
            max: userProfile.ageRange?.max,
          },
          interests: userProfile.interests
        }
    const json = JSON.stringify(userProfile);
    */
    console.log('Sending updated user profile to backend:', JSON.stringify(userProfile));
    setIsFilterMenuOpen(false);
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

        {/* Utilisation du composant MenuFilter */}
        <MenuFilter 
          userProfile={userProfile}
          allInterests={allUniqueInterests}
          isOpen={isFilterMenuOpen}
          onClose={() => setIsFilterMenuOpen(false)}
          onDistanceChange={handleDistanceChange}
          onMinAgeChange={handleMinAgeChange}
          onMaxAgeChange={handleMaxAgeChange}
          onInterestToggle={handleInterestToggle}
          onSubmit={handleSubmitFilters}
        />
        
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

      {/* Utilisation du composant MenuFilter */}
      <MenuFilter 
        userProfile={userProfile}
        allInterests={allUniqueInterests}
        isOpen={isFilterMenuOpen}
        onClose={() => setIsFilterMenuOpen(false)}
        onDistanceChange={handleDistanceChange}
        onMinAgeChange={handleMinAgeChange}
        onMaxAgeChange={handleMaxAgeChange}
        onInterestToggle={handleInterestToggle}
        onSubmit={handleSubmitFilters}
      />

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
          <div onClick={() => handleProfileClick(currentProfile.name)} className="relative h-80 w-full">
            <img 
              src={currentProfile.imageUrl} 
              alt={`Photo de ${currentProfile.name}`} 
              className="h-full w-full object-cover object-center" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
              <h2 className="text-2xl font-bold">{currentProfile.name}, {currentProfile.age}</h2>
              <p className="flex items-center gap-1">
                <MapPin size={16} />
                {currentProfile.location}
                {userProfile.latitude && userProfile.longitude && 
                 currentProfile.latitude && currentProfile.longitude && (
                  <span className="text-sm ml-1">
                    ({Math.round(calculateDistance(
                      userProfile.latitude, userProfile.longitude,
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
                <p>{calculateCommonInterestsScore(userProfile, currentProfile).toFixed(0)}% d'intérêts en commun</p>
              </div>
            </div>
            
            <h3 className="font-semibold mb-2 text-purple-800">Centres d'intérêt</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {currentProfile.interests.map((interest, index) => (
                <span 
                  key={index} 
                  className={`px-3 py-1 rounded-full text-sm ${
                    userProfile.interests.includes(interest)
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