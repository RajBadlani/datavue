import type { Metadata } from 'next'
import { LegalPage, type LegalSection } from '@/components/marketing'

export const metadata: Metadata = {
  title: 'Privacy Policy — DatavueX',
  description: 'How DatavueX collects, uses, protects, and shares data across connected databases, queries, and audit logs.',
}

// TODO: replace company name, contact email, and jurisdiction with your real details,
// and have counsel confirm the specifics before launch.
const COMPANY = 'DatavueX'
const CONTACT_EMAIL = 'privacy@datavuex.com'

const sections: LegalSection[] = [
  {
    id: 'overview',
    heading: 'Overview',
    paragraphs: [
      `${COMPANY} is an AI-powered database intelligence platform. This Privacy Policy explains what information we collect when you use the service, how we use and protect it, and the choices you have. It applies to our hosted product and, where noted, to self-hosted deployments you operate yourself.`,
      'We designed DatavueX around data boundaries: your database credentials are encrypted, generated queries are read-only by design, and self-hosting lets you keep prompts, schema, and results inside your own infrastructure.',
    ],
  },
  {
    id: 'information-we-collect',
    heading: 'Information We Collect',
    paragraphs: ['We collect the following categories of information:'],
    bullets: [
      'Account information: your email address and authentication credentials, managed through our authentication provider. Passwords are stored only as salted hashes and are never accessible to us in plaintext.',
      'Database connection details: host, port, database name, and credentials you provide to connect a data source. Credentials are encrypted with AES-256-GCM before storage and are never logged or returned in plaintext.',
      'Schema metadata: table, column, and relationship information synced from your connected databases so the assistant can generate schema-aware queries.',
      'Query activity: the natural-language questions you ask, the SQL generated in response, execution outcomes, and any error or retry information, stored as audit logs.',
      'Model configuration: your choice of AI provider and, if you bring your own key, an encrypted copy of that API key.',
      'Usage and technical data: log data such as timestamps, feature usage, and diagnostic information used to operate and secure the service.',
    ],
  },
  {
    id: 'query-content',
    heading: 'Query Content and Your Database Data',
    paragraphs: [
      'When you ask a question, DatavueX sends your prompt and relevant schema context to a language model to generate SQL. Generated queries are constrained to read-only operations and are executed against your connected database to return results.',
      'On our hosted product, prompts and schema context may be processed by third-party model providers strictly to generate responses. If you enable PII masking, sensitive columns are masked before results are surfaced. If you self-host with a local model, this content stays within your environment and is not sent to any third party.',
      'We do not sell your database contents, query results, or prompts, and we do not use them to train third-party models.',
    ],
  },
  {
    id: 'how-we-use',
    heading: 'How We Use Information',
    bullets: [
      'To authenticate you and operate your account.',
      'To connect to your databases, sync schema, and generate and execute read-only queries on your behalf.',
      'To provide self-healing retries, proactive insights, query history, and audit trails.',
      'To secure the service, detect abuse, debug issues, and maintain reliability.',
      'To communicate with you about service changes, security notices, and support requests.',
    ],
  },
  {
    id: 'legal-bases',
    heading: 'Legal Bases for Processing',
    paragraphs: [
      'Where applicable law (such as the GDPR) requires it, we process personal data on the following bases: performance of our contract with you to provide the service; our legitimate interests in operating, securing, and improving the product; compliance with legal obligations; and your consent where specifically requested.',
    ],
  },
  {
    id: 'sharing',
    heading: 'How We Share Information',
    paragraphs: ['We share information only as needed to run the service:'],
    bullets: [
      'Service providers: infrastructure, hosting, and AI model providers that process data under contract on our behalf.',
      'Legal and safety: when required by law, regulation, legal process, or to protect the rights, property, and safety of our users and the public.',
      'Business transfers: in connection with a merger, acquisition, or sale of assets, with notice consistent with this policy.',
    ],
  },
  {
    id: 'security',
    heading: 'Data Security',
    bullets: [
      'Database credentials and bring-your-own-key API keys are encrypted at rest using AES-256-GCM.',
      'Generated queries are read-only by design to reduce the risk of unintended writes or destructive operations.',
      'Access controls ensure resources such as connections, conversations, and audit logs are scoped to their owning account.',
      'We maintain audit logs of query attempts and outcomes to support traceability and incident review.',
      'No system is perfectly secure; we work to protect your data but cannot guarantee absolute security.',
    ],
  },
  {
    id: 'retention',
    heading: 'Data Retention',
    paragraphs: [
      'We retain account data for as long as your account is active. Connection metadata, schema, conversations, and audit logs are retained to provide history and traceability until you delete the associated resource or your account. Some records may be retained longer where required for legal, security, or accounting purposes.',
    ],
  },
  {
    id: 'your-rights',
    heading: 'Your Rights and Choices',
    paragraphs: [
      'Depending on your location, you may have rights to access, correct, export, or delete your personal data, and to object to or restrict certain processing. You can delete connections and their credentials at any time, and you can request account deletion.',
      `To exercise these rights, contact us at ${CONTACT_EMAIL}. We will respond consistent with applicable law.`,
    ],
  },
  {
    id: 'self-hosting',
    heading: 'Self-Hosted Deployments',
    paragraphs: [
      'If you run DatavueX on your own infrastructure, you are the controller of the data processed within your deployment. In that configuration, database contents, prompts, schema, and query results can remain entirely inside your environment, including when you use a local model. This policy describes our hosted service; your own policies govern data you process in a self-hosted deployment.',
    ],
  },
  {
    id: 'international',
    heading: 'International Data Transfers',
    paragraphs: [
      'Our hosted service may process data in countries other than your own. Where required, we use appropriate safeguards for cross-border transfers. Self-hosting lets you keep processing within a region you control.',
    ],
  },
  {
    id: 'children',
    heading: "Children's Privacy",
    paragraphs: [
      'DatavueX is not directed to children under 16 and is not intended for their use. We do not knowingly collect personal data from children. If you believe a child has provided us data, contact us and we will delete it.',
    ],
  },
  {
    id: 'changes',
    heading: 'Changes to This Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. When we make material changes, we will update the effective date above and, where appropriate, provide additional notice.',
    ],
  },
  {
    id: 'contact',
    heading: 'Contact Us',
    paragraphs: [
      `If you have questions about this Privacy Policy or how we handle data, contact us at ${CONTACT_EMAIL}.`,
    ],
  },
]

export default function PrivacyPage() {
  return (
    <LegalPage
      label="Legal"
      title="Privacy Policy"
      effectiveDate="February 20, 2026"
      intro={`This policy explains how ${COMPANY} collects, uses, protects, and shares information when you connect databases, ask questions, and review results.`}
      sections={sections}
    />
  )
}
