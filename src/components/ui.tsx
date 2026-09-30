import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PCOLOR, PNAME, PSHORT } from '../lib/data'

export function PageHead({ step, title, children }: { step?: number; title: string; children?: ReactNode }) {
  return (
    <header className="mb-10 max-w-prose2">
      {step !== undefined && <p className="mb-2 text-sm text-slate">{step}단계</p>}
      <h1 className="font-serif text-[1.9rem] font-bold leading-tight tracking-tight sm:text-[2.3rem]">{title}</h1>
      {children && <div className="mt-4 text-[1.02rem] leading-relaxed text-slate">{children}</div>}
    </header>
  )
}

export function Section({ title, lead, children, id }: { title: string; lead?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="mb-14 scroll-mt-20">
      <h2 className="font-serif text-[1.35rem] font-bold">{title}</h2>
      {lead && <div className="mt-1.5 max-w-prose2 text-slate">{lead}</div>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

export function Swatch({ id, size = 10 }: { id: string; size?: number }) {
  return <span className="inline-block shrink-0 rounded-full" style={{ width: size, height: size, background: PCOLOR[id] }} aria-hidden />
}

/** Pill for a persona. Data personas are filled, qualitative personas are outlined: the pair shares a hue. */
export function PersonaPill({ id, withName = true }: { id: string; withName?: boolean }) {
  const qual = id === 'P' || id === 'S1' || id === 'S2'
  const c = PCOLOR[id]
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[0.8rem] font-semibold"
      style={qual ? { border: `1.5px solid ${c}`, color: c } : { background: c, color: '#fff' }}
    >
      {PSHORT[id]}
      {withName && <span className="font-normal opacity-90">{PNAME[id]}</span>}
    </span>
  )
}

export function Tabs<T extends string>({ items, value, onChange, render }: { items: T[]; value: T; onChange: (v: T) => void; render: (v: T, active: boolean) => ReactNode }) {
  return (
    <div role="tablist" className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button
          key={it}
          role="tab"
          aria-selected={it === value}
          onClick={() => onChange(it)}
          className={`rounded-lg border px-3.5 py-2 text-left text-sm transition-colors ${it === value ? 'border-ink bg-white shadow-[0_1px_0_#1B2230]' : 'border-rule bg-transparent text-slate hover:border-slate'}`}
        >
          {render(it, it === value)}
        </button>
      ))}
    </div>
  )
}

/** Raw text with exact evidence phrases highlighted. Text is never altered. */
export function Highlighted({ text, phrases }: { text: string; phrases: string[] }) {
  const ranges: [number, number][] = []
  for (const p of phrases) {
    let from = 0
    for (;;) {
      const i = text.indexOf(p, from)
      if (i < 0 || !p) break
      ranges.push([i, i + p.length])
      from = i + p.length
    }
  }
  ranges.sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  for (const r of ranges) {
    const last = merged.at(-1)
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1])
    else merged.push([...r])
  }
  const out: ReactNode[] = []
  let cur = 0
  merged.forEach(([s, e], k) => {
    if (s > cur) out.push(text.slice(cur, s))
    out.push(<mark key={k} className="ev">{text.slice(s, e)}</mark>)
    cur = e
  })
  out.push(text.slice(cur))
  return <p className="whitespace-pre-line">{out}</p>
}

export function Note({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border-l-4 border-[#D9A21B] bg-[#FFF8E6] px-4 py-3 text-[0.93rem] text-ink">{children}</div>
}

export function NextStep({ to, label }: { to: string; label: string }) {
  return (
    <div className="mt-16 border-t border-rule pt-6">
      <Link to={to} className="inline-flex flex-col rounded-lg border border-ink bg-white px-5 py-3 hover:bg-ink hover:text-white">
        <span className="text-[0.78rem] opacity-70">다음 단계</span>
        <span className="font-semibold">{label}</span>
      </Link>
    </div>
  )
}
