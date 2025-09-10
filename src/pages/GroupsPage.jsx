import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusCircleIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import GroupCard from "../components/GroupCard";
import { AuthContext } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Skeleton = () => (
  <div className="rounded-3xl border border-gray-100 bg-white/75 p-6 shadow-sm">
    <div className="flex items-start justify-between">
      <div className="flex w-full items-start gap-4">
        <div className="h-10 w-10 animate-pulse rounded-2xl bg-gray-200" />
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
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "" });

  const [tab, setTab] = useState(() => localStorage.getItem("groups:tab") || "all");
  const [q, setQ] = useState(localStorage.getItem("groups:q") || "");
  const [category, setCategory] = useState("All");
  const debounceRef = useRef();

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
    debounceRef.current = setTimeout(fetchGroups, 350);
  };

  async function fetchRecommended() {
    try {
      const { data } = await axios.get(`${API_URL}/api/groups/recommended`, auth);
      setRecommended(Array.isArray(data) ? data : []);
    } catch {/* silent */}
  }

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
        ...(category && category !== "All" ? { category } : {}),
      };
      const { data } = await axios.get(`${API_URL}/api/groups`, { ...auth, params });
      setGroups(data || []);
    } catch {
      toast.error("Could not load groups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommended();
  }, []); // once

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, category]);

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
      setGroups((curr) =>
        curr.some((x) => x._id === g._id) ? curr : [g, ...curr]
      );
      navigate(`/groups/${g._id}`);
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

  const categories = ["All", "Environment", "Technology", "Community", "Education", "Health"];

  return (
    <div className="relative bg-gradient-to-br from-gray-50 via-white to-violet-50/40 pb-16">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(60%_60%_at_50%_0%,rgba(124,58,237,0.06),transparent)]" />
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Groups</h1>
          <p className="mt-2 text-sm text-gray-600">
            Join topic-based communities and coordinate faster.
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => applyTab("all")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              tab === "all"
                ? "bg-gradient-to-r from-primary to-fuchsia-600 text-white"
                : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
            }`}
          >
            All Groups
          </button>
          <button
            onClick={() => applyTab("mine")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              tab === "mine"
                ? "bg-gradient-to-r from-primary to-fuchsia-600 text-white"
                : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
            }`}
          >
            My Groups
          </button>

          {/* Category chips */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition
                 ${category === c ? "bg-violet-100 text-violet-800 ring-1 ring-violet-200" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mx-auto mt-8 max-w-4xl">
          <div className="flex items-center gap-3 rounded-2xl border border-indigo-200/60 bg-white/85 px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400/40">
            <MagnifyingGlassIcon className="h-5 w-5 text-indigo-500/80" />
            <input
              value={q}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search groups…"
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
            />
            <button title="Filters (coming soon)" className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100">
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Recommended */}
        {recommended.length > 0 && (
          <div className="mx-auto mt-10 max-w-5xl">
            <div className="mb-3 flex items-center gap-2">
              <FireIcon className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold text-gray-900">Suggested for you</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {recommended.map((g) => (
                <GroupCard
                  key={g._id}
                  group={g}
                  isMember={isMember(g)}
                  onJoin={join}
                  onLeave={leave}
                />
              ))}
            </div>
          </div>
        )}

        {/* Create group */}
        <div className="mx-auto mt-10 max-w-5xl rounded-3xl border border-gray-100 bg-white/85 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
                <PlusCircleIcon className="h-5 w-5 text-primary" />
                Create a group
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Group name"
                />
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Category (e.g., Education)"
                />
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="md:col-span-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Short description"
                />
              </div>
            </div>
            <div className="pt-2 md:pt-0">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-50"
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
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white/85 p-12 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">No groups yet</h3>
              <p className="mt-1 text-sm text-gray-600">
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
