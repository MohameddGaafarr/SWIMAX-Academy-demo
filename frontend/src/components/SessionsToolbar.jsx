export default function SessionsToolbar({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  order,
  onOrderChange,
  limit,
  onLimitChange,
  actions = null,
}) {
  return (
    <div className="space-y-4">

      {/* 🔥 FILTERS ROW */}
      <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr] items-end">

        {/* SEARCH */}
        <div>
          <label
            htmlFor="session-search"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            Search coach or day
          </label>
          <input
            id="session-search"
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Coach name or weekday"
            className="input-field mt-2 w-full !px-3 !py-2 ring-sky-500/20 placeholder:text-slate-500"
            autoComplete="off"
          />
        </div>

        {/* SORT */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="input-field-select mt-2 w-full !px-3 !py-2"
          >
            <option value="createdAt">Created</option>
            <option value="traineeCount">No. of trainees</option>
          </select>
        </div>

        {/* ORDER */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Order
          </label>
          <select
            value={order}
            onChange={(e) => onOrderChange(e.target.value)}
            className="input-field-select mt-2 w-full !px-3 !py-2"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        {/* LIMIT */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Per page
          </label>
          <select
            value={String(limit)}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="input-field-select mt-2 w-full !px-3 !py-2"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* 🔥 BUTTONS ROW (لوحدها تحت + يمين) */}
      {actions && (
        <div className="flex justify-end gap-2 pt-2">
          {actions}
        </div>
      )}
    </div>
  );
}