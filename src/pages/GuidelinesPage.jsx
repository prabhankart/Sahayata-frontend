import { HandRaisedIcon, HeartIcon, NoSymbolIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const GuidelineItem = ({ icon, title, description }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100 text-primary">
      {icon}
    </div>
    <div className="ml-4">
      <h3 className="text-lg font-bold text-secondary">{title}</h3>
      <p className="mt-1 text-muted">{description}</p>
    </div>
  </div>
);

const GuidelinesPage = () => {
  return (
    <div className="bg-cream py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-secondary">Community Guidelines</h1>
          <p className="mt-4 text-lg text-muted">A shared commitment to keeping our community safe, respectful, and helpful.</p>
        </div>
        <div className="bg-surface p-8 rounded-2xl shadow-xl space-y-8">
          <GuidelineItem
            icon={<HeartIcon className="h-6 w-6" />}
            title="Be Respectful & Kind"
            description="Treat every member with respect. Harassment, hate speech, and bullying will not be tolerated. We are a community built on mutual support."
          />
          <GuidelineItem
            icon={<ShieldCheckIcon className="h-6 w-6" />}
            title="Prioritize Safety"
            description="Do not share sensitive personal information like your exact address, phone number, or financial details in public posts. Use our private chat for coordination."
          />
          <GuidelineItem
            icon={<HandRaisedIcon className="h-6 w-6" />}
            title="Be Genuinely Helpful"
            description="Offer help when you are genuinely able to. If you request help, be clear and appreciative. Our goal is to foster a culture of authentic support."
          />
          <GuidelineItem
            icon={<NoSymbolIcon className="h-6 w-6" />}
            title="No Commercial Activity"
            description="Sahayata is for neighbors helping neighbors, not for commercial advertising or transactions. Do not promote businesses or solicit payment for services."
          />
        </div>
      </div>
    </div>
  );
};

export default GuidelinesPage;