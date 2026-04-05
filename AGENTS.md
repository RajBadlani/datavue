<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Datavue Agent Guide

## Project Purpose

Datavue is an AI-powered database intelligence platform. It lets users connect their databases, ask questions in plain English, generate safe read-only queries, view charts/tables, audit query attempts, monitor metrics, and receive proactive insights.

The long-term product direction includes:
- natural-language chat over connected databases
- self-healing SQL generation with retries
- schema sync and schema explorer
- proactive insight generation
- audit logs and PII masking
- saved dashboards and shareable widgets
- self-hosted deployment with local LLM support

## Current Reality

The system design document in `datavue-system-design.md` is the product blueprint, but the codebase is still early.

Already present:
- Next.js App Router app
- Clerk auth shell and middleware
- Prisma schema and migrations
- seed script with meaningful domain data
- AES-256-GCM encryption utility
- Prisma singleton
- API error wrapper primitives in `src/lib/api-error.ts` and `src/lib/api-handler.ts`

Not fully built yet:
- feature-complete API routes
- connection management flows
- schema sync workers
- chat SSE flow
- LangGraph agent
- dashboards, insights, audit UI

When implementing features, align with the system design doc unless the existing code clearly establishes a newer convention.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript with strict mode
- Tailwind CSS v4
- Clerk for current cloud auth flow
- Prisma 7 with PostgreSQL and `@prisma/adapter-pg`
- `pg` for Postgres connectivity
- planned BullMQ + Redis architecture
- planned LangGraph-based agent architecture
- planned Recharts visualization layer

## Must-Read Sources Before Major Changes

- `datavue-system-design.md` for product architecture and sequencing
- `prisma/schema.prisma` for domain model truth
- `src/lib/api-error.ts` and `src/lib/api-handler.ts` before adding any API route
- `src/lib/encryption.ts` before touching credential storage
- local Next.js docs in `node_modules/next/dist/docs/`

## Folder Structure

Current important paths:
- `src/app/` - App Router pages and layouts
- `src/lib/` - shared server/client-safe utilities and API helpers
- `src/proxy.ts` - Clerk middleware entrypoint
- `prisma/schema.prisma` - application data model
- `prisma/migrations/` - database migrations
- `prisma/seed.ts` - local development seed data
- `src/generated/prisma/` - generated Prisma client output, do not commit

Expected future structure direction from the design doc:
- `src/app/api/` - route handlers grouped by feature
- `src/components/` - UI components
- `src/server/` or `src/lib/server/` - server-only business logic/helpers
- `src/workers/` - BullMQ workers
- `src/agents/` - LangGraph nodes/graph
- `src/drivers/` - database driver implementations

Prefer adding code in a way that supports this eventual structure.

## Coding Conventions

- Use TypeScript everywhere.
- Prefer small composable utilities over large files.
- Reuse existing helpers before creating new abstractions.
- Keep server-only code out of client components.
- Use App Router conventions only; do not introduce Pages Router patterns.
- Follow existing import style and naming patterns in the file you edit.
- Keep comments minimal and only for non-obvious reasoning.
- Avoid placeholder architecture that fights the system design.

## Authentication Conventions

- Current auth is Clerk-based.
- Use Clerk-compatible server patterns for protected routes and server logic.
- Do not reintroduce custom password auth flows in app code unless explicitly requested.
- The Prisma `User` model may evolve to include a Clerk identifier; design new code with that likely direction in mind.

## Database Conventions

- `prisma/schema.prisma` is the source of truth for the app database schema.
- Use the shared Prisma singleton from `src/lib/prisma.ts` for app runtime database access.
- Do not commit `src/generated/prisma/`.
- When the schema changes, generate the client locally rather than hand-editing generated files.
- Credentials and API keys must be encrypted before persistence.
- Never store plaintext connection credentials in the database.

## Encryption Conventions

- `src/lib/encryption.ts` is the canonical encryption utility.
- AES-256-GCM is the required algorithm.
- `ENCRYPTION_KEY` must be treated as required server-only configuration.
- Keep the current `iv:authTag:ciphertext` format intact unless a migration plan is explicitly introduced.

## API Architecture

Keep the API architecture intact.

Every API route must follow this exact shape:

`withErrorHandler`
`  -> authenticate (throw UNAUTHORIZED if no session)`
`  -> validate input (throw with clear message if invalid)`
`  -> check ownership (throw NOT_FOUND if resource doesn't belong to user)`
`  -> try/catch around external calls (DB driver, LLM, BullMQ)`
`  -> return NextResponse.json`

### Required API Rules

- Wrap all route handlers with `withErrorHandler` from `src/lib/api-handler.ts`.
- Use `ApiError` or `Errors` from `src/lib/api-error.ts` for expected failures.
- Authentication must happen first for protected routes.
- Ownership checks must be explicit for every user-owned resource.
- External integrations must be isolated in local `try/catch` blocks so low-level errors are translated into safe application errors.
- Return JSON via `NextResponse.json`.
- Never leak raw database errors, stack traces, credentials, tokens, or provider internals to clients.

### API Response Format

Successful responses:
- return `NextResponse.json({ ...data })`
- keep payloads explicit and stable

Error responses must preserve the current wrapper shape from `src/lib/api-handler.ts`:

```ts
{
  error: {
    code: string,
    message: string,
  }
}
```

Design note:
- the system design doc mentions timestamps in error responses, but the current implementation does not include them
- preserve the existing implementation unless intentionally updating `src/lib/api-handler.ts` and all callers together

## What Not To Touch

- Do not replace App Router with Pages Router.
- Do not replace Clerk middleware/auth patterns with outdated Next.js auth patterns.
- Do not commit `src/generated/prisma/`.
- Do not bypass `src/lib/prisma.ts` with ad hoc app-runtime Prisma client creation.
- Do not break the error contract in `src/lib/api-handler.ts`.
- Do not change `src/lib/api-error.ts` semantics incompatibly without updating all API routes.
- Do not store plaintext credentials or expose decrypted secrets in logs/responses.
- Do not weaken the planned ownership checks or query safety posture.

## API Files To Preserve

`src/lib/api-error.ts`
- defines `ApiError`
- defines reusable error instances like `UNAUTHORIZED`, `CONNECTION_NOT_FOUND`, `QUERY_BLOCKED`, and `INVALID_CREDENTIALS`
- should remain the central place for machine-readable API error definitions

`src/lib/api-handler.ts`
- defines `withErrorHandler`
- normalizes thrown `ApiError`s into JSON responses
- hides internal failures behind `INTERNAL_ERROR`
- should remain the universal top-level wrapper for route handlers

If extending these files, do so compatibly.

## Feature Intent By Domain Model

- `User` - app user, auth/provider preferences, encrypted BYOK support
- `Connection` - external database connection owned by a user
- `SchemaMetadata` - cached synced schema for a connection
- `Conversation` - per-user per-connection chat history
- `AuditLog` - immutable record of query attempts and outcomes
- `Insight` - generated anomaly/monitoring insight
- `MonitoredMetric` - metric configuration for proactive monitoring
- `DashboardPage` - container for widget collections
- `DashboardWidget` - saved query visualization with refresh behavior

New features should map cleanly to these domain objects.

## Current Task Priorities

Based on the current codebase and system design, the likely near-term priorities are:
- build protected API route handlers for connections and metadata
- establish Clerk user to Prisma user resolution cleanly
- move feature code onto the Prisma singleton and shared API wrapper pattern
- implement connection CRUD and ownership checks
- wire encrypted credential storage and retrieval into runtime flows
- prepare for metadata sync, audit logging, and chat architecture

When starting a new task, prefer the minimum path that fits this roadmap without introducing throwaway abstractions.

## Implementation Guidance

- For route handlers, start with auth, input validation, and ownership before business logic.
- For user-owned records, always query with the authenticated user filter or equivalent ownership verification.
- For external database access, translate low-level connection/query failures into safe `ApiError`s.
- For chat and streaming work, follow the SSE-oriented architecture in the design doc.
- For background jobs, keep web request code separate from worker responsibilities.
- For future self-hosting support, avoid hard-coding cloud-only assumptions into shared abstractions.

## Change Checklist

Before finishing any substantial change, verify:
- does it align with `datavue-system-design.md`?
- does it preserve App Router and Clerk conventions?
- does it keep the API wrapper/error architecture intact?
- does it use the shared Prisma singleton?
- does it avoid touching generated Prisma output?
- does it protect ownership and secret handling?

If the answer to any of these is no, revise before finalizing.
