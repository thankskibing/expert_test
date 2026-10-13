import { useState } from 'react'
import { HIGHLIGHT_KEYWORDS, PCOLOR, PNAME, PSHORT, QUAL_IDS, method, personaById, study, type QualPid, type Uid } from '../lib/data'
import { REVIEW_AGREE_OPTIONS, STEP5_PATTERN_QS, STEP5_QUAL_QS } from '../lib/protocol'
import { useEval } from '../lib/evalStore'
import { FieldList } from '../components/form'
import { QualGroupVariablesCompare } from '../components/GroupVariables'
import { Body, Header as PersonaHeader, ProfileSection } from '../components/PersonaCard'
import { StepNav } from '../components/flow'
import { Badge, Button, Disclosure, Emphasis, Note, PageHead, Section, Segmented } from '../components/ui'

const UIDS: Uid[] = ['U1', 'U2', 'U3', 'U4', 'U5', 'U6']
const UID_GROUP: Record<Uid, QualPid> = Object.fromEntries(study.participants.map((u) => [u.id, u.group])) as Record<Uid, QualPid>

const pick = (u: (typeof study.participants)[number], k: string) => u.info.find((x) => x.k === k)?.v ?? ''

function Avatar({ id, size = 36 }: { id: string; size?: number }) {
  return <span className="flex shrink-0 items-center justify-center rounded-l text-b2 font-bold text-white" style={{ width: size, height: size, background: PCOLOR[id] }}>{id.slice(1)}</span>
}

/** 조사 대상 선정 기준 + 참여자 6명 프로필. 더 이상 모든 탭 상단에 고정 노출하지 않고, 5-1 '자세히 보기'에만 둔다. */
function ParticipantSelection() {
  const m = method.interview
  return (
    <div className="space-y-5">
      <div className="space-y-1.5 rounded-xl bg-g50 px-4 py-3 text-b3 text-g800">
        {m.designTable.map((x) => <p key={x.k}><span className="font-semibold text-g900">{x.k}</span> {x.v}</p>)}
      </div>
      <p className="max-w-prose2 text-b3 text-g700">{m.selectionReason}</p>
      <p className="max-w-prose2 text-b3 text-g700">{m.genderAgeReason}</p>
      <ul className="divide-y divide-g200 rounded-2xl border border-g200">
        {study.participants.map((u) => (
          <li key={u.id} className="flex items-center gap-3.5 px-5 py-3.5">
            <Avatar id={u.id} size={40} />
            <div className="min-w-0 flex-1">
              <p className="text-b2 font-semibold text-g900">{u.id} · {pick(u, '기본 정보')}</p>
              <p className="truncate text-b3 text-g600">{pick(u, '사용 제품')} · {pick(u, '사용 기간')} · {pick(u, '현재 사용 빈도·시간')}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

const PARTS = [
  ['pattern', '5-1. 분석 과정 및 행동 유형 도출'],
  ['qual', '5-2. AI 퍼소나 및 근거 확인'],
  ['judge', '5-3. 발화별 판정'],
] as const

function PatternExample({ g }: { g: QualPid }) {
  const grp = study.qualGroups[g]
  const member = study.participants.find((u) => u.id === grp.members[0])!
  const quote = member.quotes[0]
  return (
    <div className="rounded-2xl border border-g200 p-5">
      <p className="mb-2 flex items-center gap-2 text-cap text-g500"><span className="h-2 w-2 rounded-full" style={{ background: PCOLOR[g] }} />{grp.group} · {PNAME[g]} · {grp.members.join(', ')}</p>
      <div className="space-y-3">
        <div className="rounded-xl bg-g50 px-4 py-3"><p className="mb-1 text-cap font-semibold text-g600">① 실제 발화 ({member.id})</p><p className="text-b2 text-g900">“{quote}”</p></div>
        <div className="rounded-xl bg-g50 px-4 py-3"><p className="mb-1 text-cap font-semibold text-g600">② 연구자 1차 분석</p><p className="text-b2 text-g900">{grp.traits[0]}</p></div>
        <div className="rounded-xl bg-g50 px-4 py-3"><p className="mb-1 text-cap font-semibold text-g600">③ AI 재구성(참여자 간 공통점·차이 비교)</p><p className="text-b2 text-g900">{grp.summary}</p></div>
      </div>
    </div>
  )
}

/** 5-1 기본 화면: 행동 유형 요약 + 핵심 특징 1개 + 대표 발화(참여자별 1개, 최대 3개). */
function GroupBasicCard({ g, onViewPersona }: { g: QualPid; onViewPersona: () => void }) {
  const grp = study.qualGroups[g]
  const reps = grp.members.map((id) => {
    const u = study.participants.find((x) => x.id === id)!
    return { id: u.id, q: u.quotes[0] }
  })
  return (
    <div className="flex flex-col rounded-2xl border border-g200 p-5">
      <p className="mb-1 flex items-center gap-2 text-cap text-g500"><span className="h-2 w-2 rounded-full" style={{ background: PCOLOR[g] }} />{grp.group} · {grp.role} · 참여자 {grp.members.length}명({grp.members.join(', ')})</p>
      <h3 className="text-h3">{grp.name}</h3>
      <p className="mt-3 rounded-xl bg-g50 px-4 py-3 text-b2 text-g900">{grp.summary}</p>
      <p className="mt-3 flex gap-2 text-b3 text-g700"><span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-g500" />{grp.traits[0]}</p>
      <div className="mt-3 flex-1 space-y-2">
        <p className="text-b3 font-semibold text-g900">대표 발화</p>
        {reps.map((r) => (
          <p key={r.id} className="rounded-xl bg-g50 px-3 py-2 text-b3 text-g800">“{r.q}” <span className="text-g500">— {r.id}</span></p>
        ))}
      </div>
      <button onClick={onViewPersona} className="mt-4 self-start text-b3 font-semibold text-brand hover:text-brand-hover">퍼소나 근거 보기 →</button>
    </div>
  )
}

/**
 * 5-1 상세: 행동 유형별 상세 분류 근거(연구자 1차 분석 전체) + 참여자 전체 원문·Pain point.
 * 행동 변수 6개 위치는 위쪽 '행동 변수 비교' 섹션에서 이미 보여주므로 여기서는 중복하지 않는다.
 * 참여자별 프로필은 핵심 정보만 한 줄로 요약하고, Pain point는 제목만 칩으로 보여줘 분량을 줄였다.
 */
function GroupInterviewDetail({ g }: { g: QualPid }) {
  const grp = study.qualGroups[g]
  const members = grp.members.map((id) => study.participants.find((u) => u.id === id)!)
  return (
    <Disclosure summary={`${PNAME[g]} · 분류 근거와 참여자 원문 자세히 보기`} className="mt-4 rounded-2xl border border-g200 p-5">
      <div className="space-y-6">
        <div>
          <h4 className="mb-2 text-b2 font-bold text-g900">연구자 1차 분석(행동 특성 전체)</h4>
          <ul className="space-y-1.5 rounded-xl bg-g50 px-4 py-3 text-b3 text-g800">
            {grp.traits.map((t) => <li key={t} className="flex gap-2"><span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-g500" />{t}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-b2 font-bold text-g900">참여자 원문 ({grp.members.join(', ')})</h4>
          <div className="space-y-4">
            {members.map((u) => (
              <div key={u.id} className="rounded-xl border border-g200 bg-g50 p-4">
                <p className="mb-1 flex items-center gap-2 text-b2 font-semibold text-g900">
                  <Avatar id={u.id} size={24} />
                  {u.id} · {u.title}
                </p>
                <p className="mb-3 text-b3 text-g600">{pick(u, '피부 타입')} · {pick(u, '주요 피부 고민')} · {pick(u, '사용 기간')}</p>
                <p className="mb-2 text-b3 font-semibold text-g900">발화 전체</p>
                <ul className="space-y-2">
                  {u.quotes.map((q, i) => <li key={i} className="rounded-xl border border-g200 bg-white px-4 py-3 text-b2 text-g900">“{q}”</li>)}
                </ul>
                <p className="mb-1.5 mt-3 text-b3 font-semibold text-g900">Pain point</p>
                <p className="flex flex-wrap gap-1.5">{u.pains.map((p) => <Badge key={p.title} tone="red">{p.title}</Badge>)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Disclosure>
  )
}

/**
 * 5-2 기본 화면: 퍼소나명·행동 유형 → 핵심 행동 특성(간소화) → 근거 참여자·발화(대표 참여자 1명 기본,
 * 나머지는 펼침). 관리 목표·주요 불편·필요한 지원은 대표 발화와 직접 연결되지 않아 전체 프로필
 * 펼침으로 옮기고, 대표 발화 연결성이 가장 중요한 "근거 참여자 및 발화"를 핵심 행동 특성 바로 다음에 둔다.
 */
function QualPersonaEvidence({ pid }: { pid: QualPid }) {
  const persona = personaById(pid)
  const grp = study.qualGroups[pid]
  const members = grp.members.map((id) => study.participants.find((u) => u.id === id)!)
  const [first, ...rest] = members
  const roleLabel = persona.role.replace(/ \d$/, '').replace('Persona', '퍼소나')
  const kw = HIGHLIGHT_KEYWORDS[pid] ?? []

  return (
    <div id={`qual-persona-${pid}`} className="scroll-mt-24 rounded-2xl border border-g200 p-5">
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
          <ul className="space-y-1.5 text-b2 text-g900">{grp.traits.slice(0, 2).map((t) => <li key={t} className="flex gap-2"><span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-g500" /><Emphasis text={t} keywords={kw} /></li>)}</ul>
        </section>

        <section className="border-t border-g200 px-5 py-4">
          <h4 className="mb-1 text-t2">근거 참여자 및 발화</h4>
          <p className="mb-3 text-b3 text-g600">
            근거 참여자: {grp.members.join(', ')}({members.length}명){members.length === 1 && ' · 한 명의 인터뷰를 바탕으로 구성된 퍼소나예요.'}
          </p>
          <div className="rounded-xl border border-g200 bg-g50 p-4">
            <p className="mb-2 flex items-center gap-2 text-b2 font-semibold text-g900"><Avatar id={first.id} size={24} />{first.id} · {first.title}</p>
            <ul className="space-y-1.5">{first.quotes.slice(0, 2).map((q, i) => <li key={i} className="rounded-m bg-white px-3 py-2 text-b2 text-g900">“{q}”</li>)}</ul>
          </div>
          {rest.length > 0 && (
            <Disclosure summary={`다른 참여자 발화 보기(${rest.length}명)`} className="mt-3">
              <div className="space-y-3">
                {rest.map((u) => (
                  <div key={u.id} className="rounded-xl border border-g200 bg-g50 p-4">
                    <p className="mb-2 flex items-center gap-2 text-b2 font-semibold text-g900"><Avatar id={u.id} size={24} />{u.id} · {u.title}</p>
                    <ul className="space-y-1.5">{u.quotes.slice(0, 2).map((q, i) => <li key={i} className="rounded-m bg-white px-3 py-2 text-b2 text-g900">“{q}”</li>)}</ul>
                  </div>
                ))}
              </div>
            </Disclosure>
          )}
          <p className="mt-3 text-cap text-g500">위 퍼소나 프로필(이름·나이·직업 등)은 AI가 구성한 가상 설정이고, 발화는 참여자가 실제로 말한 원문이에요.</p>
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

/** 5-3 발화 한 건. 기본: 검토할 행동 유형 + 핵심 특징 + 발화 2~3개 + 기존 평가 항목 / 상세: 나머지 발화 + 참여자 프로필 + 연구자 분류 근거. */
function InterviewRow({ pid, uid }: { pid: QualPid; uid: Uid }) {
  const { state, setInterviewJudge } = useEval()
  const u = study.participants.find((x) => x.id === uid)!
  const grp = study.qualGroups[pid]
  const key = `${pid}_${uid}`
  const j = state.interviewJudge[key] ?? {}
  const shown = u.quotes.slice(0, 3)
  const extra = u.quotes.slice(3)

  return (
    <div className="rounded-xl border border-g200 p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-s px-2 py-1 text-cap font-semibold text-white" style={{ background: PCOLOR[pid] }}>{PSHORT[pid]} · {PNAME[pid]}</span>
        <span className="text-cap text-g500 tabular">{uid} · {u.title}</span>
      </div>
      <p className="mb-2 flex gap-2 text-b3 text-g700"><span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-g500" />{grp.traits[0]}</p>
      <ul className="space-y-1.5">
        {shown.map((q, i) => <li key={i} className="rounded-xl bg-g50 px-3 py-2 text-b2 text-g900">“{q}”</li>)}
      </ul>

      <Disclosure summary="발화 더 보기 · 참여자 프로필 · 분류 근거 자세히 보기" className="mt-3">
        <div className="space-y-4">
          {extra.length > 0 && (
            <div>
              <p className="mb-1.5 text-b3 font-semibold text-g900">추가 발화</p>
              <ul className="space-y-1.5">{extra.map((q, i) => <li key={i} className="rounded-xl bg-g50 px-3 py-2 text-b2 text-g900">“{q}”</li>)}</ul>
            </div>
          )}
          <div>
            <p className="mb-1.5 text-b3 font-semibold text-g900">참여자 프로필</p>
            <dl className="divide-y divide-g200 rounded-xl border border-g200 px-4 text-b3">
              {u.info.filter((x) => x.k !== '기본 정보').map((x) => (
                <div key={x.k} className="grid grid-cols-[7rem_1fr] gap-3 py-2.5"><dt className="text-g600">{x.k}</dt><dd className="text-g900">{x.v}</dd></div>
              ))}
            </dl>
          </div>
          <div>
            <p className="mb-1.5 text-b3 font-semibold text-g900">Pain point</p>
            <ul className="space-y-2">
              {u.pains.map((p) => <li key={p.title}><p className="text-b2 font-semibold text-g900">{p.title}</p><p className="text-b3 text-g600">{p.detail}</p></li>)}
            </ul>
          </div>
          <div className="space-y-1.5 rounded-xl bg-g50 px-4 py-3 text-b3 text-g700">
            <p className="font-semibold text-g900">연구자가 이 그룹으로 분류한 근거(연구자 1차 분석)</p>
            {grp.traits.map((t) => <p key={t}>· {t}</p>)}
          </div>
        </div>
      </Disclosure>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-b3 font-semibold text-g900">이 참여자의 발화가 이 퍼소나의 행동을 얼마나 잘 보여주나요?(1~5)</p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((v) => (
              <button key={v} onClick={() => setInterviewJudge(key, { score: v })} className={`flex h-8 w-8 items-center justify-center rounded-m border text-b2 ${j.score === v ? 'border-brand bg-brand text-white' : 'border-g300 bg-white text-g900'}`}>{v}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-b3 font-semibold text-g900">연구자의 그룹 분류에 동의하시나요?</p>
          <div className="flex flex-wrap gap-1.5">
            {REVIEW_AGREE_OPTIONS.map((o) => (
              <button key={o} onClick={() => setInterviewJudge(key, { agree: o })} className={`h-8 rounded-m border px-2.5 text-b2 ${j.agree === o ? 'border-brand bg-brand-weak text-brand' : 'border-g300 bg-white text-g900'}`}>{o}</button>
            ))}
          </div>
        </div>
      </div>
      <textarea value={j.reason ?? ''} onChange={(e) => setInterviewJudge(key, { reason: e.target.value })} rows={2} placeholder="이유를 적어 주세요(선택)" className="mt-3 w-full rounded-m border border-g300 bg-white px-[11px] py-2 text-b2 outline-none placeholder:text-g400 focus:border-brand" />
    </div>
  )
}

/** 참여자 U1~U6을 순서대로 한 명씩 검토하는 5-3 UI. 응답은 evalStore에 저장되므로 이동해도 유지된다. */
function InterviewReviewer() {
  const [i, setI] = useState(0)
  const uid = UIDS[i]
  const pid = UID_GROUP[uid]
  return (
    <div className="mt-4">
      <InterviewRow pid={pid} uid={uid} />
      <div className="mt-4 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>이전 참여자</Button>
        <p className="text-b3 text-g600 tabular">{uid} · {i + 1}/{UIDS.length}명</p>
        <Button variant="secondary" onClick={() => setI((v) => Math.min(UIDS.length - 1, v + 1))} disabled={i === UIDS.length - 1}>다음 참여자</Button>
      </div>
    </div>
  )
}

export default function Step5() {
  const { state, setStep5pattern, setStep5qual } = useEval()
  const [part, setPart] = useState<(typeof PARTS)[number][0]>('pattern')

  const isDone = (uid: Uid) => {
    const j = state.interviewJudge[`${UID_GROUP[uid]}_${uid}`]
    return !!j && j.score !== undefined && !!j.agree
  }
  const totalDone = UIDS.filter(isDone).length

  const goToPersona = (p: QualPid) => {
    setPart('qual')
    requestAnimationFrame(() => {
      setTimeout(() => document.getElementById(`qual-persona-${p}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
    })
  }

  return (
    <div>
      <PageHead step={5} title="인터뷰 분석 및 정성 퍼소나 검증">
        정성 인터뷰 분석 → 인터뷰 기반 AI 퍼소나 → 발화별 판정 순서로, 4단계(온라인 리뷰 분석)와 같은 흐름으로 검토해 주세요. 다만 인터뷰 트랙은 연구자가 원문을 먼저 분석한 뒤 AI가 그 위에 패턴을 재구성한다는 점이 리뷰 트랙과 달라요.
      </PageHead>

      <Segmented label="세부 단계" items={PARTS.map((p) => p[0])} value={part} onChange={setPart} render={(v) => PARTS.find((p) => p[0] === v)![1]} />

      {part === 'pattern' && (
        <div className="mt-6">
          <Section title="인터뷰 분석 과정">
            <ol className="max-w-prose2 space-y-2.5">
              {method.aiProcess.interview.steps.map((s, i) => (
                <li key={s} className="flex gap-3 text-b2 text-g800"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-weak text-cap font-bold text-brand">{i + 1}</span>{s}</li>
              ))}
            </ol>
            <Disclosure summary="참여자 및 선정 기준 자세히 보기" className="mt-4 max-w-prose2">
              <ParticipantSelection />
            </Disclosure>
          </Section>

          <Section title="연구자 1차 분석 → AI 재구성 예시" lead="연구자가 원문을 먼저 분석한 결과 위에, AI가 참여자 간 공통점과 차이를 비교해 패턴을 재구성해요.">
            <div className="grid gap-4 sm:grid-cols-3">
              {QUAL_IDS.map((g) => <PatternExample key={g} g={g} />)}
            </div>
          </Section>

          <Section title="행동 유형 3개" lead="연구자의 1차 분석과 AI의 재구성을 거쳐 도출된 세 집단이에요. 이 특성이 바로 다음 5-2의 퍼소나로 이어져요.">
            <div className="grid gap-4 lg:grid-cols-3 lg:items-stretch">
              {QUAL_IDS.map((g) => <GroupBasicCard key={g} g={g} onViewPersona={() => goToPersona(g)} />)}
            </div>
          </Section>

          <Section title="행동 변수 비교" lead="정성 퍼소나 6개 행동 변수에서 각 집단이 어디에 위치하는지 비교해서 볼 수 있어요. 참고 자료의 '행동 변수·그룹' 페이지와 같은 내용이에요.">
            <QualGroupVariablesCompare />
          </Section>

          <Section title="행동 유형별 상세 분류 근거" lead="연구자의 1차 분석 전체와 참여자 전체 발화·Pain point는 아래에서 확인할 수 있어요.">
            {QUAL_IDS.map((g) => <GroupInterviewDetail key={g} g={g} />)}
          </Section>

          <section className="mt-8 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
            <h2 className="pt-4 text-t1">5-1단계 평가</h2>
            <div className="max-w-3xl"><FieldList fields={STEP5_PATTERN_QS} get={(id) => state.step5pattern[id] ?? ''} set={setStep5pattern} /></div>
          </section>
        </div>
      )}

      {part === 'qual' && (
        <div className="mt-6">
          <Note label="안내">이제부터 연구자의 1차 분석 위에 AI가 재구성한 인터뷰 기반 퍼소나 3개를 보여드려요. 데이터 출처는 숨기지 않아요. 5-1에서 확인한 행동 특성은 반복하지 않고, 퍼소나의 핵심 요약과 근거 발화를 중심으로 보여드려요.</Note>
          <div className="mt-4 space-y-6">
            {QUAL_IDS.map((p) => <QualPersonaEvidence key={p} pid={p} />)}
          </div>
          <section className="mt-8 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
            <h2 className="pt-4 text-t1">5-2단계 평가</h2>
            <div className="max-w-3xl"><FieldList fields={STEP5_QUAL_QS} get={(id) => state.step5qual[id] ?? ''} set={setStep5qual} /></div>
          </section>
        </div>
      )}

      {part === 'judge' && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-g50 px-4 py-2.5 text-b3 text-g700">
            {QUAL_IDS.map((p) => (
              <span key={p} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: PCOLOR[p] }} />
                {PSHORT[p]} {study.qualGroups[p].members.filter(isDone).length}/{study.qualGroups[p].members.length}
              </span>
            ))}
            <span className="ml-auto font-semibold text-g900">전체 {totalDone}/{UIDS.length}</span>
          </div>
          <p className="mt-4 max-w-prose2 text-b2 text-g700">참여자 6명의 발화를 한 명씩 읽고, 연구자가 분류한 그룹(퍼소나)이 맞는지 판단해 주세요.</p>
          <InterviewReviewer />
        </div>
      )}

      <StepNav prev="/step4" next="/step6" nextLabel="6단계: 두 퍼소나 비교로" />
    </div>
  )
}
