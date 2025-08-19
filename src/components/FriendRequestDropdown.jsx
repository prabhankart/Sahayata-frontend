import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const FriendRequestDropdown = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchRequests = async () => {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/friends/requests', config);
      setRequests(data);
    };
    fetchRequests();
  }, [user]);

  const handleResponse = async (requestId, action) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/friends/requests/${requestId}`, { action }, config);
      setRequests(requests.filter(req => req._id !== requestId));
      toast.success(`Request ${action}ed!`);
    } catch (error) {
      toast.error('Failed to respond to request.');
    }
  };

  if (requests.length === 0) {
    return <div className="absolute right-0 mt-2 w-72 bg-surface rounded-lg shadow-xl p-4 text-sm text-muted">No pending requests.</div>;
  }

  return (
    <div className="absolute right-0 mt-2 w-72 bg-surface rounded-lg shadow-xl">
      <ul className="divide-y divide-gray-200">
        {requests.map(req => (
          <li key={req._id} className="p-4">
            <p className="text-sm font-medium text-secondary">{req.requester.name} sent you a request.</p>
            <div className="mt-2 flex space-x-2">
              <button onClick={() => handleResponse(req._id, 'accept')} className="flex-1 bg-green-100 text-green-700 text-xs font-semibold py-1 px-3 rounded-full hover:bg-green-200">Accept</button>
              <button onClick={() => handleResponse(req._id, 'decline')} className="flex-1 bg-red-100 text-red-700 text-xs font-semibold py-1 px-3 rounded-full hover:bg-red-200">Decline</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendRequestDropdown;