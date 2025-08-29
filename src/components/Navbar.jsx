import { useContext, useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  QuestionMarkCircleIcon,
  GlobeAltIcon,
  XMarkIcon,
  UserGroupIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import FriendRequestDropdown from './FriendRequestDropdown';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/** click-outside hook (with matching options on cleanup) */
function useClickOutside(ref, callback) {
  useEffect(() => {
    const opts = { passive: true };
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) callback?.();
    }
    document.addEventListener('pointerdown', handle, opts);
    return () => document.removeEventListener('pointerdown', handle, opts);
  }, [ref, callback]);
}

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

const NavItem = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `relative font-semibold transition-all duration-300 ${
        isActive
          ? 'text-primary after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-gradient-to-r after:from-primary after:to-fuchsia-500 after:rounded-full'
          : 'text-gray-500 hover:text-primary'
      }`
    }
  >
    {children}
  </NavLink>
);

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/messages');

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
    }

    let intervalId;
    const ctrl = new AbortController();

    const load = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
          signal: ctrl.signal,
        };
        const { data } = await axios.get(`${API_URL}/api/friends/requests`, config);
        setPendingRequestCount(Array.isArray(data) ? data.length : 0);
      } catch {
        // silent (avoid noisy toasts in nav)
      }
    };

    // initial & polling
    load();
    intervalId = setInterval(load, 15000);

    // refresh when tab becomes visible again
    const onVisible = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', onVisible);

    // app-wide custom event (fire this after accept/decline)
    const refresh = () => load();
    window.addEventListener('friends:changed', refresh);

    return () => {
      ctrl.abort();
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('friends:changed', refresh);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/70 backdrop-blur-xl shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* left: logo */}
          <div className="flex items-center space-x-3">
            {isChatPage && (
              <button
                onClick={() => navigate('/messages')}
                className="rounded-lg bg-gray-100/80 px-3 py-2 text-sm hover:bg-gray-200"
              >
                ⬅ Back
              </button>
            )}
            <Link
              to="/"
              className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-fuchsia-500 bg-clip-text text-transparent"
            >
              Sahayata
            </Link>
          </div>

          {/* center nav */}
          <nav className="hidden md:flex items-center space-x-10 text-base">
            <NavItem to="/community">Community</NavItem>
            <NavItem to="/map">Map View</NavItem>
            <NavItem to="/connect">Connect</NavItem>
            <NavItem to="/groups">Groups</NavItem>
          </nav>

          {/* right actions (desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/help" className="rounded-full p-2 hover:bg-gray-100">
              <QuestionMarkCircleIcon className="h-6 w-6 text-gray-500" />
            </Link>

            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen((v) => !v)}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <GlobeAltIcon className="h-6 w-6 text-gray-500" />
              </button>
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
                  {['English (US)', 'हिन्दी', 'Español'].map((lang) => (
                    <button
                      key={lang}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-purple-50 hover:text-primary"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <>
                <Link to="/messages" className="rounded-full p-2 hover:bg-gray-100 relative">
                  <EnvelopeIcon className="h-6 w-6 text-gray-500" />
                </Link>

                <div className="relative" ref={friendMenuRef}>
                  <button
                    onClick={() => setIsFriendDropdownOpen((v) => !v)}
                    className="relative rounded-full p-2 hover:bg-gray-100"
                    aria-label="Friend requests"
                  >
                    <UserGroupIcon className="h-6 w-6 text-gray-500" />
                    {pendingRequestCount > 0 && (
                      <span className="absolute right-1 top-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                  </button>
                  {isFriendDropdownOpen && <FriendRequestDropdown />}
                </div>

                <Link
                  to="/create-post"
                  className="text-sm font-semibold text-gray-600 hover:text-primary"
                >
                  Create Post
                </Link>

                <Link
                  to={`/profile/${user._id}`}
                  className="text-sm font-semibold text-gray-600 hover:text-primary"
                >
                  Hi, {user.name}
                </Link>

                <button
                  onClick={handleLogout}
                  className="rounded-full bg-gradient-to-r from-primary to-fuchsia-600 px-5 py-2 text-sm font-bold text-white shadow-md transition-transform hover:scale-105"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-gradient-to-r from-primary to-fuchsia-600 px-5 py-2 text-sm font-bold text-white shadow-md hover:scale-105 transition"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* mobile button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen((v) => !v)} className="text-gray-600" aria-label="Toggle menu">
              {isMenuOpen ? <XMarkIcon className="h-7 w-7" /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden space-y-4 border-t border-gray-200 bg-white px-4 pb-5 pt-4 shadow-md">
          <NavLink to="/community" onClick={() => setIsMenuOpen(false)} className="block font-semibold text-gray-600 hover:text-primary">Community</NavLink>
          <NavLink to="/map" onClick={() => setIsMenuOpen(false)} className="block font-semibold text-gray-600 hover:text-primary">Map View</NavLink>
          <NavLink to="/connect" onClick={() => setIsMenuOpen(false)} className="block font-semibold text-gray-600 hover:text-primary">Connect</NavLink>
          <NavLink to="/groups" onClick={() => setIsMenuOpen(false)} className="block font-semibold text-gray-600 hover:text-primary">Groups</NavLink>

          {user && (
            <>
              <NavLink to="/create-post" onClick={() => setIsMenuOpen(false)} className="block font-semibold text-gray-600 hover:text-primary">Create Post</NavLink>
              <NavLink to="/messages" onClick={() => setIsMenuOpen(false)} className="block font-semibold text-gray-600 hover:text-primary">Messages</NavLink>

              {/* Friend requests (mobile) */}
              <div className="relative mt-2" ref={friendMenuRef}>
                <button
                  onClick={() => setIsFriendDropdownOpen((v) => !v)}
                  className="relative rounded-full p-2 hover:bg-gray-100"
                  aria-label="Friend requests"
                >
                  <UserGroupIcon className="h-6 w-6 text-gray-500" />
                  {pendingRequestCount > 0 && (
                    <span className="absolute right-1 top-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </button>
                {isFriendDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-[min(92vw,22rem)] max-h-[60vh] overflow-auto rounded-xl bg-white shadow-lg ring-1 ring-black/5 z-50">
                    <FriendRequestDropdown />
                  </div>
                )}
              </div>
            </>
          )}

          <div className="mt-4 border-t border-gray-200 pt-4">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full rounded-lg bg-gradient-to-r from-primary to-fuchsia-600 py-2 text-center font-semibold text-white shadow hover:opacity-95"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full rounded-lg bg-gradient-to-r from-primary to-fuchsia-600 py-2 text-center font-semibold text-white shadow hover:opacity-95"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

