import { MegaphoneIcon, CheckBadgeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const GetHelpPage = () => {
  return (
    <div className="bg-cream py-16">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-secondary tracking-tight">
          Get Help When You Need It
        </h1>
        <p className="mt-6 text-lg text-muted max-w-2xl mx-auto">
          Our platform is designed to make asking for support simple, safe, and effective. 
          Post a request and get connected with trusted helpers from your area.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <div className="bg-surface p-8 rounded-2xl shadow-lg text-center">
            <MegaphoneIcon className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-bold text-secondary">1. Post a Request</h2>
            <p className="mt-2 text-muted">Fill out a simple form with details like category, urgency, and location. Add a photo or video to be even more clear.</p>
          </div>
          {/* Feature Card 2 */}
          <div className="bg-surface p-8 rounded-2xl shadow-lg text-center">
            <CheckBadgeIcon className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-bold text-secondary">2. Helper Accepts</h2>
            <p className="mt-2 text-muted">Verified community members near you will see your request. Someone with the right skills can pledge to help.</p>
          </div>
          {/* Feature Card 3 */}
          <div className="bg-surface p-8 rounded-2xl shadow-lg text-center">
            <ArrowPathIcon className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-bold text-secondary">3. Get Support</h2>
            <p className="mt-2 text-muted">Coordinate with your helper via our secure, private chat to get the support you need quickly and safely.</p>
          </div>
        </div>
        <div className="text-center mt-12">
          <Link to="/create-post" className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-full text-lg">
            Request Help Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GetHelpPage;