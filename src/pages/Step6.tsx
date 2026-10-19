import { Link } from 'react-router-dom'
import { STEP6_QS } from '../lib/protocol'
import { useEval } from '../lib/evalStore'
import { nextLabel, stepByNo } from '../lib/steps'
import { FieldList, unanswered } from '../components/form'
import { StepNav, leftHint } from '../components/flow'
import { CompareMemo, ComparePairs, PAIR_NOTE } from '../components/Compare'
import { Note, PageHead, Section } from '../components/ui'

export default function Step6() {
  const { state, setStep6 } = useEval()
  const get = (id: string) => state.step6[id] ?? ''
  const left = unanswered(STEP6_QS, get)
  return (
    <div>
      <PageHead step={6} title={stepByNo(6).title}>
        4·5단계에서 확인한 두 트랙의 퍼소나를 짝지어 비교해요. 아래 비교와 해석은 연구팀의 분석 메모이고, 이 메모가 두 데이터의 차이를 적절하게 설명하는지 평가해 주세요.
      </PageHead>

      <div className="mb-10"><Note label="짝짓기 기준">{PAIR_NOTE}</Note></div>

      <Section title="퍼소나 쌍 비교" lead="각 쌍의 같은 점·다른 점과, 리뷰 전체에서 각 퍼소나의 행동이 얼마나 보이는지 정리했어요.">
        <ComparePairs />
      </Section>

      <Section title="두 결과가 다르게 나온 이유(분석 메모)">
        <CompareMemo />
        <p className="mt-4 max-w-prose2 text-b3 text-g600">
          재분류 분포와 키워드 규칙별 적합 비율은 참고 자료의 <Link to="/process" className="text-brand hover:text-brand-hover">도출 과정·교차 검증</Link>에서 볼 수 있어요.
        </p>
      </Section>

      <section className="mt-8 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
        <h2 className="pt-4 text-t1">6단계 평가</h2>
        <div className="max-w-3xl"><FieldList fields={STEP6_QS} get={get} set={setStep6} prefix="6-Q" /></div>
      </section>

      <StepNav prev="/step5" next="/step7" nextLabel={nextLabel(7)} hint={leftHint(left)} />
    </div>
  )
}
