import type { Metadata } from 'next'
import { Fira_Code, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  display: 'swap',
})

const firaCode = Fira_Code({
  variable: '--font-fira-code',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Datavue',
  description: 'Natural language database intelligence with self-healing SQL and proactive insights.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${firaCode.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#F7F4EB] text-[#313852]">
        <div className="flex min-h-full flex-col">{children}</div>
      </body>
    </html>
  )
}
