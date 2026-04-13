import type { SimpleIcon } from 'simple-icons'

export type HeroQuery = {
  prompt: string
  sql: string
  rows: Array<{ label: string; value: string }>
}

export type HowItWorksStep = {
  id: string
  title: string
  description: string
  detail: string
}

export type LandingIconName =
  | 'lightbulb'
  | 'alertTriangle'
  | 'telescope'
  | 'wand'
  | 'sparkChart'
  | 'schema'
  | 'database'
  | 'shield'
  | 'history'

export type PainPoint = {
  title: string
  description: string
  iconName: LandingIconName
}

export type FeatureVisual = 'heal' | 'insight' | 'schema' | 'db' | 'enterprise' | 'history'

export type FeatureCard = {
  label: string
  title: string
  description: string
  span: string
  iconName: LandingIconName
  visual: FeatureVisual
  metric: string
}

export type Integration = {
  name: string
  icon: SimpleIcon | null
}

export type InsightFeedItem = {
  tone: string
  title: string
  time: string
}

export type Testimonial = {
  quote: string
  name: string
  role: string
  initials: string
}

export type Faq = {
  question: string
  answer: string
}
