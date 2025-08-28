// src/pages/GroupsPage.jsx
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import GroupCard from "../components/GroupCard";
import { AuthContext } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Skeleton = () => (
  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
    <div className="flex items-start justify-between">
      <div className="flex w-full items-start gap-4">
        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-3 w-64 animate-pulse rounded bg-gray-100" />
          <div className="mt-4 flex gap-2">
            <div className="h-6 w-24 animate-pulse rounded-full bg-gray-100" />
            <div className="h-6 w-28 animate-pulse rounded-full bg-gray-100" />
          </div>
        </div>
      </div>
      <div className="h-9 w-24 animate-pulse rounded-full bg-gray-100" />
    </div>
  </div>
);

export default function GroupsPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "" });

  // tabs: 'all' | 'mine' (persist across refresh)
  const [tab, setTab] = useState(() => localStorage.getItem("groups:tab") || "all");

  // search
  const [q, setQ] = useState(localStorage.getItem("groups:q") || "");
  const debounceRef = useRef();

  // auth headers
  const auth = useMemo(
    () => (user ? { headers: { Authorization: `Bearer ${user.token}` } } : null),
    [user]
  );

  const applyTab = (newTab) => {
    setTab(newTab);
    localStorage.setItem("groups:tab", newTab);
  };

  const onSearch = (val) => {
    setQ(val);
    localStorage.setItem("groups:q", val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchGroups, 400);
  };

  const fetchGroups = async () => {
    if (!auth) {
      setGroups([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const params = {
        ...(q ? { q } : {}),
        ...(tab === "mine" ? { onlyJoined: true } : {}),
      };
      const { data } = await axios.get(`${API_URL}/api/groups`, {
        ...auth,
        params,
      });
      setGroups(data || []);
    } catch {
      toast.error("Could not load groups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleCreate = async () => {
    if (!auth) return toast.error("Please log in first.");
    if (!form.name.trim()) return toast.error("Give your group a name.");
    try {
      setCreating(true);
      const { data } = await axios.post(`${API_URL}/api/groups`, form, auth);
      toast.success("Group created!");
      setForm({ name: "", description: "", category: "" });
      setGroups((g) => [data, ...g]);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create group.");
    } finally {
      setCreating(false);
    }
  };

  const join = async (g) => {
    if (!auth) return toast.error("Please log in first.");
    try {
      await axios.post(`${API_URL}/api/groups/${g._id}/join`, {}, auth);
      toast.success(`Joined ${g.name}`);
      // update local state
      setGroups((curr) =>
        curr.map((x) =>
          x._id === g._id ? { ...x, members: [...(x.members || []), user._id] } : x
        )
      );
      navigate(`/groups/${g._id}`); // 🚀 redirect straight into chat
    } catch {
      toast.error("Could not join group.");
    }
  };

  const leave = async (g) => {
    if (!auth) return toast.error("Please log in first.");
    try {
      await axios.post(`${API_URL}/api/groups/${g._id}/leave`, {}, auth);
      toast("Left group", { icon: "👋" });
      setGroups((curr) =>
        curr.map((x) =>
          x._id === g._id
            ? { ...x, members: (x.members || []).filter((id) => (id._id || id) !== user._id) }
            : x
        )
      );
    } catch {
      toast.error("Could not leave group.");
    }
  };

  const isMember = (g) =>
    !!(g.members || []).some((id) => (id._id || id) === user?._id);

  return (
    <div className="bg-gray-50 pb-16">
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-secondary">Groups</h1>
          <p className="mt-2 text-sm text-muted">
            Join topic-based communities and coordinate faster.
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => applyTab("all")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              tab === "all"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
            }`}
          >
            All Groups
          </button>
          <button
            onClick={() => applyTab("mine")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              tab === "mine"
                ? "bg-primary text-white"
                : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
            }`}
          >
            My Groups
          </button>
        </div>

        {/* Search */}
        <div className="mx-auto mt-8 max-w-4xl">
          <div className="flex items-center gap-3 rounded-2xl border border-indigo-200/60 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500">
            <MagnifyingGlassIcon className="h-5 w-5 text-indigo-500/80" />
            <input
              value={q}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search groups…"
              className="flex-1 bg-white text-sm text-gray-900 placeholder-gray-400 outline-none"
            />
            <button
              title="Filters (coming soon)"
              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100"
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Create group */}
        <div className="mx-auto mt-8 max-w-5xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2 font-semibold text-secondary">
                <PlusCircleIcon className="h-5 w-5 text-primary" />
                Create a group
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Group name"
                />
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Category (e.g., Education)"
                />
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="md:col-span-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Short description"
                />
              </div>
            </div>
            <div className="pt-2 md:pt-0">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-hover disabled:opacity-50"
              >
                {creating ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="mx-auto mt-8 max-w-5xl space-y-4">
          {loading ? (
            <>
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </>
          ) : groups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-indigo-50 ring-1 ring-indigo-100" />
              <h3 className="text-lg font-semibold text-secondary">No groups yet</h3>
              <p className="mt-1 text-sm text-muted">
                Be the first to create one and invite others!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {groups.map((g) => (
                <GroupCard
                  key={g._id}
                  group={g}
                  isMember={isMember(g)}
                  onJoin={join}
                  onLeave={leave}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
