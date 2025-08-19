import { useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Spinner from '../components/Spinner'; // 1. Import the Spinner component

const AuthSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithProvider } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userString = params.get('user');
    
    if (userString) {
      try {
        const userData = JSON.parse(decodeURIComponent(userString));
        loginWithProvider(userData);
        navigate('/'); // Redirect to homepage on success
      } catch (error) {
        console.error("Failed to parse user data", error);
        navigate('/login'); // Redirect to login on error
      }
    } else {
      // If no user data is found in the URL, redirect to login
      navigate('/login');
    }
  }, [location, navigate, loginWithProvider]);

  // 2. Display the Spinner component while processing
  return (
    <div className="flex justify-center items-center h-screen">
      <Spinner />
    </div>
  );
};

export default AuthSuccessPage;