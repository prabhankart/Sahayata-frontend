import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { MapPinIcon } from '@heroicons/react/24/solid'; 
import UploadProgress from '../components/UploadProgress'; 

// Helper component to programmatically change the map's view
function ChangeMapView({ coords }) {
  const map = useMap();
  map.setView(coords, 13); // Sets the view and zoom level
  return null;
}

// Helper component to handle map clicks
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
}

const CreatePostPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [position, setPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default center of India
  const [locationQuery, setLocationQuery] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
   const [uploadProgress, setUploadProgress] = useState(0); 
  const [isGenerating, setIsGenerating] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLocationSearch = async (e) => {
    e.preventDefault();
    if (!locationQuery) return;
    toast.loading('Searching for location...');
    try {
      const { data } = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${locationQuery}`);
      toast.dismiss();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setMapCenter([newPos.lat, newPos.lng]);
        setPosition(newPos);
        toast.success('Location found!');
      } else {
        toast.error('Location not found.');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to search for location.');
    }
  };
  // --- NEW: Function to handle "Use Current Location" ---
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
        return toast.error('Geolocation is not supported by your browser.');
    }

    toast.loading('Finding your location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss();
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMapCenter([newPos.lat, newPos.lng]);
        setPosition(newPos);
        toast.success('Your location has been pinned!');
      },
      () => {
        toast.dismiss();
        toast.error('Unable to retrieve your location. Please grant permission.');
      }
    );
  };

const handleSuggestTitle = async () => {
    // 1. Check if the description is long enough for the AI
    if (description.trim().length < 20) {
      return toast.error('Please write a longer description for the AI to work.');
    }

    // 2. Set loading state to true to show "Generating..." on the button
    setIsGenerating(true);
    
    try {
      // 3. Prepare the request with the user's authentication token
      const config = { 
        headers: { Authorization: `Bearer ${user.token}` } 
      };

      // 4. Send the description to the backend AI endpoint
      const { data } = await axios.post(`${API_URL}/api/ai/suggest-title`, { description }, config);
      
      // 5. Update the title field with the AI's response
      setTitle(data.title);
      toast.success('AI suggestion complete!');

    } catch (error) {
      console.error('AI title suggestion failed:', error);
      toast.error('Failed to get AI suggestion.');
    } finally {
      // 6. Set loading state back to false
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) {
      return toast.error('Please select a location on the map.');
    }

    let imageUrl = '';

    if (imageFile) {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', imageFile);
     try {
        // --- THIS IS THE CORRECTED CONFIGURATION ---
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${user.token}`,
          },
          // onUploadProgress is a sibling to headers, not inside it
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          },
        };
        const { data } = await axios.post(`${API_URL}/api/upload`, formData, config);
        imageUrl = data.imageUrl;
      } catch (error) {
        toast.error('Media upload failed. Post was not created.');
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    try {
      const postData = {
        title,
        description,
        image: imageUrl,
        location: { coordinates: [position.lng, position.lat] },
      };
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${API_URL}/api/posts`, postData, config);
      toast.success('Help request created successfully!');
      navigate('/community');
    } catch (error) {
      toast.error('Failed to create post. Please try again.');
    }
  };

  return (
     <>
     {uploading && <UploadProgress progress={uploadProgress} />}
    <div className="bg-cream py-16">
      <div className="max-w-4xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-extrabold text-secondary mb-8 text-center">Create a New Help Request</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-secondary" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-secondary">Description</label>
                <button type="button" onClick={handleSuggestTitle} disabled={isGenerating} className="bg-sky-100 hover:bg-sky-200 text-sky-700 text-xs font-semibold py-1 px-3 rounded-full disabled:bg-gray-200">
                    {isGenerating ? 'Generating...' : '✨ Suggest Title with AI'}
                </button>
              </div>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full p-3 rounded-lg border border-gray-200 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-primary text-secondary" />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Image (Optional)</label>
              <input type="file" accept="image/*, video/mp4, video/quicktime" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover cursor-pointer"/>
            </div>

<div>
              <label className="block text-sm font-medium text-secondary mb-2">Location</label>
              
              {/* --- CORRECTED LOCATION SECTION --- */}
              {/* This is now a div, not a form. It stacks on mobile. */}
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <input 
                  type="text" 
                  value={locationQuery} 
                  onChange={(e) => setLocationQuery(e.target.value)} 
                  placeholder="Type a city or address..." 
                  className="flex-grow p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-secondary"
                />
                <div className="flex gap-2">
                  <button 
                    type="button" // Changed from "submit"
                    onClick={handleLocationSearch} // Changed from onSubmit
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-secondary font-bold py-2 px-6 rounded-lg"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"
                  >
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span className="hidden sm:inline">Current Location</span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted mb-2">Or click on the map to set a pin.</p>
              <div className="h-80 w-full rounded-lg overflow-hidden border">
                <MapContainer center={mapCenter} zoom={5} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                  <LocationMarker position={position} setPosition={setPosition} />
                  <ChangeMapView coords={mapCenter} />
                </MapContainer>
              </div>
            </div>

            <button type="submit" disabled={uploading} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-300 transform hover:scale-105 shadow-lg disabled:bg-muted">
               {uploading ? `Uploading (${uploadProgress}%)` : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default CreatePostPage;