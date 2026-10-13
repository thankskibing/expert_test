import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CATLABEL, DATA_IDS, HIGHLIGHT_KEYWORDS, PCOLOR, PNAME, PSHORT, type DataPid, core, method, personaById, study } from '../lib/data'
import { REVIEW_AGREE_OPTIONS, STEP4_PROCESS_QS } from '../lib/protocol'
import { useEval } from '../lib/evalStore'
import { sampleReviewIdx } from '../lib/payload'
import { FieldList } from '../components/form'
import { DataGroupVariablesCompare } from '../components/GroupVariables'
import { Body, Header as PersonaHeader, ProfileSection } from '../components/PersonaCard'
import { StepNav } from '../components/flow'
import { Badge, Button, Emphasis, Highlighted, Note, PageHead, Section, Segmented } from '../components/ui'

function Disclosure({ summary, children, className = '' }: { summary: string; children: React.ReactNode; className?: string }) {
  return (
    <details className={`group ${className}`}>
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-b3 font-semibold text-g700 hover:text-g900">
        {summary} <span className="transition-transform duration-200 group-open:rotate-180" aria-hidden>⌄</span>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  )
}

function ReviewCard({ r }: { r: (typeof core)[DataPid][number] }) {
  return (
    <li className="rounded-xl border border-g200 bg-white p-4">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-cap text-g500 tabular">#{r.idx}</span>
        {r.tags.map((t) => <Badge key={t}>{t}</Badge>)}
      </div>
      <Highlighted text={r.text} phrases={r.evidence} />
      <p className="mt-2 text-b3 text-g600"><span className="font-semibold text-g800">선정 이유</span> {r.why}</p>
    </li>
  )
}

/** 4-1. 집단별 분류 기준(Strong/Supporting 조건·재분류 사례)만 상세 보기로 제공. 근거 리뷰 자체는 4-2로 연결한다. */
function ClassificationDetail({ p, onViewPersona }: { p: DataPid; onViewPersona: () => void }) {
  const g = study.dataGroups[p]
  return (
    <div className="mt-4 rounded-2xl border border-g200 p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-b2 font-semibold text-g900">
          <span className="h-2 w-2 rounded-full" style={{ background: PCOLOR[p] }} />
          {PNAME[p]}
        </p>
        <button onClick={onViewPersona} className="text-b3 font-semibold text-brand hover:text-brand-hover">퍼소나 근거 보기 →</button>
      </div>
      <Disclosure summary="분류 기준 및 Strong/Supporting 조건 · 재분류 사례 자세히 보기">
        <div className="space-y-3">
          <div className="space-y-1.5 rounded-xl bg-g50 px-4 py-3 text-b3 text-g800">
            <p><span className="font-semibold text-g900">분류 조건</span> {study.stats.keywordRules[p]}</p>
            <p><span className="font-semibold text-g900">포함 키워드</span> {study.stats.keywords[p].join(', ')}</p>
          </div>
          <p className="text-b3 text-g600">연구자가 AI의 1차 분류 결과를 원문으로 다시 검토해 재분류(D=퍼소나 적합 등)한 사례예요.</p>
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
      </Disclosure>
    </div>
  )
}

/** 4-2. 행동 유형 → AI 퍼소나 연결, 퍼소나 핵심 요약 + 원문 근거(중복 없이 한 리뷰에 관련 태그를 함께 표시). */
function PersonaEvidence({ pid }: { pid: DataPid }) {
  const persona = personaById(pid)
  const list = core[pid]
  const primary = list.slice(0, 5)
  const extra = list.slice(5)
  const roleLabel = persona.role.replace(/ \d$/, '').replace('Persona', '퍼소나')

  return (
    <div id={`persona-${pid}`} className="scroll-mt-24 rounded-2xl border border-g200 p-5">
      <div className="flex flex-wrap items-center gap-2 text-b3 text-g700">
        <span className="rounded-s bg-g50 px-2.5 py-1.5 font-semibold text-g900">행동 유형: {PNAME[pid]}</span>
        <span aria-hidden className="text-g400">→ AI 퍼소나 제작 →</span>
        <span className="rounded-s px-2.5 py-1.5 font-semibold text-white" style={{ background: PCOLOR[pid] }}>{roleLabel} · {persona.name}</span>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-g200">
        <PersonaHeader p={persona} label={pid} blind={false} c={PCOLOR[pid]} />

        <section className="border-t border-g200 px-5 py-4">
          <blockquote className="rounded-xl px-4 py-3 text-t1 text-g900" style={{ background: `${PCOLOR[pid]}14` }}>“<Emphasis text={persona.quote} keywords={HIGHLIGHT_KEYWORDS[pid] ?? []} />”</blockquote>
        </section>

        <section className="border-t border-g200 px-5 py-4">
          <h4 className="mb-1 text-t2">원문 근거 리뷰</h4>
          <p className="mb-3 text-b3 text-g600">핵심 리뷰 {list.length}건 중 대표 {primary.length}건이에요. 한 리뷰가 여러 행동 변수의 근거로 함께 쓰이는 경우 리뷰를 반복하지 않고, 관련 변수 태그를 함께 표시했어요.</p>
          <ul className="space-y-3">{primary.map((r) => <ReviewCard key={r.idx} r={r} />)}</ul>
          {extra.length > 0 && (
            <Disclosure summary={`추가 근거 ${extra.length}건 보기`} className="mt-3">
              <ul className="space-y-3">{extra.map((r) => <ReviewCard key={r.idx} r={r} />)}</ul>
            </Disclosure>
          )}
          <p className="mt-3 text-cap text-g500">
            위 리뷰는 생략 없이 원문 전체를 보여드려요. 나이·직업 등 퍼소나 프로필 항목은 AI가 구성한 가상 설정으로, 위 리뷰가 그 항목까지 직접 뒷받침하는 것은 아니에요.
          </p>
        </section>

        <details className="group border-t border-g200">
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3 text-b2 font-semibold text-g700 hover:text-g900">
            퍼소나 전체 프로필 상세 보기(Bio·Motivation·Goal·Pain Points·Needs·Behavior)
            <span className="transition-transform duration-200 group-open:rotate-180" aria-hidden>⌄</span>
          </summary>
          <ProfileSection id={pid} p={persona} c={PCOLOR[pid]} />
          <Body p={persona} blind={false} c={PCOLOR[pid]} />
        </details>
      </div>
    </div>
  )
}

/** 4-3 리뷰 한 건. 기본: 원문 + 분류 정보(태그) + 기존 평가 항목 / 상세: 연구자 분류 이유 + 다른 집단과의 중복. */
function ReviewRow({ pid, idx }: { pid: DataPid; idx: number }) {
  const { state, setReviewJudge } = useEval()
  const review = core[pid].find((r) => r.idx === idx)!
  const key = `${pid}_${idx}`
  const j = state.reviewJudge[key] ?? {}
  const otherGroups = DATA_IDS.filter((p) => p !== pid && core[p].some((r) => r.idx === idx))

  return (
    <div className="rounded-xl border border-g200 p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-s px-2 py-1 text-cap font-semibold text-white" style={{ background: PCOLOR[pid] }}>{PSHORT[pid]} · {PNAME[pid]}</span>
        <span className="text-cap text-g500 tabular">리뷰 #{review.idx}</span>
      </div>
      <Highlighted text={review.text} phrases={review.evidence} />
      <p className="mt-2 flex flex-wrap gap-1.5">{review.tags.map((t) => <Badge key={t} tone="blue">{t}</Badge>)}</p>

      <Disclosure summary="분류 근거 자세히 보기" className="mt-3">
        <div className="space-y-1.5 rounded-xl bg-g50 px-4 py-3 text-b3 text-g700">
          <p><span className="font-semibold text-g900">분류 이유</span> {review.why}</p>
          {otherGroups.length > 0 && (
            <p><span className="font-semibold text-g900">다른 집단과의 중복</span> 이 리뷰는 {otherGroups.map((p) => PNAME[p]).join(', ')}의 근거 리뷰로도 함께 쓰여요.</p>
          )}
        </div>
      </Disclosure>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
    </div>
  )
}

/** 한 번에 하나의 리뷰에 집중하는 4-3 평가 UI. pid가 바뀔 때 key로 리마운트해 커서를 0으로 되돌린다. */
function ReviewReviewer({ pid }: { pid: DataPid }) {
  const ids = sampleReviewIdx(pid)
  const [i, setI] = useState(0)
  const idx = ids[i]
  return (
    <div className="mt-4">
      <ReviewRow pid={pid} idx={idx} />
      <div className="mt-4 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>이전 리뷰</Button>
        <p className="text-b3 text-g600 tabular">{i + 1} / {ids.length}</p>
        <Button variant="secondary" onClick={() => setI((v) => Math.min(ids.length - 1, v + 1))} disabled={i === ids.length - 1}>다음 리뷰</Button>
      </div>
    </div>
  )
}

const PARTS = [
  ['process', '4-1. 행동 유형 분석 과정'],
  ['reveal', '4-2. AI 퍼소나 및 근거 확인'],
  ['review', '4-3. 리뷰별 평가'],
] as const

export default function Step4() {
  const { state, setStep4 } = useEval()
  const [part, setPart] = useState<(typeof PARTS)[number][0]>('process')
  const [pid, setPid] = useState<DataPid>('A')

  const isDone = (p: DataPid, idx: number) => {
    const j = state.reviewJudge[`${p}_${idx}`]
    return !!j && j.score !== undefined && !!j.agree
  }
  const doneOf = (p: DataPid) => sampleReviewIdx(p).filter((idx) => isDone(p, idx)).length
  const totalDone = DATA_IDS.reduce((s, p) => s + doneOf(p), 0)
  const totalAll = DATA_IDS.reduce((s, p) => s + sampleReviewIdx(p).length, 0)

  const goToPersona = (p: DataPid) => {
    setPart('reveal')
    requestAnimationFrame(() => {
      setTimeout(() => document.getElementById(`persona-${p}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
    })
  }

  return (
    <div>
      <PageHead step={4} title="리뷰 기반 AI 분석 및 퍼소나 근거 검증">
        온라인 리뷰 분석 → 행동 유형 도출 → AI 퍼소나 제작 → 근거 확인 → 리뷰별 평가 순서로, 각 단계가 다음 단계로 어떻게 이어지는지 확인해 주세요.
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
            <Disclosure summary="분석 방법 자세히 보기" className="mt-4 max-w-prose2">
              <div className="space-y-2 rounded-xl bg-g50 px-4 py-3 text-b2 text-g800">
                <p>키워드로 1차 분류한 뒤, 사람이 원문을 다시 읽고 핵심 행동 변수가 실제로 드러나는지 맥락으로 판단했어요. 한 리뷰가 여러 집단에 중복으로 포함될 수 있어요.</p>
                <p>단일 유형 분류 {method.classification.singleTotal} · 복수 유형 분류 {method.classification.multiTotal} · 하나 이상 근거가 확인된 데이터 {method.classification.anyMatch}</p>
                <p>중복 포함 집단별 건수: {method.classification.dupTotals}</p>
              </div>
            </Disclosure>
          </Section>

          <Section title="행동 유형 3개" lead="AI가 리뷰 전반에서 반복되는 행동 패턴을 분석해 구성한 세 집단이에요. 이 특성이 바로 다음 4-2의 퍼소나로 이어져요.">
            <div className="grid gap-4 lg:grid-cols-3 lg:items-stretch">
              {DATA_IDS.map((p) => {
                const g = study.dataGroups[p]
                const narr = method.groupNarratives[p]
                return (
                  <div key={p} className="flex flex-col rounded-2xl border border-g200 p-5">
                    <p className="mb-1 flex items-center gap-2 text-cap text-g500"><span className="h-2 w-2 rounded-full" style={{ background: PCOLOR[p] }} />{g.group} · 분류 {g.count}건({g.share})</p>
                    <h3 className="text-h3">{PNAME[p]}</h3>
                    <p className="mt-3 rounded-xl bg-g50 px-4 py-3 text-b2 text-g900">{g.summary}</p>
                    <p className="mt-3 flex flex-1 flex-wrap items-center gap-1.5 text-b3 text-g700">
                      <span className="font-semibold text-g900">주요 행동 변수</span>
                      {narr.vars.map((v) => <Badge key={v} tone="blue">{v}</Badge>)}
                    </p>
                  </div>
                )
              })}
            </div>
          </Section>

          <Section title="행동 변수 비교" lead="데이터 퍼소나 8개 행동 변수에서 각 집단이 어디에 위치하는지 비교해서 볼 수 있어요. 참고 자료의 '행동 변수·그룹' 페이지와 같은 내용이에요.">
            <DataGroupVariablesCompare />
          </Section>

          <Section title="집단별 분류 기준" lead="자세한 근거 리뷰는 4-2에서 퍼소나와 함께 확인할 수 있어요.">
            {DATA_IDS.map((p) => <ClassificationDetail key={p} p={p} onViewPersona={() => goToPersona(p)} />)}
          </Section>
        </div>
      )}

      {part === 'reveal' && (
        <div className="mt-6">
          <Note label="안내">이제부터 연구자 재검토를 거친 리뷰 기반 퍼소나 3개를 보여드려요. 데이터 출처는 숨기지 않아요. 4-1에서 확인한 행동 특성은 반복하지 않고, 퍼소나의 핵심 요약과 원문 근거를 중심으로 보여드려요.</Note>
          <div className="mt-4 space-y-6">
            {DATA_IDS.map((p) => <PersonaEvidence key={p} pid={p} />)}
          </div>
        </div>
      )}

      {part === 'review' && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-g50 px-4 py-2.5 text-b3 text-g700">
            {DATA_IDS.map((p) => (
              <span key={p} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: PCOLOR[p] }} />
                {PSHORT[p]} {doneOf(p)}/{sampleReviewIdx(p).length}
              </span>
            ))}
            <span className="ml-auto font-semibold text-g900">전체 {totalDone}/{totalAll}</span>
          </div>
          <Segmented label="퍼소나" items={DATA_IDS} value={pid} onChange={setPid} render={(v) => <span className="flex items-center gap-2 py-1"><span className="h-2 w-2 rounded-full" style={{ background: PCOLOR[v] }} />{PSHORT[v]} · {PNAME[v]}</span>} />
          <p className="mt-4 max-w-prose2 text-b2 text-g700">아래 리뷰 {sampleReviewIdx(pid).length}건은 {PSHORT[pid]}의 대표 리뷰예요. 하나씩 읽고 분류 근거를 다시 판단해 주세요.</p>
          <ReviewReviewer key={pid} pid={pid} />
          <p className="mt-6 text-b2 text-g700">전체 분류 데이터를 다 보고 싶다면 <Link to="/reviews" className="text-brand hover:text-brand-hover">전체 분류 데이터 확인</Link>에서 모든 리뷰를 분류별로 볼 수 있어요.</p>

          <section className="mt-8 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
            <h2 className="pt-4 text-t1">4단계 종합 평가</h2>
            <div className="max-w-3xl"><FieldList fields={STEP4_PROCESS_QS} get={(id) => state.step4[id] ?? ''} set={setStep4} /></div>
          </section>
        </div>
      )}

      <StepNav prev="/step3" next="/step5" nextLabel="5단계: 인터뷰 분석 및 정성 퍼소나 검증으로" />
    </div>
  )
}
