import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DATA_IDS, core, personaById, study, type DataPid, type QualPid, type Uid } from '../lib/data'
import { EVIDENCE_QS_AFTER, ROUNDS, type RoundKey } from '../lib/protocol'
import { useEval, xy } from '../lib/evalStore'
import { SOURCE_DETAIL, SOURCE_LABEL } from '../lib/payload'
import TrackStack from '../components/TrackStack'
import { XY_COLOR } from '../components/PersonaCard'
import { FieldList } from '../components/form'
import { RoundTabs, StepNav } from '../components/flow'
import { Button, Highlighted, PageHead } from '../components/ui'

const GNUM: Record<string, string> = { A: '1', B: '2', C: '3' }
const UIDS: Uid[] = ['U1', 'U2', 'U3', 'U4', 'U5', 'U6']

interface Item { key: string; text: string; evidence?: string[] }

/**
 * Hand-picked highlight phrases for interview quotes, matched to the same spirit as the
 * `evidence` phrases already curated for data-persona reviews (core.json). Keyed by the exact
 * quote text since Participant.quotes is a plain string[].
 */
const QUAL_HIGHLIGHT: Record<string, string[]> = {
  '저녁에 여유로울 때 제일 많이 사용하고 다음 날에 중요한 약속이 있으면 꼭 한번 사용해요': ['다음 날에 중요한 약속이 있으면 꼭 한번 사용해요'],
  '너무 귀찮을 때는 야근하고 늦게 와서 너무 피곤하다든가 그럴 때는 이제 에어샷 모드만 하고 그 다음에 바로 마스크 팩 올리고 끝내요': ['에어샷 모드만 하고 그 다음에 바로 마스크 팩 올리고 끝내요'],
  '피부가 뒤집혔을 때는 에어샷이 각질 제거를 하면서 자극을 주는 거기 때문에 그럴 땐 사용하지 않습니다': ['그럴 땐 사용하지 않습니다'],
  '흡수도 잘 되는 것 같아서 부스터 모드랑 모공 걱정 때문에 에어샷 모드 이렇게 두개를 주로 사용하고 있어요': ['두개를 주로 사용하고 있어요'],
  '처음에 쓸 땐 좋다고 생각했는데 3개월 - 4개월 되면서는 효과를 덜 받나 생각할 때도 있어요': ['효과를 덜 받나 생각할 때도 있어요'],
  '1년에서 많으면 2년은 써봐야 효과가 있다고 판단할 수 있을 것 같아요': ['1년에서 많으면 2년은 써봐야 효과가 있다고 판단할 수 있을 것 같아요'],
  '보통 평일에는 부스터모드만 사용하고 시간이 여유로운 금요일 오후 주말 등에는 모든 모드를 활용하려고 해요': ['부스터모드만 사용하고', '모든 모드를 활용하려고 해요'],
  '피부가 뒤집어졌거나 민감한 날에는 에어샷이나 더마샷 같은 자극을 주는 것은 최대한 피하고 부스터 모드만 활용해요': ['최대한 피하고 부스터 모드만 활용해요'],
  '피부 상태가 양호할 때는 모든 모드를 5~10분 정도 사용하려고 하고, 피부 컨디션이 나쁠 때는 기본적인 부스터프로 모드만 5~10분 정도 사용해요': ['모든 모드를 5~10분 정도 사용', '부스터프로 모드만 5~10분 정도 사용해요'],
  '가끔 모공 관리 때문에 다른 모드를 사용하기도 하는데 대부분은 그냥 비슷한 루틴으로 사용해요': ['대부분은 그냥 비슷한 루틴으로 사용해요'],
  '다른 모드는 별로 저한테 도움이 안된다고 느꼈어요': ['도움이 안된다고 느꼈어요'],
  '원래는 팔자 주름 개선을 위해 구매했는데 팔자 주름 효과는 잘 모르겠고 얼굴 윤곽 잡는데 효과가 있는 것 같아서 그 기능 위주로 사용해요': ['팔자 주름 효과는 잘 모르겠고 얼굴 윤곽 잡는데 효과가 있는 것 같아서 그 기능 위주로 사용해요'],
  '처음에 구매했을 때는 막 엄청 큰 기대를 가지고 구매를 했었는데 그냥 지금은 그렇게 큰 기대는 없고 하면 안 하는 것보단 낫겠지 하는 마음으로 쓰고 있습니다.': ['하면 안 하는 것보단 낫겠지 하는 마음으로 쓰고 있습니다'],
  '모드가 많아도 쓰는 게 정해져 있고 저는 에어샷만 거의 쓰거든요. 다른 거를 잘 안 써요 나머지 기능은 다 비슷한 느낌이에요': ['에어샷만 거의 쓰거든요', '다른 거를 잘 안 써요'],
  '처음에는 일주일에 두세번씩 육개월 정도 사용하다가 겨울이나 계절 바뀔 때나 피부과 예약이 힘들 때 긴급할 때 사용하는 용도로 사용하고 있어요': ['긴급할 때 사용하는 용도로 사용하고 있어요'],
  '부스터 모드를 절반 이상 사용하고 나머지 모드 중 MC/더마샷 모드는 돌려가며 써요': ['부스터 모드를 절반 이상 사용'],
  '마스크팩 할 때 부스터 모드 꼭 하고 귀찮을 때는 AI 케어 모드로 하거나 하는 식으로 루틴을 지키게 돼요': ['루틴을 지키게 돼요'],
}

/**
 * One flat list of short excerpts for either persona type, in the same card shape (index badge +
 * text, with highlighted phrases on both sides) — the data/qual format itself no longer needs to
 * look different, since this page now shows the source directly instead of asking evaluators to
 * guess it from these cards.
 */
function evidenceItems(id: string): Item[] {
  const p = personaById(id)
  if (p.kind === 'data') return core[id as DataPid].map((r) => ({ key: `#${r.idx}`, text: r.text, evidence: r.evidence }))
  const qg = study.qualGroups[id as QualPid]
  const people = study.participants.filter((u) => qg.members.includes(u.id))
  let n = 0
  return people.flatMap((u) => u.quotes.map((q) => ({ key: `#${++n}`, text: q, evidence: QUAL_HIGHLIGHT[q] })))
}

function Sub({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-g200 px-5 py-5">
      <h4 className="text-t2">{title}</h4>
      {lead && <p className="mt-0.5 text-b3 text-g600">{lead}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Traits({ traits, summary }: { traits: string[]; summary: string }) {
  return (
    <>
      <ul className="space-y-1.5">{traits.map((t) => <li key={t} className="flex gap-2 text-b2 text-g900"><span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-g500" />{t}</li>)}</ul>
      <p className="mt-3 rounded-xl bg-g50 px-4 py-3 text-b2 font-semibold text-g900">{summary}</p>
    </>
  )
}

function EvidenceList({ items, more, setMore }: { items: Item[]; more: boolean; setMore: (fn: (v: boolean) => boolean) => void }) {
  const shown = more ? items : items.slice(0, 5)
  return (
    <>
      <ul className="space-y-3">
        {shown.map((it) => (
          <li key={it.key} className="rounded-xl border border-g200 p-4">
            <p className="mb-1.5 text-cap text-g500 tabular">{it.key}</p>
            {it.evidence ? <Highlighted text={it.text} phrases={it.evidence} /> : <p className="whitespace-pre-line text-b2 text-g900">{it.text}</p>}
          </li>
        ))}
      </ul>
      {items.length > 5 && <Button variant="ghost" className="mt-2 h-8 px-0 text-b2" onClick={() => setMore((v) => !v)}>{more ? '접기' : `${items.length - 5}건 더 보기`}</Button>}
    </>
  )
}

/** The source (리뷰/인터뷰) is shown right away now — the behavior-variable chart that used to hide
 * it on this page was dropped entirely, since it revealed the source on its own either way. */
function Head({ id, label }: { id: string; label: 'X' | 'Y' }) {
  const p = personaById(id)
  const c = XY_COLOR[label]
  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-g200 px-5 py-4" style={{ borderTop: `3px solid ${c}` }}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-t1 text-white" style={{ background: c }}>{label}</span>
      <div className="min-w-0 flex-1">
        <p className="text-b3 text-g600">퍼소나 {label}의 근거 자료</p>
        <h3 className="text-h3">{p.type}</h3>
      </div>
      <span className={`rounded-s border px-2 text-b3 ${p.kind === 'data' ? 'border-[#ADC6FF] bg-[#F0F5FF] text-[#1D39C4]' : 'border-[#FFD591] bg-[#FFF7E6] text-[#D46B08]'}`}>{SOURCE_LABEL[p.kind]}</span>
    </header>
  )
}

/** Same unified track display used on the 행동 변수·그룹 page — data personas on their 8 variables,
 * qual personas on the 6 그룹핑 패턴 variables, no area-group headers either way. */
function TrackSection({ id }: { id: string }) {
  const p = personaById(id)
  if (p.kind === 'data') {
    return (
      <Sub title="행동 변수 위치" lead="이 그룹이 8개 행동 변수에서 차지하는 위치예요.">
        <TrackStack tracks={study.dataVars} ids={DATA_IDS} scale={4} paths={[id as DataPid]} label={(gid) => GNUM[gid]} />
      </Sub>
    )
  }
  const members = study.qualGroups[id as QualPid].members
  return (
    <Sub title="행동 변수 위치" lead="이 그룹에 속한 참여자들이 6개 행동 변수에서 차지하는 위치예요.">
      <TrackStack tracks={study.qualPattern} ids={UIDS} paths={members} focus={members} />
    </Sub>
  )
}

function TraitsSection({ id }: { id: string }) {
  const p = personaById(id)
  const g = p.kind === 'data' ? study.dataGroups[id as DataPid] : study.qualGroups[id as QualPid]
  return <Sub title="그룹 특성"><Traits traits={g.traits} summary={g.summary} /></Sub>
}

function EvidenceSection({ id, more, setMore }: { id: string; more: boolean; setMore: (fn: (v: boolean) => boolean) => void }) {
  const items = evidenceItems(id)
  return (
    <Sub title="원문 근거" lead={`총 ${items.length}건이에요.`}>
      <EvidenceList items={items} more={more} setMore={setMore} />
    </Sub>
  )
}

/** Stacked fallback for narrow screens. */
function EvidencePanel({ id, label }: { id: string; label: 'X' | 'Y' }) {
  const [more, setMore] = useState(false)
  return (
    <article className="min-w-0 rounded-xl border border-g200 bg-white">
      <Head id={id} label={label} />
      <TrackSection id={id} />
      <TraitsSection id={id} />
      <EvidenceSection id={id} more={more} setMore={setMore} />
    </article>
  )
}

/**
 * Side-by-side X/Y evidence. At xl+, every section (그룹 특성, 원문 근거) is one shared grid row so
 * the shorter side stretches to match — same technique as PersonaPair. Below xl it falls back to
 * two stacked panels.
 */
function EvidencePair({ xId, yId }: { xId: string; yId: string }) {
  const [moreX, setMoreX] = useState(false)
  const [moreY, setMoreY] = useState(false)
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-g200 bg-white xl:grid xl:grid-cols-2 xl:items-stretch xl:[&>*:nth-child(2n)]:border-l xl:[&>*:nth-child(2n)]:border-g200">
        <Head id={xId} label="X" />
        <Head id={yId} label="Y" />
        <TrackSection id={xId} />
        <TrackSection id={yId} />
        <TraitsSection id={xId} />
        <TraitsSection id={yId} />
        <EvidenceSection id={xId} more={moreX} setMore={setMoreX} />
        <EvidenceSection id={yId} more={moreY} setMore={setMoreY} />
      </div>
      <div className="grid gap-4 xl:hidden">
        <EvidencePanel id={xId} label="X" />
        <EvidencePanel id={yId} label="Y" />
      </div>
    </>
  )
}

export default function Evidence() {
  const { state, setEvidence, reveal } = useEval()
  const [sp, setSp] = useSearchParams()
  const rKey = (ROUNDS.some((r) => r.key === sp.get('r')) ? sp.get('r') : 'primary') as RoundKey
  const idx = ROUNDS.findIndex((r) => r.key === rKey)
  const round = ROUNDS[idx]
  const { X, Y } = xy(state, round)
  const ans = state.evidence[rKey] ?? {}
  const go = (k: RoundKey) => { setSp({ r: k }, { replace: true }); window.scrollTo(0, 0) }
  const nextRound = ROUNDS[idx + 1]
  const first = state.compare[rKey]?.c_pick
  const nRevealed = ROUNDS.filter((r) => state.revealed[r.key]).length

  // The source is shown directly on this page now, so there's no guess-then-reveal step to gate
  // behind — mark the pair as "확인함" as soon as it's viewed.
  useEffect(() => { if (!state.revealed[rKey]) reveal(rKey) }, [rKey, state.revealed, reveal])

  return (
    <div>
      <PageHead step={3} title="제작 데이터 확인">
        각 퍼소나를 만들 때 사용한 원문 근거예요. X는 온라인 사용자 리뷰, Y는 정성 인터뷰 기반이에요. 자료를 살펴본 뒤 질문에 답해 주세요.
      </PageHead>

      <RoundTabs value={rKey} onChange={go} done={(k) => state.revealed[k]} />

      <div className="mt-6">
        <EvidencePair key={rKey} xId={X} yId={Y} />
      </div>

      <section className="mt-8 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
        <h2 className="pt-4 text-t1">{round.label} 퍼소나 쌍에 대한 질문</h2>
        {first && <p className="mt-1 text-b3 text-g600">앞 단계에서는 <b className="font-semibold text-g900">{first}</b>{first.startsWith('퍼소나') ? '를 온라인 리뷰 기반이라고 답하셨어요.' : '이라고 답하셨어요.'}</p>}

        <div className="mt-2 border-t border-g200 pt-5">
          <h3 className="text-t1">데이터 출처</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {([['X', X], ['Y', Y]] as const).map(([l, id]) => {
              const kind = personaById(id).kind
              return (
                <div key={l} className="flex gap-3 rounded-xl border border-g200 bg-white p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-b1 font-semibold text-white" style={{ background: XY_COLOR[l] }}>{l}</span>
                  <div><p className="text-b1 font-semibold text-g900">{SOURCE_LABEL[kind]}</p><p className="mt-0.5 text-b2 text-g700">{SOURCE_DETAIL[kind]}</p></div>
                </div>
              )
            })}
          </div>
        </div>
        <FieldList fields={EVIDENCE_QS_AFTER} get={(id) => ans[id] ?? ''} set={(id, v) => setEvidence(rKey, id, v)} />
      </section>

      {nRevealed === ROUNDS.length && (
        <p className="mt-6 text-b2 text-g700">모든 쌍의 출처를 확인했어요. 왼쪽 메뉴의 <b className="font-semibold">참고 자료</b>에서 전체 리뷰, 인터뷰, 도출 과정을 볼 수 있어요. <Link to="/process" className="text-brand hover:text-brand-hover">도출 과정 보기</Link></p>
      )}

      {nextRound
        ? <StepNav prev={idx === 0 ? '/compare?r=secondary2' : undefined} nextLabel={`${nextRound.label} 퍼소나 쌍 보기`} onNext={() => go(nextRound.key)} hint={`출처 확인 ${nRevealed}/3`} />
        : <StepNav next="/rate" nextLabel="전문가 평가 시작하기" hint={`출처 확인 ${nRevealed}/3`} />}
    </div>
  )
}
