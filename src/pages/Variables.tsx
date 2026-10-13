import { useState } from 'react'
import { PCOLOR, PNAME, QUAL_IDS, study, type QualPid, type Uid } from '../lib/data'
import { DataGroupVariablesCompare } from '../components/GroupVariables'
import TrackStack from '../components/TrackStack'
import { Chip, PageHead, PersonaPill, Section } from '../components/ui'

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

const UIDS: Uid[] = ['U1', 'U2', 'U3', 'U4', 'U5', 'U6']

export default function Variables() {
  const [qg, setQg] = useState<QualPid | 'all'>('P')
  const [qu, setQu] = useState<Uid | 'all'>('all')
  const members = qg === 'all' ? null : study.qualGroups[qg].members
  const qPaths = qu !== 'all' ? [qu] : members ?? []
  const qFocus = qu !== 'all' ? [qu] : members

  return (
    <div>
      <PageHead title="행동 변수와 그룹">
        데이터 퍼소나는 리뷰에서, 정성 퍼소나는 인터뷰에서 각각 행동 변수를 세우고 그룹의 위치를 비교해 도출했어요. 그룹을 고르면 그 그룹이 변수들을 지나가는 선이 그려져요.
      </PageHead>

      <Section title="데이터 퍼소나: 행동 변수 8개와 그룹 1~3" lead="원자료는 리뷰 3,601건 중 키워드 규칙으로 분류된 2,333건(중복 포함)이에요. 점 안의 숫자는 그룹 번호예요.">
        <DataGroupVariablesCompare />
      </Section>

      <Section title="정성 퍼소나: 행동 변수 6개와 그룹 P/S1/S2" lead="원자료는 U1~U6 인터뷰예요. 점 안의 숫자는 참여자 번호예요. 인터뷰 내용을 AI로 정리해 도출한 이 6개 행동 변수에서 가까이 모이는 참여자끼리 그룹으로 묶었어요.">
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
              className="flex h-6 items-center rounded-s border px-2 text-b3 transition-colors duration-200"
              style={qu === u ? { background: PCOLOR[u], borderColor: PCOLOR[u], color: '#fff' } : { background: '#FAFAFA', borderColor: '#D9D9D9', color: '#1F1F1F' }}>
              {u}
            </button>
          ))}
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_1fr]">
          <div className="rounded-3xl border border-g200 px-4 py-3 sm:px-6">
            <TrackStack tracks={study.qualPattern} ids={UIDS} paths={qPaths} focus={qFocus} />
          </div>
          {qg !== 'all' ? (
            <GroupCard tag={`${study.qualGroups[qg].group} · ${study.qualGroups[qg].role} · ${study.qualGroups[qg].members.join(', ')}`} name={study.qualGroups[qg].name} traits={study.qualGroups[qg].traits} summary={study.qualGroups[qg].summary}>
              <p className="mt-4 text-b3 text-g600">참여자별 발화는 정성 인터뷰 페이지에서 볼 수 있어요.</p>
            </GroupCard>
          ) : (
            <div className="space-y-3">
              {QUAL_IDS.map((p) => <div key={p} className="rounded-2xl bg-g50 p-5"><PersonaPill id={p} /><p className="mt-2 text-b2 text-g800">{study.qualGroups[p].summary}</p></div>)}
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}
