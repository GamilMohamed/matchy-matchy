// BasicInfoTab.tsx
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { UpdateProfileData } from "@/types/auth";
import SexualPreferencesSelector from "../SexualPreferencesSelector";


interface BasicInfoTabProps {
  profileData: UpdateProfileData;
  setProfileData: (data: UpdateProfileData) => void;
  isGeolocationEnabled: boolean;
  goToNextTab: () => void;
}

const BasicInfoTab = ({ 
  profileData, 
  setProfileData, 
  isGeolocationEnabled,
  goToNextTab 
}: BasicInfoTabProps) => {
  const handleLocalisation = (value: boolean) => {
    setProfileData({
      ...profileData,
      authorize_location: value,
    });
  };

  return (
    <>
      {/* Gender Selection */}
      <div className="space-y-3 bg-red-500">
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

      <div className="flex justify-end mt-6 pt-4">
        <Button type="button" onClick={goToNextTab} className="ml-2">
          Next
        </Button>
      </div>
    </>
  );
};

export default BasicInfoTab;