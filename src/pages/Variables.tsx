import { useState } from 'react'
import { CATLABEL, DATA_IDS, PCOLOR, PNAME, QUAL_IDS, study, type DataPid, type QualPid, type Uid } from '../lib/data'
import TrackStack from '../components/TrackStack'
import { Badge, Chip, NextStep, PageHead, PersonaPill, Section, Segmented } from '../components/ui'

const GNUM: Record<string, string> = { A: '1', B: '2', C: '3' }
const UIDS: Uid[] = ['U1', 'U2', 'U3', 'U4', 'U5', 'U6']

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

function DataGroupCard({ p }: { p: DataPid }) {
  const g = study.dataGroups[p]
  return (
    <GroupCard tag={`${g.group} · ${g.role} · 1차 분류 ${g.count}건(${g.share})`} name={g.name} traits={g.traits} summary={g.summary}>
      <p className="mt-3 text-b3 text-g600">{g.flow}</p>
      <h4 className="mb-3 mt-6 text-b2 font-bold">기존 자료의 대표 인용과 재분류 결과</h4>
      <ul className="space-y-3">
        {g.quotes.map((q) => {
          const ok = q.status === 'D'
          return (
            <li key={q.idx} className="rounded-xl bg-white p-4">
              <p className="line-clamp-4 whitespace-pre-line text-b3 text-g700">{q.text}</p>
              <p className="mt-2 flex items-center gap-2"><span className="text-cap text-g500 tabular">#{q.idx}</span><Badge tone={ok ? 'green' : 'red'}>재분류: {q.status ? CATLABEL[q.status] : '-'}</Badge></p>
              {!ok && q.reason && <p className="mt-2 text-cap text-g600">{q.reason}</p>}
            </li>
          )
        })}
      </ul>
    </GroupCard>
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
        데이터 퍼소나는 리뷰에서, 정성 퍼소나는 인터뷰에서 각각 행동 변수를 세우고 그룹의 위치를 비교해 도출했어요. 그룹을 고르면 그 그룹이 변수들을 지나가는 선이 그려져요.
      </PageHead>

      <Section title="데이터 퍼소나: 행동 변수 8개와 그룹 1~3" lead="원자료는 리뷰 3,601건 중 키워드 규칙으로 분류된 2,333건(중복 포함)이에요. 점 안의 숫자는 그룹 번호예요.">
        <Segmented label="데이터 그룹" items={['A', 'B', 'C', 'all'] as (DataPid | 'all')[]} value={dp} onChange={setDp} render={(v) => v === 'all'
          ? <span className="py-1">전체 비교</span>
          : <span className="flex items-center gap-2 py-1"><span className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: PCOLOR[v] }}>{GNUM[v]}</span>{PNAME[v]}</span>} />
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_1fr]">
          <div className="rounded-3xl border border-g200 px-4 py-3 sm:px-6">
            <TrackStack tracks={study.dataVars} ids={DATA_IDS} scale={4} paths={dp === 'all' ? [] : [dp]} label={(id) => GNUM[id]} showArea />
          </div>
          {dp !== 'all' ? <DataGroupCard p={dp} /> : (
            <div className="space-y-3">
              {DATA_IDS.map((p) => <div key={p} className="rounded-2xl bg-g50 p-5"><PersonaPill id={p} /><p className="mt-2 text-b2 text-g800">{study.dataGroups[p].summary}</p></div>)}
            </div>
          )}
        </div>
      </Section>

      <Section title="정성 퍼소나: 인터뷰 참여자 6명의 위치" lead="원자료는 U1~U6 인터뷰예요. 점 안의 숫자는 참여자 번호예요. 기존 공통 변수 5개에 인터뷰에서 새로 나온 변수 4개를 더했어요.">
        <div className="flex flex-wrap gap-2">
          {QUAL_IDS.map((g) => (
            <Chip key={g} on={qg === g && qu === 'all'} onClick={() => { setQg(g); setQu('all') }}>
              {PNAME[g]} <span className="font-medium opacity-60">{study.qualGroups[g].members.join('·')}</span>
            </Chip>
          ))}
          <Chip on={qg === 'all' && qu === 'all'} onClick={() => { setQg('all'); setQu('all') }}>전체</Chip>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-b3 text-g600">참여자 한 명씩 보기</span>
          {UIDS.map((u) => (
            <button key={u} onClick={() => setQu(qu === u ? 'all' : u)} aria-pressed={qu === u}
              className="flex h-8 items-center rounded-full px-3 text-b3 font-semibold transition-colors duration-200"
              style={qu === u ? { background: PCOLOR[u], color: '#fff' } : { background: '#F2F4F6', color: '#4E5968' }}>
              {u}
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-3xl border border-g200 px-4 py-3 sm:px-6">
          <p className="mt-3 text-b3 font-semibold text-g600">기존 공통 행동 변수</p>
          <TrackStack tracks={study.qualCommon} ids={UIDS} paths={qPaths} focus={qFocus} />
          <p className="mt-6 text-b3 font-semibold text-g600">신규 도출 행동 변수</p>
          <TrackStack tracks={study.qualNew} ids={UIDS} paths={qPaths} focus={qFocus} />
        </div>
      </Section>

      <Section title="정성 퍼소나: 그룹핑에 쓴 행동 패턴 6개" lead="인터뷰 내용을 AI로 정리해 도출한 패턴이에요. 이 6개 변수에서 가까이 모이는 참여자끼리 그룹으로 묶었어요.">
        <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
          <div className="rounded-3xl border border-g200 px-4 py-3 sm:px-6">
            <TrackStack tracks={study.qualPattern} ids={UIDS} paths={qPaths} focus={qFocus} showArea />
          </div>
          {qg !== 'all' && (
            <GroupCard tag={`${study.qualGroups[qg].group} · ${study.qualGroups[qg].role} · ${study.qualGroups[qg].members.join(', ')}`} name={study.qualGroups[qg].name} traits={study.qualGroups[qg].traits} summary={study.qualGroups[qg].summary}>
              <p className="mt-4 text-b3 text-g600">참여자별 발화는 3단계 정성 인터뷰에서 볼 수 있어요.</p>
            </GroupCard>
          )}
        </div>
      </Section>
      <NextStep to="/personas" label="결과 퍼소나 보기" />
    </div>
  )
}
