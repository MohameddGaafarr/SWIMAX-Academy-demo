import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api.js";
import CoachTable from "../components/CoachTable.jsx";
import CoachForm from "../components/CoachForm.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import CoachesToolbar from "../components/CoachesToolbar.jsx";
import CoachesPagination from "../components/CoachesPagination.jsx";
import FullscreenModal from "../components/FullscreenModal.jsx";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";

function getErrorMessage(err) {
  const msg = err?.response?.data?.message;
  if (typeof msg === "string") return msg;
  return "Something went wrong";
}

export default function CoachesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  const [coaches, setCoaches] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filtersRef = useRef({
    search: debouncedSearch,
    sortBy,
    order,
    limit,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingCoach, setEditingCoach] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCoach, setDeletingCoach] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const loadCoaches = useCallback(async () => {
    const prev = filtersRef.current;
    const filtersKey = `${debouncedSearch}|${sortBy}|${order}|${limit}`;
    const prevKey = `${prev.search}|${prev.sortBy}|${prev.order}|${prev.limit}`;
    const filtersChanged = filtersKey !== prevKey;

    let pageParam = page;
    if (filtersChanged) {
      pageParam = 1;
      filtersRef.current = { search: debouncedSearch, sortBy, order, limit };
      if (page !== 1) setPage(1);
    }

    setError(null);
    setLoading(true);

    try {
      const { data } = await api.get("/api/coaches", {
        params: {
          search: debouncedSearch.trim() || undefined,
          page: pageParam,
          limit,
          sortBy,
          order,
        },
      });

      setCoaches(Array.isArray(data?.coaches) ? data.coaches : []);
      setTotalItems(Number(data?.totalItems) || 0);
      setTotalPages(Number(data?.totalPages) || 1);

      const resolvedPage = Number(data?.currentPage) || pageParam;
      if (resolvedPage !== page) setPage(resolvedPage);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, limit, sortBy, order]);

  useEffect(() => {
    loadCoaches();
  }, [loadCoaches]);

  function handleSortByChange(next) {
    setSortBy(next);
    setOrder(next === "name" ? "asc" : "desc");
    setPage(1);
  }

  function handleOrderChange(next) {
    setOrder(next);
    setPage(1);
  }

  function handleLimitChange(next) {
    setLimit(next);
    setPage(1);
  }

  function handleSortColumn(field) {
    if (field === sortBy) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setOrder(field === "name" ? "asc" : "desc");
    }
    setPage(1);
  }

  function openCreate() {
    setFormMode("create");
    setEditingCoach(null);
    setFormOpen(true);
  }

  function openEdit(coach) {
    setFormMode("edit");
    setEditingCoach(coach);
    setFormOpen(true);
  }

  function closeForm() {
    if (formSubmitting) return;
    setFormOpen(false);
    setEditingCoach(null);
  }

  async function handleFormSubmit(payload) {
    setFormSubmitting(true);
    setError(null);

    try {
      if (formMode === "create") {
        await api.post("/api/coaches", payload);
      } else if (editingCoach?._id) {
        await api.put(`/api/coaches/${editingCoach._id}`, payload);
      }

      await loadCoaches();
      setFormOpen(false);
      setEditingCoach(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  }

  function openDelete(coach) {
    setDeletingCoach(coach);
    setDeleteOpen(true);
  }

  function closeDelete() {
    if (deleteSubmitting) return;
    setDeleteOpen(false);
    setDeletingCoach(null);
  }

  async function confirmDelete() {
    if (!deletingCoach?._id) return;

    setDeleteSubmitting(true);
    setError(null);

    try {
      await api.delete(`/api/coaches/${deletingCoach._id}`);
      await loadCoaches();
      setDeleteOpen(false);
      setDeletingCoach(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleteSubmitting(false);
    }
  }

  const emptyHint =
    totalItems === 0 && debouncedSearch.trim()
      ? "No coaches match your search."
      : totalItems === 0
      ? "No coaches yet."
      : null;

  return (
    <div className="animate-fade-in space-y-3 md:space-y-3">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/30 px-3 py-2 text-xs text-red-100">
          {error}
        </div>
      )}

      <CoachesToolbar
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortByChange={handleSortByChange}
        order={order}
        onOrderChange={handleOrderChange}
        limit={limit}
        onLimitChange={handleLimitChange}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="btn-primary inline-flex w-full shrink-0 rounded-2xl px-4 py-2.5 sm:w-auto"
        >
          Add coach
        </button>
      </div>

      <CoachTable
        coaches={coaches}
        loading={loading}
        onEdit={openEdit}
        onDelete={openDelete}
        sortBy={sortBy}
        order={order}
        onSortColumn={handleSortColumn}
        emptyHint={emptyHint}
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

      {/* 🔥 FORM MODAL */}
      <FullscreenModal
        open={formOpen}
        onClose={closeForm}
        closeDisabled={formSubmitting}
        title={formMode === "create" ? "Add Coach" : "Edit Coach"}
        maxWidthClassName="max-w-3xl"
      >
        <CoachForm
          initialValues={
            editingCoach
              ? {
                  name: editingCoach.name,
                  age: editingCoach.age,
                  phone: editingCoach.phone ?? "",
                  address: editingCoach.address ?? "",
                  bio: editingCoach.bio ?? "",
                  image: editingCoach.image || "",
                }
              : {
                  name: "",
                  age: "",
                  phone: "",
                  address: "",
                  bio: "",
                  image: "",
                }
          }
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
          submitting={formSubmitting}
        />
      </FullscreenModal>

      <ConfirmModal
        open={deleteOpen}
        title="Delete coach?"
        message={`Delete ${deletingCoach?.name || ""}?`}
        onConfirm={confirmDelete}
        onCancel={closeDelete}
        loading={deleteSubmitting}
      />
    </div>
  );
}