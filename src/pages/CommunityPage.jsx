import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MapPinIcon, MagnifyingGlassIcon, XCircleIcon } from '@heroicons/react/24/outline';
import PostCard from '../components/PostCard';
import Spinner from '../components/Spinner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (userLocation) {
        params.append('lat', userLocation.lat);
        params.append('lng', userLocation.lng);
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
      toast.error('Could not fetch posts.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [searchQuery, userLocation?.lat, userLocation?.lng]);

  const handleFindNearMe = () => {
    if (!navigator.geolocation) return toast.error('Geolocation is not supported.');
    const t = toast.loading('Fetching your location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss(t);
        toast.success('Location found!');
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        toast.dismiss(t);
        toast.error('Unable to retrieve your location.');
      }
    );
  };

  const clearLocationFilter = () => {
    setUserLocation(null);
    setLocationName('');
  };

  return (
    <div className="relative bg-gradient-to-b from-cream via-white to-violet-50/60 py-16">
      {/* subtle background radial */}
      <div className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-56 w-[80%] rounded-full bg-[radial-gradient(60%_50%_at_50%_0%,rgba(124,58,237,0.15),rgba(255,255,255,0))]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-fuchsia-600">
            Community Feed
          </h1>
          <p className="mt-4 text-lg text-muted">Browse all requests and offers from your neighbors.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
            <input
              type="text"
              placeholder="Search by keyword (e.g., 'water', 'groceries')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 pl-12 rounded-xl border border-zinc-200/80 shadow-inner bg-white/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-muted text-secondary transition"
            />
          </div>
          <button
            onClick={handleFindNearMe}
            className="rounded-xl bg-gradient-to-r from-primary to-fuchsia-600 hover:opacity-95 text-white font-semibold py-3 px-6 shadow-[0_10px_30px_-10px_rgba(124,58,237,0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          >
            <div className="flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2" />
              Find Posts Near Me
            </div>
          </button>
        </div>

        {locationName && (
          <div className="flex items-center justify-center bg-purple-50/80 text-primary font-semibold text-sm p-3 rounded-xl mb-8 ring-1 ring-purple-200">
            <p>
              Showing results near: <span className="font-bold">{locationName}</span>
            </p>
            <button onClick={clearLocationFilter} className="ml-4">
              <XCircleIcon className="h-5 w-5 hover:text-rose-500" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-10"><Spinner /></div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((p) => (
              <PostCard key={p._id} post={p} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted bg-white/70 backdrop-blur p-10 rounded-2xl border border-zinc-200/70 shadow-sm">
            <h3 className="text-xl font-semibold text-secondary">No Posts Found</h3>
            <p className="mt-1">Try adjusting your search or location filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
