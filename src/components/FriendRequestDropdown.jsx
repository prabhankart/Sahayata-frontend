import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function FriendRequestDropdown({ token, onHandled }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/friends/requests`, {
          headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
        });
        setItems(Array.isArray(data) ? data : []);
      } catch {}
    })();
  }, [token]);

  const accept = async (reqId) => {
    const prev = items;
    setItems((x) => x.filter((r) => r._id !== reqId));           // optimistic
    try {
      await axios.post(`${API_URL}/api/friends/requests/${reqId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Friend request accepted');
      onHandled?.('accepted');
      window.dispatchEvent(new Event('friends:changed'));        // 🔔 update badge now
    } catch {
      setItems(prev);                                            // rollback
      toast.error('Failed to accept.');
    }
  };

  const decline = async (reqId) => {
    const prev = items;
    setItems((x) => x.filter((r) => r._id !== reqId));
    try {
      await axios.post(`${API_URL}/api/friends/requests/${reqId}/decline`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast('Request declined', { icon: '👌' });
      onHandled?.('declined');
      window.dispatchEvent(new Event('friends:changed'));
    } catch {
      setItems(prev);
      toast.error('Failed to decline.');
    }
  };

  if (!items.length) return (
    <div className="p-4 text-sm text-gray-500">No pending requests</div>
  );

  return (
    <div
      className="absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden max-h-96 overflow-auto"
      onPointerDown={(e) => e.stopPropagation()}    // ✅ prevent dropdown from closing before click
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((r) => {
        const name = r.requester?.name || 'Unknown';
        return (
          <div key={r._id} className="flex items-center justify-between px-4 py-3 border-b last:border-0">
            <div className="min-w-0">
              <div className="font-medium text-secondary truncate">{name}</div>
              <div className="text-xs text-muted">wants to connect</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => accept(r._id)}
                className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white"
              >
                Accept
              </button>
              <button
                onClick={() => decline(r._id)}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-secondary"
              >
                Decline
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
