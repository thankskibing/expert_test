import type { ReactNode } from 'react'
import { personaById } from '../lib/data'

export const XY_COLOR: Record<'X' | 'Y', string> = { X: '#13C2C2', Y: '#722ED1' }

function Slider({ name, left, right, value, color }: { name: string; left: string; right: string; value: number; color: string }) {
  return (
    <div className="py-2">
      <p className="mb-1.5 text-b3 font-semibold text-g900">{name}</p>
      <div className="relative h-1 rounded-full bg-g200">
        <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white" style={{ left: `${value * 100}%`, borderColor: color }} />
      </div>
      <div className="mt-1 flex justify-between text-b3 text-g600"><span>{left}</span><span>{right}</span></div>
    </div>
  )
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-g200 py-4">
      <h4 className="mb-2 text-t2">{title}</h4>
      <div className="text-b2 text-g900">{children}</div>
    </section>
  )
}
const Bullets = ({ items }: { items: string[] }) => (
  <ul className="space-y-1.5">{items.map((m) => <li key={m} className="flex gap-2"><span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-g500" />{m}</li>)}</ul>
)

/**
 * A persona sheet. In blind mode nothing hints at the data source: the label is "퍼소나 X/Y",
 * colours are neutral X/Y colours, and research notes (flags) are hidden.
 */
export default function PersonaCard({ id, label, blind, header }: { id: string; label: 'X' | 'Y'; blind: boolean; header?: ReactNode }) {
  const p = personaById(id)
  const c = XY_COLOR[label]
  return (
    <article className="rounded-xl border border-g200 bg-white">
      <header className="flex flex-wrap items-center gap-3 border-b border-g200 px-5 py-4" style={{ borderTop: `3px solid ${c}`, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
        <span className="flex h-9 w-9 items-center justify-center rounded-full text-t1 text-white" style={{ background: c }}>{label}</span>
        <div className="min-w-0 flex-1">
          <p className="text-b3 text-g600">{p.role.replace(/ \d$/, '').replace('Persona', '퍼소나')}{blind ? '' : ` · ${p.kind === 'data' ? '온라인 리뷰 기반' : '정성 인터뷰 기반'}`}</p>
          <h3 className="text-h3">퍼소나 {label} · {p.type}</h3>
        </div>
        {header}
      </header>
      <div className="px-5 pb-2">
        <section className="py-4">
          <p className="text-t1">{p.name}({p.age}세)</p>
          <p className="mt-1.5 flex flex-wrap gap-1.5">{p.tags.map((t) => <span key={t} className="rounded-s border border-g300 bg-g50 px-[7px] text-b3">#{t}</span>)}</p>
          <dl className="mt-3 grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1 text-b2">
            {p.profile.map((x) => <div key={x.k} className="contents"><dt className="text-g600">{x.k}</dt><dd className="text-g900">{x.v}</dd></div>)}
          </dl>
          <blockquote className="mt-4 rounded-xl px-4 py-3 text-t1 text-g900" style={{ background: `${c}14` }}>“{p.quote}”</blockquote>
        </section>
        <Block title="Bio"><p>{p.bio}</p></Block>
        <Block title="Motivation"><Bullets items={p.motivation} /></Block>
        <Block title="Goal"><dl className="space-y-2">{p.goals.map((g) => <div key={g.k}><dt className="font-semibold">{g.k}</dt><dd>{g.v}</dd></div>)}</dl></Block>
        <Block title="Pain points"><Bullets items={p.pains} /></Block>
        <Block title="Needs"><ol className="space-y-2">{p.needs.map((n, i) => <li key={n.title}><p className="font-semibold">{i + 1}. {n.title}</p><p className="text-g700">{n.detail}</p></li>)}</ol></Block>
        <Block title="Behavior">{p.behavior.map((b) => <Slider key={b.name} {...b} color={c} />)}</Block>
        {!blind && p.flag && <p className="mb-3 rounded-xl border border-[#FFE58F] bg-[#FFFBE6] px-3 py-2 text-b3">{p.flag}</p>}
      </div>
    </article>
  )
}
