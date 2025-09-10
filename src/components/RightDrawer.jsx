import { XMarkIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import StatusPill from "./StatusPill";

export default function RightDrawer({
  open, onClose,
  group, onPledgeToggle, isPledged, busyPledge
}) {
  if (!open) return null;
  const members = group?.members || [];
  const pledges = group?.pledgedHelpers || [];
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-[360px] max-w-[86vw] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-base font-bold">Group Details</h3>
          <button onClick={onClose} className="rounded p-2 hover:bg-gray-100">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-4">
          <div>
            <div className="text-sm text-gray-500">Status</div>
            <div className="mt-2"><StatusPill value={group?.status} /></div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Helpers</h4>
              <button
                onClick={onPledgeToggle}
                disabled={busyPledge}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${isPledged ? "bg-gray-100 text-gray-800" : "bg-primary text-white"}`}
              >
                <UserPlusIcon className="h-4 w-4" />
                {isPledged ? "Unpledge" : "Pledge to help"}
              </button>
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {pledges.length === 0 ? (
                <li className="text-gray-500">No pledges yet</li>
              ) : (
                pledges.map((p) => (
                  <li key={p._id} className="truncate">{p.name}</li>
                ))
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold">Members ({members.length})</h4>
            <ul className="mt-2 space-y-1 text-sm max-h-[30vh] overflow-auto pr-1">
              {members.map((m) => <li key={m._id || m} className="truncate">{m.name || m}</li>)}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
