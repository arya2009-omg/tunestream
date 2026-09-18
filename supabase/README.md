# TuneStream Cloud Backend

TuneStream is being upgraded from localStorage-only demo state to a real cloud architecture.

## Stack
- Supabase Auth for email/password identity and persistent sessions.
- Supabase Postgres for profiles, playlists, friends, likes, Blend and Jam state.
- Supabase Realtime Broadcast/Presence for live Jam synchronization and online presence.
- Row Level Security (RLS) for user/resource authorization.

Supabase Auth uses JWTs and integrates with Postgres RLS; the client SDK also handles session persistence and token refresh. Realtime supports Broadcast and Presence for low-latency collaborative features. See the official docs for the architecture and authorization model.

## Setup
1. Create a Supabase project.
2. Open the SQL editor and run `supabase/schema.sql`.
3. Copy the project's public URL and publishable/anon key into `supabase-config.js`.
4. Enable Email/Password in Supabase Auth.
5. Enable Realtime for the tables/features you want to stream, and configure private channel authorization.
6. Deploy the site on the same HTTPS origin you registered in Supabase Auth redirect URLs.

## Security
Never put a Supabase service-role key in this repository or browser code. Only the public client key belongs in the frontend.

## Planned API modules
- auth: sign up, sign in, sign out, session restore.
- profile: profile/avatar management.
- playlists: CRUD + tracks + public/private sharing.
- friends: requests, accept/block, activity.
- blend: member taste aggregation and shared playlists.
- jam: host/join/leave + realtime playback state + presence.

The current repository remains usable without credentials; cloud features should be enabled only after a Supabase project is connected.
