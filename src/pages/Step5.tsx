import { useState } from 'react'
import { PCOLOR, PNAME, QUAL_IDS, study, type QualPid, type Uid } from '../lib/data'
import { REVIEW_AGREE_OPTIONS, STEP5_PATTERN_QS, STEP5_QUAL_QS } from '../lib/protocol'
import { useEval } from '../lib/evalStore'
import { FieldList } from '../components/form'
import { FullPersonaRow } from '../components/PersonaCard'
import TrackStack from '../components/TrackStack'
import { StepNav } from '../components/flow'
import { Badge, Note, PageHead, PersonaPill, Section, Segmented } from '../components/ui'

const UIDS: Uid[] = ['U1', 'U2', 'U3', 'U4', 'U5', 'U6']

const pick = (u: (typeof study.participants)[number], k: string) => u.info.find((x) => x.k === k)?.v ?? ''

function Avatar({ id, size = 36 }: { id: string; size?: number }) {
  return <span className="flex shrink-0 items-center justify-center rounded-l text-b2 font-bold text-white" style={{ width: size, height: size, background: PCOLOR[id] }}>{id.slice(1)}</span>
}

/** 조사 대상 선정 기준 요약 + 참여자 6명 프로필 목록 (인터뷰 분석에 들어가기 전에 먼저 보여줘요). */
function InterviewTargetProfile() {
  const ps = study.participants
  return (
    <Section title="인터뷰 대상 및 참여자 프로필">
      <p className="max-w-prose2 text-b2 text-g700">
        인터뷰 대상은 메디큐브 부스터프로 1 또는 2를 <b>1개월 이상</b> 사용한 사용자로 선정했어요. 온라인 리뷰 중 사용 기간이 확인되는 307건을 보면, 1개월 미만 사용자는 "아직 효과를 잘 모르겠다"처럼 판단을 유보하는 경우가 많았고, 1개월 이상부터 피부결·탄력 등 구체적인 변화 평가가 나타났어요(13.3%는 한 달 후 재후기를 예고). 이를 바탕으로 최소 사용 기간을 1개월로 정했어요.
        제품 세대(1세대/2세대)는 2세대가 기존 기능을 확장한 후속 모델이라는 점과 장기 사용자 확보가 어렵다는 점을 고려해 구분 없이 모두 포함했고, 성별·연령은 리뷰에서 확인 가능한 사례가 전체의 1.2%뿐이라 별도로 제한하지 않았어요.
      </p>
      <ul className="mt-4 divide-y divide-g200 rounded-2xl border border-g200">
        {ps.map((u) => (
          <li key={u.id} className="flex items-center gap-3.5 px-5 py-3.5">
            <Avatar id={u.id} size={40} />
            <div className="min-w-0 flex-1">
              <p className="text-b2 font-semibold text-g900">{u.id} · {pick(u, '기본 정보')}</p>
              <p className="truncate text-b3 text-g600">{pick(u, '사용 제품')} · {pick(u, '사용 기간')} · {pick(u, '현재 사용 빈도·시간')}</p>
            </div>
            <span className="hidden sm:block"><PersonaPill id={u.group} withName={false} /></span>
          </li>
        ))}
      </ul>
    </Section>
  )
}

const PARTS = [
  ['pattern', '5-1. 발화 → 1차 분석 → AI 재구성'],
  ['qual', '5-2. 정성 퍼소나 검증'],
  ['judge', '5-3. 참여자별 판정'],
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

/** Per-group expandable: where this group sits on the 6 behavior-variable axes, plus the members' full interview material (참고 자료의 '정성 인터뷰'·'행동 변수·그룹'에서 옮겨옴). */
function GroupInterviewEvidence({ g }: { g: QualPid }) {
  const grp = study.qualGroups[g]
  const members = grp.members.map((id) => study.participants.find((u) => u.id === id)!)
  return (
    <details className="group mt-4 rounded-2xl border border-g200 p-5">
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-b2 font-semibold text-g700 hover:text-g900">
        <span className="h-2 w-2 rounded-full" style={{ background: PCOLOR[g] }} />
        {PNAME[g]} · 행동 변수 위치와 인터뷰 원문 자세히 보기 <span className="transition-transform duration-200 group-open:rotate-180" aria-hidden>⌄</span>
      </summary>
      <div className="mt-4 space-y-6">
        <div>
          <h4 className="mb-2 text-b2 font-bold text-g900">행동 변수 6개 중 이 그룹의 위치</h4>
          <div className="rounded-3xl border border-g200 px-4 py-3 sm:px-6">
            <TrackStack tracks={study.qualPattern} ids={UIDS} paths={grp.members} focus={grp.members} />
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-b2 font-bold text-g900">참여자 원문 ({grp.members.join(', ')})</h4>
          <div className="space-y-4">
            {members.map((u) => (
              <div key={u.id} className="rounded-xl border border-g200 bg-g50 p-4">
                <p className="mb-2 flex items-center gap-2 text-b2 font-semibold text-g900">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-l text-cap font-bold text-white" style={{ background: PCOLOR[u.id] }}>{u.id.slice(1)}</span>
                  {u.id} · {u.title}
                </p>
                <dl className="divide-y divide-g200 rounded-xl bg-white px-4 text-b3">
                  {u.info.filter((x) => x.k !== '기본 정보').map((x) => (
                    <div key={x.k} className="grid grid-cols-[7rem_1fr] gap-3 py-2.5"><dt className="text-g600">{x.k}</dt><dd className="text-g900">{x.v}</dd></div>
                  ))}
                </dl>
                <p className="mb-2 mt-3 text-b3 font-semibold text-g900">대표 발화</p>
                <ul className="space-y-2">
                  {u.quotes.map((q, i) => <li key={i} className="rounded-xl border border-g200 bg-white px-4 py-3 text-b2 text-g900">“{q}”</li>)}
                </ul>
                <p className="mb-2 mt-3 text-b3 font-semibold text-g900">Pain point</p>
                <ul className="space-y-3">
                  {u.pains.map((p) => (
                    <li key={p.title}>
                      <p className="flex items-start gap-2 text-b2 font-semibold text-g900"><Badge tone="red">Pain</Badge><span>{p.title}</span></p>
                      <p className="mt-1 text-b3 text-g600">{p.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </details>
  )
}

function InterviewRow({ pid, uid }: { pid: QualPid; uid: Uid }) {
  const { state, setInterviewJudge } = useEval()
  const u = study.participants.find((x) => x.id === uid)!
  const key = `${pid}_${uid}`
  const j = state.interviewJudge[key] ?? {}
  return (
    <li className="rounded-xl border border-g200 p-4">
      <p className="mb-2 flex items-center gap-2 text-cap text-g500">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-l text-cap font-bold text-white" style={{ background: PCOLOR[uid] }}>{uid.slice(1)}</span>
        {uid} · {u.title}
      </p>
      <ul className="space-y-1.5">
        {u.quotes.map((q, i) => <li key={i} className="rounded-xl bg-g50 px-3 py-2 text-b2 text-g900">“{q}”</li>)}
      </ul>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
    </li>
  )
}

export default function Step5() {
  const { state, setStep5pattern, setStep5qual } = useEval()
  const [part, setPart] = useState<(typeof PARTS)[number][0]>('pattern')

  return (
    <div>
      <PageHead step={5} title="인터뷰 분석 및 정성 퍼소나 검증">
        인터뷰 트랙은 연구자가 원문을 먼저 분석한 뒤, 그 결과 위에 AI가 참여자 간 공통점과 차이를 비교해 패턴을 재구성해요. 리뷰 트랙과 순서가 반대라는 점을 염두에 두고 봐 주세요.
      </PageHead>

      <InterviewTargetProfile />

      <Segmented label="세부 단계" items={PARTS.map((p) => p[0])} value={part} onChange={setPart} render={(v) => PARTS.find((p) => p[0] === v)![1]} />

      {part === 'pattern' && (
        <div className="mt-6">
          <Section title="그룹별 발화 → 1차 분석 → AI 재구성 예시">
            <div className="grid gap-4 sm:grid-cols-3">
              {QUAL_IDS.map((g) => <PatternExample key={g} g={g} />)}
            </div>
            <p className="mt-4 max-w-prose2 text-b3 text-g600">인터뷰 U1~U6 원문과 행동 변수 위에서의 위치는 아래 그룹별로 펼쳐서 확인할 수 있어요.</p>
            {QUAL_IDS.map((g) => <GroupInterviewEvidence key={g} g={g} />)}
          </Section>
          <section className="mt-8 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
            <h2 className="pt-4 text-t1">5-1단계 평가</h2>
            <div className="max-w-3xl"><FieldList fields={STEP5_PATTERN_QS} get={(id) => state.step5pattern[id] ?? ''} set={setStep5pattern} /></div>
          </section>
        </div>
      )}

      {part === 'qual' && (
        <div className="mt-6">
          <Note label="안내">최종 인터뷰 기반 퍼소나 3개예요. 데이터 출처는 숨기지 않아요.</Note>
          <div className="mt-4"><FullPersonaRow ids={QUAL_IDS} /></div>
          <section className="mt-8 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
            <h2 className="pt-4 text-t1">5-2단계 평가</h2>
            <div className="max-w-3xl"><FieldList fields={STEP5_QUAL_QS} get={(id) => state.step5qual[id] ?? ''} set={setStep5qual} /></div>
          </section>
        </div>
      )}

      {part === 'judge' && (
        <div className="mt-6">
          <p className="max-w-prose2 text-b2 text-g700">참여자 6명의 발화를 하나씩 읽고, 연구자가 분류한 그룹(퍼소나)이 맞는지 판단해 주세요.</p>
          {QUAL_IDS.map((g) => (
            <div key={g} className="mt-6">
              <h3 className="mb-3 flex items-center gap-2 text-t2"><span className="h-2 w-2 rounded-full" style={{ background: PCOLOR[g] }} />{PNAME[g]}</h3>
              <ul className="space-y-3">
                {study.qualGroups[g].members.map((uid) => <InterviewRow key={uid} pid={g} uid={uid} />)}
              </ul>
            </div>
          ))}
        </div>
      )}

      <StepNav prev="/step4" next="/step6" nextLabel="6단계: 두 퍼소나 비교로" />
    </div>
  )
}
