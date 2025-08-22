import { Link } from 'react-router-dom';
const Footer = () => {
  // Note: We are now using light text colors like text-gray-400 and hover:text-white
  return (
    <footer className="bg-secondary text-gray-400">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1 */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Solutions</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="hover:text-white">Community Help</a></li>
              <li><a href="#" className="hover:text-white">Local Events</a></li>
              <li><a href="#" className="hover:text-white">Skill Sharing</a></li>
            </ul>
          </div>
          {/* Column 2 */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link to="/guidelines" className="hover:text-white">Guidelines</Link></li>
            </ul>
          </div>
          {/* Column 3 */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/about" className="hover:text-white">About</Link></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Press</a></li>
            </ul>
          </div>
          {/* Column 4 */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
             <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 flex items-center justify-between">
          <p className="text-base">&copy; {new Date().getFullYear()} Sahayata, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;