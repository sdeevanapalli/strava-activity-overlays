"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ background: "#0F0F0F", position: "relative", overflow: "hidden" }}
    >
      {/* Faint SVG route-line background pattern */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <svg
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="route-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <polyline
                points="0,100 40,60 80,120 120,40 160,100 200,60"
                fill="none"
                stroke="white"
                strokeWidth="2"
              />
              <polyline
                points="0,160 40,120 80,180 120,100 160,160 200,120"
                fill="none"
                stroke="white"
                strokeWidth="2"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#route-pattern)" />
        </svg>
      </div>

      <div className="max-w-xl w-full text-center space-y-8" style={{ position: "relative", zIndex: 1 }}>
        {/* Heading */}
        <div className="space-y-4">
          <h1
            className="text-7xl font-extrabold text-white"
            style={{ fontFamily: "var(--font-nunito), sans-serif" }}
          >
            Your run.
            <br />
            Your story.
          </h1>
          <p className="text-xl text-gray-400">
            Custom overlays for Instagram Stories. Built for Strava athletes.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => router.push("/api/auth/strava")}
            className="inline-flex items-center gap-3 text-white font-bold px-8 py-4 text-lg transition-all rounded-none"
            style={{
              background: "#FC4C02",
              filter: "brightness(1)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1)";
            }}
          >
            {/* Strava chevron-style SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            Connect with Strava
          </button>
          <p className="text-sm" style={{ color: "#6B6B6B" }}>
            Read-only access · No data stored
          </p>
        </div>
      </div>
    </main>
  );
}
