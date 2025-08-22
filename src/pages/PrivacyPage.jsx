const PrivacyPage = () => {
  return (
    <div className="bg-cream py-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* The 'prose' class from Tailwind adds nice typography styling for text blocks */}
        {/* We also add our text colors like 'text-secondary' and 'text-muted' */}
        <div className="bg-surface p-8 sm:p-12 rounded-2xl shadow-xl prose prose-slate max-w-none text-muted">
          <h1 className="text-secondary">Privacy Policy</h1>
          <p>Last updated: August 22, 2025</p>
          <p>
            Welcome to Sahayata. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
          </p>
          <h2 className="text-secondary">Information We Collect</h2>
          <p>
            We may collect information about you in a variety of ways. The information we may collect on the Site includes personal data, such as your name, email address, and demographic information, such as your location, that you voluntarily give to us when you register with the Site.
          </p>
          <h2 className="text-secondary">How We Use Your Information</h2>
          <p>
            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to create and manage your account, email you regarding your account or order, and enable user-to-user communications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage; 