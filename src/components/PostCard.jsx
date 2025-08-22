import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Vote from './Vote';
import MediaDisplay from './MediaDisplay';
import { TagIcon, ClockIcon } from '@heroicons/react/24/solid';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PostCard = ({ post }) => {
  const { user } = useContext(AuthContext);
  const [currentPost, setCurrentPost] = useState(post);

  const handlePledge = async () => {
    if (!user) return toast.error('You must be logged in to pledge.');
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    try {
      const { data } = await axios.put(`${API_URL}/api/posts/${currentPost._id}/pledge`, {}, config);
      setCurrentPost(data);
      toast.success('Your pledge has been updated!');
    } catch (error) {
      toast.error('Failed to update pledge.');
    }
  };
  
  const isPledgedByCurrentUser = currentPost.pledgedBy.some(pledger => pledger._id === user?._id);

  // Helper function to get color styling based on urgency
  const getUrgencyStyle = (urgency) => {
    switch (urgency) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-surface rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-200 hover:-translate-y-1">
      <div className="p-4 flex items-start">
        <Vote post={post} />
        <div className="flex-grow ml-4">
          {currentPost.image && (
            <Link to={`/post/${currentPost._id}`}>
              <div className="mb-4 rounded-md overflow-hidden">
                <MediaDisplay url={currentPost.image} alt={currentPost.title} />
              </div>
            </Link>
          )}
          <div className="flex items-center mb-3">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full"></div>
            <div className="ml-3">
             <Link to={`/profile/${currentPost.user._id}`} className="text-sm font-semibold text-secondary hover:underline">
                {currentPost.user.name}
              </Link>
              <p className="text-xs text-muted">{new Date(currentPost.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 pb-6 flex-grow flex flex-col">
        {/* --- NEW: Category and Urgency Tags --- */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-primary">
            <TagIcon className="h-3 w-3 mr-1.5" />
            {post.category}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyStyle(post.urgency)}`}>
            <ClockIcon className="h-3 w-3 mr-1.5" />
            {post.urgency}
          </span>
        </div>

        <Link to={`/post/${currentPost._id}`} className="block flex-grow">
          <h3 className="text-lg font-bold text-secondary mb-2 hover:text-primary">{currentPost.title}</h3>
          <p className="text-muted text-sm leading-relaxed line-clamp-2">{currentPost.description}</p>
        </Link>
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center text-sm text-muted space-x-4">
            <span><span className="font-bold text-secondary">{currentPost.pledgedBy.length}</span> Pledges</span>
            <span>Status: <span className="font-semibold text-yellow-600">{currentPost.status}</span></span>
          </div>
          {user && user._id !== currentPost.user._id && (
            <button
              onClick={handlePledge}
              className={`font-semibold py-2 px-4 rounded-full text-xs shadow-lg transform hover:scale-105 transition-all duration-300 ${isPledgedByCurrentUser ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
            >
              {isPledgedByCurrentUser ? 'Unpledge' : 'Pledge to Help'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;