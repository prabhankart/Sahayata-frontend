import { useContext, useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import {
  QuestionMarkCircleIcon,
  GlobeAltIcon,
  XMarkIcon,
  UserGroupIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import FriendRequestDropdown from "./FriendRequestDropdown";
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// click-outside helper
function useClickOutside(ref, callback) {
  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) callback?.();
    };
    document.addEventListener("pointerdown", handle, { passive: true });
    return () => document.removeEventListener("pointerdown", handle);
  }, [ref, callback]);
}

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

// lighter pill links
const NavItem = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      [
        "relative rounded-lg px-3 py-2 font-semibold tracking-wide transition-all duration-200",
        "hover:bg-gray-50 hover:text-violet-700",
        isActive
          ? "text-violet-700 bg-violet-50 border border-violet-100"
          : "text-gray-700",
      ].join(" ")
    }
  >
    {children}
  </NavLink>
);

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/messages");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFriendDropdownOpen, setIsFriendDropdownOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  const langMenuRef = useRef(null);
  const friendMenuRef = useRef(null);
  useClickOutside(langMenuRef, () => setIsLangMenuOpen(false));
  useClickOutside(friendMenuRef, () => setIsFriendDropdownOpen(false));

  const languageCodes = ["en","hi","es","mr","gu","bn","ta","te","kn","pa","ur"];
  const languages = languageCodes.map(code => ({ code, label: t(`lang.${code}`) }));

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    try { window.localStorage.setItem("lang", code); } catch {}
    setIsLangMenuOpen(false);
  };

  // keep friend badge fresh
  useEffect(() => {
    if (!user) {
      setPendingRequestCount(0);
      return;
    }
    const ctrl = new AbortController();
    const load = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/friends/requests`, {
          headers: { Authorization: `Bearer ${user.token}` },
          signal: ctrl.signal,
        });
        setPendingRequestCount(Array.isArray(data) ? data.length : 0);
      } catch {}
    };
    load();
    const t = setInterval(load, 15000);
    return () => {
      ctrl.abort();
      clearInterval(t);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/login");
  };

  const firstName = user?.name?.split(" ")?.[0] || user?.name || "";

  return (
    <header className="sticky top-0 z-50">
      {/* ultra-light frosted bar */}
      <div className="absolute inset-0 -z-10 bg-white/95 supports-[backdrop-filter]:bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-[0_4px_16px_-12px_rgba(0,0,0,0.08)]"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Left: Back + Logo */}
          <div className="flex items-center gap-3">
            {isChatPage && (
              <button
                onClick={() => navigate("/messages")}
                className="rounded-md bg-white px-3 py-2 text-sm text-gray-700 border border-gray-200 hover:bg-gray-50"
              >
                {t("actions.back")}
              </button>
            )}
            <Link
              to="/"
              className="text-3xl font-extrabold bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent"
            >
              {t("brand")}
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-1 text-base">
            <NavItem to="/community">{t("nav.community")}</NavItem>
            <NavItem to="/map">{t("nav.map")}</NavItem>
            <NavItem to="/connect">{t("nav.connect")}</NavItem>
            <NavItem to="/groups">{t("nav.groups")}</NavItem>
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/help" className="rounded-md p-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition" aria-label={t("actions.help")}>
              <QuestionMarkCircleIcon className="h-6 w-6 text-gray-500" />
            </Link>

            {/* Language */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen((v) => !v)}
                className="rounded-md p-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition"
                aria-label="Language"
                title="Language"
              >
                <GlobeAltIcon className="h-6 w-6 text-gray-500" />
              </button>
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl bg-white shadow-md border border-gray-100">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => changeLang(l.code)}
                      className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <span>{l.label}</span>
                      {i18n.language === l.code && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <>
                <Link
                  to="/messages"
                  className="relative rounded-md p-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition"
                  aria-label={t("actions.messages")}
                >
                  <EnvelopeIcon className="h-6 w-6 text-gray-500" />
                </Link>

                {/* Friend requests */}
                <div className="relative" ref={friendMenuRef}>
                  <button
                    onClick={() => setIsFriendDropdownOpen((v) => !v)}
                    className="relative rounded-md p-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition"
                    aria-label={t("actions.friendRequests")}
                  >
                    <UserGroupIcon className="h-6 w-6 text-gray-500" />
                    {pendingRequestCount > 0 && (
                      <span className="absolute right-1 top-1 block h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
                    )}
                  </button>
                  {isFriendDropdownOpen && (
                    <FriendRequestDropdown
                      token={user.token}
                      onHandled={() => window.dispatchEvent(new Event("friends:changed"))}
                    />
                  )}
                </div>

                <Link
                  to="/create-post"
                  className="rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:text-violet-700 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition"
                >
                  {t("actions.createPost")}
                </Link>

                <Link
                  to={`/profile/${user._id}`}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:text-violet-700 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition"
                >
                  {t("greeting", { name: firstName })}
                </Link>

                <button
                  onClick={handleLogout}
                  className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2 text-sm font-bold text-white shadow-sm hover:shadow transition"
                >
                  {t("actions.logout")}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2 text-sm font-bold text-white shadow-sm hover:shadow transition"
              >
                {t("actions.signIn")}
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="rounded-md p-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition"
              aria-label="Open menu"
            >
              {isMenuOpen ? <XMarkIcon className="h-7 w-7" /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-sm px-4 pb-5 pt-4 shadow-sm">
          <div className="space-y-2">
            <NavLink to="/community" onClick={() => setIsMenuOpen(false)} className="block rounded-md px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50 transition">{t("nav.community")}</NavLink>
            <NavLink to="/map" onClick={() => setIsMenuOpen(false)} className="block rounded-md px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50 transition">{t("nav.map")}</NavLink>
            <NavLink to="/connect" onClick={() => setIsMenuOpen(false)} className="block rounded-md px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50 transition">{t("nav.connect")}</NavLink>
            <NavLink to="/groups" onClick={() => setIsMenuOpen(false)} className="block rounded-md px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50 transition">{t("nav.groups")}</NavLink>

            {user && (
              <>
                <NavLink to="/create-post" onClick={() => setIsMenuOpen(false)} className="block rounded-md px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50 transition">{t("actions.createPost")}</NavLink>
                <NavLink to="/messages" onClick={() => setIsMenuOpen(false)} className="block rounded-md px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50 transition">{t("actions.messages")}</NavLink>

                <div className="relative">
                  <button
                    onClick={() => setIsFriendDropdownOpen((v) => !v)}
                    className="relative rounded-md px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    {t("actions.friendRequests")}
                    {pendingRequestCount > 0 && (
                      <span className="ml-2 inline-block h-2.5 w-2.5 rounded-full bg-rose-500 align-middle"></span>
                    )}
                  </button>
                  {isFriendDropdownOpen && (
                    <div className="mt-2 w-full max-h-[60vh] overflow-auto rounded-xl bg-white shadow border border-gray-100">
                      <FriendRequestDropdown
                        token={user.token}
                        onHandled={() => window.dispatchEvent(new Event("friends:changed"))}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4">
            {user ? (
              <button onClick={handleLogout} className="w-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 py-2 text-center font-semibold text-white shadow-sm hover:shadow transition">
                {t("actions.logout")}
              </button>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block w-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 py-2 text-center font-semibold text-white shadow-sm hover:shadow transition">
                {t("actions.signIn")}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
