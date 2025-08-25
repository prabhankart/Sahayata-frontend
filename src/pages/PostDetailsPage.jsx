// ✅ MODIFIED: Import useRef and useLayoutEffect
import { useState, useEffect, useContext, useRef, useLayoutEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import ChatBox from '../components/ChatBox';
import MediaDisplay from '../components/MediaDisplay';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ReviewModal from '../components/ReviewModal';
import CommentSection from '../components/CommentSection';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PostDetailsPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewee, setReviewee] = useState(null);

  // ✅ NEW: Create a ref to store the scroll position across re-renders.
  const scrollPositionRef = useRef(null);

  // This useEffect fetches the post data (no changes here)
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

  // This useEffect tracks unique views (no changes here)
  useEffect(() => {
    if (user) {
      const trackView = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.post(`${API_URL}/api/posts/${id}/view`, {}, config);
        } catch (error) {
          console.error('Failed to track post view:', error);
        }
      };
      trackView();
    }
  }, [id, user]);

  // ✅ NEW: Add useLayoutEffect to restore scroll position AFTER the DOM has been updated.
  useLayoutEffect(() => {
    // If we have a saved scroll position in our ref...
    if (scrollPositionRef.current !== null) {
      // ...restore it.
      window.scrollTo(0, scrollPositionRef.current);
      // ...and then reset the ref so this doesn't happen on every re-render.
      scrollPositionRef.current = null;
    }
  }, [post]); // This runs every time the 'post' object changes.

  const handlePledge = async () => {
    if (!user) return toast.error('You must be logged in to pledge.');
    
    // ✅ MODIFIED: Save scroll position to the ref instead of a local variable.
    scrollPositionRef.current = window.scrollY;
    
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    try {
      const { data } = await axios.put(`${API_URL}/api/posts/${post._id}/pledge`, {}, config);
      // This setPost will trigger the useLayoutEffect above AFTER the render is complete.
      setPost(data); 
      toast.success('Your pledge has been updated!');
    } catch (error) {
      toast.error('Failed to update pledge.');
      // Make sure to clear the ref if the pledge fails.
      scrollPositionRef.current = null;
    }
    // ✅ MODIFIED: The `finally` block and `window.scrollTo` are no longer needed here.
  };

  // ... (handleDelete, handleStatusChange, etc., all remain exactly the same) ...

  if (loading) return <Spinner />;
  if (!post) return <p className="text-center text-red-500 mt-20">Post not found.</p>;

  const isPledgedByCurrentUser = post.pledgedBy.some(p => p._id === user?._id);
  const isPostCreator = user?._id === post.user._id;
  const canViewChat = isPostCreator || isPledgedByCurrentUser;

  return (
    <>
      {reviewModalOpen && <ReviewModal post={post} reviewee={reviewee} onClose={() => setReviewModalOpen(false)} />}
      {/* UPDATED: Added more vertical padding for a spacious feel */}
      <div className="bg-gray-50 min-h-[calc(100vh-4rem)] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

          {/* LEFT SECTION */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            {post.image && <MediaDisplay url={post.image} alt={post.title} />}
            <div className="flex justify-between items-start mt-4">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-800 mb-4">{post.title}</h1>
              {isPostCreator && (
                <div className="flex space-x-2 flex-shrink-0 ml-4">
                  <Link to={`/post/${post._id}/edit`} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <PencilIcon className="h-5 w-5 text-gray-500" />
                  </Link>
                  <button onClick={handleDelete} className="p-2 rounded-full hover:bg-red-100 transition-colors">
                    <TrashIcon className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.description}</p>
            {isPostCreator && (
              <div className="mt-8">
                {post.status !== 'Resolved' ? (
                  <button
                    onClick={() => handleStatusChange('Resolved')}
                    className="w-full bg-blue-100 text-blue-700 font-bold py-3 px-4 rounded-xl hover:bg-blue-200 transition-colors"
                  >Mark as Resolved</button>
                ) : (
                  <button
                    onClick={() => handleStatusChange('Open')}
                    className="w-full bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
                  >Re-open Request</button>
                )}
              </div>
            )}
            
            {/* NEW: Placed the comment section here */}
            <CommentSection postId={post._id} />

          </div>

          {/* RIGHT SECTION */}
          <div className="lg:col-span-1 space-y-8 sticky top-24"> {/* UPDATED: Made sidebar sticky */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                 {/* Details content remains the same... */}
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

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Pledged Helpers ({post.pledgedBy.length})</h3>
              {/* Pledged Helpers content remains the same... */}
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
            
            {/* UPDATED: Wrapped ChatBox in a styled container for consistent premium UI */}
         <div className="min-h-[450px]">
  {user && canViewChat && (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-full flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 flex-shrink-0">Project Chat</h3>
      <div className="flex-grow">
        {/* The ChatBox component fills this div */}
        <ChatBox postId={post._id} />
      </div>
    </div>
  )}
</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostDetailsPage;