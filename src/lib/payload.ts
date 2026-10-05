import { personaById, study } from './data'
import { COMPARE_QS, DIMS, EVIDENCE_QS_AFTER, FINAL_QS, PROFILE, ROUNDS, type Field, type Round } from './protocol'
import { xy, type EvalState } from './evalStore'

export const SOURCE_LABEL = { data: '온라인 사용자 리뷰 기반', qual: '정성 인터뷰 기반' } as const
const SOURCE_SHORT = { data: '리뷰 기반', qual: '인터뷰 기반' } as const
export const SOURCE_DETAIL = {
  data: `메디큐브 공식몰·네이버쇼핑 구매 리뷰, 유튜브 댓글 ${study.stats.totalReviews.toLocaleString()}건을 분석해 만들었어요.`,
  qual: `실제 사용자 ${study.stats.interviews}명과의 심층 인터뷰를 분석해 만들었어요.`,
}
const SRC_KEY = { data: 'review', qual: 'interview' } as const

/** Persona ids in evaluation order: per round, X then Y. */
export function evalOrder(s: EvalState) {
  return ROUNDS.flatMap((r) => { const { X, Y } = xy(s, r); return [{ round: r, label: 'X' as const, id: X }, { round: r, label: 'Y' as const, id: Y }] })
}

/** Was the guess right? pick is the label the evaluator believes is review-based. */
function grade(s: EvalState, r: Round, pickedLabel: 'X' | 'Y' | null) {
  if (!pickedLabel) return '판단 어려움/무응답'
  const { X } = xy(s, r)
  const reviewLabel = X === r.data ? 'X' : 'Y'
  return pickedLabel === reviewLabel ? '맞음' : '틀림'
}

export function buildPayload(s: EvalState) {
  const answers: Record<string, string | number> = {}
  const labels: Record<string, string> = {}
  const put = (k: string, v: string | number | undefined, label: string) => { answers[k] = v ?? ''; labels[k] = label }
  const putFields = (prefix: string, fields: Field[], src: Record<string, string>, ctx: string) => {
    for (const f of fields) {
      put(`${prefix}.${f.id}`, src[f.id], `${ctx}${f.q}`)
      if (f.other) put(`${prefix}.${f.id}_other`, src[`${f.id}_other`], `${ctx}${f.q} (기타 내용)`)
    }
  }

  put('evaluator', s.evaluator, '평가자')
  put('submittedAt', new Date().toISOString(), '제출 시각(브라우저)')
  put('profile.consent', s.profile.consent, '녹음·기록 동의')
  PROFILE.forEach((sec) => putFields('profile', sec.fields, s.profile, ''))

  for (const r of ROUNDS) {
    const { X } = xy(s, r)
    const xIsData = X === r.data
    put(`assign.${r.key}`, xIsData ? 'X=리뷰 기반, Y=인터뷰 기반' : 'X=인터뷰 기반, Y=리뷰 기반', `[${r.label}] X/Y 배정`)
  }
  for (const r of ROUNDS) {
    const c = s.compare[r.key] ?? {}
    putFields(`compare.${r.key}`, COMPARE_QS, c, `[${r.label}] `)
    const p = c.c_pick === '퍼소나 X' ? 'X' : c.c_pick === '퍼소나 Y' ? 'Y' : null
    put(`compare.${r.key}.c_pick_result`, grade(s, r, p), `[${r.label}] 리뷰 기반 추측 정답 여부`)
  }
  for (const r of ROUNDS) {
    const e = s.evidence[r.key] ?? {}
    putFields(`evidence.${r.key}`, EVIDENCE_QS_AFTER, e, `[${r.label}] `)
  }

  const ratingRows: (string | number)[][] = []
  for (const { round, label, id } of evalOrder(s)) {
    const per = personaById(id)
    const src = SRC_KEY[per.kind]
    for (const d of DIMS) {
      for (const it of d.items) {
        const v = s.ratings[id]?.[it.id]
        put(`rating.${round.key}.${src}.${it.id}`, v, `[${round.label} · ${SOURCE_SHORT[per.kind]} · ${d.title}] ${it.id}. ${it.q}`)
        ratingRows.push([round.label, SOURCE_LABEL[per.kind], `퍼소나 ${label}`, per.type, `${d.no}. ${d.title}`, it.id, it.q, v ?? ''])
      }
      put(`note.${round.key}.${src}.${d.id}`, s.dimNotes[id]?.[d.id], `[${round.label} · ${SOURCE_SHORT[per.kind]}] ${d.title} 추가 질문 답변`)
    }
  }
  putFields('final', FINAL_QS, s.final, '')

  return {
    version: 2,
    evaluator: s.evaluator,
    keys: Object.keys(answers),
    answers,
    labels,
    ratingHeader: ['라운드', '데이터 출처', '표시 이름', '퍼소나 유형', '평가 영역', '문항', '문항 내용', '점수'],
    ratingRows,
  }
}
