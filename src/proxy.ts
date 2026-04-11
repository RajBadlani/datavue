import { getSessionCookie } from 'better-auth/cookies'
import { NextRequest, NextResponse } from 'next/server'

const publicRoutes = [
  /^\/$/,
  /^\/sign-in(?:\/.*)?$/,
  /^\/sign-up(?:\/.*)?$/,
  /^\/api\/auth(?:\/.*)?$/,
  /^\/api\/webhooks(?:\/.*)?$/,
  /^\/terms$/,
  /^\/privacy$/,
]

const authRoutes = [/^\/sign-in(?:\/.*)?$/, /^\/sign-up(?:\/.*)?$/]
const protectedRoutes = [
  /^\/dashboard(?:\/.*)?$/,
  /^\/connections(?:\/.*)?$/,
  /^\/history(?:\/.*)?$/,
  /^\/audit-logs(?:\/.*)?$/,
  /^\/settings(?:\/.*)?$/,
  /^\/chat(?:\/.*)?$/,
  /^\/onboarding(?:\/.*)?$/,
  /^\/api\/connections(?:\/.*)?$/,
  /^\/api\/chat(?:\/.*)?$/,
]

function matches(pathname: string, routes: RegExp[]) {
  return routes.some(route => route.test(pathname))
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSessionCookie = Boolean(getSessionCookie(request))

  if (hasSessionCookie && matches(pathname, authRoutes)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!hasSessionCookie && matches(pathname, protectedRoutes)) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  if (matches(pathname, publicRoutes)) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
