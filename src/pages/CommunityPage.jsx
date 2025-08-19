import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import PostCard from '../components/PostCard';
import Spinner from '../components/Spinner';

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
   const [locationName, setLocationName] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:5000/api/posts?';
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (userLocation) {
          params.append('lat', userLocation.lat);
          params.append('lng', userLocation.lng);
        }
        const { data } = await axios.get(url + params.toString());
        setPosts(data);
      } catch (error) {
        toast.error('Could not fetch posts.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [searchQuery, userLocation]);

  const handleFindNearMe = () => {
    if (!navigator.geolocation) return toast.error('Geolocation is not supported.');
    toast.loading('Fetching your location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss();
        toast.success('Location found!');
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        toast.dismiss();
        toast.error('Unable to retrieve your location.');
      }
    );
  };

  return (
    <div className="bg-cream py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-secondary">Community Feed</h1>
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
              // THIS CLASS MAKES THE PLACEHOLDER TEXT VISIBLE
             className="w-full p-3 pl-12 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary placeholder-muted text-secondary"
            />
          </div>
          <button
            onClick={handleFindNearMe}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition duration-300"
          >
            <MapPinIcon className="h-5 w-5 mr-2" />
            Find Posts Near Me
          </button>
        </div>
        {/* --- NEW: Active Filter Display --- */}
        {locationName && (
            <div className="flex items-center justify-center bg-purple-100 text-primary font-semibold text-sm p-3 rounded-lg mb-8">
                <p>Showing results near: <span className="font-bold">{locationName}</span></p>
                <button onClick={clearLocationFilter} className="ml-4">
                    <XCircleIcon className="h-5 w-5 hover:text-red-500" />
                </button>
            </div>
        )}
        {loading ? (
          <Spinner />
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted bg-surface p-8 rounded-lg">
            <h3 className="text-xl font-semibold text-secondary">No Posts Found</h3>
            <p>Try adjusting your search or location filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;