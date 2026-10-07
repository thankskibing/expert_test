import type { DataPid, QualPid } from './data'

/** Interview protocol (전문가 심층 인터뷰) — question wording kept as given by the research team. */

export interface Round { key: 'primary' | 'secondary1' | 'secondary2'; label: string; data: DataPid; qual: QualPid }
export const ROUNDS: Round[] = [
  { key: 'primary', label: 'Primary', data: 'A', qual: 'P' },
  { key: 'secondary1', label: 'Secondary 1', data: 'B', qual: 'S1' },
  { key: 'secondary2', label: 'Secondary 2', data: 'C', qual: 'S2' },
]
export type RoundKey = Round['key']

export type FieldType = 'text' | 'textarea' | 'select' | 'radio' | 'checks' | 'scale'
export interface Field { id: string; q: string; hint?: string; type: FieldType; options?: string[]; other?: boolean; showIf?: { id: string; value: string } }

/** A 1~5 Likert item always paired with a reason/comment free-text field right under it. */
export function likert(id: string, q: string, hint?: string): Field[] {
  return [
    { id, q, hint, type: 'scale' },
    { id: `${id}_why`, q: '그렇게 평가하신 이유나 근거를 적어 주세요.', type: 'textarea' },
  ]
}

export const PROFILE: { title: string; lead: string; fields: Field[] }[] = [
  {
    title: '기본 프로필',
    lead: '먼저 연구 참여자의 기본적인 배경을 확인하기 위해 몇 가지 질문드릴게요.',
    fields: [
      { id: 'p_age', q: '연령대를 말씀해주실 수 있을까요?', type: 'radio', options: ['20대', '30대', '40대', '50대 이상'] },
      { id: 'p_edu', q: '최종 학력을 말씀해주실 수 있을까요?', type: 'radio', options: ['고등학교 졸업', '전문학사', '학사', '석사', '박사'], other: true },
      { id: 'p_role', q: '현재 담당하고 계신 직무 또는 역할은 무엇인가요?', type: 'text' },
      { id: 'p_industry', q: '현재 근무하고 계신 업종 또는 산업 분야는 무엇인가요?', type: 'text' },
      { id: 'p_career', q: '현재 직무와 관련된 총 경력은 어느 정도인가요?', type: 'radio', options: ['3년 미만', '3~5년', '5~10년', '10~15년', '15년 이상'] },
    ],
  },
  {
    title: '생성형 AI·LLM 활용 경험',
    lead: '다음으로 평소 생성형 AI를 어떻게 활용하고 계신지 간단히 여쭤볼게요.',
    fields: [
      { id: 'ai_tools', q: '평소 주로 사용하는 생성형 AI 서비스가 있나요?', type: 'checks', options: ['ChatGPT', 'Claude', 'Gemini', 'Copilot', '사용하지 않음'], other: true },
      { id: 'ai_freq', q: '업무에서 생성형 AI를 얼마나 자주 사용하시나요?', type: 'radio', options: ['거의 매일', '주 3~4회', '주 1~2회', '월 1~3회', '거의 사용하지 않음'] },
      { id: 'ai_use', q: '업무에서는 생성형 AI를 주로 어떤 용도로 사용하시나요?', type: 'checks', options: ['자료 조사', '아이디어 도출', '문서 작성', '데이터 분석', '사용자 리서치 정리', '기획 업무'], other: true },
      { id: 'ai_review', q: '생성형 AI가 만든 결과물을 업무에 활용할 때 어느 정도 검토하거나 수정해서 사용하시는 편인가요?', type: 'radio', options: ['거의 그대로 사용', '일부 수정해서 사용', '상당 부분 수정해서 사용', '참고 자료로만 사용'], other: true },
    ],
  },
  {
    title: '생성형 AI를 활용한 퍼소나 경험',
    lead: '',
    fields: [
      { id: 'px_made', q: '업무나 프로젝트에서 퍼소나를 직접 제작하거나 활용해본 경험이 있으신가요?', type: 'radio', options: ['직접 제작해본 적 있음', '활용만 해본 적 있음', '없음'] },
      { id: 'px_ai', q: '생성형 AI를 활용해 퍼소나를 제작해본 경험이 있으신가요?', type: 'radio', options: ['있음', '없음'] },
      { id: 'px_how', q: '경험이 있다면, 어떤 방식으로 AI를 활용하셨나요?', type: 'checks', options: ['인터뷰 내용 요약', '사용자 데이터 분석', '퍼소나 초안 생성', '프로필 구체화'], other: true, showIf: { id: 'px_ai', value: '있음' } },
    ],
  },
]

/** A/B/C 리뷰 집단과 토픽모델링 설명에 함께 붙이는 고정 안내문. STEP 1·3에 그대로 쓰여요. */
export const GROUP_DISCLAIMER = 'A/B/C 집단은 최종 퍼소나나 행동유형이 아니라, 생성형 AI가 유사한 사용자 경험을 묶어서 분석할 수 있도록 연구자가 구성한 분석용 리뷰 집단이에요.'

/** STEP 1. 연구 개요 및 전체 분석 프로세스 */
export const STEP1_QS: Field[] = [
  ...likert('s1_q1', '온라인 리뷰 기반 분석과 인터뷰 기반 분석의 진행 순서(AI가 먼저 보는지, 연구자가 먼저 분석하는지)가 서로 다르다는 점이 명확하게 전달된다.'),
  ...likert('s1_q2', '두 트랙 모두 마지막에 연구자가 원문을 다시 검토하는 절차가 포함되어 있어, 결과를 AI에만 맡기지 않았다고 느껴진다.'),
  ...likert('s1_q3', '전체 연구 절차(수집 → 분석 → 퍼소나 제작 → 비교 → 전문가 평가)가 한눈에 이해된다.'),
  { id: 's1_free', q: '전체 프로세스에서 보완이 필요하다고 느낀 부분이 있다면 자유롭게 적어 주세요.', type: 'textarea' },
]

/** STEP 2. 온라인 리뷰 데이터 수집·전처리 검증 */
export const STEP2_QS: Field[] = [
  ...likert('s2_q1', '데이터 수집 기준(수집 기간, 키워드, 제외 조건)이 연구 목적에 비추어 합리적이다.'),
  ...likert('s2_q2', '여러 제품을 함께 보던 범위를 국내 메디큐브 부스터프로로 좁힌 이유가 타당하다.'),
  ...likert('s2_q3', '전처리 규칙(브랜드·제품·기능명 통일, 오탈자·형태소 보정, 불용어 제거)이 리뷰 원문의 의미를 왜곡하지 않고 분석 정확도를 높이는 데 적절하다.'),
  ...likert('s2_q4', '수집·전처리 과정 전체가 투명하게 설명되어 있어 분석 결과를 신뢰할 수 있다.'),
]

/** STEP 3. 토픽 모델링 및 리뷰 분석 집단 구성 검증 */
export const STEP3_QS: Field[] = [
  ...likert('s3_q1', 'LDA로 도출된 4개 토픽의 키워드와 대표 댓글이 부여된 토픽명(입문/효과/기능/루틴)과 잘 들어맞는다.'),
  ...likert('s3_q2', '토픽 수를 정합도가 가장 높았던 2개가 아니라 해석 가능성을 고려해 4개로 정한 판단이 타당하다.'),
  ...likert('s3_q3', 'A/B/C 리뷰 집단이 토픽과는 다른, 행동 중심의 분석용 집단이라는 점이 명확하게 구분된다.'),
  ...likert('s3_q4', '각 리뷰 집단(A/B/C)의 분류 기준(핵심 키워드, 포함 조건)과 대표 리뷰가 그 집단의 특징을 잘 보여준다.'),
  ...likert('s3_q5', '하나의 리뷰가 여러 집단에 중복으로 포함될 수 있고 키워드 기반 1차 분류라는 점을 고려해도, 집단 구성 방식이 합리적이다.'),
]

/** STEP 4-1. AI 분석 과정 설명에 대한 평가 */
export const STEP4_PROCESS_QS: Field[] = [
  ...likert('s4_q1', '리뷰 집단 전체 원문을 AI에 입력해 반복 행동을 분석하게 한 과정이 타당한 분석 방식이다.'),
  ...likert('s4_q2', 'AI가 도출한 행동유형 후보를 연구자가 원문으로 재검토하는 절차가 AI의 임의 해석(환각)을 통제하는 데 충분하다.'),
  ...likert('s4_q3', '이 분석 과정을 거쳐 나온 결과를 실제 업무에서도 신뢰하고 활용할 수 있을 것 같다.'),
  { id: 's4_reflect', q: '직접 이런 방식으로 AI를 활용해 사용자 데이터를 분석한다면, 어떤 점을 더 보완하고 싶으신가요?', type: 'textarea' },
]

/** STEP 4-3. 824건 등 재분류 결과에 대한 평가 */
export const STEP4_RECLASS_QS: Field[] = [
  ...likert('s4r_q1', '키워드로 1차 분류된 리뷰를 핵심 행동 변수 기준으로 한 건씩 재분류한 절차가 분류 정확도를 높이는 데 적절하다.'),
  ...likert('s4r_q2', '재분류 결과(퍼소나 적합/정성 유사/부정 의견/보조·맥락 근거/분석 외/재검토 필요로 나뉜 비율)가 납득할 만하다.'),
]

/** STEP 4-4. 개별 리뷰 판정 평가 문항 (리뷰마다: 1~5점 + 동의 여부 + 이유) */
export const REVIEW_AGREE_OPTIONS = ['동의', '부분 동의', '동의 안 함']

/** STEP 5-1. 발화 → 연구자 1차 분석 → AI 재구성 사례별 평가 */
export const STEP5_PATTERN_QS: Field[] = [
  ...likert('s5p_q1', '연구자의 1차 분석이 참여자 발화의 행동 특성을 적절하게 포착했다.'),
  ...likert('s5p_q2', 'AI가 참여자 간 공통점과 차이를 비교해 재구성한 패턴이 원문의 내용과 부합한다.'),
]
/** STEP 5-2. 정성 퍼소나 검증 */
export const STEP5_QUAL_QS: Field[] = [
  ...likert('s5q_q1', '정성 퍼소나의 행동 변수와 그룹 구분이 인터뷰 원문에 근거해 타당하게 도출되었다.'),
  ...likert('s5q_q2', '연구자의 1차 분석과 AI의 재구성이 더해지는 이 방식이 인터뷰 데이터의 특성(개별 맥락이 풍부한 자료)에 적합하다.'),
  ...likert('s5q_q3', '정성 퍼소나가 실제 인터뷰 참여자의 모습을 자연스럽게 반영하고 있다.'),
]

/** STEP 6. 리뷰 기반 퍼소나와 인터뷰 기반 퍼소나 비교 */
export const STEP6_QS: Field[] = [
  ...likert('s6_q1', '같은 역할(Primary/Secondary)로 짝지어진 두 퍼소나의 공통점이 타당하게 제시되었다.'),
  ...likert('s6_q2', '두 퍼소나의 차이점이 데이터 특성(다수의 짧은 리뷰 vs. 소수의 깊은 인터뷰)에서 비롯된 것으로 설명된다.'),
  ...likert('s6_q3', '리뷰 기반 퍼소나와 인터뷰 기반 퍼소나가 서로를 보완할 수 있는 지점이 명확하게 드러난다.'),
  { id: 's6_choice', q: '실제 업무에서 두 퍼소나 중 하나를 선택해야 한다면 어떤 퍼소나를 활용하시겠습니까?', type: 'radio', options: ['온라인 리뷰 기반 퍼소나', '인터뷰 기반 퍼소나', '둘 다 함께 활용', '판단하기 어려움'] },
  { id: 's6_choice_why', q: '그 이유는 무엇인가요?', type: 'textarea' },
]

export interface Dim {
  id: string; no: number; title: string; en?: string; purpose: string
  items: { id: string; q: string }[]
  /** 추가 질문 1 — 항상 같은 문구로 묻는, 평가 이유를 묻는 질문. */
  follow: string
  /** 추가 질문 2 — 해당 영역 문항들의 평균 점수에 따라 문구가 달라져요. */
  moreLow: string
  moreNeutral: string
  moreHigh: string
}
export const DIMS: Dim[] = [
  { id: 'grounding', no: 1, title: '데이터 근거성', purpose: '퍼소나의 특성과 행동이 제시된 원천 데이터 및 행동변수와 얼마나 타당하게 연결되는지를 평가합니다.',
    items: [
      { id: '1-1', q: '퍼소나의 핵심 특성·행동·니즈·사용 맥락이 제시된 원천 데이터로 설명된다.' },
      { id: '1-2', q: '도출된 행동변수와 퍼소나에 표현된 사용자 특성 간의 연결이 타당하다.' },
    ],
    follow: '이 퍼소나가 제시된 데이터와 잘 연결되어 있다고, 또는 연결되지 않는다고 판단하신 이유는 무엇인가요?',
    moreLow: '근거가 부족하거나 설득력이 떨어진다고 느낀 부분이 있다면 무엇인가요?',
    moreNeutral: '특히 근거가 충분하거나 부족하다고 느낀 부분이 있었다면 무엇인가요?',
    moreHigh: '특히 근거가 탄탄하다고 느낀 부분이 있다면 무엇인가요?' },
  { id: 'credibility', no: 2, title: '신뢰성', en: 'Credibility', purpose: '퍼소나가 실제로 존재할 법하고 현실적인 사용자 유형으로 인식되는지를 평가합니다.',
    items: [
      { id: '2-1', q: '이 퍼소나는 실제 메디큐브 부스터 프로 사용자처럼 느껴진다.' },
      { id: '2-2', q: '퍼소나의 행동과 특성이 인위적으로 조합된 정보가 아니라 자연스러운 하나의 사용자 유형으로 느껴진다.' },
    ],
    follow: '이 퍼소나를 실제 사용자처럼 느끼셨나요? 그렇게 판단하신 이유는 무엇인가요?',
    moreLow: '인위적이거나 실제 사용자와 거리가 있다고 느껴진 부분이 있다면 무엇인가요?',
    moreNeutral: '실제 사용자처럼 느껴진 부분, 또는 반대로 어색하게 느껴진 부분이 있다면 무엇인가요?',
    moreHigh: '특히 실제 사용자처럼 자연스럽게 느껴진 부분이 있다면 무엇인가요?' },
  { id: 'consistency', no: 3, title: '일관성', en: 'Consistency', purpose: '퍼소나에 포함된 여러 정보와 행동 특성이 서로 모순 없이 연결되는지를 평가합니다.',
    items: [
      { id: '3-1', q: '퍼소나에 제시된 행동, 니즈, 동기, 불만 사항 등의 정보가 서로 모순 없이 일관된다.' },
      { id: '3-2', q: '퍼소나의 서술(시나리오·스토리 등)이 행동, 니즈 등 프로필의 다른 정보와 어긋나지 않는다.' },
    ],
    follow: '퍼소나의 여러 정보가 자연스럽게 연결된다고 느끼셨나요? 그렇게 느낀 이유는 무엇인가요?',
    moreLow: '서로 어긋나거나 연결이 약하다고 느낀 부분이 있다면 무엇인가요?',
    moreNeutral: '정보 간 연결이 자연스러웠던 부분, 또는 어긋난다고 느낀 부분이 있다면 무엇인가요?',
    moreHigh: '특히 정보 간 연결이 탄탄하다고 느낀 부분이 있다면 무엇인가요?' },
  { id: 'completeness', no: 4, title: '완전성', en: 'Completeness', purpose: '사용자를 이해하고 기획에 활용하는 데 필요한 핵심 정보가 충분히 포함되어 있는지를 평가합니다.',
    items: [
      { id: '4-1', q: '이 퍼소나는 해당 사용자를 이해하는 데 필요한 핵심 정보를 충분히 제공한다.' },
      { id: '4-2', q: '사용자의 행동, 동기, 니즈와 불편 사항이 사용자를 이해하기에 충분한 수준으로 제시되어 있다.' },
    ],
    follow: '이 퍼소나를 통해 사용자를 이해하기에 정보가 충분하다고 느끼셨나요? 그렇게 느낀 이유는 무엇인가요?',
    moreLow: '부족하거나 추가로 알고 싶은 정보가 있다면 무엇인가요?',
    moreNeutral: '충분하다고 느낀 정보, 또는 부족하다고 느낀 정보가 있다면 무엇인가요?',
    moreHigh: '특히 충분하다고 느낀 정보나 항목이 있다면 무엇인가요?' },
  { id: 'clarity', no: 5, title: '명확성', en: 'Clarity', purpose: '퍼소나의 핵심 특성과 정보가 얼마나 쉽게 이해되는지를 평가합니다.',
    items: [
      { id: '5-1', q: '이 퍼소나가 어떤 특징을 가진 사용자인지 쉽게 파악할 수 있고, 핵심 특성이 명확히 드러난다.' },
      { id: '5-2', q: '퍼소나에 제시된 정보와 설명은 이해하기 쉽게 구성되어 있다.' },
    ],
    follow: '이 퍼소나가 어떤 사용자인지 명확하게 파악할 수 있었나요? 그렇게 느낀 이유는 무엇인가요?',
    moreLow: '이해하기 어렵거나 모호했던 정보가 있다면 무엇인가요?',
    moreNeutral: '명확하게 다가온 정보, 또는 모호하게 느껴진 정보가 있다면 무엇인가요?',
    moreHigh: '특히 명확하게 다가온 정보나 표현이 있다면 무엇인가요?' },
  { id: 'empathy', no: 6, title: '공감성', en: 'Empathy', purpose: '전문가가 퍼소나의 상황과 행동 이유, 경험을 사용자 관점에서 이해할 수 있는지를 평가합니다.',
    items: [
      { id: '6-1', q: '이 퍼소나가 어떤 상황에서 왜 그렇게 행동하는지, 어떤 니즈와 어려움을 가졌는지 사용자 관점에서 이해할 수 있다.' },
      { id: '6-2', q: '이 퍼소나가 제품을 사용하는 상황과 경험을 구체적으로 떠올릴 수 있다.' },
    ],
    follow: '이 퍼소나의 행동이나 상황을 사용자 관점에서 이해할 수 있었나요? 그렇게 느낀 이유는 무엇인가요?',
    moreLow: '이해하기 어렵거나 공감이 잘 안 됐던 부분이 있다면 무엇인가요?',
    moreNeutral: '특히 공감이 잘 되었던 부분, 또는 이해하기 어려웠던 부분이 있다면 무엇인가요?',
    moreHigh: '특히 공감이 잘 되었던 부분이 있다면 무엇인가요?' },
  { id: 'utility', no: 7, title: '실용성', en: 'Practicality', purpose: '퍼소나가 실제 기획 과정에서 사용자 이해와 의사결정에 활용될 수 있는지를 평가합니다.',
    items: [
      { id: '7-1', q: '이 퍼소나는 기획 단계에서 아이데이션이나 서비스 전략을 도출하는 데 활용할 수 있을 것 같다.' },
      { id: '7-2', q: '이 퍼소나는 기능·서비스 방향이나 사용자 시나리오 등 기획 판단에 필요한 정보를 제공한다.' },
      { id: '7-3', q: '이 퍼소나는 프로젝트 참여자들이 사용자에 대한 공통된 관점을 형성하고 소통하는 데 활용할 수 있을 것 같다.' },
    ],
    follow: '실제 기획 단계 업무에서 이 퍼소나를 활용할 수 있다고 생각하시나요? 그 이유는 무엇인가요?',
    // 낮은 점수에는 "어떤 부분이 어려운지"(원 추가 질문 3)를, 높은 점수에는 "어디서 유용한지"(원 추가 질문 2)를 묻도록 나눠요.
    moreLow: '반대로 실제 업무에서 사용하기 어렵다고 느껴지는 부분이 있다면 무엇인가요?',
    moreNeutral: '활용한다면 어떤 업무나 단계에서 유용할 것 같은지, 또는 활용하기 어려운 부분이 있다면 무엇인지 알려주세요.',
    moreHigh: '활용한다면 어떤 업무나 단계에서 가장 유용할 것 같나요?' },
]
export const ITEM_COUNT = DIMS.reduce((a, d) => a + d.items.length, 0)
export const SCALE = ['전혀 그렇지 않다', '그렇지 않다', '보통이다', '그렇다', '매우 그렇다']

/** STEP 8. 전체 연구방법 종합 평가 — 10문항 */
export const STEP8_DIMS: { id: string; q: string }[] = [
  { id: 'm1', q: '두 트랙(리뷰/인터뷰)의 분석 순서가 다르다는 점이 연구 설계상 타당하다.' },
  { id: 'm2', q: '온라인 리뷰 데이터의 수집 범위와 전처리 과정이 분석 결과의 신뢰도를 뒷받침한다.' },
  { id: 'm3', q: 'LDA 토픽모델링과 A/B/C 리뷰 집단 구성이 서로 구분되어 혼동 없이 사용되었다.' },
  { id: 'm4', q: 'AI가 원문을 분석해 행동유형과 퍼소나를 도출하는 절차가 데이터에 근거하고 있다.' },
  { id: 'm5', q: '연구자의 재검토(원문 재확인, 재분류)가 AI 분석의 오류나 임의 해석을 충분히 통제한다.' },
  { id: 'm6', q: '인터뷰 분석에서 연구자의 1차 분석 위에 AI가 패턴을 재구성하는 절차가 정성 데이터의 맥락을 잘 살렸다.' },
  { id: 'm7', q: '리뷰 기반 퍼소나와 인터뷰 기반 퍼소나의 비교가 두 데이터의 특성 차이를 설득력 있게 설명한다.' },
  { id: 'm8', q: '최종 퍼소나들이 전체적으로 실제 사용자를 이해하는 데 유용하다.' },
  { id: 'm9', q: '이 연구 방법 전체가 다른 제품이나 서비스에도 적용할 수 있을 만큼 체계적이다.' },
  { id: 'm10', q: '전체적으로 이 연구의 과정과 결과를 신뢰할 수 있다.' },
]
export const STEP8_QS: Field[] = STEP8_DIMS.flatMap((d) => likert(d.id, d.q))

export const REVISE_OPTIONS = [
  '1. 연구 개요 및 전체 분석 프로세스',
  '2. 온라인 리뷰 데이터 수집·전처리',
  '3. 토픽 모델링 및 리뷰 분석 집단 구성',
  '4. 리뷰 기반 AI 분석 및 퍼소나 근거',
  '5. 인터뷰 분석 및 정성 퍼소나',
  '6. 리뷰 기반 퍼소나와 인터뷰 기반 퍼소나 비교',
  '7. 최종 퍼소나 품질',
  '8. 종합 평가 방식 자체',
  '데이터 수집 범위', '전처리 규칙', '토픽모델링 결과 해석', 'AI 프롬프트 설계',
  '재분류·검증 절차', '인터뷰 참여자 구성',
]
export const STEP8_CHECKLIST: Field[] = [
  { id: 'm_revise', q: '전체 연구 방법 중 수정이나 보완이 필요하다고 생각되는 단계를 모두 선택해 주세요. (복수 선택 가능)', type: 'checks', options: REVISE_OPTIONS, other: true },
  { id: 'm_final', q: '그 밖에 연구 과정이나 퍼소나 전반에 대해 자유롭게 남기고 싶은 의견을 적어 주세요.', type: 'textarea' },
]
