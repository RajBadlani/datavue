import { ModalShell } from '@/components/landing/ui'

type EnterpriseModalProps = {
  open: boolean
  onClose: () => void
}

export function EnterpriseModal({ open, onClose }: EnterpriseModalProps) {
  return (
    <ModalShell open={open} title="Talk to Enterprise Sales" onClose={onClose}>
      <form
        className="grid gap-4"
        onSubmit={event => {
          event.preventDefault()
          onClose()
        }}
      >
        <label className="grid gap-2 text-sm font-medium text-[#313852]">
          Full name
          <input className="rounded-2xl border border-[#C2CBD4] bg-[#F7F4EB] px-4 py-3 outline-none transition focus:border-[#5849F2]" placeholder="Jane Patel" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-[#313852]">
          Work email
          <input type="email" className="rounded-2xl border border-[#C2CBD4] bg-[#F7F4EB] px-4 py-3 outline-none transition focus:border-[#5849F2]" placeholder="jane@company.com" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-[#313852]">
          Company
          <input className="rounded-2xl border border-[#C2CBD4] bg-[#F7F4EB] px-4 py-3 outline-none transition focus:border-[#5849F2]" placeholder="Northstar Cloud" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-[#313852]">
          What matters most?
          <textarea className="min-h-28 rounded-2xl border border-[#C2CBD4] bg-[#F7F4EB] px-4 py-3 outline-none transition focus:border-[#5849F2]" placeholder="On-prem deployment, SSO, private inference, support timelines..." />
        </label>
        <button type="submit" className="mt-2 cursor-pointer rounded-full bg-[#5849F2] px-6 py-3 font-semibold text-white">
          Request enterprise follow-up
        </button>
      </form>
    </ModalShell>
  )
}
