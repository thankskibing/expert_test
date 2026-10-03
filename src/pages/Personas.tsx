import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DATA_IDS, PABBR, PAIR, PCOLOR, PNAME, PSHORT, QUAL_IDS, core, personaById, study, type DataPid, type QualPid } from '../lib/data'
import { Button, NextStep, Note, PageHead } from '../components/ui'

const ALL = [...DATA_IDS, ...QUAL_IDS] as string[]
const REV_PAIR: Record<string, string> = { P: 'A', S1: 'B', S2: 'C' }

function Slider({ name, left, right, value, color }: { name: string; left: string; right: string; value: number; color: string }) {
  return (
    <div className="py-2.5">
      <p className="mb-2 text-b3 font-semibold text-g900">{name}</p>
      <div className="relative h-2 rounded-full bg-g200">
        <span className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] bg-white shadow-e2" style={{ left: `${value * 100}%`, borderColor: color }} />
      </div>
      <div className="mt-1.5 flex justify-between text-cap text-g500"><span>{left}</span><span>{right}</span></div>
    </div>
  )
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-g50 p-5 sm:p-6">
      <h3 className="mb-3 text-t1">{title}</h3>
      <div className="text-b2 text-g800">{children}</div>
    </section>
  )
}

function Bullets({ items }: { items: string[] }) {
  return <ul className="space-y-2">{items.map((m) => <li key={m} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-g500" />{m}</li>)}</ul>
}

function LinkPill({ to, children }: { to: string; children: ReactNode }) {
  return <Link to={to} className="inline-flex h-8 items-center rounded-m border border-g300 bg-white px-[15px] text-b2 text-g900 transition-colors duration-200 hover:border-brand-hover hover:text-brand-hover">{children}</Link>
}

export default function Personas() {
  const [sp, setSp] = useSearchParams()
  const id = ALL.includes(sp.get('id') ?? '') ? sp.get('id')! : 'A'
  const p = personaById(id)
  const c = PCOLOR[id]
  const isData = p.kind === 'data'
  const pair = isData ? PAIR[id as DataPid] : REV_PAIR[id]

  return (
    <div>
      <PageHead step={5} title="결과 퍼소나">
        리뷰에서 나온 데이터 퍼소나 3개와 인터뷰에서 나온 정성 퍼소나 3개예요. 이름·나이·직업·지역은 원자료 근거가 없는 가상 프로필이라 평가에서 빼 주세요.
      </PageHead>

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        {([['리뷰 데이터에서 나온 퍼소나', DATA_IDS], ['인터뷰에서 나온 퍼소나', QUAL_IDS]] as [string, string[]][]).map(([label, ids]) => (
          <div key={label}>
            <p className="mb-2 text-b3 font-semibold text-g600">{label}</p>
            <ul className="divide-y divide-g200 overflow-hidden rounded-2xl border border-g200">
              {ids.map((x) => {
                const on = x === id
                return (
                  <li key={x}>
                    <button onClick={() => setSp({ id: x }, { replace: true })} aria-pressed={on}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-200 ${on ? 'bg-g100' : 'hover:bg-g50'}`}>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-l text-cap font-bold" style={x.length > 1 || 'P' === x ? { background: `${PCOLOR[x]}1A`, color: PCOLOR[x] } : { background: PCOLOR[x], color: '#fff' }}>{PABBR[x]}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-cap text-g500">{PSHORT[x]}</span>
                        <span className={`block text-b2 ${on ? 'font-bold text-g900' : 'font-semibold text-g800'}`}>{PNAME[x]}</span>
                      </span>
                      {on && <span className="text-cap font-semibold text-brand">보는 중</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <article>
        <header className="mb-6">
          <p className="text-b3 font-semibold" style={{ color: c }}>{isData ? '데이터' : '정성'} {p.role}</p>
          <h2 className="mt-1 text-h1">{p.type}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {isData ? (
              <>
                <LinkPill to={`/core?p=${id}`}>근거: 핵심 리뷰 {core[id as DataPid].length}건</LinkPill>
                <LinkPill to={`/reviews?p=${id}&cat=D`}>근거: 적합 리뷰 {study.stats.reclass[id as DataPid].counts.D}건</LinkPill>
              </>
            ) : (
              study.qualGroups[id as QualPid].members.map((u) => <LinkPill key={u} to={`/interviews#${u}`}>근거: {u} 인터뷰</LinkPill>)
            )}
            <LinkPill to="/variables">근거: 행동 변수</LinkPill>
            <Button size="s" variant="ghost" onClick={() => setSp({ id: pair }, { replace: true })}>짝 퍼소나 {PSHORT[pair]} 보기</Button>
          </div>
        </header>

        {p.flag && <div className="mb-6"><Note>{p.flag}</Note></div>}

        <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
          <div className="space-y-4">
            <section className="rounded-2xl border border-g200 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-l text-t1 font-bold text-white" style={{ background: c }}>{p.name.slice(0, 1)}</span>
                <div><p className="text-t2 font-bold">{p.name}({p.age}세)</p><p className="text-cap text-g500">가상 프로필</p></div>
              </div>
              <p className="mt-4 flex flex-wrap gap-1.5">{p.tags.map((t) => <span key={t} className="rounded-s border border-g300 bg-g50 px-[7px] text-b3 text-g900">#{t}</span>)}</p>
              <dl className="mt-4 divide-y divide-g200 text-b3">
                {p.profile.map((x) => <div key={x.k} className="grid grid-cols-[7rem_1fr] gap-2 py-2.5"><dt className="text-g600">{x.k}</dt><dd className="text-g900">{x.v}</dd></div>)}
              </dl>
            </section>
            <blockquote className="rounded-2xl px-5 py-6 text-t1 font-bold leading-snug text-g900" style={{ background: `${c}14` }}>“{p.quote}”</blockquote>
            <section className="rounded-2xl border border-g200 p-5">
              <h3 className="mb-1 text-t1">Behavior</h3>
              {p.behavior.map((b) => <Slider key={b.name} {...b} color={c} />)}
            </section>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <Block title="Bio"><p>{p.bio}</p></Block>
              <Block title="Motivation"><Bullets items={p.motivation} /></Block>
              <Block title="Goal"><dl className="space-y-3">{p.goals.map((g) => <div key={g.k}><dt className="font-bold text-g900">{g.k}</dt><dd className="mt-0.5">{g.v}</dd></div>)}</dl></Block>
            </div>
            <div className="space-y-4">
              <Block title="Pain points"><Bullets items={p.pains} /></Block>
              <Block title="Needs"><ol className="space-y-3">{p.needs.map((n, i) => <li key={n.title}><p className="font-bold text-g900">{i + 1}. {n.title}</p><p className="mt-0.5 text-g700">{n.detail}</p></li>)}</ol></Block>
            </div>
          </div>
        </div>
      </article>
      <NextStep to="/process" label="도출 과정·교차 검증 보기" />
    </div>
  )
}
