import { useCallback, useEffect, useMemo, useState } from "react";
import { useDemoData } from "../context/DemoDataContext.jsx";
import SessionTable from "../components/SessionTable.jsx";
import SessionForm from "../components/SessionForm.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import SessionsToolbar from "../components/SessionsToolbar.jsx";
import CoachesPagination from "../components/CoachesPagination.jsx";
import FullscreenModal from "../components/FullscreenModal.jsx";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { getCairoDateOnly, getSessionLiveBadgeFromContext } from "../utils/sessionActivity.js";
import { buildOccurrenceKey } from "../utils/occurrenceKey.js";
import { parseTimeToMinutes } from "../utils/localDateTime.js";

function getErrorMessage(err) {
  if (err?.message) return err.message;
  return "Something went wrong";
}

function formatSessionLabel(sessionId) {
  if (!sessionId || typeof sessionId !== "object") return "Assigned to another session";
  const schedule = Array.isArray(sessionId.schedule) ? sessionId.schedule : [];
  if (!schedule.length) return "Assigned to another session";
  const firstSlot = schedule[0];
  const shortDay = String(firstSlot.day ?? "").slice(0, 3);
  return `${shortDay} ${firstSlot.startTime}-${firstSlot.endTime}`;
}

export default function SessionsPage() {
  const demo = useDemoData();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  const [sessions, setSessions] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingSession, setEditingSession] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [coaches, setCoaches] = useState([]);
  const [trainees, setTrainees] = useState([]);

  const [clearOpen, setClearOpen] = useState(false);
  const [clearSubmitting, setClearSubmitting] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingSession, setDeletingSession] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [activeSessions, setActiveSessions] = useState([]);
  const [activityPoolSessions, setActivityPoolSessions] = useState([]);
  const [attendanceStatusByKey, setAttendanceStatusByKey] = useState({});
  const [reasonOpenByKey, setReasonOpenByKey] = useState({});
  const [reasonDraftByKey, setReasonDraftByKey] = useState({});
  const [attendanceSubmittingByKey, setAttendanceSubmittingByKey] = useState({});
  const [activeNowContext, setActiveNowContext] = useState(null);

  const currentSessionId = editingSession?._id ?? null;

  const loadReferenceData = useCallback(() => {
    try {
      const coachesRes = demo.listCoachesForReference();
      const traineesRes = demo.listTraineesForReference();
      setCoaches(coachesRes.coaches || []);
      setTrainees(traineesRes.trainees || []);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [demo]);

  useEffect(() => {
    if (formOpen) loadReferenceData();
  }, [formOpen, loadReferenceData]);

  const loadSessions = useCallback(() => {
    setLoading(true);
    try {
      const data = demo.listSessions({
        search: debouncedSearch,
        page,
        limit,
        sortBy,
        order,
      });

      setSessions(data.sessions || []);
      setTotalItems(data.totalItems || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, limit, sortBy, order, demo]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const loadCurrentSessions = useCallback(() => {
    try {
      const data = demo.getSessionsCurrent();
      setActiveSessions(Array.isArray(data?.current) ? data.current : []);
      setActiveNowContext(
        data?.now
          ? {
              day: data.now.weekday,
              minutesOfDay: data.now.minutesOfDay,
              dateOnly: data.now.dateOnly,
              timestampMs: data.now.timestampMs,
            }
          : null,
      );
    } catch {
      setActiveSessions([]);
      setActiveNowContext(null);
    }
  }, [demo]);

  const loadActivityPoolSessions = useCallback(() => {
    try {
      const rows = demo.listSessionsLarge();
      setActivityPoolSessions(Array.isArray(rows) ? rows : []);
    } catch {
      setActivityPoolSessions([]);
    }
  }, [demo]);

  const loadTodayAttendanceState = useCallback(() => {
    try {
      const today = getCairoDateOnly();
      const { statusByKey } = demo.getAttendanceStatusForDate(today);
      setAttendanceStatusByKey(statusByKey && typeof statusByKey === "object" ? statusByKey : {});
    } catch {
      setAttendanceStatusByKey({});
    }
  }, [demo]);

  useEffect(() => {
    loadCurrentSessions();
    loadActivityPoolSessions();
    loadTodayAttendanceState();
  }, [loadCurrentSessions, loadActivityPoolSessions, loadTodayAttendanceState]);

  useEffect(() => {
    const timerId = setInterval(() => {
      loadCurrentSessions();
    }, 60000);
    const onFocus = () => {
      if (document.visibilityState && document.visibilityState !== "visible") return;
      loadCurrentSessions();
      loadTodayAttendanceState();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearInterval(timerId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [loadCurrentSessions, loadTodayAttendanceState]);

  function openCreate() {
    setFormMode("create");
    setEditingSession(null);
    setFormOpen(true);
  }

  function openEdit(session) {
    setFormMode("edit");
    setEditingSession(session);
    setFormOpen(true);
  }

  function closeForm() {
    if (formSubmitting) return;
    setFormOpen(false);
    setEditingSession(null);
  }

  async function handleFormSubmit(payload) {
    setFormSubmitting(true);
    try {
      if (formMode === "create") {
        demo.createSession(payload);
      } else {
        demo.updateSession(editingSession._id, payload);
      }
      loadSessions();
      loadCurrentSessions();
      loadActivityPoolSessions();
      closeForm();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  }

  function openDelete(session) {
    setDeletingSession(session);
    setDeleteOpen(true);
  }

  function closeDelete() {
    if (deleteSubmitting) return;
    setDeleteOpen(false);
    setDeletingSession(null);
  }

  async function confirmDelete() {
    setDeleteSubmitting(true);
    try {
      demo.deleteSession(deletingSession._id);
      loadSessions();
      loadActivityPoolSessions();
      loadCurrentSessions();
      closeDelete();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleteSubmitting(false);
    }
  }

  async function confirmClearAllSessions() {
    setClearSubmitting(true);
    try {
      demo.clearAllSessions();
      setSessions([]);
      setActiveSessions([]);
      setActivityPoolSessions([]);
      setTotalItems(0);
      setTotalPages(1);
      setClearOpen(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setClearSubmitting(false);
    }
  }

  async function submitAttendance(sessionLike, attendedValue) {
    if (!sessionLike?._id || !sessionLike?.currentSlot) return;
    const occurrenceKey = buildOccurrenceKey(sessionLike._id, getCairoDateOnly(), sessionLike.currentSlot.startTime);
    setAttendanceSubmittingByKey((prev) => ({ ...prev, [occurrenceKey]: true }));
    setError(null);
    try {
      const reasonValue = String(reasonDraftByKey[occurrenceKey] ?? "").trim();
      demo.markAttendance({
        sessionId: sessionLike._id,
        date: getCairoDateOnly(),
        startTime: sessionLike.currentSlot.startTime,
        endTime: sessionLike.currentSlot.endTime,
        attended: attendedValue,
        reason: attendedValue ? "" : reasonValue,
      });
      setAttendanceStatusByKey((prev) => ({
        ...prev,
        [occurrenceKey]: { attended: attendedValue, reason: attendedValue ? "" : reasonValue },
      }));
      setReasonOpenByKey((prev) => ({ ...prev, [occurrenceKey]: false }));
      setReasonDraftByKey((prev) => ({ ...prev, [occurrenceKey]: "" }));
      loadTodayAttendanceState();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAttendanceSubmittingByKey((prev) => ({ ...prev, [occurrenceKey]: false }));
    }
  }

  const traineeOptions = useMemo(() => {
    return trainees.map((t) => {
      const assigned = t.sessionId?._id || t.sessionId;
      return {
        _id: t._id,
        name: t.name,
        unavailable: assigned && assigned !== currentSessionId,
        sessionLabel: assigned ? formatSessionLabel(t.sessionId) : "",
      };
    });
  }, [trainees, currentSessionId]);

  function getNextDay(day) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const idx = days.indexOf(String(day ?? ""));
    if (idx < 0) return null;
    return days[(idx + 1) % 7];
  }

  const visibleActiveSessions = useMemo(() => {
    const nowCtx = activeNowContext;
    const dateOnly = nowCtx?.dateOnly || getCairoDateOnly();
    const nowDay = String(nowCtx?.day ?? "");
    const nowMinutes = Number(nowCtx?.minutesOfDay);
    const currentByKey = new Map();

    for (const currentSession of activeSessions) {
      const key = buildOccurrenceKey(currentSession._id, dateOnly, currentSession.currentSlot?.startTime);
      currentByKey.set(key, currentSession);
    }

    if (!nowDay || !Number.isFinite(nowMinutes)) {
      return Array.from(currentByKey.values());
    }

    const pending = [];
    for (const session of activityPoolSessions) {
      const slots = Array.isArray(session?.schedule) ? session.schedule : [];
      for (const slot of slots) {
        const start = parseTimeToMinutes(slot?.startTime);
        const end = parseTimeToMinutes(slot?.endTime);
        if (start === null || end === null || start === end) continue;

        let hasStarted = false;
        if (end > start) {
          hasStarted = String(slot?.day ?? "") === nowDay && nowMinutes >= start;
        } else {
          const nextDay = getNextDay(slot?.day);
          hasStarted =
            (String(slot?.day ?? "") === nowDay && nowMinutes >= start) ||
            (nextDay === nowDay);
        }
        if (!hasStarted) continue;

        const key = buildOccurrenceKey(session._id, dateOnly, slot?.startTime);
        const alreadyMarked = Boolean(attendanceStatusByKey[key]);
        if (alreadyMarked || currentByKey.has(key)) continue;

        pending.push({
          ...session,
          currentSlot: slot,
        });
      }
    }

    return [...Array.from(currentByKey.values()), ...pending];
  }, [activeSessions, activityPoolSessions, activeNowContext, attendanceStatusByKey]);

  return (
    <div className="animate-fade-in space-y-4 md:space-y-5">

      {error && <div className="error-box">{error}</div>}

      <div className="card-float p-3 md:p-4">
        <SessionsToolbar
          search={search}
          onSearchChange={setSearch}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          order={order}
          onOrderChange={setOrder}
          limit={limit}
          onLimitChange={setLimit}
          actions={
            <>
              <button onClick={() => setClearOpen(true)} className="btn-secondary">
                Clear All Sessions
              </button>
              <button onClick={openCreate} className="btn-primary">
                Add session
              </button>
            </>
          }
        />
      </div>

      <SessionTable
        sessions={sessions}
        loading={loading}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      <CoachesPagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        limit={limit}
        loading={loading}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />

      {visibleActiveSessions.length ? (
        <section className="card-float p-3 md:p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/90">
            Active session now
          </h2>
          <div className="space-y-3">
            {visibleActiveSessions.map((sessionLike) => {
              const occurrenceKey = buildOccurrenceKey(
                sessionLike._id,
                getCairoDateOnly(),
                sessionLike.currentSlot?.startTime,
              );
              const attendanceRecord = attendanceStatusByKey[occurrenceKey];
              const attendanceStatus =
                attendanceRecord?.attended === false
                  ? "not_attended"
                  : attendanceRecord?.attended === true
                    ? "attended"
                    : null;
              const isSubmitting = Boolean(attendanceSubmittingByKey[occurrenceKey]);
              const reasonOpen = Boolean(reasonOpenByKey[occurrenceKey]);
              const reasonDraft = String(reasonDraftByKey[occurrenceKey] ?? "");

              return (
                <article
                  key={occurrenceKey}
                  className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-3"
                >
                  <div className="grid gap-2 text-xs sm:grid-cols-2 sm:text-sm lg:flex lg:flex-wrap lg:items-center lg:gap-5">
                    <p className="text-slate-300">
                      <span className="text-slate-500">Slot · </span>
                      {`${sessionLike.currentSlot.day} ${sessionLike.currentSlot.startTime} - ${sessionLike.currentSlot.endTime}`}
                    </p>
                    <p className="text-slate-300">
                      <span className="inline-flex rounded-full border border-sky-400/35 bg-sky-500/15 px-2 py-0.5 text-[11px] font-medium text-sky-200">
                        {getSessionLiveBadgeFromContext(sessionLike.currentSlot, activeNowContext) || "Now"}
                      </span>
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-500">Coach · </span>
                      {sessionLike.coachId?.name || "—"}
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-500">No. of trainees · </span>
                      {Array.isArray(sessionLike.trainees) ? sessionLike.trainees.length : 0}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-col items-stretch gap-2 text-right sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                    {attendanceStatus === "attended" ? (
                      <span className="rounded-full border border-emerald-500/35 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-200">
                        Marked as attended
                      </span>
                    ) : attendanceStatus === "not_attended" ? (
                      <span className="rounded-full border border-red-500/35 bg-red-500/15 px-3 py-1 text-xs font-medium text-red-200">
                        Marked as not attended
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => submitAttendance(sessionLike, true)}
                      disabled={isSubmitting || Boolean(attendanceStatus)}
                      className="btn-primary-sm w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {isSubmitting ? "Saving..." : "Attended"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setReasonOpenByKey((prev) => ({ ...prev, [occurrenceKey]: !reasonOpen }))
                      }
                      disabled={isSubmitting || Boolean(attendanceStatus)}
                      className="w-full rounded-xl border border-red-500/40 bg-red-950/25 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-950/45 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      Not Attended
                    </button>
                  </div>

                  {reasonOpen && !attendanceStatus ? (
                    <div className="mt-3 rounded-2xl border border-slate-700/60 bg-slate-950/40 p-3">
                      <textarea
                        rows={2}
                        value={reasonDraft}
                        onChange={(e) =>
                          setReasonDraftByKey((prev) => ({ ...prev, [occurrenceKey]: e.target.value }))
                        }
                        placeholder="Enter absence reason..."
                        className="w-full resize-none rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-red-400/50 focus:ring-2 focus:ring-red-500/25"
                      />
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (isSubmitting) return;
                            setReasonOpenByKey((prev) => ({ ...prev, [occurrenceKey]: false }));
                            setReasonDraftByKey((prev) => ({ ...prev, [occurrenceKey]: "" }));
                          }}
                          disabled={isSubmitting}
                          className="btn-secondary w-full px-3 py-2 text-xs disabled:opacity-60 sm:w-auto"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => submitAttendance(sessionLike, false)}
                          disabled={isSubmitting || !reasonDraft.trim()}
                          className="w-full rounded-xl border border-red-500/40 bg-red-600/90 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                          {isSubmitting ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* FORM */}
      <FullscreenModal
        open={formOpen}
        onClose={closeForm}
        closeDisabled={formSubmitting}
        title={formMode === "create" ? "Create session" : "Edit session"}
      >
        <SessionForm
          initialValues={
            editingSession
              ? {
                  coachId: editingSession.coachId?._id || editingSession.coachId,
                  traineeIds: editingSession.trainees?.map(t => t._id || t) || [],
                  schedule: editingSession.schedule || [],
                }
              : {
                  coachId: "",
                  traineeIds: [],
                  schedule: [{ day: "Sunday", startTime: "", endTime: "" }],
                }
          }
          coaches={coaches}
          trainees={traineeOptions}
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
          submitting={formSubmitting}
        />
      </FullscreenModal>

      <ConfirmModal
        open={deleteOpen}
        title="Delete session"
        message="This will permanently delete this session."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={closeDelete}
        loading={deleteSubmitting}
      />

      <ConfirmModal
        open={clearOpen}
        title="Clear all sessions"
        message="This will permanently delete ALL sessions and unassign trainees."
        confirmLabel="Delete all"
        onConfirm={confirmClearAllSessions}
        onCancel={() => {
          if (clearSubmitting) return;
          setClearOpen(false);
        }}
        loading={clearSubmitting}
      />
    </div>
  );
}
