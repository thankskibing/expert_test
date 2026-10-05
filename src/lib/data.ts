import studyJson from '../data/study.json'
import coreJson from '../data/core.json'
import imgA from '../assets/personas/A.png'
import imgB from '../assets/personas/B.png'
import imgC from '../assets/personas/C.png'
import imgP from '../assets/personas/P.png'
import imgS1 from '../assets/personas/S1.png'
import imgS2 from '../assets/personas/S2.png'

export type DataPid = 'A' | 'B' | 'C'
export type QualPid = 'P' | 'S1' | 'S2'
export type Uid = 'U1' | 'U2' | 'U3' | 'U4' | 'U5' | 'U6'
export type Cat = 'D' | 'Q' | 'N' | 'X' | 'O' | 'R'

export interface Track { key: string; name: string; area?: string; left: string; right: string; pos: Record<string, number>; note?: string }
export interface Participant {
  id: Uid; title: string; group: QualPid; source: string
  info: { k: string; v: string }[]; pains: { title: string; detail: string }[]; quotes: string[]
}
export interface DataGroup {
  group: string; name: string; role: string; count: number; share: string
  traits: string[]; summary: string; flow: string
  quotes: { idx: number; text: string; status: Cat | null; reason: string | null }[]
}
export interface QualGroup { group: string; name: string; role: string; members: Uid[]; traits: string[]; summary: string }
export interface Persona {
  id: DataPid | QualPid; kind: 'data' | 'qual'; role: string; type: string; name: string; age: number; tags: string[]
  profile: { k: string; v: string }[]; quote: string; bio: string; motivation: string[]
  goals: { k: string; v: string }[]; pains: string[]; needs: { title: string; detail: string }[]
  behavior: { name: string; left: string; right: string; value: number }[]; flag?: string
}
export interface CoreReview { idx: number; text: string; tags: string[]; evidence: string[]; why: string; pdf: boolean }

interface Study {
  dataVars: Track[]; qualCommon: Track[]; qualNew: Track[]; qualPattern: Track[]
  participants: Participant[]; dataGroups: Record<DataPid, DataGroup>; qualGroups: Record<QualPid, QualGroup>
  personas: Persona[]
  stats: {
    totalReviews: number; interviews: number; keywordFlag: Record<DataPid, number>
    keywordRules: Record<DataPid, string>; keywords: Record<DataPid, string[]>
    reclass: Record<DataPid, { n: number; counts: Record<Cat, number>; cross: number; outside: number; lv: Record<string, number> }>
    globalCats: [string, number][]
  }
}

export const study = studyJson as unknown as Study
export const core = coreJson as unknown as Record<DataPid, CoreReview[]>

export const DATA_IDS: DataPid[] = ['A', 'B', 'C']
export const QUAL_IDS: QualPid[] = ['P', 'S1', 'S2']
export const PAIR: Record<DataPid, QualPid> = { A: 'P', B: 'S1', C: 'S2' }

export const PCOLOR: Record<string, string> = {
  A: '#F5222D', B: '#2F54EB', C: '#52C41A',
  P: '#F5222D', S1: '#2F54EB', S2: '#52C41A',
  // Ant Design preset palette (categorical use only)
  U1: '#2F54EB', U2: '#13C2C2', U3: '#FAAD14', U4: '#722ED1', U5: '#FA8C16', U6: '#EB2F96',
}
export const PNAME: Record<string, string> = {
  A: '일상 루틴 기반 효과 축적형', B: '구매 타당성 검증형', C: '기능 최적화형',
  P: '루틴 통합형 다기능 관리형', S1: '핵심 기능 유지 관찰형', S2: '상황 대응형 핵심 기능 집중형',
}
/** Persona avatar images. Same illustration style across all six so the image itself carries no source hint. */
export const PIMG: Record<string, string> = { A: imgA, B: imgB, C: imgC, P: imgP, S1: imgS1, S2: imgS2 }
export const PRANK: Record<string, string> = { A: 'Primary', B: 'Secondary 1', C: 'Secondary 2', P: 'Primary', S1: 'Secondary 1', S2: 'Secondary 2' }
export const PABBR: Record<string, string> = { A: 'P', B: 'S1', C: 'S2', P: 'P', S1: 'S1', S2: 'S2' }
export const PSHORT: Record<string, string> = { A: '데이터 Primary', B: '데이터 Secondary 1', C: '데이터 Secondary 2', P: '정성 Primary', S1: '정성 Secondary 1', S2: '정성 Secondary 2' }

export const CATS: { id: Cat; label: string; hint: string }[] = [
  { id: 'D', label: '퍼소나 적합', hint: '이 퍼소나의 핵심 행동변수를 원문에서 직접 보여주는 리뷰' },
  { id: 'Q', label: '정성 퍼소나 유사', hint: '데이터 퍼소나보다 정성 퍼소나 원자료와 닮은 행동' },
  { id: 'N', label: '부정 의견', hint: '이 퍼소나의 핵심 행동과 반대되는 사례' },
  { id: 'X', label: '보조·맥락 근거', hint: '핵심 행동은 아니지만 사용 맥락을 이해하는 데 참고할 정보' },
  { id: 'O', label: '분석 외', hint: '배송·선물·사용 전 기대 등 퍼소나 비교에 쓰기 어려운 내용' },
  { id: 'R', label: '재검토 필요', hint: '표현이 모호해 사람이 다시 판단해야 하는 리뷰' },
]
export const CATLABEL = Object.fromEntries(CATS.map((c) => [c.id, c.label])) as Record<Cat, string>

export function personaById(id: string) {
  return study.personas.find((p) => p.id === id)!
}

export interface ReviewsData { texts: Record<string, string>; personas: Record<DataPid, [number, Cat, string][]> }
let reviewsPromise: Promise<ReviewsData> | null = null
export function loadReviews() {
  if (!reviewsPromise) reviewsPromise = import('../data/reviews.json').then((m) => m.default as unknown as ReviewsData)
  return reviewsPromise
}
