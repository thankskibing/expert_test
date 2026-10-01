import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PCOLOR, PNAME, PSHORT } from '../lib/data'

/* Components follow the Toss Design System (toss.md): flat surfaces, 1px grey-200 hairlines,
   rounded ladder (12/14/16/20/24), chips as full pills, a single blue primary action per screen. */

export function PageHead({ step, title, children }: { step?: number; title: string; children?: ReactNode }) {
  return (
    <header className="mb-10 max-w-prose2">
      {step !== undefined && <p className="mb-2 text-b3 font-semibold text-brand">{step}단계</p>}
      <h1 className="text-h1 sm:text-[32px]">{title}</h1>
      {children && <div className="mt-3 text-b1 text-g700">{children}</div>}
    </header>
  )
}

export function Section({ title, lead, children, id }: { title: string; lead?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="mb-16 scroll-mt-20">
      <h2 className="text-h3">{title}</h2>
      {lead && <div className="mt-1.5 max-w-prose2 text-b2 text-g600">{lead}</div>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

export function Card({ children, className = '', tone = 'white' }: { children: ReactNode; className?: string; tone?: 'white' | 'grey' }) {
  return <div className={`rounded-2xl ${tone === 'grey' ? 'bg-g50' : 'border border-g200 bg-white'} ${className}`}>{children}</div>
}

/** Persona badge. Data personas are filled, qualitative personas are washed: each pair shares a hue. */
export function PersonaPill({ id, withName = true }: { id: string; withName?: boolean }) {
  const qual = id === 'P' || id === 'S1' || id === 'S2'
  const c = PCOLOR[id]
  return (
    <span
      className="inline-flex h-[26px] items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-b3 font-semibold"
      style={qual ? { background: `${c}1A`, color: c } : { background: c, color: '#fff' }}
    >
      {PSHORT[id]}
      {withName && <span className="font-medium opacity-90">{PNAME[id]}</span>}
    </span>
  )
}

/** Segmented control: grey track, the selected segment lifts to white. */
export function Segmented<T extends string>({ items, value, onChange, render, label }: { items: T[]; value: T; onChange: (v: T) => void; render: (v: T, active: boolean) => ReactNode; label?: string }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex max-w-full flex-wrap gap-1 rounded-l bg-g100 p-1">
      {items.map((it) => {
        const on = it === value
        return (
          <button key={it} role="tab" aria-selected={on} onClick={() => onChange(it)}
            className={`min-h-[40px] rounded-m px-3.5 text-left text-b2 font-semibold transition-colors duration-200 ${on ? 'bg-white text-g900 shadow-e1' : 'text-g600 hover:text-g800'}`}>
            {render(it, on)}
          </button>
        )
      })}
    </div>
  )
}
/** Back-compat alias */
export const Tabs = Segmented

export function Chip({ on, onClick, children, title }: { on: boolean; onClick: () => void; children: ReactNode; title?: string }) {
  return (
    <button onClick={onClick} aria-pressed={on} title={title}
      className={`inline-flex h-[34px] items-center gap-1 rounded-full px-3.5 text-b3 font-semibold transition-colors duration-200 ${on ? 'bg-g900 text-white' : 'border border-g200 bg-white text-g700 hover:bg-g50'}`}>
      {children}
    </button>
  )
}

export function Badge({ children, tone = 'grey' }: { children: ReactNode; tone?: 'grey' | 'red' | 'green' | 'blue' | 'orange' | 'dark' }) {
  const t = {
    grey: 'bg-g100 text-g700', red: 'bg-[#FFEBEE] text-danger', green: 'bg-[#E5F8EF] text-[#029359]',
    blue: 'bg-brand-weak text-brand', orange: 'bg-[#FFF3E0] text-[#E5830E]', dark: 'bg-g800 text-white',
  }[tone]
  return <span className={`inline-flex h-[22px] items-center rounded-[6px] px-2 text-cap font-semibold ${t}`}>{children}</span>
}

export function TextField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`h-12 w-full rounded-m border border-g200 bg-g100 px-4 text-b2 outline-none transition-colors duration-200 placeholder:text-g400 focus:border-[1.5px] focus:border-brand focus:bg-white ${props.className ?? ''}`} />
}
export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-m border border-g200 bg-g100 px-4 py-3 text-b2 outline-none transition-colors duration-200 placeholder:text-g400 focus:border-[1.5px] focus:border-brand focus:bg-white ${props.className ?? ''}`} />
}

export function Button({ variant = 'secondary', size = 'm', className = '', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost'; size?: 'xl' | 'l' | 'm' | 's' }) {
  const s = { xl: 'h-14 rounded-xl px-6 text-[17px] font-bold', l: 'h-12 rounded-l px-5 text-[17px] font-bold', m: 'h-10 rounded-m px-4 text-b2 font-semibold', s: 'h-8 rounded-[10px] px-3 text-b3 font-semibold' }[size]
  const v = { primary: 'bg-brand text-white hover:bg-brand-press', secondary: 'bg-g100 text-g900 hover:bg-g200', ghost: 'text-brand hover:bg-brand-weak' }[variant]
  return <button {...rest} className={`inline-flex items-center justify-center gap-1.5 transition-colors duration-200 disabled:opacity-30 ${s} ${v} ${className}`} />
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
  return <p className="whitespace-pre-line text-b2 text-g800">{out}</p>
}

/** Bottom-info style notice: washed surface with a short label, no side rail. */
export function Note({ children, label = '확인 필요' }: { children: ReactNode; label?: string }) {
  return (
    <div className="flex gap-3 rounded-xl bg-g50 px-4 py-3.5 text-b2 text-g800">
      <span className="shrink-0 pt-px"><Badge tone="orange">{label}</Badge></span>
      <div>{children}</div>
    </div>
  )
}

/** The page's single primary action: move on to the next step. */
export function NextStep({ to, label }: { to: string; label: string }) {
  return (
    <div className="mt-20 flex flex-col items-start gap-2 border-t border-g200 pt-8">
      <p className="text-b3 text-g600">다음 단계</p>
      <Link to={to} className="inline-flex h-14 items-center rounded-xl bg-brand px-7 text-[17px] font-bold text-white transition-colors duration-200 hover:bg-brand-press">
        {label}
      </Link>
    </div>
  )
}
