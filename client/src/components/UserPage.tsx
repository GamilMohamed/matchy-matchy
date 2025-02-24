import React from 'react';
import { useParams } from 'react-router-dom';
import Nav from './Nav';
import Footer from './Footer';

const UserPage = () => {
  // Récupération du paramètre username depuis l'URL
  const { username } = useParams();
  
  // Données utilisateur en dur
  const userData = {
    id: 1,
    name: 'Sophie',
    age: 28,
    location: 'Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    bio: 'Passionnée de découvertes et amateur de nouvelles expériences.',
    interests: ['Voyage', 'Photographie', 'Cuisine', 'Yoga'],
    imageUrl: 'https://placehold.co/400x400/png',
    gender: 'female',
    sexualPreference: ['male', 'non-binary']
  };

  return (
    <div className="from-pink-50 to-purple-100 flex flex-col items-center justify-between w-screen h-screen">
      <Nav />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3">
              <img
                src={userData.imageUrl} 
                alt={`Photo de profil de ${userData.name}`}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="p-6 md:w-2/3">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">
                  {userData.name}, {userData.age}ans
                </h1>
              </div>
              
              <div className="mb-4">
                <p className="flex items-center text-gray-600 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {userData.location}
                </p>
                
                <p className="flex items-center text-gray-600 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {userData.gender === 'female' ? 'Femme' : userData.gender === 'male' ? 'Homme' : userData.gender}
                </p>
                
                <p className="flex items-center text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  Intéressé(e) par : {userData.sexualPreference.map(pref => 
                    pref === 'male' ? 'Hommes' : 
                    pref === 'female' ? 'Femmes' : 
                    pref === 'non-binary' ? 'Personnes non-binaires' : pref
                  ).join(', ')}
                </p>
              </div>
              
              <div className="mb-4">
                <h2 className="text-gray-700 font-semibold mb-2">Bio</h2>
                <p className="text-gray-600">
                  {userData.bio || "Aucune bio renseignée."}
                </p>
              </div>
              
              <div>
                <h2 className="text-gray-700 font-semibold mb-2">Centres d'intérêt</h2>
                <div className="flex flex-wrap gap-2">
                  {userData.interests.map((interest, index) => (
                    <span 
                      key={index} 
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserPage;