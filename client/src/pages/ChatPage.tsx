import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocketContext } from '../context/socket-context';
import Chat from '../components/Chat';
import { useAuth } from '../context/auth-context';
import { api } from '../context/auth-context';

const ChatPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { isConnected, connectedUsers } = useSocketContext();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user && username === user.username) {
      navigate('/');
      alert("You cannot chat with yourself.");
    }
    async function isMatched() {
      const res = await api.get(`/users/isMatch/${username}`);
      const isMatched = res.data.isMatch;
      if (!isMatched) {
        navigate('/');
        alert("User not found.");
      }
    }
    isMatched();
  }, [user, username, navigate]);
  
  if (!username) {
    return <div>Invalid user</div>;
  }
  
  const recipientId = username;
  const recipientUsername = username;
  
  const isUserOnline = connectedUsers.includes(recipientId);
  
  return (
    <div className="h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Chat with {recipientUsername}</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-700 px-3 py-1 rounded"
          >
            Back
          </button>
        </div>
      </header>
      
      <div className="container mx-auto flex-1 overflow-hidden shadow-lg border rounded-lg mt-4">
        <div className="h-full">
          {!isConnected ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Connecting to chat server...</p>
            </div>
          ) : (
            <Chat
              recipientUsername={recipientUsername}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;