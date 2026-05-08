import { parseTimeToMinutes } from "./localDateTime.js";

const CAIRO_TIMEZONE = "Africa/Cairo";
const WEEK_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getCairoNowParts(now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: CAIRO_TIMEZONE,
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const pick = (type) => parts.find((item) => item.type === type)?.value ?? "";
  return {
    day: pick("weekday"),
    year: Number(pick("year")),
    month: Number(pick("month")),
    date: Number(pick("day")),
    minutesOfDay: Number(pick("hour")) * 60 + Number(pick("minute")),
  };
}

function getDayByOffset(day, offset) {
  const idx = WEEK_DAYS.indexOf(day);
  if (idx < 0) return null;
  return WEEK_DAYS[(idx + offset + 7) % 7];
}

export function getCairoDateOnly(now = new Date()) {
  const parts = getCairoNowParts(now);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.date).padStart(2, "0")}`;
}

export function isSessionActive(slot, now = new Date()) {
  if (!slot) return false;
  const cairoNow = getCairoNowParts(now);
  const start = parseTimeToMinutes(slot.startTime);
  const end = parseTimeToMinutes(slot.endTime);
  if (start === null || end === null || start === end) return false;

  const slotDay = String(slot.day ?? "");
  if (end > start) {
    return slotDay === cairoNow.day && cairoNow.minutesOfDay >= start && cairoNow.minutesOfDay < end;
  }

  const nextDay = getDayByOffset(slotDay, 1);
  const sameDayActive = slotDay === cairoNow.day && cairoNow.minutesOfDay >= start;
  const nextDayActive = nextDay === cairoNow.day && cairoNow.minutesOfDay < end;
  return sameDayActive || nextDayActive;
}

export function getActiveSessions(sessions, now = new Date()) {
  return (Array.isArray(sessions) ? sessions : []).flatMap((session) => {
    const schedule = Array.isArray(session?.schedule) ? session.schedule : [];
    const activeSlot = schedule.find((slot) => isSessionActive(slot, now));
    return activeSlot ? [{ ...session, currentSlot: activeSlot }] : [];
  });
}

export function getSessionLiveBadge(slot, now = new Date()) {
  const cairoNow = getCairoNowParts(now);
  return getSessionLiveBadgeFromContext(slot, cairoNow);
}

export function getSessionLiveBadgeFromContext(slot, cairoNow) {
  if (!slot || !cairoNow) return "";
  const start = parseTimeToMinutes(slot?.startTime);
  const end = parseTimeToMinutes(slot?.endTime);
  if (start === null || end === null || start === end) return "Now";

  const slotDay = String(slot?.day ?? "");
  const nextDay = getDayByOffset(slotDay, 1);
  const isActiveNow =
    end > start
      ? slotDay === cairoNow.day && cairoNow.minutesOfDay >= start && cairoNow.minutesOfDay < end
      : (slotDay === cairoNow.day && cairoNow.minutesOfDay >= start) ||
        (nextDay === cairoNow.day && cairoNow.minutesOfDay < end);
  if (!isActiveNow) return "";

  if (cairoNow.minutesOfDay === start && slotDay === cairoNow.day) {
    return "Now";
  }

  let remainingMinutes = 0;
  if (end > start) {
    remainingMinutes = end - cairoNow.minutesOfDay;
  } else {
    if (slotDay === cairoNow.day) {
      remainingMinutes = (1440 - cairoNow.minutesOfDay) + end;
    } else if (nextDay === cairoNow.day) {
      remainingMinutes = end - cairoNow.minutesOfDay;
    }
  }

  if (!Number.isFinite(remainingMinutes) || remainingMinutes <= 0) return "Now";
  return `Ends in ${remainingMinutes} min`;
}
