import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const socket = io('http://localhost:5000');

const ChatBox = ({ postId }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Join the chat room for this post
    socket.emit('joinRoom', { postId });

    // Listen for incoming messages
    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Fetch chat history
    const fetchMessages = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
       const { data } = await axios.get(`${API_URL}/api/messages/${postId}`, config);
        setMessages(data);
      } catch (error) {
        toast.error("Could not load chat history.");
      }
    };
    fetchMessages();

    // Clean up on component unmount
    return () => {
      socket.off('receiveMessage');
    };
  }, [postId, user.token]);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      socket.emit('sendMessage', {
        postId,
        senderId: user._id,
        text: newMessage,
      });
      setNewMessage('');
    }
  };

  return (
    <div className="bg-surface p-6 rounded-xl shadow-md flex flex-col h-96">
      <h3 className="text-lg font-bold text-secondary mb-4 border-b border-gray-200 pb-2">Coordination Chat</h3>
      <div className="flex-grow overflow-y-auto mb-4 pr-2">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-3 ${msg.sender._id === user._id ? 'text-right' : 'text-left'}`}>
            <div className="text-xs text-muted mb-1">{msg.sender.name}</div>
            <div className={`inline-block p-2 rounded-lg ${msg.sender._id === user._id ? 'bg-primary text-white' : 'bg-gray-200 text-secondary'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-2 rounded-l-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-secondary"
        />
        <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-r-lg">Send</button>
      </form>
    </div>
  );
};

export default ChatBox;