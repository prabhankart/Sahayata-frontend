import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(API_URL, { transports: ["websocket"] });

// localStorage key per post
const LS_KEY = (postId) => `chat:post:${postId}`;

// normalize helper
function normalizeMessage(m) {
  if (!m) return null;
  const sender =
    m.sender && typeof m.sender === "object"
      ? {
          _id: m.sender._id || m.senderId || "unknown",
          name: m.sender.name || m.senderName || "Someone",
        }
      : { _id: m.senderId || "unknown", name: m.senderName || "Someone" };

  return {
    _id: m._id || `${Date.now()}-${Math.random()}`,
    clientId: m.clientId,
    text: m.text || "",
    sender,
    createdAt: m.createdAt || new Date().toISOString(),
  };
}

// merge helper → avoid dupes
function mergeMessages(existing, incoming) {
  const map = new Map();
  const keyOf = (x) => x.clientId || x._id;
  [...existing, ...incoming].forEach((m) => {
    const k = keyOf(m);
    if (!map.has(k)) map.set(k, m);
  });
  return [...map.values()].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );
}

export default function ChatBox({ postId }) {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);
  const prevRoomRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // hydrate from localStorage
  useEffect(() => {
    if (!postId) return;
    try {
      const raw = localStorage.getItem(LS_KEY(postId));
      if (raw) {
        const cached = JSON.parse(raw);
        if (Array.isArray(cached)) {
          setMessages(cached.map(normalizeMessage).filter(Boolean));
          setTimeout(scrollToBottom, 16);
        }
      }
    } catch {
      /* ignore */
    }
  }, [postId, scrollToBottom]);

  // join room + fetch history
  useEffect(() => {
    if (!user || !postId) return;

    // leave previous room if changed
    if (prevRoomRef.current && prevRoomRef.current !== postId) {
      socket.emit("leaveRoom", { postId: prevRoomRef.current });
    }
    socket.emit("joinRoom", { postId });
    prevRoomRef.current = postId;

    let cancelled = false;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_URL}/api/messages/${postId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const list = (Array.isArray(data) ? data : data?.messages || [])
          .map(normalizeMessage)
          .filter(Boolean);
        if (cancelled) return;

        setMessages((prev) => {
          const merged = mergeMessages(prev, list);
          localStorage.setItem(LS_KEY(postId), JSON.stringify(merged));
          return merged;
        });
        setTimeout(scrollToBottom, 16);
      } catch {
        toast.error("Could not load chat history.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHistory();

    const onReceive = (raw) => {
      const msg = normalizeMessage(raw);
      if (!msg) return;
      setMessages((prev) => {
        const merged = mergeMessages(prev, [msg]);
        localStorage.setItem(LS_KEY(postId), JSON.stringify(merged));
        return merged;
      });
      requestAnimationFrame(scrollToBottom);
    };

    socket.on("receiveMessage", onReceive);

    return () => {
      cancelled = true;
      socket.off("receiveMessage", onReceive);
      socket.emit("leaveRoom", { postId });
    };
  }, [postId, user, scrollToBottom]);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  // send message with optimistic UI
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !postId) return;

    const clientId = `c_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const optimistic = normalizeMessage({
      _id: clientId,
      clientId,
      text: newMessage.trim(),
      sender: { _id: user._id, name: user.name },
      createdAt: new Date().toISOString(),
    });

    setMessages((prev) => {
      const next = [...prev, optimistic];
      localStorage.setItem(LS_KEY(postId), JSON.stringify(next));
      return next;
    });
    setNewMessage("");
    requestAnimationFrame(scrollToBottom);

    socket.emit("sendMessage", {
      postId,
      senderId: user._id,
      senderName: user.name,
      text: optimistic.text,
      clientId,
    });
  };

  // reset chat (local + optional server)
  const handleReset = async () => {
    setMessages([]);
    localStorage.removeItem(LS_KEY(postId));
    toast.success("Chat cleared locally");
    try {
      await axios.delete(`${API_URL}/api/messages/${postId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      toast.success("Chat cleared on server");
    } catch {
      /* ignore if no DELETE endpoint */
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Top bar */}
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-semibold text-gray-700">
          Messages {loading ? "" : `• ${messages.length}`}
        </h4>
        <button
          onClick={handleReset}
          className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
        >
          Reset Chat
        </button>
      </div>

      {/* List */}
      <div
        ref={listRef}
        className="mb-3 flex-grow overflow-y-auto rounded-xl bg-white/70 p-3 ring-1 ring-gray-100"
      >
        {!loading && messages.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-500">
            No messages yet.
          </div>
        )}

        {messages.map((msg) => {
          const me = (msg.sender?._id || msg.senderId) === user?._id;
          const time = new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          });
          return (
            <div
              key={msg._id || msg.clientId}
              className={`mb-2 flex flex-col ${
                me ? "items-end" : "items-start"
              }`}
            >
              <div className="mb-1 px-1 text-[10px] font-semibold text-gray-500">
                {msg.sender?.name || "User"} • {time}
              </div>
              <div
                className={`inline-block max-w-[80%] break-words rounded-2xl px-3 py-2 shadow-sm ring-1 ${
                  me
                    ? "bg-gradient-to-r from-primary to-fuchsia-600 text-white ring-primary/60"
                    : "bg-white text-gray-800 ring-gray-200"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message…"
          className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="rounded-xl bg-gradient-to-r from-primary to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
