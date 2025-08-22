import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import ChatBox from '../components/ChatBox';
import MediaDisplay from '../components/MediaDisplay';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ReviewModal from '../components/ReviewModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PostDetailsPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewee, setReviewee] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/posts/${id}`);
        setPost(data);
      } catch (error) {
        console.error('Failed to fetch post:', error);
        toast.error('Could not load post details.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`${API_URL}/api/posts/${post._id}/status`, { status: newStatus }, config);
      setPost(data);
      toast.success(`Post status updated to "${newStatus}"!`);
    } catch (error) {
      toast.error("Failed to update post status.");
    }
  };

  const openReviewModal = (userToReview) => {
    setReviewee(userToReview);
    setReviewModalOpen(true);
  };

  const handlePledge = async () => {
    if (!user) return toast.error('You must be logged in to pledge.');
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    try {
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
        await axios.delete(`${API_URL}/api/posts/${id}`, config);
        toast.success('Post deleted successfully');
        navigate('/community');
      } catch (error) {
        toast.error('Failed to delete the post.');
      }
    }
  };

  if (loading) return <Spinner />;
  if (!post) return <p className="text-center text-red-500 mt-20">Post not found.</p>;

  const isPledgedByCurrentUser = post.pledgedBy.some(p => p._id === user?._id);
  const isPostCreator = user?._id === post.user._id;
  const canViewChat = isPostCreator || isPledgedByCurrentUser;

  return (
    <>
      {reviewModalOpen && <ReviewModal post={post} reviewee={reviewee} onClose={() => setReviewModalOpen(false)} />}
      <div className="bg-gray-50 min-h-[calc(100vh-4rem)] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

          {/* LEFT SECTION */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            {post.image && <MediaDisplay url={post.image} alt={post.title} />}
            <div className="flex justify-between items-start mt-4">
              <h1 className="text-4xl font-extrabold text-gray-800 mb-4">{post.title}</h1>
              {isPostCreator && (
                <div className="flex space-x-2">
                  <Link to={`/post/${post._id}/edit`} className="p-2 rounded-full hover:bg-gray-100">
                    <PencilIcon className="h-5 w-5 text-gray-500" />
                  </Link>
                  <button onClick={handleDelete} className="p-2 rounded-full hover:bg-red-100">
                    <TrashIcon className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{post.description}</p>

            {isPostCreator && (
              <div className="mt-6">
                {post.status !== 'Resolved' ? (
                  <button
                    onClick={() => handleStatusChange('Resolved')}
                    className="w-full bg-blue-100 text-blue-700 font-bold py-3 px-4 rounded-xl hover:bg-blue-200 transition-colors"
                  >
                    Mark this Request as Resolved
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange('Open')}
                    className="w-full bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Re-open this Request
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SECTION */}
          <div className="lg:col-span-1 space-y-8">

            {/* DETAILS */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Posted by:</span>
                  <Link to={`/profile/${post.user._id}`} className="font-semibold text-gray-800 hover:underline">{post.user.name}</Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-semibold text-gray-800">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-semibold text-yellow-600">{post.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-semibold text-gray-800">{post.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Urgency:</span>
                  <span className="font-semibold text-gray-800">{post.urgency}</span>
                </div>
              </div>
            </div>

            {/* HELPERS */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Pledged Helpers ({post.pledgedBy.length})</h3>
              {post.pledgedBy.length > 0 ? (
                <ul className="space-y-4">
                  {post.pledgedBy.map(helper => (
                    <li key={helper._id} className="flex justify-between items-center">
                      <Link to={`/profile/${helper._id}`} className="text-green-600 font-semibold hover:underline">{helper.name}</Link>
                      {isPostCreator && post.status === 'Resolved' && (
                        <button onClick={() => openReviewModal(helper)} className="text-xs text-primary font-semibold hover:underline">Leave Review</button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-500 text-sm">No one has pledged yet.</p>}

              {isPledgedByCurrentUser && post.status === 'Resolved' && (
                <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Review post creator:</span>
                  <button onClick={() => openReviewModal(post.user)} className="text-xs text-primary font-semibold hover:underline">Leave Review</button>
                </div>
              )}

              {user && !isPostCreator && post.status !== 'Resolved' && (
                <button
                  onClick={handlePledge}
                  className={`w-full mt-4 font-bold py-2 px-4 rounded-xl text-sm transition duration-300 ${isPledgedByCurrentUser ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                >
                  {isPledgedByCurrentUser ? 'Unpledge' : 'Pledge to Help'}
                </button>
              )}
            </div>

            {/* CHAT */}
            {user && canViewChat && <ChatBox postId={post._id} />}
          </div>
        </div>
      </div>
    </>
  );
};

export default PostDetailsPage;
