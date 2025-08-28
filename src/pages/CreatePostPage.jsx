import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { MapPinIcon } from '@heroicons/react/24/solid';
import UploadProgress from '../components/UploadProgress';

// ---------- Map helpers ----------
function ChangeMapView({ coords }) {
  const map = useMap();
  map.setView(coords, 13);
  return null;
}

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
}

// ---------- Create Post ----------
const CreatePostPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [urgency, setUrgency] = useState('Medium');
  const [position, setPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default India
  const [locationQuery, setLocationQuery] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Debug watcher
  useEffect(() => {
    console.log('Uploading state changed to:', uploading);
  }, [uploading]);

  // ---------- Location search ----------
  const handleLocationSearch = async (e) => {
    e.preventDefault();
    if (!locationQuery) return;
    toast.loading('Searching for location...');
    try {
      const { data } = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${locationQuery}`
      );
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
    } catch {
      toast.dismiss();
      toast.error('Failed to search for location.');
    }
  };

  // ---------- Current location ----------
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation not supported.');
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
        toast.error('Location access denied.');
      }
    );
  };

  // ---------- AI Suggest Title ----------
  const handleSuggestTitle = async () => {
    if (description.trim().length < 20) {
      return toast.error('Please write a longer description.');
    }
    setIsGenerating(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${API_URL}/api/ai/suggest-title`, { description }, config);
      setTitle(data.title);
      toast.success('AI suggested a title!');
    } catch {
      toast.error('Failed to get AI suggestion.');
    } finally {
      setIsGenerating(false);
    }
  };

  // ---------- Submit ----------
// ---------- Submit ----------
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!user) {
    toast.error("You must be logged in.");
    return;
  }

  let uploadedUrl = "";
  try {
    if (imageFile) {
      const formData = new FormData();
      formData.append("image", imageFile);

      const uploadRes = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      uploadedUrl = uploadRes.data.imageUrl; // ✅ Cloudinary URL
    }
  } catch (err) {
    console.error("Upload error:", err);
    toast.error("Image upload failed.");
    return;
  }

  // Now send post data with imageUrl
  try {
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    await axios.post(
      `${API_URL}/api/posts`,
      {
        title,
        description,
        category,
        urgency,
        image: uploadedUrl, // ✅ send Cloudinary URL here
        location: position
          ? { type: "Point", coordinates: [position.lng, position.lat] }
          : null,
      },
      config
    );

    toast.success("Post created!");
    navigate("/community");
  } catch (err) {
    console.error("Create post error:", err);
    toast.error("Failed to create post.");
  }
};



  return (
    <>
      {uploading && <UploadProgress progress={uploadProgress} />}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200"
          >
            <h2 className="text-3xl font-extrabold text-secondary mb-8 text-center">
              Create a New Help Request
            </h2>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary text-gray-900"
                />
              </div>

              {/* Category + Urgency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-200 text-gray-900"
                  >
                    <option>Home & Repair</option>
                    <option>Tutoring & Learning</option>
                    <option>Tech Support</option>
                    <option>Errands & Shopping</option>
                    <option>Health & Wellness</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Urgency</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-200 text-gray-900"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              {/* Description + AI button */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-secondary">Description</label>
                  <button
                    type="button"
                    onClick={handleSuggestTitle}
                    disabled={isGenerating}
                    className="bg-sky-100 hover:bg-sky-200 text-sky-700 text-xs font-semibold py-1 px-3 rounded-full"
                  >
                    {isGenerating ? 'Generating...' : '✨ Suggest Title with AI'}
                  </button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-gray-200 h-28 resize-none focus:ring-2 focus:ring-primary text-gray-900"
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover cursor-pointer"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Location</label>
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Type a city or address..."
                    className="flex-grow p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary text-gray-900"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleLocationSearch}
                      className="bg-gray-100 hover:bg-gray-200 text-secondary font-bold py-2 px-6 rounded-lg"
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"
                    >
                      <MapPinIcon className="h-5 w-5 mr-2" />
                      <span className="hidden sm:inline">Current Location</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-2">Or click on the map to set a pin.</p>
                <div className="h-80 w-full rounded-lg overflow-hidden border">
                  <MapContainer center={mapCenter} zoom={5} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap"
                    />
                    <LocationMarker position={position} setPosition={setPosition} />
                    <ChangeMapView coords={mapCenter} />
                  </MapContainer>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg text-lg transition transform hover:scale-105 shadow-lg"
              >
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
