import { StarIcon } from '@heroicons/react/24/solid';

const StarRating = ({ rating }) => {
  const totalStars = 5;
  const fullStars = Math.round(rating); // Round to nearest whole star

  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, index) => (
        <StarIcon
          key={index}
          className={`h-5 w-5 ${index < fullStars ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
};

export default StarRating;