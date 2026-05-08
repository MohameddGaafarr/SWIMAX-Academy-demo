export default function CoachesPagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  loading,
  onPrev,
  onNext,
}) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const end = Math.min(totalItems, currentPage * limit);

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-slate-700/50 bg-slate-800/40 px-4 py-3.5 text-sm text-slate-300 shadow-float backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-slate-400 leading-snug">
        {totalItems === 0 ? (
          <>No results</>
        ) : (
          <>
            Showing <span className="font-medium text-sky-200">{start}</span>–
            <span className="font-medium text-sky-200">{end}</span> of{" "}
            <span className="font-medium text-sky-200">{totalItems}</span>
          </>
        )}
        <span className="mx-2 text-slate-600">·</span>
        Page <span className="font-medium text-slate-200">{currentPage}</span> of{" "}
        <span className="font-medium text-slate-200">{totalPages}</span>
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={loading || currentPage <= 1}
          className="btn-secondary rounded-xl px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={loading || currentPage >= totalPages}
          className="btn-secondary rounded-xl px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
