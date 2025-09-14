import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Navbar from './components/Navbar';
import CreatePostPage from './pages/CreatePostPage';
import ProtectedRoute from './components/ProtectedRoute';
import MapViewPage from './pages/MapViewPage';
import { Toaster } from 'react-hot-toast';
import Footer from './components/Footer';
import PostDetailsPage from './pages/PostDetailsPage';
import AuthSuccessPage from './pages/AuthSuccessPage';
import HelpPage from './pages/HelpPage';
import CommunityPage from './pages/CommunityPage';
import ConnectPage from './pages/ConnectPage';
import MessagesPage from './pages/MessagesPage';
import Breadcrumbs from './components/Breadcrumbs';
import EditPostPage from './pages/EditPostPage';
import ScrollToTop from './components/ScrollToTop';
import GuestRoute from './components/GuestRoute';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import GrowTogetherPage from './pages/GrowTogetherPage';
import ConnectOthersPage from './pages/ConnectOthersPage';
import GetHelpPage from './pages/GetHelpPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import GuidelinesPage from './pages/GuidelinesPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import GroupsPage from './pages/GroupsPage';
import GroupPage from './pages/GroupPage';

// ⬇️ NEW: initialize i18n (no code changes needed elsewhere)
import './i18n';

function LayoutWrapper({ children }) {
  const location = useLocation();
  const isMessagesPage = location.pathname.startsWith("/messages");

  return (
    <div className="bg-slate-900 min-h-screen text-white flex flex-col">
      <Toaster position="top-center" reverseOrder={false} />
      {!isMessagesPage && <Navbar />}
      {!isMessagesPage && <Breadcrumbs />}

      {/* Content */}
      <div className="flex-1">{children}</div>

      {!isMessagesPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <LayoutWrapper>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapViewPage />} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
          <Route path="/post/:id" element={<PostDetailsPage />} />
          <Route path="/auth/success" element={<AuthSuccessPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/connect" element={<ConnectPage />} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/post/:id/edit" element={<ProtectedRoute><EditPostPage /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
          <Route path="/grow-together" element={<GrowTogetherPage />} />
          <Route path="/connect-others" element={<ConnectOthersPage />} />
          <Route path="/get-help" element={<GetHelpPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/guidelines" element={<GuidelinesPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/create-post" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:groupId" element={<GroupPage />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;
