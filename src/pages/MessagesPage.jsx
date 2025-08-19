import { useState, useEffect, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PrivateChatBox from '../components/PrivateChatBox';
import Spinner from '../components/Spinner';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

// Define the base URL for your API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MessagesPage = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) return;
    const fetchConversations = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        // Use the dynamic API_URL
        const { data } = await axios.get(`${API_URL}/api/conversations`, config);
        setConversations(data);
        if (location.state?.conversationId) {
            const preselected = data.find(c => c._id === location.state.conversationId);
            if (preselected) setSelectedConversation(preselected);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user.token, location.state]);

  const getOtherParticipant = (convo) => {
    return convo.participants.find(p => p._id !== user._id);
  };

  if (loading) return <Spinner />;

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-cream">
      {/* --- Left Column: Conversation List --- */}
      <div className={`w-full md:w-1/3 border-r border-gray-200 bg-surface flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-secondary">Chats</h2>
        </div>
        {conversations.length > 0 ? (
          <ul className="overflow-y-auto">
            {conversations.map(convo => (
              <li key={convo._id} onClick={() => setSelectedConversation(convo)} 
                  className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedConversation?._id === convo._id ? 'bg-purple-100' : ''}`}>
                <p className="font-semibold text-secondary">{getOtherParticipant(convo)?.name}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex-grow flex flex-col justify-center items-center text-center p-4">
            <h3 className="font-semibold text-secondary">No Conversations Yet</h3>
            <p className="text-sm text-muted mt-2">Find a friend on the Connect page to start a new chat.</p>
            <Link to="/connect" className="mt-4 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg text-sm">
              Find Friends
            </Link>
          </div>
        )}
      </div>

      {/* --- Right Column: Chat Window --- */}
      <div className={`w-full md:w-2/3 flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
        {selectedConversation ? (
          <PrivateChatBox 
            key={selectedConversation._id} 
            conversation={selectedConversation}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="flex-grow flex justify-center items-center text-muted text-center p-4">
            <div>
              <h3 className="text-xl font-semibold text-secondary">Select a conversation</h3>
              <p className="mt-1">Choose a chat from the left panel to see your messages.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;