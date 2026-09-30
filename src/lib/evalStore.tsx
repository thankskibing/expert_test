import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export const CRITERIA = [
  { key: 'evidence', label: '근거 충분성', q: '원문 근거가 퍼소나 설명을 뒷받침하기에 충분한가' },
  { key: 'variables', label: '변수 타당성', q: '행동 변수가 사용자 간 차이를 잘 설명하는가' },
  { key: 'consistency', label: '서술 일치도', q: 'Pain point·Needs·Goal이 근거에서 나온 내용인가' },
  { key: 'distinct', label: '구분 명확성', q: '다른 퍼소나와 겹치지 않고 뚜렷하게 구분되는가' },
] as const
export type CriterionKey = (typeof CRITERIA)[number]['key']

export interface PersonaEval { scores: Partial<Record<CriterionKey, number>>; comment: string }
export interface ReviewEval { verdict: 'fit' | 'unfit' | null; note: string }
export interface EvalState {
  evaluator: string
  personas: Record<string, PersonaEval>
  reviews: Record<string, ReviewEval> // key: `${persona}-${idx}`
  overall: string
  submittedAt: string | null
}

const KEY = 'persona-eval-draft-v1'
const empty: EvalState = { evaluator: '', personas: {}, reviews: {}, overall: '', submittedAt: null }

function read(): EvalState {
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? { ...empty, ...JSON.parse(raw) } : empty
  } catch {
    return empty
  }
}

interface Ctx {
  state: EvalState
  setEvaluator: (v: string) => void
  setScore: (pid: string, k: CriterionKey, v: number) => void
  setComment: (pid: string, v: string) => void
  setVerdict: (key: string, v: ReviewEval['verdict']) => void
  setNote: (key: string, v: string) => void
  setOverall: (v: string) => void
  markSubmitted: () => void
}
const EvalCtx = createContext<Ctx | null>(null)

export function EvalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EvalState>(read)
  useEffect(() => {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* storage unavailable: keep in memory */ }
  }, [state])
  const pe = (s: EvalState, pid: string): PersonaEval => s.personas[pid] ?? { scores: {}, comment: '' }
  const re = (s: EvalState, k: string): ReviewEval => s.reviews[k] ?? { verdict: null, note: '' }
  const ctx: Ctx = {
    state,
    setEvaluator: (v) => setState((s) => ({ ...s, evaluator: v })),
    setScore: (pid, k, v) => setState((s) => ({ ...s, personas: { ...s.personas, [pid]: { ...pe(s, pid), scores: { ...pe(s, pid).scores, [k]: v } } } })),
    setComment: (pid, v) => setState((s) => ({ ...s, personas: { ...s.personas, [pid]: { ...pe(s, pid), comment: v } } })),
    setVerdict: (key, v) => setState((s) => ({ ...s, reviews: { ...s.reviews, [key]: { ...re(s, key), verdict: re(s, key).verdict === v ? null : v } } })),
    setNote: (key, v) => setState((s) => ({ ...s, reviews: { ...s.reviews, [key]: { ...re(s, key), note: v } } })),
    setOverall: (v) => setState((s) => ({ ...s, overall: v })),
    markSubmitted: () => setState((s) => ({ ...s, submittedAt: new Date().toISOString() })),
  }
  return <EvalCtx.Provider value={ctx}>{children}</EvalCtx.Provider>
}

export function useEval() {
  const c = useContext(EvalCtx)
  if (!c) throw new Error('EvalProvider missing')
  return c
}
