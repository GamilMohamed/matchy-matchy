import { User } from "@/types/auth";
import React, { useState, useEffect } from "react";
import { api } from "@/context/auth-context";

function darkenColor(hex: string): string {
  // Remove the # if present
  hex = hex.replace(/^#/, '');
  
  // Parse the hex color
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Darken each channel
  r = Math.max(0, Math.floor(r * (1 - 40 / 100)));
  g = Math.max(0, Math.floor(g * (1 - 40 / 100)));
  b = Math.max(0, Math.floor(b * (1 - 40 / 100)));
  
  // Convert back to hex
  return "#" + 
    r.toString(16).padStart(2, '0') + 
    g.toString(16).padStart(2, '0') + 
    b.toString(16).padStart(2, '0');
}

const TinderCardStack: React.FC = () => {
  const [cards, setCards] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showDetailView, setShowDetailView] = useState<boolean>(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [showClickAnimation, setShowClickAnimation] = useState<boolean>(false);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [likedUsers, setLikedUsers] = useState<string[]>([]);
  const [seenUsers, setSeenUsers] = useState<string[]>([]);

  const randomColor = (): string => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  };

  useEffect(() => {
    async function fetchUsers() {
      const response = await api.get("/users/all");
      const data = response.data;
      for (let i = 0; i < data.length; i++) {
        data[i].color = randomColor();
      }
      setCards(data);

      // Mark the first card as seen when the component mounts and cards are loaded
      if (data.length > 0) {
        setSeenUsers([data[0].email]);
      }
    }
    fetchUsers();
  }, []);

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleLike = (): void => {
    if (isAnimating) return; // Prevent multiple actions while animating
    if (showDetailView) {
      setShowDetailView(false);
    }
    if (!likedUsers.includes(cards[currentIndex].email)) setLikedUsers([...likedUsers, cards[currentIndex].email]);
    setIsAnimating(true);
    setSwipeDirection("right");

    // After animation completes, move to next card
    setTimeout(() => {
      const nextIndex = (currentIndex + 1) % cards.length;
      setCurrentIndex(nextIndex);
      setCurrentImageIndex(0); // Reset image index for the next card
      setSwipeDirection(null);
      setIsAnimating(false);

      // Add the next card's email to seenUsers
      if (!seenUsers.includes(cards[nextIndex].email)) {
        setSeenUsers((prev) => [...prev, cards[nextIndex].email]);
      }
    }, 300);
  };

  const handlePass = (): void => {
    if (isAnimating) return; // Prevent multiple actions while animating
    if (showDetailView) {
      setShowDetailView(false);
    }
    setIsAnimating(true);
    setSwipeDirection("left");

    // After animation completes, move to next card
    setTimeout(() => {
      const nextIndex = (currentIndex + 1) % cards.length;
      setCurrentIndex(nextIndex);
      setCurrentImageIndex(0); // Reset image index for the next card
      setSwipeDirection(null);
      setIsAnimating(false);

      // Add the next card's email to seenUsers
      if (!seenUsers.includes(cards[nextIndex].email)) {
        setSeenUsers((prev) => [...prev, cards[nextIndex].email]);
      }
    }, 300);
  };

  const toggleDetailView = (event?: React.MouseEvent<HTMLButtonElement>): void => {
    if (isAnimating) return; // Don't toggle while animating

    // Only track click position if we have an event (for opening animation)
    if (event && !showDetailView) {
      // Get click position relative to the viewport
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = rect.left + rect.width / 2;
      const clickY = rect.top + rect.height / 2;

      setClickPosition({ x: clickX, y: clickY });
      setShowClickAnimation(true);

      // After a short delay, toggle the detail view
      setTimeout(() => {
        setShowDetailView(true);

        // Reset animation after it's done
        setTimeout(() => {
          setShowClickAnimation(false);
          setClickPosition(null);
        }, 400);
      }, 200);
    } else {
      // For closing, just close immediately
      setShowDetailView(false);
    }
  };

  const nextImage = (): void => {
    const currentCard = cards[currentIndex];
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % currentCard.pictures.length);
  };

  const prevImage = (): void => {
    const currentCard = cards[currentIndex];
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + currentCard.pictures.length) % currentCard.pictures.length);
  };

  // Helper function to get transform styles for cards based on position
  const getCardStyles = (position: number): React.CSSProperties => {
    // Current card
    if (position === 0) {
      // Apply swipe animation if needed
      if (swipeDirection === "left") {
        return {
          zIndex: 10,
          transform: "translateX(-150%) rotate(-20deg)",
          opacity: 1,
          transition: "all 0.7s ease-out",
        };
      } else if (swipeDirection === "right") {
        return {
          zIndex: 10,
          transform: "translateX(150%) rotate(20deg)",
          opacity: 1,
          transition: "all 0.7s ease-out",
        };
      } else {
        return {
          zIndex: 10,
          transform: "translateY(0) scale(1)",
          opacity: 1,
          transition: "all 0.7s ease-out",
        };
      }
    }
    // Cards in the stack
    else {
      // Calculate offset based on position
      const translateY = Math.min(position * 7, 45); // Max 30px down
      const scale = Math.max(1 - position * 0.05, 0.8); // Min scale 0.8

      return {
        zIndex: 10 - position,
        transform: `translateY(${translateY}px) scale(${scale})`,
        transition: "all 0.7s ease-out",
      };
    }
  };

  // Get the current card
  const currentCard = cards[currentIndex];
  console.log("currentCard", currentCard);

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen p-4">
      {/* Click animation overlay */}
      {showClickAnimation && clickPosition && (
        <div
          className="fixed inset-0 z-50 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${clickPosition.x}px ${clickPosition.y}px, 
                         rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 75%)`,
            animation: "pulse-expand 0.6s ease-out forwards",
          }}
        />
      )}

      {/* CSS for animations */}
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes pulse-expand {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 0;
            transform: scale(2.5);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes modal-appear {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1.03);
          }
          70% {
            transform: scale(0.97);
          }
          100% {
            transform: scale(1);
          }
        }
        
        @keyframes button-click {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>

      {/* Overlay for detail view */}
      {showDetailView && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) toggleDetailView();
          }}>
          <div
            className="rounded-lg w-full max-w-lg overflow-hidden flex flex-col shadow-xl"
            style={{
              animation: "modal-appear 300ms ease-out forwards",
              maxHeight: "90vh",
              backgroundColor: darkenColor(currentCard.color),
            }}>
            {/* Header with close button */}
            <div className="flex justify-between items-center p-4">
              <h2 className="text-xl font-bold">
                {currentCard.firstname}, {new Date().getFullYear() - new Date(currentCard.birth_date).getFullYear()} ans
              </h2>
              <button onClick={toggleDetailView} className="rounded-full p-1 hover:bg-gray-100 transition-all" aria-label="Close profile">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content area with scrollable container */}
            <div className="flex flex-col overflow-y-auto" style={{ maxHeight: "calc(90vh - 130px)" }}>
              {/* Image gallery */}
              <div className="relative">
                <div
                  className="h-[400px] relative"
                  style={{
                    backgroundImage: `url(${currentCard.pictures[currentImageIndex]})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}>
                  {/* Image navigation buttons - only show if multiple images */}
                  {currentCard.pictures.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-wxhite bg-opacity-70 rounded-full h-full p-2 shadoxw-md"
                        aria-label="Previous photo">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-whixte bg-opacity-70 rounded-full h-full p-2 shadxow-md"
                        aria-label="Next photo">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Image counter */}
                  {currentCard.pictures.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs">
                      {currentImageIndex + 1}/{currentCard.pictures.length}
                    </div>
                  )}
                </div>

                {/* Image dots indicator */}
                {currentCard.pictures.length > 1 && (
                  <div className="flex justify-center gap-1 py-2">
                    {currentCard.pictures.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`h-2 rounded-full ${currentImageIndex === i ? "w-5 bg-blue-500" : "w-2 bg-gray-300"}`}
                        aria-label={`Go to image ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Location info - separate from the image */}
              <div className="flex items-center gap-1 px-4 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black500" fill="black" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-black700">{currentCard.location.city}, {currentCard.location.country}</span>
              </div>

              {/* Profile content - with proper padding and clear headings */}
              <div className="p-4">
                <h3 className="font-semibold text-black800 text-lg mb-2">Biographie</h3>
                <p className="text-black600 mb-4 leading-relaxed">{currentCard.biography}</p>

                <h3 className="font-semibold text-black800 text-lg mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentCard.interests.map((interest) => (
                    <span key={interest} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-black700">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons - fixed at bottom */}
            <div className="p-4 flex justify-center space-x-8 bg-whxite">
              <button
                onClick={handlePass}
                className="w-14 h-14 bg-white text-red-500 rounded-full flex items-center justify-center shadow-md border border-gray-200 transition-transform active:scale-95"
                aria-label="Pass">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-7 h-7">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <button
                onClick={handleLike}
                className="w-14 h-14 bg-white text-green-500 rounded-full flex items-center justify-center shadow-md border border-gray-200 transition-transform active:scale-95"
                aria-label="Like">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card stack container */}
      <div className="relative w-full max-w-sm h-96">
        {cards.map((card, index) => {
          // Calculate position in stack relative to current card
          const position = (index - currentIndex + cards.length) % cards.length;

          // Only render visible cards (current + next few in stack)
          if (position > 3) return null;

          // Get styles based on position
          const style = getCardStyles(position);

          return (
            <div key={card.username} style={style} className="absolute top-0 left-0 w-full rounded-xl shadow-lg overflow-hidden">
              {/* Card content */}
              <div
                className="bg-white h-full flex flex-col"
				
                style={{ backgroundImage: `url(${card.pictures[currentImageIndex]})`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: card.color }}>
				
                {/* Profile "image" area */}
				                  {/* <img src={card.pictures[currentImageIndex] as string} alt="profile" /> */}
                  {/* <p className="text-red-200">{card.pictures[currentImageIndex] as string}</p> */}
                  {/* Avatar placeholder */}
                  {/* <div className="w-20 h-20 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                    <span className="text-4xl text-white">{card.firstname.charAt(0)}</span>
                  </div>
                   */}
                  {/* Swipe indicators */}
                <div className={`h-60 relative flex items-center justify-center`}>
                  {position === 0 && swipeDirection && (
                    <div className={`absolute ${swipeDirection === "left" ? "left-4" : "right-4"} top-4`}>
                      <div
                        className={`transform ${swipeDirection === "left" ? "rotate-[-15deg]" : "rotate-15"} 
                                      border-4 rounded-lg px-3 py-1 font-bold text-xl
                                      ${swipeDirection === "left" ? "border-red-500 text-red-500" : "border-green-500 text-green-500"}`}>
                        {swipeDirection === "left" ? "NOPE" : "LIKE"}
                      </div>
                    </div>
                  )}

                  {/* Image counter (only on current card) */}
                  {position === 0 && card.pictures.length > 1 && (
                    <div className="absolute top-2 right-2 flex space-x-1">
                      {card.pictures.map((_, i) => (
                        <div key={i} className={`h-1 rounded-full ${currentImageIndex === i ? "w-4 bg-white" : "w-1 bg-white bg-opacity-50"}`} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Text content area */}
                <div className="p-4 flex-1 flex flex-col bg-white/80 rounded-xl m-2">
                  {/* Name and age */}
                  <div className="flex items-baseline">
                    <h3 className="text-xl font-bold text-black800">{card.firstname}</h3>
                    <span className="ml-2 text-black600">{new Date().getFullYear() - new Date(card.birth_date).getFullYear()}</span>
                  </div>

                  {/* location.city */}
                  <div className="flex items-center mt-1 text-sm text-black500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {card.location.country} miles away
                  </div>

                  {/* biography - truncated */}
                  <p className="mt-2 text-black600 flex-grow text-sm line-clamp-3">{card.biography.length > 100 ? card.biography.substring(0, 100) + "..." : card.biography}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center space-x-6 mt-6">
        {/* Pass button */}
        <button
          onClick={handlePass}
          disabled={(isAnimating && swipeDirection !== "left") || showDetailView}
          className="w-14 h-14 bg-white text-red-500 rounded-full flex items-center justify-center shadow hover:shadow-md border border-gray-200 disabled:opacity-50 active:scale-95 transition-transform"
          aria-label="Pass">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Info button */}
        <button
          onClick={toggleDetailView}
          disabled={isAnimating}
          className={`w-10 h-10 ${
            showDetailView ? "bg-blue-500 text-white" : "bg-white text-blue-500"
          } rounded-full flex items-center justify-center shadow hover:shadow-md border border-gray-200 disabled:opacity-50 active:scale-95 transition-transform`}
          aria-label="Details"
          style={{ animation: showClickAnimation ? "button-click 0.7s ease-in-out" : "none" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </button>

        {/* Like button */}
        <button
          onClick={handleLike}
          disabled={(isAnimating && swipeDirection !== "right") || showDetailView}
          className="w-14 h-14 bg-white text-green-500 rounded-full flex items-center justify-center shadow hover:shadow-md border border-gray-200 disabled:opacity-50 active:scale-95 transition-transform"
          aria-label="Like">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </button>
      </div>

      {/* Seen Users Data Display */}
      <div className="w-full max-w-md border border-gray-200 rounded-lg p-4 bg-white absolute top-4 right-4">
        <h3 className="text-lg font-semibold mb-2">User Tracking Data</h3>

        <div className="mb-4">
          <h4 className="font-medium text-black700 mb-1">Seen Users ({seenUsers.length})</h4>
          <div className="max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-sm">
            {seenUsers.map((email) => (
              <div key={email} className="py-1 border-gray-100 last:border-b-0">
                {email}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-2">
          <h4 className="font-medium text-black700 mb-1">Liked Users ({likedUsers.length})</h4>
          <div className="max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-sm">
            {likedUsers.map((email) => (
              <div key={email} className="py-1 border-b border-gray-100 last:border-b-0">
                {email}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TinderCardStack;
