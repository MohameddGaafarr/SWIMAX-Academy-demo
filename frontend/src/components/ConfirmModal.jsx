import FullscreenModal from "./FullscreenModal.jsx";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  danger = true,
  hideConfirm = false,
}) {
  const isMessageText = typeof message === "string";

  return (
    <FullscreenModal
      open={open}
      onClose={onCancel}
      closeDisabled={loading}
      title={title}
      maxWidthClassName="max-w-xl"
    >
      <div
        className="space-y-6"
      >
        {message &&
          (isMessageText ? (
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{message}</p>
          ) : (
            <div className="mt-3 text-sm leading-relaxed text-slate-400">{message}</div>
          ))}
        <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-700/50">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          {!hideConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition duration-200 disabled:opacity-50 ${
                danger
                  ? "bg-red-600 hover:bg-red-500"
                  : "btn-primary"
              }`}
            >
              {loading ? "Please wait…" : confirmLabel}
            </button>
          )}
        </div>
      </div>
    </FullscreenModal>
  );
}
