// import React from 'react';
import { useParams } from 'react-router-dom';
import Nav from './Nav';
import Footer from './Footer';

const UserPage = () => {
  // Récupération du paramètre username depuis l'URL
  const { username } = useParams();

  return (
    <div className="flex flex-col justify-between w-screen h-screen h-full">
		<Nav />
    	<h1 className="text-2xl font-bold text-center mb-4">Page Utilisateur</h1>
      
    	<div className="bg-white p-6 rounded-lg border border-gray-200">
    	  <p className="text-lg text-center">
    	    👋 Bonjour <span className="font-bold text-blue-600">{username}</span> !
    	  </p>
    	  <p className="mt-2 text-gray-600 text-center">
    	    Nous sommes ravis de vous accueillir sur votre espace personnel.
    	  </p>
    	</div>
		<Footer />
    </div>
  );
};

export default UserPage;