'use client'

import { useState, type FormEvent } from 'react'

// Where the mailto composer sends messages. Swap for a real API route when the backend is ready.
const CONTACT_EMAIL = 'hello@datavue.app'

const inputClass =
  'h-12 w-full rounded-2xl border border-[#C2CBD4] bg-white px-4 text-[15px] text-[#313852] outline-none transition placeholder:text-[#8B8FA0] focus:border-[#5849F2] focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FCFAF5]'

const labelClass = 'text-xs font-semibold uppercase tracking-[0.3em] text-[#5849F2]'

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const subject = `Datavue enquiry from ${name || 'a visitor'}`
    const lines = [
      `Name: ${name}`,
      `Email: ${email}`,
      company ? `Company: ${company}` : null,
      '',
      message,
    ].filter(line => line !== null)
    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      lines.join('\n')
    )}`
    window.location.href = href
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClass}>Name</span>
          <input
            type="text"
            required
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder="Ada Lovelace"
            className={inputClass}
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass}>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="you@company.com"
            className={inputClass}
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className={labelClass}>Company</span>
        <input
          type="text"
          value={company}
          onChange={event => setCompany(event.target.value)}
          placeholder="Optional"
          className={inputClass}
        />
      </label>

      <label className="block space-y-2">
        <span className={labelClass}>Message</span>
        <textarea
          required
          value={message}
          onChange={event => setMessage(event.target.value)}
          placeholder="Tell us what you're trying to query, connect, or evaluate."
          rows={5}
          className="w-full rounded-2xl border border-[#C2CBD4] bg-white px-4 py-3 text-[15px] leading-7 text-[#313852] outline-none transition placeholder:text-[#8B8FA0] focus:border-[#5849F2] focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FCFAF5]"
        />
      </label>

      <button
        type="submit"
        className="cursor-pointer rounded-full bg-[#5849F2] px-7 py-3.5 text-base font-semibold text-[#FCFAF5] shadow-[0_18px_40px_rgba(88,73,242,0.22)] transition duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5849F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FCFAF5]"
      >
        Send message
      </button>
    </form>
  )
}
