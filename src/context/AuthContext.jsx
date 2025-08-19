import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

// 1. Define the base URL for your API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const signup = useCallback(async (name, email, password) => {
    try {
      // 2. Use the dynamic API_URL
      const { data } = await axios.post(`${API_URL}/api/users/register`, { name, email, password });
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    } catch (error) {
      toast.error(error.response.data.message || 'Signup failed');
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      // 3. Use the dynamic API_URL
      const { data } = await axios.post(`${API_URL}/api/users/login`, { email, password });
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

  const updateUser = useCallback((newUserData) => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const updatedStoredUser = { ...storedUser, ...newUserData };
    localStorage.setItem('user', JSON.stringify(updatedStoredUser));
    setUser(updatedStoredUser);
  }, []);

  const contextValue = { user, signup, login, logout, loginWithProvider, updateUser };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};