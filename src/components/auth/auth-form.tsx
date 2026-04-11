'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

type AuthFormProps = {
  mode: 'sign-in' | 'sign-up'
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const result = mode === 'sign-up'
        ? await authClient.signUp.email({
            name: name.trim(),
            email: email.trim(),
            password,
            callbackURL: '/dashboard',
          })
        : await authClient.signIn.email({
            email: email.trim(),
            password,
            callbackURL: '/dashboard',
          })

      if (result.error) {
        setError(result.error.message ?? 'Authentication failed. Please try again.')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[28px] border border-[#E5E0D4] bg-[#FCFAF5] p-4 shadow-[0_20px_70px_rgba(49,56,82,0.08)]">
      <div className="space-y-3">
        {mode === 'sign-up' ? (
          <label className="block text-sm font-medium text-[#313852]">
            Name
            <input value={name} onChange={event => setName(event.target.value)} required minLength={2} autoComplete="name" className="mt-2 h-12 w-full rounded-2xl border border-[#C2CBD4] bg-white px-4 text-sm outline-none transition-colors focus:border-[#5849F2]" placeholder="Ada Lovelace" />
          </label>
        ) : null}

        <label className="block text-sm font-medium text-[#313852]">
          Email
          <input value={email} onChange={event => setEmail(event.target.value)} required type="email" autoComplete="email" className="mt-2 h-12 w-full rounded-2xl border border-[#C2CBD4] bg-white px-4 text-sm outline-none transition-colors focus:border-[#5849F2]" placeholder="you@company.com" />
        </label>

        <label className="block text-sm font-medium text-[#313852]">
          Password
          <input value={password} onChange={event => setPassword(event.target.value)} required minLength={8} type="password" autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} className="mt-2 h-12 w-full rounded-2xl border border-[#C2CBD4] bg-white px-4 text-sm outline-none transition-colors focus:border-[#5849F2]" placeholder="At least 8 characters" />
        </label>
      </div>

      {error ? <div className="mt-4 rounded-2xl border border-[#F5B6B0] bg-[#FFF1EF] px-4 py-3 text-sm text-[#9F2F25]">{error}</div> : null}

      <button type="submit" disabled={isSubmitting} className="mt-5 h-12 w-full rounded-full bg-[#5849F2] text-sm font-semibold text-white shadow-[0_14px_30px_rgba(88,73,242,0.28)] transition duration-200 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? 'Securing session...' : mode === 'sign-up' ? 'Create account' : 'Sign in'}
      </button>
    </form>
  )
}
