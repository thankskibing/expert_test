import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PCOLOR, PNAME, PSHORT } from '../lib/data'

/* Components follow Ant Design v6 design.md (docs/antd-design.md):
   controls 32px / 6px radius, surfaces 8px radius, tags 4px radius, 1px #D9D9D9 outlines,
   underline tabs, one primary button per screen, flat-first with borders carrying hierarchy. */

export function PageHead({ step, title, children }: { step?: number; title: string; children?: ReactNode }) {
  return (
    <header className="mb-8 max-w-prose2">
      {step !== undefined && <p className="mb-1 text-b2 text-g600">{step}단계</p>}
      <h1 className="text-h1">{title}</h1>
      {children && <div className="mt-2 text-b2 text-g700">{children}</div>}
    </header>
  )
}

export function Section({ title, lead, children, id }: { title: string; lead?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="mb-12 scroll-mt-20">
      <h2 className="text-h3">{title}</h2>
      {lead && <div className="mt-1 max-w-prose2 text-b2 text-g600">{lead}</div>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

/** Tag-style persona label: data personas solid, qualitative personas outlined in the same hue. */
export function PersonaPill({ id, withName = true }: { id: string; withName?: boolean }) {
  const qual = id === 'P' || id === 'S1' || id === 'S2'
  const c = PCOLOR[id]
  return (
    <span className="inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-s border px-2 text-b3"
      style={qual ? { background: `${c}12`, borderColor: `${c}66`, color: c } : { background: c, borderColor: c, color: '#fff' }}>
      <b className="font-semibold">{PSHORT[id]}</b>
      {withName && <span>{PNAME[id]}</span>}
    </span>
  )
}

/** Ant Design Tabs: primary text + 2px underline on the active tab, no background fill. */
export function Segmented<T extends string>({ items, value, onChange, render, label }: { items: T[]; value: T; onChange: (v: T) => void; render: (v: T, active: boolean) => ReactNode; label?: string }) {
  return (
    <div role="tablist" aria-label={label} className="flex max-w-full flex-wrap gap-x-8 border-b border-g200">
      {items.map((it) => {
        const on = it === value
        return (
          <button key={it} role="tab" aria-selected={on} onClick={() => onChange(it)}
            className={`-mb-px border-b-2 py-3 text-b2 transition-colors duration-200 ${on ? 'border-brand text-brand' : 'border-transparent text-g700 hover:text-brand-hover'}`}>
            {render(it, on)}
          </button>
        )
      })}
    </div>
  )
}
export const Tabs = Segmented

/** Ant Design CheckableTag: 4px radius, primary fill when checked. */
export function Chip({ on, onClick, children, title }: { on: boolean; onClick: () => void; children: ReactNode; title?: string }) {
  return (
    <button onClick={onClick} aria-pressed={on} title={title}
      className={`inline-flex h-7 items-center gap-1 rounded-s px-2.5 text-b2 transition-colors duration-200 ${on ? 'bg-brand text-white' : 'bg-transparent text-g900 hover:text-brand-hover'}`}>
      {children}
    </button>
  )
}

const TAG: Record<string, string> = {
  grey: 'bg-g50 border-g300 text-g900',
  red: 'bg-[#FFF1F0] border-[#FFA39E] text-[#CF1322]',
  green: 'bg-[#F6FFED] border-[#B7EB8F] text-[#389E0D]',
  blue: 'bg-brand-weak border-brand-border text-brand-press',
  orange: 'bg-[#FFF7E6] border-[#FFD591] text-[#D46B08]',
  dark: 'bg-[#F9F0FF] border-[#D3ADF7] text-[#531DAB]',
}
/** Ant Design Tag: 12px, 4px radius, pastel preset fills with matching border. */
export function Badge({ children, tone = 'grey' }: { children: ReactNode; tone?: keyof typeof TAG }) {
  return <span className={`inline-flex h-[22px] items-center rounded-s border px-[7px] text-b3 ${TAG[tone]}`}>{children}</span>
}

const field = 'w-full rounded-m border border-g300 bg-white px-[11px] text-b2 text-g900 outline-none transition-colors duration-200 placeholder:text-g400 hover:border-brand-hover focus:border-brand focus:shadow-focus'
export function TextField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`h-8 ${field} ${props.className ?? ''}`} />
}
export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`py-1 ${field} ${props.className ?? ''}`} />
}

/** Ant Design Button: default (outlined) / primary (solid) / link; large 40px, middle 32px, small 24px. */
export function Button({ variant = 'secondary', size = 'm', className = '', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost'; size?: 'xl' | 'l' | 'm' | 's' }) {
  const s = { xl: 'h-10 px-[15px] text-b1 rounded-l', l: 'h-10 px-[15px] text-b1 rounded-l', m: 'h-8 px-[15px] text-b2 rounded-m', s: 'h-6 px-[7px] text-b2 rounded-s' }[size]
  const v = {
    primary: 'bg-brand text-white shadow-[0_2px_0_rgba(5,145,255,0.1)] hover:bg-brand-hover active:bg-brand-press',
    secondary: 'border border-g300 bg-white text-g900 shadow-[0_2px_0_rgba(0,0,0,0.02)] hover:border-brand-hover hover:text-brand-hover active:border-brand-press active:text-brand-press',
    ghost: 'text-brand hover:text-brand-hover',
  }[variant]
  return <button {...rest} className={`inline-flex items-center justify-center gap-2 transition-colors duration-200 disabled:cursor-not-allowed disabled:border-g300 disabled:bg-g100 disabled:text-g400 disabled:shadow-none ${s} ${v} ${className}`} />
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
  return <p className="whitespace-pre-line text-b2 text-g900">{out}</p>
}

/**
 * Wraps every occurrence of any given keyword in inline <mark>s. Text itself is never changed, only marked up.
 * Always returns a single <span> (never a bare Fragment): when this sits next to a sibling inside a `flex`
 * container (e.g. a bullet dot + text), a Fragment's children become separate flex items and the marked-up
 * text visually breaks apart into its own columns. A span keeps it one DOM node so flex layout isn't affected.
 */
export function Emphasis({ text, keywords }: { text: string; keywords: string[] }) {
  if (!keywords.length) return <span>{text}</span>
  const ranges: [number, number][] = []
  for (const k of keywords) {
    if (!k) continue
    let from = 0
    for (;;) {
      const i = text.indexOf(k, from)
      if (i < 0) break
      ranges.push([i, i + k.length])
      from = i + k.length
    }
  }
  if (!ranges.length) return <span>{text}</span>
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
  return <span>{out}</span>
}

/** Collapsed-by-default detail: a summary line that expands to reveal secondary/supporting content. */
export function Disclosure({ summary, children, className = '' }: { summary: string; children: ReactNode; className?: string }) {
  return (
    <details className={`group ${className}`}>
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-b3 font-semibold text-g700 hover:text-g900">
        {summary} <span className="transition-transform duration-200 group-open:rotate-180" aria-hidden>⌄</span>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  )
}

/** Centered popup with a backdrop. Closes on Escape, backdrop click, or the ✕ button. */
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-4 py-8 sm:py-12" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-t1">{title}</h3>
          <button onClick={onClose} aria-label="닫기" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-m text-g600 hover:bg-g100 hover:text-g900">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

/** Ant Design Alert (warning): pale semantic background, normal text color, status shown by icon. */
export function Note({ children, label = '확인 필요' }: { children: ReactNode; label?: string }) {
  return (
    <div role="note" className="flex gap-2 rounded-xl border border-[#FFE58F] bg-[#FFFBE6] px-3 py-2 text-b2 text-g900">
      <span aria-hidden className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-warning text-[11px] font-semibold text-white">!</span>
      <div><span className="sr-only">{label}: </span>{children}</div>
    </div>
  )
}

/** The page's single primary action: move on to the next step. */
export function NextStep({ to, label }: { to: string; label: string }) {
  return (
    <div className="mt-12 flex items-center justify-between gap-4 border-t border-g200 pt-6">
      <p className="text-b2 text-g600">다음 단계</p>
      <Link to={to} className="inline-flex h-10 items-center rounded-l bg-brand px-[15px] text-b1 text-white shadow-[0_2px_0_rgba(5,145,255,0.1)] transition-colors duration-200 hover:bg-brand-hover">
        {label}
      </Link>
    </div>
  )
}
