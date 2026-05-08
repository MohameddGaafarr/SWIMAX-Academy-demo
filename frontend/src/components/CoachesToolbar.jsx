export default function CoachesToolbar({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  order,
  onOrderChange,
  limit,
  onLimitChange,
}) {
  return (
    <div className="toolbar-strip">
      <div className="min-w-[200px] flex-1">
        <label htmlFor="coach-search" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Search by name
        </label>
        <input
          id="coach-search"
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Type to filter…"
          className="input-field mt-2 placeholder:text-slate-500"
          autoComplete="off"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <div>
          <label htmlFor="coach-sort" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Sort by
          </label>
          <select
            id="coach-sort"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="input-field-select mt-2 sm:w-44"
          >
            <option value="name">Name</option>
            <option value="age">Age</option>
            <option value="totalWorkingHours">Total hours</option>
            <option value="createdAt">Created</option>
          </select>
        </div>
        <div>
          <label htmlFor="coach-order" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Order
          </label>
          <select
            id="coach-order"
            value={order}
            onChange={(e) => onOrderChange(e.target.value)}
            className="input-field-select mt-2 sm:w-36"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="coach-limit" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Per page
          </label>
          <select
            id="coach-limit"
            value={String(limit)}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="input-field-select mt-2 sm:w-32"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
    </div>
  );
}
