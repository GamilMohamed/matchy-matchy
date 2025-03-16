import React, { useState, useEffect, useRef } from "react";
import { useSocketContext } from "../context/socket-context";
import { useAuth } from "../context/auth-context";

interface ChatProps {
  recipientUsername: string;
  conversationId?: string;
}

const Chat: React.FC<ChatProps> = ({ 
  recipientUsername,
  conversationId 
}) => {
  const { user } = useAuth();
  const { 
    isConnected, 
    messages, 
    typingUsers, 
    sendMessage, 
    sendTypingIndicator,
    connectedUsers
  } = useSocketContext();
  
  const [inputMessage, setInputMessage] = useState("");
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Debug information
  useEffect(() => {
    console.log("Current user:", user?.username);
    console.log("All connected users:", connectedUsers);
  }, [user, connectedUsers]);

  // Filter messages for this conversation
  useEffect(() => {
    if (!user) return;
    
    console.log("All messages:", messages);
    const filteredMessages = messages.filter(
      (msg) => 
        (msg.senderUsername === recipientUsername && msg.recipientUsername === user.username) || 
        (msg.senderUsername === user.username && msg.recipientUsername === recipientUsername)
    );
    
    console.log("Filtered messages for conversation:", filteredMessages);
    setConversationMessages(filteredMessages);
  }, [messages, recipientUsername, user]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);
  
  // Handle typing indicator
  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;
    
    return () => {
      clearTimeout(typingTimeout);
      sendTypingIndicator(recipientUsername, false);
    };
  }, [recipientUsername, sendTypingIndicator]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    sendTypingIndicator(recipientUsername, true);
    
    // Clear typing indicator after 2 seconds of no input
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      sendTypingIndicator(recipientUsername, false);
    }, 2000);
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !user) return;
    
    console.log(`Sending message to ${recipientUsername}: ${inputMessage}`);
    
    sendMessage({
      recipientUsername: recipientUsername,
      message: inputMessage,
      conversationId
    });
    
    setInputMessage("");
    sendTypingIndicator(recipientUsername, false);
  };
  
  if (!isConnected) {
    return <div className="text-center p-4">Connecting to chat server...</div>;
  }
  
  const isRecipientOnline = connectedUsers.includes(recipientUsername);
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 p-4 border-b">
        <h2 className="font-semibold">
          {recipientUsername} 
          <span className={`ml-2 inline-block w-3 h-3 rounded-full ${isRecipientOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
        </h2>
        {typingUsers[recipientUsername] && <div className="text-xs text-gray-500">typing...</div>}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {conversationMessages.length === 0 ? (
          <div className="text-center text-gray-500 my-4">No messages yet. Start the conversation!</div>
        ) : (
          conversationMessages.map((msg, index) => (
            <div key={msg.id || index} className={`mb-4 ${msg.senderUsername === user?.username ? "text-right" : "text-left"}`}>
              <div 
                className={`inline-block p-3 rounded-lg ${
                  msg.senderUsername === user?.username 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.message}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
                {msg.senderUsername === user?.username && (
                  <span className="ml-2">
                    {msg.delivered ? "✓✓" : "✓"}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!inputMessage.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;