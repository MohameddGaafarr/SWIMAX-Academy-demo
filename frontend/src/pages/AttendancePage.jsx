import { useCallback, useEffect, useMemo, useState } from "react";
import { useDemoData } from "../context/DemoDataContext.jsx";
import CoachesPagination from "../components/CoachesPagination.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { formatDuration, hoursToMinutes } from "../utils/formatDuration.js";

function downloadCSV(filename, rows) {
  if (!Array.isArray(rows) || rows.length <= 1) {
    throw new Error("No data available to export");
  }

  const processRow = (row) =>
    row.map((item) => `"${item ?? ""}"`).join(",");

  const csvContent = rows.map(processRow).join("\n");

  const BOM = "\uFEFF";

  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getErrorMessage(err) {
  if (err?.message) return err.message;
  return "Something went wrong";
}

function isArabic(text) {
  return /[\u0600-\u06FF]/.test(String(text ?? ""));
}

function formatDateOnly(value) {
  const raw = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return "—";
  const [y, m, day] = raw.split("-");
  return `${day}/${m}/${y}`;
}

function formatSessionSchedule(session) {
  const slots = Array.isArray(session?.schedule) ? session.schedule : [];
  if (!slots.length) return "No schedule";
  const first = slots[0];
  return `${first.day} ${first.startTime}-${first.endTime}`;
}

function monthToDateRange(monthValue) {
  if (!/^\d{4}-\d{2}$/.test(String(monthValue ?? "").trim())) {
    return null;
  }
  const [yearStr, monthStr] = String(monthValue).split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!year || month < 1 || month > 12) return null;
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const toDateOnly = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return {
    startDate: toDateOnly(first),
    endDate: toDateOnly(last),
  };
}

export default function AttendancePage() {
  const demo = useDemoData();

  const [records, setRecords] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [coachId, setCoachId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payrollStartDate, setPayrollStartDate] = useState("");
  const [payrollEndDate, setPayrollEndDate] = useState("");
  const [payrollMonth, setPayrollMonth] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearSubmitting, setClearSubmitting] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsNote, setDetailsNote] = useState("");
  const detailsNoteIsArabic = isArabic(detailsNote);

  function handleExportAttendance() {
    try {
      if (!records.length) {
        setError("No attendance data to export");
        return;
      }

      const rows = [
        ["Date", "Coach", "Session", "Time", "Duration"],
        ...records.map((r) => [
          r.date,
          r.coachId?.name || "",
          formatSessionSchedule(r.sessionId),
          `${r.startTime} - ${r.endTime}`,
          formatDuration(r.durationMinutes ?? hoursToMinutes(r.durationHours)),
        ]),
      ];

      const today = new Date().toISOString().split("T")[0];
      downloadCSV(`attendance-${today}.csv`, rows);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function handleExportPayroll() {
    try {
      if (!payroll.length) {
        setError("No payroll data to export");
        return;
      }

      const rows = [
        ["Coach Name", "Total Duration"],
        ...payroll.map((c) => [
          c.coachName,
          formatDuration(c.totalMinutes ?? hoursToMinutes(c.totalHours)),
        ]),
      ];

      const today = new Date().toISOString().split("T")[0];
      downloadCSV(`payroll-${today}.csv`, rows);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const loadReferences = useCallback(() => {
    try {
      const coachesRes = demo.listCoaches({
        page: 1,
        limit: 200,
        sortBy: "name",
        order: "asc",
        search: undefined,
      });
      const sessionsRes = demo.listSessions({
        page: 1,
        limit: 300,
        sortBy: "createdAt",
        order: "desc",
        search: undefined,
      });

      setCoaches(Array.isArray(coachesRes?.coaches) ? coachesRes.coaches : []);
      setSessions(Array.isArray(sessionsRes?.sessions) ? sessionsRes.sessions : []);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [demo]);

  const queryParams = useMemo(
    () => ({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      coachId: coachId || undefined,
      sessionId: sessionId || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
    [startDate, endDate, coachId, sessionId, statusFilter],
  );

  const payrollQueryParams = useMemo(
    () => ({
      startDate: payrollStartDate || undefined,
      endDate: payrollEndDate || undefined,
    }),
    [payrollStartDate, payrollEndDate],
  );

  const loadAttendanceHistory = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const data = demo.listAttendanceHistory({
        ...queryParams,
        page,
        limit,
      });

      setRecords(Array.isArray(data?.records) ? data.records : []);
      setTotalItems(Number(data?.totalItems) || 0);
      setTotalPages(Number(data?.totalPages) || 1);
      const resolvedPage = Number(data?.currentPage) || page;
      if (resolvedPage !== page) {
        setPage(resolvedPage);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setRecords([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [demo, queryParams, page, limit]);

  const loadPayrollSummary = useCallback(() => {
    setSummaryLoading(true);
    try {
      const data = demo.getPayrollSummary(payrollQueryParams);
      setPayroll(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err));
      setPayroll([]);
    } finally {
      setSummaryLoading(false);
    }
  }, [demo, payrollQueryParams]);

  useEffect(() => {
    loadReferences();
  }, [loadReferences]);

  useEffect(() => {
    loadAttendanceHistory();
  }, [loadAttendanceHistory]);

  useEffect(() => {
    loadPayrollSummary();
  }, [loadPayrollSummary]);

  useEffect(() => {
    setPage(1);
  }, [startDate, endDate, coachId, sessionId, statusFilter, limit]);

  const emptyHint = loading
    ? "Loading attendance..."
    : "No attendance records for this date range.";

  function handlePayrollMonthChange(value) {
    setPayrollMonth(value);
    const range = monthToDateRange(value);
    if (!range) {
      setPayrollStartDate("");
      setPayrollEndDate("");
      return;
    }
    setPayrollStartDate(range.startDate);
    setPayrollEndDate(range.endDate);
  }

  async function confirmClearAttendance() {
    setClearSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      demo.clearAttendance();
      loadAttendanceHistory();
      loadPayrollSummary();
      setClearOpen(false);
      setSuccessMessage("All attendance cleared");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setClearSubmitting(false);
    }
  }

  return (
    <div className="animate-fade-in space-y-4 md:space-y-6">

      {error && (
        <div className="rounded-2xl border border-amber-500/35 bg-amber-950/35 px-4 py-3 text-sm text-amber-100">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="rounded-2xl border border-cyan-500/35 bg-cyan-950/30 px-4 py-3 text-sm text-cyan-100">
          {successMessage}
        </div>
      )}

      <section className="toolbar-strip">
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-6">
          <label className="space-y-2 text-sm">
            <span className="text-slate-400">Start date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field !mt-0"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-slate-400">End date</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field !mt-0"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-slate-400">Coach</span>
            <select
              value={coachId}
              onChange={(e) => setCoachId(e.target.value)}
              className="input-field-select !mt-0"
            >
              <option value="">All coaches</option>
              {coaches.map((coach) => (
                <option key={coach._id} value={coach._id}>
                  {coach.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-slate-400">Session group</span>
            <select
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="input-field-select !mt-0"
            >
              <option value="">All sessions</option>
              {sessions.map((session) => (
                <option key={session._id} value={session._id}>
                  {formatSessionSchedule(session)}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-slate-400">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field-select !mt-0"
            >
              <option value="all">All</option>
              <option value="attended">Attended</option>
              <option value="not_attended">Not attended</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-slate-400">Rows per page</span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value) || 10)}
              className="input-field-select !mt-0"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>

        <div className="flex w-full flex-col gap-2 border-t border-white/5 pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <button type="button" onClick={handleExportAttendance} className="btn-primary w-full sm:w-auto">
            Export attendance CSV
          </button>
          <button
            type="button"
            onClick={handleExportPayroll}
            className="btn-secondary w-full border-cyan-500/35 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/15 sm:w-auto"
          >
            Export payroll CSV
          </button>
          <button
            type="button"
            onClick={() => setClearOpen(true)}
            disabled={clearSubmitting || loading || summaryLoading}
            className="btn-secondary w-full border-red-500/45 bg-red-950/35 text-red-100 hover:border-red-400/60 hover:bg-red-950/55 sm:w-auto"
          >
            {clearSubmitting ? "Clearing..." : "Clear Attendance Data"}
          </button>
        </div>
      </section>

      <section className="table-shell">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700/50 text-sm">
            <thead className="bg-slate-900/70 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-4 font-medium">Date</th>
                <th className="px-4 py-4 font-medium">Coach</th>
                <th className="px-4 py-4 font-medium">Session</th>
                <th className="px-4 py-4 font-medium">Duration</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="h-4 rounded bg-slate-800" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 rounded bg-slate-800" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 rounded bg-slate-800" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 rounded bg-slate-800" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 rounded bg-slate-800" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 rounded bg-slate-800" />
                    </td>
                  </tr>
                ))
              ) : records.length ? (
                records.map((record) => (
                  <tr key={record._id} className="table-row-hover odd:bg-slate-900/15 even:bg-transparent">
                    <td className="px-5 py-4 text-slate-200">{formatDateOnly(record.date)}</td>
                    <td className="px-5 py-4 text-slate-200">{record.coachId?.name ?? "—"}</td>
                    <td className="px-5 py-4 text-slate-300">{formatSessionSchedule(record.sessionId)}</td>
                    <td className="px-5 py-4 text-slate-200">
                      {formatDuration(record.durationMinutes ?? hoursToMinutes(record.durationHours))}
                    </td>
                    <td className="px-5 py-4">
                      {record.attended === false ? (
                        <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/15 px-3 py-1 text-xs font-medium text-red-200">
                          ✕ Not attended
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-200">
                          ✓ Attended
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {record.attended === false ? (
                        <button
                          type="button"
                          onClick={() => {
                            setDetailsNote(record.reason?.trim() || record.note?.trim() || "No reason provided.");
                            setDetailsOpen(true);
                          }}
                          className="rounded-xl border border-red-500/30 bg-red-950/25 px-3 py-1.5 text-xs font-medium text-red-200 transition hover:bg-red-950/40"
                        >
                          Details
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-5 py-12 text-center text-slate-500" colSpan={6}>
                    {emptyHint}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <CoachesPagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        limit={limit}
        loading={loading}
        onPrev={() => setPage((current) => Math.max(1, current - 1))}
        onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
      />

      <section className="card-float space-y-4">
        <div className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/90">Payroll summary</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm">
              <span className="text-slate-400">Month</span>
              <input
                type="month"
                value={payrollMonth}
                onChange={(e) => handlePayrollMonthChange(e.target.value)}
                className="input-field !mt-0"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-slate-400">Payroll start date</span>
              <input
                type="date"
                value={payrollStartDate}
                onChange={(e) => {
                  setPayrollMonth("");
                  setPayrollStartDate(e.target.value);
                }}
                className="input-field !mt-0"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-slate-400">Payroll end date</span>
              <input
                type="date"
                value={payrollEndDate}
                onChange={(e) => {
                  setPayrollMonth("");
                  setPayrollEndDate(e.target.value);
                }}
                className="input-field !mt-0"
              />
            </label>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-700/50">
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700/50 text-sm">
            <thead className="bg-slate-900/70 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-4 font-medium">Coach name</th>
                <th className="px-4 py-4 font-medium">Total time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {summaryLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="h-4 rounded bg-slate-800" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 rounded bg-slate-800" />
                    </td>
                  </tr>
                ))
              ) : payroll.length ? (
                payroll.map((item) => (
                  <tr key={String(item.coachId)} className="table-row-hover odd:bg-slate-900/15 even:bg-transparent">
                    <td className="px-5 py-4 text-slate-200">{item.coachName}</td>
                    <td className="px-5 py-4 text-sky-100">
                      {formatDuration(item.totalMinutes ?? hoursToMinutes(item.totalHours))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-5 py-12 text-center text-slate-500" colSpan={2}>
                    No payroll data for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </section>

      <ConfirmModal
        open={clearOpen}
        title="Clear attendance data"
        message="This will permanently delete all attendance records."
        confirmLabel="Clear attendance data"
        onConfirm={confirmClearAttendance}
        onCancel={() => {
          if (clearSubmitting) return;
          setClearOpen(false);
        }}
        loading={clearSubmitting}
      />

      <ConfirmModal
        open={detailsOpen}
        title="Absence details"
        message={
          <span
            dir={detailsNoteIsArabic ? "rtl" : "ltr"}
            className={`block whitespace-pre-wrap break-words leading-relaxed ${
              detailsNoteIsArabic ? "text-right" : "text-left"
            }`}
          >
            {detailsNote}
          </span>
        }
        confirmLabel="Close"
        onConfirm={() => setDetailsOpen(false)}
        onCancel={() => setDetailsOpen(false)}
        loading={false}
        danger={false}
        hideConfirm
      />
    </div>
  );
}
