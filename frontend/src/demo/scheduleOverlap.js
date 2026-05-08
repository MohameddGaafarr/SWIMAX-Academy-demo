import { parseTimeToMinutes } from "../utils/localDateTime.js";
import { getDayByOffset, SESSION_DAYS } from "./sessionTiming.js";

function isTimeOverlap(newStartM, newEndM, existingStartM, existingEndM) {
  return newStartM < existingEndM && newEndM > existingStartM;
}

export function expandSlotIntoDailyWindows(slot) {
  const start = parseTimeToMinutes(slot.startTime);
  const end = parseTimeToMinutes(slot.endTime);
  if (start === null || end === null || start === end) return [];

  if (end > start) {
    return [{ day: slot.day, start, end }];
  }

  const nextDay = getDayByOffset(slot.day, 1);
  return [
    { day: slot.day, start, end: 1440 },
    { day: nextDay, start: 0, end },
  ];
}

export function schedulesOverlap(slotA, slotB) {
  const firstWindows = expandSlotIntoDailyWindows(slotA);
  const secondWindows = expandSlotIntoDailyWindows(slotB);
  for (const first of firstWindows) {
    for (const second of secondWindows) {
      if (first.day !== second.day) continue;
      if (isTimeOverlap(first.start, first.end, second.start, second.end)) {
        return true;
      }
    }
  }
  return false;
}

export function validateScheduleSlots(schedule) {
  if (!Array.isArray(schedule) || schedule.length === 0) {
    return { error: "At least one schedule slot is required" };
  }
  const normalized = [];
  for (const slot of schedule) {
    const day = String(slot.day ?? "").trim();
    if (!SESSION_DAYS.includes(day)) {
      return { error: `Invalid day "${day}"` };
    }
    const startTime = String(slot.startTime ?? "").trim();
    const endTime = String(slot.endTime ?? "").trim();
    const startM = parseTimeToMinutes(startTime);
    const endM = parseTimeToMinutes(endTime);
    if (startM === null || endM === null) {
      return { error: "startTime and endTime must be valid HH:mm values" };
    }
    if (endM === startM) {
      return { error: "Each slot must have a non-zero duration" };
    }
    normalized.push({ day, startTime, endTime });
  }

  for (let i = 0; i < normalized.length; i += 1) {
    for (let j = i + 1; j < normalized.length; j += 1) {
      if (schedulesOverlap(normalized[i], normalized[j])) {
        return { error: "A session cannot contain overlapping slots on the same day" };
      }
    }
  }

  return { slots: normalized };
}

export function coachHasScheduleConflict(store, coachId, schedule, excludeSessionId = null) {
  const existingSessions = store.sessions.filter(
    (s) => s.coachId === coachId && String(s._id) !== String(excludeSessionId ?? ""),
  );

  for (const incomingSlot of schedule) {
    for (const existing of existingSessions) {
      const existingSlots = Array.isArray(existing.schedule) ? existing.schedule : [];
      for (const existingSlot of existingSlots) {
        if (schedulesOverlap(incomingSlot, existingSlot)) {
          return { error: "Coach already has a session during this time" };
        }
      }
    }
  }

  return { ok: true };
}
