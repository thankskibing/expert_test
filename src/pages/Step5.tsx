import { useState } from 'react'
import { PCOLOR, PNAME, QUAL_IDS, study, type QualPid } from '../lib/data'
import { STEP5_PATTERN_QS, STEP5_QUAL_QS } from '../lib/protocol'
import { useEval } from '../lib/evalStore'
import { FieldList } from '../components/form'
import { FullPersonaCard } from '../components/PersonaCard'
import { StepNav } from '../components/flow'
import { Note, PageHead, Section, Segmented } from '../components/ui'

const PARTS = [['pattern', '5-1. 발화 → 1차 분석 → AI 재구성'], ['qual', '5-2. 정성 퍼소나 검증']] as const

function PatternExample({ g }: { g: QualPid }) {
  const grp = study.qualGroups[g]
  const member = study.participants.find((u) => u.id === grp.members[0])!
  const quote = member.quotes[0]
  return (
    <div className="rounded-2xl border border-g200 p-5">
      <p className="mb-2 flex items-center gap-2 text-cap text-g500"><span className="h-2 w-2 rounded-full" style={{ background: PCOLOR[g] }} />{grp.group} · {PNAME[g]} · {grp.members.join(', ')}</p>
      <div className="space-y-3">
        <div className="rounded-xl bg-g50 px-4 py-3"><p className="mb-1 text-cap font-semibold text-g600">① 실제 발화 ({member.id})</p><p className="text-b2 text-g900">“{quote}”</p></div>
        <div className="rounded-xl bg-g50 px-4 py-3"><p className="mb-1 text-cap font-semibold text-g600">② 연구자 1차 분석</p><p className="text-b2 text-g900">{grp.traits[0]}</p></div>
        <div className="rounded-xl bg-g50 px-4 py-3"><p className="mb-1 text-cap font-semibold text-g600">③ AI 재구성(참여자 간 공통점·차이 비교)</p><p className="text-b2 text-g900">{grp.summary}</p></div>
      </div>
    </div>
  )
}

export default function Step5() {
  const { state, setStep5pattern, setStep5qual } = useEval()
  const [part, setPart] = useState<(typeof PARTS)[number][0]>('pattern')

  return (
    <div>
      <PageHead step={5} title="인터뷰 분석 및 정성 퍼소나 검증">
        인터뷰 트랙은 연구자가 원문을 먼저 분석한 뒤, 그 결과 위에 AI가 참여자 간 공통점과 차이를 비교해 패턴을 재구성해요. 리뷰 트랙과 순서가 반대라는 점을 염두에 두고 봐 주세요.
      </PageHead>

      <Segmented label="세부 단계" items={PARTS.map((p) => p[0])} value={part} onChange={setPart} render={(v) => PARTS.find((p) => p[0] === v)![1]} />

      {part === 'pattern' && (
        <div className="mt-6">
          <Section title="그룹별 발화 → 1차 분석 → AI 재구성 예시">
            <div className="grid gap-4 sm:grid-cols-3">
              {QUAL_IDS.map((g) => <PatternExample key={g} g={g} />)}
            </div>
          </Section>
          <section className="mt-8 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
            <h2 className="pt-4 text-t1">5-1단계 평가</h2>
            <div className="max-w-3xl"><FieldList fields={STEP5_PATTERN_QS} get={(id) => state.step5pattern[id] ?? ''} set={setStep5pattern} /></div>
          </section>
        </div>
      )}

      {part === 'qual' && (
        <div className="mt-6">
          <Note label="안내">최종 인터뷰 기반 퍼소나 3개예요. 데이터 출처는 숨기지 않아요.</Note>
          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            {QUAL_IDS.map((p) => <FullPersonaCard key={p} id={p} />)}
          </div>
          <section className="mt-8 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
            <h2 className="pt-4 text-t1">5-2단계 평가</h2>
            <div className="max-w-3xl"><FieldList fields={STEP5_QUAL_QS} get={(id) => state.step5qual[id] ?? ''} set={setStep5qual} /></div>
          </section>
        </div>
      )}

      <StepNav prev="/step4" next="/step6" nextLabel="6단계: 두 퍼소나 비교로" />
    </div>
  )
}
