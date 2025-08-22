import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [friendships, setFriendships] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFriendships = useCallback(async (token) => {
    if (!token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`${API_URL}/api/friends`, config);
      setFriendships(data);
    } catch (error) {
      console.error("Failed to fetch friendships", error);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchFriendships(parsedUser.token);
    }
    setLoading(false);
  }, [fetchFriendships]);

  const signup = useCallback(async (name, email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/users/register`, { name, email, password });
      toast.success(data.message || 'Signup successful. Please check your email to verify.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/users/login`, { email, password });
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      fetchFriendships(data.token);
    } catch (error) { // <<< THIS IS THE CORRECTED PART
      toast.error(error.response?.data?.message || 'Login failed');
    }
  }, [fetchFriendships]);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
    setFriendships([]);
  }, []);

  const loginWithProvider = useCallback((userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    fetchFriendships(userData.token);
  }, [fetchFriendships]);

  const updateUser = useCallback((newUserData) => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const updatedStoredUser = { ...storedUser, ...newUserData };
    localStorage.setItem('user', JSON.stringify(updatedStoredUser));
    setUser(updatedStoredUser);
    if(newUserData.token) {
        fetchFriendships(newUserData.token);
    }
  }, [fetchFriendships]);

  const contextValue = { user, friendships, fetchFriendships, signup, login, logout, loginWithProvider, updateUser };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};