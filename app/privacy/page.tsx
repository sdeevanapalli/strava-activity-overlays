import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "ActivityOverlays Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-[#111111]">
      <article className="mx-auto w-full max-w-3xl space-y-8 px-6 py-14">
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold text-[#111111]">Privacy Policy</h1>
          <p className="text-sm text-[#6B6B6B]">Last updated: April 8, 2026</p>
        </header>

        <section className="space-y-3">
          <p>
            ActivityOverlays (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy. This Privacy Policy explains how we
            collect, use, disclose, and protect information when you connect your Strava account to our application.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#111111]">1. Information We Collect</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Athlete profile data (for example: name, profile image, athlete ID)</li>
            <li>Activity data (for example: activity name, type, distance, time, elevation, route/stream data)</li>
            <li>OAuth tokens needed to access your Strava data (access token and refresh token)</li>
            <li>Basic device, browser, and log data used to secure and operate the service</li>
          </ul>
          <p>We do not request more data than needed to provide the core app feature.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#111111]">2. How We Use Your Data</h2>
          <p>
            We use Strava data only to provide ActivityOverlays core functionality, including route visualization and
            analytics.
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Authenticate you through Strava OAuth</li>
            <li>Display and process your own activity information inside the app</li>
            <li>Generate overlays, previews, and exports that you request</li>
            <li>Maintain sessions, refresh tokens, and security controls</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#111111]">3. Data Sharing and Sale</h2>
          <p>We do not sell your personal data or Strava data to third parties.</p>
          <p>
            We may use service providers strictly for hosting, infrastructure, logging, or security operations under
            contractual confidentiality obligations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#111111]">4. Data Storage and Security</h2>
          <p>
            Tokens are stored securely on server-side infrastructure. We use technical and organizational
            safeguards to protect data from unauthorized access.
          </p>
          <p>
            We do not expose refresh tokens to the browser. Production traffic should use HTTPS and secure cookies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#111111]">5. Deauthorization and Revoking Access</h2>
          <p>
            You can revoke ActivityOverlays access at any time by using the in-app &quot;Disconnect Strava&quot; control or by
            revoking access from your Strava account settings.
          </p>
          <p>
            When disconnected, we call Strava deauthorization and remove stored tokens from our database and any
            related local session state we control.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#111111]">6. Contact</h2>
          <p>Email: shriniketh.d@gmail.com</p>
        </section>
      </article>
    </main>
  );
}
