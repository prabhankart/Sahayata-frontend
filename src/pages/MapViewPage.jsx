import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const MapViewPage = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await axios.get('http://localhost:5000/api/posts');
      setPosts(data.filter(p => p.location && p.location.coordinates)); // Filter posts that have a location
    };
    fetchPosts();
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      <MapContainer center={[28.6139, 77.2090]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {posts.map(post => (
          <Marker key={post._id} position={[post.location.coordinates[1], post.location.coordinates[0]]}>
            <Popup>
              <h3 className="font-bold">{post.title}</h3>
              <p>{post.description.substring(0, 50)}...</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapViewPage;