import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DATA_IDS, core, personaById, study, type DataPid, type QualPid, type Uid } from '../lib/data'
import { EVIDENCE_QS_AFTER, EVIDENCE_QS_BEFORE, ROUNDS, type RoundKey } from '../lib/protocol'
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
 * One flat list of short excerpts for either persona type, in the same card shape (index badge +
 * text, optionally with highlighted phrases). This is deliberate: a data persona's reviews and a
 * qual persona's interview quotes must look the same here, or the layout itself gives the source away.
 */
function evidenceItems(id: string): Item[] {
  const p = personaById(id)
  if (p.kind === 'data') return core[id as DataPid].map((r) => ({ key: `#${r.idx}`, text: r.text, evidence: r.evidence }))
  const qg = study.qualGroups[id as QualPid]
  const people = study.participants.filter((u) => qg.members.includes(u.id))
  let n = 0
  return people.flatMap((u) => u.quotes.map((q) => ({ key: `#${++n}`, text: q })))
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

function Head({ id, label, revealed }: { id: string; label: 'X' | 'Y'; revealed: boolean }) {
  const p = personaById(id)
  const c = XY_COLOR[label]
  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-g200 px-5 py-4" style={{ borderTop: `3px solid ${c}` }}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-t1 text-white" style={{ background: c }}>{label}</span>
      <div className="min-w-0 flex-1">
        <p className="text-b3 text-g600">퍼소나 {label}의 근거 자료</p>
        <h3 className="text-h3">{p.type}</h3>
      </div>
      {revealed && <span className={`rounded-s border px-2 text-b3 ${p.kind === 'data' ? 'border-[#ADC6FF] bg-[#F0F5FF] text-[#1D39C4]' : 'border-[#FFD591] bg-[#FFF7E6] text-[#D46B08]'}`}>{SOURCE_LABEL[p.kind]}</span>}
    </header>
  )
}

function TrackSection({ id }: { id: string }) {
  const p = personaById(id)
  const isData = p.kind === 'data'
  const qg = isData ? null : study.qualGroups[id as QualPid]
  return (
    <Sub title="행동 변수" lead="점 안의 숫자는 이 퍼소나와 연결된 번호예요. 선은 그 번호들이 각 변수에서 어디쯤 있는지 이어줘요.">
      {isData
        ? <TrackStack tracks={study.dataVars} ids={DATA_IDS} scale={4} paths={[id]} label={(g) => GNUM[g]} />
        : <TrackStack tracks={study.qualPattern} ids={UIDS} paths={qg!.members} focus={qg!.members} showArea />}
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
function EvidencePanel({ id, label, revealed }: { id: string; label: 'X' | 'Y'; revealed: boolean }) {
  const [more, setMore] = useState(false)
  return (
    <article className="min-w-0 rounded-xl border border-g200 bg-white">
      <Head id={id} label={label} revealed={revealed} />
      <TrackSection id={id} />
      <TraitsSection id={id} />
      <EvidenceSection id={id} more={more} setMore={setMore} />
    </article>
  )
}

/**
 * Side-by-side X/Y evidence. At xl+, every section (행동 변수, 그룹 특성, 원문 근거) is one shared
 * grid row so the shorter side stretches to match — same technique as PersonaPair. Below xl it falls
 * back to two stacked panels.
 */
function EvidencePair({ xId, yId, revealed }: { xId: string; yId: string; revealed: boolean }) {
  const [moreX, setMoreX] = useState(false)
  const [moreY, setMoreY] = useState(false)
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-g200 bg-white xl:grid xl:grid-cols-2 xl:items-stretch xl:[&>*:nth-child(2n)]:border-l xl:[&>*:nth-child(2n)]:border-g200">
        <Head id={xId} label="X" revealed={revealed} />
        <Head id={yId} label="Y" revealed={revealed} />
        <TrackSection id={xId} />
        <TrackSection id={yId} />
        <TraitsSection id={xId} />
        <TraitsSection id={yId} />
        <EvidenceSection id={xId} more={moreX} setMore={setMoreX} />
        <EvidenceSection id={yId} more={moreY} setMore={setMoreY} />
      </div>
      <div className="grid gap-4 xl:hidden">
        <EvidencePanel id={xId} label="X" revealed={revealed} />
        <EvidencePanel id={yId} label="Y" revealed={revealed} />
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
  const revealed = state.revealed[rKey]
  const go = (k: RoundKey) => { setSp({ r: k }, { replace: true }); window.scrollTo(0, 0) }
  const nextRound = ROUNDS[idx + 1]
  const first = state.compare[rKey]?.c_pick
  const nRevealed = ROUNDS.filter((r) => state.revealed[r.key]).length

  return (
    <div>
      <PageHead step={3} title="제작 데이터 확인">
        각 퍼소나를 만들 때 사용한 원문 근거와 행동 변수예요. 자료를 살펴본 뒤 질문에 답하시고, 마지막에 데이터 출처를 확인해 주세요.
      </PageHead>

      <RoundTabs value={rKey} onChange={go} done={(k) => state.revealed[k]} />

      <div className="mt-6">
        <EvidencePair key={rKey} xId={X} yId={Y} revealed={revealed} />
      </div>

      <section className="mt-8 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
        <h2 className="pt-4 text-t1">{round.label} 퍼소나 쌍에 대한 질문</h2>
        {first && <p className="mt-1 text-b3 text-g600">앞 단계에서는 <b className="font-semibold text-g900">{first}</b>{first.startsWith('퍼소나') ? '를 온라인 리뷰 기반이라고 답하셨어요.' : '이라고 답하셨어요.'}</p>}
        <fieldset disabled={revealed} className={revealed ? 'opacity-60' : ''}>
          <FieldList fields={EVIDENCE_QS_BEFORE} get={(id) => ans[id] ?? ''} set={(id, v) => !revealed && setEvidence(rKey, id, v)} />
        </fieldset>

        {!revealed ? (
          <div className="mb-4 mt-2 flex flex-wrap items-center gap-3 border-t border-g200 pt-5">
            <Button size="l" variant="primary" disabled={!ans.e_pick} onClick={() => reveal(rKey)}>데이터 출처 확인하기</Button>
            <p className="text-b3 text-g600">{ans.e_pick ? '확인하면 위 답변은 더 이상 고칠 수 없어요.' : 'Q2에 답하면 확인할 수 있어요.'}</p>
          </div>
        ) : (
          <>
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
          </>
        )}
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
