import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Info, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateAge, calculateDistance } from "@/utils/profileUtils";
import { UserProfile, MatchProfile } from "./Home";

interface MatchCardProps {
  isLoading: boolean;
  currentProfile: MatchProfile | undefined;
  userProfile: UserProfile;
  matchedProfiles: MatchProfile[];
  currentProfileIndex: number;
  handleSwipeLeft: () => void;
  handleSwipeRight: () => void;
  resetFilters: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({
  isLoading,
  currentProfile,
  userProfile,
  matchedProfiles,
  currentProfileIndex,
  handleSwipeLeft,
  handleSwipeRight,
  resetFilters,
}) => {
  const [showBio, setShowBio] = useState<boolean>(false);

  // No matches state
  if (!isLoading && matchedProfiles.length === 0) {
    return (
      <div className="relative h-[calc(100vh-320px)] min-h-[500px] w-full">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl shadow border">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold mb-2">No matches found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria to find more people</p>
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="relative h-[calc(100vh-320px)] min-h-[500px] w-full">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-320px)] min-h-[500px] w-full">
      <AnimatePresence>
        <motion.div
          key={currentProfileIndex}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <Card className="h-full w-full overflow-hidden rounded-xl shadow-lg">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="relative h-full">
                {/* Profile image with blurred background */}
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
                    }`}
                  >
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-xl font-bold mb-1">About {currentProfile?.firstname}</h3>
                      <p className="mb-4 text-sm text-gray-200">
                        {currentProfile?.bio || currentProfile?.biography || "No bio available"}
                      </p>

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
                        }}
                      >
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

      {/* Action buttons */}
      {matchedProfiles.length > 0 && (
        <>
          <div className="flex justify-center gap-4 mt-6">
            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full border-2 border-red-400 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              onClick={handleSwipeLeft}
            >
              <X className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full border-2 border-green-400 text-green-500 hover:bg-green-50 hover:text-green-600 transition-colors"
              onClick={handleSwipeRight}
            >
              <Heart className="h-6 w-6" />
            </Button>
          </div>

          {/* Navigation indicator */}
          {matchedProfiles.length > 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex gap-1">
                {matchedProfiles.slice(0, 5).map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full ${index === currentProfileIndex ? "w-6 bg-indigo-500" : "w-2 bg-gray-300"}`}
                  />
                ))}
                {matchedProfiles.length > 5 && <div className="h-1 w-2 rounded-full bg-gray-300" />}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MatchCard;