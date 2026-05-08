import { Link, useParams } from "react-router-dom";
import { useDemoData } from "../context/DemoDataContext.jsx";
import { formatDuration } from "../utils/formatDuration.js";

function coachName(session) {
  const coach = session?.coachId;
  if (coach && typeof coach === "object" && coach.name) return coach.name;
  return "—";
}

function durationFromTimeRange(startTime, endTime) {
  const [startH, startM] = String(startTime ?? "").split(":").map(Number);
  const [endH, endM] = String(endTime ?? "").split(":").map(Number);
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return "—";
  return formatDuration(end - start);
}

export default function SessionDetailsPage() {
  const { id } = useParams();
  const demo = useDemoData();
  const session = id ? demo.getSessionById(id) : null;

  if (!session) {
    return (
      <div className="space-y-6">
        <Link to="/sessions" className="link-back">
          ← Back to sessions
        </Link>
        <div className="error-box">Session not found.</div>
      </div>
    );
  }

  const trainees = Array.isArray(session.trainees) ? session.trainees : [];
  const schedule = Array.isArray(session.schedule) ? session.schedule : [];

  return (
    <div className="animate-fade-in space-y-4 md:space-y-5">
      <div>
        <Link to="/sessions" className="link-back">
          ← Back to sessions
        </Link>
      </div>

      <div className="card-float grid gap-4 p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400/90">Coach</p>
          <p className="mt-2 text-xl font-semibold text-white md:text-2xl">{coachName(session)}</p>
        </div>

        <div className="sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Weekly slots</p>
          {schedule.length ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {schedule.map((slot, index) => (
                <div
                  key={`${slot.day}-${slot.startTime}-${slot.endTime}-${index}`}
                  className="rounded-2xl border border-slate-700/50 bg-slate-950/50 p-4 transition hover:border-sky-500/25"
                >
                  <p className="font-semibold text-sky-200">{slot.day}</p>
                  <p className="mt-2 text-sm text-slate-300">
                    {slot.startTime} – {slot.endTime}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Duration · {durationFromTimeRange(slot.startTime, slot.endTime)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-slate-400">No schedule defined.</p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Created</p>
          <p className="mt-2 text-slate-300">
            {session.createdAt ? new Date(session.createdAt).toLocaleString() : "—"}
          </p>
        </div>

        <div className="sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Trainees</p>
          {trainees.length ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {trainees.map((trainee) => (
                <div
                  key={trainee._id}
                  className="rounded-2xl border border-slate-700/50 bg-slate-950/40 px-4 py-3.5 transition hover:border-cyan-500/20"
                >
                  <p className="font-medium text-white">{trainee.name}</p>
                  <p className="mt-1 text-sm text-cyan-200/80">{trainee.level}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-slate-400">No trainees assigned.</p>
          )}
        </div>
      </div>
    </div>
  );
}
