import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CATS, DATA_IDS, PCOLOR, PNAME, PRANK, loadReviews, study, type Cat, type DataPid, type ReviewsData } from '../lib/data'
import { Button, Chip, PageHead, Segmented, TextField } from '../components/ui'

const PAGE = 40

export function PersonaSeg({ value, onChange, count }: { value: DataPid; onChange: (v: DataPid) => void; count: (p: DataPid) => number }) {
  return (
    <Segmented label="데이터 퍼소나" items={DATA_IDS} value={value} onChange={onChange} render={(v) => (
      <span className="flex items-center gap-2 py-1">
        <span className="h-2 w-2 rounded-full" style={{ background: PCOLOR[v] }} />
        <span>{PRANK[v]} · {PNAME[v]}</span>
        <span className="font-medium text-g500 tabular">{count(v)}</span>
      </span>
    )} />
  )
}

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
      <PageHead title="리뷰 데이터">
        키워드 규칙으로 퍼소나별로 1차 분류된 리뷰(A 824 · B 902 · C 607건, 중복 포함)를, 그 퍼소나의 핵심 행동 변수 기준으로 한 건씩 다시 판정했어요. 처음에는 퍼소나 적합 리뷰가 보이고, 다른 분류도 골라 볼 수 있어요.
      </PageHead>

      <PersonaSeg value={p} onChange={(v) => set('p', v)} count={(v) => study.stats.reclass[v].n} />

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="분류 필터">
        {CATS.filter((c) => counts[c.id]).map((c) => (
          <Chip key={c.id} on={cat === c.id} onClick={() => set('cat', c.id)} title={c.hint}>
            {c.label} <span className="font-medium opacity-60 tabular">{counts[c.id]}</span>
          </Chip>
        ))}
      </div>
      <p className="mt-3 text-b3 text-g600">{CATS.find((c) => c.id === cat)!.hint}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="w-full max-w-sm"><TextField value={q} onChange={(e) => setQ(e.target.value)} placeholder="원문에서 찾기 (예: 매일, 비교, 듀얼)" aria-label="원문 검색" /></div>
        <span className="text-b3 text-g600 tabular">{data ? `${list.length}건` : '불러오고 있어요'}</span>
      </div>

      <ul className="mt-6 divide-y divide-g200 border-t border-g200">
        {shown.map(([i, , why]) => (
          <li key={i} className="flex gap-4 py-5">
            <span className="w-12 shrink-0 pt-0.5 text-cap text-g500 tabular">#{i}</span>
            <div className="min-w-0 max-w-prose2">
              <p className="whitespace-pre-line text-b2 text-g800">{data!.texts[i]}</p>
              <details className="group mt-2">
                <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-b3 font-semibold text-g600 hover:text-g800">
                  판단 이유 <span className="transition-transform duration-200 group-open:rotate-180" aria-hidden>⌄</span>
                </summary>
                <p className="mt-2 rounded-m bg-g50 px-4 py-3 text-b3 text-g700">{why}</p>
              </details>
            </div>
          </li>
        ))}
        {data && !list.length && <li className="py-10 text-b2 text-g600">조건에 맞는 리뷰가 없어요. 검색어를 지우거나 다른 분류를 고르면 다시 보여요.</li>}
      </ul>

      {pages > 1 && (
        <div className="mt-6 flex items-center gap-3">
          <Button size="m" disabled={page === 0} onClick={() => setPage(page - 1)}>이전</Button>
          <span className="text-b3 text-g600 tabular">{page + 1} / {pages}</span>
          <Button size="m" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>다음</Button>
        </div>
      )}
    </div>
  )
}
