import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#F5F5F5] px-6 py-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8">
      {/* Faint route-line background pattern */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
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
                stroke="#FC4C02"
                strokeWidth="2"
              />
              <polyline
                points="0,160 40,120 80,180 120,100 160,160 200,120"
                fill="none"
                stroke="#FC4C02"
                strokeWidth="2"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#route-pattern)" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center">
        <div className="w-full max-w-xl space-y-8 text-center">
          <div className="space-y-4">
            <h1
              className="text-5xl font-extrabold text-[#111111] sm:text-6xl lg:text-7xl"
              style={{ fontFamily: "var(--font-nunito), sans-serif" }}
            >
              ActivityOverlays
            </h1>
            <p className="mx-auto max-w-lg text-base font-semibold text-[#FC4C02] sm:text-lg lg:text-xl">
              This website has retired.
            </p>
            <p className="mx-auto max-w-lg text-base leading-7 text-[#6B6B6B] sm:text-lg">
              ActivityOverlays was created to help athletes turn their Strava activities into custom, social-ready overlays. Unfortunately, Strava&apos;s updated API requirements now require the developer of an application to have an active subscription. As I am not a Strava subscriber, my API access has been revoked, so I can no longer access activity data or continue building and maintaining this website.
            </p>
            <p className="mx-auto max-w-lg text-base leading-7 text-[#6B6B6B] sm:text-lg">
              This is a retirement of the project, not an issue with your Strava account. Thank you to everyone who tried ActivityOverlays, shared feedback, and helped shape it while it was available.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 text-sm text-[#6B6B6B]">
            <p>
              Built by <strong className="text-[#111111]">Shriniketh Deevanapalli</strong>
            </p>
          </div>
        </div>
      </div>


      <footer className="relative z-10 mt-10 flex items-end justify-center">
        <div className="flex items-center gap-4 text-xs text-[#6B6B6B]">
          <Link href="/privacy" className="font-medium hover:text-[#111111]">
            Privacy Policy
          </Link>
          <Link href="/terms" className="font-medium hover:text-[#111111]">
            Terms of Service
          </Link>
        </div>
      </footer>
    </main>
  );
}
