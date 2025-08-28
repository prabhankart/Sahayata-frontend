import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import Picker from 'emoji-picker-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_URL);

const PrivateChatBox = ({ conversation, onBack }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const endRef = useRef(null);

  const other = conversation.participants.find((p) => p._id !== user._id);
  const toBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    socket.emit('joinConversation', { conversationId: conversation._id });

    const onReceive = (m) => {
      if (m.conversation === conversation._id) {
        setMessages((prev) => [...prev, m]);
      }
    };
    socket.on('receivePrivateMessage', onReceive);

    (async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/conversations/${conversation._id}/messages`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setMessages(data.data || []);
      } catch {
        toast.error('Could not load chat history.');
      }
    })();

    return () => socket.off('receivePrivateMessage', onReceive);
  }, [conversation._id, user.token]);

  useEffect(toBottom, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    socket.emit('sendPrivateMessage', {
      conversationId: conversation._id,
      senderId: user._id,
      text: newMessage,
    });
    setNewMessage('');
    setShowEmoji(false);
  };

  const onEmojiClick = (emojiObject) =>
    setNewMessage((prev) => prev + emojiObject.emoji);

  return (
    <div className="flex flex-col h-[100dvh] max-h-[100dvh]">
      <div className="p-4 border-b border-gray-200 bg-surface flex items-center">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:underline mr-2 md:hidden"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back
        </button>
        <h3 className="font-bold text-secondary text-lg truncate">Chat with {other?.name}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 pb-28">
        {messages.map((msg, i) => {
          const mine = msg.sender?._id === user._id;
          return (
            <div
              key={i}
              className={`mb-3 flex ${mine ? 'justify-end' : 'justify-start'} animate-fade`}
            >
              <div
                className={`py-2 px-3 rounded-2xl shadow-sm break-words
                  max-w-[80%] sm:max-w-md md:max-w-lg
                  ${mine ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' : 'bg-white border text-secondary'}`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="relative">
        {showEmoji && (
          <div className="absolute bottom-16 right-4 z-50 bg-white shadow-lg rounded-lg">
            <Picker onEmojiClick={onEmojiClick} />
          </div>
        )}
        <div className="sticky bottom-[env(safe-area-inset-bottom)] left-0 right-0 p-3 bg-surface border-t border-gray-200">
          <form onSubmit={send} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className="px-2 text-xl hover:text-primary shrink-0"
            >
              😊
            </button>
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="min-w-0 flex-1 rounded-2xl px-4 py-2 border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              className="shrink-0 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow hover:bg-primary-hover"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PrivateChatBox;
