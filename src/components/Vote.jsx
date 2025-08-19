import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

const Vote = ({ post }) => {
  const { user } = useContext(AuthContext);
  const [currentPost, setCurrentPost] = useState(post);
  const [isLoading, setIsLoading] = useState(false);

  const voteCount = currentPost.upvotes.length - currentPost.downvotes.length;

  const handleVote = async (voteType) => {
    if (!user) return toast.error('You must be logged in to vote.');
    if (isLoading) return;

    setIsLoading(true);
    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    try {
      // If user clicks the same vote again, send empty voteType to remove vote
      const currentVote = currentPost.upvotes.includes(user._id) ? 'up' : currentPost.downvotes.includes(user._id) ? 'down' : null;
      const newVoteType = currentVote === voteType ? '' : voteType;

      const { data } = await axios.put(`http://localhost:5000/api/posts/${currentPost._id}/vote`, { voteType: newVoteType }, config);
      setCurrentPost(data);
    } catch (error) {
      toast.error('Failed to cast vote.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasUpvoted = user && currentPost.upvotes.includes(user._id);
  const hasDownvoted = user && currentPost.downvotes.includes(user._id);

  return (
    <div className="flex flex-col items-center justify-center space-y-1 text-white pr-4">
      <button onClick={() => handleVote('up')} disabled={isLoading} className="disabled:opacity-50">
        <ArrowUpIcon className={`h-6 w-6 ${hasUpvoted ? 'text-purple-500' : 'text-gray-400 hover:text-purple-500'}`} />
      </button>
      <span className="font-bold text-lg">{voteCount}</span>
      <button onClick={() => handleVote('down')} disabled={isLoading} className="disabled:opacity-50">
        <ArrowDownIcon className={`h-6 w-6 ${hasDownvoted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
      </button>
    </div>
  );
};

export default Vote;