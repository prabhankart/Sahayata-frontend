import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import MediaDisplay from "./MediaDisplay";
import {
  TagIcon,
  ClockIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  EyeIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PostCard = ({ post }) => {
  const { user } = useContext(AuthContext);
  const [currentPost, setCurrentPost] = useState(post);

  const author = currentPost.user || { _id: "unknown", name: "Unknown User" };

  const handlePledge = async () => {
    if (!user) return toast.error("You must be logged in to pledge.");
    try {
      const { data } = await axios.put(
        `${API_URL}/api/posts/${currentPost._id}/pledge`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setCurrentPost(data);
      toast.success("Your pledge has been updated!");
    } catch {
      toast.error("Failed to update pledge.");
    }
  };

  const isPledgedByCurrentUser = (currentPost.pledgedBy || []).some(
    (p) => (p._id || p) === user?._id
  );

  const urgencyColors = {
    High: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
    Medium: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    Low: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  };

  const statusColors = {
    Resolved: "bg-sky-100 text-sky-700 ring-1 ring-sky-200",
    Open: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    Closed: "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200",
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white/80 backdrop-blur shadow-[0_10px_40px_-10px_rgba(124,58,237,0.25)] hover:shadow-[0_20px_70px_-15px_rgba(124,58,237,0.35)] transition-all duration-500">
      {/* glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.08),transparent)]"></div>

      {/* header */}
      <div className="p-5 flex items-start gap-3">
        <Link to={`/profile/${author._id}`} className="shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-200 to-fuchsia-200 rounded-full flex items-center justify-center font-bold text-primary ring-2 ring-white shadow-sm">
            {author.name?.charAt(0) || "U"}
          </div>
        </Link>
        <div className="min-w-0">
          <Link
            to={`/profile/${author._id}`}
            className="block text-sm font-semibold text-gray-900 hover:text-violet-600 transition-colors truncate"
          >
            {author.name}
          </Link>
          <p className="text-xs text-gray-500">
            {new Date(currentPost.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* media */}
      {currentPost.image && currentPost.image.startsWith("http") && (
        <Link
          to={`/post/${currentPost._id}`}
          className="block px-5 mb-4 rounded-2xl overflow-hidden"
        >
          <div className="aspect-[16/9] overflow-hidden rounded-2xl shadow-md">
            <MediaDisplay url={currentPost.image} alt={currentPost.title} />
          </div>
        </Link>
      )}

      {/* tags */}
      <div className="px-5 flex flex-wrap gap-2 mb-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700 ring-1 ring-violet-200">
          <TagIcon className="h-4 w-4 mr-1.5" />
          {currentPost.category || "Other"}
        </span>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            urgencyColors[currentPost.urgency || "Medium"]
          }`}
        >
          <ClockIcon className="h-4 w-4 mr-1.5" />
          {currentPost.urgency || "Medium"}
        </span>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            statusColors[currentPost.status || "Open"]
          }`}
        >
          {currentPost.status === "Resolved" ? (
            <CheckCircleIcon className="h-4 w-4 mr-1.5" />
          ) : (
            <SparklesIcon className="h-4 w-4 mr-1.5" />
          )}
          {currentPost.status || "Open"}
        </span>
      </div>

      {/* title */}
      <Link to={`/post/${currentPost._id}`} className="block px-5">
        <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2 group-hover:text-violet-600 transition">
          {currentPost.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3">
          {currentPost.description}
        </p>
      </Link>

      {/* footer */}
      <div className="px-5 pt-4 pb-5 mt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500 gap-5">
            <span className="flex items-center">
              <SparklesIcon className="h-5 w-5 mr-1.5 text-yellow-500" />
              <span className="font-bold text-gray-700">
                {(currentPost.pledgedBy || []).length}
              </span>
              <span className="ml-1 hidden sm:inline">Pledges</span>
            </span>
            <Link
              to={`/post/${currentPost._id}`}
              className="flex items-center hover:text-violet-600"
            >
              <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 mr-1.5" />
              <span className="font-bold text-gray-700">
                {currentPost.commentCount || 0}
              </span>
            </Link>
            <Link
              to={`/post/${currentPost._id}`}
              className="flex items-center hover:text-violet-600"
            >
              <EyeIcon className="h-5 w-5 mr-1.5" />
              <span className="font-bold text-gray-700">
                {currentPost.viewCount || 0}
              </span>
            </Link>
          </div>

          {user && user._id !== author._id && (
            <button
              onClick={handlePledge}
              className={`font-semibold py-2 px-5 rounded-full text-xs shadow-md transition-transform ${
                isPledgedByCurrentUser
                  ? "bg-rose-50 text-rose-700 hover:bg-rose-100 ring-1 ring-rose-200"
                  : "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:scale-105"
              }`}
            >
              {isPledgedByCurrentUser ? "Unpledge" : "Pledge"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;

