import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

export default function FullscreenModal({
  open,
  onClose,
  title,
  children,
  closeDisabled = false,
  maxWidthClassName = "max-w-5xl",
}) {
  const resolvedTitle = useMemo(() => title ?? "", [title]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key !== "Escape") return;
      if (closeDisabled) return;
      onClose?.();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, closeDisabled]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/70 px-3 pb-6 pt-8 backdrop-blur-lg md:px-4 md:pb-10 md:pt-20"
      role="dialog"
      aria-modal="true"
      aria-label={resolvedTitle || "Dialog"}
      onMouseDown={(e) => {
        if (closeDisabled) return;
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={[
          "relative w-full",
          maxWidthClassName,
          "max-h-[92vh] overflow-hidden rounded-2xl border border-white/10 md:max-h-[85vh] md:rounded-3xl",
          "bg-[rgba(10,22,46,0.9)] backdrop-blur-xl shadow-2xl",
          "animate-[uwModalIn_160ms_ease-out]",
        ].join(" ")}
      >
        {/* Glow Effects */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(34,211,238,0.14),transparent_55%)]" />
        <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />

        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-white/10 px-4 pb-3 pt-4 md:px-6 md:pb-4 md:pt-5">
          <h2 className="text-base font-semibold text-slate-100">
            {resolvedTitle}
          </h2>

          {/* 🔥 NEW CLEAN CLOSE BUTTON */}
          <button
            type="button"
            onClick={() => {
              if (closeDisabled) return;
              onClose?.();
            }}
            aria-label="Close"
            disabled={closeDisabled}
            className="flex h-9 w-9 items-center justify-center rounded-full
                       border border-sky-400/30
                       bg-sky-500/10 text-sky-200
                       transition duration-200
                       hover:bg-sky-500/20 hover:text-white
                       hover:shadow-[0_0_10px_rgba(56,189,248,0.5)]
                       disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-lg leading-none">✕</span>
          </button>
        </div>

        {/* Body */}
        <div className="relative max-h-[calc(92vh-56px)] overflow-y-auto px-4 py-4 custom-scroll md:max-h-[calc(85vh-64px)] md:px-6 md:py-5">
          {children}
        </div>
      </div>

      {/* 🔥 Scrollbar Style */}
      <style>{`
        @keyframes uwModalIn {
          from { opacity: 0; transform: translateY(10px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.4);
          border-radius: 999px;
        }

        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(56, 189, 248, 0.7);
        }
      `}</style>
    </div>,
    document.body
  );
}