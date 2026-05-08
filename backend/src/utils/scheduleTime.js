/**
 * Normalize schedule / time strings to HH:mm for comparison and storage.
 * Accepts "9:00", "09:00", "09:00:00", trims whitespace.
 */
export function normalizeScheduleTime(value) {
  const s = String(value ?? "").trim();
  if (!s) return null;
  const parts = s.split(":");
  if (parts.length < 2) return null;
  const h = Number(parts[0]);
  const min = Number(parts[1]);
  if (!Number.isFinite(h) || !Number.isFinite(min) || h < 0 || h > 23 || min < 0 || min > 59) {
    return null;
  }
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export function parseTimeToMinutes(value) {
  const n = normalizeScheduleTime(value);
  if (!n) return null;
  const [h, m] = n.split(":").map(Number);
  return h * 60 + m;
}
