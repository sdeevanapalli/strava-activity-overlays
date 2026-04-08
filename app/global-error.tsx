"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-[100svh] items-center justify-center bg-[#F5F5F5] px-6 py-16 text-center text-[#111111]">
        <div className="max-w-md space-y-6 rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FC5200]">Application error</p>
            <h1 className="text-3xl font-extrabold">The app failed to render</h1>
            <p className="text-sm leading-6 text-[#6B6B6B]">
              Something went wrong at the app shell level. Refresh the page to try again.
            </p>
          </div>
          <button
            onClick={reset}
            className="inline-flex h-12 items-center justify-center rounded-none bg-[#FC5200] px-5 text-sm font-semibold text-white transition hover:bg-[#EB4D00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FC5200] focus-visible:ring-offset-2"
          >
            Reload app
          </button>
          {error.digest ? <p className="text-xs text-[#9B9B9B]">Error ID: {error.digest}</p> : null}
        </div>
      </body>
    </html>
  );
}