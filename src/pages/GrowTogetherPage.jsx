import { AcademicCapIcon, BriefcaseIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const GrowTogetherPage = () => {
  return (
    <div className="bg-cream py-16">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-secondary tracking-tight">
          Grow Together – Sharing Knowledge & Skills
        </h1>
        <p className="mt-6 text-lg text-muted max-w-2xl mx-auto">
          We believe that every member of a community is both a teacher and a student. 
          Sahayata is a place where neighbors can empower each other by sharing valuable skills.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <div className="bg-surface p-8 rounded-2xl shadow-lg text-center">
            <AcademicCapIcon className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-bold text-secondary">Skill Exchange</h2>
            <p className="mt-2 text-muted">Explore a wide range of skills offered by your neighbors, from gardening and cooking to tech help and tutoring.</p>
          </div>
          {/* Feature Card 2 */}
          <div className="bg-surface p-8 rounded-2xl shadow-lg text-center">
            <BriefcaseIcon className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-bold text-secondary">Workshops & Events</h2>
            <p className="mt-2 text-muted">Join or host local learning sessions. A great way to meet new people and learn something new together.</p>
          </div>
          {/* Feature Card 3 */}
          <div className="bg-surface p-8 rounded-2xl shadow-lg text-center">
            <LightBulbIcon className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-bold text-secondary">How to Contribute</h2>
            <p className="mt-2 text-muted">Have a skill you want to share? It's easy to list your expertise and availability on your profile.</p>
          </div>
        </div>
        <div className="text-center mt-12">
          <Link to="/profile/edit" className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-full text-lg">
            Offer a Skill
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GrowTogetherPage;