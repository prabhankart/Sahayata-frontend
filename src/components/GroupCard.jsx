// src/components/GroupCard.jsx
import { Link } from "react-router-dom";
import { UsersIcon, PlusIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline";

const GroupCard = ({ group, isMember, onJoin, onLeave, processing }) => {
  const memberCount = (group.members || []).length;

  return (
    <div className="flex items-start justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-[1px] hover:shadow-lg">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <UsersIcon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="truncate text-xl font-bold text-secondary">{group.name}</h3>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
          {group.description || "—"}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
            {group.category || "General"}
          </span>
          <span className="rounded-full bg-purple-50 px-2.5 py-1 text-primary">
            {memberCount} member{memberCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <Link
          to={`/groups/${group._id}`}
          className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset ${
            isMember
              ? "bg-indigo-50 text-indigo-700 ring-indigo-200 hover:bg-indigo-100"
              : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50"
          }`}
          title={isMember ? "Open group" : "Preview group"}
        >
          Open
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
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-50"
          >
            <PlusIcon className="h-4 w-4" />
            Join
          </button>
        )}
      </div>
    </div>
  );
};

export default GroupCard;
