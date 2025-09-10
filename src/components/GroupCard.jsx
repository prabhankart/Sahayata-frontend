// src/components/GroupCard.jsx
import { Link } from "react-router-dom";
import {
  UsersIcon,
  PlusIcon,
  ArrowsRightLeftIcon,
  ArrowRightIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

const statusStyle = (s = "Open") => {
  switch (s) {
    case "Resolved":
      return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
    case "In Progress":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    case "On Hold":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    default:
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"; // Open
  }
};

const GroupCard = ({ group, isMember, onJoin, onLeave, processing }) => {
  const memberCount = (group.members || []).length;
  const pledgeCount = (group.pledgedHelpers || []).length;
  const status = group.status || "Open";

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white/85 p-6 shadow-[0_10px_30px_-12px_rgba(24,24,27,0.12)] backdrop-blur supports-[backdrop-filter]:bg-white/70 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_24px_60px_-20px_rgba(124,58,237,0.25)]">
      {/* subtle glow */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(60%_60%_at_50%_0%,rgba(124,58,237,0.06),transparent)]" />

      <div className="relative flex items-start justify-between gap-4">
        {/* Left: meta */}
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 ring-1 ring-white/70">
              <UsersIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="truncate text-xl font-extrabold text-gray-900">
              {group.name}
            </h3>
          </div>

          {group.problemTitle && (
            <div className="mt-1 truncate text-[13px] font-semibold text-gray-700">
              {group.problemTitle}
            </div>
          )}

          <p className="mt-2 line-clamp-2 text-sm text-gray-600">
            {group.description || "—"}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
              {group.category || "General"}
            </span>
            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-primary">
              {memberCount} member{memberCount === 1 ? "" : "s"}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(status)}`}>
              {status}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-2.5 py-1 text-pink-700 ring-1 ring-pink-200">
              <HeartIcon className="h-4 w-4" />
              {pledgeCount}
            </span>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex flex-col items-end gap-2">
          <Link
            to={`/groups/${group._id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 transition hover:bg-white"
            title="Open group"
          >
            Open <ArrowRightIcon className="h-4 w-4" />
          </Link>

          {isMember ? (
            <button
              onClick={() => onLeave(group)}
              disabled={processing}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-gray-200 disabled:opacity-50"
            >
              <ArrowsRightLeftIcon className="h-4 w-4" />
              Leave
            </button>
          ) : (
            <button
              onClick={() => onJoin(group)}
              disabled={processing}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
            >
              <PlusIcon className="h-4 w-4" />
              Join
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
