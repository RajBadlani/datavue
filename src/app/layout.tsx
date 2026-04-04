import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'DataVue',
  description: 'Next.js App Router app with Clerk authentication',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-stone-950 text-stone-50">
        <ClerkProvider>
          <div className="flex min-h-full flex-col">
            <header className="border-b border-white/10 bg-stone-950/95 backdrop-blur">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.3em] text-amber-300">
                    DataVue
                  </p>
                  <h1 className="text-sm font-semibold text-stone-100">
                    Clerk auth is ready in keyless mode.
                  </h1>
                </div>
                <div className="flex items-center gap-3">
                  <Show when="signed-out">
                    <SignInButton>
                      <button className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-stone-100 transition hover:border-white/30 hover:bg-white/5">
                        Sign in
                      </button>
                    </SignInButton>
                    <SignUpButton>
                      <button className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-200">
                        Sign up
                      </button>
                    </SignUpButton>
                  </Show>
                  <Show when="signed-in">
                    <UserButton />
                  </Show>
                </div>
              </div>
            </header>
            {children}
          </div>
        </ClerkProvider>
      </body>
    </html>
  )
}
