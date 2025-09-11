import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(API_URL, { transports: ["websocket"] });

const LS_KEY = (postId) => `chat:post:${postId}`;

function normalizeMessage(m) {
  if (!m) return null;
  const sender =
    m.sender && typeof m.sender === "object"
      ? { _id: m.sender._id || m.senderId || "unknown", name: m.sender.name || m.senderName || "Someone" }
      : { _id: m.senderId || "unknown", name: m.senderName || "Someone" };

  return {
    _id: m._id || `${Date.now()}-${Math.random()}`,
    clientId: m.clientId,
    text: m.text || "",
    attachments: m.attachments || [],
    sender,
    createdAt: m.createdAt || new Date().toISOString(),
    deletedForEveryone: !!m.deletedForEveryone,
    edited: !!m.edited,
  };
}

function mergeMessages(existing, incoming) {
  const map = new Map();
  const keyOf = (x) => x.clientId || x._id;
  [...existing, ...incoming].forEach((m) => {
    const k = keyOf(m);
    if (!map.has(k)) map.set(k, m);
  });
  return [...map.values()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

export default function ChatBox({ postId }) {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [contextMenu, setContextMenu] = useState(null); // {x, y, msg}
  const [resetOpen, setResetOpen] = useState(false);
  const [editing, setEditing] = useState(null); // message being edited

  const listRef = useRef(null);
  const prevRoomRef = useRef(null);
  const fileRef = useRef(null);
  const longPressRef = useRef(null);
  const resetBtnRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // Load cached
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
    } catch {}
  }, [postId, scrollToBottom]);

  // Join room + history + live events
  useEffect(() => {
    if (!user || !postId) return;

    if (prevRoomRef.current && prevRoomRef.current !== postId) {
      socket.emit("leaveRoom", { postId: prevRoomRef.current });
    }
    socket.emit("joinRoom", { postId });
    prevRoomRef.current = postId;

    let cancelled = false;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        // NOTE: backend route now /api/messages/post/:postId
        const { data } = await axios.get(`${API_URL}/api/messages/post/${postId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const list = (Array.isArray(data) ? data : []).map(normalizeMessage).filter(Boolean);
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

    const onEdited = ({ messageId, text }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, text, edited: true } : m))
      );
    };

    const onDeleted = ({ messageId, mode }) => {
      if (mode === "all") {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId ? { ...m, text: "🚫 Message deleted", attachments: [], deletedForEveryone: true } : m
          )
        );
      }
      if (mode === "all:post") {
        setMessages((prev) =>
          prev.map((m) => ({ ...m, text: "🚫 Message deleted", attachments: [], deletedForEveryone: true }))
        );
      }
    };

    const onRoomCleared = () => {
      setMessages([]);
      localStorage.removeItem(LS_KEY(postId));
    };

    socket.on("receiveMessage", onReceive);
    socket.on("messageEdited", onEdited);
    socket.on("messageDeleted", onDeleted);
    socket.on("roomCleared", onRoomCleared);

    return () => {
      cancelled = true;
      socket.off("receiveMessage", onReceive);
      socket.off("messageEdited", onEdited);
      socket.off("messageDeleted", onDeleted);
      socket.off("roomCleared", onRoomCleared);
      socket.emit("leaveRoom", { postId });
    };
  }, [postId, user, scrollToBottom]);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  // Close popups when clicking outside
  useEffect(() => {
    const closeAll = (e) => {
      if (!resetBtnRef.current || !resetBtnRef.current.contains(e.target)) {
        setResetOpen(false);
      }
      setContextMenu(null);
    };
    window.addEventListener("click", closeAll);
    return () => window.removeEventListener("click", closeAll);
  }, []);

  // Attachments
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const type = file.type.startsWith("image")
        ? "image"
        : file.type.startsWith("video")
        ? "video"
        : file.type.startsWith("audio")
        ? "audio"
        : "file";
      setAttachments((a) => [...a, { url: data.url || data.imageUrl, type, name: file.name }]);
      toast.success("File ready to send");
    } catch {
      toast.error("Upload failed");
    } finally {
      fileRef.current.value = "";
    }
  };

  // Send or Edit
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachments.length === 0) || !user || !postId) return;

    // Editing (text only)
    if (editing) {
      try {
        await axios.patch(
          `${API_URL}/api/messages/${editing._id}`,
          { text: newMessage.trim() },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setMessages((prev) =>
          prev.map((m) => (m._id === editing._id ? { ...m, text: newMessage.trim(), edited: true } : m))
        );
        setEditing(null);
        setNewMessage("");
        return;
      } catch {
        toast.error("Failed to edit message");
        return;
      }
    }

    // New message
    const clientId = `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const optimistic = normalizeMessage({
      _id: clientId,
      clientId,
      text: newMessage.trim(),
      attachments,
      sender: { _id: user._id, name: user.name },
      createdAt: new Date().toISOString(),
    });

    setMessages((prev) => {
      const next = [...prev, optimistic];
      localStorage.setItem(LS_KEY(postId), JSON.stringify(next));
      return next;
    });
    setNewMessage("");
    setAttachments([]);
    requestAnimationFrame(scrollToBottom);

    socket.emit("sendMessage", {
      postId,
      senderId: user._id,
      senderName: user.name,
      text: optimistic.text,
      attachments,
      clientId,
    });
  };

  // Reset menu actions
  const clearForMe = async () => {
    try {
      await axios.delete(`${API_URL}/api/messages/post/${postId}/me`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
    } catch {}
    setMessages([]);
    localStorage.removeItem(LS_KEY(postId));
    setResetOpen(false);
    toast.success("Cleared for you");
  };

  const clearForEveryone = async () => {
    try {
      await axios.delete(`${API_URL}/api/messages/post/${postId}/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      // Show placeholders until new messages arrive
      setMessages((prev) =>
        prev.map((m) => ({ ...m, text: "🚫 Message deleted", attachments: [], deletedForEveryone: true }))
      );
    } catch {}
    setResetOpen(false);
    toast.success("Cleared for everyone");
  };

  // Per-message deletion
  const deleteMsg = async (msg, mode) => {
    try {
      await axios.delete(`${API_URL}/api/messages/${msg._id}/${mode}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (mode === "me") {
        setMessages((prev) => prev.filter((m) => m._id !== msg._id));
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === msg._id ? { ...m, text: "🚫 Message deleted", attachments: [], deletedForEveryone: true } : m
          )
        );
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  // Context menu helpers
  const openMenu = (e, msg) => {
    e.preventDefault();
    const x = Math.min(e.pageX, window.innerWidth - 220);
    const y = Math.min(e.pageY, window.innerHeight - 180);
    setContextMenu({ x, y, msg });
  };
  const openMenuLongPress = (msg) => {
    longPressRef.current = setTimeout(() => {
      setContextMenu({
        x: Math.round(window.innerWidth / 2) - 100,
        y: Math.round(window.innerHeight / 2) - 80,
        msg,
      });
    }, 600);
  };
  const cancelLongPress = () => clearTimeout(longPressRef.current);

  const containerHeight = "h-[60vh] md:h-[70vh]"; // prevents overflow on small screens

  return (
    <div className={`flex w-full flex-col ${containerHeight} max-h-[78vh]`}>
      {/* Top bar */}
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-semibold text-gray-700">
          Messages {loading ? "" : `• ${messages.length}`}
        </h4>

        <div className="relative" ref={resetBtnRef}>
          <button
            onClick={() => setResetOpen((v) => !v)}
            className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
          >
            Reset
          </button>

          {resetOpen && (
            <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-md border bg-white shadow-lg z-50">
              <button
                onClick={clearForMe}
                className="w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100"
              >
                Clear for me
              </button>
              <button
                onClick={clearForEveryone}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Clear for everyone
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        className="mb-3 flex-1 overflow-y-auto rounded-xl bg-white/70 p-3 ring-1 ring-gray-100"
      >
        {!loading && messages.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-500">No messages yet.</div>
        )}

        {messages.map((msg) => {
          const me = (msg.sender?._id || msg.senderId) === user?._id;
          const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
          const canEdit = me && !msg.deletedForEveryone && (msg.attachments?.length || 0) === 0;

          return (
            <div
              key={msg._id || msg.clientId}
              className={`mb-2 flex flex-col ${me ? "items-end" : "items-start"}`}
              onContextMenu={(e) => openMenu(e, msg)}
              onTouchStart={() => openMenuLongPress(msg)}
              onTouchEnd={cancelLongPress}
            >
              <div className="mb-1 px-1 text-[10px] font-semibold text-gray-500">
                {msg.sender?.name || "User"} • {time} {msg.edited ? "(edited)" : ""}
              </div>

              <div
                className={`inline-block max-w-[80%] break-words rounded-2xl px-3 py-2 shadow-sm ring-1 ${
                  me
                    ? "bg-gradient-to-r from-primary to-fuchsia-600 text-white ring-primary/60"
                    : "bg-white text-gray-800 ring-gray-200"
                }`}
              >
                {msg.text}
                {msg.attachments?.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.attachments.map((a, i) => (
                      <div key={i} onClick={() => setPreview(a)} className="cursor-pointer">
                        {a.type === "image" && (
                          <img src={a.url} alt={a.name} className="max-h-48 rounded border" />
                        )}
                        {a.type === "video" && (
                          <video src={a.url} controls className="max-h-64 rounded border" />
                        )}
                        {a.type === "audio" && <audio src={a.url} controls className="w-full" />}
                        {a.type === "file" && (
                          <a href={a.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                            {a.name}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Context Menu */}
              {contextMenu && contextMenu.msg._id === msg._id && (
                <div
                  className="absolute z-[9999] w-48 rounded-md border bg-white shadow-xl"
                  style={{ top: contextMenu.y, left: contextMenu.x }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-2 font-semibold bg-blue-600 text-white rounded-t-md">
                    Message options
                  </div>

                  <button
                    disabled={!canEdit}
                    className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                      canEdit ? "text-gray-800" : "text-gray-400 cursor-not-allowed"
                    }`}
                    onClick={() => {
                      if (!canEdit) return;
                      setEditing(contextMenu.msg);
                      setNewMessage(contextMenu.msg.text);
                      setContextMenu(null);
                    }}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className="block w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
                    onClick={() => {
                      deleteMsg(contextMenu.msg, "me");
                      setContextMenu(null);
                    }}
                  >
                    🗑️ Delete for me
                  </button>

                  {((contextMenu.msg.sender?._id || contextMenu.msg.senderId) === user?._id) && (
                    <button
                      className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-md"
                      onClick={() => {
                        deleteMsg(contextMenu.msg, "all");
                        setContextMenu(null);
                      }}
                    >
                      🗑️ Delete for everyone
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <form onSubmit={handleSendMessage} className="mt-auto flex items-center gap-2">
        <input ref={fileRef} type="file" className="hidden" onChange={handleFileUpload} />
        <button
          type="button"
          onClick={() => fileRef.current.click()}
          className="rounded bg-gray-100 px-2 py-1 text-sm"
          title="Attach"
        >
          📎
        </button>

        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={editing ? "Edit your message…" : "Type your message…"}
          className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />

        {editing ? (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setNewMessage("");
            }}
            className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-300"
          >
            Cancel
          </button>
        ) : null}

        <button
          type="submit"
          disabled={!newMessage.trim() && attachments.length === 0}
          className="rounded-xl bg-gradient-to-r from-primary to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
        >
          {editing ? "Save" : "Send"}
        </button>
      </form>

      {attachments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
          {attachments.map((a, i) => (
            <div key={i} className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 cursor-pointer">
              {a.type === "image" ? "📷" : a.type === "video" ? "🎥" : a.type === "audio" ? "🎵" : "📎"} {a.name}
              <button
                onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                className="ml-1 text-red-500"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Preview */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreview(null)}
        >
          {preview.type === "image" && <img src={preview.url} className="max-h-[90vh] max-w-[90vw] rounded" />}
          {preview.type === "video" && (
            <video src={preview.url} controls autoPlay className="max-h-[90vh] max-w-[90vw] rounded" />
          )}
          {preview.type === "audio" && (
            <audio src={preview.url} controls autoPlay className="w-full max-w-[80vw]" />
          )}
        </div>
      )}
    </div>
  );
}
