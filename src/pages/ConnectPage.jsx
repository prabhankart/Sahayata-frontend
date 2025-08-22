import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import UserCard from '../components/UserCard';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ConnectPage = () => {
   const { user, friendships } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [usersRes, friendshipsRes] = await Promise.all([
        axios.get(`${API_URL}/api/users`, config),
        axios.get(`${API_URL}/api/friends`, config)
      ]);
      setUsers(usersRes.data);
      setFriendships(friendshipsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

 // --- THIS IS THE CORRECTED AND MORE ROBUST LOGIC ---
  const getFriendshipStatus = (otherUserId) => {
    if (!user || !friendships || friendships.length === 0) return 'not_friends';
    
    // --- DEBUGGING LOG ---
    console.log("--- Checking Status For User:", otherUserId, "---");
    console.log("Current logged in user ID:", user._id);
    console.log("Friendships data being searched:", friendships);

    const friendship = friendships.find(f => {
      const requesterId = f.requester?._id || f.requester;
      const recipientId = f.recipient?._id || f.recipient;
      return (requesterId?.toString() === otherUserId && recipientId?.toString() === user._id) || 
             (recipientId?.toString() === otherUserId && requesterId?.toString() === user._id);
    });

    // --- DEBUGGING LOG ---
    console.log("Result of find:", friendship);

    if (!friendship) return 'not_friends';
    if (friendship.status === 'accepted') return 'friends';
    if (friendship.status === 'pending') {
        const requesterId = friendship.requester?._id || friendship.requester;
        return requesterId?.toString() === user._id ? 'request_sent' : 'request_received';
    }
    return 'not_friends';
  };

  return (
    <div className="bg-cream py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-secondary">Connect with the Community</h1>
          <p className="mt-4 text-lg text-muted">Find and connect with other members.</p>
        </div>
        
        {loading ? <Spinner /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {users.map((u) => (
              <UserCard 
                key={u._id} 
                otherUser={u} 
                friendshipStatus={getFriendshipStatus(u._id)}
                onFriendRequestSent={fetchData} // Pass the refetch function as a prop
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectPage;