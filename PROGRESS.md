# PROGRESS.md — AI Session State

## Status: v1 COMPLETE ✅

## What's done
- [x] Backend: Express server with CORS, trust proxy
- [x] Backend: MongoDB connection via mongoose
- [x] Backend: `File.js` schema — TTL index on `expiresAt`, unique index on `code`
- [x] Backend: `codeGenerator.js` — CSPRNG (`crypto.randomInt`), collision retry
- [x] Backend: `storage.js` — local disk abstraction (swap to S3 by replacing 3 functions)
- [x] Backend: `rateLimit.js` — 5/min on retrieve, 10/min on upload
- [x] Backend: `POST /api/upload` — multer, extension allow-list, TTL expiry, burnAfterRead
- [x] Backend: `GET /api/retrieve/:code` — rate-limited, returns metadata (no storageKey exposed)
- [x] Backend: `GET /api/retrieve/:code/download/:index` — streams bytes, handles burnAfterRead
- [x] Frontend: Next.js 14 App Router, TypeScript, custom CSS (no Tailwind)
- [x] Frontend: Dark glassmorphism design system in `globals.css`
- [x] Frontend: Landing page (`/`) with hero, stats, features, how-it-works
- [x] Frontend: Upload page (`/upload`) — drag-drop, file list, progress bar, burn toggle
- [x] Frontend: Retrieve page (`/retrieve`) — 6 individual digit inputs, download cards
- [x] Frontend: `lib/api-client.ts` — XHR upload (progress), fetch retrieve, download URLs

## Next session: pick up from here
- [ ] (Optional) Swap `storage.js` to S3/R2 for production
- [ ] (Optional) Add Clerk auth for uploader dashboard
- [ ] (Optional) Add syntax-highlighted preview for code files
- [ ] (Optional) Add file size total limit per code

## Ports
- Frontend: http://localhost:3000
- Backend:  http://localhost:3001
- MongoDB:  mongodb://localhost:27017/filesharingnetwork

## Running locally
```
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```
