import { useEffect, useState, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import api from "@/services/api";
import { useAuth } from "@/context/auth-context";
import { User } from "@/types/auth";
import { format } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { HeartIcon, MessageCircleIcon, MapPinIcon, CalendarIcon, SendIcon } from "lucide-react";
import { useSocketContext } from "@/context/socket-context";

const UserPage = () => {
  const { username} = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [userData, setUserData] = useState<User>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(queryParams.get('chat') === 'true');
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const { 
    isConnected, 
    messages, 
    typingUsers,
    sendMessage, 
    sendTypingIndicator,
    connectedUsers
  } = useSocketContext();

  const [conversationMessages, setConversationMessages] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUser() {
      try {
        setIsLoading(true);
        const res = await api.get(`/users/${username}`);
        setUserData(res.data);
        setError(null);
      } catch (err) {
        setError("Failed to load user data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (username) {
      fetchUser();
    }
  }, [username]);

  // Debug information
  useEffect(() => {
    console.log("Current user:", user?.username);
    console.log("Profile user:", username);
    console.log("All connected users:", connectedUsers);
  }, [user, username, connectedUsers]);

  // Filter messages for this conversation
  useEffect(() => {
    if (!user || !username) return;
    
    console.log("All messages:", messages);
    const filteredMessages = messages.filter(
      (msg) => 
        (msg.senderUsername === username && msg.recipientUsername === user.username) || 
        (msg.senderUsername === user.username && msg.recipientUsername === username)
    );
    
    console.log("Filtered messages for conversation:", filteredMessages);
    setConversationMessages(filteredMessages);
  }, [messages, username, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversationMessages, chatOpen]);

  // Handle typing indicator
  useEffect(() => {
    if (!username) return;
    
    let typingTimeout: NodeJS.Timeout;
    
    return () => {
      clearTimeout(typingTimeout);
      sendTypingIndicator(username, false);
    };
  }, [username, sendTypingIndicator]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    
    if (username) {
      sendTypingIndicator(username, true);
      
      // Clear typing indicator after 2 seconds of no input
      clearTimeout(window.typingTimeout);
      window.typingTimeout = setTimeout(() => {
        sendTypingIndicator(username, false);
      }, 2000);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputMessage.trim() || !user || !username) return;
    
    console.log(`Sending message to ${username}: ${inputMessage}`);
    
    sendMessage({
      recipientUsername: username,
      message: inputMessage
    });
    
    setInputMessage("");
    
    if (username) {
      sendTypingIndicator(username, false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!userData) return <div>No user data found</div>;

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const canChat = userData.is_liked && userData.is_likedback;
  const isRecipientOnline = username ? connectedUsers.includes(username) : false;

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-4 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Profile Card */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-2">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userData.profile_picture} alt={userData.firstname} />
              <AvatarFallback>
                {userData.firstname?.[0]}
                {userData.lastname?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mt-2 sm:mt-0">
                {userData.firstname} {userData.lastname}
              </h2>
              <div className="flex items-center text-gray-500 gap-2">
                <MapPinIcon className="h-4 w-4" />
                <span>{userData.location?.city || "Boulogne-Billancourt"}</span>
              </div>
              <div className="flex items-center text-gray-500 gap-2 mt-1">
                <CalendarIcon className="h-4 w-4" />
                <span>{calculateAge(userData.birth_date)} years old</span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-auto flex flex-wrap gap-2">
              {userData.is_liked && (
                <Badge className="bg-red-500">
                  <HeartIcon className="h-4 w-4 mr-1" />
                  Liked
                </Badge>
              )}
              {canChat && (
                <Button 
                  onClick={() => setChatOpen(true)} 
                  variant="outline" 
                  size="sm"
                >
                  <MessageCircleIcon className="h-4 w-4 mr-1" />
                  Chat
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className="mb-4 text-gray-600">{userData.biography}</div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {userData.interests && userData.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="capitalize py-1 px-2 text-sm">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gallery Card */}
        <Card className="col-span-1">
          <CardHeader>
            <h3 className="text-lg font-medium">Photos</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              {userData.pictures && userData.pictures.map((pic, index) => (
                <div key={index} className="aspect-square rounded-md overflow-hidden">
                  <img src={pic} alt={`${userData.firstname}'s photo ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Dialog */}
      <Dialog open={chatOpen && canChat} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>
              Chat with {userData.firstname} 
              <span className={`ml-2 inline-block w-3 h-3 rounded-full ${isRecipientOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            </DialogTitle>
          </DialogHeader>

          <div className="h-56 sm:h-64 overflow-y-auto border rounded-md p-3 mb-4">
            {!isConnected ? (
              <div className="text-center p-4">Connecting to chat server...</div>
            ) : conversationMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                Send a message to start chatting with {userData.firstname}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {conversationMessages.map((msg, index) => (
                  <div 
                    key={msg.id || index} 
                    className={`mb-4 ${msg.senderUsername === user?.username ? "text-right" : "text-left"}`}
                  >
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
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
            {typingUsers[username || ''] && (
              <div className="text-xs text-gray-500 ml-2">{userData.firstname} is typing...</div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
              disabled={!isConnected}
            />
            <Button 
              onClick={() => handleSendMessage()} 
              size="icon" 
              className="flex-shrink-0"
              disabled={!inputMessage.trim() || !isConnected}
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserPage;