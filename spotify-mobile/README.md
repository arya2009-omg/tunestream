# TuneStream Mobile
Native Android/iOS app using Expo Router, Zustand, NativeWind and expo-audio.

## Run
1. Install Node.js LTS.
2. cd spotify-mobile
3. npm install
4. Change SERVER_URL in lib/api.ts to the PC LAN IP running the Node backend.
5. npx expo install --fix
6. npx expo start
7. Open with Expo Go on the same Wi-Fi.

## Backend endpoints
POST /api/auth/login
POST /api/auth/signup
GET /api/auth/me
GET /api/songs
GET /api/songs/search?q=
GET /api/songs/liked
GET /api/playlists
POST /api/playlists
GET /api/playlists/:id
POST /api/songs/upload

Note: the current TuneStream GitHub repository has no server/ Node backend directory, so these API endpoints must be provided by the backend before login, uploads and server music can work.

Expo's current audio package is expo-audio; expo-av is deprecated in current Expo docs, so the native player uses expo-audio instead.