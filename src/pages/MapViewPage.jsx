import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet library to create custom icons
import Spinner from '../components/Spinner';

// Define the base URL for your API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// --- NEW: Custom Map Marker Icon ---
const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  // This filter makes the default blue icon our primary purple color
  className: 'leaflet-marker-icon' 
});
// Add this CSS to your src/index.css to color the icon:
// .leaflet-marker-icon { filter: hue-rotate(200deg) brightness(0.9) saturate(1.5); }


const MapViewPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Use the dynamic API_URL
        const { data } = await axios.get(`${API_URL}/api/posts`);
        setPosts(data.filter(p => p.location && p.location.coordinates));
      } catch (error) {
        console.error("Failed to fetch posts for map:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    // Corrected height calculation (5rem for h-20 navbar)
    <div className="h-[calc(100vh-5rem)] w-full">
      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {posts.map(post => (
          <Marker 
            key={post._id} 
            position={[post.location.coordinates[1], post.location.coordinates[0]]}
            icon={customMarkerIcon} // Use the custom icon
          >
            <Popup>
              <div className="text-secondary">
                <h3 className="font-bold text-md mb-1">{post.title}</h3>
                <p className="text-sm text-muted mb-2">{post.description.substring(0, 70)}...</p>
                <Link to={`/post/${post._id}`} className="text-primary font-semibold text-sm hover:underline">
                  View Details &rarr;
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapViewPage;