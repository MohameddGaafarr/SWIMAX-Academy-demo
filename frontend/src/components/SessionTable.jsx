import { Link } from "react-router-dom";

function SortHeader({ label, field, sortBy, order, onSort }) {
  const active = sortBy === field;
  return (
    <th className="px-4 py-4 font-medium text-slate-400">
      <button
        type="button"
        onClick={() => onSort?.(field)}
        className={`inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-left transition duration-200 hover:bg-sky-500/10 hover:text-slate-100 ${
          active ? "text-sky-300" : ""
        }`}
      >
        <span>{label}</span>
        {active && <span className="text-xs opacity-90">{order === "asc" ? "↑" : "↓"}</span>}
      </button>
    </th>
  );
}

function coachName(session) {
  const coach = session.coachId;
  if (coach && typeof coach === "object" && coach.name) return coach.name;
  return "—";
}

function traineeCountSummary(session) {
  const trainees = Array.isArray(session.trainees) ? session.trainees : [];
  const count = trainees.length;
  if (count === 0) return "No trainees";
  if (count === 1) return "1 trainee";
  return `${count} trainees`;
}

function scheduleSummary(session) {
  const schedule = Array.isArray(session.schedule) ? session.schedule : [];
  if (!schedule.length) return [];
  return schedule.map((slot) => {
    const shortDay = String(slot.day ?? "").slice(0, 3);
    return `${shortDay} ${slot.startTime}-${slot.endTime}`;
  });
}

export default function SessionTable({
  sessions,
  loading,
  onEdit,
  onDelete,
  sortBy,
  order,
  onSortColumn,
  emptyHint,
}) {
  if (loading) {
    return (
      <div className="table-shell p-4">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="grid animate-pulse grid-cols-[1fr,1.5fr,1.2fr,0.8fr,0.9fr] gap-3 rounded-xl bg-slate-950/50 p-4"
            >
              <div className="h-4 rounded-lg bg-slate-800" />
              <div className="h-4 rounded-lg bg-slate-800" />
              <div className="h-4 rounded-lg bg-slate-800" />
              <div className="h-4 rounded-lg bg-slate-800" />
              <div className="h-4 rounded-lg bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="rounded-2xl border border-dashed border-sky-500/20 bg-slate-900/40 p-12 text-center shadow-inner">
        <p className="text-base font-medium text-slate-100">No sessions yet.</p>
        <p className="mt-2 text-sm text-slate-500">{emptyHint || "Create your first session to start scheduling."}</p>
      </div>
    );
  }

  return (
    <div className="table-shell">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700/50 text-left text-sm">
          <thead className="bg-slate-900/70">
            <tr>
              <th className="px-4 py-4 font-medium text-slate-400">Coach</th>
              <th className="px-4 py-4 font-medium text-slate-400">Schedule</th>
              <th className="hidden px-4 py-4 font-medium text-slate-400 md:table-cell">No. of trainees</th>
              <SortHeader
                label="Created"
                field="createdAt"
                sortBy={sortBy}
                order={order}
                onSort={onSortColumn}
              />
              <th className="px-4 py-4 text-center font-medium text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {sessions.map((session) => (
              <tr key={session._id} className="table-row-hover odd:bg-slate-900/15 even:bg-transparent">
                <td className="px-5 py-4 text-slate-200">{coachName(session)}</td>
                <td className="px-5 py-4 text-slate-300">
                  {scheduleSummary(session).length ? (
                    <div className="space-y-1">
                      {scheduleSummary(session).map((slot, index) => (
                        <p key={`${session._id}-slot-${index}`}>{slot}</p>
                      ))}
                    </div>
                  ) : (
                    "No schedule"
                  )}
                </td>
                <td className="hidden max-w-xs truncate px-5 py-4 text-slate-400 md:table-cell">
                  {traineeCountSummary(session)}
                </td>
                <td className="px-5 py-4 text-slate-500">
                  {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link
                      to={`/sessions/${session._id}`}
                      className="rounded-xl border border-sky-500/35 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-200 transition duration-200 hover:scale-[1.02] hover:border-sky-400/60 hover:bg-sky-500/20"
                    >
                      Details
                    </Link>
                    <button
                      type="button"
                      onClick={() => onEdit(session)}
                      className="rounded-xl border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 transition duration-200 hover:border-slate-500 hover:bg-slate-800/80"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(session)}
                      className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-1.5 text-xs font-medium text-red-200 transition duration-200 hover:bg-red-950/60"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
