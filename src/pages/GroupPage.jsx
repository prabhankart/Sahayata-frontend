import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { AuthContext } from "../context/AuthContext";
import StatusPill from "../components/StatusPill";
import RightDrawer from "../components/RightDrawer";
import {
  ChevronDownIcon,
  InformationCircleIcon,
  PaperClipIcon,
  PaperAirplaneIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const STATUSES = ["Open", "In Progress", "Resolved", "On Hold"];

export default function GroupPage() {
  const { groupId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [joining, setJoining] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [busyPledge, setBusyPledge] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});

  const socketRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);

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
        toast.error("Could not load chat history.");
      }
    })();

    // Socket
    const s = io(API_URL, { transports: ["websocket"] });
    socketRef.current = s;
    s.emit("group:join", groupId);

    s.on("group:message", (msg) => {
      setMessages((prev) => {
        if (msg.clientId && prev.some((m) => m.clientId === msg.clientId)) return prev;
        return [...prev, msg];
      });
      setTimeout(scrollToBottom, 16);
    });

    s.on("group:update", (patch) => {
      setGroup((g) => ({ ...g, ...patch }));
    });

    s.on("group:typing", ({ userId, name }) => {
      if (userId === user._id) return;
      setTypingUsers((t) => ({ ...t, [userId]: name }));
      setTimeout(() => setTypingUsers((t) => {
        const c = { ...t }; delete c[userId]; return c;
      }), 1800);
    });

    return () => {
      s.emit("group:leave", groupId);
      s.disconnect();
    };
  }, [auth, groupId, navigate, user]);

  const emitTyping = () => {
    socketRef.current?.emit("group:typing", { groupId, userId: user._id, name: user.name });
  };

  const send = async () => {
    if (!text.trim() || !isMember) return;

    const clientId = `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const optimistic = {
      _id: clientId,
      clientId,
      group: groupId,
      sender: { _id: user._id, name: user.name },
      text: text.trim(),
      replyTo: replyTo ? { _id: replyTo._id, text: replyTo.text, sender: replyTo.sender } : null,
      createdAt: new Date().toISOString(),
      optimistic: true,
    };
    setMessages((p) => [...p, optimistic]);
    setText("");
    setReplyTo(null);
    setTimeout(scrollToBottom, 16);
    inputRef.current?.focus();

    try {
      const { data } = await axios.post(
        `${API_URL}/api/groups/${groupId}/messages`,
        { text: optimistic.text, clientId, replyTo: replyTo?._id || null },
        auth
      );
      setMessages((p) => p.map((m) => (m.clientId === clientId ? data : m)));
    } catch {
      setMessages((p) => p.filter((m) => m.clientId !== clientId));
      toast.error("Failed to send.");
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

  const updateStatus = async (value) => {
    try {
      const { data } = await axios.patch(`${API_URL}/api/groups/${groupId}/meta`, { status: value }, auth);
      setGroup(data);
      toast.success(`Status: ${value}`);
    } catch {
      toast.error("Could not update status.");
    }
  };

  if (!group) return <div className="p-6">Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Header */}
      <div className="mb-4 rounded-3xl border border-gray-100 bg-white/90 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 ring-1 ring-white/70" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-lg font-extrabold text-gray-900">{group.name}</h1>
                  <StatusPill value={group.status} />
                  <div className="text-xs text-gray-500">
                    {(group.members || []).length} members • {(group.pledgedHelpers || []).length} pledged
                  </div>
                </div>
                {group.problemTitle && (
                  <div className="mt-0.5 truncate text-sm text-gray-700">{group.problemTitle}</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* status dropdown (members can change) */}
            <div className="relative">
              <button className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                <ChevronDownIcon className="h-4 w-4" />
                Change Status
              </button>
              <div className="absolute right-0 z-10 mt-1 hidden w-44 rounded-xl border bg-white p-1 text-sm shadow group-hover:block peer">
                {/* intentionally hidden; use simple menu below to keep code short */}
              </div>
            </div>
            <select
              onChange={(e) => updateStatus(e.target.value)}
              value={group.status}
              className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <button
              onClick={togglePledge}
              disabled={busyPledge}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${isPledged ? "bg-gray-100 text-gray-800" : "bg-primary text-white"}`}
            >
              <CheckBadgeIcon className="h-4 w-4" />
              {isPledged ? "Unpledge" : "Pledge to help"}
            </button>

            <button
              onClick={() => setDrawer(true)}
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
              title="Details"
            >
              <InformationCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="flex h-[72vh] max-h-[780px] flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white/90 shadow-sm">
        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-500">No messages yet.</div>
          )}

          {messages.map((m) => {
            const mine = (m.sender?._id || m.sender) === user._id;
            const name = m.sender?.name || "User";
            const time = new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

            return (
              <div key={m._id || m.clientId} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${mine ? "items-end" : "items-start"} flex gap-2`}>
                  {!mine && (
                    <div className="h-9 w-9 shrink-0 rounded-full bg-violet-200 text-violet-800 flex items-center justify-center font-bold">
                      {name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}

                  <div
                    onClick={() => setReplyTo(m)}
                    className={`cursor-pointer rounded-2xl px-4 py-2 shadow-sm border ${
                      mine
                        ? "bg-gradient-to-r from-primary to-fuchsia-600 text-white border-primary/60"
                        : "bg-white text-gray-900 border-gray-200"
                    }`}
                  >
                    <div className={`text-[11px] mb-1 ${mine ? "text-white/85" : "text-gray-600"} font-semibold`}>
                      {name} • {time}{m.optimistic ? " (sending…)" : ""}
                    </div>

                    {/* quoted reply */}
                    {m.replyTo && (
                      <div className={`mb-1 rounded-lg px-2 py-1 text-xs ${mine ? "bg-white/15" : "bg-gray-50"} ${mine ? "text-white/90" : "text-gray-700"}`}>
                        Replying to: <span className="font-semibold">{m.replyTo?.sender?.name || "User"}</span> — {m.replyTo?.text}
                      </div>
                    )}

                    <div className={mine ? "text-white" : "text-gray-900"}>{m.text}</div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* typing */}
          {Object.keys(typingUsers).length > 0 && (
            <div className="pt-1 text-xs text-gray-500">
              {Object.values(typingUsers).join(", ")} typing…
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t p-3">
          {replyTo && (
            <div className="mb-2 flex items-center justify-between rounded-lg border bg-gray-50 px-3 py-2 text-xs text-gray-700">
              Replying to <strong className="ml-1">{replyTo.sender?.name || "User"}</strong>:{" "}
              <span className="truncate ml-1">{replyTo.text}</span>
              <button className="ml-2 text-gray-400 hover:text-gray-600" onClick={() => setReplyTo(null)}>×</button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button className="rounded-xl p-3 text-gray-500 hover:bg-gray-100" title="Attach (coming soon)">
              <PaperClipIcon className="h-5 w-5" />
            </button>
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => { setText(e.target.value); emitTyping(); }}
              disabled={!isMember}
              placeholder={isMember ? "Type a message…" : "Join to send messages"}
              className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50"
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button
              onClick={send}
              disabled={!isMember || !text.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
            >
              <PaperAirplaneIcon className="h-5 w-5 rotate-45" />
              Send
            </button>
          </div>
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
