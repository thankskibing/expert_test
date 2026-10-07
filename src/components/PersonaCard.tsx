import type { ReactNode } from 'react'
import { PCOLOR, personaById, PIMG, type Persona } from '../lib/data'

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
    <section className="border-t border-g200 px-5 py-4">
      <h4 className="mb-2 text-t2">{title}</h4>
      <div className="text-b2 text-g900">{children}</div>
    </section>
  )
}
const Bullets = ({ items }: { items: string[] }) => (
  <ul className="space-y-1.5">{items.map((m) => <li key={m} className="flex gap-2"><span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-g500" />{m}</li>)}</ul>
)

function Header({ p, label, blind, c, header }: { p: Persona; label: string; blind: boolean; c: string; header?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-g200 px-5 py-4" style={{ borderTop: `3px solid ${c}` }}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-t1 text-white" style={{ background: c }}>{label}</span>
      <div className="min-w-0 flex-1">
        <p className="text-b3 text-g600">{p.role.replace(/ \d$/, '').replace('Persona', '퍼소나')}{blind ? '' : ` · ${p.kind === 'data' ? '온라인 리뷰 기반' : '정성 인터뷰 기반'}`}</p>
        <h3 className="text-h3">퍼소나 {label} · {p.type}</h3>
      </div>
      {header}
    </header>
  )
}

function ProfileSection({ id, p, c }: { id: string; p: Persona; c: string }) {
  return (
    <section className="px-5 py-4">
      <div className="flex items-center gap-4">
        {PIMG[id] && <img src={PIMG[id]} alt="" aria-hidden className="h-24 w-24 shrink-0 rounded-full border border-g200 object-cover" />}
        <div className="min-w-0">
          <p className="text-t1">{p.name}({p.age}세)</p>
          <p className="mt-1 flex flex-wrap gap-1.5">{p.tags.map((t) => <span key={t} className="rounded-s border border-g300 bg-g50 px-[7px] text-b3">#{t}</span>)}</p>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1 text-b2">
        {p.profile.map((x) => <div key={x.k} className="contents"><dt className="text-g600">{x.k}</dt><dd className="text-g900">{x.v}</dd></div>)}
      </dl>
      <blockquote className="mt-4 rounded-xl px-4 py-3 text-t1 text-g900" style={{ background: `${c}14` }}>“{p.quote}”</blockquote>
    </section>
  )
}

function Body({ p, blind, c }: { p: Persona; blind: boolean; c: string }) {
  return (
    <>
      <Block title="Bio"><p>{p.bio}</p></Block>
      <Block title="Motivation"><Bullets items={p.motivation} /></Block>
      <Block title="Goal"><dl className="space-y-2">{p.goals.map((g) => <div key={g.k}><dt className="font-semibold">{g.k}</dt><dd>{g.v}</dd></div>)}</dl></Block>
      <Block title="Pain points"><Bullets items={p.pains} /></Block>
      <Block title="Needs"><ol className="space-y-2">{p.needs.map((n, i) => <li key={n.title}><p className="font-semibold">{i + 1}. {n.title}</p><p className="text-g700">{n.detail}</p></li>)}</ol></Block>
      <Block title="Behavior">{p.behavior.map((b) => <Slider key={b.name} {...b} color={c} />)}</Block>
      {!blind && p.flag && <p className="mx-5 mb-4 rounded-xl border border-[#FFE58F] bg-[#FFFBE6] px-3 py-2 text-b3">{p.flag}</p>}
    </>
  )
}

/**
 * A persona sheet. In blind mode nothing hints at the data source: the label is "퍼소나 X/Y",
 * colours are neutral X/Y colours, and research notes (flags) are hidden.
 */
export default function PersonaCard({ id, label, blind, header }: { id: string; label: 'X' | 'Y'; blind: boolean; header?: ReactNode }) {
  const p = personaById(id)
  const c = XY_COLOR[label]
  return (
    <article className="flex h-full flex-col rounded-xl border border-g200 bg-white">
      <Header p={p} label={label} blind={blind} c={c} header={header} />
      <ProfileSection id={id} p={p} c={c} />
      <Body p={p} blind={blind} c={c} />
    </article>
  )
}

/** Fully revealed persona card (source shown openly) keyed by the persona's own id, not a blind X/Y label. */
export function FullPersonaCard({ id, header }: { id: string; header?: ReactNode }) {
  const p = personaById(id)
  const c = PCOLOR[id]
  return (
    <article className="flex h-full flex-col rounded-xl border border-g200 bg-white">
      <Header p={p} label={id} blind={false} c={c} header={header} />
      <ProfileSection id={id} p={p} c={c} />
      <Body p={p} blind={false} c={c} />
    </article>
  )
}

/**
 * Side-by-side X/Y comparison. At the xl breakpoint and up, every section (Bio, Motivation, Goal, …)
 * is laid out as one CSS grid row shared by both personas, so the shorter side stretches to match the
 * taller one and the two cards line up section by section. Below xl it falls back to two stacked cards.
 */
export function PersonaPair({ xId, yId, blind }: { xId: string; yId: string; blind: boolean }) {
  const X = personaById(xId)
  const Y = personaById(yId)
  const cx = XY_COLOR.X
  const cy = XY_COLOR.Y
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-g200 bg-white xl:grid xl:grid-cols-2 xl:items-stretch xl:[&>*:nth-child(2n)]:border-l xl:[&>*:nth-child(2n)]:border-g200">
        <Header p={X} label="X" blind={blind} c={cx} />
        <Header p={Y} label="Y" blind={blind} c={cy} />
        <ProfileSection id={xId} p={X} c={cx} />
        <ProfileSection id={yId} p={Y} c={cy} />
        <Block title="Bio"><p>{X.bio}</p></Block>
        <Block title="Bio"><p>{Y.bio}</p></Block>
        <Block title="Motivation"><Bullets items={X.motivation} /></Block>
        <Block title="Motivation"><Bullets items={Y.motivation} /></Block>
        <Block title="Goal"><dl className="space-y-2">{X.goals.map((g) => <div key={g.k}><dt className="font-semibold">{g.k}</dt><dd>{g.v}</dd></div>)}</dl></Block>
        <Block title="Goal"><dl className="space-y-2">{Y.goals.map((g) => <div key={g.k}><dt className="font-semibold">{g.k}</dt><dd>{g.v}</dd></div>)}</dl></Block>
        <Block title="Pain points"><Bullets items={X.pains} /></Block>
        <Block title="Pain points"><Bullets items={Y.pains} /></Block>
        <Block title="Needs"><ol className="space-y-2">{X.needs.map((n, i) => <li key={n.title}><p className="font-semibold">{i + 1}. {n.title}</p><p className="text-g700">{n.detail}</p></li>)}</ol></Block>
        <Block title="Needs"><ol className="space-y-2">{Y.needs.map((n, i) => <li key={n.title}><p className="font-semibold">{i + 1}. {n.title}</p><p className="text-g700">{n.detail}</p></li>)}</ol></Block>
        <Block title="Behavior">{X.behavior.map((b) => <Slider key={b.name} {...b} color={cx} />)}</Block>
        <Block title="Behavior">{Y.behavior.map((b) => <Slider key={b.name} {...b} color={cy} />)}</Block>
        {!blind && X.flag && <p className="mx-5 mb-4 rounded-xl border border-[#FFE58F] bg-[#FFFBE6] px-3 py-2 text-b3">{X.flag}</p>}
        {!blind && Y.flag && <p className="mx-5 mb-4 rounded-xl border border-[#FFE58F] bg-[#FFFBE6] px-3 py-2 text-b3">{Y.flag}</p>}
      </div>
      <div className="grid gap-4 xl:hidden">
        <PersonaCard id={xId} label="X" blind={blind} />
        <PersonaCard id={yId} label="Y" blind={blind} />
      </div>
    </>
  )
}
