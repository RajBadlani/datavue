import type { Metadata } from 'next'
import { LegalPage, type LegalSection } from '@/components/marketing'

export const metadata: Metadata = {
  title: 'Terms of Service — DatavueX',
  description: 'The terms governing your use of DatavueX, including acceptable use, data connections, and liability.',
}

// TODO: replace company name, contact email, and governing-law jurisdiction with your real details,
// and have counsel confirm the specifics before launch.
const COMPANY = 'DatavueX'
const CONTACT_EMAIL = 'legal@datavuex.com'
const GOVERNING_LAW = 'India'

const sections: LegalSection[] = [
  {
    id: 'acceptance',
    heading: 'Acceptance of Terms',
    paragraphs: [
      `These Terms of Service ("Terms") govern your access to and use of ${COMPANY} (the "Service"). By creating an account or using the Service, you agree to these Terms. If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization, and "you" refers to that organization.`,
      'If you do not agree to these Terms, do not use the Service.',
    ],
  },
  {
    id: 'the-service',
    heading: 'The Service',
    paragraphs: [
      `${COMPANY} is an AI-powered database intelligence platform. It connects to databases you authorize, reads schema, translates natural-language questions into read-only queries, attempts to self-heal failed queries, can mask sensitive data, records audit trails, and surfaces insights.`,
      'The Service is designed to generate read-only queries. It is a tool that assists with data analysis; it does not replace your own review of results before you rely on them for decisions.',
    ],
  },
  {
    id: 'accounts',
    heading: 'Accounts and Security',
    bullets: [
      'You must provide accurate account information and keep your credentials confidential.',
      'You are responsible for all activity that occurs under your account.',
      'You must notify us promptly of any unauthorized use or suspected security breach.',
      'You must be at least 16 years old, or the age of majority in your jurisdiction, to use the Service.',
    ],
  },
  {
    id: 'your-data',
    heading: 'Your Data and Connections',
    paragraphs: [
      'You retain all rights to the databases, credentials, prompts, and results you provide or generate ("Your Data"). You grant us a limited license to process Your Data solely to operate and provide the Service to you.',
      'You represent that you have the right to connect any database you add and to authorize the queries you run. You are responsible for ensuring your use complies with your own agreements, privacy obligations, and applicable law. We recommend connecting a read-only replica or a least-privilege database role.',
    ],
  },
  {
    id: 'acceptable-use',
    heading: 'Acceptable Use',
    paragraphs: ['You agree not to:'],
    bullets: [
      'Connect databases or run queries you are not authorized to access.',
      'Attempt to bypass read-only safeguards, ownership checks, or query-safety controls.',
      'Use the Service to violate any law, infringe rights, or process data you are prohibited from processing.',
      'Reverse engineer, disrupt, overload, or probe the Service or its infrastructure except as permitted by law.',
      'Attempt to extract other customers’ data or gain unauthorized access to any account or system.',
      'Use the Service to build a competing product by copying its non-public functionality.',
    ],
  },
  {
    id: 'ai-output',
    heading: 'AI-Generated Output',
    paragraphs: [
      'The Service uses language models to generate SQL and summaries. AI output can be inaccurate, incomplete, or unexpected. While DatavueX constrains generated queries to read-only operations and can retry failures, you are responsible for reviewing generated SQL and results before relying on them.',
      'We make no warranty that generated queries or insights are correct, complete, or fit for a particular purpose.',
    ],
  },
  {
    id: 'plans-billing',
    heading: 'Plans, Trials, and Billing',
    bullets: [
      'Paid plans and any usage limits are described at the time of purchase.',
      'Trials, where offered, convert to paid plans unless canceled before the trial ends.',
      'Fees are billed in advance and, except where required by law, are non-refundable. Monthly plans may be canceled at any time; annual plans continue until the end of the paid term.',
      'We may change pricing with reasonable prior notice, effective on your next billing cycle.',
    ],
  },
  {
    id: 'self-hosting',
    heading: 'Self-Hosted Deployments',
    paragraphs: [
      'If you deploy DatavueX on your own infrastructure, you are responsible for its operation, security, configuration, and the data processed within your environment. Third-party and open-source components may be governed by their own licenses. These Terms govern your use of the hosted Service unless a separate agreement applies to your deployment.',
    ],
  },
  {
    id: 'third-party',
    heading: 'Third-Party Services',
    paragraphs: [
      'The Service may rely on third-party providers, including AI model providers and infrastructure vendors. Your use of those components through the Service may be subject to their terms. We are not responsible for third-party services outside our control.',
    ],
  },
  {
    id: 'intellectual-property',
    heading: 'Intellectual Property',
    paragraphs: [
      `The Service, including its software, design, and content (excluding Your Data), is owned by ${COMPANY} and its licensors and is protected by intellectual-property laws. We grant you a limited, non-exclusive, non-transferable right to use the Service in accordance with these Terms. All rights not expressly granted are reserved.`,
    ],
  },
  {
    id: 'disclaimers',
    heading: 'Disclaimers',
    paragraphs: [
      'The Service is provided "as is" and "as available" without warranties of any kind, whether express, implied, or statutory, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or secure, or that AI-generated output will be accurate.',
    ],
  },
  {
    id: 'liability',
    heading: 'Limitation of Liability',
    paragraphs: [
      `To the maximum extent permitted by law, ${COMPANY} and its suppliers will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for lost profits, revenues, data, or goodwill, arising out of or related to your use of the Service.`,
      `Our total liability for any claim arising out of or relating to the Service will not exceed the amounts you paid to us for the Service in the twelve months preceding the event giving rise to the claim, or, if you use a free tier, one hundred US dollars (US$100).`,
    ],
  },
  {
    id: 'indemnification',
    heading: 'Indemnification',
    paragraphs: [
      `You agree to indemnify and hold harmless ${COMPANY} from claims, damages, and expenses (including reasonable legal fees) arising from your misuse of the Service, your violation of these Terms, or your violation of any law or third-party right, including in connection with databases you connect and queries you run.`,
    ],
  },
  {
    id: 'termination',
    heading: 'Termination',
    paragraphs: [
      'You may stop using the Service and delete your account at any time. We may suspend or terminate your access if you violate these Terms, if required by law, or to protect the Service or other users. Upon termination, your right to use the Service ends, and we may delete Your Data consistent with our Privacy Policy and applicable law.',
    ],
  },
  {
    id: 'changes',
    heading: 'Changes to These Terms',
    paragraphs: [
      'We may update these Terms from time to time. When we make material changes, we will update the effective date above and, where appropriate, provide additional notice. Your continued use of the Service after changes take effect constitutes acceptance of the updated Terms.',
    ],
  },
  {
    id: 'governing-law',
    heading: 'Governing Law',
    paragraphs: [
      `These Terms are governed by the laws of ${GOVERNING_LAW}, without regard to its conflict-of-laws rules. The courts located in ${GOVERNING_LAW} will have exclusive jurisdiction over disputes arising out of these Terms, except where prohibited by applicable law.`,
    ],
  },
  {
    id: 'contact',
    heading: 'Contact Us',
    paragraphs: [
      `Questions about these Terms can be sent to ${CONTACT_EMAIL}.`,
    ],
  },
]

export default function TermsPage() {
  return (
    <LegalPage
      label="Legal"
      title="Terms of Service"
      effectiveDate="July 11, 2026"
      intro={`These terms govern your access to and use of ${COMPANY}. Please read them carefully before connecting a database or running queries.`}
      sections={sections}
    />
  )
}
