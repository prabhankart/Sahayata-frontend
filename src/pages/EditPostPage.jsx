import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const EditPostPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currentImage, setCurrentImage] = useState(''); // To display the existing image
  const [imageFile, setImageFile] = useState(null); // For the new selected image
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/posts/${id}`);
        setTitle(data.title);
        setDescription(data.description);
        setCurrentImage(data.image); // Set the current image URL
        setLoading(false);
      } catch (error) {
        toast.error('Could not fetch post data.');
        navigate('/community');
      }
    };
    fetchPost();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = currentImage; // Start with the existing image URL

    // Step 1: If a new file is selected, upload it first.
    if (imageFile) {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', imageFile);
      try {
        const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.post('http://localhost:5000/api/upload', formData, config);
        imageUrl = data.imageUrl; // Get the new image URL
      } catch (error) {
        toast.error('New image upload failed. Please try again.');
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    // Step 2: Update the post with all data (including the new or existing image URL)
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const postData = { title, description, image: imageUrl };
      await axios.put(`http://localhost:5000/api/posts/${id}`, postData, config);
      toast.success('Post updated successfully!');
      navigate(`/post/${id}`);
    } catch (error) {
      toast.error('Failed to update post.');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="bg-cream py-16">
      <div className="max-w-4xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-extrabold text-secondary mb-8 text-center">Edit Your Help Request</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-3 rounded-lg border border-gray-200 text-secondary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full p-3 rounded-lg border border-gray-200 h-40 resize-none text-secondary" />
            </div>

            {/* --- NEW: Image Update Section --- */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Update Image (Optional)</label>
              {currentImage && !imageFile && (
                <div className="mb-4">
                  <p className="text-xs text-muted mb-2">Current image:</p>
                  <img src={currentImage} alt="Current post" className="w-40 h-auto rounded-lg" />
                </div>
              )}
               <input
                type="file"
                accept="image/*, video/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover cursor-pointer"
              />
            </div>

            <button type="submit" disabled={uploading} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg text-lg disabled:bg-muted">
              {uploading ? 'Uploading new image...' : 'Update Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostPage;