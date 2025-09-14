// src/components/RightDrawer.jsx
import React, { memo, useMemo } from "react";
import {
  XMarkIcon,
  CheckBadgeIcon,
  UsersIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

function RightDrawerBase({
  open,
  onClose,
  group,
  onPledgeToggle,
  isPledged,
  busyPledge,
}) {
  if (!open) return null;

  const membersCount = group?.members?.length || 0;
  const pledgedCount = group?.pledgedHelpers?.length || 0;

  const canToggle = !!onPledgeToggle && !busyPledge;

  const statusColor = useMemo(() => {
    switch (group?.status) {
      case "Resolved":
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";
      case "In Progress":
        return "bg-amber-50 text-amber-700 ring-amber-200";
      case "On Hold":
        return "bg-rose-50 text-rose-700 ring-rose-200";
      default:
        return "bg-green-50 text-green-700 ring-green-200";
    }
  }, [group?.status]);

  return (
    <div className="fixed inset-0 z-40">
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl ring-1 ring-black/5 flex flex-col"
        aria-label="Group details"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <InformationCircleIcon className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900 truncate">
              {group?.name || "Group"}
            </h3>
          </div>
          <button
            className="rounded-full p-2 hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Status */}
          <section>
            <div className="text-sm font-semibold text-gray-800 mb-2">
              Status
            </div>
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusColor}`}
            >
              {group?.status || "Open"}
            </div>
          </section>

          {/* Pledge */}
          <section className="space-y-2">
            <div className="text-sm font-semibold text-gray-800">
              Helpers
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
                <UsersIcon className="h-4 w-4" />
                {membersCount} members
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200">
                <CheckBadgeIcon className="h-4 w-4" />
                {pledgedCount} pledged
              </div>
            </div>

            <button
              onClick={canToggle ? onPledgeToggle : undefined}
              disabled={!canToggle}
              className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition
                ${isPledged ? "bg-gray-100 text-gray-800" : "bg-primary text-white"}
                ${busyPledge ? "opacity-60 cursor-not-allowed" : "hover:opacity-95"}`}
            >
              <CheckBadgeIcon className="h-4 w-4" />
              {busyPledge
                ? "Working…"
                : isPledged
                ? "Unpledge"
                : "Pledge to help"}
            </button>
          </section>

          {/* Description */}
          {group?.description ? (
            <section>
              <div className="text-sm font-semibold text-gray-800 mb-1">
                Description
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {group.description}
              </p>
            </section>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

const RightDrawer = memo(RightDrawerBase);
export default RightDrawer;
