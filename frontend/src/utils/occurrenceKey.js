import { normalizeTimeHHMM } from "./localDateTime.js";

export function buildOccurrenceKey(sessionId, date, startTime) {
  const normalizedStart = normalizeTimeHHMM(startTime) ?? String(startTime ?? "").trim();
  return `${String(sessionId)}|${String(date)}|${normalizedStart}`;
}
