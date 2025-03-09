import React, { useState, useEffect } from "react";
import { Heart, X, ChevronLeft, ChevronRight } from "lucide-react";

// Sample data - replace with your actual user data
// const sampleUsers = [
//   { id: 1, name: "Alex Johnson", age: 28, bio: "Software engineer who loves hiking and photography", imageUrl: "/api/placeholder/400/500" },
//   { id: 2, name: "Jamie Smith", age: 32, bio: "Travel enthusiast and food blogger", imageUrl: "/api/placeholder/400/500" },
//   { id: 3, name: "Taylor Wilson", age: 26, bio: "Artist and musician looking for inspiration", imageUrl: "/api/placeholder/400/500" },
//   { id: 4, name: "Casey Brown", age: 31, bio: "Fitness instructor and nutrition coach", imageUrl: "/api/placeholder/400/500" },
//   { id: 5, name: "Jordan Lee", age: 29, bio: "Adventure seeker and outdoor enthusiast", imageUrl: "/api/placeholder/400/500" },
// ];

const UserCardCarousel = ({ sampleUsers }: { sampleUsers: User[] }) => {
  const [users, setUsers] = useState(sampleUsers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animation, setAnimation] = useState<"slide-right" | "slide-left" | null>(null);
  const [actionPerformed, setActionPerformed] = useState<"like" | "pass" | null>(null);

  const handleAction = (action: "like" | "pass") => {
    setActionPerformed(action);
    setAnimation(action === "like" ? "slide-right" : "slide-left");

    // Delay the actual action to allow for animation
    setTimeout(() => {
      const newUsers = [...users];
      newUsers.splice(currentIndex, 1);

      if (newUsers.length === 0) {
        // Reset to demo data if all cards are gone
        setUsers(sampleUsers);
        setCurrentIndex(0);
      } else {
        setUsers(newUsers);
        setCurrentIndex((prev) => (prev >= newUsers.length ? 0 : prev));
      }

      setAnimation(null);
      setActionPerformed(null);
    }, 500);
  };

  const nextUser = () => {
    setCurrentIndex((prev) => (prev + 1) % users.length);
  };

  const prevUser = () => {
    setCurrentIndex((prev) => (prev - 1 + users.length) % users.length);
  };

  if (users.length === 0) {
    return <div className="flex items-center justify-center h-64">No more users to display!</div>;
  }

  const currentUser = users[currentIndex];

  return (
    <div className="flex flex-col items-center max-w-md mx-auto">
      <div className="relative w-full">
        {/* Card */}
        <div
          className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-500 transform ${
            animation === "slide-right" ? "translate-x-full opacity-0" : animation === "slide-left" ? "-translate-x-full opacity-0" : ""
         
         
         }
         
         `}>
          <div className="relative">
            <img src={currentUser.profile_picture} alt={currentUser.firstname} className="w-full h-96 object-cover" />

            {/* Action indicator overlay */}
            {actionPerformed && (
              <div className={`absolute inset-0 flex items-center justify-center bg-opacity-50 ${actionPerformed === "like" ? "bg-green-500" : "bg-red-500"}`}>
                {actionPerformed === "like" ? <Heart size={80} className="text-white" fill="white" /> : <X size={80} className="text-white" />}
              </div>
            )}

            {/* User info */}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-4">
              <h2 className="text-white text-xl font-bold">{currentUser.firstName}</h2>
            </div>
          </div>

          <div className="p-4">
            <p className="text-gray-700">{currentUser.biography}</p>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 flex w-full justify-between px-4 pointer-events-none">
          <button onClick={prevUser} className="bg-white rounded-full p-2 shadow-lg pointer-events-auto" aria-label="Previous user">
            <ChevronLeft className="text-gray-700" />
          </button>
          <button onClick={nextUser} className="bg-white rounded-full p-2 shadow-lg pointer-events-auto" aria-label="Next user">
            <ChevronRight className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center mt-6 space-x-8">
        <button
          onClick={() => handleAction("pass")}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg transition-transform active:scale-95"
          aria-label="Pass">
          <X size={32} />
        </button>
        <button
          onClick={() => handleAction("like")}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-transform active:scale-95"
          aria-label="Like">
          <Heart size={32} />
        </button>
      </div>

      {/* Progress indicator */}
      <div className="flex mt-6 space-x-1">
        {users.map((_, index) => (
          <div key={index} className={`h-1 rounded-full ${index === currentIndex ? "bg-blue-500 w-6" : "bg-gray-300 w-4"}`} />
        ))}
      </div>
    </div>
  );
};

export default UserCardCarousel;
