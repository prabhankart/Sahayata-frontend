// src/components/FriendRequestDropdown.jsx
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function FriendRequestDropdown({ token, open = true, inline = false, onHandled }) {
  const [items, setItems] = useState([]);
  const auth = useMemo(
    () => (token ? { headers: { Authorization: `Bearer ${token}` } } : null),
    [token]
  );

  const emitCount = (n) => {
    window.dispatchEvent(new CustomEvent('friends:pending-count', { detail: Number(n) || 0 }));
  };

  useEffect(() => {
    if (!auth || !open) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/friends/requests?t=${Date.now()}`,
          {
            ...auth,
            headers: {
              ...(auth.headers || {}),
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
            },
            signal: ctrl.signal,
          }
        );
        const list = Array.isArray(data) ? data : [];
        setItems(list);
        emitCount(list.length);
      } catch {}
    })();
    return () => ctrl.abort();
  }, [auth, open]);

  const accept = async (reqId) => {
    if (!auth) return;
    const prev = items;
    const next = items.filter((r) => r._id !== reqId);
    setItems(next);
    emitCount(next.length);

    try {
      await axios.post(`${API_URL}/api/friends/requests/${reqId}/accept`, {}, auth);
      toast.success('Friend request accepted');
      onHandled?.('accepted');
      window.dispatchEvent(new Event('friends:changed'));
    } catch {
      setItems(prev);
      emitCount(prev.length);
      toast.error('Failed to accept.');
    }
  };

  const decline = async (reqId) => {
    if (!auth) return;
    const prev = items;
    const next = items.filter((r) => r._id !== reqId);
    setItems(next);
    emitCount(next.length);

    try {
      await axios.post(`${API_URL}/api/friends/requests/${reqId}/decline`, {}, auth);
      toast('Request declined', { icon: '👌' });
      onHandled?.('declined');
      window.dispatchEvent(new Event('friends:changed'));
    } catch {
      setItems(prev);
      emitCount(prev.length);
      toast.error('Failed to decline.');
    }
  };

  const containerClass = inline
    ? "w-full rounded-xl bg-white shadow border border-gray-100 overflow-hidden max-h-[60vh] overflow-auto"
    : "absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden max-h-96 overflow-auto";

  return (
    <div
      className={containerClass}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      role="menu"
      aria-label="Friend requests"
    >
      {items.length === 0 ? (
        <div className="p-4 text-sm text-gray-500">No pending requests</div>
      ) : (
        items.map((r) => {
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
        })
      )}
    </div>
  );
}
