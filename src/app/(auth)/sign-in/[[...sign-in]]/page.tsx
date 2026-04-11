import Link from 'next/link'
import { AuthLayout } from '@/components/auth'
import { AuthForm } from '@/components/auth/auth-form'

export default function SignInPage() {
  return (
    <AuthLayout
      title="Welcome back."
      subtitle="Your databases are waiting."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-[#5849F2] transition-colors hover:text-[#4338CA]">
            Sign up -&gt;
          </Link>
        </>
      }
    >
      <AuthForm mode="sign-in" />
    </AuthLayout>
  )
}
