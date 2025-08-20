import { useContext, useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { QuestionMarkCircleIcon, GlobeAltIcon, XMarkIcon, UserGroupIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import FriendRequestDropdown from './FriendRequestDropdown';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// A custom hook to detect clicks outside an element (for closing dropdowns)
function useClickOutside(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}

// Helper component for the mobile menu icon
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

// Helper component for styled navigation links
const NavItem = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `font-semibold transition-colors duration-300 ${
        isActive ? 'text-primary' : 'text-muted hover:text-secondary'
      }`
    }
  >
    {children}
  </NavLink>
);

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFriendDropdownOpen, setIsFriendDropdownOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  const langMenuRef = useRef(null);
  const friendMenuRef = useRef(null);
  useClickOutside(langMenuRef, () => setIsLangMenuOpen(false));
  useClickOutside(friendMenuRef, () => setIsFriendDropdownOpen(false));

  useEffect(() => {
    if (!user) {
      setPendingRequestCount(0);
      return;
    };
    const fetchRequests = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${API_URL}/api/friends/requests`, config);
        setPendingRequestCount(data.length);
      } catch (error) {
        // handle error silently
      }
    };
    fetchRequests();
  }, [user]);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="bg-surface/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="text-primary font-extrabold text-3xl">
            Sahayata
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 text-base">
            <NavItem to="/community">Community</NavItem>
            <NavItem to="/map">Map View</NavItem>
            <NavItem to="/connect">Connect</NavItem>
          </div>

          {/* Desktop Right Side Actions */}
          <div className="hidden md:flex items-center space-x-5">
            <Link to="/help" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <QuestionMarkCircleIcon className="h-6 w-6 text-muted" />
            </Link>
            <div className="relative" ref={langMenuRef}>
              <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <GlobeAltIcon className="h-6 w-6 text-muted" />
              </button>
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-xl py-2">
                  <a href="#" className="block px-4 py-2 text-sm text-secondary hover:bg-gray-100">English (US)</a>
                  <a href="#" className="block px-4 py-2 text-sm text-secondary hover:bg-gray-100">Hindi</a>
                  <a href="#" className="block px-4 py-2 text-sm text-secondary hover:bg-gray-100">Español</a>
                </div>
              )}
            </div>

            {user ? (
              <>
                <Link to="/messages" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <EnvelopeIcon className="h-6 w-6 text-muted" />
                </Link>
                <div className="relative" ref={friendMenuRef}>
                  <button onClick={() => setIsFriendDropdownOpen(!isFriendDropdownOpen)} className="p-2 rounded-full hover:bg-gray-100 relative">
                    <UserGroupIcon className="h-6 w-6 text-muted" />
                    {pendingRequestCount > 0 && (
                      <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                    )}
                  </button>
                  {isFriendDropdownOpen && <FriendRequestDropdown />}
                </div>
                <span className="text-gray-200">|</span>
                
                {/* "CREATE POST" LINK ADDED BACK HERE */}
                <Link to="/create-post" className="text-sm font-semibold text-muted hover:text-primary transition-colors duration-300">
                  Create Post
                </Link>

                <span className="text-muted text-sm font-semibold">Hi, {user.name}</span>
                <button onClick={handleLogout} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-5 rounded-full text-sm shadow-md transform hover:scale-105 transition-all duration-300">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-gray-100 hover:bg-gray-200 text-secondary font-bold py-2 px-5 rounded-full text-sm transition-colors duration-300">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-secondary">
              {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pt-4 pb-5 space-y-4 bg-surface border-t border-gray-200">
          <NavLink to="/community" onClick={() => setIsMenuOpen(false)} className="block font-semibold text-muted hover:text-secondary">Community</NavLink>
          <NavLink to="/map" onClick={() => setIsMenuOpen(false)} className="block font-semibold text-muted hover:text-secondary">Map View</NavLink>
          <NavLink to="/connect" onClick={() => setIsMenuOpen(false)} className="block font-semibold text-muted hover:text-secondary">Connect</NavLink>
          {user && <NavLink to="/messages" onClick={() => setIsMenuOpen(false)} className="block font-semibold text-muted hover:text-secondary">Messages</NavLink>}
          
          {/* "CREATE POST" LINK ADDED BACK TO MOBILE MENU HERE */}
          {user && <NavLink to="/create-post" onClick={() => setIsMenuOpen(false)} className="block font-semibold text-muted hover:text-secondary">Create Post</NavLink>}
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            {user ? (
              <button onClick={handleLogout} className="w-full text-center bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg">Logout</button>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full text-center bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg block">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;