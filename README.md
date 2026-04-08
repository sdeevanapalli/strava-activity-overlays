# Strava Activity Overlays

Create social-ready overlays from your Strava activities. Sign in with Strava, browse your activities, and use the editor to build a custom layout for a specific run, ride, swim, or walk.

## Features

- Strava OAuth sign-in with CSRF state protection
- Encrypted session cookie for authenticated routes
- Activity dashboard with pagination and activity summaries
- Canvas-based editor with left and right side panels
- Undo and redo support in the editor
- Per-activity layout presets that can be reused across sessions
- Mobile-friendly editor controls and protected dashboard routes

## Tech Stack

- [Next.js](https://nextjs.org) 16
- [React](https://react.dev) 19
- TypeScript
- Tailwind CSS 4
- Konva and react-konva for the canvas editor
- Zustand for client state
- jose for encrypted session cookies

## Getting Started

1. Install dependencies.

```bash
npm install
```

2. Create a local environment file with the required variables.

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-long-random-secret
STRAVA_CLIENT_ID=your-strava-client-id
STRAVA_CLIENT_SECRET=your-strava-client-secret
```

3. Run the development server.

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000).

## Strava Setup

- Register a Strava app and set the OAuth redirect URI to `http://localhost:3000/api/auth/strava/callback` for local development.
- In production, set `NEXTAUTH_URL` to your canonical domain and update the Strava redirect URI to match that domain.
- The app requests `activity:read_all` access.

## Available Scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm run start` - start the production server
- `npm run lint` - run ESLint

## Project Structure

- `app/` - routes, API handlers, and top-level pages
- `components/` - landing page, dashboard, editor, canvas, and UI pieces
- `lib/` - session handling, Strava API helpers, and editor utilities
- `store/` - Zustand stores for editor and UI state
- `public/strava-branding/` - Strava-approved branding assets

## Notes

- Protected routes redirect unauthenticated users back to the landing page.
- The app stores only the session data required to access Strava on behalf of the user.
- Privacy and terms pages are available at `/privacy` and `/terms`.
