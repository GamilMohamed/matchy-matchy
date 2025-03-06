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

import ProfileView from "./ProfileView";


function PreferencesForms() {
  const { user } = useAuth();
  const [profileComplete, setProfileComplete] = useState(user?.profileComplete || false);
  const [profileData, setProfileData] = useState<UpdateProfileData>({
    gender: user?.gender || "",
    sexualPreferences: user?.sexualPreferences || "",
    authorizeLocation: user?.authorizeLocation || false,
    location: user?.location || { latitude: 0, longitude: 0, city: "", country: "" },
    biography: user?.biography || "",
    interests: user?.interests || [],
    pictures: [],
    profilePicture: null,
  });
  const { updateProfile } = useAuth();
  const [newTag, setNewTag] = useState("");
  const [isGeolocationEnabled, setIsGeolocationEnabled] = useState(true);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          setIsGeolocationEnabled(true);
          console.log("Latitude: " + position.coords.latitude);
          console.log("Longitude: " + position.coords.longitude);
          if (profileData.location.city && profileData.location.country) return;
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
  });

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim() !== "") {
      e.preventDefault();
      if (profileData.interests && profileData.interests.length >= 5) return;

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
    if (!files) return;

    if (isProfilePic) {
      setProfileData({
        ...profileData,
        profilePicture: files[0],
      });
    } else {
      if (profileData.pictures && profileData.pictures.length + files.length <= 4) {
        setProfileData({
          ...profileData,
          pictures: [...profileData.pictures, ...Array.from(files)],
        });
      } else {
        alert("Maximum 4 additional pictures allowed");
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
    // Update the form state with the new value
    setProfileData((prevData) => ({
      ...prevData,
      authorizeLocation: value,
    }));


  };

  async function fetchCityAndCountryFromCoords(latitude: number, longitude: number): Promise<void> {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();

      const city = data.address.city || data.address.town || data.address.village || "";
      const country = data.address.country || "";

      console.log("City: " + city);
      console.log("Country: " + country);

      // Update state
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
        return;
      }
      console.log("Getting approximate location by IP...");
      const response = await fetch("https://ipapi.co/json/");
      const data: {
        city: string;
        country_name: string;
        latitude: number;
        longitude: number;
      } = await response.json();

      console.log("Approximate location by IP:");
      console.log("City: " + data.city);
      console.log("Country: " + data.country_name);
      console.log("Latitude: " + data.latitude);
      console.log("Longitude: " + data.longitude);

      // Store coordinates in state
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
    await getLocationByIP();
    try {
      await updateProfile(profileData);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setProfileComplete(true);
    }
  };

  if (profileComplete) {
    return <ProfileView setProfileComplete={setProfileComplete} />;
  }

  return (
    <div className="w-full px-4 py-8 sm:px-6 md:py-12">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Gender Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Gender</Label>
              <RadioGroup value={profileData.gender} onValueChange={(value) => setProfileData({ ...profileData, gender: value })} className="flex flex-col sm:flex-row gap-3">
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
            <div className="space-y-3">
              <Label className="text-base font-semibold">Sexual Preferences</Label>
              <RadioGroup
                value={profileData.sexualPreferences}
                onValueChange={(value) => setProfileData({ ...profileData, sexualPreferences: value })}
                className="flex flex-col sm:flex-row gap-3">
                {["men", "women", "both"].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`preference-${option}`} />
                    <Label htmlFor={`preference-${option}`} className="text-base">
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Localisation */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Would you like to share your location?</Label>
              <RadioGroup value={String(profileData.authorizeLocation)} onValueChange={(value) => handleLocalisation(value === "true")} className="flex flex-col sm:flex-row gap-3">
                {[
                  { label: "Yes", value: "true", disabled: !isGeolocationEnabled},
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
            </div>

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
            </div>

            {/* Interests/Tags */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="interests" className="text-base font-semibold">
                  Interests (Press Enter to add)
                </Label>
                {profileData.interests && profileData.interests.length >= 5 && <span className="text-red-500 text-sm">Maximum 5 reached</span>}
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

            {/* Profile Picture */}
            <div className="space-y-3">
              <Label htmlFor="profilePic" className="text-base font-semibold">
                Profile Picture
              </Label>
              <Input id="profilePic" name="profilePicture" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="text-base" />
              {profileData.profilePicture && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                    <img src={URL.createObjectURL(profileData.profilePicture)} alt="Profile preview" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm">{profileData.profilePicture.name}</span>
                </div>
              )}
            </div>

            {/* Additional Pictures */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="additionalPics" className="text-base font-semibold">
                  Additional Pictures
                </Label>
                <span className="text-muted-foreground text-sm">{profileData.pictures?.length || 0}/4</span>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {profileData.pictures &&
                  profileData.pictures.map((pic, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-md overflow-hidden bg-slate-100">
                        <img src={URL.createObjectURL(pic)} alt={`Additional ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <Button type="button" onClick={() => handleRemoveImage(index)} variant="destructive" size="sm" className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full text-base" size="lg">
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default PreferencesForms;
