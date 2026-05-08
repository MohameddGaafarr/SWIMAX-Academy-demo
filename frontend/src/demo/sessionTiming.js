import { parseTimeToMinutes } from "../utils/localDateTime.js";

export const SESSION_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const CAIRO_TZ = "Africa/Cairo";

const CAIRO_PARTS_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: CAIRO_TZ,
  weekday: "long",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function getDayByOffset(day, offset) {
  const idx = SESSION_DAYS.indexOf(day);
  if (idx < 0) return null;
  return SESSION_DAYS[(idx + offset + 7) % 7];
}

/** Mirrors backend getCairoContext for session “now” cards. */
export function getCairoContext(now = new Date()) {
  const parts = CAIRO_PARTS_FORMATTER.formatToParts(now);
  const pick = (type) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = pick("weekday");
  const hour = Number(pick("hour"));
  const minute = Number(pick("minute"));
  const day = Number(pick("day"));
  const month = Number(pick("month"));
  const year = Number(pick("year"));
  const dayIndex = SESSION_DAYS.indexOf(weekday);
  return {
    nowMs: now.getTime(),
    weekday,
    dayIndex: dayIndex === -1 ? 0 : dayIndex,
    minutesOfDay: hour * 60 + minute,
    dateOnly: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  };
}

function isSessionActive(slot, cairoNow) {
  if (!slot) return false;
  const start = parseTimeToMinutes(slot.startTime);
  const end = parseTimeToMinutes(slot.endTime);
  if (start === null || end === null || start === end) return false;

  if (end > start) {
    return slot.day === cairoNow.weekday && cairoNow.minutesOfDay >= start && cairoNow.minutesOfDay < end;
  }

  const nextDay = getDayByOffset(slot.day, 1);
  const sameDayActive = slot.day === cairoNow.weekday && cairoNow.minutesOfDay >= start;
  const nextDayActive = nextDay === cairoNow.weekday && cairoNow.minutesOfDay < end;
  return sameDayActive || nextDayActive;
}

export function findAllCurrentSessions(sessions, now = new Date()) {
  const cairoNow = getCairoContext(now);
  const results = [];

  for (const session of sessions) {
    const slots = Array.isArray(session.schedule) ? session.schedule : [];
    for (const slot of slots) {
      if (isSessionActive(slot, cairoNow)) {
        results.push({
          ...session,
          currentSlot: slot,
        });
      }
    }
  }

  return results;
}

function formatCairoDateOnly(date) {
  return getCairoContext(date).dateOnly;
}

function computeNextSlotStart(slot, now = new Date()) {
  const cairoNow = getCairoContext(now);
  const startM = parseTimeToMinutes(slot.startTime);
  const endM = parseTimeToMinutes(slot.endTime);
  if (startM === null || endM === null || endM <= startM) return null;

  const targetDow = SESSION_DAYS.indexOf(slot.day);
  if (targetDow === -1) return null;

  const dayDiff = (targetDow - cairoNow.dayIndex + 7) % 7;
  let deltaMinutes = dayDiff * 1440 + (startM - cairoNow.minutesOfDay);
  if (deltaMinutes <= 0) {
    deltaMinutes += 7 * 1440;
  }

  const slotDate = new Date(cairoNow.nowMs + deltaMinutes * 60 * 1000);

  return {
    instant: cairoNow.nowMs + deltaMinutes * 60 * 1000,
    dateStr: formatCairoDateOnly(slotDate),
    slot,
  };
}

export function findNextUpcomingSession(sessions, now = new Date()) {
  let best = null;

  for (const session of sessions) {
    const slots = Array.isArray(session.schedule) ? session.schedule : [];
    for (const slot of slots) {
      const next = computeNextSlotStart(slot, now);
      if (!next) continue;
      if (!best || next.instant < best.instant) {
        best = { ...next, session };
      }
    }
  }

  if (!best) return null;

  return {
    ...best.session,
    upcomingSlot: {
      day: best.slot.day,
      startTime: best.slot.startTime,
      endTime: best.slot.endTime,
      date: best.dateStr,
    },
  };
}

export function getCurrentSessionsApiPayload(populatedSessions, now = new Date()) {
  const cairoNow = getCairoContext(now);
  const previousDay = getDayByOffset(cairoNow.weekday, -1);
  const sessions = populatedSessions.filter((s) =>
    (Array.isArray(s.schedule) ? s.schedule : []).some((slot) =>
      [cairoNow.weekday, previousDay].includes(slot.day),
    ),
  );

  const current = findAllCurrentSessions(sessions, now);

  return {
    current,
    now: {
      weekday: cairoNow.weekday,
      minutesOfDay: cairoNow.minutesOfDay,
      dateOnly: cairoNow.dateOnly,
      timestampMs: Date.now(),
    },
  };
}

export function getUpcomingSessionApiPayload(populatedSessions, now = new Date()) {
  const currentSessions = findAllCurrentSessions(populatedSessions, now);
  const currentIds = new Set(currentSessions.map((s) => String(s._id)));
  const excluding = populatedSessions.filter((s) => !currentIds.has(String(s._id)));
  const upcoming = findNextUpcomingSession(excluding, now);
  return { upcoming };
}
