"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { User } from "@/types/auth";
import { useAuth } from "@/context/auth-context";
import { useState } from "react";
import { Button } from "./ui/button";
import { UserProfileDialog } from "./UsersDialog";

interface UserListProps {
  users: User[];
}

export default function UserList({ users = [] }: UserListProps) {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <UserCard key={user.username} userx={user} user={user} />
      {users.map((userx) => (
        <UserCard key={userx.username} userx={userx} user={user} />
      ))}
    </div>
  );
}

function UserCard({ userx, user }: { userx: User; user: User }) {
  const [showDialog, setShowDialog] = useState(false);
  const age = calculateAge(new Date(userx.birthDate));
  const joinedDate = formatDistanceToNow(new Date(userx.createdAt), { addSuffix: true });
  const appendHashtag = (str: string) => (str.charAt(0) === "#" ? str : `#${str}`);

  // Create a copy of the interests array to avoid modifying the original
  const formattedInterests = userx.interests.map((interest) => appendHashtag(interest));
  // const usersViewed = // loop on the arrays select only the usernames
  const usersViewed = user.viewed.map((viewed) => viewed.username);
  console.log("user.viewed", usersViewed, userx.username, usersViewed.includes(userx.username));
  return (
    <>
      <Card className="overflow-hidden">
        <div className="relative h-40 w-full overflow-hidden">
          <img src={userx.pictures[0] || userx.profilePicture || "/default-cover.jpg"} alt={`${userx.firstname}'s cover`} className="h-full w-full object-cover" />
        </div>
        <CardHeader className="relative mt-[-40px] flex flex-row items-end gap-4 pb-0">
          <Avatar className="h-20 w-20 border-4 border-background">
            <AvatarImage src={userx.profilePicture} alt={userx.username} />
            <AvatarFallback>
              {userx.firstname.charAt(0)}
              {userx.lastname.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h3 className="text-xl font-bold">
              {userx.firstname} {userx.lastname}, {age} {usersViewed.includes(userx.username) && "👁️"}
            </h3>
            <p className="text-sm text-muted-foreground">@{userx.username}</p>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            {userx.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>
                  {userx.location.city}, {userx.location.country}
                </span>
              </div>
            )}
          </div>

          {/* <p className="mb-4 line-clamp-2 text-sm">{userx.biography}</p> */}
          <div className="min-h-[4.5rem] text-sm">{userx.biography || "\u00A0"}</div>
          <p className="mb-4 line-clamp-2 text-sm">I'm interested in: {userx.sexualPreferences.join(", ")}</p>

          <div className="mb-4 flex flex-wrap gap-2">
            {formattedInterests.map((interest) => (
              <Badge key={interest} variant={user?.interests.includes(interest) ? "destructive" : "secondary"}>
                {interest}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-between">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Joined {joinedDate}</span>
            </div>
            <Button onClick={() => setShowDialog(true)}>View Profile</Button>
          </div>
        </CardContent>
      </Card>

      {showDialog && <UserProfileDialog user={userx} isOpen={showDialog} onClose={() => setShowDialog(false)} />}
    </>
  );
}

// Export the calculateAge function so it can be used in the dialog component
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}
