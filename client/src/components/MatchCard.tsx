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
      <div className="flex flex-col items-center">
        <div className="w-full aspect-[3/4] bg-white rounded-xl shadow border flex flex-col items-center justify-center text-center p-6">
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
      <div className="flex flex-col items-center">
        <div className="w-full aspect-[3/4] bg-white rounded-xl shadow border flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <div className="w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProfileIndex}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="w-full overflow-hidden rounded-xl shadow-lg aspect-[3/4] flex flex-col">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="relative flex-1 overflow-hidden">
                  {/* Background blur */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${currentProfile?.profile_picture || "/api/placeholder/400/600"})`,
                      filter: "blur(20px)",
                      opacity: 0.5,
                      transform: "scale(1.1)",
                    }}
                  />

                  {/* Main content */}
                  <div className="relative h-full flex flex-col" onClick={() => setShowBio(!showBio)}>
                    {/* Image container */}
                    <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                      <img
                        src={currentProfile?.profile_picture || "/api/placeholder/400/600"}
                        alt={currentProfile?.firstname}
                        className="max-h-full max-w-full object-cover rounded-lg shadow-md"
                      />
                    </div>
                    
                    {/* Bio overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-all duration-300 ease-in-out ${
                        showBio ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}
                    >
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="text-xl font-bold mb-2">About {currentProfile?.firstname}</h3>
                        <p className="mb-4 text-sm text-gray-200 leading-relaxed">
                          {currentProfile?.bio || currentProfile?.biography || "No bio available"}
                        </p>

                        <h4 className="text-sm font-semibold mb-2">Interests</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {currentProfile?.interests?.map((interest, index) => (
                            <Badge key={index} variant="secondary" className="bg-white/20 text-white border-none">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Profile info footer */}
                    <div className="relative bg-white p-4 shadow-md z-10">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-xl font-bold">
                            {currentProfile?.firstname}, {calculateAge(currentProfile?.birth_date)} ({currentProfile?.gender})
                          </h2>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <span>
                              {currentProfile?.location?.city || "Unknown location"}
                              {userProfile.location?.latitude && currentProfile?.location?.latitude && (
                                <span className="ml-1 text-gray-500">
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
                          className="h-8 w-8 text-gray-600 hover:text-indigo-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowBio(!showBio);
                          }}
                        >
                          <Info className="h-5 w-5" />
                        </Button>
                      </div>

                      {/* Common interests */}
					  {currentProfile.interests?.length > 0 && (
						<div className="mt-3">
						  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
							<span>Common interests</span>
							<div className="flex-1 h-px bg-gray-200"></div>
						  </div>
						  <div className="flex flex-wrap gap-1.5">
							{currentProfile?.interests.map((interest, index) => (
							  <Badge key={index} variant="outline" className="text-xs">
								{interest}
							  </Badge>
							))}
						  </div>
						</div>
					  )}
				  
                      {/* {userProfile.interests?.length > 0 && currentProfile?.interests?.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <span>Common interests</span>
                            <div className="flex-1 h-px bg-gray-200"></div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
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
                      )} */}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex justify-center gap-6 w-full">
        <Button
          variant="outline"
          size="icon"
          className="h-16 w-16 rounded-full border-2 border-red-400 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-500 transition-all shadow-sm"
          onClick={handleSwipeLeft}
        >
          <X className="h-8 w-8" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-16 w-16 rounded-full border-2 border-green-400 text-green-500 hover:bg-green-50 hover:text-green-600 hover:border-green-500 transition-all shadow-sm"
          onClick={handleSwipeRight}
        >
          <Heart className="h-8 w-8" />
        </Button>
      </div>

      {/* Navigation indicator */}
      {matchedProfiles.length > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex gap-1">
            {matchedProfiles.slice(0, Math.min(5, matchedProfiles.length)).map((_, index) => (
              <div
                key={index}
                className={`rounded-full transition-all ${
                  index === currentProfileIndex ? "w-6 h-1.5 bg-indigo-500" : "w-1.5 h-1.5 bg-gray-300"
                }`}
              />
            ))}
            {matchedProfiles.length > 5 && <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchCard;