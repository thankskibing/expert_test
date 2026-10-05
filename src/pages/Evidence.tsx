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

function Sub({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-g200 py-5">
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

/** Raw evidence for one persona, written so that nothing names the data source. */
function EvidencePanel({ id, label, revealed }: { id: string; label: 'X' | 'Y'; revealed: boolean }) {
  const p = personaById(id)
  const c = XY_COLOR[label]
  const [more, setMore] = useState(false)
  const isData = p.kind === 'data'
  const reviews = isData ? core[id as DataPid] : []
  const qg = isData ? null : study.qualGroups[id as QualPid]
  const people = qg ? study.participants.filter((u) => qg.members.includes(u.id)) : []
  const shownReviews = more ? reviews : reviews.slice(0, 5)

  return (
    <article className="min-w-0 rounded-xl border border-g200 bg-white">
      <header className="flex flex-wrap items-center gap-3 border-b border-g200 px-5 py-4" style={{ borderTop: `3px solid ${c}`, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
        <span className="flex h-9 w-9 items-center justify-center rounded-full text-t1 text-white" style={{ background: c }}>{label}</span>
        <div className="min-w-0 flex-1">
          <p className="text-b3 text-g600">퍼소나 {label}의 근거 자료</p>
          <h3 className="text-h3">{p.type}</h3>
        </div>
        {revealed && <span className={`rounded-s border px-2 text-b3 ${isData ? 'border-[#ADC6FF] bg-[#F0F5FF] text-[#1D39C4]' : 'border-[#FFD591] bg-[#FFF7E6] text-[#D46B08]'}`}>{SOURCE_LABEL[p.kind]}</span>}
      </header>
      <div className="px-5 pb-3">
        <Sub title="행동 변수" lead={isData ? '점 안의 숫자는 사용자 그룹 번호예요. 선은 이 퍼소나의 그룹이 지나는 위치예요.' : '점 안의 숫자는 참여자 번호예요. 선은 이 퍼소나에 묶인 참여자들이에요.'}>
          {isData
            ? <TrackStack tracks={study.dataVars} ids={DATA_IDS} scale={4} paths={[id]} label={(g) => GNUM[g]} />
            : <TrackStack tracks={study.qualPattern} ids={UIDS} paths={qg!.members} focus={qg!.members} showArea />}
        </Sub>
        <Sub title="그룹 특성">
          {isData ? <Traits traits={study.dataGroups[id as DataPid].traits} summary={study.dataGroups[id as DataPid].summary} /> : <Traits traits={qg!.traits} summary={qg!.summary} />}
        </Sub>
        <Sub title="원문 근거" lead={isData ? `노란 표시는 판단 근거가 된 원문 구절이에요. 총 ${reviews.length}건` : `이 그룹에 속한 참여자 ${people.length}명의 원문 발화와 불편 사항이에요.`}>
          {isData ? (
            <>
              <ul className="space-y-3">
                {shownReviews.map((r) => (
                  <li key={r.idx} className="rounded-xl border border-g200 p-4">
                    <Highlighted text={r.text} phrases={r.evidence} />
                    <p className="mt-2 flex flex-wrap gap-1.5">{r.tags.map((t) => <span key={t} className="rounded-s border border-g300 bg-g50 px-[7px] text-b3 text-g700">{t}</span>)}</p>
                  </li>
                ))}
              </ul>
              {reviews.length > 5 && <Button variant="ghost" className="mt-2 h-8 px-0 text-b2" onClick={() => setMore((v) => !v)}>{more ? '접기' : `${reviews.length - 5}건 더 보기`}</Button>}
            </>
          ) : (
            <ul className="space-y-3">
              {people.map((u) => (
                <li key={u.id} className="rounded-xl border border-g200 p-4">
                  <p className="text-b2 font-semibold text-g900">참여자 {u.id.replace('U', '')} · {u.title}</p>
                  <ul className="mt-2 space-y-2">
                    {u.quotes.slice(0, more ? undefined : 3).map((q) => <li key={q} className="border-l-2 border-g300 pl-3 text-b2 text-g900">“{q}”</li>)}
                  </ul>
                  {more && u.pains.length > 0 && (
                    <div className="mt-3">
                      <p className="text-b3 font-semibold text-g700">불편 사항</p>
                      <ul className="mt-1 space-y-1">{u.pains.map((x) => <li key={x.title} className="text-b2 text-g900"><b className="font-semibold">{x.title}</b> <span className="text-g700">{x.detail}</span></li>)}</ul>
                    </div>
                  )}
                </li>
              ))}
              <Button variant="ghost" className="h-8 px-0 text-b2" onClick={() => setMore((v) => !v)}>{more ? '접기' : '발화와 불편 사항 더 보기'}</Button>
            </ul>
          )}
        </Sub>
      </div>
    </article>
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

      <div className="mt-6 grid items-start gap-4 xl:grid-cols-2">
        <EvidencePanel key={`${rKey}-X`} id={X} label="X" revealed={revealed} />
        <EvidencePanel key={`${rKey}-Y`} id={Y} label="Y" revealed={revealed} />
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
