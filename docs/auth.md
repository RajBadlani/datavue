# Authentication

Datavue uses Better Auth with email/password authentication.

## Runtime Pieces

- Server auth config: `src/lib/auth.ts`
- Client auth helper: `src/lib/auth-client.ts`
- Auth API route: `src/app/api/auth/[...all]/route.ts`
- Server session helpers: `src/lib/server/resolve-user.ts`
- Public auth pages: `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` and `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- Route protection: `src/proxy.ts` plus server-side checks in protected layouts and API routes

## Required Environment Variables

```env
BETTER_AUTH_SECRET="replace-with-at-least-32-random-characters"
BETTER_AUTH_URL="http://localhost:3000"
```

In production, `BETTER_AUTH_URL` must be the deployed app origin, for example:

```env
BETTER_AUTH_URL="https://datavue.example.com"
```

Generate a strong secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Data Model

Better Auth stores auth state in the application database through Prisma:

- `User` maps to `users`
- `Session` maps to `sessions`
- `Account` maps to `accounts`
- `Verification` maps to `verifications`

Datavue-specific ownership records continue to reference `User.id`. Onboarding state now lives on `User.onboardingComplete`, replacing the previous external auth metadata dependency.

## Security Notes

- `src/proxy.ts` only performs optimistic cookie checks for redirects.
- Protected pages and API routes must still call `requireCurrentUser()` or `requireAuthSession()`.
- Never trust route protection alone for ownership. Query user-owned rows with the authenticated `user.id`.
