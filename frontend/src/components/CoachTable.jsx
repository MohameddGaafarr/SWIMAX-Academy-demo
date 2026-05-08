import { Link } from "react-router-dom";
import { formatDuration, hoursToMinutes } from "../utils/formatDuration.js";

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

        {active && (
          <span className="text-xs opacity-90">
            {order === "asc" ? "↑" : "↓"}
          </span>
        )}
      </button>
    </th>
  );
}

export default function CoachTable({
  coaches,
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
              className="grid animate-pulse grid-cols-[2fr,1fr,1fr,1.2fr] gap-3 rounded-xl bg-slate-950/50 p-4"
            >
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

  if (!coaches.length) {
    return (
      <div className="rounded-2xl border border-dashed border-sky-500/20 bg-slate-900/40 p-12 text-center shadow-inner">
        <p className="text-base font-medium text-slate-100">
          No coaches yet.
        </p>

        <p className="mt-2 text-sm text-slate-500">
          {emptyHint || "Add your first coach to get started."}
        </p>
      </div>
    );
  }

  return (
    <div className="table-shell">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700/50 text-left text-sm">

          {/* 🔥 HEADER */}
          <thead className="bg-slate-900/70">
            <tr>
              <SortHeader
                label="Coach"
                field="name"
                sortBy={sortBy}
                order={order}
                onSort={onSortColumn}
              />

              <SortHeader
                label="Hours"
                field="totalWorkingHours"
                sortBy={sortBy}
                order={order}
                onSort={onSortColumn}
              />

              <SortHeader
                label="Created"
                field="createdAt"
                sortBy={sortBy}
                order={order}
                onSort={onSortColumn}
              />

              <th className="px-4 py-4 text-center font-medium text-slate-400">
                Actions
              </th>
            </tr>
          </thead>

          {/* 🔥 BODY */}
          <tbody className="divide-y divide-slate-700/40">
            {coaches.map((c) => {
              const imageUrl = c.image || null;
              const firstLetter =
                c.name?.charAt(0)?.toUpperCase() || "?";

              return (
                <tr
                  key={c._id}
                  className="table-row-hover odd:bg-slate-900/15 even:bg-transparent"
                >

                  {/* 👤 Coach */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">

                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt=""
                          className="h-10 w-10 rounded-xl object-cover ring-1 ring-sky-500/20"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-base font-bold text-cyan-400/40 ring-1 ring-sky-500/20">
                          {firstLetter}
                        </div>
                      )}

                      <div>
                        <p className="font-medium text-slate-100">
                          {c.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          Swimming Coach
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* ⏱ Hours */}
                  <td className="px-5 py-4 text-slate-300">
                    {formatDuration(
                      hoursToMinutes(c.totalWorkingHours)
                    )}
                  </td>

                  {/* 📅 Created */}
                  <td className="px-5 py-4 text-slate-500">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString()
                      : "—"}
                  </td>

                  {/* ⚙️ Actions */}
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap justify-end gap-2">

                      <Link
                        to={`/coaches/${c._id}`}
                        className="rounded-xl border border-sky-500/35 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-200 transition duration-200 hover:scale-[1.02] hover:border-sky-400/60 hover:bg-sky-500/20"
                      >
                        Profile
                      </Link>

                      <button
                        type="button"
                        onClick={() => onEdit(c)}
                        className="rounded-xl border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 transition duration-200 hover:border-slate-500 hover:bg-slate-800/80"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(c)}
                        className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-1.5 text-xs font-medium text-red-200 transition duration-200 hover:bg-red-950/60"
                      >
                        Delete
                      </button>

                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}