import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { demoAttendance } from "../demo/attendance.js";
import { demoCoaches } from "../demo/coaches.js";
import { demoSessions } from "../demo/sessions.js";
import { demoTrainees } from "../demo/trainees.js";
import {
  coachHasScheduleConflict,
  validateScheduleSlots,
} from "../demo/scheduleOverlap.js";
import {
  getCurrentSessionsApiPayload,
  getUpcomingSessionApiPayload,
} from "../demo/sessionTiming.js";
import { buildOccurrenceKey } from "../utils/occurrenceKey.js";
import { normalizeTimeHHMM, parseTimeToMinutes } from "../utils/localDateTime.js";

const DemoDataContext = createContext(null);

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createFreshStore() {
  return {
    coaches: deepClone(demoCoaches),
    trainees: deepClone(demoTrainees),
    sessions: deepClone(demoSessions),
    attendanceRecords: deepClone(demoAttendance),
  };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function parseCoachFormData(formData) {
  const imageFile = formData.get("image");
  let image = "";
  if (imageFile instanceof File && imageFile.size > 0) {
    image = await readFileAsDataUrl(imageFile);
  }
  return {
    name: String(formData.get("name") || "").trim(),
    age: Number(formData.get("age")),
    phone: String(formData.get("phone") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    bio: String(formData.get("bio") || "").trim(),
    image,
  };
}

async function parseTraineeFormData(formData) {
  const imageFile = formData.get("image");
  let image = "";
  if (imageFile instanceof File && imageFile.size > 0) {
    image = await readFileAsDataUrl(imageFile);
  }
  return {
    name: String(formData.get("name") || "").trim(),
    age: Number(formData.get("age")),
    level: String(formData.get("level") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
    image,
  };
}

function calculateDuration(startTime, endTime) {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start === null || end === null) {
    return { durationMinutes: 0, durationHours: 0 };
  }
  let durationMinutes = end - start;
  if (durationMinutes <= 0) {
    durationMinutes += 24 * 60;
  }
  const durationHours = durationMinutes / 60;
  return { durationMinutes, durationHours };
}

const COACH_SORT_FIELDS = [
  "name",
  "age",
  "phone",
  "address",
  "totalWorkingHours",
  "createdAt",
];
const TRAINEE_SORT_FIELDS = ["name", "age", "level", "createdAt"];
const SESSION_SORT_FIELDS = ["createdAt"];

function compareValues(a, b, field) {
  const va = a[field];
  const vb = b[field];
  if (field === "createdAt") {
    return new Date(va).getTime() - new Date(vb).getTime();
  }
  if (typeof va === "number" && typeof vb === "number") return va - vb;
  return String(va ?? "").localeCompare(String(vb ?? ""));
}

function populateSession(session, store) {
  const coach = store.coaches.find((c) => c._id === session.coachId);
  const trainees = (session.trainees || [])
    .map((tid) => store.trainees.find((t) => t._id === tid))
    .filter(Boolean);
  return {
    ...session,
    coachId: coach ? { _id: coach._id, name: coach.name } : session.coachId,
    trainees,
  };
}

function populateTrainee(trainee, store) {
  if (!trainee.sessionId) return { ...trainee, sessionId: null };
  const session = store.sessions.find((s) => s._id === trainee.sessionId);
  if (!session) return { ...trainee, sessionId: null };
  return {
    ...trainee,
    sessionId: { _id: session._id, schedule: session.schedule },
  };
}

function populateAttendanceRecord(record, store) {
  const session = store.sessions.find((s) => s._id === record.sessionId);
  const coach = store.coaches.find((c) => c._id === record.coachId);
  return {
    ...record,
    sessionId: session
      ? { _id: session._id, coachId: session.coachId, schedule: session.schedule }
      : record.sessionId,
    coachId: coach ? { _id: coach._id, name: coach.name } : record.coachId,
  };
}

function sessionMatchesSearch(store, session, qRaw) {
  const q = String(qRaw ?? "").trim().toLowerCase();
  if (!q) return true;
  const coach = store.coaches.find((c) => c._id === session.coachId);
  if (coach?.name?.toLowerCase().includes(q)) return true;
  const SESSION_DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const matchedDays = SESSION_DAYS.filter((d) => d.toLowerCase().includes(q));
  const schedule = Array.isArray(session.schedule) ? session.schedule : [];
  return schedule.some((slot) => matchedDays.includes(slot.day));
}

function syncTraineesForSession(prev, sessionId, nextTraineeIds) {
  const sid = String(sessionId);
  const want = new Set(nextTraineeIds.map(String));
  const next = deepClone(prev);

  for (const tId of nextTraineeIds) {
    const trainee = next.trainees.find((t) => String(t._id) === String(tId));
    if (!trainee) continue;
    const oldSid = trainee.sessionId ? String(trainee.sessionId) : "";
    if (oldSid && oldSid !== sid) {
      next.sessions = next.sessions.map((s) => {
        if (String(s._id) !== oldSid) return s;
        return {
          ...s,
          trainees: (s.trainees || []).filter((id) => String(id) !== String(tId)),
        };
      });
    }
  }

  next.trainees = next.trainees.map((t) => {
    if (String(t.sessionId) === sid && !want.has(String(t._id))) {
      return { ...t, sessionId: null };
    }
    return t;
  });

  next.trainees = next.trainees.map((t) =>
    want.has(String(t._id)) ? { ...t, sessionId: sessionId } : t,
  );

  next.sessions = next.sessions.map((s) =>
    String(s._id) === sid ? { ...s, trainees: [...nextTraineeIds] } : s,
  );

  return next;
}

function newEntityId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function seedCoachHoursById() {
  return Object.fromEntries(demoCoaches.map((c) => [c._id, c.totalWorkingHours]));
}

export function DemoDataProvider({ children }) {
  const [store, setStore] = useState(() => createFreshStore());

  const getPopulatedSessions = useCallback(() => {
    return store.sessions.map((s) => populateSession(s, store));
  }, [store]);

  const listCoaches = useCallback(
    ({ search, page, limit, sortBy, order }) => {
      let rows = [...store.coaches];
      const q = String(search ?? "").trim().toLowerCase();
      if (q) {
        rows = rows.filter((c) =>
          [c.name, c.phone, c.address].some((f) =>
            String(f ?? "").toLowerCase().includes(q),
          ),
        );
      }
      const field = COACH_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
      const dir = order === "asc" ? 1 : -1;
      rows.sort((a, b) => compareValues(a, b, field) * dir);

      const totalItems = rows.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / limit));
      const currentPage = Math.min(Math.max(1, page), totalPages);
      const slice = rows.slice((currentPage - 1) * limit, currentPage * limit);

      return {
        coaches: slice,
        totalItems,
        totalPages,
        currentPage,
      };
    },
    [store.coaches],
  );

  const getCoachById = useCallback(
    (id) => store.coaches.find((c) => String(c._id) === String(id)) ?? null,
    [store.coaches],
  );

  const listTrainees = useCallback(
    ({ search, page, limit, sortBy, order, level }) => {
      let rows = [...store.trainees];
      const q = String(search ?? "").trim().toLowerCase();
      if (q) {
        rows = rows.filter((t) => String(t.name ?? "").toLowerCase().includes(q));
      }
      if (level) {
        rows = rows.filter((t) => t.level === level);
      }
      const field = TRAINEE_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
      const dir = order === "asc" ? 1 : -1;
      rows.sort((a, b) => compareValues(a, b, field) * dir);

      const totalItems = rows.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / limit));
      const currentPage = Math.min(Math.max(1, page), totalPages);
      const slice = rows.slice((currentPage - 1) * limit, currentPage * limit);

      return {
        trainees: slice.map((t) => populateTrainee(t, store)),
        totalItems,
        totalPages,
        currentPage,
      };
    },
    [store.trainees, store.sessions],
  );

  const getTraineeById = useCallback(
    (id) => {
      const t = store.trainees.find((x) => String(x._id) === String(id));
      return t ? populateTrainee(t, store) : null;
    },
    [store.trainees, store.sessions],
  );

  const listSessions = useCallback(
    ({ search, page, limit, sortBy, order }) => {
      let rows = store.sessions.filter((s) => sessionMatchesSearch(store, s, search));

      const field = SESSION_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
      const dir = order === "asc" ? 1 : -1;
      rows = [...rows].sort((a, b) => compareValues(a, b, field) * dir);

      const totalItems = rows.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / limit));
      const currentPage = Math.min(Math.max(1, page), totalPages);
      const slice = rows.slice((currentPage - 1) * limit, currentPage * limit);

      return {
        sessions: slice.map((s) => populateSession(s, store)),
        totalItems,
        totalPages,
        currentPage,
      };
    },
    [store.sessions, store.coaches],
  );

  const getSessionById = useCallback(
    (id) => {
      const s = store.sessions.find((x) => String(x._id) === String(id));
      return s ? populateSession(s, store) : null;
    },
    [store.sessions, store.coaches, store.trainees],
  );

  const listCoachesForReference = useCallback(() => {
    return {
      coaches: store.coaches.map((c) => ({ _id: c._id, name: c.name })),
    };
  }, [store.coaches]);

  const listTraineesForReference = useCallback(() => {
    return {
      trainees: store.trainees.map((t) => populateTrainee(t, store)),
    };
  }, [store.trainees, store.sessions]);

  const listSessionsLarge = useCallback(() => {
    return store.sessions.map((s) => populateSession(s, store));
  }, [store.sessions, store.coaches, store.trainees]);

  const getSessionsCurrent = useCallback(() => {
    return getCurrentSessionsApiPayload(getPopulatedSessions());
  }, [getPopulatedSessions]);

  const getSessionsUpcoming = useCallback(() => {
    return getUpcomingSessionApiPayload(getPopulatedSessions());
  }, [getPopulatedSessions]);

  const getAttendanceStatusForDate = useCallback(
    (dateOnly) => {
      const records = store.attendanceRecords.filter((r) => r.date === dateOnly);
      const statusByKey = {};
      for (const record of records) {
        const key = buildOccurrenceKey(record.sessionId, dateOnly, record.startTime);
        const attendedValue = record.attended === false ? false : true;
        const storedReason = record.reason ?? record.note ?? "";
        statusByKey[key] = {
          attended: attendedValue,
          note: storedReason,
          reason: storedReason,
        };
      }
      return { date: dateOnly, statusByKey };
    },
    [store.attendanceRecords],
  );

  const listAttendanceHistory = useCallback(
    ({ startDate, endDate, coachId, sessionId, status, page, limit }) => {
      let rows = [...store.attendanceRecords];

      if (coachId) {
        rows = rows.filter((r) => String(r.coachId) === String(coachId));
      }
      if (sessionId) {
        rows = rows.filter((r) => String(r.sessionId) === String(sessionId));
      }
      if (status === "attended") {
        rows = rows.filter((r) => r.attended !== false);
      } else if (status === "not_attended") {
        rows = rows.filter((r) => r.attended === false);
      }

      if (startDate || endDate) {
        rows = rows.filter((r) => {
          if (startDate && r.date < startDate) return false;
          if (endDate && r.date > endDate) return false;
          return true;
        });
      }

      rows.sort((a, b) => {
        const dc = String(b.date).localeCompare(String(a.date));
        if (dc !== 0) return dc;
        const st = String(b.startTime).localeCompare(String(a.startTime));
        if (st !== 0) return st;
        return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
      });

      const totalItems = rows.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / limit));
      const currentPage = Math.min(Math.max(1, page), totalPages);
      const slice = rows.slice((currentPage - 1) * limit, currentPage * limit);

      return {
        records: slice.map((r) => populateAttendanceRecord(r, store)),
        totalItems,
        totalPages,
        currentPage,
      };
    },
    [store.attendanceRecords, store.sessions, store.coaches],
  );

  const getPayrollSummary = useCallback(
    ({ startDate, endDate }) => {
      let rows = store.attendanceRecords.filter((r) => r.attended !== false);

      if (startDate || endDate) {
        rows = rows.filter((r) => {
          if (startDate && r.date < startDate) return false;
          if (endDate && r.date > endDate) return false;
          return true;
        });
      }

      const totals = new Map();
      for (const r of rows) {
        const prev = totals.get(String(r.coachId)) ?? { minutes: 0, coachName: "" };
        const coach = store.coaches.find((c) => c._id === r.coachId);
        prev.minutes += r.durationMinutes ?? 0;
        prev.coachName = coach?.name ?? prev.coachName;
        totals.set(String(r.coachId), prev);
      }

      return [...totals.entries()]
        .map(([coachId, v]) => ({
          coachId,
          coachName: v.coachName || "Unknown Coach",
          totalMinutes: v.minutes,
          totalHours: Math.round((v.minutes / 60) * 100) / 100,
        }))
        .sort((a, b) => (b.totalMinutes || 0) - (a.totalMinutes || 0));
    },
    [store.attendanceRecords, store.coaches],
  );

  const createCoach = useCallback(async (formData) => {
    const parsed = await parseCoachFormData(formData);
    const row = {
      _id: newEntityId("coach"),
      ...parsed,
      totalWorkingHours: 0,
      createdAt: new Date().toISOString(),
    };
    setStore((prev) => ({
      ...prev,
      coaches: [row, ...prev.coaches],
    }));
    return row;
  }, []);

  const updateCoach = useCallback(async (id, formData) => {
    const parsed = await parseCoachFormData(formData);
    setStore((prev) => ({
      ...prev,
      coaches: prev.coaches.map((c) => {
        if (String(c._id) !== String(id)) return c;
        const image =
          parsed.image && String(parsed.image).length > 0 ? parsed.image : c.image;
        return { ...c, ...parsed, image };
      }),
    }));
  }, []);

  const deleteCoach = useCallback((id) => {
    setStore((prev) => {
      const sidSet = new Set(
        prev.sessions.filter((s) => String(s.coachId) === String(id)).map((s) => s._id),
      );
      let next = deepClone(prev);
      next.coaches = next.coaches.filter((c) => String(c._id) !== String(id));
      next.sessions = next.sessions.filter((s) => String(s.coachId) !== String(id));
      next.attendanceRecords = next.attendanceRecords.filter(
        (r) => String(r.coachId) !== String(id),
      );
      next.trainees = next.trainees.map((t) =>
        t.sessionId && sidSet.has(String(t.sessionId)) ? { ...t, sessionId: null } : t,
      );
      return next;
    });
  }, []);

  const createTrainee = useCallback(async (formData) => {
    const parsed = await parseTraineeFormData(formData);
    const row = {
      _id: newEntityId("trainee"),
      ...parsed,
      sessionId: null,
      createdAt: new Date().toISOString(),
    };
    setStore((prev) => ({
      ...prev,
      trainees: [row, ...prev.trainees],
    }));
    return row;
  }, []);

  const updateTrainee = useCallback(async (id, formData) => {
    const parsed = await parseTraineeFormData(formData);
    setStore((prev) => ({
      ...prev,
      trainees: prev.trainees.map((t) => {
        if (String(t._id) !== String(id)) return t;
        const image =
          parsed.image && String(parsed.image).length > 0 ? parsed.image : t.image;
        return { ...t, ...parsed, image };
      }),
    }));
  }, []);

  const deleteTrainee = useCallback((id) => {
    setStore((prev) => {
      const next = deepClone(prev);
      next.trainees = next.trainees.filter((t) => String(t._id) !== String(id));
      next.sessions = next.sessions.map((s) => ({
        ...s,
        trainees: (s.trainees || []).filter((tid) => String(tid) !== String(id)),
      }));
      return next;
    });
  }, []);

  const createSession = useCallback((payload) => {
    const sched = validateScheduleSlots(payload.schedule);
    if (sched.error) throw new Error(sched.error);
    const coachId = String(payload.coachId || "").trim();
    if (!coachId) throw new Error("coachId is required");
    const traineeIds = Array.isArray(payload.trainees) ? payload.trainees : [];

    let mutationError = null;
    setStore((prev) => {
      const conflict = coachHasScheduleConflict(prev, coachId, sched.slots, null);
      if (conflict.error) {
        mutationError = new Error(conflict.error);
        return prev;
      }

      const session = {
        _id: newEntityId("session"),
        coachId,
        trainees: [...traineeIds],
        schedule: sched.slots,
        createdAt: new Date().toISOString(),
      };
      let next = {
        ...prev,
        sessions: [session, ...prev.sessions],
      };
      next = syncTraineesForSession(next, session._id, traineeIds);
      return next;
    });
    if (mutationError) throw mutationError;
  }, []);

  const updateSession = useCallback((id, payload) => {
    const sched = validateScheduleSlots(payload.schedule);
    if (sched.error) throw new Error(sched.error);
    const coachId = String(payload.coachId || "").trim();
    const traineeIds = Array.isArray(payload.trainees) ? payload.trainees : [];

    let mutationError = null;
    setStore((prev) => {
      const conflict = coachHasScheduleConflict(prev, coachId, sched.slots, id);
      if (conflict.error) {
        mutationError = new Error(conflict.error);
        return prev;
      }

      let next = deepClone(prev);
      next.sessions = next.sessions.map((s) =>
        String(s._id) === String(id)
          ? { ...s, coachId, schedule: sched.slots, trainees: [...traineeIds] }
          : s,
      );
      next = syncTraineesForSession(next, id, traineeIds);
      return next;
    });
    if (mutationError) throw mutationError;
  }, []);

  const deleteSession = useCallback((id) => {
    setStore((prev) => {
      let next = deepClone(prev);
      next.sessions = next.sessions.filter((s) => String(s._id) !== String(id));
      next.trainees = next.trainees.map((t) =>
        String(t.sessionId) === String(id) ? { ...t, sessionId: null } : t,
      );
      next.attendanceRecords = next.attendanceRecords.filter(
        (r) => String(r.sessionId) !== String(id),
      );
      return next;
    });
  }, []);

  const clearAllSessions = useCallback(() => {
    setStore((prev) => ({
      ...prev,
      sessions: [],
      trainees: prev.trainees.map((t) => ({ ...t, sessionId: null })),
    }));
  }, []);

  const markAttendance = useCallback((body) => {
    const {
      sessionId,
      date,
      startTime,
      endTime,
      attended,
      reason,
      note,
    } = body ?? {};
    const dateOnly = String(date || "").trim();
    const startNorm = normalizeTimeHHMM(startTime) ?? String(startTime || "").trim();
    const endNorm = normalizeTimeHHMM(endTime) ?? String(endTime || "").trim();

    let mutationError = null;
    setStore((prev) => {
      const session = prev.sessions.find((s) => String(s._id) === String(sessionId));
      if (!session) {
        mutationError = new Error("Session not found");
        return prev;
      }

      const dup = prev.attendanceRecords.some(
        (r) =>
          String(r.sessionId) === String(sessionId) &&
          r.date === dateOnly &&
          normalizeTimeHHMM(r.startTime) === startNorm,
      );
      if (dup) {
        mutationError = new Error("Attendance already marked for this occurrence");
        return prev;
      }

      const { durationMinutes, durationHours } = calculateDuration(startNorm, endNorm);
      const attendedValue = attended === false ? false : true;
      const reasonValue = String(reason ?? note ?? "").trim();

      let next = deepClone(prev);

      if (attendedValue) {
        const coachId = session.coachId;
        next.coaches = next.coaches.map((c) =>
          String(c._id) === String(coachId)
            ? { ...c, totalWorkingHours: (c.totalWorkingHours || 0) + durationHours }
            : c,
        );
      }

      const record = {
        _id: newEntityId("att"),
        sessionId: String(sessionId),
        coachId: String(session.coachId),
        date: dateOnly,
        startTime: startNorm,
        endTime: endNorm,
        durationMinutes,
        durationHours,
        attended: attendedValue,
        reason: attendedValue ? "" : reasonValue,
        note: attendedValue ? "" : reasonValue,
        createdAt: new Date().toISOString(),
      };

      next.attendanceRecords = [record, ...next.attendanceRecords];
      return next;
    });
    if (mutationError) throw mutationError;
  }, []);

  const clearAttendance = useCallback(() => {
    const hoursFromSeed = seedCoachHoursById();
    setStore((prev) => ({
      ...prev,
      attendanceRecords: [],
      coaches: prev.coaches.map((c) => ({
        ...c,
        totalWorkingHours: hoursFromSeed[c._id] ?? 0,
      })),
    }));
  }, []);

  const value = useMemo(
    () => ({
      store,
      listCoaches,
      getCoachById,
      createCoach,
      updateCoach,
      deleteCoach,
      listTrainees,
      getTraineeById,
      createTrainee,
      updateTrainee,
      deleteTrainee,
      listSessions,
      getSessionById,
      listCoachesForReference,
      listTraineesForReference,
      listSessionsLarge,
      getSessionsCurrent,
      getSessionsUpcoming,
      getAttendanceStatusForDate,
      listAttendanceHistory,
      getPayrollSummary,
      createSession,
      updateSession,
      deleteSession,
      clearAllSessions,
      markAttendance,
      clearAttendance,
    }),
    [
      store,
      listCoaches,
      getCoachById,
      createCoach,
      updateCoach,
      deleteCoach,
      listTrainees,
      getTraineeById,
      createTrainee,
      updateTrainee,
      deleteTrainee,
      listSessions,
      getSessionById,
      listCoachesForReference,
      listTraineesForReference,
      listSessionsLarge,
      getSessionsCurrent,
      getSessionsUpcoming,
      getAttendanceStatusForDate,
      listAttendanceHistory,
      getPayrollSummary,
      createSession,
      updateSession,
      deleteSession,
      clearAllSessions,
      markAttendance,
      clearAttendance,
    ],
  );

  return (
    <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>
  );
}

export function useDemoData() {
  const ctx = useContext(DemoDataContext);
  if (!ctx) {
    throw new Error("useDemoData must be used within DemoDataProvider");
  }
  return ctx;
}
