// src/pages/GroupPage.jsx
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { AuthContext } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function GroupPage() {
  const { groupId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [joining, setJoining] = useState(false);

  const socketRef = useRef(null);
  const listRef = useRef(null);

  const auth = useMemo(
    () => (user ? { headers: { Authorization: `Bearer ${user.token}` } } : null),
    [user]
  );

  const isMember = useMemo(() => {
    if (!group || !user) return false;
    return (group.members || []).some((m) => (m._id || m) === user._id);
  }, [group, user]);

  const scrollToBottom = () => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  };

  useEffect(() => {
    if (!auth) {
      toast.error("Please log in.");
      return navigate("/login");
    }

    const load = async () => {
      try {
        const [{ data: g }, { data: msgs }] = await Promise.all([
          axios.get(`${API_URL}/api/groups/${groupId}`, auth),
          axios.get(`${API_URL}/api/groups/${groupId}/messages`, auth),
        ]);
        setGroup(g);
        setMessages(msgs || []);
        setTimeout(scrollToBottom, 50);
      } catch {
        toast.error("Could not load group.");
      }
    };

    load();

    // Socket
    const s = io(API_URL, {
      transports: ["websocket"],
    });
    socketRef.current = s;
    s.emit("group:join", groupId);
    s.on("group:message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(scrollToBottom, 16);
    });

    return () => {
      s.emit("group:leave", groupId);
      s.disconnect();
    };
  }, [auth, groupId, navigate]);

  const send = async () => {
    if (!text.trim()) return;
    if (!isMember) return toast.error("Join the group to chat.");

    try {
      const { data } = await axios.post(
        `${API_URL}/api/groups/${groupId}/messages`,
        { text },
        auth
      );
      // server broadcasts to everyone; we still append for snappy feel
      setMessages((prev) => [...prev, data]);
      setText("");
      setTimeout(scrollToBottom, 16);
    } catch {
      toast.error("Failed to send message.");
    }
  };

  const join = async () => {
    try {
      setJoining(true);
      await axios.post(`${API_URL}/api/groups/${groupId}/join`, {}, auth);
      const { data } = await axios.get(`${API_URL}/api/groups/${groupId}`, auth);
      setGroup(data);
      toast.success("Joined!");
    } catch {
      toast.error("Could not join group.");
    } finally {
      setJoining(false);
    }
  };

  if (!group) return <div className="p-6">Loading…</div>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
        <p className="mt-1 text-gray-600">{group.description}</p>
        <p className="mt-1 text-sm text-gray-500">
          {group.category} • {(group.members || []).length} members
        </p>
        {!isMember && (
          <button
            onClick={join}
            disabled={joining}
            className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            Join group to chat
          </button>
        )}
      </div>

      {/* Chat */}
      <div className="flex h-[480px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-4">
          {messages.map((m) => (
            <div key={m._id || m.createdAt} className="flex flex-col">
              <span className="text-xs font-semibold text-gray-600">
                {m.user?.name || "User"} • {new Date(m.createdAt).toLocaleString()}
              </span>
              <div className="mt-1 w-fit max-w-[75%] rounded-2xl bg-gray-100 px-3 py-2 text-sm text-gray-800">
                {m.text}
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-500">No messages yet.</div>
          )}
        </div>

        <div className="border-t p-3">
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={!isMember}
              placeholder={isMember ? "Type a message…" : "Join to send messages"}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50"
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button
              onClick={send}
              disabled={!isMember || !text.trim()}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
