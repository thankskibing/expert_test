import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { DATA_IDS, QUAL_IDS } from './data'

/** Answers are kept as flat string maps so every question (and its "기타" text) maps to one cell in the sheet. */
export type Answers = Record<string, string>

/** Per-review judgment used in STEP 4-4 (리뷰별 1~5점 + 동의 여부 + 이유), keyed by `${personaId}_${reviewIdx}`. */
export interface ReviewJudge { score?: number; agree?: string; reason?: string }

export interface EvalState {
  evaluator: string
  profile: Answers
  step1: Answers
  step2: Answers
  step3: Answers
  step4: Answers
  step4reclass: Answers
  reviewJudge: Record<string, ReviewJudge>
  step5pattern: Answers
  step5qual: Answers
  step6: Answers
  /** ratings[personaId][itemId] = 1..5 (STEP 7, reuses the existing DIMS rubric) */
  ratings: Record<string, Record<string, number>>
  /** dimNotes[personaId][dimId] = text */
  dimNotes: Record<string, Record<string, string>>
  step8: Answers
  submittedAt: string | null
}

const KEY = 'persona-eval-v3'
const ALL_PERSONAS = [...DATA_IDS, ...QUAL_IDS]
function fresh(): EvalState {
  return {
    evaluator: '', profile: {},
    step1: {}, step2: {}, step3: {}, step4: {}, step4reclass: {}, reviewJudge: {},
    step5pattern: {}, step5qual: {}, step6: {},
    ratings: {}, dimNotes: {},
    step8: {}, submittedAt: null,
  }
}
function read(): EvalState {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) { const f = fresh(); const s = JSON.parse(raw); return { ...f, ...s } }
  } catch { /* storage unavailable */ }
  return fresh()
}

interface Ctx {
  state: EvalState
  set: (fn: (s: EvalState) => EvalState) => void
  setEvaluator: (v: string) => void
  setProfile: (id: string, v: string) => void
  setStep1: (id: string, v: string) => void
  setStep2: (id: string, v: string) => void
  setStep3: (id: string, v: string) => void
  setStep4: (id: string, v: string) => void
  setStep4reclass: (id: string, v: string) => void
  setReviewJudge: (key: string, patch: Partial<ReviewJudge>) => void
  setStep5pattern: (id: string, v: string) => void
  setStep5qual: (id: string, v: string) => void
  setStep6: (id: string, v: string) => void
  setRating: (pid: string, item: string, v: number) => void
  setDimNote: (pid: string, dim: string, v: string) => void
  setStep8: (id: string, v: string) => void
  markSubmitted: () => void
  reset: () => void
}
const EvalCtx = createContext<Ctx | null>(null)

export function EvalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EvalState>(read)
  useEffect(() => {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* keep in memory */ }
  }, [state])
  const section = <K extends keyof EvalState>(key: K) => (id: string, v: string) =>
    setState((s) => ({ ...s, [key]: { ...(s[key] as Answers), [id]: v } }))
  const ctx: Ctx = {
    state,
    set: setState,
    setEvaluator: (v) => setState((s) => ({ ...s, evaluator: v })),
    setProfile: section('profile'),
    setStep1: section('step1'),
    setStep2: section('step2'),
    setStep3: section('step3'),
    setStep4: section('step4'),
    setStep4reclass: section('step4reclass'),
    setReviewJudge: (key, patch) => setState((s) => ({ ...s, reviewJudge: { ...s.reviewJudge, [key]: { ...s.reviewJudge[key], ...patch } } })),
    setStep5pattern: section('step5pattern'),
    setStep5qual: section('step5qual'),
    setStep6: section('step6'),
    setRating: (pid, item, v) => setState((s) => ({ ...s, ratings: { ...s.ratings, [pid]: { ...s.ratings[pid], [item]: v } } })),
    setDimNote: (pid, dim, v) => setState((s) => ({ ...s, dimNotes: { ...s.dimNotes, [pid]: { ...s.dimNotes[pid], [dim]: v } } })),
    setStep8: section('step8'),
    markSubmitted: () => setState((s) => ({ ...s, submittedAt: new Date().toISOString() })),
    reset: () => setState(fresh()),
  }
  return <EvalCtx.Provider value={ctx}>{children}</EvalCtx.Provider>
}

export function useEval() {
  const c = useContext(EvalCtx)
  if (!c) throw new Error('EvalProvider missing')
  return c
}

export const PERSONA_ORDER = ALL_PERSONAS
