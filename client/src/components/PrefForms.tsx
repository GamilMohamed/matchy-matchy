import { useState, FormEvent, useEffect } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { UpdateProfileData } from "@/types/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "./ui/tabs";
import { 
  Avatar,
  AvatarFallback,
  AvatarImage 
} from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import ProfileView from "./ProfileView";
import { Checkbox } from "./ui/checkbox";
import SexualPreferencesSelector from "./SexualPreferencesSelector";
import { Progress } from "./ui/progress";

function PreferencesForms() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [profileComplete, setProfileComplete] = useState(user?.profileComplete || false);
  const [activeTab, setActiveTab] = useState("basic-info");
  const [profileData, setProfileData] = useState<UpdateProfileData>({
    gender: user?.gender || "male",
    sexual_preferences: user?.sexual_preferences?.length > 0 ? user?.sexual_preferences : ["women", "other"],
    authorize_location: user?.authorize_location || false,
    location: user?.location || { latitude: 0, longitude: 0, city: "", country: "" },
    biography: user?.biography || "Pitié pour moi, je suis un(e) flemmard(e) et je n'ai pas écrit de biographie. 😅",
    interests: user?.interests?.length > 0 ? user?.interests : ["#coding", "#gaming", "#music"],
    pictures: user?.pictures.length > 0 ? user?.pictures : ["https://randomuser.me/api/portraits/men/4.jpg", "https://randomuser.me/api/portraits/men/3.jpg", "https://randomuser.me/api/portraits/men/4.jpg"],
    profile_picture: user?.profile_picture || "https://randomuser.me/api/portraits/men/1.jpg",
  });
  const { updateProfile } = useAuth();
  const [newTag, setNewTag] = useState("");
  const [isGeolocationEnabled, setIsGeolocationEnabled] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({
    basicInfo: false,
    biography: false,
    photos: false
  });

  // Check completion status for tabs
  const checkTabCompletion = () => {
    const errors = {
      basicInfo: !profileData.gender || !profileData.sexual_preferences || profileData.sexual_preferences.length === 0,
      biography: !profileData.biography || profileData.biography.length < 10 || profileData.interests.length === 0,
      photos: !profileData.profile_picture || !profileData.pictures || profileData.pictures.length === 0
    };
    
    setFormErrors(errors);
    return errors;
  };

  useEffect(() => {
    checkTabCompletion();
  }, [profileData]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          setIsGeolocationEnabled(true);
          if (profileData.location.city && profileData.location.country) return true;
          fetchCityAndCountryFromCoords(position.coords.latitude, position.coords.longitude);
        },
        (error: GeolocationPositionError) => {
          setIsGeolocationEnabled(false);
          console.warn("Permission denied or error: ", error);
          getLocationByIP(); // Fallback to IP
        }
      );
    } else {
      getLocationByIP();
    }
  }, []);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim() !== "") {
      e.preventDefault();
      if (profileData.interests && profileData.interests.length >= 5) return true;

      const formattedTag = !newTag.startsWith("#") ? `#${newTag.trim()}` : newTag.trim();

      setProfileData({
        ...profileData,
        interests: [...profileData.interests, formattedTag],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setProfileData({
      ...profileData,
      interests: profileData.interests.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isProfilePic: boolean) => {
    const files = e.target.files;
    if (!files) return true;

    if (isProfilePic) {
      setProfileData({
        ...profileData,
        profile_picture: files[0],
      });
    } else {
      if (profileData.pictures && profileData.pictures.length + files.length <= 4) {
        setProfileData({
          ...profileData,
          pictures: [...profileData.pictures, ...Array.from(files)],
        });
      } else {
        toast({
          title: "Too many pictures",
          description: "Maximum 4 additional pictures allowed",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setProfileData({
      ...profileData,
      pictures: profileData.pictures && profileData.pictures.filter((_, i) => i !== index),
    });
  };

  const handleLocalisation = (value: boolean) => {
    setProfileData((prevData) => ({
      ...prevData,
      authorize_location: value,
    }));
  };

  async function fetchCityAndCountryFromCoords(latitude: number, longitude: number): Promise<void> {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();

      const city = data.address.city || data.address.town || data.address.village || "";
      const country = data.address.country || "";

      setProfileData((prevData) => ({
        ...prevData,
        location: {
          latitude: latitude,
          longitude: longitude,
          city: city,
          country: country,
        },
      }));
    } catch (error) {
      console.error("Error during reverse geocoding:", error);
    }
  }

  async function getLocationByIP(): Promise<void> {
    try {
      if (profileData.location.longitude && profileData.location.latitude && profileData.location.city && profileData.location.country) {
        return true;
      }
      const response = await fetch("https://ipapi.co/json/");
      const data: {
        city: string;
        country_name: string;
        latitude: number;
        longitude: number;
      } = await response.json();

      setProfileData((prevData) => ({
        ...prevData,
        location: {
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city,
          country: data.country_name,
        },
      }));
    } catch (error) {
      console.error("Error retrieving IP location:", error);
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check for errors
    const errors = checkTabCompletion();
    const hasErrors = Object.values(errors).some(error => error);
    
    if (hasErrors) {
      // Find first tab with error and switch to it
      if (errors.basicInfo) {
        setActiveTab("basic-info");
      } else if (errors.biography) {
        setActiveTab("bio-interests");
      } else if (errors.photos) {
        setActiveTab("photos");
      }
      
      toast({
        title: "Please complete all required information",
        description: "Check that all tabs are filled correctly",
        variant: "destructive",
      });
      return;
    }
    
    if (handleProfileUpdateError(profileData)) return;

    try {
      await updateProfile(profileData);
      toast({
        title: "Profile updated successfully",
        description: "Your profile has been saved",
        variant: "default",
      });
      setProfileComplete(true);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const goToNextTab = () => {
    if (activeTab === "basic-info") {
      setActiveTab("bio-interests");
    } else if (activeTab === "bio-interests") {
      setActiveTab("photos");
    }
  };

  const goToPreviousTab = () => {
    if (activeTab === "photos") {
      setActiveTab("bio-interests");
    } else if (activeTab === "bio-interests") {
      setActiveTab("basic-info");
    }
  };

  if (profileComplete) {
    return <ProfileView setProfileComplete={setProfileComplete} />;
  }

  // Get profile initials for avatar fallback
  const getInitials = () => {
    return user?.username ? user.username.substring(0, 2).toUpperCase() : "PF";
  };

  return (
    <div className="w-full px-4 py-8 sm:px-6 md:py-12">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className=" border-b flex flex-col sm:flex-row justify-between items-center gap-4">
          <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-right text-gray-600">
              {user?.username && <div className="font-medium">{user.username}</div>}
              {profileData.location.city && (
                <div className="text-xs">{profileData.location.city}, {profileData.location.country}</div>
              )}
            </div>
            
            <Avatar className="h-12 w-12 border-2 border-white">
              {typeof profileData.profile_picture === "string" ? (
                <AvatarImage src={profileData.profile_picture} alt="Profile" />
              ) : profileData.profile_picture ? (
                <AvatarImage src={URL.createObjectURL(profileData.profile_picture)} alt="Profile" />
              ) : null}
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="basic-info" className="relative">
              Basic Info
              {formErrors.basicInfo && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="bio-interests" className="relative">
              Bio & Interests
              {formErrors.biography && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="photos" className="relative">
              Photos
              {formErrors.photos && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="p-6">
              <TabsContent value="basic-info" className="space-y-6 mt-4">
                {/* Gender Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Gender</Label>
                  <RadioGroup 
                    value={profileData.gender} 
                    onValueChange={(value) => setProfileData({ ...profileData, gender: value })} 
                    className="flex flex-row gap-4"
                  >
                    {["male", "female", "other"].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`gender-${option}`} />
                        <Label htmlFor={`gender-${option}`} className="text-base">
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Sexual Preferences */}
                <SexualPreferencesSelector profileData={profileData} setProfileData={setProfileData} />

                {/* Localisation */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Would you like to share your location?</Label>
                  <RadioGroup 
                    value={String(profileData.authorize_location)} 
                    onValueChange={(value) => handleLocalisation(value === "true")} 
                    className="flex flex-row gap-4"
                  >
                    {[
                      { label: "Yes", value: "true", disabled: !isGeolocationEnabled },
                      { label: "No", value: "false", disabled: false },
                    ].map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`location-${option.value}`} disabled={option.disabled} />
                        <Label htmlFor={`location-${option.value}`} className="text-base">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {profileData.location.city && profileData.location.country && (
                    <p className="text-sm text-gray-500 mt-1">
                      Current location: {profileData.location.city}, {profileData.location.country}
                    </p>
                  )}
                </div>
                
                <div className="flex justify-end mt-6 pt-4 border-t">
                  <Button type="button" onClick={goToNextTab} className="ml-2">
                    Next
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="bio-interests" className="space-y-6 mt-4">
                {/* Biography */}
                <div className="space-y-3">
                  <Label htmlFor="bio" className="text-base font-semibold">
                    Biography
                  </Label>
                  <Textarea
                    id="bio"
                    name="biography"
                    value={profileData.biography}
                    onChange={(e) => setProfileData({ ...profileData, biography: e.target.value })}
                    className="min-h-32 text-base"
                    placeholder="Tell us about yourself..."
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10-200 characters</span>
                    <span className={profileData.biography.length < 10 || profileData.biography.length > 200 ? "text-red-500" : ""}>
                      {profileData.biography.length}/200 characters
                    </span>
                  </div>
                </div>

                {/* Interests/Tags */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="interests" className="text-base font-semibold">
                      Interests (Press Enter to add)
                    </Label>
                    <span className={profileData.interests && profileData.interests.length >= 5 ? "text-red-500 text-sm" : "text-gray-500 text-sm"}>
                      {profileData.interests.length}/5
                    </span>
                  </div>
                  <Input
                    id="interests"
                    name="interests"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="text-base"
                    placeholder="Add interests (e.g. vegan, geek, piercing)"
                    disabled={profileData.interests && profileData.interests.length >= 5}
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profileData.interests.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-base py-1 px-3 flex items-center gap-1">
                        {tag}
                        <Button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 ml-1 text-blue-600 hover:text-blue-800 hover:bg-transparent">
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between mt-6 pt-4 border-t">
                  <Button type="button" onClick={goToPreviousTab} variant="outline">
                    Previous
                  </Button>
                  <Button type="button" onClick={goToNextTab}>
                    Next
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="photos" className="space-y-6 mt-4">
                {/* Profile Picture */}
                <div className="space-y-3">
                  <Label htmlFor="profilePic" className="text-base font-semibold">
                    Profile Picture
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="w-32 h-32 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 flex justify-center items-center">
                      {profileData.profile_picture ? (
                        typeof profileData.profile_picture === "string" ? (
                          <img src={profileData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <img src={URL.createObjectURL(profileData.profile_picture)} alt="Profile" className="w-full h-full object-cover" />
                        )
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}
                    </div>
                    <div className="flex-grow w-full">
                      <Input 
                        id="profilePic" 
                        name="profile_picture" 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)} 
                        className="text-base" 
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This will be your main profile picture visible to others
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Pictures */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="additionalPics" className="text-base font-semibold">
                      Additional Pictures
                    </Label>
                    <span className={
                      profileData.pictures?.length === 0 
                        ? "text-red-500 text-sm" 
                        : "text-gray-500 text-sm"
                    }>
                      {profileData.pictures?.length || 0}/4 (at least 1 required)
                    </span>
                  </div>
                  <Input
                    id="additionalPics"
                    name="additionalPictures"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, false)}
                    disabled={profileData.pictures && profileData.pictures.length >= 4}
                    className="text-base"
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    {profileData.pictures &&
                      profileData.pictures.map((pic, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-md overflow-hidden bg-slate-100">
                            {typeof pic === "string" ? (
                              <img src={pic} alt={`Additional ${index + 1}`} className="w-full h-full object-cover" />
                            ) : (
                              <img src={URL.createObjectURL(pic)} alt={`Additional ${index + 1}`} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <Button 
                            type="button" 
                            onClick={() => handleRemoveImage(index)} 
                            variant="destructive" 
                            size="sm" 
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      ))}
                    
                    {/* Empty slots */}
                    {profileData.pictures && profileData.pictures.length < 4 && 
                      Array.from({ length: 4 - profileData.pictures.length }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square rounded-md border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
                          <span className="text-gray-400 text-xs">Empty slot</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
                
                <div className="flex justify-between mt-6 pt-4 border-t">
                  <Button type="button" onClick={goToPreviousTab} variant="outline">
                    Previous
                  </Button>
                  <Button type="submit" variant="default">
                    Save Profile
                  </Button>
                </div>
              </TabsContent>
            </CardContent>
            
            {/* Progress indicator */}
            <div className="px-6 pb-6">
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <Progress 
              value={activeTab === "basic-info" 
                ? 33 
                : activeTab === "bio-interests" 
                  ? 66 
                  : 100
              } 
              className="w-full bg-gray-200 h-2 rounded-full overflow-hidden"
            />
                {/* <div className="bg-blue-600 h-full" 
                  style={{ 
                    width: activeTab === "basic-info" 
                      ? "33%" 
                      : activeTab === "bio-interests" 
                        ? "66%" 
                        : "100%" 
                  }}>
                </div> */}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Basic Info</span>
                <span>Bio & Interests</span>
                <span>Photos</span>
              </div>
            </div>
          </form>
        </Tabs>
      </Card>
    </div>
  );
}

export default PreferencesForms;

function handleProfileUpdateError(profileData: UpdateProfileData) {
  let description: string | null = null;

  if (!profileData.interests || profileData.interests.length === 0) {
    description = "Please add at least one interest";
  } else if (!profileData.profile_picture) {
    description = "Please add a profile picture";
  } else if (profileData.pictures && profileData.pictures.length === 0) {
    description = "Please add at least one additional picture";
  } else if (!profileData.location.city || !profileData.location.country) {
    description = "Please authorize location sharing";
  } else if (profileData.interests.length > 5) {
    description = "Maximum 5 interests allowed";
  } else if (profileData.pictures && profileData.pictures.length > 4) {
    description = "Maximum 4 additional pictures allowed";
  } else if (profileData.biography.length > 200 || profileData.biography.length < 10) {
    description = "Biography must be between 10 and 200 characters";
  } else if (profileData.interests.some((tag) => tag.length > 20)) {
    description = "Interests must be less than 20 characters";
  }

  if (description) {
    return true;
  }
  return false;
}