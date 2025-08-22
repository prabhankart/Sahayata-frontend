import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { UserPlusIcon, ChatBubbleLeftEllipsisIcon, ClockIcon, BellAlertIcon } from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UserCard = ({ otherUser, friendshipStatus }) => {
  const { user: loggedInUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAddFriend = async () => {
    if (!loggedInUser) return toast.error("You must be logged in to add friends.");

    try {
      const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
      const { data } = await axios.post(`${API_URL}/api/friends/request/${otherUser._id}`, {}, config);
      toast.success(data.message);
      // This line tells the parent page to refresh its data, which updates the button
      fetchFriendships(loggedInUser.token);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send request.");
    }
  };

  const handleStartChat = async () => {
    if (!loggedInUser) return toast.error("You must be logged in.");
    try {
      const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
      const { data } = await axios.post(`${API_URL}/api/conversations/start/${otherUser._id}`, {}, config);
      navigate('/messages', { state: { conversationId: data._id } });
    } catch (error) {
      toast.error("Could not start chat.");
    }
  };

  const renderButton = () => {
    switch (friendshipStatus) {
      case 'friends':
        return (
          <button onClick={handleStartChat} className="bg-purple-100 hover:bg-purple-200 text-primary font-semibold py-2 px-4 rounded-full text-xs flex items-center">
            <ChatBubbleLeftEllipsisIcon className="h-4 w-4 mr-1" />
            Message
          </button>
        );
      case 'request_sent':
        return (
          <button disabled className="bg-gray-200 text-gray-500 font-semibold py-2 px-4 rounded-full text-xs flex items-center cursor-not-allowed">
            <ClockIcon className="h-4 w-4 mr-1" />
            Request Sent
          </button>
        );
      case 'request_received':
         return (
            <div className="bg-yellow-100 text-yellow-800 font-semibold py-2 px-4 rounded-full text-xs flex items-center">
                <BellAlertIcon className="h-4 w-4 mr-1" />
                Response Required
            </div>
         );
      default: // 'not_friends'
        return (
          <button onClick={handleAddFriend} className="bg-gray-100 hover:bg-gray-200 text-secondary font-semibold py-2 px-4 rounded-full text-xs flex items-center">
            <UserPlusIcon className="h-4 w-4 mr-1" />
            Add Friend
          </button>
        );
    }
  };

  if (loggedInUser && loggedInUser._id === otherUser._id) {
    return null;
  }

  return (
    <div className="bg-surface p-6 rounded-xl shadow-md flex items-center justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center">
        <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
          <span className="text-xl font-bold text-primary">{otherUser.name.charAt(0)}</span>
        </div>
        <div className="ml-4">
          <Link to={`/profile/${otherUser._id}`} className="hover:underline">
            <h3 className="text-lg font-bold text-secondary">{otherUser.name}</h3>
          </Link>
          <p className="text-sm text-muted">
            {otherUser.location ? otherUser.location : `Joined on ${new Date(otherUser.createdAt).toLocaleDateString()}`}
          </p>
        </div>
      </div>
      {renderButton()}
    </div>
  );
};

export default UserCard;