import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CATS, DATA_IDS, PCOLOR, PNAME, loadReviews, study, type Cat, type DataPid, type ReviewsData } from '../lib/data'
import { NextStep, PageHead, Tabs } from '../components/ui'

const PAGE = 40

export default function Reviews() {
  const [sp, setSp] = useSearchParams()
  const p = (DATA_IDS.includes(sp.get('p') as DataPid) ? sp.get('p') : 'A') as DataPid
  const cat = (CATS.some((c) => c.id === sp.get('cat')) ? sp.get('cat') : 'D') as Cat
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [data, setData] = useState<ReviewsData | null>(null)
  useEffect(() => { loadReviews().then(setData) }, [])
  useEffect(() => setPage(0), [p, cat, q])

  const set = (k: string, v: string) => { const n = new URLSearchParams(sp); n.set(k, v); setSp(n, { replace: true }) }
  const counts = study.stats.reclass[p].counts
  const list = useMemo(() => {
    if (!data) return []
    const needle = q.trim()
    return data.personas[p].filter(([i, c]) => c === cat && (!needle || data.texts[i].includes(needle)))
  }, [data, p, cat, q])
  const shown = list.slice(page * PAGE, page * PAGE + PAGE)
  const pages = Math.ceil(list.length / PAGE)

  return (
    <div>
      <PageHead step={1} title="리뷰 데이터">
        키워드 규칙으로 각 퍼소나에 1차 분류된 리뷰(A 824 · B 902 · C 607건, 중복 포함)를 그 퍼소나의 핵심 행동 변수 기준으로 한 건씩 다시 판정했습니다. 기본 화면은 <b className="text-ink">퍼소나 적합</b> 리뷰 전체이며, 나머지 분류도 볼 수 있습니다.
      </PageHead>

      <Tabs items={DATA_IDS} value={p} onChange={(v) => set('p', v)} render={(v) => (
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: PCOLOR[v] }} />
          <span><b>{v}</b> {PNAME[v]}</span>
          <span className="text-slate tabular-nums">{study.stats.reclass[v].n}</span>
        </span>
      )} />

      <div className="mt-5 flex flex-wrap gap-1.5" role="group" aria-label="분류 필터">
        {CATS.filter((c) => counts[c.id]).map((c) => (
          <button key={c.id} onClick={() => set('cat', c.id)} title={c.hint} aria-pressed={cat === c.id}
            className={`rounded-full border px-3 py-1 text-[0.85rem] ${cat === c.id ? 'border-ink bg-ink text-white' : 'border-rule bg-white hover:border-slate'}`}>
            {c.label} <span className="tabular-nums opacity-70">{counts[c.id]}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-[0.85rem] text-slate">{CATS.find((c) => c.id === cat)!.hint}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="원문 검색 (예: 매일, 비교, 듀얼)" aria-label="원문 검색"
          className="w-full max-w-sm rounded-md border border-rule bg-white px-3 py-2 outline-none focus:border-ink" />
        <span className="text-sm text-slate">{data ? `${list.length}건` : '불러오는 중…'}</span>
      </div>

      <ul className="mt-5 divide-y divide-rule border-y border-rule">
        {shown.map(([i, , why]) => (
          <li key={i} className="py-4">
            <div className="flex gap-3">
              <span className="w-12 shrink-0 pt-0.5 text-[0.78rem] tabular-nums text-slate">#{i}</span>
              <div className="min-w-0 max-w-prose2">
                <p className="whitespace-pre-line">{data!.texts[i]}</p>
                <details className="mt-1.5 text-[0.88rem]">
                  <summary className="cursor-pointer text-slate hover:text-ink">판단 이유</summary>
                  <p className="mt-1 text-slate">{why}</p>
                </details>
              </div>
            </div>
          </li>
        ))}
        {data && !list.length && <li className="py-8 text-slate">조건에 맞는 리뷰가 없습니다. 검색어를 지우거나 다른 분류를 선택해 보세요.</li>}
      </ul>

      {pages > 1 && (
        <div className="mt-5 flex items-center gap-3 text-sm">
          <button disabled={page === 0} onClick={() => setPage(page - 1)} className="rounded-md border border-rule bg-white px-3 py-1.5 disabled:opacity-40">이전</button>
          <span className="tabular-nums text-slate">{page + 1} / {pages}</span>
          <button disabled={page >= pages - 1} onClick={() => setPage(page + 1)} className="rounded-md border border-rule bg-white px-3 py-1.5 disabled:opacity-40">다음</button>
        </div>
      )}
      <NextStep to="/core" label="2 핵심 리뷰" />
    </div>
  )
}
