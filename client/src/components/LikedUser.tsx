import React, { useState, useEffect } from 'react';
import { User, Heart, X } from 'lucide-react';
import axios from 'axios';
import { formatDistance, set } from 'date-fns';
import { fr } from 'date-fns/locale';

// Import shadcn components
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import api from "@/lib/axios";

interface LikedUser {
  liked_user: string;
  created_at: string;
  profile?: {
    username: string;
	fisrtname: string;
    profile_picture: string;
  };
}

interface ProfileResponse {
  firstname: string;
  profile_picture: string;
  [key: string]: any; // Pour les autres propriétés potentielles
}

// interface LikesResponse {
//   likes: {
//     liked_user: string;
//     created_at: string;
//   }[];
// }

interface LikedUsersProps {
  username: string;
  onUnlike?: (username: string) => void;
}

interface UnlikeRequestData {
  liker: string;
  liked: string;
}

const LikedUsers: React.FC<LikedUsersProps> = ({ username, onUnlike }) => {
  const [likedUsers, setLikedUsers] = useState<LikedUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const fetchLikedUsers = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/users/${username}/likes/sent`);
		const res = response.data as LikedUser[];

		setLikedUsers(res);
		console.log(res);
        
      } catch (err) {
        setError('Impossible de charger les utilisateurs likés');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchLikedUsers();
    }
  }, [username]);

//   const handleUnlike = async (likedUsername: string) => {
//     try {
//       // Appel API pour supprimer le like
//       const requestData: UnlikeRequestData = { liker: username, liked: likedUsername };
//       await axios.delete(`/api/likes`, {
//         data: requestData
//       });
      
//       // Mettre à jour l'état local
//       setLikedUsers(prev => prev.filter(user => user.liked_user !== likedUsername));
      
//       // Informer le composant parent
//       if (onUnlike) {
//         onUnlike(likedUsername);
//       }
//     } catch (error) {
//       console.error('Erreur lors de la suppression du like:', error);
//     }
//   };

  const formatDate = (dateString: string) => {
    return formatDistance(new Date(dateString), new Date(), {
      addSuffix: true,
      locale: fr
    });
  };

  return (
    <Card className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'w-64' : 'w-16'}`}>
      <CardHeader className="p-2 bg-purple-100 flex flex-row items-center justify-between space-y-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-full hover:bg-purple-200 p-2"
          title={isExpanded ? 'Réduire' : 'Voir mes likes'}
        >
          <Heart size={20} className="text-purple-600" />
        </Button>
        {isExpanded && <Badge variant="secondary" className="bg-purple-200 text-purple-800">Mes Likes</Badge>}
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-0">
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              Chargement...
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-red-500">
              {error}
            </div>
          )}

          {!isLoading && !error && (
            <>
              {likedUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Vous n'avez liké personne
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {likedUsers.map((user) => (
                    <div 
                      key={user.liked_user} 
                      className="p-3 border-b hover:bg-purple-50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Avatar>
                          {user.profile?.profile_picture ? (
                            <AvatarImage 
                              src={user.profile.profile_picture} 
                              alt={user.profile?.fisrtname || user.liked_user} 
                            />
                          ) : null}
                          <AvatarFallback className="bg-purple-200">
                            <User size={16} className="text-purple-600" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.profile?.fisrtname || user.liked_user}</p>
                          <p className="text-xs text-gray-500">{formatDate(user.created_at)}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        // onClick={() => handleUnlike(user.liked_user)}
                        className="h-7 w-7 rounded-full hover:bg-red-100 hover:text-red-500"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default LikedUsers;