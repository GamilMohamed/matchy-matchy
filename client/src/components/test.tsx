import { useAuth } from "@/context/auth-context";
import { User } from "@/types/auth";
import { useEffect, useState } from "react";
import { api } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import UserList from "./UsersList";
import UserCarousel from "./user-carousel";

export default function Test() {
  // wait 15 seconds before rendering the component
  // to simulate a slow network request

  const { user } = useAuth();
  const [allProfiles, setAllProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfiles() {
      try {
        setLoading(true);
        const res = await api.get("/users/all");
        console.log("Profiles loaded:", res.data);
        const users = res.data;
        const profilesWithoutMine = users.filter((profile: User) => profile.username !== user?.username);
        setAllProfiles(profilesWithoutMine);
        const sortUserByGeoLocFromUser = (a: User, b: User) => {
          const posa = Math.sqrt(Math.pow(a.location.latitude - user?.location.latitude, 2) + Math.pow(a.location.longitude - user?.location.longitude, 2));
          const posb = Math.sqrt(Math.pow(b.location.latitude - user?.location.latitude, 2) + Math.pow(b.location.longitude - user?.location.longitude, 2));
          return posa - posb;
        };
        setAllProfiles(profilesWithoutMine.sort(sortUserByGeoLocFromUser));
          
      } catch (err) {
        console.error("Error loading profiles:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-lg">Loading profiles...</p>
      </div>
    );
  }


  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">User Profiles</h1>
      {allProfiles.length === 0 ? (
        <p>No profiles found.</p>
      ) : (
        <UserList users={allProfiles} />
        )}
    </div>
  );
}
