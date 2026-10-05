import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { personaById } from '../lib/data'
import { DIMS, ITEM_COUNT, ROUNDS, SCALE } from '../lib/protocol'
import { allRevealed, useEval } from '../lib/evalStore'
import { SOURCE_LABEL, evalOrder } from '../lib/payload'
import PersonaCard, { XY_COLOR } from '../components/PersonaCard'
import { StepNav } from '../components/flow'
import { Note, PageHead, TextArea } from '../components/ui'

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

/** Average of a dimension's item scores for a persona, or null if not all items are rated yet. */
function dimAvg(state: ReturnType<typeof useEval>['state'], pid: string, d: (typeof DIMS)[number]) {
  const vs = d.items.map((it) => state.ratings[pid]?.[it.id])
  if (vs.some((v) => v === undefined)) return null
  return (vs as number[]).reduce((a, v) => a + v, 0) / vs.length
}

/** 추가 질문 2는 해당 영역 평균 점수가 낮은지/높은지에 따라 문구가 달라져요. */
function moreQ(d: (typeof DIMS)[number], avg: number | null) {
  if (avg === null) return d.moreNeutral
  if (avg < 3) return d.moreLow
  if (avg > 3) return d.moreHigh
  return d.moreNeutral
}

export default function Rate() {
  const { state, setRating, setDimNote } = useEval()
  const [sp, setSp] = useSearchParams()
  const order = evalOrder(state)
  const count = (id: string) => Object.keys(state.ratings[id] ?? {}).length
  const [initial] = useState(() => (order.find((o) => count(o.id) < ITEM_COUNT) ?? order[0]).id)
  const pid = order.some((o) => o.id === sp.get('p')) ? sp.get('p')! : initial
  const pos = order.findIndex((o) => o.id === pid)
  const cur = order[pos]
  const revealed = state.revealed[cur.round.key]
  const kind = personaById(pid).kind
  const pick = (id: string) => { setSp({ p: id }, { replace: true }); window.scrollTo(0, 0) }
  const next = order[pos + 1]
  const totalDone = order.reduce((a, o) => a + count(o.id), 0)

  return (
    <div>
      <PageHead step={4} title="전문가 평가">
        퍼소나 6개를 하나씩 7개 영역 22개 문항으로 평가해 주세요. 각 문항은 1점(전혀 그렇지 않다)부터 5점(매우 그렇다)까지예요. 영역마다 있는 추가 질문은 인터뷰 중 답변을 메모하는 칸이에요.
      </PageHead>

      {!allRevealed(state) && <div className="mb-6"><Note label="안내">아직 출처를 확인하지 않은 쌍이 있어요. 제작 데이터 확인 단계를 먼저 마치는 것을 권장해요.</Note></div>}

      <div role="tablist" aria-label="평가할 퍼소나" className="grid gap-3 sm:grid-cols-3">
        {ROUNDS.map((r) => (
          <div key={r.key} className="rounded-xl border border-g200 p-2">
            <p className="px-2 pb-1.5 pt-1 text-b3 font-semibold text-g600">{r.label}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {order.filter((o) => o.round.key === r.key).map((o) => {
                const on = o.id === pid
                const n = count(o.id)
                const rev = state.revealed[r.key]
                return (
                  <button key={o.id} role="tab" aria-selected={on} onClick={() => pick(o.id)}
                    className={`rounded-m border px-2.5 py-2 text-left transition-colors duration-200 ${on ? 'border-brand bg-brand-weak' : 'border-transparent hover:bg-black/[0.04]'}`}>
                    <span className="flex items-center gap-1.5 text-b2 font-semibold text-g900">
                      <span className="h-2 w-2 rounded-full" style={{ background: XY_COLOR[o.label] }} />퍼소나 {o.label}
                      {n === ITEM_COUNT && <span className="ml-auto text-success">✓</span>}
                    </span>
                    <span className="mt-0.5 block text-b3 text-g600">{rev ? (personaById(o.id).kind === 'data' ? '리뷰 기반' : '인터뷰 기반') : '출처 미확인'} · <span className="tabular">{n}/{ITEM_COUNT}</span></span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,26rem)_1fr]">
        <div className="xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto xl:rounded-xl">
          <PersonaCard key={pid} id={pid} label={cur.label} blind={!revealed} />
        </div>

        <div className="min-w-0">
          <p className="mb-2 text-b2 text-g700">{cur.round.label} · 퍼소나 {cur.label}{revealed ? ` (${SOURCE_LABEL[kind]})` : ''} · <span className="tabular">{count(pid)}/{ITEM_COUNT}</span> 문항 응답</p>
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
        ? <StepNav prev={pos === 0 ? '/evidence?r=secondary2' : undefined} nextLabel={`다음: ${next.round.label} · 퍼소나 ${next.label}`} onNext={() => pick(next.id)} hint={`전체 ${totalDone}/${ITEM_COUNT * order.length} 문항`} />
        : <StepNav next="/final" nextLabel="두 퍼소나 비교 평가로" hint={`전체 ${totalDone}/${ITEM_COUNT * order.length} 문항`} />}
    </div>
  )
}
