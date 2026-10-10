import { DATA_IDS, PNAME, PSHORT, QUAL_IDS, core, personaById, study } from './data'
import { DIMS, PROFILE, REVIEW_AGREE_OPTIONS, STEP1_QS, STEP2_QS, STEP3_QS, STEP4_PROCESS_QS, STEP5_PATTERN_QS, STEP5_QUAL_QS, STEP6_QS, STEP8_CHECKLIST, STEP8_QS, type Field } from './protocol'
import { PERSONA_ORDER, type EvalState } from './evalStore'

export const SOURCE_LABEL = { data: '온라인 사용자 리뷰 기반', qual: '정성 인터뷰 기반' } as const
const SOURCE_SHORT = { data: '리뷰 기반', qual: '인터뷰 기반' } as const
export const SOURCE_DETAIL = {
  data: `메디큐브 공식몰·네이버쇼핑 구매 리뷰, 유튜브 댓글 ${study.stats.totalReviews.toLocaleString()}건을 분석해 만들었어요.`,
  qual: `실제 사용자 ${study.stats.interviews}명과의 심층 인터뷰를 분석해 만들었어요.`,
}

/** Review ids sampled for STEP 4-4 per data persona (first ~10 of the curated 핵심 리뷰 list). */
export function sampleReviewIdx(pid: (typeof DATA_IDS)[number], n = 10) {
  return core[pid].slice(0, n).map((r) => r.idx)
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

  putFields('step1', STEP1_QS, s.step1, '[1. 연구 개요] ')
  putFields('step2', STEP2_QS, s.step2, '[2. 수집·전처리] ')
  putFields('step3', STEP3_QS, s.step3, '[3. 토픽·집단 구성] ')
  putFields('step4', STEP4_PROCESS_QS, s.step4, '[4-1. AI 분석 과정] ')
  putFields('step5pattern', STEP5_PATTERN_QS, s.step5pattern, '[5-1. 발화→분석→재구성] ')
  putFields('step5qual', STEP5_QUAL_QS, s.step5qual, '[5-2. 정성 퍼소나 검증] ')
  putFields('step6', STEP6_QS, s.step6, '[6. 리뷰-인터뷰 퍼소나 비교] ')
  putFields('step8', STEP8_QS, s.step8, '[8. 종합 평가] ')
  putFields('step8', STEP8_CHECKLIST, s.step8, '[8. 종합 평가] ')

  const reviewRows: (string | number)[][] = []
  for (const pid of DATA_IDS) {
    for (const r of core[pid]) {
      const key = `${pid}_${r.idx}`
      const j = s.reviewJudge[key]
      if (!j || (j.score === undefined && !j.agree && !j.reason)) continue
      put(`review.${key}.score`, j.score, `[4-3 · ${PSHORT[pid]} · 리뷰 #${r.idx}] 행동을 얼마나 잘 보여주는지(1~5)`)
      put(`review.${key}.agree`, j.agree, `[4-3 · ${PSHORT[pid]} · 리뷰 #${r.idx}] 연구자 분류에 대한 동의 여부`)
      put(`review.${key}.reason`, j.reason, `[4-3 · ${PSHORT[pid]} · 리뷰 #${r.idx}] 이유`)
      reviewRows.push([PSHORT[pid], r.idx, j.score ?? '', j.agree ?? '', j.reason ?? ''])
    }
  }

  const interviewRows: (string | number)[][] = []
  for (const pid of QUAL_IDS) {
    for (const uid of study.qualGroups[pid].members) {
      const key = `${pid}_${uid}`
      const j = s.interviewJudge[key]
      if (!j || (j.score === undefined && !j.agree && !j.reason)) continue
      put(`interview.${key}.score`, j.score, `[5-3 · ${PSHORT[pid]} · ${uid}] 행동을 얼마나 잘 보여주는지(1~5)`)
      put(`interview.${key}.agree`, j.agree, `[5-3 · ${PSHORT[pid]} · ${uid}] 연구자 그룹 분류에 대한 동의 여부`)
      put(`interview.${key}.reason`, j.reason, `[5-3 · ${PSHORT[pid]} · ${uid}] 이유`)
      interviewRows.push([PSHORT[pid], uid, j.score ?? '', j.agree ?? '', j.reason ?? ''])
    }
  }

  const ratingRows: (string | number)[][] = []
  for (const id of PERSONA_ORDER) {
    const per = personaById(id)
    for (const d of DIMS) {
      for (const it of d.items) {
        const v = s.ratings[id]?.[it.id]
        put(`rating.${id}.${it.id}`, v, `[7. 최종 평가 · ${PSHORT[id]}(${SOURCE_SHORT[per.kind]}) · ${d.title}] ${it.id}. ${it.q}`)
        ratingRows.push([PSHORT[id], SOURCE_LABEL[per.kind], PNAME[id], per.type, `${d.no}. ${d.title}`, it.id, it.q, v ?? ''])
      }
      put(`note.${id}.${d.id}_1`, s.dimNotes[id]?.[`${d.id}_1`], `[7 · ${PSHORT[id]}] ${d.title} 추가 질문 1 답변`)
      put(`note.${id}.${d.id}_2`, s.dimNotes[id]?.[`${d.id}_2`], `[7 · ${PSHORT[id]}] ${d.title} 추가 질문 2 답변`)
    }
  }

  return {
    version: 3,
    evaluator: s.evaluator,
    keys: Object.keys(answers),
    answers,
    labels,
    ratingHeader: ['표시 이름', '데이터 출처', '퍼소나 유형명', '퍼소나 역할', '평가 영역', '문항', '문항 내용', '점수'],
    ratingRows,
    reviewHeader: ['퍼소나', '리뷰 번호', '점수(1~5)', '동의 여부', '이유'],
    reviewRows,
    interviewHeader: ['퍼소나', '참여자', '점수(1~5)', '동의 여부', '이유'],
    interviewRows,
  }
}

export { REVIEW_AGREE_OPTIONS, QUAL_IDS }
