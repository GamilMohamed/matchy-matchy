"use server"
import React, { useState } from 'react';
import { Search, Twitter } from 'lucide-react';


const NavbarAndTable = ({initialUsers}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample user data for the table
//   const initialUsers = Array.from({ length: 100 }, (_, i) => ({
//     rank: i + 1,
//     username: randomString(), 
//     avatar: `https://robohash.org/${i + 1}.png`,
//     points: Math.floor(Math.random() * 10000)
//   }));
  const [users, setUsers] = useState(initialUsers);
  
  // Handle search functionality
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setUsers(initialUsers);
    } else {
      const filteredUsers = initialUsers.filter(user => 
        user.username.toLowerCase().includes(term.toLowerCase())
      );
      setUsers(filteredUsers);
    }
  };
  
  return (
    <div className="flex flex-col bg-gray-900 w-screen h-full">
      {/* Navbar */}
      <nav className="bg-black shadow-lg p-4 border-b border-amber-500">
        <div className="container mx-auto flex justify-between items-center">
          {/* Left side: Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-black font-bold">
              LP
            </div>
            <h1 className="text-xl font-bold text-amber-500">Leaderboard Platform</h1>
          </div>
          
          {/* Right side: Grindboard, Gallery, and Twitter links */}
          <div className="flex items-center space-x-6">
            <a href="#" className="text-gray-300 hover:text-amber-500 font-medium">Grindboard</a>
            <a href="#" className="text-gray-300 hover:text-amber-500 font-medium">Gallery</a>
            <button className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-4 rounded-full transition-colors">
             <img src={"https://img.icons8.com/?size=100&id=fJp7hepMryiw&format=png&color=000000"} alt="Twitter" className="w-5 h-5" />
              <span>Connect Twitter</span>
            </button>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="container mx-auto p-6 flex-grow">
        <div className="bg-black rounded-lg shadow-lg p-6 border border-amber-700">
          <h2 className="text-2xl font-bold mb-6 text-amber-500">User Leaderboard</h2>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 w-full bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-200"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-black text-gray-200">
              <thead>
                <tr className="bg-gray-800 border-b border-gray-700">
                  <th className="py-3 px-6 text-left font-semibold text-amber-500">Rank</th>
                  <th className="py-3 px-6 text-left font-semibold text-amber-500">User</th>
                  <th className="py-3 px-6 text-left font-semibold text-amber-500">
                    <div className="flex items-center space-x-2">
                      <span>Points</span>
                      {/* Bear Paw Icon */}
                      <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.5 11c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM4.5 11c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM12 12c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM15.5 4c0 2.76-2.24 5-5 5s-5-2.24-5-5 2.24-5 5-5 5 2.24 5 5z" />
                      </svg>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.rank} className="border-b border-gray-800 hover:bg-gray-900">
                    <td className="py-3 px-6 text-amber-400">#{user.rank}</td>
                    <td className="py-3 px-6">
                      <div className="flex items-center space-x-3">
                        <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full border border-amber-500" />
                        <span>{user.username}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-amber-400">{user.points.toLocaleString()}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-4 px-6 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NavbarAndTable;