import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Hero from '../components/Hero';
import Features from '../components/Features';

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If the user is logged in, redirect them to the community feed
    if (user) {
      navigate('/community');
    }
  }, [user, navigate]);

  // If the user is not logged in, they will see the welcome content
  return (
    <div className="bg-cream">
      <Hero />
      <Features />
    </div>
  );
};

export default HomePage;