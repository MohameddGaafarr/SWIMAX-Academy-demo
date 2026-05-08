import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api.js";
import TraineeTable from "../components/TraineeTable.jsx";
import TraineeForm from "../components/TraineeForm.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import TraineesToolbar from "../components/TraineesToolbar.jsx";
import CoachesPagination from "../components/CoachesPagination.jsx";
import FullscreenModal from "../components/FullscreenModal.jsx";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";

function getErrorMessage(err) {
  const msg = err?.response?.data?.message;
  if (typeof msg === "string") return msg;
  return "Something went wrong";
}

export default function TraineesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  const [level, setLevel] = useState("");

  const [trainees, setTrainees] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filtersRef = useRef({
    search: debouncedSearch,
    sortBy,
    order,
    limit,
    level,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingTrainee, setEditingTrainee] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingTrainee, setDeletingTrainee] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const loadTrainees = useCallback(async () => {
    const prev = filtersRef.current;
    const filtersKey = `${debouncedSearch}|${sortBy}|${order}|${limit}|${level}`;
    const prevKey = `${prev.search}|${prev.sortBy}|${prev.order}|${prev.limit}|${prev.level}`;
    const filtersChanged = filtersKey !== prevKey;

    let pageParam = page;

    if (filtersChanged) {
      pageParam = 1;
      filtersRef.current = {
        search: debouncedSearch,
        sortBy,
        order,
        limit,
        level,
      };
      if (page !== 1) setPage(1);
    }

    setError(null);
    setLoading(true);

    try {
      const { data } = await api.get("/api/trainees", {
        params: {
          search: debouncedSearch.trim() || undefined,
          page: pageParam,
          limit,
          sortBy,
          order,
          level: level || undefined,
        },
      });

      setTrainees(Array.isArray(data?.trainees) ? data.trainees : []);
      setTotalItems(Number(data?.totalItems) || 0);
      setTotalPages(Number(data?.totalPages) || 1);

      const resolvedPage = Number(data?.currentPage) || pageParam;
      if (resolvedPage !== page) setPage(resolvedPage);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, limit, sortBy, order, level]);

  useEffect(() => {
    loadTrainees();
  }, [loadTrainees]);

  function handleSortByChange(next) {
    setSortBy(next);
    setOrder(next === "name" || next === "level" ? "asc" : "desc");
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
      setOrder(field === "name" || field === "level" ? "asc" : "desc");
    }
    setPage(1);
  }

  function openCreate() {
    setFormMode("create");
    setEditingTrainee(null);
    setFormOpen(true);
  }

  function openEdit(trainee) {
    setFormMode("edit");
    setEditingTrainee(trainee);
    setFormOpen(true);
  }

  function closeForm() {
    if (formSubmitting) return;
    setFormOpen(false);
    setEditingTrainee(null);
  }

  /* 🔥🔥🔥 أهم تعديل هنا */
  async function handleFormSubmit(payload) {
    setFormSubmitting(true);
    setError(null);

    try {
      if (formMode === "create") {
        await api.post("/api/trainees", payload);
      } else if (editingTrainee?._id) {
        await api.put(`/api/trainees/${editingTrainee._id}`, payload);
      }

      await loadTrainees();
      setFormOpen(false);
      setEditingTrainee(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  }

  function openDelete(trainee) {
    setDeletingTrainee(trainee);
    setDeleteOpen(true);
  }

  function closeDelete() {
    if (deleteSubmitting) return;
    setDeleteOpen(false);
    setDeletingTrainee(null);
  }

  async function confirmDelete() {
    if (!deletingTrainee?._id) return;

    setDeleteSubmitting(true);
    setError(null);

    try {
      await api.delete(`/api/trainees/${deletingTrainee._id}`);
      await loadTrainees();
      setDeleteOpen(false);
      setDeletingTrainee(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleteSubmitting(false);
    }
  }

  const emptyHint =
    totalItems === 0 && debouncedSearch.trim()
      ? "No trainees match your search."
      : totalItems === 0
      ? "No trainees yet."
      : null;

  return (
    <div className="animate-fade-in space-y-4 md:space-y-5">
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-950/35 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      <TraineesToolbar
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortByChange={handleSortByChange}
        order={order}
        onOrderChange={handleOrderChange}
        limit={limit}
        onLimitChange={handleLimitChange}
        level={level}
        onLevelChange={setLevel}
      />

      <div className="flex justify-end">
        <button type="button" onClick={openCreate} className="btn-primary inline-flex w-full shrink-0 sm:w-auto">
          Add trainee
        </button>
      </div>

      <TraineeTable
        trainees={trainees}
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

      <FullscreenModal
        open={formOpen}
        onClose={closeForm}
        closeDisabled={formSubmitting}
        title={formMode === "create" ? "Add Trainee" : "Edit Trainee"}
        maxWidthClassName="max-w-4xl"
      >
        <TraineeForm
          initialValues={
            editingTrainee || {
              name: "",
              age: "",
              phone: "",
              address: "",
              level: "Underwater Skills",
              notes: "",
            }
          }
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
          submitting={formSubmitting}
        />
      </FullscreenModal>
      <ConfirmModal
        open={deleteOpen}
        title="Delete trainee?"
        message={`Delete ${deletingTrainee?.name || ""}?`}
        onConfirm={confirmDelete}
        onCancel={closeDelete}
        loading={deleteSubmitting}
      />
    </div>
  );
}
