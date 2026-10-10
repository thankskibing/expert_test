import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CATLABEL, CATS, DATA_IDS, PCOLOR, PNAME, PSHORT, type Cat, type DataPid, core, method, study } from '../lib/data'
import { REVIEW_AGREE_OPTIONS, STEP4_PROCESS_QS, STEP4_RECLASS_QS } from '../lib/protocol'
import { useEval } from '../lib/evalStore'
import { sampleReviewIdx } from '../lib/payload'
import { FieldList } from '../components/form'
import { FullPersonaRow } from '../components/PersonaCard'
import TrackStack from '../components/TrackStack'
import { StepNav } from '../components/flow'
import { Badge, Chip, Highlighted, Note, PageHead, Section, Segmented } from '../components/ui'

const CATCOLOR: Record<Cat, string> = { D: '#3182F6', Q: '#8B95A1', N: '#F04452', X: '#D1D6DB', O: '#E5E8EB', R: '#FF9F2E' }
const GNUM: Record<string, string> = { A: '1', B: '2', C: '3' }

function GroupEvidence({ p }: { p: DataPid }) {
  const g = study.dataGroups[p]
  const list = core[p]
  const tags = [...new Set(list.flatMap((r) => r.tags))]
  const [tag, setTag] = useState<string | null>(null)
  const shown = tag ? list.filter((r) => r.tags.includes(tag)) : list
  return (
    <details className="group mt-4 rounded-2xl border border-g200 p-5">
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-b2 font-semibold text-g700 hover:text-g900">
        <span className="h-2 w-2 rounded-full" style={{ background: PCOLOR[p] }} />
        {PNAME[p]} · 행동 변수 위치와 근거 리뷰 자세히 보기 <span className="transition-transform duration-200 group-open:rotate-180" aria-hidden>⌄</span>
      </summary>
      <div className="mt-4 space-y-6">
        <div>
          <h4 className="mb-2 text-b2 font-bold text-g900">행동 변수 8개 중 이 집단의 위치</h4>
          <div className="rounded-3xl border border-g200 px-4 py-3 sm:px-6">
            <TrackStack tracks={study.dataVars} ids={DATA_IDS} scale={4} paths={[p]} label={(id) => GNUM[id]} />
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-b2 font-bold text-g900">기존 자료의 대표 인용과 재분류 결과</h4>
          <ul className="space-y-3">
            {g.quotes.map((q) => {
              const ok = q.status === 'D'
              return (
                <li key={q.idx} className="rounded-xl bg-g50 p-4">
                  <p className="line-clamp-4 whitespace-pre-line text-b3 text-g700">{q.text}</p>
                  <p className="mt-2 flex items-center gap-2"><span className="text-cap text-g500 tabular">#{q.idx}</span><Badge tone={ok ? 'green' : 'red'}>재분류: {q.status ? CATLABEL[q.status] : '-'}</Badge></p>
                  {!ok && q.reason && <p className="mt-2 text-cap text-g600">{q.reason}</p>}
                </li>
              )
            })}
          </ul>
        </div>
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-b2 font-bold text-g900">핵심 리뷰 {list.length}건</h4>
            <div className="flex flex-wrap gap-1.5">
              {[null, ...tags].map((t) => <Chip key={t ?? 'all'} on={tag === t} onClick={() => setTag(t)}>{t ?? '전체'}</Chip>)}
            </div>
          </div>
          <ul className="space-y-3">
            {shown.map((r) => (
              <li key={r.idx} className="rounded-xl border border-g200 bg-white p-4">
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-cap text-g500 tabular">#{r.idx}</span>
                  {r.tags.map((t) => <Badge key={t}>{t}</Badge>)}
                </div>
                <Highlighted text={r.text} phrases={r.evidence} />
                <p className="mt-2 text-b3 text-g600"><span className="font-semibold text-g800">선정 이유</span> {r.why}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  )
}

function DistBar({ p }: { p: DataPid }) {
  const r = study.stats.reclass[p]
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="flex items-center gap-2 text-b2 font-semibold"><span className="h-2 w-2 rounded-full" style={{ background: PCOLOR[p] }} />{PSHORT[p]} · {PNAME[p]}</span>
        <span className="text-b3 text-g500 tabular">{r.n}건</span>
      </div>
      <div className="flex h-8 gap-0.5 overflow-hidden rounded-m">
        {CATS.filter((c) => r.counts[c.id]).map((c) => {
          const pct = r.counts[c.id] / r.n
          return <div key={c.id} title={`${c.label} ${r.counts[c.id]}건`} className="flex items-center justify-center text-cap font-bold tabular" style={{ width: `${pct * 100}%`, background: CATCOLOR[c.id], color: c.id === 'X' || c.id === 'O' ? '#4E5968' : '#fff' }}>{pct > 0.07 ? `${Math.round(pct * 100)}%` : ''}</div>
        })}
      </div>
    </div>
  )
}

const PARTS = [
  ['process', '4-1. AI 분석 과정'],
  ['reveal', '4-2. 퍼소나 공개'],
  ['reclass', '4-3. 재분류 결과'],
  ['review', '4-4. 리뷰별 판정'],
] as const

function ReviewRow({ pid, idx }: { pid: DataPid; idx: number }) {
  const { state, setReviewJudge } = useEval()
  const review = core[pid].find((r) => r.idx === idx)!
  const key = `${pid}_${idx}`
  const j = state.reviewJudge[key] ?? {}
  return (
    <li className="rounded-xl border border-g200 p-4">
      <p className="mb-2 text-cap text-g500 tabular">#{review.idx}</p>
      <Highlighted text={review.text} phrases={review.evidence} />
      <p className="mt-2 text-b3 text-g600"><span className="font-semibold text-g800">연구자 분류 이유</span> {review.why}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-b3 font-semibold text-g900">이 리뷰가 이 퍼소나의 행동을 얼마나 잘 보여주나요?(1~5)</p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((v) => (
              <button key={v} onClick={() => setReviewJudge(key, { score: v })} className={`flex h-8 w-8 items-center justify-center rounded-m border text-b2 ${j.score === v ? 'border-brand bg-brand text-white' : 'border-g300 bg-white text-g900'}`}>{v}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-b3 font-semibold text-g900">연구자의 분류({review.tags.join(', ')})에 동의하시나요?</p>
          <div className="flex flex-wrap gap-1.5">
            {REVIEW_AGREE_OPTIONS.map((o) => (
              <button key={o} onClick={() => setReviewJudge(key, { agree: o })} className={`h-8 rounded-m border px-2.5 text-b2 ${j.agree === o ? 'border-brand bg-brand-weak text-brand' : 'border-g300 bg-white text-g900'}`}>{o}</button>
            ))}
          </div>
        </div>
      </div>
      <textarea value={j.reason ?? ''} onChange={(e) => setReviewJudge(key, { reason: e.target.value })} rows={2} placeholder="이유를 적어 주세요(선택)" className="mt-3 w-full rounded-m border border-g300 bg-white px-[11px] py-2 text-b2 outline-none placeholder:text-g400 focus:border-brand" />
    </li>
  )
}

export default function Step4() {
  const { state, setStep4, setStep4reclass } = useEval()
  const [part, setPart] = useState<(typeof PARTS)[number][0]>('process')
  const [pid, setPid] = useState<DataPid>('A')

  return (
    <div>
      <PageHead step={4} title="리뷰 기반 AI 분석 및 퍼소나 근거 검증">
        리뷰 집단(A/B/C)을 AI가 어떻게 분석해 퍼소나까지 만들었는지, 그 과정과 근거를 하나씩 확인해 주세요.
      </PageHead>

      <Segmented label="세부 단계" items={PARTS.map((p) => p[0])} value={part} onChange={setPart} render={(v) => PARTS.find((p) => p[0] === v)![1]} />

      {part === 'process' && (
        <div className="mt-6">
          <Section title="AI 분석 과정">
            <ol className="max-w-prose2 space-y-2.5">
              {method.aiProcess.review.steps.map((s, i) => (
                <li key={s} className="flex gap-3 text-b2 text-g800"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-weak text-cap font-bold text-brand">{i + 1}</span>{s}</li>
              ))}
            </ol>
          </Section>

          <Section title="리뷰 분석 집단(A/B/C) 구성 및 행동 변수" lead={`단일 유형 분류 ${method.classification.singleTotal} · 복수 유형 분류 ${method.classification.multiTotal} · 하나 이상 근거가 확인된 데이터 ${method.classification.anyMatch}`}>
            <p className="max-w-prose2 text-b2 text-g700">LDA 토픽모델링 결과를 입력받은 AI가 리뷰 전반에서 반복되는 행동 패턴을 찾아 '정보 탐색/구매 결정 · 루틴/효과 인식 · 기능 활용/제어' 세 영역의 행동 변수로 구성했고, 이 행동 변수를 기준으로 리뷰를 A/B/C 세 집단으로 분류했어요. 이렇게 구성된 각 집단의 행동 변수가 바로 아래 4-2에서 공개할 퍼소나의 핵심 행동 특성이 돼요.</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-3 lg:items-stretch">
              {DATA_IDS.map((p) => {
                const g = study.dataGroups[p]
                const narr = method.groupNarratives[p]
                return (
                  <div key={p} className="flex flex-col rounded-2xl border border-g200 p-5">
                    <p className="mb-1 flex items-center gap-2 text-cap text-g500"><span className="h-2 w-2 rounded-full" style={{ background: PCOLOR[p] }} />{g.group} · 1차 분류 {g.count}건({g.share}) · 핵심 리뷰 {core[p].length}건 선정</p>
                    <h3 className="text-h3">{PNAME[p]}</h3>
                    <p className="mt-1 text-b3 text-g600">포함 키워드({study.stats.keywordRules[p]}): {study.stats.keywords[p].join(', ')}</p>
                    <ul className="mt-3 flex flex-wrap gap-2 text-b3 text-g700">
                      {narr.flowSteps.map((s, i) => <li key={s} className="flex items-center gap-1.5"><span className="rounded-s bg-g50 px-2 py-1">{s}</span>{i < narr.flowSteps.length - 1 && <span className="text-g400">→</span>}</li>)}
                    </ul>
                    <p className="mt-3 rounded-xl bg-g50 px-4 py-3 text-b2 text-g900">{g.summary}</p>
                    <p className="mt-2 text-b3 text-g600">이 집단에 필요한 경험: {narr.need}</p>
                    <p className="mt-3 flex flex-1 flex-wrap items-start gap-1.5 text-b3 text-g700">
                      <span className="rounded-s px-2 py-1 font-semibold text-white" style={{ background: PCOLOR[p] }}>행동 변수: {narr.area}</span>
                      {narr.vars.map((v) => <Badge key={v}>{v}</Badge>)}
                    </p>
                  </div>
                )
              })}
            </div>
            <p className="mt-4 max-w-prose2 text-b3 text-g600">집단 분류는 키워드로 1차 분류한 뒤, 사람이 원문을 다시 읽고 핵심 행동 변수가 실제로 드러나는지 맥락으로 판단했어요. 한 리뷰가 여러 집단에 중복으로 들어갈 수 있어요.</p>
            {DATA_IDS.map((p) => <GroupEvidence key={p} p={p} />)}
          </Section>

          <section className="mt-8 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
            <h2 className="pt-4 text-t1">4-1단계 평가</h2>
            <div className="max-w-3xl"><FieldList fields={STEP4_PROCESS_QS} get={(id) => state.step4[id] ?? ''} set={setStep4} /></div>
          </section>
        </div>
      )}

      {part === 'reveal' && (
        <div className="mt-6">
          <Note label="안내">이제부터 연구자 재검토를 거친 리뷰 기반 퍼소나 3개를 보여드려요. 데이터 출처는 숨기지 않아요.</Note>
          <div className="mt-4"><FullPersonaRow ids={DATA_IDS} /></div>
        </div>
      )}

      {part === 'reclass' && (
        <div className="mt-6">
          <Section title="재분류 결과" lead="키워드로 1차 분류된 리뷰 중 실제 근거는 일부예요. 파란색이 퍼소나 적합이에요.">
            <div className="max-w-3xl space-y-6">
              {DATA_IDS.map((p) => <DistBar key={p} p={p} />)}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-cap text-g600">
                {CATS.map((c) => <span key={c.id} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: CATCOLOR[c.id] }} />{c.label}</span>)}
              </div>
            </div>
          </Section>
          <section className="mt-8 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
            <h2 className="pt-4 text-t1">4-3단계 평가</h2>
            <div className="max-w-3xl"><FieldList fields={STEP4_RECLASS_QS} get={(id) => state.step4reclass[id] ?? ''} set={setStep4reclass} /></div>
          </section>
        </div>
      )}

      {part === 'review' && (
        <div className="mt-6">
          <Segmented label="퍼소나" items={DATA_IDS} value={pid} onChange={setPid} render={(v) => <span className="flex items-center gap-2 py-1"><span className="h-2 w-2 rounded-full" style={{ background: PCOLOR[v] }} />{PSHORT[v]} · {PNAME[v]}</span>} />
          <p className="mt-4 max-w-prose2 text-b2 text-g700">아래 리뷰 {sampleReviewIdx(pid).length}건은 {PSHORT[pid]}의 핵심 리뷰 표본이에요. 하나씩 읽고 연구자의 분류를 다시 판단해 주세요.</p>
          <ul className="mt-4 space-y-3">
            {sampleReviewIdx(pid).map((idx) => <ReviewRow key={idx} pid={pid} idx={idx} />)}
          </ul>
          <p className="mt-6 text-b2 text-g700">전체 분류 데이터를 다 보고 싶다면 <Link to="/reviews" className="text-brand hover:text-brand-hover">전체 분류 데이터 확인</Link>에서 모든 리뷰를 분류별로 볼 수 있어요.</p>
        </div>
      )}

      <StepNav prev="/step3" next="/step5" nextLabel="5단계: 인터뷰·정성 퍼소나 검증으로" />
    </div>
  )
}
