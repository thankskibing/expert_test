import { useState } from 'react'
import { CATLABEL, DATA_IDS, PCOLOR, PNAME, QUAL_IDS, study, type DataPid, type QualPid, type Uid } from '../lib/data'
import TrackStack from '../components/TrackStack'
import { NextStep, PageHead, PersonaPill, Section, Tabs } from '../components/ui'

const GNUM: Record<string, string> = { A: '1', B: '2', C: '3' }
const UIDS: Uid[] = ['U1', 'U2', 'U3', 'U4', 'U5', 'U6']

function DataGroupCard({ p }: { p: DataPid }) {
  const g = study.dataGroups[p]
  return (
    <div className="rounded-xl border border-rule bg-white p-5" style={{ borderTop: `4px solid ${PCOLOR[p]}` }}>
      <p className="text-[0.8rem] text-slate">{g.group} · {g.role} · 1차 분류 {g.count}건 ({g.share})</p>
      <h3 className="mt-1 font-serif text-[1.2rem] font-bold">{g.name}</h3>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-[0.92rem]">{g.traits.map((t) => <li key={t}>{t}</li>)}</ul>
      <p className="mt-3 text-[0.92rem] font-semibold">{g.summary}</p>
      <p className="mt-3 rounded-md bg-paper px-3 py-2 text-[0.88rem]">{g.flow}</p>
      <h4 className="mb-2 mt-5 text-sm font-semibold">기존 자료의 대표 인용과 재분류 결과</h4>
      <ul className="space-y-3">
        {g.quotes.map((q) => {
          const ok = q.status === 'D'
          return (
            <li key={q.idx} className="text-[0.9rem]">
              <p className="line-clamp-4 whitespace-pre-line text-slate">“{q.text}”</p>
              <p className="mt-1 text-[0.8rem]">
                <span className="tabular-nums text-slate">#{q.idx}</span>{' '}
                <span className={`rounded px-1.5 py-0.5 font-semibold ${ok ? 'bg-[#E6F4EC] text-pc' : 'bg-[#FDECEA] text-pa'}`}>재분류: {q.status ? CATLABEL[q.status] : '-'}</span>
              </p>
              {!ok && q.reason && <p className="mt-1 text-[0.82rem] text-slate">{q.reason}</p>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function Variables() {
  const [dp, setDp] = useState<DataPid | 'all'>('A')
  const [qg, setQg] = useState<QualPid | 'all'>('P')
  const [qu, setQu] = useState<Uid | 'all'>('all')
  const members = qg === 'all' ? null : study.qualGroups[qg].members
  const qPaths = qu !== 'all' ? [qu] : members ?? []
  const qFocus = qu !== 'all' ? [qu] : members

  return (
    <div>
      <PageHead step={4} title="행동 변수와 그룹">
        데이터 퍼소나는 리뷰에서, 정성 퍼소나는 인터뷰에서 각각 행동 변수를 세우고 그룹의 위치를 비교해 도출했습니다. 그룹을 고르면 그 그룹이 변수들을 지나가는 선이 그려집니다.
      </PageHead>

      <Section title="데이터 퍼소나: 행동 변수 8개와 그룹 1~3" lead="원자료: 리뷰 3,601건 중 키워드 규칙으로 분류된 2,333건(중복 포함). 점의 숫자는 그룹 번호입니다.">
        <Tabs items={['A', 'B', 'C', 'all'] as (DataPid | 'all')[]} value={dp} onChange={setDp} render={(v) => v === 'all'
          ? <span>전체 비교</span>
          : <span className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full text-[0.7rem] font-bold text-white" style={{ background: PCOLOR[v] }}>{GNUM[v]}</span>{PNAME[v]}</span>} />
        <div className="mt-6 grid gap-8 xl:grid-cols-[1.25fr_1fr]">
          <div className="rounded-xl border border-rule bg-white px-4 py-2 sm:px-6">
            <TrackStack tracks={study.dataVars} ids={DATA_IDS} scale={4} paths={dp === 'all' ? [] : [dp]} label={(id) => GNUM[id]} showArea />
          </div>
          {dp !== 'all' ? <DataGroupCard p={dp} /> : (
            <div className="space-y-2 text-[0.92rem] text-slate">
              {DATA_IDS.map((p) => <p key={p}><PersonaPill id={p} /> <span className="block pt-1">{study.dataGroups[p].summary}</span></p>)}
            </div>
          )}
        </div>
      </Section>

      <Section title="정성 퍼소나: 인터뷰 참여자 6명의 위치" lead="원자료: U1~U6 인터뷰. 점의 숫자는 참여자 번호입니다. 기존 공통 변수 5개에 인터뷰에서 새로 나온 변수 4개를 더했습니다.">
        <div className="flex flex-wrap gap-2">
          {QUAL_IDS.map((g) => (
            <button key={g} onClick={() => { setQg(g); setQu('all') }} aria-pressed={qg === g && qu === 'all'}
              className={`rounded-lg border px-3 py-1.5 text-sm ${qg === g && qu === 'all' ? 'border-ink bg-white' : 'border-rule text-slate hover:border-slate'}`}>
              {PNAME[g]} <span className="text-slate">({study.qualGroups[g].members.join('·')})</span>
            </button>
          ))}
          <button onClick={() => { setQg('all'); setQu('all') }} aria-pressed={qg === 'all' && qu === 'all'} className={`rounded-lg border px-3 py-1.5 text-sm ${qg === 'all' && qu === 'all' ? 'border-ink bg-white' : 'border-rule text-slate'}`}>전체</button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {UIDS.map((u) => (
            <button key={u} onClick={() => setQu(qu === u ? 'all' : u)} aria-pressed={qu === u}
              className="flex h-7 items-center gap-1 rounded-full border px-2.5 text-[0.8rem]" style={qu === u ? { background: PCOLOR[u], color: '#fff', borderColor: PCOLOR[u] } : { borderColor: '#DCE0E7' }}>
              {u}
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-rule bg-white px-4 py-2 sm:px-6">
          <p className="mt-4 text-[0.8rem] font-semibold text-slate">기존 공통 행동 변수</p>
          <TrackStack tracks={study.qualCommon} ids={UIDS} paths={qPaths} focus={qFocus} />
          <p className="mt-6 text-[0.8rem] font-semibold text-slate">신규 도출 행동 변수</p>
          <TrackStack tracks={study.qualNew} ids={UIDS} paths={qPaths} focus={qFocus} />
        </div>
      </Section>

      <Section title="정성 퍼소나: 그룹핑에 쓴 행동 패턴 6개" lead="인터뷰 내용을 AI로 정리해 도출한 패턴입니다. 이 6개 변수에서 가까이 모이는 참여자끼리 그룹을 묶었습니다.">
        <div className="grid gap-8 xl:grid-cols-[1.25fr_1fr]">
          <div className="rounded-xl border border-rule bg-white px-4 py-2 sm:px-6">
            <TrackStack tracks={study.qualPattern} ids={UIDS} paths={qPaths} focus={qFocus} showArea />
          </div>
          {qg !== 'all' && (
            <div className="rounded-xl border bg-white p-5" style={{ borderColor: PCOLOR[qg], borderWidth: 1.5 }}>
              <p className="text-[0.8rem] text-slate">{study.qualGroups[qg].group} · {study.qualGroups[qg].role} · {study.qualGroups[qg].members.join(', ')}</p>
              <h3 className="mt-1 font-serif text-[1.2rem] font-bold">{study.qualGroups[qg].name}</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-[0.92rem]">{study.qualGroups[qg].traits.map((t) => <li key={t}>{t}</li>)}</ul>
              <p className="mt-3 text-[0.92rem] font-semibold">{study.qualGroups[qg].summary}</p>
              <p className="mt-4 text-[0.85rem] text-slate">참여자별 발화는 3단계 정성 인터뷰에서 볼 수 있습니다.</p>
            </div>
          )}
        </div>
      </Section>
      <NextStep to="/personas" label="5 결과 퍼소나" />
    </div>
  )
}
