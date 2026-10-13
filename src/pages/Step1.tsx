import { method } from '../lib/data'
import { STEP1_QS } from '../lib/protocol'
import { useEval } from '../lib/evalStore'
import { FieldList } from '../components/form'
import { StepNav } from '../components/flow'
import { PageHead, Section } from '../components/ui'

const PROCESS_STEPS = [
  '1-1. 리뷰 수집·전처리',
  '1-2. 토픽 분석',
  '1-3. 리뷰 기반 AI 분석·퍼소나',
  '2-1. 정성 인터뷰 진행',
  '2-2. 인터뷰 1차 정리',
  '2-3. 인터뷰 기반 AI 분석·퍼소나',
  '3. 두 퍼소나 비교',
  '4. 전문가 평가',
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
      <PageHead step={1} title="연구 개요 및 전체 분석 프로세스">
        {method.aiProcess.purpose} 이번 평가에서는 완성된 퍼소나뿐 아니라, 그 퍼소나를 만든 연구 과정 전체가 객관적인지를 단계별로 살펴봐 주세요.
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

      <Section title="트랙별 AI 분석 과정">
        <div className="grid gap-4 md:grid-cols-2">
          <TrackCard color="#2F54EB" label={method.aiProcess.review.label} steps={method.aiProcess.review.steps} />
          <TrackCard color="#D46B08" label={method.aiProcess.interview.label} steps={method.aiProcess.interview.steps} />
        </div>
      </Section>

      <section className="mt-8 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
        <h2 className="pt-4 text-t1">1단계 평가</h2>
        <div className="max-w-3xl"><FieldList fields={STEP1_QS} get={(id) => state.step1[id] ?? ''} set={setStep1} /></div>
      </section>

      <StepNav prev="/profile" next="/step2" nextLabel="2단계: 수집·전처리 검증으로" />
    </div>
  )
}
