import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DATA_IDS, HIGHLIGHT_KEYWORDS, PCOLOR, PNAME, PSHORT, type DataPid, core, method, personaById, study, terms } from '../lib/data'
import { REVIEW_AGREE_OPTIONS, STEP4_PROCESS_QS, STEP4_REVIEW_QS } from '../lib/protocol'
import { useEval } from '../lib/evalStore'
import { sampleReviewIdx } from '../lib/payload'
import { FieldList, unanswered } from '../components/form'
import { DataGroupVariablesCompare } from '../components/GroupVariables'
import { Body, Header as PersonaHeader, ProfileSection } from '../components/PersonaCard'
import { StepNav, leftHint } from '../components/flow'
import { nextLabel, stepByNo } from '../lib/steps'
import { Badge, Button, Disclosure, Emphasis, Highlighted, Note, PageHead, Section, Segmented } from '../components/ui'

/** 4-1. 집단별 분류 기준(Strong/Supporting 조건·대표 리뷰)만 상세 보기로 제공. 그 외 근거 리뷰는 4-3으로 연결한다. */
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
      <Disclosure summary="분류 기준 및 Strong/Supporting 조건 · 대표 리뷰 자세히 보기">
        <div className="space-y-3">
          <div className="space-y-1.5 rounded-xl bg-g50 px-4 py-3 text-b3 text-g800">
            <p><span className="font-semibold text-g900">분류 조건</span> {study.stats.keywordRules[p]}</p>
            <p><span className="font-semibold text-g900">포함 키워드</span> {study.stats.keywords[p].join(', ')}</p>
          </div>
          <p className="text-b3 text-g600">이 행동 유형을 뒷받침하는 대표 리뷰예요.</p>
          <ul className="space-y-3">
            {g.quotes.map((q) => (
              <li key={q.idx} className="rounded-xl bg-g50 p-4">
                <p className="scroll-box max-h-40 overflow-y-auto whitespace-pre-line text-b3 text-g700">{q.text}</p>
                <p className="mt-2 text-cap text-g500 tabular">#{q.idx}</p>
                {q.reason && <p className="mt-2 text-cap text-g600">{terms(q.reason)}</p>}
              </li>
            ))}
          </ul>
        </div>
      </Disclosure>
    </div>
  )
}

/** 4-2. 행동 유형 → AI 퍼소나 연결, 퍼소나 핵심 요약을 보여준다. 원문 근거 리뷰는 4-3에서 한 건씩 평가한다. */
function PersonaEvidence({ pid, onViewReviews }: { pid: DataPid; onViewReviews: () => void }) {
  const persona = personaById(pid)
  const g = study.dataGroups[pid]
  const kw = HIGHLIGHT_KEYWORDS[pid] ?? []
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
          <blockquote className="rounded-xl px-4 py-3 text-t1 text-g900" style={{ background: `${PCOLOR[pid]}14` }}>“<Emphasis text={persona.quote} keywords={kw} />”</blockquote>
        </section>

        <section className="border-t border-g200 px-5 py-4">
          <h4 className="mb-1.5 text-t2">핵심 행동 특성</h4>
          <ul className="space-y-1.5 text-b2 text-g900">{g.traits.slice(0, 2).map((t) => <li key={t} className="flex gap-2"><span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-g500" /><Emphasis text={t} keywords={kw} /></li>)}</ul>
          <button onClick={onViewReviews} className="mt-3 text-b3 font-semibold text-brand hover:text-brand-hover">원문 근거 리뷰 보기(4-3) →</button>
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
      <div className="max-h-56 overflow-y-auto pr-1 scroll-box"><Highlighted text={review.text} phrases={review.evidence} /></div>
      <p className="mt-2 flex flex-wrap gap-1.5">{review.tags.map((t) => <Badge key={t} tone="blue">{t}</Badge>)}</p>

      <Disclosure summary="분류 근거 자세히 보기" className="mt-3">
        <div className="space-y-1.5 rounded-xl bg-g50 px-4 py-3 text-b3 text-g700">
          <p><span className="font-semibold text-g900">분류 이유</span> {terms(review.why)}</p>
          {otherGroups.length > 0 && (
            <p><span className="font-semibold text-g900">다른 집단과의 중복</span> 이 리뷰는 {otherGroups.map((p) => PNAME[p]).join(', ')}의 근거 리뷰로도 함께 쓰여요.</p>
          )}
        </div>
      </Disclosure>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-b3 font-semibold text-g900">이 리뷰가 이 퍼소나의 행동을 얼마나 잘 보여주나요?</p>
          <p className="mb-1.5 text-cap text-g600">1 전혀 보여주지 못한다 · 3 보통이다 · 5 매우 잘 보여준다</p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((v) => (
              <button key={v} onClick={() => setReviewJudge(key, { score: v })} className={`flex h-8 w-8 items-center justify-center rounded-m border text-b2 ${j.score === v ? 'border-brand bg-brand text-white' : 'border-g300 bg-white text-g900'}`}>{v}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-b3 font-semibold text-g900">이 리뷰를 {PSHORT[pid]}의 근거로 분류한 것({review.tags.join(', ')})에 동의하시나요?</p>
          <div className="flex flex-wrap gap-1.5">
            {REVIEW_AGREE_OPTIONS.map((o) => (
              <button key={o} onClick={() => setReviewJudge(key, { agree: o })} className={`h-8 rounded-m border px-2.5 text-b2 ${j.agree === o ? 'border-brand bg-brand-weak text-brand' : 'border-g300 bg-white text-g900'}`}>{o}</button>
            ))}
          </div>
        </div>
      </div>
      <textarea value={j.reason ?? ''} onChange={(e) => setReviewJudge(key, { reason: e.target.value })} rows={2} placeholder={j.agree && j.agree !== '동의' ? '동의하지 않거나 일부만 동의하신 이유를 적어 주세요' : '이유를 적어 주세요(선택)'} className="mt-3 w-full rounded-m border border-g300 bg-white px-[11px] py-2 text-b2 outline-none placeholder:text-g400 focus:border-brand" />
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

  const goToReview = (p: DataPid) => {
    setPid(p)
    setPart('review')
    window.scrollTo(0, 0)
  }

  return (
    <div>
      <PageHead step={4} title={stepByNo(4).title}>
        온라인 리뷰 분석 → 행동 유형 도출 → AI 퍼소나 제작 → 근거 확인 → 리뷰별 평가 순서로, 각 단계가 다음 단계로 어떻게 이어지는지 확인해 주세요.
      </PageHead>

      <Segmented label="세부 단계" items={PARTS.map((p) => p[0])} value={part} onChange={setPart} render={(v) => <span className="flex items-center gap-1.5">{PARTS.find((p) => p[0] === v)![1]}{v !== 'reveal' && <span className="rounded-s bg-g100 px-1.5 text-cap text-g600">문항</span>}</span>} />

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
                <p>위 4번의 키워드 규칙으로 1차 분류한 뒤, 5번에서 각 리뷰에 핵심 행동 변수가 실제로 드러나는지 원문 맥락으로 다시 판정했어요. 한 리뷰가 여러 유형에 중복으로 포함될 수 있어요.</p>
                <p>3,601건 중 하나 이상의 유형 키워드에 해당한 리뷰는 {method.classification.anyMatch}이고, 나머지 리뷰는 어느 유형에도 분류되지 않았어요.</p>
                <p>한 유형에만 해당 {method.classification.singleTotal} · 여러 유형에 중복 해당 {method.classification.multiTotal}</p>
                <p>중복을 포함한 유형별 1차 분류 건수는 {method.classification.dupTotals.replace('중복 포함 시 ', '')}이라 합계(2,333건)가 실제 리뷰 수보다 많아요.</p>
              </div>
            </Disclosure>
          </Section>

          <Section title="행동 유형 3개" lead="AI가 리뷰 전반에서 반복되는 행동 패턴을 분석해 구성한 세 유형이에요. 키워드로 1차 분류된 리뷰 중 재분류에서 실제 근거로 판정된(퍼소나 적합) 리뷰는 일부이니, 두 숫자를 함께 봐 주세요. 이 특성이 바로 다음 4-2의 퍼소나로 이어져요.">
            <div className="grid gap-4 lg:grid-cols-3 lg:items-stretch">
              {DATA_IDS.map((p) => {
                const g = study.dataGroups[p]
                const narr = method.groupNarratives[p]
                return (
                  <div key={p} className="flex flex-col rounded-2xl border border-g200 p-5">
                    <p className="mb-1 flex items-center gap-2 text-cap text-g500"><span className="h-2 w-2 rounded-full" style={{ background: PCOLOR[p] }} />{PSHORT[p]}</p>
                    <h3 className="text-h3">{PNAME[p]}</h3>
                    <p className="mt-2 text-b3 text-g700 tabular">1차 키워드 분류 {g.count}건(중복 포함) → 재분류 적합 <b className="text-g900">{study.stats.reclass[p].counts.D}건</b>({Math.round((study.stats.reclass[p].counts.D / g.count) * 1000) / 10}%)</p>
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

          <Section title="행동 변수 비교" lead="리뷰 기반 퍼소나 8개 행동 변수에서 각 집단이 어디에 위치하는지 비교해서 볼 수 있어요. 참고 자료의 '행동 변수·그룹' 페이지와 같은 내용이에요.">
            <DataGroupVariablesCompare />
          </Section>

          <Section title="집단별 분류 기준" lead="자세한 근거 리뷰는 4-3에서 퍼소나별로 한 건씩 확인하고 평가할 수 있어요.">
            {DATA_IDS.map((p) => <ClassificationDetail key={p} p={p} onViewPersona={() => goToPersona(p)} />)}
          </Section>

          <section className="mt-8 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
            <h2 className="pt-4 text-t1">4단계 종합 평가</h2>
            <div className="max-w-3xl"><FieldList fields={STEP4_PROCESS_QS} get={(id) => state.step4[id] ?? ''} set={setStep4} prefix="4-Q" /></div>
            <p className="pb-4 text-b3 text-g600">4단계 문항은 <button onClick={() => { setPart('review'); window.scrollTo(0, 0) }} className="font-semibold text-brand hover:text-brand-hover">4-3. 리뷰별 평가</button> 탭 아래(4-Q5~4-Q7)에도 이어져요.</p>
          </section>
        </div>
      )}

      {part === 'reveal' && (
        <div className="mt-6">
          <Note label="안내">이제부터 연구자 재검토를 거친 리뷰 기반 퍼소나 3개를 보여드려요. 데이터 출처는 숨기지 않아요. 4-1에서 확인한 행동 특성은 반복하지 않고, 퍼소나의 핵심 요약을 중심으로 보여드려요. 원문 근거 리뷰는 4-3에서 퍼소나별로 한 건씩 확인하고 평가할 수 있어요.</Note>
          <div className="mt-4 space-y-6">
            {DATA_IDS.map((p) => <PersonaEvidence key={p} pid={p} onViewReviews={() => goToReview(p)} />)}
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
          <p className="mt-4 max-w-prose2 text-b2 text-g700">아래 리뷰 {sampleReviewIdx(pid).length}건은 연구팀이 {PSHORT[pid]}의 핵심 리뷰 중에서 행동 특징이 뚜렷한 것으로 고른 사례예요. 하나씩 읽고 분류 근거를 다시 판단해 주세요. 재분류에서 적합하지 않다고 본 리뷰는 <Link to="/reviews" className="text-brand hover:text-brand-hover">리뷰 데이터</Link>에서 범주별로 볼 수 있어요.</p>
          <ReviewReviewer key={pid} pid={pid} />
          <p className="mt-6 text-b2 text-g700">전체 분류 데이터를 다 보고 싶다면 <Link to="/reviews" className="text-brand hover:text-brand-hover">전체 분류 데이터 확인</Link>에서 모든 리뷰를 분류별로 볼 수 있어요.</p>

          <section className="mt-8 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
            <h2 className="pt-4 text-t1">4단계 종합 평가</h2>
            <div className="max-w-3xl"><FieldList fields={STEP4_REVIEW_QS} get={(id) => state.step4[id] ?? ''} set={setStep4} prefix="4-Q" start={5} /></div>
          </section>
        </div>
      )}

      <StepNav prev="/step3" next="/step5" nextLabel={nextLabel(5)} hint={leftHint(unanswered([...STEP4_PROCESS_QS, ...STEP4_REVIEW_QS], (id) => state.step4[id] ?? ''), '4단계(4-1·4-3 탭)')} />
    </div>
  )
}
