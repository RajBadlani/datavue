import Link from 'next/link'
import { AuthLayout } from '@/components/auth'
import { AuthForm } from '@/components/auth/auth-form'

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Start asking questions."
      subtitle="Connect your first database in 90 seconds after signup."
      microcopy="Free forever on Starter. No credit card required."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/sign-in" className="text-[#5849F2] transition-colors hover:text-[#4338CA]">
            Sign in -&gt;
          </Link>
        </>
      }
    >
      <AuthForm mode="sign-up" />
    </AuthLayout>
  )
}
