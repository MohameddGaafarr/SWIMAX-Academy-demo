import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import UnderwaterBackground from "../components/UnderwaterBackground.jsx";

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden px-5">
      <UnderwaterBackground />

      <div className="relative z-10 w-full max-w-[440px] animate-fade-in">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-[#0d2240]/90 to-[#08162c]/95 px-7 pb-7 pt-7 shadow-[0_0_0_1px_rgba(0,196,255,0.06),0_8px_32px_rgba(0,0,0,0.5),0_0_80px_rgba(0,196,255,0.08),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(0,229,255,0.10),transparent_60%)]"
            aria-hidden
          />

          {/* Brand */}
          <div className="relative mb-6 flex flex-col items-center gap-1.5 text-center">
            <div className="mb-1 flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(0,196,255,0.15),transparent_70%)]">
              <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden="true">
                <path
                  d="M6 30 Q12 22 18 30 Q24 38 30 30 Q36 22 42 30"
                  stroke="url(#waveGrad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M6 36 Q12 28 18 36 Q24 44 30 36 Q36 28 42 36"
                  stroke="url(#waveGrad2)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.5"
                />
                <circle cx="24" cy="16" r="7" fill="url(#circleGrad)" />
                <defs>
                  <linearGradient id="waveGrad" x1="6" y1="30" x2="42" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00c4ff" />
                    <stop offset="1" stopColor="#00e5ff" />
                  </linearGradient>
                  <linearGradient id="waveGrad2" x1="6" y1="36" x2="42" y2="36" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0090c8" />
                    <stop offset="1" stopColor="#00c4ff" />
                  </linearGradient>
                  <radialGradient id="circleGrad" cx="50%" cy="40%" r="50%">
                    <stop stopColor="#00e5ff" />
                    <stop offset="1" stopColor="#0080b0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>

            <h1 className="text-[2.4rem] font-black leading-none tracking-[0.18em] text-cyan-200 drop-shadow-[0_0_30px_rgba(0,229,255,0.35)]">
              SWIMAX
            </h1>
            <p className="text-[0.78rem] font-normal uppercase tracking-[0.22em] text-slate-200/65">
              Swimming Academy
            </p>
          </div>

          <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent" />

          <form className="relative flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && (
              <div
                className="flex items-center gap-2.5 rounded-[10px] border border-rose-400/30 bg-rose-400/10 px-3.5 py-2.5 text-[0.85rem] text-rose-200"
                role="alert"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px] flex-shrink-0 text-rose-300">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10 6v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="10" cy="14" r="1" fill="currentColor" />
                </svg>
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-[18px]">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="username"
                  className="pl-0.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-200/65"
                >
                  Username
                </label>

                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-[14px] text-cyan-300/55">
                    <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
                      <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                      <path
                        d="M3 17c0-3.866 3.134-7 7-7s7 3.134 7 7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>

                  <input
                    id="username"
                    name="username"
                    autoComplete="username"
                    required
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={submitting}
                    className="w-full rounded-xl border border-cyan-300/15 bg-sky-950/60 px-[44px] py-3 pl-[42px] text-[0.95rem] text-slate-100 outline-none transition placeholder:text-cyan-200/25 focus:border-cyan-300/55 focus:bg-sky-950/70 focus:ring-[3px] focus:ring-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-[7px]">
                <label
                  htmlFor="password"
                  className="pl-0.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-200/65"
                >
                  Password
                </label>

                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-[14px] text-cyan-300/55">
                    <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
                      <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M7 9V6a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="10" cy="13.5" r="1.2" fill="currentColor" />
                    </svg>
                  </span>

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                    className="w-full rounded-xl border border-cyan-300/15 bg-sky-950/60 px-[44px] py-3 pl-[42px] pr-[44px] text-[0.95rem] text-slate-100 outline-none transition placeholder:text-cyan-200/25 focus:border-cyan-300/55 focus:bg-sky-950/70 focus:ring-[3px] focus:ring-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 text-cyan-300/45 transition hover:text-cyan-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
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
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group relative mt-1 flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-[#00aadd] to-[#00e0ff] px-4 py-2.5 text-[0.95rem] font-semibold tracking-[0.06em] text-[#041622] shadow-[0_4px_20px_rgba(0,196,255,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,196,255,0.50)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-75"
            >
              <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_50%,rgba(255,255,255,0.15))] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <span className="relative inline-flex items-center gap-2">
                {submitting ? "Diving in..." : "Dive In"}
                <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-1">
                  <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
