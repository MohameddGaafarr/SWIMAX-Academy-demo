import { normalizeScheduleTime } from "./scheduleTime.js";

export function buildOccurrenceKey(sessionId, date, startTime) {
  const normalizedStart = normalizeScheduleTime(startTime) ?? String(startTime ?? "").trim();
  return `${String(sessionId)}|${String(date)}|${normalizedStart}`;
}
