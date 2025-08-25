import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const socket = io(API_URL);

const ChatBox = ({ postId }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket.emit('joinRoom', { postId });
    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    const fetchMessages = async () => {
      try {
        if (!user) return; // Ensure user exists before fetching
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${API_URL}/api/messages/${postId}`, config);
        setMessages(data);
      } catch (error) {
        toast.error("Could not load chat history.");
      }
    };
    fetchMessages();

    return () => {
      socket.off('receiveMessage');
    };
  }, [postId, user]); // Simplified dependency array

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      socket.emit('sendMessage', {
        postId,
        senderId: user._id,
        senderName: user.name, // Sending name directly can be helpful
        text: newMessage,
      });
      setNewMessage('');
    }
  };

  return (
    // This parent div needs to control the height and layout
    <div className="flex flex-col h-full w-full">
      {/* This is the scrollable area for messages.
        ✅ UPDATED: Added `overscroll-contain` to stop scroll chaining.
      */}
      <div className="flex-grow overflow-y-auto mb-4 pr-2 overscroll-contain">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-3 flex flex-col ${msg.sender._id === user._id || msg.senderId === user._id ? 'items-end' : 'items-start'}`}>
            <div className="text-xs text-gray-500 mb-1 px-1">{msg.sender?.name || msg.senderName}</div>
            <div className={`inline-block p-2 rounded-lg max-w-xs break-words ${msg.sender._id === user._id || msg.senderId === user._id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex flex-shrink-0">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-gray-800"
        />
        <button type="submit" className="bg-primary hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-r-lg transition-colors">Send</button>
      </form>
    </div>
  );
};

export default ChatBox;