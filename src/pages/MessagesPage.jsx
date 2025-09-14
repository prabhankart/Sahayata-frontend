import { useState, useEffect, useContext } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import PrivateChatBox from '../components/PrivateChatBox';
import Spinner from '../components/Spinner';
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_URL, { transports: ['websocket'] });

const MessagesPage = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  // unread counts: { [conversationId]: number }
  const [unread, setUnread] = useState({});

  // dynamic viewport height -> --app-dvh (prevents mobile jump)
  useEffect(() => {
    const setDvh = () => {
      const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      document.documentElement.style.setProperty('--app-dvh', `${h}px`);
    };
    setDvh();
    window.addEventListener('resize', setDvh);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', setDvh);
    return () => {
      window.removeEventListener('resize', setDvh);
      if (window.visualViewport) window.visualViewport.removeEventListener('resize', setDvh);
    };
  }, []);

  // Load conversations + initial unread counts
  useEffect(() => {
    if (!user?.token) return;

    const fetchConversations = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${API_URL}/api/conversations`, config);
        setConversations(data);

        // Seed unread counts if API provides unreadCount; fallback to 0
        const counts = {};
        (data || []).forEach(c => {
          counts[c._id] = typeof c.unreadCount === 'number' ? c.unreadCount : 0;
        });
        setUnread(counts);

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

  // Live: bump unread on incoming messages not in the open thread
  useEffect(() => {
    if (!user?._id) return;

    const onReceive = (m) => {
      if (!m?.conversation) return;
      const isMine = (m.sender?._id || m.sender) === user._id;
      const isOpen = selectedConversation?._id === m.conversation;
      if (isMine || isOpen) return;

      setUnread(prev => ({
        ...prev,
        [m.conversation]: (prev[m.conversation] || 0) + 1,
      }));
    };

    socket.on('receivePrivateMessage', onReceive);
    return () => socket.off('receivePrivateMessage', onReceive);
  }, [selectedConversation?._id, user?._id]);

  // When opening a conversation, clear its unread and (optimistically) mark as read on server
  useEffect(() => {
    if (!selectedConversation?._id || !user?.token) return;

    // zero the badge immediately for snappy UX
    setUnread(prev => ({ ...prev, [selectedConversation._id]: 0 }));

    // optional server call (safe to keep even if your API ignores it)
    axios
      .post(
        `${API_URL}/api/conversations/${selectedConversation._id}/read`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      .catch(() => {/* ignore */});
  }, [selectedConversation?._id, user?.token]);

  const getOtherParticipant = (convo) => {
    return convo.participants.find(p => p._id !== user._id);
  };

  const totalUnread = Object.values(unread).reduce((a, b) => a + (b || 0), 0);

  if (loading) return <Spinner />;

  return (
    <div
      className="fixed inset-0 bg-cream overflow-hidden flex flex-col md:flex-row"
      style={{ height: 'var(--app-dvh, 100dvh)' }}
    >
      {/* Left column */}
      <div
        className={`w-full md:w-[360px] lg:w-[420px] h-full border-r border-gray-200 bg-surface flex flex-col ${
          selectedConversation ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-3 md:p-4 border-b border-gray-200 flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center px-4 py-2 rounded-md bg-primary text-white md:bg-gray-100 md:text-gray-700 hover:md:bg-gray-200 transition shadow-sm w-full md:w-auto"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            <span className="md:hidden">Back</span>
          </button>

          <h2 className="text-base md:text-xl font-bold text-secondary flex items-center gap-2">
            Chats
            {totalUnread > 0 && (
              <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-2 rounded-full bg-red-500 text-white text-xs font-bold">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </h2>
        </div>

        {conversations.length > 0 ? (
          <ul className="flex-1 overflow-y-auto overscroll-contain">
            {conversations.map((convo) => {
              const count = unread[convo._id] || 0;
              const active = selectedConversation?._id === convo._id;
              return (
                <li
                  key={convo._id}
                  onClick={() => setSelectedConversation(convo)}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-100 ${
                    active ? 'bg-purple-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <p
                      className={`font-semibold text-secondary flex-1 truncate ${
                        count > 0 ? 'font-extrabold' : ''
                      }`}
                    >
                      {getOtherParticipant(convo)?.name}
                    </p>
                    {count > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-2 rounded-full bg-red-500 text-white text-xs font-bold">
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
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
        className={`flex-1 h-full flex flex-col ${
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
