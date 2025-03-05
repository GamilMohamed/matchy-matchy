import { useAuth } from "@/context/auth-context";
import { User } from "@/types/auth";
import { useEffect, useState } from "react";
import { api } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function Test() {
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
      <h1 className="text-2xl font-bold mb-4">User Profiles</h1>
      <Card className="w-1/2 mb-2">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Username: </span>
              {user?.username}
            </div>
            <div className="text-sm">
              <span className="font-medium">Email: </span>
              {user?.email}
            </div>
            {user?.firstname && (
              <div className="text-sm">
                <span className="font-medium">Name: </span>
                {user?.firstname}
              </div>
            )}
            {/* Add more fields as needed */}
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-gray-500">View all details</summary>
              <div className="mt-2 text-xs overflow-auto max-h-48 p-2 bg-x-50 rounded">
                <pre>{JSON.stringify(user, null, 2)}</pre>
              </div>
            </details>
          </div>
        </CardContent>
      </Card>

      {allProfiles.length === 0 ? (
        <p>No profiles found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allProfiles.map((profile) => (
            <Card key={profile.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{profile.username}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Email: </span>
                    {profile.email}
                  </div>
                  {profile.firstname && (
                    <div className="text-sm">
                      <span className="font-medium">Name: </span>
                      {profile.firstname}
                    </div>
                  )}
                  {/* Add more fields as needed */}

                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-500">View all details</summary>
                    <div className="mt-2 text-xs overflow-auto max-h-48 p-2 bg-x-50 rounded">
                      <pre>{JSON.stringify(profile, null, 2)}</pre>
                    </div>
                  </details>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
