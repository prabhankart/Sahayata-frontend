import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import StarRating from '../components/StarRating';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProfilePage = () => {
  const { id } = useParams();
  const { user: loggedInUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileRes, reviewsRes] = await Promise.all([
          axios.get(`${API_URL}/api/users/${id}/profile`),
          axios.get(`${API_URL}/api/reviews/user/${id}`)
        ]);
        setProfile(profileRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [id]);

  if (loading) return <Spinner />;
  if (!profile) return <p>User not found.</p>;

  return (
    <div className="bg-cream py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface p-8 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0 w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-5xl font-bold text-primary">{profile.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-secondary">{profile.name}</h1>
              <p className="text-muted">{profile.location}</p>
            </div>
            {loggedInUser?._id === profile._id && (
              <Link to="/profile/edit" className="ml-auto bg-gray-100 hover:bg-gray-200 text-secondary font-bold py-2 px-5 rounded-full text-sm">
                Edit Profile
              </Link>
            )}
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-secondary mb-4">About Me</h3>
            <p className="text-muted">{profile.bio || 'This user has not written a bio yet.'}</p>

            <h3 className="text-xl font-bold text-secondary mt-8 mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.length > 0 ? profile.skills.map(skill => (
                <span key={skill} className="bg-purple-100 text-primary text-sm font-semibold px-3 py-1 rounded-full">{skill}</span>
              )) : <p className="text-muted">No skills listed.</p>}
            </div>

            {/* --- NEW: Reviews Section --- */}
            <h3 className="text-xl font-bold text-secondary mt-8 mb-4">Reviews & Ratings</h3>
            <div className="flex items-center space-x-2 mb-6">
              <StarRating rating={profile.averageRating} />
              <span className="text-muted font-semibold">{profile.averageRating.toFixed(1)}</span>
              <span className="text-muted">({profile.numReviews} reviews)</span>
            </div>

            <div className="space-y-6">
              {reviews.length > 0 ? reviews.map(review => (
                <div key={review._id} className="border-t border-gray-200 pt-4">
                  <div className="flex items-center mb-2">
                    <StarRating rating={review.rating} />
                    <p className="ml-4 font-semibold text-secondary">{review.reviewer.name}</p>
                  </div>
                  <p className="text-muted">{review.comment}</p>
                </div>
              )) : <p className="text-muted">This user has no reviews yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;