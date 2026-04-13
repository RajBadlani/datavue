import type { SimpleIcon } from 'simple-icons'

export function SimpleIconGlyph({ icon }: { icon: SimpleIcon }) {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
      <path d={icon.path} />
    </svg>
  )
}
