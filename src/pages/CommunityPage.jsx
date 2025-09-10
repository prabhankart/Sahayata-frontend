import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import PostCard from "../components/PostCard";
import Spinner from "../components/Spinner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState("");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (userLocation) {
        params.append("lat", userLocation.lat);
        params.append("lng", userLocation.lng);
      }
      const base = `${API_URL}/api/posts`;
      const url = params.toString() ? `${base}?${params.toString()}` : base;

      const { data } = await axios.get(url);
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.posts)
        ? data.posts
        : [];
      setPosts(list);
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch posts.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [searchQuery, userLocation?.lat, userLocation?.lng]);

  const handleFindNearMe = () => {
    if (!navigator.geolocation)
      return toast.error("Geolocation is not supported.");
    const t = toast.loading("Fetching your location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss(t);
        toast.success("Location found!");
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        toast.dismiss(t);
        toast.error("Unable to retrieve your location.");
      }
    );
  };

  const clearLocationFilter = () => {
    setUserLocation(null);
    setLocationName("");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-fuchsia-50 via-white to-indigo-50 py-16">
      {/* glowing backdrop */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.1),transparent_70%)]"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-700 via-fuchsia-600 to-pink-500 drop-shadow-md">
            Community Feed
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Browse all requests and offers from your neighbors.
          </p>
        </div>

        {/* search bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-grow">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by keyword (e.g., water, groceries)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 pl-12 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-lg shadow-inner focus:ring-2 focus:ring-violet-500 focus:outline-none transition text-gray-700 placeholder-gray-400"
            />
          </div>
          <button
            onClick={handleFindNearMe}
            className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white font-semibold py-3 px-6 shadow-lg transition-transform hover:scale-105"
          >
            <div className="flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2" />
              Find Near Me
            </div>
          </button>
        </div>

        {locationName && (
          <div className="flex items-center justify-center bg-violet-50/90 text-violet-700 font-semibold text-sm p-3 rounded-2xl mb-8 shadow-sm ring-1 ring-violet-200">
            <p>
              Showing results near:{" "}
              <span className="font-bold">{locationName}</span>
            </p>
            <button onClick={clearLocationFilter} className="ml-3">
              <XCircleIcon className="h-5 w-5 hover:text-rose-500 transition" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-12">
            <Spinner />
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((p) => (
              <PostCard key={p._id} post={p} />
            ))}
          </div>
        ) : (
          <div className="text-center bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow p-10">
            <h3 className="text-xl font-semibold text-gray-800">
              No Posts Found
            </h3>
            <p className="mt-2 text-gray-500">
              Try adjusting your search or location filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
