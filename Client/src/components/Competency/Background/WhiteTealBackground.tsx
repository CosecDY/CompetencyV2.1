import React from "react";

interface WhiteTealBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Decorative blobs for the main background.
 * Each entry is [className, styleObject].
 */
const MAIN_BLOBS: ReadonlyArray<[string, React.CSSProperties]> = [
  // Top and side blobs
  ["absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-200 via-blue-200 to-teal-100 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-pulse", {}],
  [
    "absolute top-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-teal-300 via-emerald-200 to-blue-100 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse",
    { animationDelay: "1s" },
  ],
  [
    "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-teal-100 via-blue-100 to-emerald-100 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse",
    { animationDelay: "2s" },
  ],
  // Lower and side blobs
  ["absolute bottom-1/4 left-1/4 w-56 h-56 bg-gradient-to-tl from-teal-200 via-blue-100 to-emerald-100 rounded-full mix-blend-multiply filter blur-2xl opacity-20", {}],
  ["absolute bottom-1/3 right-1/3 w-44 h-44 bg-gradient-to-br from-blue-200 via-teal-100 to-emerald-200 rounded-full mix-blend-multiply filter blur-2xl opacity-25", {}],
  ["absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-tr from-emerald-200 via-blue-100 to-teal-100 rounded-full mix-blend-multiply filter blur-2xl opacity-20", {}],
  // Framework-specific accent blobs
  ["absolute top-20 left-10 w-28 h-28 bg-gradient-to-br from-blue-200 via-blue-100 to-teal-100 rounded-full mix-blend-multiply filter blur-xl opacity-25", {}],
  ["absolute top-40 right-20 w-20 h-20 bg-gradient-to-tr from-emerald-200 via-emerald-100 to-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-25", {}],
  ["absolute top-2/3 left-20 w-32 h-32 bg-gradient-to-br from-blue-300 via-blue-100 to-teal-100 rounded-full mix-blend-multiply filter blur-xl opacity-20", {}],
  ["absolute bottom-1/3 right-10 w-24 h-24 bg-gradient-to-tl from-emerald-300 via-emerald-100 to-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20", {}],
  ["absolute bottom-20 right-20 w-36 h-36 bg-gradient-to-br from-emerald-200 via-emerald-100 to-teal-100 rounded-full mix-blend-multiply filter blur-xl opacity-25", {}],
  ["absolute bottom-40 left-1/3 w-28 h-28 bg-gradient-to-tl from-blue-200 via-blue-100 to-teal-100 rounded-full mix-blend-multiply filter blur-xl opacity-20", {}],
];

/**
 * Animated pattern dots for subtle background texture.
 * Each entry is [className, styleObject].
 */
const PATTERN_DOTS: ReadonlyArray<[string, React.CSSProperties]> = [
  ["absolute top-1/4 left-1/4 w-2 h-2 bg-gradient-to-br from-teal-400 to-blue-400 rounded-full animate-ping", { animationDuration: "3s" }],
  ["absolute top-1/3 right-1/3 w-1 h-1 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-full animate-ping", { animationDuration: "4s", animationDelay: "1s" }],
  ["absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-gradient-to-br from-teal-400 to-blue-400 rounded-full animate-ping", { animationDuration: "5s", animationDelay: "2s" }],
  ["absolute bottom-1/4 right-1/4 w-1 h-1 bg-gradient-to-tl from-teal-600 to-emerald-600 rounded-full animate-ping", { animationDuration: "3.5s", animationDelay: "0.5s" }],
  ["absolute top-3/4 left-1/3 w-1 h-1 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full animate-ping", { animationDuration: "4.5s", animationDelay: "1.5s" }],
  ["absolute bottom-1/2 right-1/5 w-1.5 h-1.5 bg-gradient-to-tr from-emerald-400 to-blue-400 rounded-full animate-ping", { animationDuration: "6s", animationDelay: "3s" }],
];

/**
 * WhiteTealBackground
 *
 * Provides a visually rich, unified background for pages or sections.
 * Features a teal-to-white gradient, animated/static blobs, subtle pattern overlays,
 * and a soft vignette for extra focus and depth.
 *
 * @example
 * <WhiteTealBackground>
 *   <YourPageContent />
 * </WhiteTealBackground>
 */
export const WhiteTealBackground: React.FC<WhiteTealBackgroundProps> = ({ children, className = "" }) => (
  <div className={`relative min-h-screen overflow-hidden ${className}`}>
    {/* Decorative background layer */}
    <div className="absolute inset-0 bg-gradient-to-b from-teal-50 via-teal-25 to-white">
      {/* Main decorative blobs */}
      {MAIN_BLOBS.map(([cls, style], i) => (
        <div key={i} className={cls} style={style} />
      ))}

      {/* Subtle animated pattern dots */}
      <div className="absolute inset-0 opacity-5">
        {PATTERN_DOTS.map(([cls, style], i) => (
          <div key={i} className={cls} style={style} />
        ))}
      </div>

      {/* Extra glassmorphism overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-teal-50/10 to-transparent backdrop-blur-sm pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-blue-50/10 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-50/10 to-transparent pointer-events-none" />

      {/* Soft vignette for focus */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.07) 0%,rgba(0,0,0,0.0) 70%)",
        }}
      />

      {/* Optional SVG wave for extra polish */}
      <svg className="absolute bottom-0 left-0 w-full h-24 opacity-30 pointer-events-none" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path
          fill="url(#wave-gradient)"
          fillOpacity="1"
          d="M0,224L60,202.7C120,181,240,139,360,144C480,149,600,203,720,197.3C840,192,960,128,1080,117.3C1200,107,1320,149,1380,170.7L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        />
        <defs>
          <linearGradient id="wave-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#5eead4" />
            <stop offset="1" stopColor="#e0f2fe" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    {/* Foreground content (page children) */}
    <div className="relative z-10">{children}</div>
  </div>
);
