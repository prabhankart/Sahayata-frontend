// --- inside GroupPage.jsx (replace your chat area + handlers) ---
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

    (async () => {
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
    })();

    const s = io(API_URL, { transports: ["websocket"] });
    socketRef.current = s;
    s.emit("group:join", groupId);

    s.on("group:message", (msg) => {
      setMessages((prev) => {
        // de-dupe by clientId if present
        if (msg.clientId && prev.some((m) => m.clientId === msg.clientId)) return prev;
        return [...prev, msg];
      });
      setTimeout(scrollToBottom, 16);
    });

    return () => {
      s.emit("group:leave", groupId);
      s.disconnect();
    };
  }, [auth, groupId, navigate]);

  // socket send with ACK + optimistic UI
  const send = async () => {
    if (!text.trim() || !isMember) return;

    const clientId = `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const optimistic = {
      _id: clientId,
      clientId,
      group: groupId,
      sender: { _id: user._id, name: user.name },
      text: text.trim(),
      createdAt: new Date().toISOString(),
      optimistic: true,
    };
    setMessages((p) => [...p, optimistic]);
    setText("");
    setTimeout(scrollToBottom, 16);

    socketRef.current.emit(
      "group:send",
      { groupId, senderId: user._id, text: optimistic.text, clientId },
      (ack) => {
        if (!ack?.ok) {
          toast.error("Failed to send.");
          setMessages((p) => p.filter((m) => m.clientId !== clientId));
          return;
        }
        // replace optimistic with server message (same clientId)
        setMessages((p) =>
          p.map((m) => (m.clientId === clientId ? ack.message : m))
        );
      }
    );
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
        <p className="mt-1 text-gray-700">{group.description}</p>
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
      <div className="flex h-[70vh] max-h-[720px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-500">
              No messages yet.
            </div>
          )}
          {messages.map((m) => {
            const mine = (m.sender?._id || m.sender) === user._id;
            const name = m.sender?.name || "User";
            const time = new Date(m.createdAt || Date.now()).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            });
            return (
              <div key={m._id || m.clientId} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${mine ? "items-end" : "items-start"} flex gap-2`}>
                  {/* Avatar (others) */}
                  {!mine && (
                    <div className="h-9 w-9 shrink-0 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center font-bold">
                      {name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  {/* Bubble */}
                  <div className={`rounded-2xl px-4 py-2 shadow-sm border
                    ${mine ? "bg-primary text-white border-primary/70" : "bg-white text-gray-900 border-gray-200"}`}>
                    <div className={`text-[11px] mb-1 ${mine ? "text-white/85" : "text-gray-600"} font-semibold`}>
                      {name} • {time}{m.optimistic ? " (sending…)" : ""}
                    </div>
                    <div className={`${mine ? "text-white" : "text-gray-900"}`}>{m.text}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t p-3">
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={!isMember}
              placeholder={isMember ? "Type a message…" : "Join to send messages"}
              className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50"
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button
              onClick={send}
              disabled={!isMember || !text.trim()}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
