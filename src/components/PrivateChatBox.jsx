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
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const otherParticipant = conversation.participants.find(
    (p) => p._id !== user._id
  );

  const scrollToBottom = () => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    socket.emit('joinConversation', { conversationId: conversation._id });

    socket.on('receivePrivateMessage', (message) => {
      if (message.conversation === conversation._id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    const fetchMessages = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(
          `${API_URL}/api/conversations/${conversation._id}/messages`,
          config
        );
        setMessages(data);
      } catch (error) {
        toast.error('Could not load chat history.');
      }
    };

    fetchMessages();

    return () => {
      socket.off('receivePrivateMessage');
    };
  }, [conversation._id, user.token]);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      socket.emit('sendPrivateMessage', {
        conversationId: conversation._id,
        senderId: user._id,
        text: newMessage,
      });
      setNewMessage('');
      setShowEmoji(false);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-surface flex items-center flex-shrink-0">
        {/* Back to conversation list (only on mobile/smaller screen) */}
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:underline mr-2 md:hidden"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
        </button>
        <h3 className="font-bold text-secondary text-lg">
          Chat with {otherParticipant?.name}
        </h3>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-3 flex ${
              msg.sender._id === user._id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`py-2 px-3 rounded-2xl shadow-sm max-w-xs break-words ${
                msg.sender._id === user._id
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                  : 'bg-white border text-secondary'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div className="p-4 bg-surface border-t border-gray-200 flex-shrink-0 relative">
        {showEmoji && (
          <div className="absolute bottom-16 left-4 z-50 bg-white shadow-lg rounded-lg">
            <Picker onEmojiClick={onEmojiClick} />
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center">
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className="px-2 text-xl hover:text-primary"
          >
            😊
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary text-secondary mx-2"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg shadow"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default PrivateChatBox;
