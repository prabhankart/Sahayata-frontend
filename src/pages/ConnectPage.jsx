import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import UserCard from "../components/UserCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// --- UPDATED: robust helper for many API shapes ---
function getOtherUserId(row, meId) {
  if (!row) return null;

  // 1) If /api/friends returns plain USER objects (most likely in your app)
  //    treat them as accepted friends straight away.
  if (
    row._id &&
    !row.requester &&
    !row.recipient &&
    !row.participants &&
    !row.friend &&
    row.name // heuristic: looks like a user
  ) {
    return row._id === meId ? null : row._id;
  }

  // 2) Friendship doc with requester/recipient
  const r = row.requester?._id || row.requester;
  const t = row.recipient?._id || row.recipient;
  if (r && t) return r === meId ? t : r;

  // 3) participants array shape
  if (Array.isArray(row.participants)) {
    const other = row.participants.find((p) => (p?._id || p) !== meId);
    return other?._id || other || null;
  }

  // 4) friend field (some APIs)
  if (row.friend?._id) return row.friend._id;

  return null;
}

export default function ConnectPage() {
  const { user, friendships, fetchFriendships } = useContext(AuthContext);
  const meId = user?._id;
  const auth = useMemo(
    () => (user ? { headers: { Authorization: `Bearer ${user.token}` } } : {}),
    [user]
  );

  const [people, setPeople] = useState([]);
  const [statusById, setStatusById] = useState({});
  const [loading, setLoading] = useState(true);

  const SENT_KEY = `connect:sent:${meId}`;

  // Load users (everyone except me)
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_URL}/api/users`, auth);
        setPeople((data || []).filter((u) => u._id !== meId));
      } catch {
        toast.error("Could not load users.");
      } finally {
        setLoading(false);
      }
    })();
  }, [meId, user, auth]);

  // Build status map from: accepted, incoming, outgoing, local “sent”
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const accepted = new Set();
        const incoming = new Set();
        const outgoing = new Set();

        // A) /api/friends  (⚠️ If this returns *users*, mark them accepted)
        for (const f of friendships || []) {
          const other = getOtherUserId(f, meId);
          if (other) {
            const st = (f.status || f.state || "accepted").toLowerCase();
            // If there's no status (plain user), it's accepted
            if (!f.status && !f.state) {
              accepted.add(other);
            } else if (st === "accepted") {
              accepted.add(other);
            } else if (st === "pending") {
              const requester = f.requester?._id || f.requester;
              if (requester === meId) outgoing.add(other);
              else incoming.add(other);
            }
          }
        }

        // B) incoming pending
        try {
          const { data } = await axios.get(
            `${API_URL}/api/friends/requests`,
            auth
          );
          for (const r of data || []) {
            const requesterId = r.requester?._id || r.requester;
            if (requesterId) incoming.add(requesterId);
          }
        } catch {}

        // C) outgoing pending (if you have it)
        try {
          const { data } = await axios.get(`${API_URL}/api/friends/sent`, auth);
          for (const r of data || []) {
            const recipientId = r.recipient?._id || r.recipient;
            if (recipientId) outgoing.add(recipientId);
          }
        } catch {}

        // D) local fallback so “Requested” never disappears after refresh
        try {
          const persisted = JSON.parse(localStorage.getItem(SENT_KEY) || "[]");
          for (const id of persisted) outgoing.add(id);
        } catch {}

        const next = {};
        for (const u of people) {
          next[u._id] = accepted.has(u._id)
            ? "friends"
            : incoming.has(u._id)
            ? "request_received"
            : outgoing.has(u._id)
            ? "request_sent"
            : "not_friends";
        }
        setStatusById(next);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user, meId, friendships, people, auth]);

  // called by UserCard right after "Add Friend" succeeds
  const markRequested = (otherId) => {
    setStatusById((prev) => ({ ...prev, [otherId]: "request_sent" }));
    try {
      const set = new Set(JSON.parse(localStorage.getItem(SENT_KEY) || "[]"));
      set.add(otherId);
      localStorage.setItem(SENT_KEY, JSON.stringify([...set]));
    } catch {}
  };

  // keep friendships fresh (so 'friends' shows up soon after accept)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => fetchFriendships(user.token), 15000);
    return () => clearInterval(interval);
  }, [user, fetchFriendships]);

  return (
    <div className="bg-cream py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-secondary">
            Connect with the Community
          </h1>
          <p className="text-muted mt-3">Find and connect with other members.</p>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {people.map((u) => (
              <UserCard
                key={u._id}
                otherUser={u}
                friendshipStatus={statusById[u._id] || "not_friends"}
                onRequestSent={() => markRequested(u._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
