import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEval } from '../lib/evalStore'
import { ITEM_COUNT } from '../lib/protocol'
import { Button, Section, TextField } from '../components/ui'

const IMG = 'https://m.themedicube.co.kr/web/product/extra/big/202604/184e32f2aa5e815b76989286ff650b0d.jpg'

function ProductImage() {
  const [ok, setOk] = useState(true)
  if (!ok) return <div className="flex aspect-square items-center justify-center rounded-xl bg-g50 text-b3 text-g500">제품 이미지를 불러오지 못했어요</div>
  return (
    <figure>
      <img src={IMG} alt="메디큐브 에이지알 부스터 프로 X2 제품 이미지" referrerPolicy="no-referrer" loading="lazy" onError={() => setOk(false)} className="aspect-square w-full rounded-xl border border-g200 bg-g50 object-cover" />
      <figcaption className="mt-2 text-b3 text-g500">이미지 출처: 메디큐브 공식몰</figcaption>
    </figure>
  )
}

const STEPS = [
  ['기본 프로필', '실무 배경과 생성형 AI 활용 경험을 간단히 여쭤봐요.'],
  ['1. 연구 개요 및 전체 분석 프로세스', '리뷰 트랙과 인터뷰 트랙이 AI를 서로 다른 순서로 쓴다는 점을 포함해 전체 흐름을 살펴봐요.'],
  ['2. 온라인 리뷰 데이터 수집·전처리 검증', '어떤 기준으로 리뷰를 모으고 다듬었는지 확인해요.'],
  ['3. 토픽 모델링 및 리뷰 분석 집단 구성 검증', 'LDA 토픽 4개와, 행동 변수 기준으로 구성한 A/B/C 분석용 리뷰 집단을 각각 확인해요.'],
  ['4. 리뷰 기반 AI 분석 및 퍼소나 근거 검증', 'AI 분석 과정을 보고, 리뷰 기반 퍼소나를 처음 공개해요. 재분류 결과와 리뷰별 판정도 확인해요.'],
  ['5. 인터뷰 분석 및 정성 퍼소나 검증', '연구자의 1차 분석 위에 AI가 패턴을 재구성한 과정을 보고, 정성 퍼소나를 확인해요.'],
  ['6. 리뷰 기반 퍼소나와 인터뷰 기반 퍼소나 비교', '같은 역할로 짝지은 두 퍼소나의 공통점과 차이점을 비교해요.'],
  ['7. 최종 퍼소나 품질 평가', `퍼소나 6개를 7개 영역 ${ITEM_COUNT}개 문항으로 평가해요(1~5점).`],
  ['8. 전체 연구방법 종합 평가', '연구 과정 전체를 10문항으로 종합 평가하고, 응답을 제출해요.'],
]

export default function Start() {
  const { state, setEvaluator, setProfile } = useEval()
  const nav = useNavigate()
  const agree = state.profile.consent === '동의'
  return (
    <div>
      <header className="mb-10 max-w-[52rem]">
        <p className="mb-2 text-b2 text-g600">메디큐브 부스터 프로 · 전문가 심층 인터뷰</p>
        <h1 className="text-h1 sm:text-display">AI 퍼소나 전문가 평가</h1>
        <div className="mt-4 max-w-prose2 space-y-3 text-b1 text-g700">
          <p>안녕하세요. 오늘 인터뷰에 참여해주셔서 감사합니다.</p>
          <p>이 연구에서는 메디큐브 부스터 프로를 대상으로 생성형 AI를 활용해 퍼소나를 제작했어요. 오늘은 전문가님의 실무 배경과 생성형 AI 활용 경험을 간단히 확인한 뒤, 두 가지 방식으로 제작된 퍼소나를 살펴보고 사용자 이해와 실무 활용 측면에서 어떻게 평가되는지 의견을 듣고자 해요.</p>
        </div>
      </header>

      <Section title="연구 대상: 메디큐브 에이지알 부스터 프로" lead="제조사 상세페이지 내용을 바탕으로 정리했어요.">
        <div className="grid gap-6 rounded-xl border border-g200 p-5 sm:p-6 md:grid-cols-[minmax(0,15rem)_1fr]">
          <ProductImage />
          <div>
            <p className="text-b2 text-g900">
              에이지알 부스터 프로는 화장품 흡수를 돕는 부스터 기능을 중심으로 미세전류, EMS, 모공 관리 기능을 한 기기에 담은 메디큐브의 홈 뷰티 디바이스예요. 2026년 3월 출시된 <b>부스터 프로 X2</b>는 이전 모델보다 출력이 2배 강해졌다고 소개되며, 두 모드를 함께 쓰는 듀얼 모드와 마스크팩 위에서 쓰는 마스크 모드, AGE-R 앱과 연동한 AI 케어가 더해졌어요.
            </p>
            <table className="mt-4 w-full text-left text-b2">
              <thead><tr className="border-b border-g200 bg-g50"><th className="px-3 py-2 font-semibold">모드</th><th className="px-3 py-2 font-semibold">주요 용도</th></tr></thead>
              <tbody className="divide-y divide-g200">
                {[
                  ['부스터', '스킨케어 제품 흡수, 속건조·윤기'],
                  ['MC(미세전류)', '탄력·볼륨'],
                  ['더마샷(EMS)', '붓기·윤곽'],
                  ['에어샷', '모공·각질'],
                  ['마스크', '시트 마스크팩 위에서 흡수 (X2 추가)'],
                  ['듀얼 · AI 케어', '두 모드 동시 사용, 앱의 맞춤 관리 안내 (X2 추가)'],
                ].map(([m, d]) => <tr key={m}><td className="whitespace-nowrap px-3 py-2 text-g900">{m}</td><td className="px-3 py-2 text-g700">{d}</td></tr>)}
              </tbody>
            </table>
            <p className="mt-3 text-b3 text-g600">
              모드별 단계(강도)를 조절할 수 있어요.{' '}
              <a href="https://themedicube.co.kr/product/detail.html?product_no=2705" target="_blank" rel="noreferrer" className="text-brand hover:text-brand-hover">제품 상세페이지</a>
            </p>
          </div>
        </div>
      </Section>

      <Section title="진행 순서">
        <ol className="max-w-prose2 space-y-3">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-weak text-b3 font-semibold text-brand">{i + 1}</span>
              <p className="text-b2"><b className="font-semibold text-g900">{t}</b><span className="block text-g600">{d}</span></p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="참여 동의">
        <div className="max-w-prose2 rounded-xl border border-g200 bg-g50 p-5 text-b2 text-g700">
          <p>말씀해주신 내용은 연구 목적으로만 활용돼요. 연구 분석을 위해 인터뷰 내용을 녹음·기록하며, 개인을 식별할 수 있는 정보는 연구 결과에 포함되지 않아요. 답하기 어려운 질문은 넘어가셔도 되고, 언제든 인터뷰를 중단하실 수 있어요.</p>
          <label className="mt-4 flex cursor-pointer items-center gap-2 text-g900">
            <input type="checkbox" checked={agree} onChange={(e) => setProfile('consent', e.target.checked ? '동의' : '')} className="h-4 w-4 accent-[#1677FF]" />
            인터뷰 내용의 녹음 및 기록에 동의해요.
          </label>
        </div>
        <div className="mt-6 max-w-md">
          <label htmlFor="ev" className="mb-2 block text-b2 font-semibold text-g900">평가자 이름 또는 이니셜</label>
          <TextField id="ev" value={state.evaluator} onChange={(e) => setEvaluator(e.target.value)} placeholder="예: 김OO" />
          <p className="mt-1.5 text-b3 text-g600">여러 전문가의 응답을 구분하는 데만 써요. 입력한 내용은 이 브라우저에 자동으로 저장돼요.</p>
        </div>
      </Section>

      <div className="mt-12 flex items-center justify-between gap-4 border-t border-g200 pt-6">
        <p className="text-b2 text-g600">{!agree ? '동의 후 시작할 수 있어요.' : !state.evaluator.trim() ? '평가자 이름을 입력하면 시작할 수 있어요.' : '준비됐어요.'}</p>
        <Button size="l" variant="primary" disabled={!agree || !state.evaluator.trim()} onClick={() => nav('/profile')}>인터뷰 시작하기</Button>
      </div>
    </div>
  )
}
