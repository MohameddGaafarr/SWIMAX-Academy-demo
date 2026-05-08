export function formatDuration(minutesInput) {
  const total = Number(minutesInput);
  if (!Number.isFinite(total) || total <= 0) return "0 min";

  const minutes = Math.round(total);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} ${h === 1 ? "hour" : "hours"}`;
  return `${h} ${h === 1 ? "hour" : "hours"} ${m} min`;
}

export function hoursToMinutes(hoursInput) {
  const hours = Number(hoursInput);
  if (!Number.isFinite(hours) || hours <= 0) return 0;
  return Math.round(hours * 60);
}
