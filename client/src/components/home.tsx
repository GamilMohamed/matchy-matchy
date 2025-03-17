import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Heart, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { useAuth } from "@/context/auth-context";
import Navbar from "./Nav";
import MatchCard from "./MatchCard";
import LikedUsersList from "./LikedUsersList";
import FilterDrawer from "./FilterDrawer";
import { SAMPLE_INTERESTS } from "@/constants/interests";
import { calculateAge, calculateDistance, calculateCommonInterestsScore } from "@/utils/profileUtils";

// Type definitions
export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

export interface AgeRange {
  min: number;
  max: number;
}

export interface ActiveFilters {
  interests: string[];
}

export interface UserProfile {
  email: string;
  username: string;
  firstname: string;
  lastname?: string;
  birth_date?: string;
  location?: Location;
  bio?: string;
  biography?: string;
  interests: string[];
  pictures?: string[];
  profile_picture?: string;
  gender?: string;
  sexual_preferences?: string[];
  maxDistance: number;
  ageRange: AgeRange;
  activeFilters: ActiveFilters;
}

export interface MatchProfile extends UserProfile {
  // Any additional fields specific to matches
}

export interface TempFilters {
  maxDistance: number;
  ageRange: AgeRange;
  interests: string[];
}

const Home: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [userProfile, setUserProfile] = useState<UserProfile>({
    email: user?.email || "",
    username: user?.username || "",
    firstname: user?.firstname || "",
    interests: user?.interests || [],
    gender: user?.gender || "",
    sexual_preferences: user?.sexual_preferences || [],
    maxDistance: 500,
    ageRange: { min: 18, max: 100 },
    activeFilters: { interests: [] },
  });

  const [allUsers, setAllUsers] = useState<MatchProfile[]>([]);
  const [matchedProfiles, setMatchedProfiles] = useState<MatchProfile[]>([]);
  const [likedProfiles, setLikedProfiles] = useState<MatchProfile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingLikes, setIsLoadingLikes] = useState<boolean>(true);
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);
  const [showLikesSidebar, setShowLikesSidebar] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [tempFilters, setTempFilters] = useState<TempFilters>({
    maxDistance: 500,
    ageRange: { min: 18, max: 100 },
    interests: [],
  });

  // Get current profile being displayed
  const currentProfile = matchedProfiles[currentProfileIndex];

  // Navigate to user profile
  const handleProfileClick = (username: string): void => {
    navigate(`/user/${username}`);
  };

  // Find matches based on criteria
  const findMatches = (): MatchProfile[] => {
    if (!allUsers?.length || !userProfile) {
      return [];
    }

    // Filter out liked users and current user
    return allUsers
      .filter((profile) => {
        // Don't include current user in matches
        if (profile.email === userProfile.email) return false;

        // Filter out users that have already been liked
        const isLiked = likedProfiles.some((likedProfile) => likedProfile.email === profile.email || likedProfile.username === profile.username);
        if (isLiked) return false;

        // Filter by search term if provided
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const nameMatch = profile.firstname?.toLowerCase().includes(searchLower) || false;
          const usernameMatch = profile.username?.toLowerCase().includes(searchLower) || false;
          const interestsMatch = profile.interests?.some((i) => i.toLowerCase().includes(searchLower)) || false;

          if (!(nameMatch || usernameMatch || interestsMatch)) return false;
        }

        // Check distance if coordinates are available and filter is active
        if (userProfile.location?.latitude && userProfile.location?.longitude && profile.location?.latitude && profile.location?.longitude && userProfile.maxDistance) {
          const distance = calculateDistance(userProfile.location.latitude, userProfile.location.longitude, profile.location.latitude, profile.location.longitude);
          if (distance > userProfile.maxDistance) return false;
        }

        // Check age range if filter is active
        const profileAge = calculateAge(profile.birth_date || "");
        if (userProfile.ageRange && (profileAge < userProfile.ageRange.min || profileAge > userProfile.ageRange.max)) {
          return false;
        }

        // Check interest filters if any are selected
        if (userProfile.activeFilters?.interests.length) {
          const hasMatchingInterests = profile.interests?.some((interest) => userProfile.activeFilters?.interests.includes(interest));
          if (!hasMatchingInterests) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by common interests score (higher is better)
        const scoreA = calculateCommonInterestsScore(userProfile, a);
        const scoreB = calculateCommonInterestsScore(userProfile, b);
        return scoreB - scoreA;
      });
  };

  // Handle swiping left (dislike)
  const handleSwipeLeft = (): void => {
    if (currentProfileIndex < matchedProfiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else {
      toast({
        title: "No more matches",
        description: "You've reached the end of your matches. Try adjusting your filters.",
        duration: 3000,
      });
    }
  };

  // Handle swiping right (like)
  const handleSwipeRight = async (): Promise<void> => {
    try {
      if (currentProfile) {
        await api.post(`/like/test`, { liked: currentProfile.username });

        // Add user to liked profiles if not already there
        setLikedProfiles((prev) => {
          if (prev.some((profile) => profile.email === currentProfile.email)) {
            return prev;
          }
          return [currentProfile, ...prev];
        });

        toast({
          title: "Like sent!",
          description: `You liked ${currentProfile.firstname}`,
          duration: 3000,
        });

        // Move to next profile or show end of matches message
        if (currentProfileIndex < matchedProfiles.length - 1) {
          setCurrentProfileIndex(currentProfileIndex + 1);
        } else {
          toast({
            title: "No more matches",
            description: "You've reached the end of your matches. Try adjusting your filters.",
            duration: 3000,
          });
        }
      }
    } catch (error) {
      console.error("Error liking user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || "Failed to like this user. Please try again.",
        duration: 3000,
      });
    }
  };

  // Remove a like
  const handleRemoveLike = async (profileToRemove: MatchProfile): Promise<void> => {
    try {
      await api.delete(`/like/delete/${profileToRemove.username}`);

      // Remove user from liked profiles
      setLikedProfiles((prev) => prev.filter((profile) => profile.email !== profileToRemove.email));

      toast({
        title: "Like removed",
        description: `You've removed your like for ${profileToRemove.firstname}`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error removing like:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || "Failed to remove like. Please try again.",
        duration: 3000,
      });
    }
  };

  // Apply filters
  const applyFilters = (): void => {
    setUserProfile((prev) => ({
      ...prev,
      maxDistance: tempFilters.maxDistance,
      ageRange: tempFilters.ageRange,
      activeFilters: { interests: tempFilters.interests },
    }));

    setShowFilterDrawer(false);
  };

  // Reset all filters
  const resetFilters = (): void => {
    setTempFilters({
      maxDistance: 500,
      ageRange: { min: 18, max: 100 },
      interests: [],
    });

    setUserProfile((prev) => ({
      ...prev,
      maxDistance: 500,
      ageRange: { min: 18, max: 100 },
      activeFilters: { interests: [] },
    }));

    setSearchTerm("");
  };

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async (): Promise<void> => {
      try {
        setIsLoading(true);

        // Try to fetch all users
        try {
          const res = await api.get("/users/all");
          setAllUsers(res.data);
        } catch (error) {
          console.error("Error fetching users from API, using mock data:", error);

          // Mock data for development purposes
        }

        // Set user profile from auth context if available
        if (user) {
          setUserProfile({
            ...user,
            ageRange: user.ageRange || { min: 18, max: 100 },
            maxDistance: user.maxDistance || 500,
            activeFilters: user.activeFilters || { interests: [] },
            interests: user.interests || [],
          });

          // Initialize temp filters with user profile settings
          setTempFilters({
            maxDistance: user.maxDistance || 500,
            ageRange: user.ageRange || { min: 18, max: 100 },
            interests: user.activeFilters?.interests || [],
          });
        } else {
          // If no user in auth context, use mock data
          // Initialize temp filters with mock profile settings
          setTempFilters({
            maxDistance: 500,
            ageRange: { min: 18, max: 40 },
            interests: [],
          });
        }
      } catch (error) {
        console.error("Error in setup:", error);
        toast({
          variant: "destructive",
          title: "Error loading profiles",
          description: "Unable to load profiles. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  // Fetch liked users
  useEffect(() => {
    const fetchLikedUsers = async (): Promise<void> => {
      try {
        setIsLoadingLikes(true);

        // Try to fetch liked users from API
        try {
          const response = await api.get(`/like/sent`);
          setLikedProfiles(response.data);
        } catch (error) {
          console.error("Error fetching liked users from API, using mock data:", error);

          // For development: use first 5 users as likes
          if (allUsers.length > 0) {
            const mockLikedProfiles = allUsers.slice(0, 5);
            setLikedProfiles(mockLikedProfiles);
          }
        }
      } catch (error) {
        console.error("Error in liked users setup:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load liked profiles.",
        });
      } finally {
        setIsLoadingLikes(false);
      }
    };

    if (allUsers.length > 0 && user) {
      fetchLikedUsers();
    }
  }, [allUsers, user]);

  // Update matches when user profile, all users, or liked profiles change
  useEffect(() => {
    if (allUsers.length > 0 && userProfile.email) {
      const matches = findMatches();
      setMatchedProfiles(matches);
      setCurrentProfileIndex(0);
    }
  }, [userProfile, allUsers, likedProfiles, searchTerm]);

  // Log user view when profile changes
  useEffect(() => {
    const logUserView = async (): Promise<void> => {
      if (currentProfile?.username) {
        try {
          // In a real app, log the view
          console.log(`Logged view for user: ${currentProfile.username}`);
        } catch (error) {
          console.error("Error logging user view:", error);
        }
      }
    };

    logUserView();
  }, [currentProfileIndex, matchedProfiles]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent): void => {
      if (!isLoading && matchedProfiles.length > 0) {
        if (e.key === "ArrowLeft") {
          handleSwipeLeft();
        } else if (e.key === "ArrowRight") {
          handleSwipeRight();
        }
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [isLoading, matchedProfiles, currentProfileIndex]);

  return (
    <div className="min-h-screen bg-gxray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row h-5/6">
        {/* Main content */}
        <main className={`flex-1 container mx-auto px-4 py-6 max-w-md transition-all duration-300 ${showLikesSidebar ? "" : ""}`}>
          {/* Search and filter bar */}
          <div className="flex items-center gap-3 mb-6">
            <Input placeholder="Search by name or interest..." className="flex-1" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

            <FilterDrawer
              showFilterDrawer={showFilterDrawer}
              setShowFilterDrawer={setShowFilterDrawer}
              tempFilters={tempFilters}
              setTempFilters={setTempFilters}
              applyFilters={applyFilters}
              resetFilters={resetFilters}
              userProfile={userProfile}
            />

            {/* Likes button - visible on mobile */}
            <Button variant={showLikesSidebar ? "default" : "outline"} size="icon" className="h-10 w-10 md:hidden relative" onClick={() => setShowLikesSidebar(!showLikesSidebar)}>
              <Heart className="h-4 w-4" />
              {likedProfiles.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">{likedProfiles.length}</span>
              )}
            </Button>
          </div>

          {/* Active filters display */}
          {userProfile.activeFilters?.interests.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {userProfile.activeFilters.interests.map((interest) => (
                <Badge key={interest} variant="secondary" className="px-3 py-1">
                  {interest}
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="text-xs text-gray-500" onClick={resetFilters}>
                Clear all
              </Button>
            </div>
          )}

          {/* Match count */}
          <div className="mb-4 text-sm text-gray-500">{isLoading ? <p>Loading profiles...</p> : <p>{matchedProfiles.length} matches found</p>}</div>

          {/* Mobile likes drawer */}
          <div className="md:hidden">
            <LikedUsersList
              isVisible={showLikesSidebar}
              onClose={() => setShowLikesSidebar(false)}
              isLoading={isLoadingLikes}
              likedProfiles={likedProfiles}
              userProfile={userProfile}
              handleProfileClick={handleProfileClick}
              handleRemoveLike={handleRemoveLike}
              isMobile={true}
            />
          </div>
          {/* Match card */}
          <MatchCard
            isLoading={isLoading}
            currentProfile={currentProfile}
            userProfile={userProfile}
            matchedProfiles={matchedProfiles}
            currentProfileIndex={currentProfileIndex}
            handleSwipeLeft={handleSwipeLeft}
            handleSwipeRight={handleSwipeRight}
            resetFilters={resetFilters}
          />

          {/* Desktop toggle button for likes sidebar */}
          <button
            className="hidden md:flex fixed right-4 bottom-4 z-30 items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => setShowLikesSidebar(!showLikesSidebar)}>
            {showLikesSidebar ? (
              <>
                <ArrowLeft className="h-4 w-4" />
                <span>Hide likes</span>
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 text-pink-500" />
                <span>Your likes ({likedProfiles.length})</span>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </main>

        {/* Liked users sidebar - visible on desktop */}
        <LikedUsersList
          isVisible={showLikesSidebar}
          onClose={() => setShowLikesSidebar(false)}
          isLoading={isLoadingLikes}
          likedProfiles={likedProfiles}
          userProfile={userProfile}
          handleProfileClick={handleProfileClick}
          handleRemoveLike={handleRemoveLike}
          isMobile={false}
        />
      </div>
    </div>
  );
};

export default Home;
