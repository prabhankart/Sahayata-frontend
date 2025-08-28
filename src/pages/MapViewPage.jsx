import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Spinner from '../components/Spinner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34], shadowSize: [41,41],
  className: 'leaflet-marker-icon'
});

const MapViewPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/posts`);
        const list = Array.isArray(data) ? data : (data?.data || []);
        setPosts(list.filter(p => p.location?.coordinates));
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="h-[calc(100vh-5rem)] w-full">
      <MapContainer center={[20.5937,78.9629]} zoom={5} style={{ height:'100%', width:'100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
        {posts.map(p => (
          <Marker key={p._id} position={[p.location.coordinates[1], p.location.coordinates[0]]} icon={icon}>
            <Popup>
              <div className="text-secondary">
                <h3 className="font-bold text-md mb-1">{p.title}</h3>
                <p className="text-sm text-muted mb-2">{(p.description||'').slice(0,70)}…</p>
                <Link to={`/post/${p._id}`} className="text-primary font-semibold text-sm hover:underline">View Details →</Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
export default MapViewPage;
