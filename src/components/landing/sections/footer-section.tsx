import { BrandWordmark, FooterColumn, SocialBadge } from '@/components/landing/ui'

export function FooterSection() {
  return (
    <footer id="footer" className="bg-[#F7F4EB] pb-12 pt-14">
      <div className="mx-auto max-w-7xl border-t border-[#C2CBD4] px-6 pt-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <BrandWordmark href="#top" />
            <p className="mt-4 max-w-xs text-sm leading-7 text-[#7B7E8F]">AI-powered natural language database intelligence.</p>
            <div className="mt-5 flex gap-3 text-[#313852]">
              <SocialBadge label="GitHub" />
              <SocialBadge label="X" />
              <SocialBadge label="LinkedIn" />
            </div>
          </div>

          <FooterColumn title="Product" links={['Features', 'Pricing', 'Docs', 'Changelog']} />
          <FooterColumn title="Company" links={['About', 'Blog', 'Careers', 'Contact']} />
          <FooterColumn title="Legal" links={['Privacy Policy', 'Terms of Service', 'Security', 'Cookie Preferences']} />
        </div>

        <p className="mt-12 border-t border-[#C2CBD4] pt-6 text-sm text-[#7B7E8F]">© 2026 Datavue. Natural-language database intelligence for auditable teams.</p>
      </div>
    </footer>
  )
}
