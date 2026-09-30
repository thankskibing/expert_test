import { Link, useSearchParams } from 'react-router-dom'
import { DATA_IDS, PAIR, PCOLOR, QUAL_IDS, core, personaById, study, type DataPid, type QualPid } from '../lib/data'
import { NextStep, Note, PageHead, PersonaPill } from '../components/ui'

const ALL = [...DATA_IDS, ...QUAL_IDS] as string[]
const REV_PAIR: Record<string, string> = { P: 'A', S1: 'B', S2: 'C' }

function Slider({ name, left, right, value, color }: { name: string; left: string; right: string; value: number; color: string }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] items-center gap-3 py-1.5 text-[0.85rem]">
      <span className="font-semibold">{name}</span>
      <div>
        <div className="relative h-4">
          <div className="absolute left-0 right-0 top-1/2 h-px bg-rule" />
          <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white" style={{ left: `${value * 100}%`, background: color }} />
        </div>
        <div className="flex justify-between text-[0.72rem] text-slate"><span>{left}</span><span>{right}</span></div>
      </div>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-rule bg-white p-5">
      <h3 className="mb-2.5 text-[0.95rem] font-bold">{title}</h3>
      <div className="text-[0.92rem]">{children}</div>
    </section>
  )
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
        리뷰에서 나온 데이터 퍼소나 3개와 인터뷰에서 나온 정성 퍼소나 3개입니다. 이름·나이·직업·지역은 원자료 근거가 아닌 가상 프로필이므로 평가에서 제외해 주세요.
      </PageHead>

      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        {[['리뷰 데이터에서', DATA_IDS], ['인터뷰에서', QUAL_IDS]].map(([label, ids]) => (
          <div key={label as string}>
            <p className="mb-1.5 text-[0.8rem] text-slate">{label as string}</p>
            <div className="flex flex-col gap-1.5">
              {(ids as string[]).map((x) => (
                <button key={x} onClick={() => setSp({ id: x }, { replace: true })} aria-pressed={x === id}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left ${x === id ? 'border-ink bg-white' : 'border-rule hover:border-slate'}`}>
                  <PersonaPill id={x} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <article>
        <header className="mb-6 flex flex-wrap items-end gap-x-4 gap-y-2 border-b-2 pb-4" style={{ borderColor: c }}>
          <div>
            <p className="text-[0.85rem] font-semibold" style={{ color: c }}>{isData ? '데이터' : '정성'} {p.role}</p>
            <h2 className="font-serif text-[1.8rem] font-bold leading-tight">{p.type}</h2>
          </div>
          <div className="ml-auto flex flex-wrap gap-2 text-[0.85rem]">
            {isData ? (
              <>
                <Link className="rounded-md border border-rule bg-white px-3 py-1.5 hover:border-ink" to={`/core?p=${id}`}>근거: 핵심 리뷰 {core[id as DataPid].length}건</Link>
                <Link className="rounded-md border border-rule bg-white px-3 py-1.5 hover:border-ink" to={`/reviews?p=${id}&cat=D`}>근거: 적합 리뷰 {study.stats.reclass[id as DataPid].counts.D}건</Link>
              </>
            ) : (
              study.qualGroups[id as QualPid].members.map((u) => (
                <Link key={u} className="rounded-md border border-rule bg-white px-3 py-1.5 hover:border-ink" to={`/interviews#${u}`}>근거: {u} 인터뷰</Link>
              ))
            )}
            <Link className="rounded-md border border-rule bg-white px-3 py-1.5 hover:border-ink" to="/variables">근거: 행동 변수</Link>
            <button className="rounded-md border border-rule bg-white px-3 py-1.5 hover:border-ink" onClick={() => setSp({ id: pair }, { replace: true })}>짝 퍼소나 보기</button>
          </div>
        </header>

        {p.flag && <div className="mb-6"><Note>{p.flag}</Note></div>}

        <div className="grid gap-5 lg:grid-cols-[20rem_1fr]">
          <div className="space-y-5">
            <section className="rounded-xl border border-rule bg-white p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full font-serif text-lg font-bold text-white" style={{ background: c }}>{p.name.slice(0, 1)}</span>
                <div><p className="font-bold">{p.name}({p.age}세)</p><p className="text-[0.8rem] text-slate">가상 프로필</p></div>
              </div>
              <p className="mt-3 flex flex-wrap gap-1.5 text-[0.8rem]" style={{ color: c }}>{p.tags.map((t) => <span key={t}>#{t}</span>)}</p>
              <dl className="mt-4 space-y-1.5 text-[0.88rem]">
                {p.profile.map((x) => <div key={x.k} className="grid grid-cols-[7rem_1fr] gap-2"><dt className="text-slate">{x.k}</dt><dd>{x.v}</dd></div>)}
              </dl>
            </section>
            <blockquote className="rounded-xl border-2 bg-white p-5 font-serif text-[1.05rem] leading-relaxed" style={{ borderColor: c }}>“{p.quote}”</blockquote>
            <section className="rounded-xl border border-rule bg-white p-5">
              <h3 className="mb-2 text-[0.95rem] font-bold">Behavior</h3>
              {p.behavior.map((b) => <Slider key={b.name} {...b} color={c} />)}
            </section>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-5">
              <Block title="Bio"><p className="leading-relaxed">{p.bio}</p></Block>
              <Block title="Motivation"><ul className="list-disc space-y-1 pl-5">{p.motivation.map((m) => <li key={m}>{m}</li>)}</ul></Block>
              <Block title="Goal"><dl className="space-y-2.5">{p.goals.map((g) => <div key={g.k}><dt className="font-semibold">{g.k}</dt><dd>{g.v}</dd></div>)}</dl></Block>
            </div>
            <div className="space-y-5">
              <Block title="Pain points"><ul className="list-disc space-y-1 pl-5">{p.pains.map((m) => <li key={m}>{m}</li>)}</ul></Block>
              <Block title="Needs"><ol className="space-y-2.5">{p.needs.map((n, i) => <li key={n.title}><p className="font-semibold">{i + 1}. {n.title}</p><p className="text-slate">{n.detail}</p></li>)}</ol></Block>
            </div>
          </div>
        </div>
      </article>
      <NextStep to="/process" label="6 도출 과정·교차 검증" />
    </div>
  )
}
