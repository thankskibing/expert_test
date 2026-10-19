import { ITEM_COUNT, STEP8_QS } from './protocol'

/**
 * 진행 단계의 단일 기준. 메뉴, 시작 화면의 진행 순서, 각 페이지 머리말, 하단 이동 버튼이 모두 이 목록을 써서
 * 번호가 화면마다 어긋나지 않게 해요. URL 번호와 단계 번호도 같아요(/step6 = 6단계).
 */
export interface StepInfo { to: string; no: number; short: string; title: string; desc: string }

const STEP8_LIKERT = STEP8_QS.filter((f) => f.type === 'scale').length

export const STEPS: StepInfo[] = [
  { to: '/profile', no: 0, short: '사전 질문', title: '사전 질문: 실무 배경과 AI 활용 경험', desc: '실무 배경과 생성형 AI 활용 경험을 간단히 여쭤봐요.' },
  { to: '/step1', no: 1, short: '연구 개요·전체 프로세스', title: '연구 개요 및 전체 분석 프로세스', desc: '리뷰 트랙과 인터뷰 트랙이 AI를 서로 다른 순서로 쓴다는 점을 포함해 전체 흐름을 살펴봐요.' },
  { to: '/step2', no: 2, short: '수집·전처리 검증', title: '온라인 리뷰 데이터 수집·전처리 검증', desc: '어떤 기준으로 리뷰를 모으고 다듬었는지 확인해요.' },
  { to: '/step3', no: 3, short: '토픽 모델링 검증', title: '토픽 모델링 검증', desc: '리뷰 3,601건에서 찾은 LDA 토픽 4개가 리뷰 내용을 잘 설명하는지 확인해요.' },
  { to: '/step4', no: 4, short: '리뷰 기반 분석·퍼소나 검증', title: '리뷰 기반 AI 분석 및 퍼소나 근거 검증', desc: 'AI가 구성한 행동 유형 3개와 키워드 1차 분류·재분류 결과를 보고, 리뷰 기반 퍼소나와 근거 리뷰를 확인해요.' },
  { to: '/step5', no: 5, short: '인터뷰 분석·퍼소나 검증', title: '인터뷰 분석 및 인터뷰 기반 퍼소나 검증', desc: '연구자의 1차 분석 위에 AI가 패턴을 재구성한 과정을 보고, 인터뷰 기반 퍼소나를 확인해요.' },
  { to: '/step6', no: 6, short: '최종 퍼소나 품질 평가', title: '최종 퍼소나 품질 평가', desc: `퍼소나 6개를 7개 영역 ${ITEM_COUNT}개 문항(1~5점)과 퍼소나별 서술형 2개로 평가해요.` },
  { to: '/step7', no: 7, short: '종합 평가·제출', title: '전체 연구방법 종합 평가', desc: `연구 과정 전체를 리커트 ${STEP8_LIKERT}문항과 서술형 문항으로 종합 평가하고, 응답을 제출해요.` },
]

export const stepByNo = (no: number) => STEPS.find((s) => s.no === no)!
/** 하단 '다음' 버튼 문구. */
export const nextLabel = (no: number) => {
  const s = stepByNo(no)
  return no === 0 ? `${s.short}부터 시작하기` : `${no}단계: ${s.short}${ro(s.short)}`
}
/** 받침이 있으면(ㄹ 제외) '으로', 없으면 '로'. */
function ro(word: string) {
  const c = word.charCodeAt(word.length - 1) - 0xac00
  if (c < 0 || c > 11171) return '로'
  const jong = c % 28
  return jong === 0 || jong === 8 ? '로' : '으로'
}
