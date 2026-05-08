import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";

function getErrorMessage(err) {
  const msg = err?.response?.data?.message;
  if (typeof msg === "string") return msg;
  return "Failed to update password";
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setSuccess(data?.message || "Password changed successfully");
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-800/70 via-slate-900/65 to-slate-950/85 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.06),0_14px_44px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(34,211,238,0.14),transparent_55%)]" aria-hidden />
        <h1 className="relative text-xl font-semibold tracking-tight text-white">Change Password</h1>

        <form className="relative mt-5 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl border border-amber-500/35 bg-amber-950/35 px-4 py-3 text-sm text-amber-100">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-cyan-500/35 bg-cyan-950/35 px-4 py-3 text-sm text-cyan-100">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-300">
              Current Password
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                autoComplete="current-password"
                className="input-field pr-11"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300/45 transition hover:text-cyan-200"
                aria-label={showCurrentPassword ? "Hide password" : "Show password"}
              >
                {showCurrentPassword ? (
                  <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
                    <path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path
                      d="M2 10s3.5-6 8-6c1.6 0 3.1.5 4.3 1.3M18 10s-3.5 6-8 6c-1.6 0-3.1-.5-4.3-1.3"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
                    <path
                      d="M2 10s3.5-6 8-6 8 6 8 6-3.5 6-8 6-8-6-8-6Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                className="input-field pr-11"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300/45 transition hover:text-cyan-200"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? (
                  <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
                    <path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path
                      d="M2 10s3.5-6 8-6c1.6 0 3.1.5 4.3 1.3M18 10s-3.5 6-8 6c-1.6 0-3.1-.5-4.3-1.3"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
                    <path
                      d="M2 10s3.5-6 8-6 8 6 8 6-3.5 6-8 6-8-6-8-6Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                className="input-field pr-11"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300/45 transition hover:text-cyan-200"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
                    <path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path
                      d="M2 10s3.5-6 8-6c1.6 0 3.1.5 4.3 1.3M18 10s-3.5 6-8 6c-1.6 0-3.1-.5-4.3-1.3"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
                    <path
                      d="M2 10s3.5-6 8-6 8 6 8 6-3.5 6-8 6-8-6-8-6Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="pt-1">
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
