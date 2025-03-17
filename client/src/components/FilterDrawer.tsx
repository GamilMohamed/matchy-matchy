import React from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SAMPLE_INTERESTS } from "@/constants/interests";
import { UserProfile, TempFilters } from "./Home";

interface FilterDrawerProps {
  showFilterDrawer: boolean;
  setShowFilterDrawer: (show: boolean) => void;
  tempFilters: TempFilters;
  setTempFilters: React.Dispatch<React.SetStateAction<TempFilters>>;
  applyFilters: () => void;
  resetFilters: () => void;
  userProfile: UserProfile;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  showFilterDrawer,
  setShowFilterDrawer,
  tempFilters,
  setTempFilters,
  applyFilters,
  resetFilters,
  userProfile,
}) => {
  // Toggle interest in filter
  const toggleInterestFilter = (interest: string): void => {
    setTempFilters((prev) => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];

      return { ...prev, interests };
    });
  };

  return (
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
                  <Badge
                    key={interest}
                    variant="secondary"
                    className="px-3 py-1 text-sm cursor-pointer"
                    onClick={() => toggleInterestFilter(interest)}
                  >
                    {interest} <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>

              <p className="text-sm font-medium mb-2">Suggested interests:</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_INTERESTS.filter((i) => !tempFilters.interests.includes(i))
                  .slice(0, 12)
                  .map((interest) => (
                    <Badge
                      key={interest}
                      variant="outline"
                      className="px-3 py-1 text-sm cursor-pointer hover:bg-indigo-50"
                      onClick={() => toggleInterestFilter(interest)}
                    >
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
            <Button
              variant="ghost"
              onClick={resetFilters}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              Reset All Filters
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FilterDrawer;