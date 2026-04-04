export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.22),transparent_35%),linear-gradient(180deg,#0c0a09_0%,#1c1917_45%,#0c0a09_100%)] px-6 py-24">
      <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-amber-950/20 backdrop-blur sm:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
          <section className="space-y-6">
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-amber-300">
              Next.js App Router + Clerk
            </p>
            <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              Authentication is wired up and ready for your first test user.
            </h2>
            <p className="max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
              Use the navigation buttons to sign up in Clerk keyless mode. Once the
              profile icon appears, your app is connected and ready to build on.
            </p>
          </section>
          <section className="rounded-3xl border border-amber-200/15 bg-stone-900/70 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">
              What changed
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-300">
              <li>Clerk middleware now runs through the App Router proxy.</li>
              <li>The root layout wraps the app in ClerkProvider.</li>
              <li>Signed-out and signed-in states render directly in the header.</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  )
}
