import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ROUNDS, type RoundKey } from '../lib/protocol'

/** Pair selector used by 비교·데이터 확인 steps (Ant Design underline tabs). */
export function RoundTabs({ value, onChange, done }: { value: RoundKey; onChange: (r: RoundKey) => void; done: (r: RoundKey) => boolean }) {
  return (
    <div role="tablist" aria-label="퍼소나 쌍" className="flex flex-wrap gap-x-8 border-b border-g200">
      {ROUNDS.map((r, i) => {
        const on = r.key === value
        return (
          <button key={r.key} role="tab" aria-selected={on} onClick={() => onChange(r.key)}
            className={`-mb-px flex items-center gap-2 border-b-2 py-3 text-b2 transition-colors duration-200 ${on ? 'border-brand text-brand' : 'border-transparent text-g700 hover:text-brand-hover'}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-b3 ${done(r.key) ? 'bg-success text-white' : on ? 'bg-brand text-white' : 'bg-g200 text-g700'}`}>{done(r.key) ? '✓' : i + 1}</span>
            {r.label} 퍼소나 쌍
          </button>
        )
      })}
    </div>
  )
}

/** Footer with previous/next. Exactly one primary action per page. */
export function StepNav({ prev, next, nextLabel, onNext, hint }: { prev?: string; next?: string; nextLabel: string; onNext?: () => void; hint?: ReactNode }) {
  return (
    <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-g200 pt-6">
      <div className="flex items-center gap-3">
        {prev && <Link to={prev} className="inline-flex h-10 items-center rounded-l border border-g300 bg-white px-[15px] text-b1 text-g900 hover:border-brand-hover hover:text-brand-hover">이전</Link>}
        {hint && <p className="text-b2 text-g600">{hint}</p>}
      </div>
      {onNext ? (
        <button onClick={onNext} className="inline-flex h-10 items-center rounded-l bg-brand px-[15px] text-b1 text-white shadow-[0_2px_0_rgba(5,145,255,0.1)] hover:bg-brand-hover">{nextLabel}</button>
      ) : next ? (
        <Link to={next} className="inline-flex h-10 items-center rounded-l bg-brand px-[15px] text-b1 text-white shadow-[0_2px_0_rgba(5,145,255,0.1)] hover:bg-brand-hover">{nextLabel}</Link>
      ) : null}
    </div>
  )
}
