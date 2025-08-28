import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FriendRequestDropdown = () => {
  const { user, fetchFriendships } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/friends/requests`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setRequests(data || []);
      } catch {/* silent */}
    })();
  }, [user]);

  const respond = async (id, action) => {
    try {
      await axios.put(`${API_URL}/api/friends/requests/${id}`, { action }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setRequests(prev => prev.filter(r => r._id !== id));
      toast.success(`Request ${action}ed!`);
      fetchFriendships?.(user.token);
    } catch { toast.error('Failed to respond to request.'); }
  };

  if (requests.length === 0)
    return <div className="absolute right-0 mt-2 w-72 card p-4 text-sm text-muted">No pending requests.</div>;

  return (
    <div className="absolute right-0 mt-2 w-72 card">
      <ul className="divide-y divide-gray-200">
        {requests.map(req => (
          <li key={req._id} className="p-4 animate-fade">
            <p className="text-sm font-medium text-secondary">{req.requester.name} sent you a request.</p>
            <div className="mt-2 flex gap-2">
              <button onClick={() => respond(req._id,'accept')} className="btn bg-green-100 text-green-700 hover:bg-green-200 text-xs">Accept</button>
              <button onClick={() => respond(req._id,'decline')} className="btn bg-red-100 text-red-700 hover:bg-red-200 text-xs">Decline</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default FriendRequestDropdown;
