'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CtaSection,
  DemoModal,
  EnterpriseModal,
  EnterpriseSection,
  FeaturesSection,
  FooterSection,
  Header,
  HeroSection,
  HowItWorksSection,
  IntegrationsSection,
  MobileMenu,
  PainPointsSection,
  PricingSection,
  ProactiveIntelligenceSection,
  SelfHealingSection,
  TestimonialsSection,
  TrustStrip,
} from '@/components/landing/sections'

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)
  const [enterpriseOpen, setEnterpriseOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [annualBilling, setAnnualBilling] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [activeStep, setActiveStep] = useState(0)
  const stepRefs = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          const index = Number(entry.target.getAttribute('data-step-index'))
          setActiveStep(index)
        })
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: 0.2 }
    )

    stepRefs.current.forEach(step => step && observer.observe(step))
    return () => observer.disconnect()
  }, [])

  return (
    <main className="bg-[#F7F4EB] text-[#313852]">
      <Header scrolled={scrolled} onOpenMenu={() => setMenuOpen(true)} />
      <HeroSection />
      <TrustStrip />
      <SelfHealingSection />
      <PainPointsSection />
      <HowItWorksSection activeStep={activeStep} stepRefs={stepRefs} />
      <FeaturesSection />
      <IntegrationsSection />
      <EnterpriseSection onOpenEnterprise={() => setEnterpriseOpen(true)} />
      <ProactiveIntelligenceSection />
      <TestimonialsSection />
      <PricingSection
        annualBilling={annualBilling}
        onChangeAnnualBilling={setAnnualBilling}
        openFaq={openFaq}
        onToggleFaq={setOpenFaq}
      />
      <CtaSection />
      <FooterSection />

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
      <EnterpriseModal open={enterpriseOpen} onClose={() => setEnterpriseOpen(false)} />
    </main>
  )
}
