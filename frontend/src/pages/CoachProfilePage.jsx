import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api.js";
import { formatDuration, hoursToMinutes } from "../utils/formatDuration.js";

function getErrorMessage(err) {
  const msg = err?.response?.data?.message;
  if (typeof msg === "string") return msg;
  return "Something went wrong";
}

// 🔥 Smart text component (auto RTL / LTR)
function SmartText({ text, className = "" }) {
  const isArabic = /[\u0600-\u06FF]/.test(text || "");
  return (
    <p
      dir={isArabic ? "rtl" : "ltr"}
      className={`${className} ${isArabic ? "text-right" : "text-left"}`}
    >
      {text || "—"}
    </p>
  );
}

export default function CoachProfilePage() {
  const { id } = useParams();

  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const { data } = await api.get(`/api/coaches/${id}`);
        if (!cancelled) setCoach(data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-32 rounded bg-slate-800" />
        <div className="h-64 rounded-2xl bg-slate-800/80" />
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="space-y-6">
        <Link to="/coaches" className="link-back">
          ← Back to coaches
        </Link>

        <div className="error-box">{error || "Coach not found."}</div>
      </div>
    );
  }

  const imageUrl = coach.image?.startsWith("http")
    ? coach.image
    : coach.image
    ? `${import.meta.env.VITE_API_URL}/${coach.image}`
    : null;

  const firstLetter = coach.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="animate-fade-in space-y-4 md:space-y-5">
      <Link to="/coaches" className="link-back">
        ← Back to coaches
      </Link>

      <div className="card-float overflow-hidden p-0">
        {/* Header */}
        <div className="border-b border-sky-500/10 bg-gradient-to-r from-sky-500/10 via-transparent to-cyan-500/10 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/90">
            SWIMAX · Coach
          </p>

          <SmartText
            text={coach.name}
            className="mt-2 text-2xl font-semibold text-white md:text-3xl"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 p-5 md:grid md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
          
          {/* Image */}
          <div className="mx-auto w-full md:mx-0">
            <div className="relative h-[240px] w-full overflow-hidden rounded-2xl border border-sky-500/20 shadow-glow-sm md:h-[260px]">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />

              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-6xl font-bold text-sky-400/50">
                  {firstLetter}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex h-full flex-col gap-4">
            <div className="grid h-full gap-4 sm:grid-cols-2">

              {/* Name */}
              <div className="profile-stat">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Name
                </p>
                <SmartText
                  text={coach.name}
                  className="mt-2 text-lg font-medium text-white"
                />
              </div>

              {/* Age */}
              <div className="profile-stat">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Age
                </p>
                <p className="mt-2 text-lg font-medium text-white">
                  {coach.age}
                </p>
              </div>

              {/* Phone */}
              <div className="profile-stat">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Phone
                </p>
                <SmartText
                  text={coach.phone}
                  className="mt-2 text-slate-300"
                />
              </div>

              {/* Address */}
              <div className="profile-stat">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Address
                </p>
                <SmartText
                  text={coach.address}
                  className="mt-2 text-slate-300"
                />
              </div>

              {/* Bio */}
              <div className="profile-stat overflow-visible sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Bio
                </p>
                <SmartText
                  text={coach.bio}
                  className="mt-2 whitespace-pre-wrap break-words leading-relaxed text-slate-300"
                />
              </div>

              {/* Hours */}
              <div className="profile-stat border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total pool hours
                </p>
                <p className="mt-2 bg-gradient-to-r from-sky-300 to-cyan-400 bg-clip-text text-2xl font-bold text-transparent">
                  {formatDuration(hoursToMinutes(coach.totalWorkingHours))}
                </p>
              </div>

              {/* Created */}
              <div className="profile-stat">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Record created
                </p>
                <p className="mt-2 text-slate-300">
                  {coach.createdAt
                    ? new Date(coach.createdAt).toLocaleString()
                    : "—"}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}