import type { ReactNode } from 'react'
import { AuthDemoPanel, AuthWordmark } from '@/components/auth/ui'

type AuthLayoutProps = {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
  microcopy?: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer, microcopy }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[#F7F4EB] text-[#313852] lg:grid lg:h-screen lg:overflow-hidden lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <section className="relative hidden overflow-hidden bg-[#F7F4EB] lg:flex lg:h-screen lg:flex-col lg:px-10 lg:py-8 xl:px-14">
        <div className="hero-dot-pattern absolute inset-0 opacity-[0.05]" />

        <div className="relative z-10">
          <AuthWordmark />
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center py-8">
          <AuthDemoPanel />
        </div>
      </section>

      <section className="flex min-h-screen flex-col bg-white px-6 py-8 sm:px-8 lg:h-screen lg:overflow-hidden lg:px-12 lg:py-8">
        <div className="mb-10 flex justify-center lg:hidden">
          <AuthWordmark centered />
        </div>

        <div className="flex flex-1 items-center justify-center lg:min-h-0">
          <div className="w-full max-w-[420px]">
            <div className="mb-5 text-left">
              <h1 className="font-display text-[32px] leading-none tracking-[-0.05em] text-[#313852]">
                {title}
              </h1>
              <p className="mt-2.5 text-[15px] leading-7 text-[#7B7E8F]">{subtitle}</p>
            </div>

            {children}

            {microcopy ? <p className="mt-3 text-center text-[12px] text-[#7B7E8F]">{microcopy}</p> : null}

            <div className="mt-3 text-center text-[13px] text-[#7B7E8F]">{footer}</div>

            <p className="mt-5 text-center text-[12px] leading-6 text-[#7B7E8F]">
              By continuing, you agree to Datavue&apos;s{' '}
              <a href="/terms" className="text-[#5849F2] transition-colors hover:text-[#4338CA]">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-[#5849F2] transition-colors hover:text-[#4338CA]">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
