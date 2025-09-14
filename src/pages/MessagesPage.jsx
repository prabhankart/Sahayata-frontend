import { useState, useEffect, useContext } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PrivateChatBox from '../components/PrivateChatBox';
import Spinner from '../components/Spinner';
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MessagesPage = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) return;

    const fetchConversations = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
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
  }, [user?.token, location.state]);

  const getOtherParticipant = (convo) => {
    return convo.participants.find(p => p._id !== user._id);
  };

  if (loading) return <Spinner />;

  return (
    <div className="flex min-h-[100dvh] bg-cream overflow-hidden overscroll-contain">
      {/* Left column */}
      <div
        className={`w-full md:w-1/3 h-full border-r border-gray-200 bg-surface flex flex-col ${
          selectedConversation ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition shadow-sm"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-xl font-bold text-secondary ml-3">Chats</h2>
        </div>

        {conversations.length > 0 ? (
          <ul className="flex-1 overflow-y-auto overscroll-contain">
            {conversations.map((convo) => (
              <li
                key={convo._id}
                onClick={() => setSelectedConversation(convo)}
                className={`p-4 cursor-pointer hover:bg-gray-100 ${
                  selectedConversation?._id === convo._id ? 'bg-purple-100' : ''
                }`}
              >
                <p className="font-semibold text-secondary">
                  {getOtherParticipant(convo)?.name}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
            <h3 className="font-semibold text-secondary">No Conversations Yet</h3>
            <p className="text-sm text-muted mt-2">
              Find a friend on the Connect page to start a new chat.
            </p>
            <Link
              to="/connect"
              className="mt-4 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg text-sm"
            >
              Find Friends
            </Link>
          </div>
        )}
      </div>

      {/* Right column */}
      <div
        className={`w-full md:w-2/3 h-full flex flex-col ${
          selectedConversation ? 'flex' : 'hidden md:flex'
        }`}
      >
        {selectedConversation ? (
          <PrivateChatBox
            key={selectedConversation._id}
            conversation={selectedConversation}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="flex-1 flex justify-center items-center text-muted text-center p-4">
            <div>
              <h3 className="text-xl font-semibold text-secondary">
                Select a conversation
              </h3>
              <p className="mt-1">
                Choose a chat from the left panel to see your messages.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
