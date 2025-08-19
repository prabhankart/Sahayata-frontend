import { UsersIcon, SparklesIcon, HandRaisedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

// The card sub-component with a more premium design
const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-surface p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2 flex flex-col">
      <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 text-primary mb-5">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-secondary mb-3">{title}</h3>
      <p className="text-muted text-sm leading-relaxed flex-grow">{description}</p>
      <a href="#" className="mt-6 font-semibold text-primary hover:text-primary-hover inline-flex items-center">
        Learn More
        <ArrowRightIcon className="ml-2 h-4 w-4" />
      </a>
    </div>
  );
};

// The main Features section component
const Features = () => {
  const featuresData = [
    {
      icon: <UsersIcon className="h-6 w-6" />,
      title: 'Grow Together',
      description: 'Tap into the collective wisdom. Share your unique skills and learn new ones from your neighbors. Every shared experience strengthens our community.',
    },
    {
      icon: <SparklesIcon className="h-6 w-6" />,
      title: 'Connect with Others',
      description: 'Build meaningful local connections. Find individuals nearby who need assistance or offer your support, forging stronger neighborhood bonds.',
    },
    {
      icon: <HandRaisedIcon className="h-6 w-6" />,
      title: 'Get Help, Fast',
      description: 'Need a hand? Post your request and receive timely assistance from verified community members living close by. Swift support is at your fingertips.',
    },
  ];

  return (
    <div className="bg-cream py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-secondary">A Platform Built for Community</h2>
            <p className="mt-4 text-lg text-muted">Everything you need to build a supportive neighborhood.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;