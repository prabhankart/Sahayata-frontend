// src/pages/GroupPage.jsx
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { AuthContext } from "../context/AuthContext";
import RightDrawer from "../components/RightDrawer";
import {
  InformationCircleIcon,
  PaperClipIcon,
  PaperAirplaneIcon,
  SquaresPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function GroupPage() {
  const { groupId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [busyPledge, setBusyPledge] = useState(false);

  // chat state
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [preview, setPreview] = useState(null);

  // UI state
  const [joining, setJoining] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [postPickerOpen, setPostPickerOpen] = useState(false);

  // pagination (server returns DESC, we reverse for UI)
  const [cursor, setCursor] = useState(null);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const socketRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);

  const auth = useMemo(
    () => (user ? { headers: { Authorization: `Bearer ${user.token}` } } : null),
    [user]
  );

  const isMember = useMemo(() => {
    if (!group || !user) return false;
    return (group.members || []).some((m) => (m._id || m) === user._id);
  }, [group, user]);

  const isPledged = useMemo(() => {
    if (!group || !user) return false;
    return (group.pledgedHelpers || []).some((p) => (p._id || p) === user._id);
  }, [group, user]);

  const scrollToBottom = () => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  };

  const togglePledge = async () => {
    try {
      setBusyPledge(true);
      const url = `${API_URL}/api/groups/${groupId}/${isPledged ? "unpledge" : "pledge"}`;
      const { data } = await axios.post(url, {}, auth);
      setGroup(data);
    } catch {
      toast.error("Could not update pledge.");
    } finally {
      setBusyPledge(false);
    }
  };

  // helper to insert a server batch (server gives DESC)
  const addBatch = (serverBatchDesc) => {
    const asc = [...(serverBatchDesc || [])].reverse();
    setMessages((prev) => {
      const byKey = new Map((prev || []).map((m) => [m._id || m.clientId, m]));
      asc.forEach((m) => byKey.set(m._id || m.clientId, m));
      return Array.from(byKey.values());
    });
  };

  useEffect(() => {
    if (!auth) {
      toast.error("Please log in.");
      navigate("/login");
      return;
    }

    (async () => {
      try {
        const [{ data: g }, { data: page }] = await Promise.all([
          axios.get(`${API_URL}/api/groups/${groupId}`, auth),
          axios.get(`${API_URL}/api/groups/${groupId}/messages?limit=50`, auth),
        ]);
        setGroup(g);
        addBatch(page.data || []);
        setCursor(page.nextBefore || null);
        setTimeout(scrollToBottom, 50);

        // mark read on open
        axios.post(`${API_URL}/api/groups/${groupId}/read`, {}, auth).catch(() => {});
      } catch {
        toast.error("Could not load chat history.");
      }
    })();

    // socket (websocket w/ polling fallback)
    const s = io(API_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    socketRef.current = s;
    s.emit("group:join", groupId);

    // de-dup optimistic
    s.on("group:message", (msg) => {
      setMessages((prev) => {
        if (msg._id && prev.some((m) => m._id === msg._id)) return prev;
        const mineIdx = prev.findIndex(
          (m) =>
            m.optimistic &&
            (m.sender?._id || m.sender) === (msg.sender?._id || msg.sender) &&
            (m.text || "") === (msg.text || "") &&
            (m.attachments?.length || 0) === (msg.attachments?.length || 0)
        );
        if (mineIdx !== -1) {
          const copy = [...prev];
          copy[mineIdx] = msg;
          return copy;
        }
        return [...prev, msg];
      });
      setTimeout(scrollToBottom, 16);
    });

    s.on("group:update", (patch) => setGroup((g) => ({ ...g, ...patch })));

    s.on("group:typing", ({ userId, name }) => {
      if (userId === user._id) return;
      setTypingUsers((t) => ({ ...t, [userId]: name }));
      setTimeout(() => {
        setTypingUsers((t) => {
          const c = { ...t };
          delete c[userId];
          return c;
        });
      }, 1800);
    });

    return () => {
      s.emit("group:leave", groupId);
      s.disconnect();
    };
  }, [auth, groupId, navigate, user]);

  const emitTyping = () =>
    socketRef.current?.emit("group:typing", { groupId, userId: user._id, name: user.name });

  const loadOlder = async () => {
    if (!cursor) return;
    try {
      setLoadingOlder(true);
      const { data: page } = await axios.get(
        `${API_URL}/api/groups/${groupId}/messages?limit=50&before=${encodeURIComponent(cursor)}`,
        auth
      );
      addBatch(page.data || []);
      setCursor(page.nextBefore || null);
    } catch {
      toast.error("Could not load older messages.");
    } finally {
      setLoadingOlder(false);
    }
  };

  const send = async () => {
    if ((!text.trim() && attachments.length === 0) || !isMember) return;

    const clientId = `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const optimistic = {
      _id: clientId,
      clientId,
      group: groupId,
      sender: { _id: user._id, name: user.name },
      text: text.trim(),
      replyTo: replyTo ? { _id: replyTo._id, text: replyTo.text, sender: replyTo.sender } : null,
      attachments,
      createdAt: new Date().toISOString(),
      optimistic: true,
    };

    setMessages((p) => [...p, optimistic]);
    setText("");
    setReplyTo(null);
    setAttachments([]);
    setTimeout(scrollToBottom, 16);
    inputRef.current?.focus();

    try {
      const { data } = await axios.post(
        `${API_URL}/api/groups/${groupId}/messages`,
        { text: optimistic.text, clientId, replyTo: replyTo?._id || null, attachments },
        auth
      );
      setMessages((p) => p.map((m) => (m.clientId === clientId ? data : m)));
      // update read cursor after own send
      axios.post(`${API_URL}/api/groups/${groupId}/read`, {}, auth).catch(() => {});
    } catch (e) {
      setMessages((p) => p.filter((m) => m.clientId !== clientId));
      toast.error(e?.response?.data?.message || "Failed to send.");
    }
  };

  const join = async () => {
    try {
      setJoining(true);
      await axios.post(`${API_URL}/api/groups/${groupId}/join`, {}, auth);
      const { data } = await axios.get(`${API_URL}/api/groups/${groupId}`, auth);
      setGroup(data);
      toast.success("Joined!");
      axios.post(`${API_URL}/api/groups/${groupId}/read`, {}, auth).catch(() => {});
    } catch {
      toast.error("Could not join group.");
    } finally {
      setJoining(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      // support both keys used across code
      formData.append("file", file);
      formData.append("image", file);

      const { data } = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { Authorization: `Bearer ${user.token}` },
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
        { url: data.url || data.imageUrl, type, name: file.name, mime: file.type, size: file.size },
      ]);
      toast.success("File attached!");
    } catch {
      toast.error("Upload failed.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const addPostToAttachments = (post) => {
    setAttachments((prev) => [
      ...prev,
      {
        type: "post",
        postRef: {
          _id: post._id,
          title: post.title,
          status: post.status,
          authorName: user.name,
          coverUrl: post.coverUrl || null,
        },
      },
    ]);
    setPostPickerOpen(false);
    toast.success("Post attached!");
  };

  // Close preview on ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setPreview(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!group) return <div className="p-6">Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 rounded-3xl border border-gray-100 bg-white/90 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 ring-1 ring-white/70" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-lg font-extrabold text-gray-900">{group.name}</h1>
                  <div className="text-xs text-gray-500">
                    {(group.members || []).length} members
                  </div>
                </div>
                {group.problemTitle && (
                  <div className="mt-0.5 truncate text-sm text-gray-700">{group.problemTitle}</div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setDrawer(true)}
            className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
            title="Details"
          >
            <InformationCircleIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Chat card */}
      <div
        className="
          flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white/90 shadow-sm
          min-h-[60vh] md:min-h-[70vh]
          max-h-[calc(100dvh-180px)]
        "
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Messages list */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 overscroll-contain"
        >
          {cursor && (
            <div className="mb-2 flex justify-center">
              <button
                onClick={loadOlder}
                disabled={loadingOlder}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                {loadingOlder ? "Loading…" : "Load older messages"}
              </button>
            </div>
          )}

          {messages.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-500">No messages yet.</div>
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
                <div className={`flex gap-2 ${mine ? "items-end" : "items-start"} max-w-[92%] sm:max-w-[80%]`}>
                  {!mine && (
                    <div className="h-9 w-9 shrink-0 rounded-full bg-violet-200 text-violet-800 flex items-center justify-center font-bold">
                      {name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}

                  <div
                    onClick={() => setReplyTo(m)}
                    className={`min-w-0 cursor-pointer rounded-2xl px-3 sm:px-4 py-2 shadow-sm border break-words
                      ${mine
                        ? "bg-gradient-to-r from-primary to-fuchsia-600 text-white border-primary/60"
                        : "bg-white text-gray-900 border-gray-200"}`}
                  >
                    <div className={`text-[11px] mb-1 ${mine ? "text-white/85" : "text-gray-600"} font-semibold`}>
                      {name} • {time}
                      {m.optimistic ? " (sending…)" : ""}
                    </div>

                    {m.replyTo && (
                      <div
                        className={`mb-1 rounded-lg px-2 py-1 text-xs ${
                          mine ? "bg-white/15 text-white/90" : "bg-gray-50 text-gray-700"
                        }`}
                      >
                        Replying to: <span className="font-semibold">{m.replyTo?.sender?.name || "User"}</span> —{" "}
                        {m.replyTo?.text}
                      </div>
                    )}

                    {m.text && <div className={mine ? "text-white" : "text-gray-900"}>{m.text}</div>}

                    {m.attachments?.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {m.attachments.map((a, i) => (
                          <div key={i}>
                            {a.type === "image" && (
                              <img
                                src={a.url}
                                alt={a.name}
                                className="max-h-56 w-full h-auto rounded-lg border cursor-zoom-in object-contain"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreview({ type: "image", url: a.url, name: a.name });
                                }}
                              />
                            )}
                            {a.type === "video" && (
                              <video
                                src={a.url}
                                controls
                                className="max-h-64 w-full rounded-lg border"
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                            {a.type === "audio" && (
                              <audio
                                src={a.url}
                                controls
                                className="w-full"
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                            {a.type === "file" && (
                              <a
                                href={a.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm underline break-all"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {a.name || "Download file"}
                              </a>
                            )}
                            {a.type === "post" && a.postRef && (
                              <Link
                                to={`/post/${a.postRef._id}`}
                                className="block rounded-xl border bg-white text-gray-900 hover:bg-gray-50 p-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center gap-3">
                                  {a.postRef.coverUrl ? (
                                    <img
                                      src={a.postRef.coverUrl}
                                      alt="cover"
                                      className="h-14 w-14 rounded-lg object-cover border"
                                    />
                                  ) : (
                                    <div className="h-14 w-14 rounded-lg bg-gray-100 border" />
                                  )}
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold truncate">{a.postRef.title}</div>
                                    <div className="mt-0.5 text-xs text-gray-600">
                                      Status: <span className="font-medium">{a.postRef.status || "Open"}</span>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {Object.keys(typingUsers).length > 0 && (
            <div className="pt-1 text-xs text-gray-500">{Object.values(typingUsers).join(", ")} typing…</div>
          )}
        </div>

        {/* Composer - sticky within card (no viewport overflow) */}
        <div
          className="sticky bottom-0 z-10 border-t bg-white/95 backdrop-blur p-2 sm:p-3"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 4px)" }}
        >
          {replyTo && (
            <div className="mb-2 flex items-center justify-between rounded-lg border bg-gray-50 px-3 py-2 text-xs text-gray-700">
              <div className="min-w-0 truncate">
                Replying to <strong className="ml-1">{replyTo.sender?.name || "User"}</strong>:{" "}
                <span className="truncate ml-1">{replyTo.text}</span>
              </div>
              <button className="ml-2 shrink-0 text-gray-400 hover:text-gray-600" onClick={() => setReplyTo(null)}>
                ×
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 min-w-0">
            <input type="file" ref={fileRef} className="hidden" onChange={handleFileUpload} />
            <button
              onClick={() => fileRef.current?.click()}
              className="shrink-0 rounded-xl p-3 text-gray-500 hover:bg-gray-100"
              title="Attach file"
            >
              <PaperClipIcon className="h-5 w-5" />
            </button>

            <button
              onClick={() => setPostPickerOpen(true)}
              className="shrink-0 rounded-xl p-3 text-gray-500 hover:bg-gray-100"
              title="Share one of my posts"
            >
              <SquaresPlusIcon className="h-5 w-5" />
            </button>

            <input
              ref={inputRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                emitTyping();
              }}
              disabled={!isMember}
              placeholder={isMember ? "Type a message…" : "Join to send messages"}
              className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50"
              onKeyDown={(e) => e.key === "Enter" && send()}
            />

            <button
              onClick={send}
              disabled={!isMember || (!text.trim() && attachments.length === 0)}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
              title="Send"
            >
              <PaperAirplaneIcon className="h-5 w-5 rotate-45" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>

          {attachments.length > 0 && (
            <div className="mt-2 flex w-full gap-2 overflow-x-auto text-xs text-gray-600">
              {attachments.map((a, i) => (
                <div key={i} className="flex shrink-0 items-center gap-1 rounded bg-gray-100 px-2 py-1">
                  {a.type === "image"
                    ? "📷"
                    : a.type === "video"
                    ? "🎥"
                    : a.type === "audio"
                    ? "🎵"
                    : a.type === "post"
                    ? "🧩"
                    : "📎"}{" "}
                  <span className="max-w-[40vw] truncate">{a.name || a.postRef?.title || "Attachment"}</span>
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

          {!isMember && (
            <div className="mt-2">
              <button
                onClick={join}
                disabled={joining}
                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50"
              >
                Join group to chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Picker Modal */}
      {postPickerOpen && (
        <PostPicker
          token={user.token}
          onClose={() => setPostPickerOpen(false)}
          onPick={addPostToAttachments}
        />
      )}

      {/* Fullscreen media preview */}
      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <button
            className="absolute top-4 right-4 rounded-full bg-white/90 p-2 shadow hover:bg-white"
            onClick={() => setPreview(null)}
          >
            <XMarkIcon className="w-6 h-6 text-gray-700" />
          </button>
          {preview.type === "image" && (
            <img src={preview.url} alt={preview.name || ""} className="max-h-[90vh] max-w-[90vw] object-contain rounded" />
          )}
          {preview.type === "video" && (
            <video src={preview.url} controls autoPlay className="max-h-[90vh] max-w-[90vw] rounded" />
          )}
          {preview.type === "audio" && (
            <audio src={preview.url} controls autoPlay className="w-full max-w-[80vw]" />
          )}
        </div>
      )}

      <RightDrawer
        open={drawer}
        onClose={() => setDrawer(false)}
        group={group}
        onPledgeToggle={togglePledge}
        isPledged={isPledged}
        busyPledge={busyPledge}
      />
    </div>
  );
}

/** --- Inline Post Picker component --- */
function PostPicker({ token, onClose, onPick }) {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/posts/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (ok) setPosts(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Could not load your posts");
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => (ok = false);
  }, [token]);

  const filtered = posts.filter(
    (p) =>
      !q.trim() ||
      p.title?.toLowerCase().includes(q.toLowerCase()) ||
      p.status?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white text-gray-900 shadow-xl ring-1 ring-black/5 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold">Share one of your posts</h3>
          <button className="p-1 rounded hover:bg-gray-100" onClick={onClose}>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search my posts…"
            className="w-full rounded-lg border px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div className="p-4 overflow-y-auto space-y-2">
          {loading ? (
            <div className="p-6 text-sm text-gray-500">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">No posts found.</div>
          ) : (
            filtered.map((p) => (
              <button
                key={p._id}
                onClick={() => onPick(p)}
                className="w-full text-left rounded-xl border p-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {p.coverUrl ? (
                    <img src={p.coverUrl} className="h-12 w-12 rounded-lg object-cover border" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gray-100 border" />
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold truncate text-gray-900">{p.title}</div>
                    <div className="text-xs text-gray-600">Status: {p.status || "Open"}</div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-3 border-t flex justify-end">
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
