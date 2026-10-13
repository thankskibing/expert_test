import { useState } from 'react'
import { DATA_IDS, PCOLOR, PNAME, study, type DataPid } from '../lib/data'
import TrackStack from './TrackStack'
import { PersonaPill, Segmented } from './ui'

const GNUM: Record<string, string> = { A: '1', B: '2', C: '3' }

function GroupCard({ tag, name, traits, summary, children }: { tag: string; name: string; traits: string[]; summary: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-g50 p-6">
      <p className="text-cap text-g500">{tag}</p>
      <h3 className="mt-1 text-h3">{name}</h3>
      <ul className="mt-4 space-y-2">
        {traits.map((t) => <li key={t} className="flex gap-2 text-b2 text-g800"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-g500" />{t}</li>)}
      </ul>
      <p className="mt-4 rounded-xl bg-white px-4 py-3 text-b2 font-semibold text-g900">{summary}</p>
      {children}
    </div>
  )
}

export function DataGroupCard({ p }: { p: DataPid }) {
  const g = study.dataGroups[p]
  return (
    <GroupCard tag={`${g.group} · ${g.role} · 1차 분류 ${g.count}건(${g.share})`} name={g.name} traits={g.traits} summary={g.summary}>
      <p className="mt-3 text-b3 text-g600">{g.flow}</p>
    </GroupCard>
  )
}

/**
 * 데이터 퍼소나: 행동 변수 8개와 그룹 1~3 비교. 참고 자료의 "행동 변수·그룹" 페이지(Variables.tsx)와
 * 4단계(4-1)에서 동일하게 재사용한다 — 내용·동작을 그대로 공유하기 위한 컴포넌트.
 */
export function DataGroupVariablesCompare() {
  const [dp, setDp] = useState<DataPid | 'all'>('A')
  return (
    <>
      <Segmented label="데이터 그룹" items={['A', 'B', 'C', 'all'] as (DataPid | 'all')[]} value={dp} onChange={setDp} render={(v) => v === 'all'
        ? <span className="py-1">전체 비교</span>
        : <span className="flex items-center gap-2 py-1"><span className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: PCOLOR[v] }}>{GNUM[v]}</span>{PNAME[v]}</span>} />
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <div className="rounded-3xl border border-g200 px-4 py-3 sm:px-6">
          <TrackStack tracks={study.dataVars} ids={DATA_IDS} scale={4} paths={dp === 'all' ? [] : [dp]} label={(id) => GNUM[id]} />
        </div>
        {dp !== 'all' ? <DataGroupCard p={dp} /> : (
          <div className="space-y-3">
            {DATA_IDS.map((p) => <div key={p} className="rounded-2xl bg-g50 p-5"><PersonaPill id={p} /><p className="mt-2 text-b2 text-g800">{study.dataGroups[p].summary}</p></div>)}
          </div>
        )}
      </div>
    </>
  )
}
