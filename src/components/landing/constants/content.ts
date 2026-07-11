import {
  siCockroachlabs,
  siMongodb,
  siMysql,
  siPlanetscale,
  siPostgresql,
  siSqlite,
  siSupabase,
} from 'simple-icons'
import type {
  FeatureCard,
  Faq,
  HeroQuery,
  HowItWorksStep,
  InsightFeedItem,
  Integration,
  PainPoint,
  Testimonial,
} from '@/components/landing/types'

export const navLinks = [
  { label: 'Product', href: '#product' },
  { label: 'Self-healing', href: '#self-healing' },
  { label: 'Security', href: '#security' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '/about' },
] as const

export const heroQueries: HeroQuery[] = [
  {
    prompt: 'Show me monthly revenue by product, compared to last year',
    sql: `SELECT product_name, month, revenue, revenue_last_year\nFROM revenue_monthly\nWHERE year = 2026\nORDER BY revenue DESC;`,
    rows: [
      { label: 'Atlas', value: '$142K  (+18%)' },
      { label: 'Nova', value: '$128K  (+11%)' },
      { label: 'Pulse', value: '$116K  (+23%)' },
      { label: 'Beacon', value: '$98K   (+6%)' },
      { label: 'Orbit', value: '$84K   (-2%)' },
    ],
  },
  {
    prompt: 'Which customers are at risk of churn after the pricing change?',
    sql: `SELECT cohort, churn_risk, active_accounts\nFROM churn_signals\nWHERE plan_changed = true\nORDER BY churn_risk DESC;`,
    rows: [
      { label: '2024-Q3', value: 'High  /  148 accounts' },
      { label: '2024-Q4', value: 'Medium  /  204 accounts' },
      { label: 'SMB Plus', value: 'High  /  61 accounts' },
      { label: 'Growth', value: 'Medium  /  112 accounts' },
      { label: 'Enterprise', value: 'Low  /  28 accounts' },
    ],
  },
  {
    prompt: 'Find anomalies in order volume for the last 24 hours',
    sql: `SELECT hour_bucket, orders, anomaly_score\nFROM order_volume_anomalies\nWHERE observed_at >= NOW() - INTERVAL '24 HOURS';`,
    rows: [
      { label: '09:00', value: '1,284 orders  /  score 0.91' },
      { label: '10:00', value: '1,102 orders  /  score 0.34' },
      { label: '11:00', value: '1,648 orders  /  score 0.96' },
      { label: '12:00', value: '1,211 orders  /  score 0.27' },
      { label: '13:00', value: '1,734 orders  /  score 0.88' },
    ],
  },
]

export const trustLogos = [
  'Northstar Cloud',
  'Helio Stack',
  'Plainbyte',
  'Mergepath',
  'Arcwell',
  'SupraOps',
  'Layerform',
  'Pebble AI',
  'SignalGrid',
  'Dockyard Labs',
]

export const painPoints: PainPoint[] = [
  {
    title: "SQL knowledge shouldn't be a prerequisite",
    description:
      'Your PM asks one important question and waits three days for an analyst to write the query.',
    iconName: 'lightbulb',
  },
  {
    title: 'Broken queries are invisible',
    description:
      'A single JOIN error can silently return bad numbers, and decisions get made on top of them.',
    iconName: 'alertTriangle',
  },
  {
    title: "Insights don't surface themselves",
    description:
      'The patterns you do not know to look for stay buried until they become expensive.',
    iconName: 'telescope',
  },
]

export const steps: HowItWorksStep[] = [
  {
    id: 'connect',
    title: 'Connect your database in seconds.',
    description:
      'Paste your connection string. DatavueX reads your schema, understands table relationships, and is ready to query in under 90 seconds.',
    detail: 'Postgres, MySQL, SQLite, MongoDB',
  },
  {
    id: 'ask',
    title: 'Ask anything in plain English.',
    description:
      "Type your question like you'd ask a teammate. DatavueX's LangGraph agent translates it into production-grade SQL shaped to your schema.",
    detail: 'Schema-aware SQL generation',
  },
  {
    id: 'insight',
    title: "Get answers. And the questions you didn't know to ask.",
    description:
      'Results arrive in milliseconds, while the insight engine flags anomalies, trends, and outliers without waiting for a prompt.',
    detail: 'Result table plus proactive insight feed',
  },
]

export const featureCards: FeatureCard[] = [
  {
    label: 'Core differentiation',
    title: 'Self-healing SQL',
    description:
      'When a query breaks, DatavueX diagnoses the failure, rewrites the SQL, and retries automatically before the user ever sees an error.',
    span: 'lg:col-span-7',
    iconName: 'wand',
    visual: 'heal',
    metric: '99.2% recovered query success',
  },
  {
    label: 'See signal sooner',
    title: 'Proactive insight detection',
    description:
      'DatavueX flags abnormal trends, revenue drops, and churn signals without waiting for a manual prompt.',
    span: 'lg:col-span-5',
    iconName: 'sparkChart',
    visual: 'insight',
    metric: 'Live signal stream',
  },
  {
    label: 'Grounded in your schema',
    title: 'Schema-aware queries',
    description:
      'It writes against your real tables, joins, and naming conventions instead of guessing from a generic prompt.',
    span: 'lg:col-span-4',
    iconName: 'schema',
    visual: 'schema',
    metric: 'Real table context',
  },
  {
    label: 'Works where your data lives',
    title: 'Multi-database support',
    description: 'Query Postgres, MySQL, SQLite, and MongoDB from one consistent workflow.',
    span: 'lg:col-span-4',
    iconName: 'database',
    visual: 'db',
    metric: '4 core engines supported',
  },
  {
    label: 'Built for security review',
    title: 'Enterprise self-hosting',
    description:
      'Run DatavueX inside your infrastructure with Ollama, private models, and no third-party data egress.',
    span: 'lg:col-span-4',
    iconName: 'shield',
    visual: 'enterprise',
    metric: 'On-prem control by default',
  },
  {
    label: 'Audit every answer',
    title: 'Query history + versioning',
    description:
      'Track the original prompt, the healed SQL, and the final answer your team actually used.',
    span: 'lg:col-span-12',
    iconName: 'history',
    visual: 'history',
    metric: 'Full audit trail',
  },
]

export const integrations: Integration[] = [
  { name: 'PostgreSQL', icon: siPostgresql },
  { name: 'MySQL', icon: siMysql },
  { name: 'SQLite', icon: siSqlite },
  { name: 'MongoDB', icon: siMongodb },
  { name: 'Supabase', icon: siSupabase },
  { name: 'PlanetScale', icon: siPlanetscale },
  { name: 'Neon', icon: null },
  { name: 'CockroachDB', icon: siCockroachlabs },
]

export const orchestration = ['dbt', 'Prisma', 'Drizzle', 'Hasura']

export const insightFeed: InsightFeedItem[] = [
  {
    tone: '#D97706',
    title: 'Revenue from mobile users dropped 18% this week vs last 4-week average',
    time: '4 min ago',
  },
  {
    tone: '#5849F2',
    title: 'User churn spike detected in cohort 2024-Q3 with strongest correlation to the pricing change',
    time: '11 min ago',
  },
  {
    tone: '#DC2626',
    title: 'orders table query volume up 340% in the last hour, likely tied to an active traffic spike',
    time: '23 min ago',
  },
  {
    tone: '#5849F2',
    title: 'Product B revenue is up 23% in March, repeating the same seasonal pattern seen last year',
    time: '38 min ago',
  },
]

export const testimonials: Testimonial[] = [
  {
    quote:
      'DatavueX cut our analytics ticket queue from 40 requests a week to effectively zero. PMs get answers immediately, and our analysts can focus on real modeling work again.',
    name: 'Mira Patel',
    role: 'VP Product, Northstar Cloud',
    initials: 'MP',
  },
  {
    quote:
      'The self-healing engine changed the trust equation for us. Broken SQL stopped being a hidden risk and became an invisible fix in the background.',
    name: 'Ethan Rowe',
    role: 'Head of Data, Plainbyte',
    initials: 'ER',
  },
  {
    quote:
      'We went from waiting on dashboards to spotting anomalies before our morning standup. DatavueX feels like adding a schema-aware analyst to every team.',
    name: 'Sofia Lin',
    role: 'COO, Helio Stack',
    initials: 'SL',
  },
]

export const faqs: Faq[] = [
  {
    question: 'Does DatavueX send our data to third-party model providers?',
    answer:
      'Not unless you choose a hosted model path. Enterprise runs fully on your own infrastructure with Ollama, so prompts, schema, and results stay inside your environment.',
  },
  {
    question: 'How long is the Pro trial?',
    answer:
      'Pro starts with a 14-day trial so teams can connect real databases, evaluate healing accuracy, and validate the insight feed before upgrading.',
  },
  {
    question: 'How do team seats work?',
    answer:
      'Starter is built for solo evaluation. Pro includes shared workspaces for small teams, while Enterprise supports SSO, role controls, and onboarding for larger orgs.',
  },
  {
    question: 'Can we cancel at any time?',
    answer:
      'Yes. Monthly plans can be canceled at any time, and annual plans keep access until the end of the billing term.',
  },
  {
    question: 'How fast can we be live?',
    answer:
      'Most teams connect their first database in under 90 seconds and run their first natural-language question within the same session.',
  },
]

export const starterFeatures = ['1 database connection', '100 queries / month', 'NL-to-SQL core', 'Community support']

export const proFeatures = [
  'Unlimited queries',
  '5 database connections',
  'Self-healing SQL',
  'Proactive insights',
  'Query history',
  'Priority support',
]

export const enterpriseFeatures = [
  'Unlimited everything',
  'Ollama self-hosting',
  'SSO / SAML',
  'SLA coverage',
  'Dedicated onboarding',
]
