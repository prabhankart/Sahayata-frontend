import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Vote from './Vote';
import MediaDisplay from './MediaDisplay';
// NEW: Imported additional icons for comments, views, and status
import { TagIcon, ClockIcon, ChatBubbleOvalLeftEllipsisIcon, EyeIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';

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

  // Helper function for urgency tag styling
  const getUrgencyStyle = (urgency) => {
    switch (urgency) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // NEW: Helper function for status tag styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-blue-100 text-blue-700';
      case 'Open': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col border border-gray-200 hover:-translate-y-1">
      
      {/* --- CARD HEADER --- */}
      <div className="p-4 flex items-start">
        <Vote post={currentPost} onVote={setCurrentPost} />
        <div className="flex-grow ml-4">
          <div className="flex items-center mb-3">
            <Link to={`/profile/${currentPost.user._id}`}>
              {/* Using a placeholder for avatar, you can replace with actual user avatar */}
              <div className="flex-shrink-0 w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center font-bold text-primary">
                {currentPost.user.name.charAt(0)}
              </div>
            </Link>
            <div className="ml-3">
              <Link to={`/profile/${currentPost.user._id}`} className="text-sm font-semibold text-gray-800 hover:underline">
                {currentPost.user.name}
              </Link>
              <p className="text-xs text-gray-500">{new Date(currentPost.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* --- CARD CONTENT --- */}
      <div className="px-6 pb-6 flex-grow flex flex-col">
        {currentPost.image && (
          <Link to={`/post/${currentPost._id}`} className="block mb-4 rounded-lg overflow-hidden">
            <MediaDisplay url={currentPost.image} alt={currentPost.title} />
          </Link>
        )}
        
        <div className="flex items-center flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-primary">
            <TagIcon className="h-4 w-4 mr-1.5" />
            {post.category}
          </span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getUrgencyStyle(post.urgency)}`}>
            <ClockIcon className="h-4 w-4 mr-1.5" />
            {post.urgency} Urgency
          </span>
          {/* NEW: Dynamic status badge */}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(post.status)}`}>
            {post.status === 'Resolved' ? <CheckCircleIcon className="h-4 w-4 mr-1.5" /> : <SparklesIcon className="h-4 w-4 mr-1.5" />}
            {post.status}
          </span>
        </div>

        <Link to={`/post/${currentPost._id}`} className="block flex-grow mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-primary transition-colors">{currentPost.title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{currentPost.description}</p>
        </Link>
        
        {/* --- NEW: REFINED CARD FOOTER --- */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            {/* Social Stats: Pledges, Comments, Views */}
            <div className="flex items-center text-sm text-gray-500 space-x-5">
              <span className="flex items-center">
                <SparklesIcon className="h-5 w-5 mr-1.5 text-yellow-500"/>
                <span className="font-bold text-gray-700">{currentPost.pledgedBy.length}</span>
                <span className="ml-1 hidden sm:inline">Pledges</span>
              </span>
              <Link to={`/post/${currentPost._id}`} className="flex items-center hover:text-primary">
                <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 mr-1.5"/>
                <span className="font-bold text-gray-700">{currentPost.commentCount || 0}</span>
              </Link>
              <Link to={`/post/${currentPost._id}`} className="flex items-center hover:text-primary">
                <EyeIcon className="h-5 w-5 mr-1.5"/>
                <span className="font-bold text-gray-700">{currentPost.viewCount || 0}</span>
              </Link>
            </div>
            
            {/* Pledge Button */}
            {user && user._id !== currentPost.user._id && (
              <button
                onClick={handlePledge}
                className={`font-semibold py-2 px-5 rounded-full text-xs shadow-lg transform hover:scale-105 transition-all duration-300 ${isPledgedByCurrentUser ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-primary text-white hover:bg-purple-700'}`}
              >
                {isPledgedByCurrentUser ? 'Unpledge' : 'Pledge'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;