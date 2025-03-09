import React, { useState, useEffect, use } from "react";
import Footer from "./Footer";
import Nav from "./Nav";
import { Heart, X, Star, MapPin, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MenuFilter from "./MenuFilter";
import api from "@/lib/axios";

// Définir l'interface UserProfile pour le typage
export interface UserProfile {
  id: number;
  email: string;
  firstname: string;
  lastname?: string;
  birth_date?: string;
  age?: number;
  location?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;  
  };
  biography?: string;
  bio?: string;
  interests: string[];
  pictures?: string[];
  imageUrl?: string;
  profile_picture?: string;
  gender: string;
  sexual_preferences: string;
  maxDistance?: number;
  ageRange?: { min: number; max: number };
  activeFilters?: {
    interests: string[];
  };
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [direction, setDirection] = useState<"none" | "left" | "right" | "up">("none");
  const [matchedProfiles, setMatchedProfiles] = useState<UserProfile[]>([]);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 0,
    email: "",
    firstname: "You",
    interests: [],
    gender: "non-binary",
    sexual_preferences: "non-binary",
    maxDistance: 50,
    ageRange: { min: 25, max: 40 },
    activeFilters: {
      interests: [],
    },
  });
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  
  // Fonction pour gérer le clic sur le profil et rediriger vers la page utilisateur
  const handleProfileClick = (username: string) => {
    navigate(`/user/${username}`);
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculate common interests score (percentage of matched interests)
  const calculateCommonInterestsScore = (profile1: UserProfile, profile2: UserProfile): number => {
    if (!profile1.interests.length) return 0;
    const commonInterests = profile1.interests.filter((interest) => profile2.interests.includes(interest));
    return (commonInterests.length / profile1.interests.length) * 100;
  };

  // Check if two profiles match based on sexual preference
  const checkSexualPreferenceMatch = (profile1: UserProfile, profile2: UserProfile): boolean => {
    if (!profile1.sexual_preferences || !profile2.sexual_preferences || !profile1.gender || !profile2.gender) {
      return false;
    }
    return profile1.sexual_preferences === profile2.gender && profile2.sexual_preferences === profile1.gender;
  };

  const calculateAge = (birth_date: string): number => {
    const birth = new Date(birth_date);
    const today = new Date();

    // Extraire l'année, le mois et le jour de la date de naissance
    const birthYear = birth.getUTCFullYear();
    const birthMonth = birth.getUTCMonth(); // 0 = Janvier, 11 = Décembre
    const birthDay = birth.getUTCDate();

    // Extraire l'année, le mois et le jour d'aujourd'hui
    const todayYear = today.getUTCFullYear();
    const todayMonth = today.getUTCMonth();
    const todayDay = today.getUTCDate();

    let age = todayYear - birthYear;

    // Si l'anniversaire n'est pas encore passé cette année, on enlève 1 an
    if (todayMonth < birthMonth || (todayMonth === birthMonth && todayDay < birthDay)) {
        age--;
    }

    return age;
};

  // Apply all matching criteria to generate suggested profiles
  const findMatches = () => {
    if (!allUsers || !userProfile) {
      return [];
    }

    const userAge = calculateAge(userProfile.birth_date || "");
    console.log("User age:", userAge);

    return allUsers
      .filter((profile) => {
        // Don't include current user in matches
        if (profile.email === userProfile.email) return false;

        // Check mutual sexual preference match
        // const preferenceMatch = checkSexualPreferenceMatch(userProfile, profile);
        // if (!preferenceMatch) return false;
        // // Check distance if coordinates are available
        // // if (me.latitude && me.longitude && profile.latitude && profile.longitude && me.maxDistance) {
        // //   const distance = calculateDistance(me.latitude, me.longitude, profile.latitude, profile.longitude);
        // //   if (distance > me.maxDistance) return false;
        // // }

        // // Check age range
        // const profileAge = calculateAge(profile.birth_date || "");
        // console.log("Profile age:", profileAge);
        // console.log("User age range:", userProfile.ageRange);
        // if (
        //   (userProfile.ageRange &&
        //       (profileAge < userProfile.ageRange.min || profileAge > userProfile.ageRange.max)) ||
        //   (profile.ageRange &&
        //       (userAge < profile.ageRange.min || userAge > profile.ageRange.max))
        // )
        // return false;

        // Check interest filters if any are selected
        // if (me.activeFilters?.interests.length) {
        //   const hasMatchingInterests = profile.interests.some((interest) => 
        //     me.activeFilters?.interests.includes(interest)
        //   );
        //   if (!hasMatchingInterests) return false;
        // }

        return true;
      })
      // .sort((a, b) => {
      //   // Sort by common interests score (higher is better)
      //   const scoreA = calculateCommonInterestsScore(me, a);
      //   const scoreB = calculateCommonInterestsScore(me, b);
      //   return scoreB - scoreA;
      // });
  };

  // Fetch users data on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer l'utilisateur actuel
        const meResponse = await api.get("/users/me");
        const me = meResponse.data as UserProfile;

        setUserProfile(me);
  
        // Récupérer tous les utilisateurs
        const allUsersResponse = await api.get("/users/all");
        const allUsersData = allUsersResponse.data as UserProfile[];
        setAllUsers(allUsersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUsers();
  }, []);

  // Exécuter findMatches après mise à jour des états
  useEffect(() => {
    const matches = findMatches();
    setMatchedProfiles(matches);
    setCurrentProfileIndex(0);
    console.log("Updated matched profiles:", matches);
  }, [userProfile, allUsers]);

  // Update matches when filters change
  // useEffect(() => {
  //   const fetchAndUpdateMatches = async () => {
  //     try {
  //       const newMatches = findMatches();
  //       setMatchedProfiles(newMatches);
  //       setCurrentProfileIndex(0);
  //     } catch (error) {
  //       console.error("Error updating matches:", error);
  //     }
  //   };
    
  //   fetchAndUpdateMatches();
  // }, [userProfile]);

  // Handle swipe actions
  const handleSwipe = (dir: "left" | "right" | "up") => {
    setDirection(dir);

    // Animation timeout
    setTimeout(() => {
      if (currentProfileIndex < matchedProfiles.length - 1) {
        setCurrentProfileIndex((prevIndex) => prevIndex + 1);
      } else {
        // Reset to beginning when we reach the end
        setCurrentProfileIndex(0);
      }
      setDirection("none");
    }, 300);
  };

  // Fonctions pour les filtres
  const handleDistanceChange = (distance: number) => {
    setUserProfile((prev) => ({
      ...prev,
      maxDistance: distance,
    }));
  };

  const handleMinAgeChange = (minAge: number) => {
    setUserProfile((prev) => ({
      ...prev,
      ageRange: {
        ...prev.ageRange!,
        min: minAge,
      },
    }));
  };

  const handleMaxAgeChange = (maxAge: number) => {
    setUserProfile((prev) => ({
      ...prev,
      ageRange: {
        ...prev.ageRange!,
        max: maxAge,
      },
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setUserProfile((prev) => {
      const currentInterests = prev.activeFilters?.interests || [];
      const updatedInterests = currentInterests.includes(interest) ? currentInterests.filter((i) => i !== interest) : [...currentInterests, interest];

      return {
        ...prev,
        activeFilters: {
          ...prev.activeFilters,
          interests: updatedInterests,
        },
      };
    });
  };

  // Appliquer tous les filtres
  const handleSubmitFilters = () => {
    console.log("Sending updated user profile to backend:", JSON.stringify(userProfile));
    setIsFilterMenuOpen(false);
  };

  // Get current profile
  const currentProfile = matchedProfiles[currentProfileIndex];

  // Extraction de tous les intérêts uniques pour le menu de filtre
  const allUniqueInterests = Array.from(
    new Set(matchedProfiles.flatMap((p) => p.interests))
  );

  // Handle loading state
  if (isLoading) {
    return (
      <div className="from-pink-50 to-purple-100 flex flex-col items-center justify-center w-screen h-screen">
        <p>Chargement des profils...</p>
      </div>
    );
  }

  // Handle case when no matches are found
  if (matchedProfiles.length === 0) {
    return (
      <div className="from-pink-50 to-purple-100 flex flex-col items-center justify-between w-screen h-screen">
        <Nav />
        <div className="text-center max-w-md px-4">
          <h1 className="text-4xl font-bold text-purple-800 mb-6">Aucun profil trouvé</h1>
          <p className="text-gray-700 mb-8">Essayez d'élargir vos critères de recherche pour découvrir plus de personnes.</p>
          <button onClick={() => setIsFilterMenuOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-colors text-lg">
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
    <div className="from-pink-50 to-purple-100 flex flex-col items-center justify-between w-screen h-screen">
      <Nav />

      {/* Filter button */}
      <div className="absolute top-16 right-4 z-10">
        <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className="bg-purple-600 text-white p-2 rounded-full shadow-lg">
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
      <div className="text-sm text-purple-700 mb-2">{matchedProfiles.length} profil(s) correspondant à vos critères</div>

      {/* Profile card */}
      {currentProfile && (
        <div
          className={`relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 ease-out
            ${
              direction === "left"
                ? "translate-x-full opacity-0"
                : direction === "right"
                ? "-translate-x-full opacity-0"
                : direction === "up"
                ? "translate-y-full opacity-0"
                : "translate-x-0 opacity-100"
            }`}>
          {/* Profile image */}
          <div onClick={() => handleProfileClick(currentProfile.firstname)} className="relative h-80 w-full">
            {/* <img 
              src={currentProfile.imageUrl || currentProfile.profile_picture || "https://placehold.co/400x400/png"} 
              alt={`Photo de ${currentProfile.firstname}`} 
              className="h-full w-full object-cover object-center" 
            /> */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
              <h2 className="text-2xl font-bold">
                {currentProfile.firstname}, {currentProfile.age}
              </h2>
              <p className="flex items-center gap-1">
                <MapPin size={16} />
                {currentProfile.location?.city || "Emplacement inconnu"}
                {/* {userProfile.latitude && userProfile.longitude && currentProfile.latitude && currentProfile.longitude && ( */}
                  {/* // <span className="text-sm ml-1"> */}
                    {/* ({Math.round(calculateDistance(userProfile.latitude, userProfile.longitude, currentProfile.latitude, currentProfile.longitude))} km) */}
                  {/* </span> */}
              </p>
            </div>
          </div>

          {/* Profile info */}
          <div className="p-4">
            <p className="mb-3 text-gray-700">{currentProfile.biography || currentProfile.bio || ""}</p>

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
                    userProfile.interests.includes(interest) ? "bg-purple-200 text-purple-800 font-medium" : "bg-gray-100 text-gray-800"
                  }`}>
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-4 pb-6 flex justify-center gap-6 items-center">
            <button onClick={() => handleSwipe("left")} className="bg-white rounded-full p-4 shadow-lg text-red-500 hover:bg-red-50 transition-colors">
              <X size={32} />
            </button>
            <button onClick={() => handleSwipe("up")} className="bg-white rounded-full p-4 shadow-lg text-blue-500 hover:bg-blue-50 transition-colors">
              <Star size={32} />
            </button>
            <button onClick={() => handleSwipe("right")} className="bg-white rounded-full p-4 shadow-lg text-green-500 hover:bg-green-50 transition-colors">
              <Heart size={32} />
            </button>
          </div>
        </div>
      )}

      {/* <Footer /> */}
    </div>
  );
};

export default Home;