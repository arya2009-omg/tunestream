# TuneStream Node.js backend

## Start
1. Copy .env.example to .env.
2. Set JWT_SECRET to a long random value.
3. Run npm install.
4. Run npm start.

The server listens on 0.0.0.0:5000 so a phone on the same Wi-Fi can connect.

## Mobile API
Create spotify-mobile/.env:
EXPO_PUBLIC_API_URL=http://YOUR-PC-LAN-IP:5000

Then restart Expo:
npx expo start -c

## Test
Open http://YOUR-PC-LAN-IP:5000/health. It should return {"ok":true,"service":"tunestream-server"}.

## API
POST /api/auth/signup
POST /api/auth/login
GET /api/auth/me
GET /api/songs
GET /api/songs/search?q=
GET /api/songs/liked
POST /api/songs/:id/like
DELETE /api/songs/:id/like
POST /api/songs/upload
GET /api/playlists
POST /api/playlists
GET /api/playlists/:id
POST /api/playlists/:id/songs
DELETE /api/playlists/:id/songs/:songId
