import { createContext, useState, useEffect, useCallback } from 'react'; // 1. Import useCallback
import axios from 'axios';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 2. Wrap functions in useCallback to prevent re-creation on every render
  const signup = useCallback(async (name, email, password) => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/users/register', { name, email, password });
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    } catch (error) {
      toast.error(error.response.data.message || 'Signup failed');
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/users/login', { email, password });
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    } catch (error) {
      toast.error(error.response.data.message || 'Login failed');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const loginWithProvider = useCallback((userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);
  // ... inside AuthProvider
const updateUser = useCallback((newUserData) => {
    // Update the user in localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const updatedStoredUser = { ...storedUser, ...newUserData };
    localStorage.setItem('user', JSON.stringify(updatedStoredUser));
    // Update the user in the component state
    setUser(updatedStoredUser);
}, []);

  // Rebuild the context value object
const contextValue = { user, signup, login, logout, loginWithProvider, updateUser };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};