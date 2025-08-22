import { MapPinIcon, ChatBubbleBottomCenterTextIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const ConnectOthersPage = () => {
  return (
    <div className="bg-cream py-16">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-secondary tracking-tight">
          Connect Locally, Build Stronger Bonds
        </h1>
        <p className="mt-6 text-lg text-muted max-w-2xl mx-auto">
          Sahayata is more than just a platform for help; it's a way to meet and build relationships with the people in your immediate community.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <div className="bg-surface p-8 rounded-2xl shadow-lg text-center">
            <MapPinIcon className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-bold text-secondary">Nearby Connections</h2>
            <p className="mt-2 text-muted">Use our Connect and Map pages to find other members in your neighborhood who are ready to help and collaborate.</p>
          </div>
          {/* Feature Card 2 */}
          <div className="bg-surface p-8 rounded-2xl shadow-lg text-center">
            <UserGroupIcon className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-bold text-secondary">Community Groups</h2>
            <p className="mt-2 text-muted">Join or create small, local groups based on shared interests, like a parents' group, senior support, or a volunteer team.</p>
          </div>
          {/* Feature Card 3 */}
          <div className="bg-surface p-8 rounded-2xl shadow-lg text-center">
            <ChatBubbleBottomCenterTextIcon className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-bold text-secondary">Activities & Meetups</h2>
            <p className="mt-2 text-muted">Organize or join community activities like local clean-up drives, social meetups, or festive events.</p>
          </div>
        </div>
        <div className="text-center mt-12">
          <Link to="/connect" className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-full text-lg">
            Find Members
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConnectOthersPage;