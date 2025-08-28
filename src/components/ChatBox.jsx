// src/components/ChatBox.jsx
import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// one socket for the module
const socket = io(API_URL, { transports: ['websocket'] });

// normalize any shape we might receive
function normalizeMessage(m) {
  if (!m) {
    return {
      _id: `${Date.now()}-${Math.random()}`,
      text: '',
      sender: { _id: 'unknown', name: 'Someone' },
      createdAt: new Date().toISOString(),
    };
  }
  const sender =
    m.sender && typeof m.sender === 'object'
      ? { _id: m.sender._id || m.senderId || 'unknown', name: m.sender.name || m.senderName || 'Someone' }
      : { _id: m.senderId || 'unknown', name: m.senderName || 'Someone' };

  return {
    _id: m._id || `${Date.now()}-${Math.random()}`,
    text: m.text || '',
    sender,
    createdAt: m.createdAt || new Date().toISOString(),
  };
}

const ChatBox = ({ postId }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);   // always an array
  const [newMessage, setNewMessage] = useState('');
  const listRef = useRef(null);

  // keep scroll inside the chat, not the page
  const scrollToBottom = () => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  };

  // join room + fetch history + live updates
  useEffect(() => {
    if (!user) return;

    socket.emit('joinRoom', { postId });

    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/messages/${postId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.messages) ? data.messages : []);
        setMessages(arr.map(normalizeMessage));
      } catch {
        toast.error('Could not load chat history.');
        setMessages([]); // stay array
      }
    })();

    const onReceive = (msg) => {
      setMessages((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return [...safePrev, normalizeMessage(msg)];
      });
    };
    socket.on('receiveMessage', onReceive);

    return () => {
      socket.off('receiveMessage', onReceive);
      socket.emit('leaveRoom', { postId });
    };
  }, [postId, user]);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    socket.emit('sendMessage', {
      postId,
      senderId: user._id,
      senderName: user.name,
      text: newMessage,
    });
    setNewMessage('');
  };

  const list = Array.isArray(messages) ? messages : [];

  return (
    <div className="flex h-full w-full flex-col">
      {/* scrolls only inside this element, not the page */}
      <div ref={listRef} className="flex-grow overflow-y-auto mb-4 pr-2 overscroll-contain">
        {list.map((msg) => {
          const me = (msg.sender?._id || msg.senderId) === user?._id;
          return (
            <div key={msg._id} className={`mb-3 flex flex-col ${me ? 'items-end' : 'items-start'}`}>
              <div className="text-xs text-gray-500 mb-1 px-1">
                {msg.sender?.name || msg.senderName}
              </div>
              <div className={`inline-block p-2 rounded-lg max-w-xs break-words ${me ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}>
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSendMessage} className="flex flex-shrink-0">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-gray-800"
        />
        <button
          type="submit"
          className="bg-primary hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-r-lg transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
