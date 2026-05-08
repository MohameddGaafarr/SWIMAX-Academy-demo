import { useEffect, useMemo, useState } from "react";
import { useDemoData } from "../context/DemoDataContext.jsx";
import { getSessionLiveBadgeFromContext } from "../utils/sessionActivity.js";

function coachName(session) {
  const coach = session?.coachId;
  if (coach && typeof coach === "object" && coach.name) return coach.name;
  return "—";
}

function traineeCountNumber(session) {
  if (typeof session?.traineeCount === "number") return session.traineeCount;
  if (typeof session?.traineesCount === "number") return session.traineesCount;
  if (typeof session?.traineesLength === "number")
    return session.traineesLength;
  if (Array.isArray(session?.trainees)) return session.trainees.length;
  if (Array.isArray(session?.traineeIds)) return session.traineeIds.length;
  if (Array.isArray(session?.traineesIds)) return session.traineesIds.length;
  return 0;
}

function traineeCountLabel(session) {
  const count = traineeCountNumber(session);
  if (count === 0) return "No trainees";
  if (count === 1) return "1 trainee";
  return `${count} trainees`;
}

export default function HomePage() {
  const demo = useDemoData();

  const [currentSessions, setCurrentSessions] = useState([]);
  const [currentNowContext, setCurrentNowContext] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [upcomingSession, setUpcomingSession] = useState(null);

  const [stats, setStats] = useState({
    coaches: 0,
    trainees: 0,
    sessions: 0,
  });

  const [sessionsError, setSessionsError] = useState(null);

  useEffect(() => {
    setStats({
      coaches: demo.store.coaches.length,
      trainees: demo.store.trainees.length,
      sessions: demo.store.sessions.length,
    });
  }, [demo.store.coaches.length, demo.store.trainees.length, demo.store.sessions.length]);

  useEffect(() => {
    let cancelled = false;

    function loadSessionCards() {
      try {
        const currentRes = demo.getSessionsCurrent();
        const upcomingRes = demo.getSessionsUpcoming();

        if (cancelled) return;

        setCurrentSessions(Array.isArray(currentRes?.current) ? currentRes.current : []);
        setCurrentNowContext(
          currentRes?.now
            ? {
                day: currentRes.now.weekday,
                minutesOfDay: currentRes.now.minutesOfDay,
                dateOnly: currentRes.now.dateOnly,
                timestampMs: currentRes.now.timestampMs,
              }
            : null,
        );
        setUpcomingSession(upcomingRes?.upcoming ?? null);
        setSessionsError(null);
      } catch {
        if (!cancelled) {
          setCurrentNowContext(null);
          setSessionsError("Could not load session data");
        }
      }
    }

    loadSessionCards();
    const intervalId = setInterval(loadSessionCards, 60000);
    const onFocus = () => {
      if (document.visibilityState && document.visibilityState !== "visible") return;
      loadSessionCards();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [demo]);

  const effectiveCurrentSessions = useMemo(() => currentSessions, [currentSessions]);
  function nextSession() {
    setCurrentIndex((prev) =>
      effectiveCurrentSessions.length ? (prev + 1) % effectiveCurrentSessions.length : 0
    );
  }

  function prevSession() {
    setCurrentIndex((prev) =>
      effectiveCurrentSessions.length
        ? (prev - 1 + effectiveCurrentSessions.length) % effectiveCurrentSessions.length
        : 0
    );
  }
  const activeSession = effectiveCurrentSessions[currentIndex];
  useEffect(() => {
    if (!effectiveCurrentSessions.length) {
      setCurrentIndex(0);
      return;
    }
    if (currentIndex > effectiveCurrentSessions.length - 1) {
      setCurrentIndex(0);
    }
  }, [effectiveCurrentSessions.length, currentIndex]);
  const upcomingTraineesCount = useMemo(
    () => traineeCountNumber(upcomingSession),
    [upcomingSession]
  );

  return (
    <div className="relative animate-fade-in space-y-4 md:space-y-5">
      {/* 🔥 Welcome */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(0,196,255,0.1),rgba(0,100,150,0.07))] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-6">
        <div className="absolute -right-10 -top-10 h-44 w-44 bg-cyan-400/10 blur-3xl rounded-full" />
        <div className="absolute -left-14 -bottom-14 h-56 w-56 bg-sky-400/10 blur-3xl rounded-full" />

        <h1 className="text-[1.3rem] font-black leading-[1.4] tracking-[0.02em] text-slate-100 md:text-[1.9rem] md:leading-[1.5]">
          WELCOME BACK ,{" "}
          <span className="bg-gradient-to-r from-cyan-300 to-sky-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.7)]">
            IN SWIMAX
          </span>
        </h1>
      </section>

      {/* 🔥 Stats */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Coaches", value: stats.coaches },
          { label: "Total Trainees", value: stats.trainees },
          { label: "Group Sessions", value: stats.sessions },
          { label: "Active Now", value: effectiveCurrentSessions.length },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-[rgba(10,22,46,0.8)] p-4 backdrop-blur-xl shadow-lg transition hover:scale-[1.02] md:p-5"
          >
            <p className="text-xs text-slate-300/70">{item.label}</p>
            <p className="mt-2 text-xl font-bold text-slate-100 md:text-2xl">
              {item.value}
            </p>
          </div>
        ))}
      </section>
      {/* 🔥 Bottom */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        {/* Current */}
        <div className="rounded-3xl border border-white/10 bg-[rgba(10,22,46,0.8)] p-4 backdrop-blur-xl shadow-lg transition hover:scale-[1.02] md:p-5">
          <h2 className="text-sm font-extrabold tracking-[0.1em] text-slate-100">
            IN THE POOL NOW
          </h2>

          {activeSession ? (
            <div className="mt-3 space-y-2 text-xs md:mt-4 md:space-y-3 md:text-sm">
              {effectiveCurrentSessions.length > 1 ? (
                <div className="mb-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-2 py-1">
                  <button
                    type="button"
                    onClick={prevSession}
                    className="rounded-md border border-white/10 px-2 py-0.5 text-xs text-slate-200 transition hover:bg-white/10"
                  >
                    &lt;
                  </button>
                  <span className="text-xs text-slate-300">
                    Session {currentIndex + 1} of {effectiveCurrentSessions.length}
                  </span>
                  <button
                    type="button"
                    onClick={nextSession}
                    className="rounded-md border border-white/10 px-2 py-0.5 text-xs text-slate-200 transition hover:bg-white/10"
                  >
                    &gt;
                  </button>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-slate-400">Coach</span>
                <span className="text-slate-100 font-semibold">
                  {coachName(activeSession)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">No. of trainees</span>
                <span className="text-slate-100 font-semibold">
                  {traineeCountLabel(activeSession)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Slot</span>
                <span className="text-slate-100 font-semibold">
                  {activeSession.currentSlot
                    ? `${activeSession.currentSlot.day} ${activeSession.currentSlot.startTime} – ${activeSession.currentSlot.endTime}`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-end">
                <span className="inline-flex rounded-full border border-sky-400/35 bg-sky-500/15 px-2 py-0.5 text-[11px] font-medium text-sky-200">
                  {getSessionLiveBadgeFromContext(activeSession.currentSlot, currentNowContext) || "Now"}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-slate-400 text-sm">No session running.</p>
          )}
        </div>

        {/* Upcoming */}
        <div className="rounded-3xl border border-white/10 bg-[rgba(10,22,46,0.8)] p-4 backdrop-blur-xl shadow-lg transition hover:scale-[1.02] md:p-5">
          <h2 className="text-sm font-extrabold tracking-[0.1em] text-slate-100">
            NEXT UP
          </h2>

          {upcomingSession ? (
            <div className="mt-3 space-y-2 text-xs md:mt-4 md:space-y-3 md:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Coach</span>
                <span className="text-slate-100 font-semibold">
                  {coachName(upcomingSession)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">No. of trainees</span>
                <span className="text-slate-100 font-semibold">
                  {upcomingTraineesCount}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Slot</span>
                <span className="text-slate-100 font-semibold">
                  {upcomingSession.upcomingSlot
                    ? `${upcomingSession.upcomingSlot.day} ${upcomingSession.upcomingSlot.startTime} - ${upcomingSession.upcomingSlot.endTime}`
                    : "—"}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-slate-400 text-sm">No upcoming session.</p>
          )}
        </div>
      </section>

      {sessionsError && (
        <div className="text-red-400 text-sm mt-2">{sessionsError}</div>
      )}
    </div>
  );
}
