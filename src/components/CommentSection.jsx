import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// This is a single comment component for better styling
const Comment = ({ comment }) => (
  <div className="flex items-start space-x-4 py-4">
    <Link to={`/profile/${comment.user._id}`}>
      <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center font-bold text-primary flex-shrink-0">
        {comment.user.name.charAt(0)}
      </div>
    </Link>
    <div className="flex-1">
      <div className="bg-gray-100 rounded-xl p-3">
        <div className="flex items-baseline space-x-2">
          <Link to={`/profile/${comment.user._id}`} className="font-semibold text-sm text-gray-800 hover:underline">
            {comment.user.name}
          </Link>
          <p className="text-xs text-gray-500">
            {new Date(comment.createdAt).toLocaleString()}
          </p>
        </div>
        <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
      </div>
    </div>
  </div>
);

const CommentSection = ({ postId }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  // NOTE: You need to create the API endpoints for comments.
  // This is a placeholder for fetching comments.
  useEffect(() => {
    const fetchComments = async () => {
      try {
        // const { data } = await axios.get(`${API_URL}/api/posts/${postId}/comments`);
        // setComments(data);
        
        // --- Dummy Data (Remove when API is ready) ---
        setComments([
          { _id: '1', text: 'This is a great initiative! I\'d love to help out where I can.', user: { _id: 'user1', name: 'Alice' }, createdAt: new Date() },
          { _id: '2', text: 'I have some experience with plumbing, let me know if you need an extra hand.', user: { _id: 'user2', name: 'Bob' }, createdAt: new Date() },
        ]);
        // ---------------------------------------------

      } catch (error) {
        toast.error('Could not load comments.');
      }
    };
    fetchComments();
  }, [postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) return toast.error('You must be logged in to comment.');

    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      // const { data } = await axios.post(`${API_URL}/api/posts/${postId}/comments`, { text: newComment }, config);
      
      // --- Dummy Update (Remove when API is ready) ---
      const newCommentData = {
        _id: Math.random().toString(),
        text: newComment,
        user: { _id: user._id, name: user.name },
        createdAt: new Date(),
      };
      setComments(prev => [...prev, newCommentData]);
      // ------------------------------------------------

      setNewComment('');
      toast.success('Comment posted!');
    } catch (error) {
      toast.error('Failed to post comment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">
        Comments ({comments.length})
      </h2>
      
      {/* Form for new comment */}
      {user && (
        <form onSubmit={handleCommentSubmit} className="flex items-start space-x-4 mb-8">
           <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center font-bold text-primary flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 relative">
           <textarea
  value={newComment}
  onChange={(e) => setNewComment(e.target.value)}
  placeholder="Add a public comment..."
  // ✅ UPDATED: Added text-gray-900 to ensure the text is dark and visible
  className="w-full p-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-gray-900"
  rows="2"
/>
            <button
              type="submit"
              disabled={loading}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 p-2 bg-primary text-white rounded-full hover:bg-purple-700 disabled:bg-gray-300 transition-colors"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </form>
      )}

      {/* List of comments */}
      <div className="space-y-2 divide-y divide-gray-200">
        {comments.map(comment => <Comment key={comment._id} comment={comment} />)}
        {comments.length === 0 && <p className="text-gray-500 text-sm py-4">Be the first to comment.</p>}
      </div>
    </div>
  );
};

export default CommentSection;