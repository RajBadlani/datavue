export function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#5849F2]">{title}</p>
      <ul className="mt-4 space-y-3 text-sm text-[#7B7E8F]">
        {links.map(link => (
          <li key={link}>{link}</li>
        ))}
      </ul>
    </div>
  )
}
