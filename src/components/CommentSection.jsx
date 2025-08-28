import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Comment = ({ comment }) => {
  const userId = comment.user?._id || "unknown";
  const userName = comment.user?.name || "Deleted User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex items-start space-x-4 py-4">
      <Link to={`/profile/${userId}`}>
        <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center font-bold text-primary flex-shrink-0">
          {userInitial}
        </div>
      </Link>
      <div className="flex-1">
        <div className="bg-gray-100 rounded-xl p-3">
          <div className="flex items-baseline space-x-2">
            <Link
              to={`/profile/${userId}`}
              className="font-semibold text-sm text-gray-800 hover:underline"
            >
              {userName}
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
};

const CommentSection = ({ postId }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/comments/post/${postId}`);
      setComments(data || []);
    } catch {
      toast.error("Could not load comments.");
    }
  };

  useEffect(() => {
    load();
  }, [postId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) return toast.error("You must be logged in to comment.");
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/api/comments`,
        { postId, text: newComment },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setComments((prev) => [...prev, data]);
      setNewComment("");
      toast.success("Comment posted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post comment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">
        Comments ({comments.length})
      </h2>

      {user && (
        <form onSubmit={submit} className="flex items-start space-x-4 mb-8">
          <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center font-bold text-primary flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a public comment..."
              className="w-full p-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-gray-900"
              rows="2"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute top-1/2 right-3 -translate-y-1/2 p-2 bg-primary text-white rounded-full hover:bg-purple-700 disabled:bg-gray-300"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2 divide-y divide-gray-200">
        {comments.map((c) => (
          <Comment key={c._id} comment={c} />
        ))}
        {comments.length === 0 && (
          <p className="text-gray-500 text-sm py-4">Be the first to comment.</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
