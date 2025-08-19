import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import ChatBox from '../components/ChatBox';
import MediaDisplay from '../components/MediaDisplay';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// Define the base URL for your API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PostDetailsPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Use the dynamic API_URL
        const { data } = await axios.get(`${API_URL}/api/posts/${id}`);
        setPost(data);
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handlePledge = async () => {
    if (!user) return toast.error('You must be logged in to pledge.');
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    try {
      // Use the dynamic API_URL
      const { data } = await axios.put(`${API_URL}/api/posts/${post._id}/pledge`, {}, config);
      setPost(data);
      toast.success('Your pledge has been updated!');
    } catch (error) {
      toast.error('Failed to update pledge.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        // Use the dynamic API_URL
        await axios.delete(`${API_URL}/api/posts/${id}`, config);
        toast.success('Post deleted successfully');
        navigate('/community');
      } catch (error) {
        toast.error('Failed to delete the post.');
        console.error('Delete error:', error);
      }
    }
  };


  if (loading) return <Spinner />;
  if (!post) return <p className="text-center text-red-500 mt-20">Post not found.</p>;

  // --- 2. Logic to determine if the user can view the chat ---
  const isPledgedByCurrentUser = post.pledgedBy.some(p => p._id === user?._id);
  const isPostCreator = user?._id === post.user._id;
  const canViewChat = isPostCreator || isPledgedByCurrentUser;

  return (
    <div className="bg-cream min-h-[calc(100vh-4rem)] py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main Post Content */}
        <div className="lg:col-span-2 bg-surface p-8 rounded-xl shadow-md">
         {post.image && (
            <MediaDisplay url={post.image} alt={post.title} />
          )}
          <div className="flex justify-between items-start">
              <h1 className="text-3xl font-extrabold text-secondary mb-4">{post.title}</h1>
              {/* --- NEW: Edit and Delete Buttons --- */}
              {isPostCreator && (
                  <div className="flex space-x-2">
                     <Link to={`/post/${post._id}/edit`} className="p-2 rounded-full hover:bg-gray-100">
    <PencilIcon className="h-5 w-5 text-muted" />
</Link>
                      <button onClick={handleDelete} className="p-2 rounded-full hover:bg-red-100">
                          <TrashIcon className="h-5 w-5 text-red-500" />
                      </button>
                  </div>
              )}
          </div>

          <p className="text-muted whitespace-pre-wrap leading-relaxed">{post.description}</p>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-secondary mb-4">Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Posted by:</span>
                <span className="font-semibold text-secondary">{post.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Date:</span>
                <span className="font-semibold text-secondary">{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Status:</span>
                <span className="font-semibold text-yellow-600">{post.status}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-secondary mb-4">Pledged Helpers ({post.pledgedBy.length})</h3>
            {post.pledgedBy.length > 0 ? (
                <ul className="space-y-2">
                    {post.pledgedBy.map(helper => (
                        <li key={helper._id} className="text-green-600 font-semibold">{helper.name}</li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted text-sm">No one has pledged yet. Be the first!</p>
            )}
            {user && !isPostCreator && (
                <button
                  onClick={handlePledge}
                  className={`w-full mt-4 font-bold py-2 px-4 rounded-lg text-sm transition duration-300 ${isPledgedByCurrentUser ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                >
                  {isPledgedByCurrentUser ? 'Unpledge' : 'Pledge to Help'}
                </button>
            )}
          </div>

          {/* --- 3. Conditionally render the ChatBox --- */}
          {user && canViewChat && <ChatBox postId={post._id} />}

        </div>
      </div>
    </div>
  );
};

export default PostDetailsPage;