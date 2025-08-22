import { useState } from 'react';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send this data to your backend here.
    // For now, we will just show a success message.
    toast.success("Thank you for your message! We'll get back to you soon.");
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="bg-cream py-16">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-secondary">Contact Us</h1>
          <p className="mt-4 text-lg text-muted">Have a question or feedback? We'd love to hear from you.</p>
        </div>
        <div className="bg-surface p-8 rounded-2xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Your Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-3 rounded-lg border border-gray-200 text-secondary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Your Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-3 rounded-lg border border-gray-200 text-secondary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Message</label>
              <textarea name="message" value={formData.message} onChange={handleChange} required rows="5" className="w-full p-3 rounded-lg border border-gray-200 text-secondary resize-none" />
            </div>
            <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg text-lg">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;