import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EditProfilePage = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ bio: '', skills: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.bio || '',
        skills: user.skills?.join(', ') || '',
      });
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const skillsArray = formData.skills.split(',').map(skill => skill.trim()).filter(Boolean);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`${API_URL}/api/users/profile`, { ...formData, skills: skillsArray }, config);
      updateUser(data);
      toast.success('Profile updated successfully!');
      navigate(`/profile/${user._id}`);
    } catch (error) {
      toast.error('Failed to update profile.');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="bg-cream py-16">
      <div className="max-w-4xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-extrabold text-secondary mb-8 text-center">Edit Your Profile</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">About Me (Bio)</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 h-28 text-secondary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Your Skills (comma separated)</label>
              <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g., Plumbing, English Tutoring, Cooking" className="w-full p-3 rounded-lg border border-gray-200 text-secondary" />
            </div>
            <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;