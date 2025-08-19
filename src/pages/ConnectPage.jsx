import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import UserCard from '../components/UserCard';

const ConnectPage = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [friendships, setFriendships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        // Fetch both users and friendships at the same time
        const [usersRes, friendshipsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users', config),
          axios.get('http://localhost:5000/api/friends', config)
        ]);
        setUsers(usersRes.data);
        setFriendships(friendshipsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const getFriendshipStatus = (otherUserId) => {
    const friendship = friendships.find(f => f.requester === otherUserId || f.recipient === otherUserId);
    if (!friendship) return 'not_friends';
    if (friendship.status === 'accepted') return 'friends';
    if (friendship.status === 'pending') {
        return friendship.requester === user._id ? 'request_sent' : 'request_received';
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
              <UserCard key={u._id} otherUser={u} friendshipStatus={getFriendshipStatus(u._id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectPage;