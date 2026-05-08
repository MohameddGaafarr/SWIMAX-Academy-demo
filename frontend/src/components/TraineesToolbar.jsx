export default function TraineesToolbar({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  order,
  onOrderChange,
  limit,
  onLimitChange,
  level,
  onLevelChange,
}) {
  return (
    <div className="toolbar-strip">
      <div className="w-full">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Search by name
        </label>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Type to filter…"
          className="input-field mt-2 placeholder:text-slate-500"
        />
      </div>

      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="input-field-select mt-2 w-full"
          >
            <option value="name">Name</option>
            <option value="age">Age</option>
            <option value="level">Level</option>
            <option value="createdAt">Created</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Order
          </label>
          <select
            value={order}
            onChange={(e) => onOrderChange(e.target.value)}
            className="input-field-select mt-2 w-full"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Per page
          </label>
          <select
            value={String(limit)}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="input-field-select mt-2 w-full"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Level
          </label>
          <select
            value={level}
            onChange={(e) => onLevelChange(e.target.value)}
            className="input-field-select mt-2 w-full"
          >
            <option value="">All</option>
            <option value="Underwater Skills">Underwater Skills</option>
            <option value="Streamline Fundamentales">Streamline Fundamentales</option>
            <option value="Float & swim">Float & swim</option>
            <option value="Stroke Basics">Stroke Basics</option>
            <option value="Stroke Development">Stroke Development</option>
            <option value="Star 1&2 Training">Star 1&2 Training</option>
            <option value="Kicks Training">Kicks Training</option>
            <option value="Coordination Training">Coordination Training</option>
            <option value="Star 3 Training">Star 3 Training</option>
            <option value="Star 4 Training">Star 4 Training</option>
          </select>
        </div>
      </div>
    </div>
  );
}
