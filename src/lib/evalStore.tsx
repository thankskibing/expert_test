import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { ROUNDS, type RoundKey } from './protocol'

/** Answers are kept as flat string maps so every question (and its "기타" text) maps to one cell in the sheet. */
export type Answers = Record<string, string>

export interface EvalState {
  evaluator: string
  /** per round: true = 퍼소나 X is the online-review (data) persona. Randomised once per evaluator. */
  assignment: Record<RoundKey, boolean>
  profile: Answers
  compare: Record<RoundKey, Answers>
  evidence: Record<RoundKey, Answers>
  revealed: Record<RoundKey, boolean>
  /** ratings[personaId][itemId] = 1..5 */
  ratings: Record<string, Record<string, number>>
  /** dimNotes[personaId][dimId] = text */
  dimNotes: Record<string, Record<string, string>>
  final: Answers
  submittedAt: string | null
}

const KEY = 'persona-eval-v2'
const rk = <T,>(v: () => T) => Object.fromEntries(ROUNDS.map((r) => [r.key, v()])) as Record<RoundKey, T>
function fresh(): EvalState {
  return {
    evaluator: '', assignment: rk(() => Math.random() < 0.5), profile: {}, compare: rk(() => ({})), evidence: rk(() => ({})),
    revealed: rk(() => false), ratings: {}, dimNotes: {}, final: {}, submittedAt: null,
  }
}
function read(): EvalState {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) { const f = fresh(); const s = JSON.parse(raw); return { ...f, ...s, assignment: { ...f.assignment, ...s.assignment } } }
  } catch { /* storage unavailable */ }
  return fresh()
}

interface Ctx {
  state: EvalState
  set: (fn: (s: EvalState) => EvalState) => void
  setEvaluator: (v: string) => void
  setProfile: (id: string, v: string) => void
  setCompare: (r: RoundKey, id: string, v: string) => void
  setEvidence: (r: RoundKey, id: string, v: string) => void
  reveal: (r: RoundKey) => void
  setRating: (pid: string, item: string, v: number) => void
  setDimNote: (pid: string, dim: string, v: string) => void
  setFinal: (id: string, v: string) => void
  markSubmitted: () => void
  reset: () => void
}
const EvalCtx = createContext<Ctx | null>(null)

export function EvalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EvalState>(read)
  useEffect(() => {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* keep in memory */ }
  }, [state])
  const ctx: Ctx = {
    state,
    set: setState,
    setEvaluator: (v) => setState((s) => ({ ...s, evaluator: v })),
    setProfile: (id, v) => setState((s) => ({ ...s, profile: { ...s.profile, [id]: v } })),
    setCompare: (r, id, v) => setState((s) => ({ ...s, compare: { ...s.compare, [r]: { ...s.compare[r], [id]: v } } })),
    setEvidence: (r, id, v) => setState((s) => ({ ...s, evidence: { ...s.evidence, [r]: { ...s.evidence[r], [id]: v } } })),
    reveal: (r) => setState((s) => ({ ...s, revealed: { ...s.revealed, [r]: true } })),
    setRating: (pid, item, v) => setState((s) => ({ ...s, ratings: { ...s.ratings, [pid]: { ...s.ratings[pid], [item]: v } } })),
    setDimNote: (pid, dim, v) => setState((s) => ({ ...s, dimNotes: { ...s.dimNotes, [pid]: { ...s.dimNotes[pid], [dim]: v } } })),
    setFinal: (id, v) => setState((s) => ({ ...s, final: { ...s.final, [id]: v } })),
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

/** Which persona sits under label X / Y for a round. */
export function xy(state: EvalState, r: (typeof ROUNDS)[number]) {
  const xData = state.assignment[r.key]
  return { X: xData ? r.data : r.qual, Y: xData ? r.qual : r.data } as { X: string; Y: string }
}
export const allRevealed = (s: EvalState) => ROUNDS.every((r) => s.revealed[r.key])
