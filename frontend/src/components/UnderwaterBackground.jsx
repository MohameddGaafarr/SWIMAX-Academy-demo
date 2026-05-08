import { memo } from "react";

const BUBBLES = [
  { left: "8%", size: 10, duration: 10.5, delay: 0.0, drift: -10, opacity: 0.28 },
  { left: "16%", size: 6, duration: 8.8, delay: 1.7, drift: 12, opacity: 0.22 },
  { left: "22%", size: 14, duration: 12.6, delay: 0.9, drift: -18, opacity: 0.26 },
  { left: "29%", size: 8, duration: 9.4, delay: 2.6, drift: 14, opacity: 0.2 },
  { left: "36%", size: 18, duration: 14.0, delay: 3.2, drift: -20, opacity: 0.22 },
  { left: "41%", size: 7, duration: 8.6, delay: 0.4, drift: 10, opacity: 0.18 },
  { left: "47%", size: 12, duration: 11.2, delay: 2.1, drift: -14, opacity: 0.24 },
  { left: "52%", size: 5, duration: 7.9, delay: 1.1, drift: 8, opacity: 0.16 },
  { left: "58%", size: 16, duration: 13.4, delay: 4.0, drift: 18, opacity: 0.22 },
  { left: "63%", size: 9, duration: 9.8, delay: 2.9, drift: -10, opacity: 0.2 },
  { left: "69%", size: 7, duration: 8.2, delay: 3.6, drift: 12, opacity: 0.17 },
  { left: "74%", size: 20, duration: 15.6, delay: 1.8, drift: -22, opacity: 0.2 },
  { left: "79%", size: 11, duration: 10.7, delay: 4.6, drift: 14, opacity: 0.21 },
  { left: "84%", size: 6, duration: 8.5, delay: 0.7, drift: -8, opacity: 0.16 },
  { left: "89%", size: 15, duration: 12.9, delay: 3.9, drift: 18, opacity: 0.22 },
  { left: "92%", size: 8, duration: 9.1, delay: 5.2, drift: -12, opacity: 0.19 },
  { left: "12%", size: 22, duration: 16.2, delay: 4.8, drift: 22, opacity: 0.18 },
  { left: "33%", size: 4, duration: 7.4, delay: 5.8, drift: -6, opacity: 0.14 },
];

function UnderwaterBackgroundBase() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Deep ocean base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#031a2b] via-[#041325] to-[#010711]" />

      {/* Soft cyan glow blobs */}
      <div className="absolute -left-40 top-10 h-[560px] w-[560px] rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute -right-56 top-40 h-[720px] w-[720px] rounded-full bg-sky-400/10 blur-3xl" />
      <div className="absolute left-1/2 top-[58%] h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/5 blur-[90px]" />

      {/* Subtle moving light rays */}
      <div className="absolute inset-0 uw-rays opacity-60" />

      {/* Ambient particles/bokeh (very subtle) */}
      <div className="absolute inset-0 uw-sparkle opacity-40" />

      {/* Floating bubbles */}
      <div className="absolute inset-0">
        {BUBBLES.map((b, idx) => (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
            className="uw-bubble"
            style={{
              left: b.left,
              width: `${b.size}px`,
              height: `${b.size}px`,
              opacity: b.opacity,
              ["--uw-drift"]: `${b.drift}px`,
              ["--uw-dur"]: `${b.duration}s`,
              ["--uw-delay"]: `${b.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

const UnderwaterBackground = memo(UnderwaterBackgroundBase);
UnderwaterBackground.displayName = "UnderwaterBackground";

export default UnderwaterBackground;

