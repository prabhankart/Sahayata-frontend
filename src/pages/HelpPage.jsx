import Accordion from '../components/Accordion';

const HelpPage = () => {
  const faqs = [
    {
      question: 'How do I create a new help request?',
      answer: 'Once you are logged in, click the "Create Post" button in the navigation bar. Fill out the form with a title, a detailed description, and pin your location on the map. You can also optionally add an image.'
    },
    {
      question: 'How do I pledge to help someone?',
      answer: 'On the homepage, you will see a list of recent requests. If you are logged in and the request was not made by you, you will see a "Pledge to Help" button. Clicking this will add you to the list of helpers.'
    },
    {
      question: 'What does voting on a post do?',
      answer: 'Upvoting a post helps increase its visibility, showing others that the request is important or urgent. It helps the community prioritize where help is needed most.'
    },
    {
      question: 'Is my personal information safe?',
      answer: 'Absolutely. We only share your name with the community. Your email and other personal details are never shown. Communication for coordination happens through the platform without revealing contact information.'
    },
  ];

  return (
    <div className="bg-cream min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-secondary">Help Center</h1>
          <p className="mt-4 text-lg text-muted">Find answers to your questions below.</p>
        </div>
        <div className="bg-surface p-8 rounded-xl shadow-md">
            {faqs.map((faq, index) => (
                <Accordion key={index} title={faq.question}>
                    <p>{faq.answer}</p>
                </Accordion>
            ))}
        </div>
      </div>
    </div>
  );
};

export default HelpPage;