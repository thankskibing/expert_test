import type { DataPid, QualPid } from './data'

/** Interview protocol (전문가 심층 인터뷰) — question wording kept as given by the research team. */

export interface Round { key: 'primary' | 'secondary1' | 'secondary2'; label: string; data: DataPid; qual: QualPid }
export const ROUNDS: Round[] = [
  { key: 'primary', label: 'Primary', data: 'A', qual: 'P' },
  { key: 'secondary1', label: 'Secondary 1', data: 'B', qual: 'S1' },
  { key: 'secondary2', label: 'Secondary 2', data: 'C', qual: 'S2' },
]
export type RoundKey = Round['key']

export type FieldType = 'text' | 'textarea' | 'select' | 'radio' | 'checks'
export interface Field { id: string; q: string; hint?: string; type: FieldType; options?: string[]; other?: boolean; showIf?: { id: string; value: string } }

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

export const COMPARE_QS: Field[] = [
  { id: 'c_pick', q: '두 퍼소나 중 어떤 퍼소나가 온라인 사용자 리뷰 데이터로 제작되었다고 생각하시나요?', type: 'radio', options: ['퍼소나 X', '퍼소나 Y', '판단하기 어려움'] },
  { id: 'c_why', q: '그렇게 판단하신 이유는 무엇인가요?', type: 'textarea' },
  { id: 'c_diff', q: '두 퍼소나를 비교했을 때, 사용자 특성에서 가장 다르게 느껴지는 부분은 무엇인가요?', type: 'textarea' },
]

export const EVIDENCE_QS_AFTER: Field[] = [
  { id: 'e_surprise', q: '실제 데이터 출처를 확인했을 때 예상과 다른 부분이 있었나요? 있었다면 어떤 점이었나요?', type: 'textarea' },
  { id: 'e_clearer', q: '근거 자료까지 함께 확인했을 때, 두 퍼소나의 차이가 이전보다 더 분명하게 느껴지는 부분이 있나요? 있다면 어떤 부분인가요?', type: 'textarea' },
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

export const FINAL_QS: Field[] = [
  { id: 'f_diff', q: '두 퍼소나를 비교했을 때 가장 크게 느껴진 차이는 무엇인가요?', type: 'textarea' },
  { id: 'f_review_plus', q: '온라인 사용자 리뷰 기반 퍼소나에서 가장 강점이라고 느낀 부분은 무엇인가요?', type: 'textarea' },
  { id: 'f_review_minus', q: '반대로 온라인 사용자 리뷰 기반 퍼소나에서 부족하거나 한계라고 느낀 부분은 무엇인가요?', type: 'textarea' },
  { id: 'f_qual_plus', q: '정성 인터뷰 기반 퍼소나에서 가장 강점이라고 느낀 부분은 무엇인가요?', type: 'textarea' },
  { id: 'f_qual_minus', q: '반대로 정성 인터뷰 기반 퍼소나에서 부족하거나 한계라고 느낀 부분은 무엇인가요?', type: 'textarea' },
  { id: 'f_choice', q: '실제 업무에서 두 퍼소나 중 하나를 선택해야 한다면 어떤 퍼소나를 활용하시겠습니까?', type: 'radio', options: ['온라인 사용자 리뷰 기반 퍼소나', '정성 인터뷰 기반 퍼소나', '판단하기 어려움'] },
  { id: 'f_choice_why', q: '그 이유는 무엇인가요?', type: 'textarea' },
  { id: 'f_combine', q: '두 데이터 유형을 함께 활용해 퍼소나를 제작한다면 보완될 수 있다고 생각하는 부분이 있나요?', type: 'textarea' },
]
