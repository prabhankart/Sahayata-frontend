import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Vote from './Vote';
import MediaDisplay from './MediaDisplay';

const PostCard = ({ post }) => {
  const { user } = useContext(AuthContext);
  const [currentPost, setCurrentPost] = useState(post);

  const handlePledge = async () => {
    if (!user) return toast.error('You must be logged in to pledge.');
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    try {
      const { data } = await axios.put(`http://localhost:5000/api/posts/${currentPost._id}/pledge`, {}, config);
      setCurrentPost(data);
      toast.success('Your pledge has been updated!');
    } catch (error) {
      console.error('Failed to pledge:', error);
      toast.error('Failed to update pledge.');
    }
  };

  const isPledgedByCurrentUser = currentPost.pledgedBy.some(pledger => pledger._id === user?._id);

 return (
        <div className="bg-surface rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-200 hover:-translate-y-1">
            <div className="p-4 flex items-start">
                <Vote post={post} />
                <div className="flex-grow ml-4">
                   {currentPost.image && (
    <Link to={`/post/${currentPost._id}`}>
        <div className="hover:opacity-90">
            <MediaDisplay url={currentPost.image} alt={currentPost.title} />
        </div>
    </Link>
)}
                    <div className="flex items-center mb-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full"></div>
                        <div className="ml-3">
                            <p className="text-sm font-semibold text-secondary">{currentPost.user.name}</p>
                            <p className="text-xs text-muted">{new Date(currentPost.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-6 pb-6 flex-grow flex flex-col">
                <Link to={`/post/${currentPost._id}`} className="block flex-grow">
                    <h3 className="text-lg font-bold text-secondary mb-2 hover:text-primary">{currentPost.title}</h3>
                    <p className="text-muted text-sm leading-relaxed">{currentPost.description}</p>
                </Link>
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted space-x-4">
                        <span><span className="font-bold text-secondary">{currentPost.pledgedBy.length}</span> Pledges</span>
                        <span>Status: <span className="font-semibold text-yellow-600">{currentPost.status}</span></span>
                    </div>
                    {user && user._id !== currentPost.user._id && (
                        <button onClick={handlePledge} className={`font-semibold py-2 px-4 rounded-full text-xs shadow-lg transform hover:scale-105 transition-all duration-300 ${isPledgedByCurrentUser ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                            {isPledgedByCurrentUser ? 'Unpledge' : 'Pledge to Help'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostCard;