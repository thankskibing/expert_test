import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DATA_IDS, PCOLOR, core, study, type DataPid } from '../lib/data'
import { useEval } from '../lib/evalStore'
import { Badge, Chip, Highlighted, NextStep, PageHead, TextField } from '../components/ui'
import { PersonaSeg } from './Reviews'

export default function CorePage() {
  const [sp, setSp] = useSearchParams()
  const p = (DATA_IDS.includes(sp.get('p') as DataPid) ? sp.get('p') : 'A') as DataPid
  const [tag, setTag] = useState<string | null>(null)
  const { state, setVerdict, setNote } = useEval()
  const list = core[p]
  const tags = [...new Set(list.flatMap((r) => r.tags))]
  const shown = tag ? list.filter((r) => r.tags.includes(tag)) : list
  const marked = list.filter((r) => state.reviews[`${p}-${r.idx}`]?.verdict).length

  return (
    <div>
      <PageHead step={2} title="핵심 리뷰">
        퍼소나 적합 리뷰 중에서 핵심 행동 변수가 가장 선명하게 드러나는 리뷰를 골랐어요. <mark className="ev">노란 표시</mark>는 판단 근거가 된 원문 구절이에요. 리뷰마다 이 퍼소나의 근거로 적합한지 표시해 주세요.
      </PageHead>

      <PersonaSeg value={p} onChange={(v) => { setTag(null); setSp({ p: v }, { replace: true }) }} count={(v) => core[v].length} />

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {[null, ...tags].map((t) => <Chip key={t ?? 'all'} on={tag === t} onClick={() => setTag(t)}>{t ?? '전체 행동 변수'}</Chip>)}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-g200" aria-hidden><div className="h-full rounded-full bg-brand" style={{ width: `${(marked / list.length) * 100}%` }} /></div>
        <p className="text-b3 text-g600 tabular">판정 {marked}/{list.length} · 후보 {study.stats.reclass[p].counts.D}건 중 선정</p>
      </div>

      <ul className="mt-6 space-y-3">
        {shown.map((r) => {
          const key = `${p}-${r.idx}`
          const ev = state.reviews[key]
          return (
            <li key={r.idx} className="rounded-2xl border border-g200 bg-white p-5 sm:p-6">
              <div className="mb-3 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 flex items-center gap-1.5 text-cap text-g500 tabular"><span className="h-2 w-2 rounded-full" style={{ background: PCOLOR[p] }} />#{r.idx}</span>
                {r.pdf && <Badge tone="dark">기존 퍼소나 자료의 대표 인용</Badge>}
                {r.tags.map((t) => <Badge key={t}>{t}</Badge>)}
              </div>
              <div className="max-w-prose2"><Highlighted text={r.text} phrases={r.evidence} /></div>
              <p className="mt-3 text-b3 text-g600"><span className="font-semibold text-g800">선정 이유</span> {r.why}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-g200 pt-4">
                <span className="mr-1 text-b3 font-semibold text-g800">이 퍼소나의 근거로</span>
                {(['fit', 'unfit'] as const).map((v) => {
                  const on = ev?.verdict === v
                  return (
                    <button key={v} onClick={() => setVerdict(key, v)} aria-pressed={on}
                      className={`h-8 rounded-[10px] px-3.5 text-b3 font-semibold transition-colors duration-200 ${on ? (v === 'fit' ? 'bg-[#E5F8EF] text-[#029359]' : 'bg-[#FFEBEE] text-danger') : 'bg-g100 text-g700 hover:bg-g200'}`}>
                      {v === 'fit' ? '적합해요' : '부적합해요'}
                    </button>
                  )
                })}
                {ev?.verdict && (
                  <div className="min-w-[12rem] flex-1"><TextField value={ev.note} onChange={(e) => setNote(key, e.target.value)} placeholder="의견(선택)" aria-label="리뷰 의견" className="!h-9 !rounded-[10px] !text-b3" /></div>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      <NextStep to="/interviews" label="정성 인터뷰 보기" />
    </div>
  )
}
