import React, { useState, useEffect } from 'react';
import { User, MessageSquare, Heart } from 'lucide-react';
import api from "@/lib/axios";
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/router';

interface Match {
  match_with: string;
  matched_at: string;
  profile?: {
    username: string;
    firstname: string;
    profile_picture: string;
  };
}

interface MatchesProps {
  username: string;
}

const Matches: React.FC<MatchesProps> = ({ username }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer les informations de profil pour chaque match
        const matchResponse = await api.get(`/:username`);
        const matchData = matchResponse.data as Match[];
        
        setMatches(matchData);
        console.log(matchData);

      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchMatches();
    }
  }, [username]);

  const goToChat = (matchUsername: string) => {
    router.push(`/chat/${matchUsername}`);
  };

  const formatDate = (dateString: string) => {
    return formatDistance(new Date(dateString), new Date(), {
      addSuffix: true,
      locale: fr
    });
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'}`}>
      <div className="p-2 bg-green-100 flex justify-between items-center">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-full hover:bg-green-200 transition-colors"
        >
          <Heart size={20} className="text-green-600" />
        </button>
        {isExpanded && <h3 className="font-medium text-green-800">Mes Matchs</h3>}
      </div>

      {isLoading && isExpanded && (
        <div className="p-4 text-center text-gray-500">
          Chargement...
        </div>
      )}

      {/* {error && isExpanded && (
        <div className="p-4 text-center text-red-500">
          {error}
        </div>
      )} */}

      {!isLoading && isExpanded && (
        <>
          {matches.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Pas de matchs pour le moment
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto">
              {matches.map((match) => (
                <div key={match.match_with} className="p-3 border-b hover:bg-green-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-green-200 flex items-center justify-center">
                      {match.profile?.profile_picture ? (
                        <img 
                          src={match.profile.profile_picture} 
                          alt={match.profile?.firstname || match.match_with} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={20} className="text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{match.profile?.firstname || match.match_with}</p>
                      <p className="text-xs text-gray-500">{formatDate(match.matched_at)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => goToChat(match.match_with)}
                    className="p-1 rounded-full hover:bg-green-200 text-green-600 transition-colors"
                  >
                    <MessageSquare size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Matches;