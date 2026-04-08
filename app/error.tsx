"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#F5F5F5] px-6 py-16 text-center text-[#111111]">
      <div className="max-w-md space-y-6 rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FC5200]">Something broke</p>
          <h1 className="text-3xl font-extrabold">We hit a production error</h1>
          <p className="text-sm leading-6 text-[#6B6B6B]">
            The app ran into an unexpected problem. Try reloading the page or come back in a moment.
          </p>
        </div>
        <button
          onClick={reset}
          className="inline-flex h-12 items-center justify-center rounded-none bg-[#FC5200] px-5 text-sm font-semibold text-white transition hover:bg-[#EB4D00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FC5200] focus-visible:ring-offset-2"
        >
          Try again
        </button>
        {error.digest ? <p className="text-xs text-[#9B9B9B]">Error ID: {error.digest}</p> : null}
      </div>
    </main>
  );
}