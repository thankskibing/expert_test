import { method } from '../lib/data'
import { STEP1_QS } from '../lib/protocol'
import { useEval } from '../lib/evalStore'
import { FieldList, unanswered } from '../components/form'
import { StepNav, leftHint } from '../components/flow'
import { nextLabel, stepByNo } from '../lib/steps'
import { PageHead, Section } from '../components/ui'

/** 연구 절차를 이 사이트의 단계 번호로 표시해요(별도 번호 체계를 두지 않아요). */
const PROCESS_STEPS = [
  '2단계 · 리뷰 수집·전처리',
  '3단계 · 토픽 분석',
  '4단계 · 리뷰 기반 AI 분석·퍼소나',
  '5단계 · 인터뷰 진행·1차 분석·AI 분석·퍼소나',
  '6단계 · 두 퍼소나 비교',
  '7~8단계 · 전문가 평가',
]

function TrackCard({ color, label, steps }: { color: string; label: string; steps: string[] }) {
  return (
    <div className="rounded-2xl border border-g200 p-5">
      <p className="mb-3 inline-flex items-center gap-2 text-t1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />{label}</p>
      <ol className="space-y-2.5">
        {steps.map((s, i) => (
          <li key={s} className="flex gap-2.5 text-b2 text-g800">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-cap font-bold text-white" style={{ background: color }}>{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function Step1() {
  const { state, setStep1 } = useEval()
  return (
    <div>
      <PageHead step={1} title={stepByNo(1).title}>
        {method.aiProcess.purpose} 이번 평가에서는 완성된 퍼소나뿐 아니라, 그 퍼소나를 만든 연구 과정 전체가 타당한지를 단계별로 살펴봐 주세요.
      </PageHead>

      <Section title="전체 절차">
        <ol className="flex flex-wrap gap-2 text-b3 text-g700">
          {PROCESS_STEPS.map((s, i, arr) => (
            <li key={s} className="flex items-center gap-2">
              <span className="rounded-s bg-g50 px-2.5 py-1.5">{s}</span>
              {i < arr.length - 1 && <span className="text-g400">→</span>}
            </li>
          ))}
        </ol>
      </Section>

      <Section title="트랙별 AI 분석 과정" lead={method.aiProcess.disclaimer}>
        <div className="grid gap-4 md:grid-cols-2">
          <TrackCard color="#2F54EB" label={method.aiProcess.review.label} steps={method.aiProcess.review.steps} />
          <TrackCard color="#D46B08" label={method.aiProcess.interview.label} steps={method.aiProcess.interview.steps} />
        </div>
      </Section>

      <section className="mt-8 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
        <h2 className="pt-4 text-t1">1단계 평가</h2>
        <div className="max-w-3xl"><FieldList fields={STEP1_QS} get={(id) => state.step1[id] ?? ''} set={setStep1} prefix="1-Q" /></div>
      </section>

      <StepNav prev="/profile" next="/step2" nextLabel={nextLabel(2)} hint={leftHint(unanswered(STEP1_QS, (id) => state.step1[id] ?? ''))} />
    </div>
  )
}
