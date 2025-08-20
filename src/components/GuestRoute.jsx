import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const GuestRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (user) {
    // If the user is logged in, redirect them away from the guest page
    return <Navigate to="/community" />;
  }

  return children;
};

export default GuestRoute;