import { useState, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { StarIcon } from '@heroicons/react/24/solid';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ReviewModal = ({ post, reviewee, onClose }) => {
    const { user } = useContext(AuthContext);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return toast.error('Please select a star rating.');

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const reviewData = { postId: post._id, revieweeId: reviewee._id, rating, comment };
            await axios.post(`${API_URL}/api/reviews`, reviewData, config);
            toast.success(`Review for ${reviewee.name} submitted!`);
            onClose();
        } catch (error) {
            toast.error(error.response.data.message || 'Failed to submit review.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
            <div className="bg-surface p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-secondary mb-4">Leave a Review for {reviewee.name}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-secondary mb-2">Rating</label>
                        <div className="flex space-x-1">
                            {[...Array(5)].map((_, index) => {
                                const starValue = index + 1;
                                return (
                                    <StarIcon
                                        key={starValue}
                                        className={`h-8 w-8 cursor-pointer ${starValue <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                        onClick={() => setRating(starValue)}
                                        onMouseEnter={() => setHoverRating(starValue)}
                                        onMouseLeave={() => setHoverRating(0)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-secondary mb-2">Comment</label>
                        <textarea value={comment} onChange={(e) => setComment(e.target.value)} required className="w-full p-3 h-28 rounded-lg border border-gray-200 text-secondary" />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="font-semibold text-muted">Cancel</button>
                        <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-6 rounded-lg">Submit Review</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;