import { HeartIcon, LightBulbIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const AboutPage = () => {
  return (
    <div className="bg-cream py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-secondary tracking-tight">
            Our Story
          </h1>
          <p className="mt-6 text-lg text-muted max-w-3xl mx-auto">
            "My name is Prabhankar Tiwari, and I created Sahayata from a simple idea: that our communities are stronger when we help each other. In a fast-paced world, it's easy to feel disconnected from our neighbors. I wanted to build a trusted platform to bridge that gap, making it easy to ask for help, offer your skills, and build real, meaningful connections right where you live."
          </p>
        </div>

        <div className="mt-16">
          <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-secondary">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value Card 1 */}
            <div className="bg-surface p-8 rounded-2xl shadow-lg text-center">
              <HeartIcon className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-bold text-secondary">Community First</h3>
              <p className="mt-2 text-muted">We prioritize creating a safe, supportive, and positive environment for all our members.</p>
            </div>
            {/* Value Card 2 */}
            <div className="bg-surface p-8 rounded-2xl shadow-lg text-center">
              <LightBulbIcon className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-bold text-secondary">Empowerment</h3>
              <p className="mt-2 text-muted">We believe everyone has valuable skills to share and that helping others is a powerful way to grow.</p>
            </div>
            {/* Value Card 3 */}
            <div className="bg-surface p-8 rounded-2xl shadow-lg text-center">
              <ShieldCheckIcon className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-bold text-secondary">Trust & Safety</h3>
              <p className="mt-2 text-muted">Your safety is our top priority. We are committed to building a platform based on verification and mutual respect.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;