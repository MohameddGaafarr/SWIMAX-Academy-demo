import { useEffect, useMemo, useState } from "react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const empty = {
  coachId: "",
  traineeIds: [],
  schedule: [{ day: "Sunday", startTime: "", endTime: "" }],
};

export default function SessionForm({
  initialValues = empty,
  coaches = [],
  trainees = [],
  onSubmit,
  onCancel,
  submitLabel = "Save",
  submitting = false,
}) {
  const [coachId, setCoachId] = useState(initialValues.coachId ?? "");
  const [selectedTrainees, setSelectedTrainees] = useState(initialValues.traineeIds ?? []);
  const [schedule, setSchedule] = useState(initialValues.schedule ?? empty.schedule);

  useEffect(() => {
    setCoachId(initialValues.coachId ?? "");
    setSelectedTrainees(initialValues.traineeIds ?? []);
    setSchedule(
      Array.isArray(initialValues.schedule) && initialValues.schedule.length
        ? initialValues.schedule
        : empty.schedule,
    );
  }, [initialValues.coachId, initialValues.traineeIds, initialValues.schedule]);

  const selectedSet = useMemo(() => new Set(selectedTrainees), [selectedTrainees]);

  function handleTraineeToggle(traineeId) {
    setSelectedTrainees((current) =>
      current.includes(traineeId) ? current.filter((id) => id !== traineeId) : [...current, traineeId],
    );
  }

  function updateScheduleSlot(index, key, value) {
    setSchedule((current) =>
      current.map((slot, i) => (i === index ? { ...slot, [key]: value } : slot)),
    );
  }

  function addScheduleSlot() {
    setSchedule((current) => [...current, { day: "Sunday", startTime: "", endTime: "" }]);
  }

  function removeScheduleSlot(index) {
    setSchedule((current) => (current.length <= 1 ? current : current.filter((_, i) => i !== index)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await onSubmit({
      coachId,
      trainees: selectedTrainees,
      schedule,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        {/* Left: coach + schedule */}
        <div className="space-y-4">
          <div>
            <label htmlFor="session-coach" className="block text-sm font-medium text-slate-300">
              Coach
            </label>
            <select
              id="session-coach"
              required
              value={coachId}
              onChange={(e) => setCoachId(e.target.value)}
              className="input-field-select"
            >
              <option value="" disabled>
                Select a coach
              </option>
              {coaches.map((coach) => (
                <option key={coach._id} value={coach._id}>
                  {coach.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-sm font-medium text-slate-300">Recurring schedule</label>
              <button
                type="button"
                onClick={addScheduleSlot}
                className="btn-ghost rounded-xl px-3 py-1.5 text-xs"
              >
                + Add day
              </button>
            </div>
            {schedule.map((slot, index) => (
              <div
                key={`${index}-${slot.day}-${slot.startTime}-${slot.endTime}`}
                className="grid gap-2.5 rounded-2xl border border-sky-500/15 bg-slate-950/50 p-3.5 shadow-inner sm:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <select
                  value={slot.day}
                  onChange={(e) => updateScheduleSlot(index, "day", e.target.value)}
                  className="input-field-select !mt-0"
                >
                  {DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <div className="relative">
                  <input
                    type="time"
                    required
                    value={slot.startTime}
                    onChange={(e) => updateScheduleSlot(index, "startTime", e.target.value)}
                    aria-label="Start session"
                    title="Start session"
                    className="input-field !mt-0 pr-9 [color-scheme:dark]"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/80">
                    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                      <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M10 6.2v4.1l2.6 1.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="time"
                    required
                    value={slot.endTime}
                    onChange={(e) => updateScheduleSlot(index, "endTime", e.target.value)}
                    aria-label="End session"
                    title="End session"
                    className="input-field !mt-0 pr-9 [color-scheme:dark]"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/80">
                    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                      <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M10 6.2v4.1l2.6 1.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeScheduleSlot(index)}
                  disabled={schedule.length <= 1}
                  className="rounded-xl border border-slate-600 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: trainees */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="block text-sm font-medium text-slate-300">Trainees</label>
            <span className="text-xs text-slate-500">Unavailable = assigned to another group</span>
          </div>
          <div className="mt-2.5 max-h-64 overflow-y-auto rounded-2xl border border-slate-700/50 bg-slate-950/40 p-2.5">
            {trainees.length === 0 ? (
              <p className="text-sm text-slate-500">No trainees available yet.</p>
            ) : (
              <div className="space-y-2">
                {trainees.map((trainee) => {
                  const disabled = Boolean(trainee.unavailable && !selectedSet.has(trainee._id));
                  return (
                    <label
                      key={trainee._id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition duration-200 ${
                        disabled
                          ? "border-slate-800/80 bg-slate-900/30 opacity-60"
                          : "border-slate-700/60 bg-slate-900/50 hover:border-sky-500/25"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSet.has(trainee._id)}
                        disabled={disabled || submitting}
                        onChange={() => handleTraineeToggle(trainee._id)}
                        className="mt-1 rounded border-slate-600 text-sky-500 focus:ring-sky-500/40"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-slate-100">{trainee.name}</span>
                        <span className="block text-xs text-slate-400">
                          {trainee.level}
                          {disabled && trainee.sessionLabel ? ` · ${trainee.sessionLabel}` : ""}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 pb-14 md:pb-0 pt-1 md:flex-row md:flex-wrap md:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="btn-secondary w-full disabled:opacity-50 md:w-auto"
        >
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50 md:w-auto">
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
