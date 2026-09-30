import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DATA_IDS, PCOLOR, PNAME, core, study, type DataPid } from '../lib/data'
import { useEval } from '../lib/evalStore'
import { Highlighted, NextStep, PageHead, Tabs } from '../components/ui'

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
        퍼소나별 적합 리뷰 중 핵심 행동 변수를 가장 선명하게 보여주는 리뷰입니다. <mark className="ev">노란 표시</mark>는 판단 근거가 된 원문 구절입니다. 리뷰마다 이 퍼소나의 근거로 적합한지 표시해 주세요.
      </PageHead>

      <Tabs items={DATA_IDS} value={p} onChange={(v) => { setTag(null); setSp({ p: v }, { replace: true }) }} render={(v) => (
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: PCOLOR[v] }} />
          <span><b>{v}</b> {PNAME[v]}</span>
          <span className="tabular-nums text-slate">{core[v].length}</span>
        </span>
      )} />

      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-sm text-slate">행동 변수</span>
        {[null, ...tags].map((t) => (
          <button key={t ?? 'all'} onClick={() => setTag(t)} aria-pressed={tag === t}
            className={`rounded-full border px-3 py-1 text-[0.85rem] ${tag === t ? 'border-ink bg-ink text-white' : 'border-rule bg-white hover:border-slate'}`}>
            {t ?? '전체'}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-slate">
        후보 {study.stats.reclass[p].counts.D}건 중 {list.length}건 선정 · 판정 표시 {marked}/{list.length}
      </p>

      <ul className="mt-6 space-y-4">
        {shown.map((r) => {
          const key = `${p}-${r.idx}`
          const ev = state.reviews[key]
          return (
            <li key={r.idx} className="rounded-xl border border-rule bg-white p-5" style={{ borderLeft: `4px solid ${PCOLOR[p]}` }}>
              <div className="mb-2 flex flex-wrap items-center gap-2 text-[0.8rem]">
                <span className="tabular-nums text-slate">#{r.idx}</span>
                {r.pdf && <span className="rounded bg-ink px-1.5 py-0.5 text-white">기존 퍼소나 자료의 대표 인용</span>}
                {r.tags.map((t) => <span key={t} className="rounded border border-rule px-1.5 py-0.5 text-slate">{t}</span>)}
              </div>
              <div className="max-w-prose2"><Highlighted text={r.text} phrases={r.evidence} /></div>
              <p className="mt-3 text-[0.9rem] text-slate"><b className="text-ink">선정 이유</b> {r.why}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-rule pt-3">
                <span className="text-[0.85rem] font-semibold">이 퍼소나의 근거로</span>
                {(['fit', 'unfit'] as const).map((v) => (
                  <button key={v} onClick={() => setVerdict(key, v)} aria-pressed={ev?.verdict === v}
                    className={`rounded-md border px-3 py-1 text-[0.85rem] ${ev?.verdict === v ? (v === 'fit' ? 'border-pc bg-pc text-white' : 'border-pa bg-pa text-white') : 'border-rule hover:border-slate'}`}>
                    {v === 'fit' ? '적합' : '부적합'}
                  </button>
                ))}
                {ev?.verdict && (
                  <input value={ev.note} onChange={(e) => setNote(key, e.target.value)} placeholder="의견 (선택)" aria-label="리뷰 의견"
                    className="min-w-[12rem] flex-1 rounded-md border border-rule px-2.5 py-1 text-[0.88rem] outline-none focus:border-ink" />
                )}
              </div>
            </li>
          )
        })}
      </ul>
      <NextStep to="/interviews" label="3 정성 인터뷰" />
    </div>
  )
}
