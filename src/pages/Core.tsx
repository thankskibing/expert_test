import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DATA_IDS, PCOLOR, core, study, type DataPid } from '../lib/data'
import { Badge, Chip, Highlighted, PageHead } from '../components/ui'
import { PersonaSeg } from './Reviews'

export default function CorePage() {
  const [sp, setSp] = useSearchParams()
  const p = (DATA_IDS.includes(sp.get('p') as DataPid) ? sp.get('p') : 'A') as DataPid
  const [tag, setTag] = useState<string | null>(null)
  const list = core[p]
  const tags = [...new Set(list.flatMap((r) => r.tags))]
  const shown = tag ? list.filter((r) => r.tags.includes(tag)) : list

  return (
    <div>
      <PageHead title="핵심 리뷰">
        퍼소나 적합 리뷰 중에서 핵심 행동 변수가 가장 선명하게 드러나는 리뷰를 골랐어요. <mark className="ev">노란 표시</mark>는 판단 근거가 된 원문 구절이에요.
      </PageHead>

      <PersonaSeg value={p} onChange={(v) => { setTag(null); setSp({ p: v }, { replace: true }) }} count={(v) => core[v].length} />

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {[null, ...tags].map((t) => <Chip key={t ?? 'all'} on={tag === t} onClick={() => setTag(t)}>{t ?? '전체 행동 변수'}</Chip>)}
      </div>
      <p className="mt-4 text-b3 text-g600 tabular">후보 {study.stats.reclass[p].counts.D}건 중 {list.length}건 선정</p>

      <ul className="mt-6 space-y-3">
        {shown.map((r) => {
          return (
            <li key={r.idx} className="rounded-2xl border border-g200 bg-white p-5 sm:p-6">
              <div className="mb-3 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 flex items-center gap-1.5 text-cap text-g500 tabular"><span className="h-2 w-2 rounded-full" style={{ background: PCOLOR[p] }} />#{r.idx}</span>
                {r.pdf && <Badge tone="dark">기존 퍼소나 자료의 대표 인용</Badge>}
                {r.tags.map((t) => <Badge key={t}>{t}</Badge>)}
              </div>
              <div className="max-w-prose2"><Highlighted text={r.text} phrases={r.evidence} /></div>
              <p className="mt-3 text-b3 text-g600"><span className="font-semibold text-g800">선정 이유</span> {r.why}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
