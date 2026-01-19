# Cron System (New)

## Goal
Provide a lightweight, reliable scheduling system for publishing content and future background tasks
using MongoDB + a polling worker. No ORM. No external cron dependency required, but an external trigger
can be used if desired. The system supports both recurring (self-rescheduling) jobs and one-off
jobs tied to specific entities or events.

## Core Concepts
- **Job document** stored in MongoDB (`cron_jobs` collection).
- **Worker** polls for due jobs and runs handlers.
- **Handlers registry** maps `jobType` to execution logic.
- **Event listeners** react to create/update events and enqueue jobs.
- **Retries** with backoff stored on the job document.

## Data Model (cron_jobs)
Example fields (Zod schema will mirror this):
- `_id` (ObjectId)
- `jobType` (string)
- `status` ("pending" | "running" | "completed" | "failed" | "cancelled")
- `priority` (number, default 5)
- `scheduledFor` (Date)
- `startedAt` (Date, optional)
- `completedAt` (Date, optional)
- `maxRetries` (number, default 3)
- `retryCount` (number, default 0)
- `retryDelayMs` (number, default 5000)
- `nextRetryAt` (Date, optional)
- `payload` (any)
- `result` (any, optional)
- `error` ({ message, stack?, timestamp } optional)
- `createdAt` / `updatedAt` (Date)

## Data Layer
New file: `src/data/cron-jobs.ts`
- `createCronJob(data)`
- `getNextPendingJob()`: atomically picks the next due job (pending + scheduledFor <= now)
- `updateJobStatus(jobId, status, result?, error?)`
- `retryJob(jobId, delayMs?)`
- `cancelJob(jobId)`
- `cleanupOldJobs(daysOld = 30)`

## Handlers
New folder: `src/services/cron-handlers/`
- `index.ts`: registry (`registerCronHandler`, `executeCronJob`)
- `register-all.ts`: registers all handlers
- Handlers are small units that receive the job payload and return a result

Example handlers:
- `publish_post`
- `publish_adv`
- `send_notification`

## Worker
New file: `src/workers/cron-worker.ts`
- Poll interval (default 5s–30s)
- Single-instance assumption (no distributed locks)
- Flow:
  1) `getNextPendingJob()`
  2) execute handler
  3) update status or retry on error
- Graceful shutdown on SIGINT/SIGTERM

## Startup
New file: `src/workers/startup.ts`
- `ENABLE_WORKER=true` starts the worker in background
- Can be run as a separate process or container
- Worker is also started via Astro integration using `astro-startup-code`:
  - `astro.config.mjs` loads `./src/workers/startup.ts` as an entrypoint

## Scheduling Content
When an Article/Adv is created or updated with a future publish date:
1) Emit `article:created` / `article:updated` events from the data layer
2) Listener creates a cron job with `jobType="publish_post"` or `jobType="publish_adv"`
3) `scheduledFor` set to publish date
4) Handler publishes the content when executed

## Recurring Jobs
Recurring jobs are implemented as self-rescheduling handlers:
1) Handler runs and completes its task
2) It enqueues a new job of the same type with a future `scheduledFor`
3) This keeps the schedule under versioned code control without system-level cron

## One-off Jobs
One-off jobs are created for a specific entity or event and are executed once, then marked
`completed` or `failed`.

## Deployment Options
Option A (recommended): Run `ENABLE_WORKER=true` as a separate process.
Option B: Use an external scheduler to hit an HTTP endpoint that triggers one loop tick (optional).

## Observability
- Log job starts, completions, and errors.
- Add a simple admin page to list jobs (future).
