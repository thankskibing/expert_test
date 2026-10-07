import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PCOLOR, PNAME, PSHORT, personaById } from '../lib/data'
import { DIMS, ITEM_COUNT, SCALE } from '../lib/protocol'
import { useEval } from '../lib/evalStore'
import { SOURCE_LABEL } from '../lib/payload'
import { FullPersonaCard } from '../components/PersonaCard'
import { StepNav } from '../components/flow'
import { PageHead, TextArea } from '../components/ui'

const ORDER = ['A', 'B', 'C', 'P', 'S1', 'S2']

function ScaleRow({ no, q, value, onChange }: { no: string; q: string; value?: number; onChange: (v: number) => void }) {
  return (
    <div className="border-b border-g200 py-4 last:border-0">
      <p className="text-b2 text-g900"><b className="mr-1.5 font-semibold text-brand">{no}</b>{q}</p>
      <div role="radiogroup" aria-label={`${no} ${q}`} className="mt-2.5 grid grid-cols-5 gap-1.5">
        {SCALE.map((s, i) => {
          const v = i + 1
          const on = value === v
          return (
            <button key={v} type="button" role="radio" aria-checked={on} onClick={() => onChange(v)} title={s}
              className={`flex min-h-[3.25rem] flex-col items-center justify-center rounded-m border px-1 py-1.5 text-center transition-colors duration-200 ${on ? 'border-brand bg-brand text-white' : 'border-g300 bg-white text-g900 hover:border-brand-hover hover:text-brand-hover'}`}>
              <span className="text-b1 font-semibold tabular">{v}</span>
              <span className={`text-[11px] leading-tight ${on ? 'text-white' : 'text-g600'}`}>{s}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function dimAvg(state: ReturnType<typeof useEval>['state'], pid: string, d: (typeof DIMS)[number]) {
  const vs = d.items.map((it) => state.ratings[pid]?.[it.id])
  if (vs.some((v) => v === undefined)) return null
  return (vs as number[]).reduce((a, v) => a + v, 0) / vs.length
}
function moreQ(d: (typeof DIMS)[number], avg: number | null) {
  if (avg === null) return d.moreNeutral
  if (avg < 3) return d.moreLow
  if (avg > 3) return d.moreHigh
  return d.moreNeutral
}

export default function Step7() {
  const { state, setRating, setDimNote } = useEval()
  const [sp, setSp] = useSearchParams()
  const count = (id: string) => Object.keys(state.ratings[id] ?? {}).length
  const [initial] = useState(() => ORDER.find((o) => count(o) < ITEM_COUNT) ?? ORDER[0])
  const pid = ORDER.includes(sp.get('p') ?? '') ? sp.get('p')! : initial
  const pos = ORDER.indexOf(pid)
  const kind = personaById(pid).kind
  const pick = (id: string) => { setSp({ p: id }, { replace: true }); window.scrollTo(0, 0) }
  const next = ORDER[pos + 1]
  const totalDone = ORDER.reduce((a, o) => a + count(o), 0)

  return (
    <div>
      <PageHead step={7} title="최종 퍼소나 품질 평가">
        퍼소나 6개를 하나씩 7개 영역 {ITEM_COUNT}개 문항으로 평가해 주세요. 각 문항은 1점(전혀 그렇지 않다)부터 5점(매우 그렇다)까지예요.
      </PageHead>

      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
        {ORDER.map((id) => {
          const on = id === pid
          const n = count(id)
          return (
            <button key={id} onClick={() => pick(id)} className={`rounded-m border px-2.5 py-2 text-left transition-colors duration-200 ${on ? 'border-brand bg-brand-weak' : 'border-g200 hover:bg-black/[0.04]'}`}>
              <span className="flex items-center gap-1.5 text-b2 font-semibold text-g900">
                <span className="h-2 w-2 rounded-full" style={{ background: PCOLOR[id] }} />{PSHORT[id]}
                {n === ITEM_COUNT && <span className="ml-auto text-success">✓</span>}
              </span>
              <span className="mt-0.5 block text-b3 text-g600">{PNAME[id]} · <span className="tabular">{n}/{ITEM_COUNT}</span></span>
            </button>
          )
        })}
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,26rem)_1fr]">
        <div className="xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto xl:rounded-xl">
          <FullPersonaCard key={pid} id={pid} />
        </div>
        <div className="min-w-0">
          <p className="mb-2 text-b2 text-g700">{PSHORT[pid]} · {PNAME[pid]} ({SOURCE_LABEL[kind]}) · <span className="tabular">{count(pid)}/{ITEM_COUNT}</span> 문항 응답</p>
          {DIMS.map((d) => (
            <section key={d.id} className="mb-6 rounded-xl border border-g200">
              <header className="border-b border-g200 bg-g50 px-5 py-3" style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                <h2 className="text-t1">{d.no}. {d.title}{d.en && <span className="ml-1.5 text-b2 font-normal text-g600">{d.en}</span>}</h2>
                <p className="mt-0.5 text-b3 text-g600">{d.purpose}</p>
              </header>
              <div className="px-5">
                {d.items.map((it) => <ScaleRow key={it.id} no={it.id} q={it.q} value={state.ratings[pid]?.[it.id]} onChange={(v) => setRating(pid, it.id, v)} />)}
              </div>
              <div className="border-t border-g200 px-5 py-4">
                <label htmlFor={`${pid}-${d.id}-1`} className="block text-b2 font-semibold text-g900">추가 질문 1 · {d.follow}</label>
                <TextArea id={`${pid}-${d.id}-1`} rows={3} className="mt-2" value={state.dimNotes[pid]?.[`${d.id}_1`] ?? ''} onChange={(e) => setDimNote(pid, `${d.id}_1`, e.target.value)} placeholder="답변 메모" />
              </div>
              <div className="border-t border-g200 px-5 py-4">
                <label htmlFor={`${pid}-${d.id}-2`} className="block text-b2 font-semibold text-g900">추가 질문 2 · {moreQ(d, dimAvg(state, pid, d))}</label>
                <TextArea id={`${pid}-${d.id}-2`} rows={3} className="mt-2" value={state.dimNotes[pid]?.[`${d.id}_2`] ?? ''} onChange={(e) => setDimNote(pid, `${d.id}_2`, e.target.value)} placeholder="답변 메모" />
              </div>
            </section>
          ))}
        </div>
      </div>

      {next
        ? <StepNav prev={pos === 0 ? '/step6' : undefined} nextLabel={`다음: ${PSHORT[next]} · ${PNAME[next]}`} onNext={() => pick(next)} hint={`전체 ${totalDone}/${ITEM_COUNT * ORDER.length} 문항`} />
        : <StepNav next="/step8" nextLabel="8단계: 종합 평가로" hint={`전체 ${totalDone}/${ITEM_COUNT * ORDER.length} 문항`} />}
    </div>
  )
}
