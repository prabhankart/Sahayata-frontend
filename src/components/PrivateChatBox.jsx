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
import VirtualKeyboard from "./VirtualKeyboard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(API_URL, { transports: ["websocket"] });

const MENU_W = 220;
const MENU_H = 260;
const REACTION_SET = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const humanTime = (dt) => {
  if (!dt) return "";
  const d = new Date(dt);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "Just now";
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const PrivateChatBox = ({ conversation, onBack }) => {
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const [contextMenu, setContextMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [attachments, setAttachments] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [preview, setPreview] = useState(null);

  const [, forceTick] = useState(0);

  const endRef = useRef(null);
  const fileRef = useRef(null);
  const inputRef = useRef(null);
  const longPressTimer = useRef(null);
  const menuRef = useRef(null);

  // Soft keyboard
  const [showSoftKb, setShowSoftKb] = useState(false);
  const [kbHeight, setKbHeight] = useState(0);
  const composerRef = useRef(null);
  const [composerH, setComposerH] = useState(64);

  const other = conversation.participants.find((p) => p._id !== user._id);
  const toBottom = () => endRef.current?.scrollIntoView({ behavior: "smooth" });

  // measure composer height
  useEffect(() => {
    if (!composerRef.current) return;
    const ro = new ResizeObserver(() => {
      setComposerH(composerRef.current?.offsetHeight || 64);
    });
    ro.observe(composerRef.current);
    setComposerH(composerRef.current?.offsetHeight || 64);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const id = setInterval(() => forceTick((x) => x + 1), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!window.visualViewport) return;
    const onVV = () => requestAnimationFrame(toBottom);
    window.visualViewport.addEventListener("resize", onVV);
    return () => window.visualViewport.removeEventListener("resize", onVV);
  }, []);

  // Load + realtime
  useEffect(() => {
    socket.emit("joinConversation", { conversationId: conversation._id });

    const onReceive = (m) => {
      if (m.conversation === conversation._id) {
        setMessages((prev) => [...prev, m]);
        const mine = (m.sender?._id || m.sender) === user._id;
        if (!mine) {
          socket.emit("conversation:markRead", {
            conversationId: conversation._id,
            userId: user._id,
          });
        }
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
        socket.emit("conversation:markRead", {
          conversationId: conversation._id,
          userId: user._id,
        });
      } catch {
        toast.error("Could not load chat history.");
      }
    })();

    return () => {
      socket.off("receivePrivateMessage", onReceive);
    };
  }, [conversation._id, user.token, user._id]);

  useEffect(() => {
    const onRead = ({ conversationId, readerId }) => {
      if (conversationId !== conversation._id) return;
      if (readerId && readerId !== user._id) {
        setMessages((prev) =>
          prev.map((m) => {
            const mine = (m.sender?._id || m.sender) === user._id;
            if (!mine) return m;
            const rb = (m.readBy || []).map((x) => (x?._id || x).toString());
            if (rb.includes(readerId)) return m;
            return { ...m, readBy: [...(m.readBy || []), readerId] };
          })
        );
      }
    };
    socket.on("messagesRead", onRead);
    return () => socket.off("messagesRead", onRead);
  }, [conversation._id, user._id]);

  useEffect(toBottom, [messages]);

  useEffect(() => {
    const onScroll = () => setContextMenu(null);
    const onKey = (e) => {
      if (e.key === "Escape") {
        setContextMenu(null);
        setPreview(null);
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
        prev.map((m) => (m._id === messageId ? { ...m, text, edited: true } : m))
      );
    };

    const onReacted = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions: reactions || [] } : m))
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
      socket.emit("deleteMessage", { messageId: msgId, mode, userId: user._id });
    } catch {
      toast.error("Failed to delete message");
    }
  };

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
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewMessage("");
  };

  const toggleReaction = async (msg, emoji) => {
    try {
      const { data } = await axios.patch(
        `${API_URL}/api/messages/${msg._id}/reactions`,
        { emoji },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setMessages((prev) =>
        prev.map((m) =>
          m._id === msg._id ? { ...m, reactions: data.reactions || [] } : m
        )
      );
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

  // Send
  const send = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    const text = newMessage.trim();

    if (editingId) {
      if (!text) return toast.error("Message cannot be empty.");
      try {
        await axios.patch(
          `${API_URL}/api/messages/${editingId}`,
          { text },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setMessages((prev) =>
          prev.map((m) => (m._id === editingId ? { ...m, text, edited: true } : m))
        );
        socket.emit("editMessage", { messageId: editingId, text });
        cancelEdit();
      } catch {
        toast.error("Failed to edit message");
      }
      return;
    }

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
  const sendFromVK = () => send({ preventDefault: () => {} });

  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  // safe-area bottom used by messages pad & composer
  const safePad = "calc(env(safe-area-inset-bottom, 0px) + 8px)";

  return (
    <div className="flex flex-col h-[var(--app-dvh,100dvh)] relative overscroll-contain">
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
      <div
        className="flex-1 min-h-0 overflow-y-auto p-4 bg-gray-50 overscroll-contain"
        style={{
          WebkitOverflowScrolling: "touch",
          paddingBottom: `calc(${composerH}px + ${showSoftKb ? kbHeight : 0}px + ${safePad})`,
          scrollPaddingBottom: "140px",
        }}
      >
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
                  setContextMenu({ x: e.clientX, y: e.clientY, msg });
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
                className={`p-2 rounded-xl max-w-[85%] md:max-w-[80%] ${
                  mine
                    ? "bg-primary text-white"
                    : "bg-white border border-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                }`}
              >
                {msg.text && (
                  <div className="whitespace-pre-wrap break-words">
                    {msg.text}
                    {msg.edited && !isDeleted && (
                      <span
                        className={`ml-2 text-[10px] ${mine ? "text-white/80" : "text-gray-500"}`}
                      >
                        (edited)
                      </span>
                    )}
                  </div>
                )}

                {msg.attachments?.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.attachments.map((a, idx) => (
                      <div
                        key={idx}
                        className="cursor-pointer"
                        onClick={() => setPreview(a)}
                      >
                        {a.type === "image" && (
                          <img src={a.url} alt={a.name} className="max-h-48 w-full h-auto rounded" />
                        )}
                        {a.type === "video" && (
                          <video src={a.url} controls className="max-h-64 w-full rounded" />
                        )}
                        {a.type === "audio" && <audio src={a.url} controls className="w-full" />}
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

                <div
                  className={`mt-1 flex items-center gap-1 text-[10px] ${
                    mine ? "justify-end text-white/80" : "justify-start text-gray-500"
                  }`}
                >
                  <span>{humanTime(msg.createdAt || msg._createdAt || msg.time)}</span>
                  {mine && (
                    <span className="leading-none">
                      {(msg.readBy || []).some((id) => (id?._id || id) === other?._id) ? "✓✓" : "✓"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Context menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setContextMenu(null)} />
          <div
            ref={menuRef}
            className="fixed z-[9999] bg-white border shadow-xl rounded-md w-[220px] overflow-hidden"
            style={{
              top: clamp(contextMenu.y, 12, window.innerHeight - MENU_H - 12),
              left: clamp(contextMenu.x, 12, window.innerWidth - MENU_W - 12),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 font-semibold bg-blue-600 text-white">Message options</div>

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

            <button
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
              onClick={() => {
                deleteMessage(contextMenu.msg._id, "me");
                setContextMenu(null);
              }}
            >
              🗑️ Delete for me
            </button>

            <button
              disabled={(contextMenu.msg.sender?._id || contextMenu.msg.sender) !== user._id}
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

            <div className="flex justify-around px-3 py-2 text-lg border-top bg-white">
              {REACTION_SET.map((emo) => (
                <button key={emo} onClick={() => toggleReaction(contextMenu.msg, emo)} className="hover:scale-110 transition">
                  {emo}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Composer — fixed when VK open, sticky otherwise */}
      <div
        ref={composerRef}
        className={`${showSoftKb ? "fixed left-0 right-0" : "sticky"} bottom-0 p-3 bg-white/95 border-t dark:bg-gray-900/95 z-40 shadow-[0_-6px_12px_-8px_rgba(0,0,0,0.15)]`}
        style={{
          bottom: showSoftKb ? kbHeight : 0,
          paddingBottom: safePad,
        }}
      >
        {editingId && (
          <div className="mb-2 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <span className="truncate">Editing message — changes will be visible to everyone</span>
            <button onClick={cancelEdit} className="ml-2 rounded px-2 py-1 text-[11px] font-semibold hover:bg-amber-100">
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
          <button type="button" onClick={() => setShowEmoji((v) => !v)} className="text-xl" aria-label="Emoji">
            😊
          </button>

          <input ref={fileRef} type="file" className="hidden" onChange={handleFileUpload} />
          <button type="button" onClick={() => fileRef.current?.click()} className="text-gray-500 hover:text-gray-700" aria-label="Attach">
            <PaperClipIcon className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={() => setShowSoftKb((v) => !v)}
            className="text-gray-600 hover:text-gray-800"
            aria-label="Toggle keyboard"
            title="Toggle keyboard"
          >
            ⌨️
          </button>

          <input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onFocus={() => {
              // Prefer our virtual keyboard; keep OS one hidden
              setShowSoftKb(true);
              requestAnimationFrame(() => inputRef.current?.blur());
              setTimeout(toBottom, 0);
            }}
            onTouchStart={(e) => {
              if (showSoftKb) {
                e.preventDefault();
                inputRef.current?.blur();
              }
            }}
            readOnly={showSoftKb}
            inputMode={showSoftKb ? "none" : "text"}
            enterKeyHint="send"
            placeholder={editingId ? "Edit your message…" : "Type a message…"}
            className="
              flex-1 rounded-2xl border px-3 py-2
              bg-white text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
              dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500
            "
          />

          <button type="submit" className="text-primary hover:text-primary-hover" title={editingId ? "Save edit" : "Send"}>
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        </form>

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

      {/* Virtual keyboard (fixed at bottom) */}
      <VirtualKeyboard
        visible={showSoftKb}
        onHeightChange={setKbHeight}
        onHide={() => setShowSoftKb(false)}
        onEnter={sendFromVK}
        onSpace={() => setNewMessage((v) => v + " ")}
        onBackspace={() => setNewMessage((v) => v.slice(0, -1))}
        onInput={(ch) => setNewMessage((v) => v + ch)}
      />

      {/* Fullscreen Preview */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000]"
          onClick={() => setPreview(null)}
        >
          <button
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 text-gray-800 shadow-lg flex items-center justify-center text-lg"
            aria-label="Close preview"
            onClick={(e) => {
              e.stopPropagation();
              setPreview(null);
            }}
          >
            ✕
          </button>

          {preview.type === "image" && (
            <img src={preview.url} alt={preview.name || "image"} className="max-h-[90vh] max-w-[90vw] rounded" />
          )}
          {preview.type === "video" && (
            <video
              src={preview.url}
              controls
              autoPlay
              className="max-h-[90vh] max-w-[90vw] rounded"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {preview.type === "audio" && (
            <audio
              src={preview.url}
              controls
              autoPlay
              className="w-full max-w-[80vw]"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PrivateChatBox;
