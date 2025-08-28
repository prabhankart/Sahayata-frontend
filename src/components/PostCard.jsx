import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import MediaDisplay from './MediaDisplay';
import { TagIcon, ClockIcon, ChatBubbleOvalLeftEllipsisIcon, EyeIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PostCard = ({ post }) => {
  const { user } = useContext(AuthContext);
  const [currentPost, setCurrentPost] = useState(post);

  const author = currentPost.user || { _id: 'unknown', name: 'Unknown User' };

  const handlePledge = async () => {
    if (!user) return toast.error('You must be logged in to pledge.');
    try {
      const { data } = await axios.put(
        `${API_URL}/api/posts/${currentPost._id}/pledge`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setCurrentPost(data);
      toast.success('Your pledge has been updated!');
    } catch {
      toast.error('Failed to update pledge.');
    }
  };

  const isPledgedByCurrentUser = (currentPost.pledgedBy || []).some((p) => (p._id || p) === user?._id);

  const getUrgencyStyle = (u) =>
    u === 'High'
      ? 'bg-gradient-to-r from-rose-100 to-rose-50 text-rose-700 ring-1 ring-rose-200'
      : u === 'Medium'
      ? 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 ring-1 ring-amber-200'
      : 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 ring-1 ring-emerald-200';

  const getStatusStyle = (s) =>
    s === 'Resolved'
      ? 'bg-gradient-to-r from-sky-100 to-sky-50 text-sky-700 ring-1 ring-sky-200'
      : s === 'Open'
      ? 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
      : 'bg-gradient-to-r from-zinc-100 to-white text-zinc-700 ring-1 ring-zinc-200';

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-purple-100 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-[0_10px_30px_-10px_rgba(59,0,153,0.25)] hover:shadow-[0_20px_60px_-15px_rgba(59,0,153,0.35)] transition-all duration-500">
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/80 group-hover:ring-purple-300/70"></div>
      <div className="pointer-events-none absolute -inset-px rounded-2xl bg-[radial-gradient(60%_60%_at_50%_0%,rgba(124,58,237,0.10),rgba(255,255,255,0))]"></div>

      <div className="p-5 flex items-start">
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-3">
            <Link to={`/profile/${author._id}`} className="shrink-0">
              <div className="w-11 h-11 bg-gradient-to-br from-violet-200 to-fuchsia-200 rounded-full flex items-center justify-center font-bold text-primary ring-2 ring-white/70 shadow-sm">
                {author.name?.charAt(0) || 'U'}
              </div>
            </Link>
            <div className="min-w-0">
              <Link to={`/profile/${author._id}`} className="block text-sm font-semibold text-gray-900 hover:text-primary transition-colors truncate">
                {author.name}
              </Link>
              <p className="text-xs text-gray-500">{new Date(currentPost.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5">
       {currentPost.image && currentPost.image.startsWith("http") && (
  <Link to={`/post/${currentPost._id}`} className="block mb-4 rounded-xl overflow-hidden relative">
    <div className="aspect-[16/9] overflow-hidden rounded-xl">
      <MediaDisplay url={currentPost.image} alt={currentPost.title} />
    </div>
  </Link>
)}

      </div>

      <div className="px-5 flex items-center flex-wrap gap-2 mb-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-violet-100 to-fuchsia-100 text-primary ring-1 ring-purple-200">
          <TagIcon className="h-4 w-4 mr-1.5" /> {currentPost.category || 'Other'}
        </span>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getUrgencyStyle(currentPost.urgency || 'Medium')}`}>
          <ClockIcon className="h-4 w-4 mr-1.5" /> {(currentPost.urgency || 'Medium')} Urgency
        </span>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(currentPost.status || 'Open')}`}>
          {currentPost.status === 'Resolved' ? <CheckCircleIcon className="h-4 w-4 mr-1.5" /> : <SparklesIcon className="h-4 w-4 mr-1.5" />}
          {currentPost.status || 'Open'}
        </span>
      </div>

      <Link to={`/post/${currentPost._id}`} className="block px-5">
        <h3 className="text-xl font-extrabold tracking-tight text-gray-900 mb-2 group-hover:text-primary transition-colors">
          {currentPost.title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {currentPost.description}
        </p>
      </Link>

      <div className="px-5 pt-4 pb-5 mt-4 border-t border-gray-100/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500 gap-5">
            <span className="flex items-center">
              <SparklesIcon className="h-5 w-5 mr-1.5 text-yellow-500" />
              <span className="font-bold text-gray-700">{(currentPost.pledgedBy || []).length}</span>
              <span className="ml-1 hidden sm:inline">Pledges</span>
            </span>
            <Link to={`/post/${currentPost._id}`} className="flex items-center hover:text-primary">
              <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 mr-1.5" />
              <span className="font-bold text-gray-700">{currentPost.commentCount || 0}</span>
            </Link>
            <Link to={`/post/${currentPost._id}`} className="flex items-center hover:text-primary">
              <EyeIcon className="h-5 w-5 mr-1.5" />
              <span className="font-bold text-gray-700">{currentPost.viewCount || 0}</span>
            </Link>
          </div>
          {user && user._id !== author._id && (
            <button
              onClick={handlePledge}
              className={`font-semibold py-2 px-5 rounded-full text-xs shadow-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isPledgedByCurrentUser
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 ring-1 ring-rose-200'
                  : 'bg-gradient-to-r from-primary to-fuchsia-600 text-white hover:shadow-[0_10px_30px_-10px_rgba(124,58,237,0.6)] focus-visible:ring-primary'
              }`}
            >
              {isPledgedByCurrentUser ? 'Unpledge' : 'Pledge'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
