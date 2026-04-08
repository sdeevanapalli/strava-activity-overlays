import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#F5F5F5] px-6 py-16 text-center text-[#111111]">
      <div className="max-w-md space-y-6 rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FC5200]">404</p>
          <h1 className="text-3xl font-extrabold">Page not found</h1>
          <p className="text-sm leading-6 text-[#6B6B6B]">
            The page you were looking for does not exist or has moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-none bg-[#FC5200] px-5 text-sm font-semibold text-white transition hover:bg-[#EB4D00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FC5200] focus-visible:ring-offset-2"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}