"use client";

import { useEffect, useState } from "react";
import type { User } from "@/types/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Mail, Cake, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { calculateAge } from "./UsersList";
import { useAuth } from "@/context/auth-context";
import { api } from "@/context/auth-context";

interface UserProfileDialogProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileDialog({ user, isOpen, onClose }: UserProfileDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [user.profilePicture, ...user.pictures].filter(Boolean);
  const age = calculateAge(new Date(user.birthDate));
  const joinedDate = formatDistanceToNow(new Date(user.createdAt), { addSuffix: true });
  const formattedBirthDate = format(new Date(user.birthDate), "MMMM d, yyyy");

  useEffect(() => {
    async function viewUser() {
      try {
        const res = await api.post("/users/view/" + user.username);
        console.log("User viewed:", res.data);
      } catch (err) {
        console.error("Error viewing user:", err);
      }
    }
    viewUser();
  }, []);
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.profilePicture} alt={user.username} />
              <AvatarFallback>
                {user.firstname.charAt(0)}
                {user.lastname.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span>
              {user.firstname} {user.lastname}, {age}
            </span>
          </DialogTitle>
          <DialogDescription>@{user.username}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Photo Gallery */}
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            {images.length > 0 ? (
              <>
                <img src={images[currentImageIndex] || "/placeholder.svg"} alt={`${user.firstname}'s photo ${currentImageIndex + 1}`} className="w-full h-full object-cover" />
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 rounded-full"
                      onClick={prevImage}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 rounded-full"
                      onClick={nextImage}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {images.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${index === currentImageIndex ? "bg-primary" : "bg-background/80"}`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No photos available</div>
            )}
          </div>

          {/* User Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">About</h3>
              <p className="text-sm line-clamp-3">{user.biography}</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Details</h3>

              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Cake className="h-4 w-4 text-muted-foreground" />
                  <span>Born on {formattedBirthDate}</span>
                </div>

                {user.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {user.location.city}, {user.location.country}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {joinedDate}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span>Interested in: {user.sexualPreferences.join(", ")}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UserProfileDialog;
