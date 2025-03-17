import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, Heart, MapPin, Calendar, Info, ChevronDown, Search, ChevronRight, ArrowLeft } from "lucide-react";
import Navbar from "./Nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { useAuth } from "@/context/auth-context";

// Sample interests for filter suggestions
const SAMPLE_INTERESTS = [
  "Travel",
  "Music",
  "Movies",
  "Sports",
  "Gaming",
  "Cooking",
  "Art",
  "Photography",
  "Reading",
  "Writing",
  "Dancing",
  "Hiking",
  "Yoga",
  "Fashion",
  "Technology",
];

const Home = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({
    email: user?.email || "",
    username: user?.username || "",
    firstname: user?.firstname || "",
    interests: user?.interests || [],
    gender: user?.gender || "",
    sexual_preferences: user?.sexual_preferences || "",
    maxDistance: 100,
    ageRange: { min: 18, max: 50 },
    activeFilters: { interests: [] },
  });
  const [allUsers, setAllUsers] = useState([]);
  const [matchedProfiles, setMatchedProfiles] = useState([]);
  const [likedProfiles, setLikedProfiles] = useState([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLikes, setIsLoadingLikes] = useState(true);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showLikesSidebar, setShowLikesSidebar] = useState(false);
  const [showBio, setShowBio] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tempFilters, setTempFilters] = useState({
    maxDistance: 100,
    ageRange: { min: 18, max: 50 },
    interests: [],
  });

  // Get current profile being displayed
  const currentProfile = matchedProfiles[currentProfileIndex];

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  // Navigate to user profile
  const handleProfileClick = (username) => {
    navigate(`/user/${username}`);
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  // Calculate common interests score
  const calculateCommonInterestsScore = (profile1, profile2) => {
    if (!profile1.interests?.length) return 0;

    // Normalize interests (remove # and convert to lowercase)
    const normalizeInterest = (interest) => {
      if (typeof interest !== "string") return String(interest).toLowerCase();
      return interest.startsWith("#") ? interest.substring(1).toLowerCase() : interest.toLowerCase();
    };

    const normalizedInterests1 = profile1.interests.map(normalizeInterest);
    const normalizedInterests2 = profile2.interests.map(normalizeInterest);

    // Find common interests
    const commonInterests = normalizedInterests1.filter((interest) => normalizedInterests2.includes(interest));

    return (commonInterests.length / normalizedInterests1.length) * 100;
  };

  // Check sexual preference match
  const checkSexualPreferenceMatch = (profile1, profile2) => {
    if (!profile1.sexual_preferences || !profile2.sexual_preferences || !profile1.gender || !profile2.gender) {
      return false;
    }
    return profile1.sexual_preferences.includes(profile2.gender) && profile2.sexual_preferences.includes(profile1.gender);
  };

  // Find matches based on criteria
  const findMatches = () => {
    if (!allUsers?.length || !userProfile) {
      return [];
    }
    // filter out all liked users

    const userAge = calculateAge(userProfile.birth_date || "");

    return allUsers
      .filter((profile) => {
        // Don't include current user in matches
        if (profile.email === userProfile.email) return false;

        // Filter by search term if provided
        // if (searchTerm) {
        //   const searchLower = searchTerm.toLowerCase();
        //   const nameMatch = profile.firstname?.toLowerCase().includes(searchLower) || false;
        //   const usernameMatch = profile.username?.toLowerCase().includes(searchLower) || false;
        //   const interestsMatch = profile.interests?.some((i) => i.toLowerCase().includes(searchLower)) || false;

        //   if (!(nameMatch || usernameMatch || interestsMatch)) return false;
        // }

        // Check sexual preference match if enabled
        // const preferenceMatch = checkSexualPreferenceMatch(userProfile, profile);
        // if (!preferenceMatch) return false;

        // Check distance if coordinates are available
        // if (userProfile.location?.latitude && userProfile.location?.longitude && profile.location?.latitude && profile.location?.longitude && userProfile.maxDistance) {
        //   const distance = calculateDistance(userProfile.location.latitude, userProfile.location.longitude, profile.location.latitude, profile.location.longitude);
        //   if (distance > userProfile.maxDistance) return false;
        // }

        // Check age range
        // const profileAge = calculateAge(profile.birth_date || "");
        // if (
        //   (userProfile.ageRange && (profileAge < userProfile.ageRange.min || profileAge > userProfile.ageRange.max)) ||
        //   (profile.ageRange && (userAge < profile.ageRange.min || userAge > profile.ageRange.max))
        // ) {
        //   return false;
        // }

        // Check interest filters if any are selected
        // if (userProfile.activeFilters?.interests.length) {
        //   const hasMatchingInterests = profile.interests?.some((interest) => userProfile.activeFilters?.interests.includes(interest));
        //   if (!hasMatchingInterests) return false;
        // }

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
  const handleSwipeLeft = () => {
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
  const handleSwipeRight = async () => {
    try {
      if (currentProfile) {
        // await api.post(`/like/`, { username: currentProfile.username });
        await api.post(`/like/test`, { liked: currentProfile.username });
        // In a real app, you would call an API to like the user
        // await api.post(`/users/like/${currentProfile.username}`);

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
      }

      if (currentProfileIndex < matchedProfiles.length - 1) {
        setCurrentProfileIndex(currentProfileIndex + 1);
      } else {
        toast({
          title: "No more matches",
          description: "You've reached the end of your matches. Try adjusting your filters.",
          duration: 3000,
        });
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
  const handleRemoveLike = async (profileToRemove) => {
    try {
      // In a real app, you would call an API to remove the like
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
        description: error.response?.data?.error || "Failed to like this user. Please try again.",
        duration: 3000,
      });
    }
  };

  // Apply filters
  const applyFilters = () => {
    setUserProfile((prev) => ({
      ...prev,
      maxDistance: tempFilters.maxDistance,
      ageRange: tempFilters.ageRange,
      activeFilters: { interests: tempFilters.interests },
    }));

    setShowFilterDrawer(false);

    // This will trigger the useEffect to recalculate matches
  };

  // Reset all filters
  const resetFilters = () => {
    setTempFilters({
      maxDistance: 100,
      ageRange: { min: 18, max: 50 },
      interests: [],
    });
  };

  // Add or remove interest filter
  const toggleInterestFilter = (interest) => {
    setTempFilters((prev) => {
      const interests = prev.interests.includes(interest) ? prev.interests.filter((i) => i !== interest) : [...prev.interests, interest];

      return { ...prev, interests };
    });
  };

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);

        // Try to fetch all users
        try {
          const res = await api.get("/users/all");
          setAllUsers(res.data);
        } catch (error) {
          console.error("Error fetching users from API, using mock data:", error);

          // Mock data for development purposes
          const mockUsers = Array(20)
            .fill()
            .map((_, i) => ({
              email: `user${i}@example.com`,
              username: `user${i}`,
              firstname: `User ${i}`,
              lastname: `Lastname ${i}`,
              birth_date: `${1990 + (i % 10)}-01-01`,
              location: {
                latitude: 48.8566 + (Math.random() * 0.1 - 0.05),
                longitude: 2.3522 + (Math.random() * 0.1 - 0.05),
                city: "Paris",
                country: "France",
              },
              bio: `This is the bio for user ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
              interests: SAMPLE_INTERESTS.sort(() => 0.5 - Math.random()).slice(0, 4 + (i % 7)),
              pictures: ["/api/placeholder/400/600"],
              profile_picture: "/api/placeholder/200/200",
              gender: i % 2 === 0 ? "female" : "male",
              sexual_preferences: i % 3 === 0 ? "male" : i % 3 === 1 ? "female" : "both",
              ageRange: { min: 18 + (i % 5), max: 35 + (i % 15) },
            }));

          setAllUsers(mockUsers);
        }

        // Set user profile from auth context if available
        if (user) {
          setUserProfile({
            ...user,
            ageRange: user.ageRange || { min: 18, max: 50 },
            maxDistance: user.maxDistance || 100,
            activeFilters: user.activeFilters || { interests: [] },
            interests: user.interests || [],
          });

          // Initialize temp filters with user profile settings
          setTempFilters({
            maxDistance: user.maxDistance || 100,
            ageRange: user.ageRange || { min: 18, max: 50 },
            interests: user.activeFilters?.interests || [],
          });
        } else {
          // If no user in auth context, use mock data
          const mockUserProfile = {
            email: "currentuser@example.com",
            username: "currentuser",
            firstname: "Current",
            lastname: "User",
            birth_date: "1995-05-15",
            location: {
              latitude: 48.8566,
              longitude: 2.3522,
              city: "Paris",
              country: "France",
            },
            bio: "I love hiking and photography",
            interests: ["Travel", "Photography", "Hiking", "Movies"],
            profile_picture: "/api/placeholder/200/200",
            gender: "male",
            sexual_preferences: "female",
            maxDistance: 100,
            ageRange: { min: 18, max: 40 },
            activeFilters: { interests: [] },
          };

          setUserProfile(mockUserProfile);
          // Initialize temp filters with mock profile settings
          setTempFilters({
            maxDistance: 100,
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
    const fetchLikedUsers = async () => {
      try {
        setIsLoadingLikes(true);

        // Try to fetch liked users from API
        try {
          const response = await api.get(`/like/sent`);
          console.log("liked", response.data);
          console.log("matchd", matchedProfiles);
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

  // Update matches when user profile or all users change
  useEffect(() => {
    if (allUsers.length > 0 && userProfile.email) {
      const matches = findMatches();
      setMatchedProfiles(matches);
      setCurrentProfileIndex(0);
    }
  }, [userProfile, allUsers, searchTerm]);

  // Log user view when profile changes
  useEffect(() => {
    const logUserView = async () => {
      if (currentProfile?.username) {
        try {
          // In a real app, log the view
          // await api.post(`/users/view/${currentProfile.username}`);
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
    const handleKeydown = (e) => {
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

  // Helper function to render liked users
  const renderLikedUsers = () => {
    if (isLoadingLikes) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (likedProfiles.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-6 h-64">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Heart className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-base font-medium mb-1">No likes yet</h3>
          <p className="text-sm text-gray-500">When you like someone, they'll appear here</p>
        </div>
      );
    }

    return (
      <div className="divide-y">
        {likedProfiles.map((profile) => (
          <div key={profile.username || profile.email} className="p-4 hover:bg-gray-50 transition-colors relative group">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleProfileClick(profile.username)}>
              <Avatar className="h-12 w-12 border-2 border-indigo-100">
                <AvatarImage src={profile.profile_picture || "/api/placeholder/100/100"} alt={profile.firstname} />
                <AvatarFallback>{profile.firstname?.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 truncate">
                    {profile.firstname}, {calculateAge(profile.birth_date)}
                  </h3>
                </div>

                {profile.location?.city && (
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{profile.location.city}</span>
                    {userProfile.location?.latitude && profile.location?.latitude && (
                      <span className="ml-1 flex-shrink-0">
                        ({calculateDistance(userProfile.location.latitude, userProfile.location.longitude, profile.location.latitude, profile.location.longitude)} km)
                      </span>
                    )}
                  </div>
                )}

                {/* Common interests */}
                {userProfile.interests?.length > 0 && profile.interests?.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {profile.interests
                        .filter((interest) => userProfile.interests.includes(interest))
                        .slice(0, 2)
                        .map((interest, index) => (
                          <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                            {interest}
                          </Badge>
                        ))}
                      {profile.interests.filter((interest) => userProfile.interests.includes(interest)).length > 2 && (
                        <Badge variant="outline" className="text-xs px-2 py-0 bg-gray-50">
                          +{profile.interests.filter((interest) => userProfile.interests.includes(interest)).length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>

            {/* Remove like button - appears on hover */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 bg-white/80 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveLike(profile);
              }}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Main content */}
        <main className={`flex-1 container mx-auto px-4 py-6 max-w-md transition-all duration-300 ${showLikesSidebar ? "md:mxr-80" : ""}`}>
          {/* Search and filter bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search by name or interest..." className="pl-9 pr-4" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <Drawer open={showFilterDrawer} onOpenChange={setShowFilterDrawer}>
              <DrawerTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 relative">
                  <Filter className="h-4 w-4" />
                  {userProfile.activeFilters?.interests.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                      {userProfile.activeFilters.interests.length}
                    </span>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                  <DrawerHeader>
                    <DrawerTitle>Filter Matches</DrawerTitle>
                    <DrawerDescription>Adjust your preferences to find better matches</DrawerDescription>
                  </DrawerHeader>

                  <div className="px-4 py-2">
                    <div className="mb-6">
                      <Label className="text-base font-semibold mb-2 block">Age Range</Label>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">{tempFilters.ageRange.min} years</span>
                        <span className="text-sm text-gray-500">{tempFilters.ageRange.max} years</span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <Input
                          type="number"
                          min="18"
                          max={tempFilters.ageRange.max}
                          value={tempFilters.ageRange.min}
                          onChange={(e) =>
                            setTempFilters((prev) => ({
                              ...prev,
                              ageRange: {
                                ...prev.ageRange,
                                min: Math.min(parseInt(e.target.value) || 18, prev.ageRange.max),
                              },
                            }))
                          }
                          className="w-20"
                        />
                        <Slider
                          min={18}
                          max={100}
                          step={1}
                          value={[tempFilters.ageRange.min, tempFilters.ageRange.max]}
                          onValueChange={(values) =>
                            setTempFilters((prev) => ({
                              ...prev,
                              ageRange: { min: values[0], max: values[1] },
                            }))
                          }
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          min={tempFilters.ageRange.min}
                          max="100"
                          value={tempFilters.ageRange.max}
                          onChange={(e) =>
                            setTempFilters((prev) => ({
                              ...prev,
                              ageRange: {
                                ...prev.ageRange,
                                max: Math.max(parseInt(e.target.value) || 18, prev.ageRange.min),
                              },
                            }))
                          }
                          className="w-20"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <Label className="text-base font-semibold mb-2 block">Maximum Distance</Label>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">0 km</span>
                        <span className="text-sm text-gray-500">{tempFilters.maxDistance} km</span>
                      </div>
                      <Slider
                        min={1}
                        max={500}
                        step={1}
                        value={[tempFilters.maxDistance]}
                        onValueChange={(values) =>
                          setTempFilters((prev) => ({
                            ...prev,
                            maxDistance: values[0],
                          }))
                        }
                      />
                    </div>

                    <div className="mb-6">
                      <Label className="text-base font-semibold mb-2 block">Interests</Label>
                      <p className="text-sm text-gray-500 mb-3">Select interests to filter by</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {tempFilters.interests.map((interest) => (
                          <Badge key={interest} variant="secondary" className="px-3 py-1 text-sm cursor-pointer" onClick={() => toggleInterestFilter(interest)}>
                            {interest} <X className="ml-1 h-3 w-3" />
                          </Badge>
                        ))}
                      </div>

                      <p className="text-sm font-medium mb-2">Suggested interests:</p>
                      <div className="flex flex-wrap gap-2">
                        {SAMPLE_INTERESTS.filter((i) => !tempFilters.interests.includes(i))
                          .slice(0, 12)
                          .map((interest) => (
                            <Badge key={interest} variant="outline" className="px-3 py-1 text-sm cursor-pointer hover:bg-indigo-50" onClick={() => toggleInterestFilter(interest)}>
                              {interest}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>

                  <DrawerFooter>
                    <Button onClick={applyFilters}>Apply Filters</Button>
                    <DrawerClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                    <Button variant="ghost" onClick={resetFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      Reset All Filters
                    </Button>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>

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
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500"
                onClick={() => {
                  setUserProfile((prev) => ({
                    ...prev,
                    activeFilters: { interests: [] },
                  }));
                  setTempFilters((prev) => ({
                    ...prev,
                    interests: [],
                  }));
                }}>
                Clear all
              </Button>
            </div>
          )}

          {/* Match count */}
          <div className="mb-4 text-sm text-gray-500">{isLoading ? <p>Loading profiles...</p> : <p>{matchedProfiles.length} matches found</p>}</div>

          {/* Mobile likes drawer - visible when button is clicked */}
          <div className={`fixed inset-0 bg-white z-40 transition-transform duration-300 md:hidden ${showLikesSidebar ? "translate-x-0" : "translate-x-full"}`}>
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-bold">People You've Liked</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowLikesSidebar(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {renderLikedUsers()}
          </div>

          {/* Tinder cards */}
          <div className="relative h-[calc(100vh-320px)] min-h-[500px] w-full">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : matchedProfiles.length > 0 ? (
              <AnimatePresence>
                <motion.div
                  key={currentProfileIndex}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0">
                  <Card className="h-full w-full overflow-hidden rounded-xl shadow-lg">
                    <CardContent className="p-0 h-full flex flex-col">
                      <div className="relative h-full">
                        {/* Profile image */}
                        <div
                          className="absolute inset-0 bg-cover bg-center z-0"
                          style={{
                            backgroundImage: `url(${currentProfile?.profile_picture || "/api/placeholder/400/600"})`,
                            filter: "blur(20px)",
                            opacity: 0.5,
                          }}
                        />

                        <div className="relative z-10 h-full flex flex-col overflow-hidden" onClick={() => setShowBio(!showBio)}>
                          <div className="flex-1 flex items-center justify-center p-4">
                            <img
                              src={currentProfile?.profile_picture || "/api/placeholder/400/600"}
                              alt={currentProfile?.firstname}
                              className="h-full max-h-[400px] w-auto object-cover rounded-lg shadow-lg"
                            />
                          </div>

                          {/* Bio overlay */}
                          <div
                            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 ease-in-out ${
                              showBio ? "opacity-100" : "opacity-0 pointer-events-none"
                            }`}>
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                              <h3 className="text-xl font-bold mb-1">About {currentProfile?.firstname}</h3>
                              <p className="mb-4 text-sm text-gray-200">{currentProfile?.bio || currentProfile?.biography || "No bio available"}</p>

                              <h4 className="text-sm font-semibold mb-2">Interests</h4>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {currentProfile?.interests?.map((interest, index) => (
                                  <Badge key={index} variant="secondary" className="bg-white/20 text-white">
                                    {interest}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Profile info */}
                          <div className="relative z-20 bg-white p-4 shadow-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h2 className="text-xl font-bold">
                                  {currentProfile?.firstname}, {calculateAge(currentProfile?.birth_date)}
                                </h2>
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  <span>
                                    {currentProfile?.location?.city || "Unknown location"}
                                    {userProfile.location?.latitude && currentProfile?.location?.latitude && (
                                      <span className="ml-1">
                                        (
                                        {calculateDistance(
                                          userProfile.location.latitude,
                                          userProfile.location.longitude,
                                          currentProfile.location.latitude,
                                          currentProfile.location.longitude
                                        )}{" "}
                                        km)
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowBio(!showBio);
                                }}>
                                <Info className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Common interests */}
                            {userProfile.interests?.length > 0 && currentProfile?.interests?.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                  <span>Common interests</span>
                                  <div className="flex-1 h-px bg-gray-200"></div>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {currentProfile.interests
                                    .filter((interest) => userProfile.interests.includes(interest))
                                    .slice(0, 3)
                                    .map((interest, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {interest}
                                      </Badge>
                                    ))}
                                  {currentProfile.interests.filter((interest) => userProfile.interests.includes(interest)).length > 3 && (
                                    <Badge variant="outline" className="text-xs bg-gray-50">
                                      +{currentProfile.interests.filter((interest) => userProfile.interests.includes(interest)).length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl shadow border">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">No matches found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria to find more people</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUserProfile((prev) => ({
                      ...prev,
                      activeFilters: { interests: [] },
                    }));
                    setTempFilters({
                      maxDistance: 100,
                      ageRange: { min: 18, max: 50 },
                      interests: [],
                    });
                    setSearchTerm("");
                  }}>
                  Reset Filters
                </Button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {!isLoading && matchedProfiles.length > 0 && (
            <div className="flex justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full border-2 border-red-400 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                onClick={handleSwipeLeft}>
                <X className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full border-2 border-green-400 text-green-500 hover:bg-green-50 hover:text-green-600 transition-colors"
                onClick={handleSwipeRight}>
                <Heart className="h-6 w-6" />
              </Button>
            </div>
          )}

          {/* Navigation indicator */}
          {!isLoading && matchedProfiles.length > 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex gap-1">
                {matchedProfiles.slice(0, 5).map((_, index) => (
                  <div key={index} className={`h-1 rounded-full ${index === currentProfileIndex ? "w-6 bg-indigo-500" : "w-2 bg-gray-300"}`} />
                ))}
                {matchedProfiles.length > 5 && <div className="h-1 w-2 rounded-full bg-gray-300" />}
              </div>
            </div>
          )}
        </main>

        {/* Liked users sidebar - visible on desktop */}
        <aside
          className={`hidden md:block fixed top-16 right-0 bottom-0 w-80 bg-white border-l border-gray-200 overflow-y-auto transition-transform duration-300 ${
            showLikesSidebar ? "translate-x-0" : "translate-x-full"
          }`}>
          <div className="p-4 border-b sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">People You've Liked</h2>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowLikesSidebar(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {renderLikedUsers()}
        </aside>

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
      </div>
    </div>
  );
};

export default Home;
