import { ModalShell } from '@/components/landing/ui'

type DemoModalProps = {
  open: boolean
  onClose: () => void
}

export function DemoModal({ open, onClose }: DemoModalProps) {
  return (
    <ModalShell open={open} title="Datavue product demo" onClose={onClose}>
      <div className="rounded-[1.5rem] border border-[#C2CBD4] bg-[#F7F4EB] p-5">
        <p className="text-sm uppercase tracking-[0.3em] text-[#7B7E8F]">2-minute walkthrough</p>
        <div className="mt-4 rounded-[1.5rem] bg-[#313852] p-6 text-[#F7F4EB]">
          <p className="font-display text-3xl tracking-[-0.04em]">See Datavue turn plain English into trusted SQL.</p>
          <ul className="mt-6 space-y-3 text-sm leading-7 text-[#C2CBD4]">
            <li>- Connect a database in under 90 seconds</li>
            <li>- Watch Datavue generate and heal SQL live</li>
            <li>- Review insights the team did not ask for yet</li>
          </ul>
        </div>
      </div>
    </ModalShell>
  )
}
