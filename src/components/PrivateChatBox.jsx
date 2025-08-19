import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
const socket = io('http://localhost:5000');

const PrivateChatBox = ({ conversation ,onBack}) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const otherParticipant = conversation.participants.find(p => p._id !== user._id);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };

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
        const { data } = await axios.get(`http://localhost:5000/api/conversations/${conversation._id}/messages`, config);
        setMessages(data);
      } catch (error) {
        toast.error("Could not load chat history.");
      }
    };
    fetchMessages();

    return () => { socket.off('receivePrivateMessage'); };
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
    }
  };

  return (
    <>
      <div className="p-4 border-b border-gray-200 bg-surface flex items-center">
        {/* The new back button, only visible on mobile */}
        <button onClick={onBack} className="md:hidden mr-4 text-muted hover:text-secondary">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h3 className="font-bold text-secondary">Chat with {otherParticipant?.name}</h3>
      </div>
      <div className="p-4 border-b border-gray-200 bg-surface">
        <h3 className="font-bold text-secondary">Chat with {otherParticipant?.name}</h3>
      </div>
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-3 flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}>
            <div className={`py-2 px-3 rounded-lg max-w-xs ${msg.sender._id === user._id ? 'bg-primary text-white' : 'bg-gray-200 text-secondary'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-surface border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." className="flex-grow p-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary text-secondary" />
          <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-r-lg">Send</button>
        </form>
      </div>
    </>
  );
};

export default PrivateChatBox;