import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import io from "socket.io-client";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  PaperClipIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/solid";
import Picker from "emoji-picker-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(API_URL, { transports: ["websocket"] });

// Context menu size for clamping inside viewport
const MENU_W = 220;
const MENU_H = 260;

// Reactions you want to support
const REACTION_SET = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const PrivateChatBox = ({ conversation, onBack }) => {
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Context menu: { x, y, msg }
  const [contextMenu, setContextMenu] = useState(null);

  // Edit state
  const [editingId, setEditingId] = useState(null);

  const [attachments, setAttachments] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [preview, setPreview] = useState(null);

  const endRef = useRef(null);
  const fileRef = useRef(null);
  const longPressTimer = useRef(null);
  const menuRef = useRef(null);

  const other = conversation.participants.find((p) => p._id !== user._id);
  const toBottom = () => endRef.current?.scrollIntoView({ behavior: "smooth" });

  // ----- Load messages + realtime receive
  useEffect(() => {
    socket.emit("joinConversation", { conversationId: conversation._id });

    const onReceive = (m) => {
      if (m.conversation === conversation._id) {
        setMessages((prev) => [...prev, m]);
      }
    };
    socket.on("receivePrivateMessage", onReceive);

    (async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/conversations/${conversation._id}/messages`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setMessages(data.data || []);
      } catch {
        toast.error("Could not load chat history.");
      }
    })();

    return () => socket.off("receivePrivateMessage", onReceive);
  }, [conversation._id, user.token]);

  useEffect(toBottom, [messages]);

  // ----- Global closes: scroll / escape / outside
  useEffect(() => {
    const onScroll = () => setContextMenu(null);
    const onKey = (e) => {
      if (e.key === "Escape") {
        setContextMenu(null);
        if (editingId) cancelEdit();
      }
    };
    const onDown = (e) => {
      if (contextMenu && menuRef.current && !menuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("touchstart", onDown, true);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("touchstart", onDown, true);
    };
  }, [contextMenu, editingId]);

  // ----- Realtime delete/edit/react from others
  useEffect(() => {
    const onDelete = ({ messageId, mode }) => {
      if (mode === "all") {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, text: "🚫 Message deleted", attachments: [], deletedForEveryone: true }
              : m
          )
        );
      }
    };

    const onEdited = ({ messageId, text }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, text, edited: true } : m
        )
      );
    };

    const onReacted = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, reactions: reactions || [] } : m
        )
      );
    };

    socket.on("messageDeleted", onDelete);
    socket.on("messageEdited", onEdited);
    socket.on("messageReacted", onReacted);

    return () => {
      socket.off("messageDeleted", onDelete);
      socket.off("messageEdited", onEdited);
      socket.off("messageReacted", onReacted);
    };
  }, []);

  // ----- Uploads
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
      setAttachments((a) => [
        ...a,
        { url: data.url || data.imageUrl, type, name: file.name },
      ]);
      toast.success("File ready to send");
    } catch {
      toast.error("Upload failed");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // ----- Delete
  const deleteMessage = async (msgId, mode) => {
    try {
      await axios.delete(`${API_URL}/api/messages/${msgId}/${mode}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (mode === "me") {
        setMessages((prev) => prev.filter((m) => m._id !== msgId));
      } else if (mode === "all") {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === msgId
              ? { ...m, text: "🚫 Message deleted", attachments: [], deletedForEveryone: true }
              : m
          )
        );
      }
      socket.emit("deleteMessage", { messageId: msgId, mode });
    } catch {
      toast.error("Failed to delete message");
    }
  };

  // ----- Edit
  const startEdit = (msg) => {
    if (msg.deletedForEveryone) return;
    if ((msg.sender?._id || msg.sender) !== user._id) return;
    if (msg.attachments?.length) {
      toast("Edit text only (attachments not editable).", { icon: "✏️" });
    }
    setEditingId(msg._id);
    setNewMessage(msg.text || "");
    setContextMenu(null);
    toBottom();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewMessage("");
  };

  // ----- Reactions (toggle)
  const toggleReaction = async (msg, emoji) => {
    try {
      const { data } = await axios.patch(
        `${API_URL}/api/messages/${msg._id}/reactions`,
        { emoji },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      // server returns { messageId, reactions: [...] }
      setMessages((prev) =>
        prev.map((m) =>
          m._id === msg._id ? { ...m, reactions: data.reactions || [] } : m
        )
      );
      // broadcast to others is done server-side; we still emit just in case
      socket.emit("reactMessage", {
        messageId: msg._id,
        emoji,
        conversationId: conversation._id,
      });
    } catch {
      toast.error("Reaction failed");
    } finally {
      setContextMenu(null);
    }
  };

  // Group reactions -> [{emoji, count, mine}]
  const summarizeReactions = (reactions = []) => {
    const map = new Map();
    for (const r of reactions) {
      const key = r.emoji;
      if (!map.has(key)) map.set(key, { emoji: key, count: 0, mine: false });
      const entry = map.get(key);
      entry.count += 1;
      if ((r.user?._id || r.user) === user._id) entry.mine = true;
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  };

  // ----- Send (create or edit)
  const send = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();

    // EDIT MODE
    if (editingId) {
      if (!text) {
        toast.error("Message cannot be empty.");
        return;
      }
      try {
        await axios.patch(
          `${API_URL}/api/messages/${editingId}`,
          { text },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        setMessages((prev) =>
          prev.map((m) =>
            m._id === editingId ? { ...m, text, edited: true } : m
          )
        );

        socket.emit("editMessage", { messageId: editingId, text });
        cancelEdit();
      } catch {
        toast.error("Failed to edit message");
      }
      return;
    }

    // CREATE MODE
    if (!text && attachments.length === 0) return;

    socket.emit("sendPrivateMessage", {
      conversationId: conversation._id,
      senderId: user._id,
      text,
      attachments,
    });

    setNewMessage("");
    setAttachments([]);
    setShowEmoji(false);
  };

  // ---- Menu placement
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
  const menuStyle =
    contextMenu && {
      top: clamp(contextMenu.y, 12, window.innerHeight - MENU_H - 12),
      left: clamp(contextMenu.x, 12, window.innerWidth - MENU_W - 12),
    };

  return (
    <div className="flex flex-col h-[100dvh] relative">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-surface flex items-center">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:underline mr-2 md:hidden"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back
        </button>
        <h3 className="font-bold text-secondary text-lg truncate">
          Chat with {other?.name}
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 pb-28">
        {messages.map((msg) => {
          const mine = (msg.sender?._id || msg.sender) === user._id;
          const isDeleted = msg.deletedForEveryone;
          const summary = summarizeReactions(msg.reactions);

          return (
            <div
              key={msg._id}
              className={`mb-3 flex ${mine ? "justify-end" : "justify-start"}`}
              onContextMenu={(e) => {
                if (mine && !isDeleted) {
                  e.preventDefault();
                  setContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    msg,
                  });
                }
              }}
              onTouchStart={() => {
                if (mine && !isDeleted) {
                  longPressTimer.current = setTimeout(() => {
                    setContextMenu({
                      x: window.innerWidth / 2,
                      y: window.innerHeight / 2,
                      msg,
                    });
                  }, 550);
                }
              }}
              onTouchEnd={() => clearTimeout(longPressTimer.current)}
            >
              <div
                className={`p-2 rounded-xl max-w-[80%] ${
                  mine ? "bg-primary text-white" : "bg-white border"
                }`}
              >
                {/* Text */}
                {msg.text && (
                  <div className="whitespace-pre-wrap break-words">
                    {msg.text}
                    {msg.edited && !isDeleted && (
                      <span className={`ml-2 text-[10px] ${mine ? "text-white/80" : "text-gray-500"}`}>
                        (edited)
                      </span>
                    )}
                  </div>
                )}

                {/* Attachments */}
                {msg.attachments?.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.attachments.map((a, idx) => (
                      <div
                        key={idx}
                        className="cursor-pointer"
                        onClick={() => setPreview(a)}
                      >
                        {a.type === "image" && (
                          <img src={a.url} alt={a.name} className="max-h-48 rounded" />
                        )}
                        {a.type === "video" && (
                          <video src={a.url} controls className="max-h-64 rounded" />
                        )}
                        {a.type === "audio" && <audio src={a.url} controls />}
                        {a.type === "file" && (
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`underline ${mine ? "text-white" : "text-blue-600"}`}
                          >
                            {a.name || "Download file"}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Reaction summary (below bubble) */}
                {summary.length > 0 && (
                  <div className={`mt-2 flex flex-wrap gap-1 ${mine ? "justify-end" : "justify-start"}`}>
                    {summary.map((r) => (
                      <button
                        key={r.emoji}
                        onClick={() => toggleReaction(msg, r.emoji)}
                        className={`px-2 py-[2px] rounded-full text-xs border ${
                          r.mine
                            ? mine
                              ? "bg-white/20 border-white/30 text-white"
                              : "bg-blue-50 border-blue-200 text-blue-700"
                            : mine
                            ? "bg-white/10 border-white/20 text-white/90"
                            : "bg-gray-50 border-gray-200 text-gray-700"
                        }`}
                        title={r.mine ? "You reacted" : "React"}
                      >
                        {r.emoji} {r.count}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Context menu overlay + menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setContextMenu(null)}
          />
          <div
            ref={menuRef}
            className="fixed z-[9999] bg-white border shadow-xl rounded-md w-[220px] overflow-hidden"
            style={{
              top: Math.max(12, Math.min(contextMenu.y, window.innerHeight - MENU_H - 12)),
              left: Math.max(12, Math.min(contextMenu.x, window.innerWidth - MENU_W - 12)),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 font-semibold bg-blue-600 text-white">
              Message options
            </div>

            {/* Edit */}
            <button
              disabled={
                contextMenu.msg.deletedForEveryone ||
                (contextMenu.msg.sender?._id || contextMenu.msg.sender) !== user._id
              }
              className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                contextMenu.msg.deletedForEveryone ||
                (contextMenu.msg.sender?._id || contextMenu.msg.sender) !== user._id
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-800"
              }`}
              onClick={() => {
                startEdit(contextMenu.msg);
                setContextMenu(null);
              }}
            >
              ✏️ Edit message
            </button>

            {/* Delete for me */}
            <button
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
              onClick={() => {
                deleteMessage(contextMenu.msg._id, "me");
                setContextMenu(null);
              }}
            >
              🗑️ Delete for me
            </button>

            {/* Delete for everyone */}
            <button
              disabled={
                (contextMenu.msg.sender?._id || contextMenu.msg.sender) !== user._id
              }
              className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-red-50 ${
                (contextMenu.msg.sender?._id || contextMenu.msg.sender) !== user._id
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-red-600"
              }`}
              onClick={() => {
                deleteMessage(contextMenu.msg._id, "all");
                setContextMenu(null);
              }}
            >
              🗑️ Delete for everyone
            </button>

            {/* Reactions row (working) */}
            <div className="flex justify-around px-3 py-2 text-lg border-t bg-white">
              {REACTION_SET.map((emo) => (
                <button
                  key={emo}
                  onClick={() => toggleReaction(contextMenu.msg, emo)}
                  className="hover:scale-110 transition"
                >
                  {emo}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Composer */}
      <div className="sticky bottom-0 p-3 bg-white border-t dark:bg-gray-900">
        {/* Editing banner */}
        {editingId && (
          <div className="mb-2 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <span className="truncate">Editing message — changes will be visible to everyone</span>
            <button
              onClick={cancelEdit}
              className="ml-2 rounded px-2 py-1 text-[11px] font-semibold hover:bg-amber-100"
            >
              Cancel
            </button>
          </div>
        )}

        {showEmoji && (
          <div className="absolute bottom-20 right-4 z-50">
            <Picker onEmojiClick={(e) => setNewMessage((v) => v + e.emoji)} />
          </div>
        )}

        <form onSubmit={send} className="flex items-center gap-2">
          {/* Emoji */}
          <button
            type="button"
            onClick={() => setShowEmoji((v) => !v)}
            className="text-xl"
          >
            😊
          </button>

          {/* File input */}
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-gray-500 hover:text-gray-700"
          >
            <PaperClipIcon className="h-6 w-6" />
          </button>

          {/* Text input (visible colors) */}
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={editingId ? "Edit your message…" : "Type a message…"}
            className="
              flex-1 rounded-2xl border px-3 py-2
              bg-white text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
              dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500
            "
          />

          {/* Send */}
          <button type="submit" className="text-primary hover:text-primary-hover" title={editingId ? "Save edit" : "Send"}>
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        </form>

        {/* Attachments preview */}
        {attachments.length > 0 && !editingId && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {attachments.map((a, i) => (
              <div
                key={i}
                className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 flex items-center gap-1 cursor-pointer"
                onClick={() => setPreview(a)}
              >
                {a.type === "image" ? "📷" : a.type === "video" ? "🎥" : a.type === "audio" ? "🎵" : "📎"} {a.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAttachments((prev) => prev.filter((_, j) => j !== i));
                  }}
                  className="ml-1 text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Preview */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000]"
          onClick={() => setPreview(null)}
        >
          {preview.type === "image" && (
            <img src={preview.url} alt={preview.name || "image"} className="max-h-[90vh] max-w-[90vw] rounded" />
          )}
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
};

export default PrivateChatBox;
