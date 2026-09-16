# CLAUDE.md — Project Instructions & AI Working Guide

This file is read by the AI assistant (Claude Code / Cursor / etc.) before working
on this repo. It has two parts:
1. **Project Spec** — what to build.
2. **AI Operating Rules** — how to work, written specifically to keep token/credit
   usage low without sacrificing correctness.

---

## 1. Project Spec

### 1.1 One-line description
A cloud storage service where a user uploads files (code files or normal files),
gets a **secure 4-character access code**, and anyone with that code can retrieve the
file(s) later from a web page — no account required for retrieval.

### 1.2 Core user flow
1. **Upload** — User (optionally logged in) uploads one or more files.
2. **Code generation** — Server generates a random 4-character code, maps it to the
   uploaded file(s) in the database, and shows it to the uploader.
3. **Retrieval** — A different user visits `/retrieve`, enters the 4-character code,
   and downloads the file(s) if the code is valid and not expired.
4. **Expiry/cleanup** — Codes expire after a set time (default: 24h, configurable)
   or after N downloads (default: unlimited unless "burn after read" is set).

### 1.3 Minimum feature set (v1)
- [ ] File upload (drag-drop + button), multiple files per code
- [ ] 4-character alphanumeric code generation, collision-checked against active codes
- [ ] Code-based retrieval page (no login needed)
- [ ] Expiry: time-based (default 24h) + optional manual delete by uploader
- [ ] File type distinction: "code" files get syntax-highlighted preview;
      "normal" files get a plain download card
- [ ] Rate limiting on code entry (prevent brute-forcing 4-character codes)
- [ ] Basic virus/type scanning or at least extension allow/deny list

### 1.4 Security requirements (non-negotiable)
- 4-character code space is over 800,000 combinations — **must** be protected by:
  - Rate limiting (e.g., 5 attempts / IP / minute, exponential backoff)
  - Short default expiry (24h) so brute-force window is small
  - Optional: pair code with an email/OTP step for sensitive files
- All uploads go to object storage (S3 / R2 / GCS), never local disk in prod
- Signed, time-limited URLs for actual file bytes — the 4-character code maps to a
  short-lived signed URL, it is never the direct storage key
- Files encrypted at rest (bucket-level SSE is enough for v1)
- No code should ever be guessable/sequential — use CSPRNG
  (`crypto.randomInt`, not `Math.random`)

### 1.5 Tech stack (fixed)
- Frontend: **Next.js (React)** — upload UI + retrieval UI
- Backend: **Express** (separate service, REST API) — Next.js frontend calls it
  over HTTP; keeps upload/storage logic out of Next's serverless function
  limits (important for larger file uploads)
- DB: **MongoDB** (Atlas or self-hosted) — collection: `files`
  ```js
  {
    _id: ObjectId,
    code: "A3KX",        // unique index, 4-character string
    storageKey: "...",      // S3/R2 object key, never exposed directly
    filename: "invoice.pdf",
    fileType: "code" | "normal",
    uploaderId: ObjectId | null,
    createdAt: Date,
    expiresAt: Date,        // TTL index — Mongo auto-deletes expired docs
    downloadCount: Number,
    burnAfterRead: Boolean
  }
  ```
  - Use a **unique index on `code`** and a **TTL index on `expiresAt`** so
    Mongo handles expiry cleanup automatically (no cron needed for v1).
- Storage: Cloudflare R2 or AWS S3 (file bytes only — never store files in
  Mongo directly)
- Auth (optional, for uploader dashboard only): Clerk/Auth.js on the Next.js
  side; Express verifies the JWT on protected routes

### 1.5.1 Service boundary
- **Next.js**: pages (`/upload`, `/retrieve`), calls Express API, handles auth
  session on the frontend.
- **Express**: `/api/upload`, `/api/retrieve/:code`, talks to MongoDB and
  object storage directly. Keep it stateless so it can scale horizontally.
- Don't duplicate business logic in both — code generation, validation, and
  rate limiting live in Express only.

### 1.6 Out of scope for v1
- Folder structures / nested directories
- Real-time collaboration
- Payment/billing
- Mobile app

---

## 2. AI Operating Rules (credit/token optimization)

These rules exist because coding-agent credit usage is dominated by three things:
excessive file reading, excessive back-and-forth clarification, and regenerating
unchanged code. Follow these strictly.

### 2.1 Before making changes
- **Never re-read a file you already have in context** unless it was edited
  since your last view of it.
- Use `grep`/`glob`/targeted search instead of opening whole directories or large
  files "just to check." Read only the lines/sections relevant to the task.
- Batch related questions into a single clarifying message instead of asking
  one thing, waiting, asking the next thing.
- If a task is ambiguous but a reasonable default exists, **state the
  assumption and proceed** — do not stop and ask unless proceeding would risk
  real rework (e.g., choosing the wrong DB schema).

### 2.2 While making changes
- Prefer **targeted diffs/patches** (str_replace-style edits) over rewriting
  entire files.
- Do not regenerate boilerplate that already exists and works — extend it.
- One logical change per commit/edit. Do not bundle unrelated refactors into a
  feature change; it inflates diff size and review cost.
- Avoid speculative abstraction ("might need this later") — build for the
  current requirement (see 1.3 v1 list), not hypothetical future ones.
- When adding a dependency, check if an existing one already covers the need
  before installing something new.

### 2.3 Testing & verification
- Write/run the smallest test that proves the change works, not a full suite
  re-run after every micro-edit.
- Use fast local checks (typecheck/lint on changed files only) before full
  builds.
- Only run the full test suite before a commit/PR, not after every file edit.

### 2.4 Communication style (reduces output tokens)
- No restating the task back before doing it.
- No verbose "Here's what I did and why" essays after routine edits — a short
  summary line is enough. Save detailed explanations for non-obvious decisions
  (e.g., "used signed URLs instead of public bucket because codes must not be
  guessable").
- Skip disclaimers/preambles ("I'll now proceed to...").

### 2.5 Session hygiene
- Keep a running short "state" note (e.g., in `PROGRESS.md`) of what's done vs
  pending, so a new session doesn't need to re-derive context by re-reading the
  whole codebase.
- When resuming work, read `PROGRESS.md` + only the files relevant to the next
  task — not the entire repo.

---

## 3. Suggested repo structure

```
/frontend                # Next.js app
  /app
    /upload               # upload page
    /retrieve             # code-entry + download page
  /lib
    api-client.ts          # calls Express backend

/backend                 # Express app
  /src
    /routes
      upload.js             # POST /api/upload
      retrieve.js           # GET /api/retrieve/:code
    /lib
      storage.js            # S3/R2 client wrapper
      codeGenerator.js       # CSPRNG 4-character code + collision check (queries Mongo)
      rateLimit.js
    /models
      File.js                # Mongoose schema (code, storageKey, expiresAt TTL index, ...)
    server.js

PROGRESS.md               # running status log for AI sessions
CLAUDE.md                 # this file
```