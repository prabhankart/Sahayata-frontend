import { useState, useEffect, useContext, useRef, useLayoutEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import ChatBox from "../components/ChatBox";
import MediaDisplay from "../components/MediaDisplay";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import ReviewModal from "../components/ReviewModal";
import CommentSection from "../components/CommentSection";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PostDetailsPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewee, setReviewee] = useState(null);

  const scrollPositionRef = useRef(null);

  // 🔹 NEW: Chat persistence
  const [chatMessages, setChatMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`chat:${id}`)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(`chat:${id}`, JSON.stringify(chatMessages));
  }, [chatMessages, id]);

  const resetChat = () => {
    localStorage.removeItem(`chat:${id}`);
    setChatMessages([]);
    toast.success("Chat has been reset.");
  };

  // 🔹 Load post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/posts/${id}`);
        setPost(data);
      } catch (error) {
        console.error("Failed to fetch post:", error);
        toast.error("Could not load post details.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  // 🔹 Track views
  useEffect(() => {
    if (user) {
      const trackView = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.post(`${API_URL}/api/posts/${id}/view`, {}, config);
        } catch (error) {
          console.error("Failed to track post view:", error);
        }
      };
      trackView();
    }
  }, [id, user]);

  // 🔹 Keep scroll position after pledge
  useLayoutEffect(() => {
    if (scrollPositionRef.current !== null) {
      window.scrollTo(0, scrollPositionRef.current);
      scrollPositionRef.current = null;
    }
  }, [post]);

  const handlePledge = async () => {
    if (!user) return toast.error("You must be logged in to pledge.");
    scrollPositionRef.current = window.scrollY;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        `${API_URL}/api/posts/${post?._id}/pledge`,
        {},
        config
      );
      setPost(data);
      toast.success("Your pledge has been updated!");
    } catch {
      toast.error("Failed to update pledge.");
      scrollPositionRef.current = null;
    }
  };

  const handleDelete = async () => {
    if (!user || user._id !== post?.user?._id) return;
    if (!window.confirm("Delete this post?")) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${API_URL}/api/posts/${post._id}`, config);
      toast.success("Post deleted");
      navigate("/community");
    } catch {
      toast.error("Failed to delete post.");
    }
  };

  const handleStatusChange = async (status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        `${API_URL}/api/posts/${post?._id}/status`,
        { status },
        config
      );
      setPost(data);
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const openReviewModal = (reviewee) => {
    setReviewee(reviewee);
    setReviewModalOpen(true);
  };

  if (loading) return <Spinner />;
  if (!post)
    return (
      <p className="text-center text-red-500 mt-20">Post not found.</p>
    );

  const isPledgedByCurrentUser = post?.pledgedBy?.some(
    (p) => (p._id || p) === user?._id
  );
  const isPostCreator =
    user?._id && post?.user?._id && user._id === post.user._id;
  const canViewChat = isPostCreator || isPledgedByCurrentUser;

  return (
    <>
      {reviewModalOpen && (
        <ReviewModal
          post={post}
          reviewee={reviewee}
          onClose={() => setReviewModalOpen(false)}
        />
      )}

      <div className="relative bg-gradient-to-b from-gray-50 via-white to-violet-50/50 min-h-[calc(100vh-4rem)] py-16">
        <div className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-56 w-[80%] rounded-full bg-[radial-gradient(70%_60%_at_50%_0%,rgba(124,58,237,0.10),rgba(255,255,255,0))]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* LEFT SECTION */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur rounded-3xl border border-zinc-200/70 shadow-[0_12px_40px_-12px_rgba(24,24,27,0.25)]">
            {post?.image && (
              <div className="overflow-hidden rounded-t-3xl">
                <MediaDisplay
                  url={post.image}
                  alt={post?.title || "Post image"}
                />
              </div>
            )}

            <div className="p-8">
              <div className="flex justify-between items-start gap-4">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
                  {post?.title || "Untitled Post"}
                </h1>

                {isPostCreator && (
                  <div className="flex space-x-2 flex-shrink-0 ml-4">
                    <Link
                      to={`/post/${post._id}/edit`}
                      className="p-2 rounded-lg hover:bg-gray-100 ring-1 ring-transparent hover:ring-gray-200 transition"
                    >
                      <PencilIcon className="h-5 w-5 text-gray-600" />
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="p-2 rounded-lg hover:bg-rose-50 ring-1 ring-transparent hover:ring-rose-200 transition"
                    >
                      <TrashIcon className="h-5 w-5 text-rose-500" />
                    </button>
                  </div>
                )}
              </div>

              <p className="mt-4 text-gray-700 whitespace-pre-wrap leading-relaxed">
                {post?.description || "No description provided."}
              </p>

              {isPostCreator && (
                <div className="mt-8">
                  {post?.status !== "Resolved" ? (
                    <button
                      onClick={() => handleStatusChange("Resolved")}
                      className="w-full rounded-xl bg-gradient-to-r from-sky-100 to-sky-50 text-sky-800 font-semibold py-3 px-4 hover:from-sky-200 hover:to-sky-100 ring-1 ring-sky-200"
                    >
                      Mark as Resolved
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange("Open")}
                      className="w-full rounded-xl bg-gradient-to-r from-zinc-100 to-white text-zinc-800 font-semibold py-3 px-4 hover:from-zinc-200 hover:to-white ring-1 ring-zinc-200"
                    >
                      Re-open Request
                    </button>
                  )}
                </div>
              )}

              <div className="mt-10">
                <CommentSection postId={post?._id} />
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-24 min-w-0">
            {/* Post details */}
            <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow border border-zinc-200/70">
              <h3 className="text-xl font-bold text-gray-900 border-b border-zinc-200/70 pb-3 mb-4">
                Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Posted by:</span>
                  {post?.user ? (
                    <Link
                      to={`/profile/${post.user._id}`}
                      className="font-semibold text-gray-900 hover:text-primary"
                    >
                      {post.user.name}
                    </Link>
                  ) : (
                    <span className="text-gray-400">Unknown</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-semibold text-gray-900">
                    {post?.createdAt
                      ? new Date(post.createdAt).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-semibold text-yellow-700">
                    {post?.status || "Open"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-semibold text-gray-900">
                    {post?.category || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Urgency:</span>
                  <span className="font-semibold text-gray-900">
                    {post?.urgency || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Pledged helpers */}
            <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow border border-zinc-200/70">
              <h3 className="text-xl font-bold text-gray-900 border-b border-zinc-200/70 pb-3 mb-4">
                Pledged Helpers ({post?.pledgedBy?.length || 0})
              </h3>

              {post?.pledgedBy?.length > 0 ? (
                <ul className="space-y-4">
                  {post.pledgedBy.map((helper) => (
                    <li
                      key={helper._id || helper}
                      className="flex justify-between items-center"
                    >
                      <Link
                        to={`/profile/${helper._id || helper}`}
                        className="text-emerald-700 font-semibold hover:text-emerald-800"
                      >
                        {helper.name || "Unknown"}
                      </Link>
                      {isPostCreator && post?.status === "Resolved" && (
                        <button
                          onClick={() => openReviewModal(helper)}
                          className="text-xs text-primary font-semibold hover:underline"
                        >
                          Leave Review
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">
                  No one has pledged yet.
                </p>
              )}

              {isPledgedByCurrentUser && post?.status === "Resolved" && (
                <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Review post creator:
                  </span>
                  <button
                    onClick={() => openReviewModal(post?.user)}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Leave Review
                  </button>
                </div>
              )}

              {user && !isPostCreator && post?.status !== "Resolved" && (
                <button
                  onClick={handlePledge}
                  className={`w-full mt-4 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                    isPledgedByCurrentUser
                      ? "bg-rose-50 text-rose-700 hover:bg-rose-100 ring-1 ring-rose-200"
                      : "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.6)] focus-visible:ring-emerald-500"
                  }`}
                >
                  {isPledgedByCurrentUser ? "Unpledge" : "Pledge to Help"}
                </button>
              )}
            </div>

            {/* Chat */}
            <div className="min-h-[360px] lg:max-h-[80vh] min-w-0">
              {user && canViewChat && (
                <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow border border-zinc-200/70 h-full flex flex-col">
                  <div className="flex justify-between items-center border-b border-zinc-200/70 pb-3 mb-4 flex-shrink-0">
                    <h3 className="text-xl font-bold text-gray-900">Project Chat</h3>
                  </div>

                  <div className="flex-grow min-w-0">
                    <ChatBox
                      postId={post?._id}
                      persistedMessages={chatMessages}
                      onMessagesChange={setChatMessages}
                    />
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
