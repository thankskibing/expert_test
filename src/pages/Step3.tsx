import { DATA_IDS, PCOLOR, PNAME, core, method, study } from '../lib/data'
import { GROUP_DISCLAIMER, STEP3_QS } from '../lib/protocol'
import { useEval } from '../lib/evalStore'
import { FieldList } from '../components/form'
import { StepNav } from '../components/flow'
import { Badge, Note, PageHead, Section } from '../components/ui'

function TopicCard({ t }: { t: (typeof method.topics)[number] }) {
  return (
    <div className="rounded-2xl border border-g200 p-5">
      <p className="text-cap text-g500">Topic {t.no} · Proportion {(t.proportion * 100).toFixed(1)}% · Coherence {t.coherence.toFixed(2)}</p>
      <h3 className="mt-1 text-h3">{t.name}</h3>
      <p className="mt-2 flex flex-wrap gap-1.5">{t.keywords.map((k) => <Badge key={k}>{k}</Badge>)}</p>
      <p className="mt-3 text-b2 text-g700">{t.characteristic}</p>
      <ul className="mt-3 space-y-2">
        {t.comments.map((c) => <li key={c} className="rounded-xl bg-g50 px-3 py-2 text-b3 text-g700">“{c}”</li>)}
      </ul>
    </div>
  )
}

export default function Step3() {
  const { state, setStep3 } = useEval()
  const S = study.stats
  return (
    <div>
      <PageHead step={3} title="토픽 모델링 및 리뷰 분석 집단 구성 검증">
        리뷰 3,601건을 두 가지 다른 방식으로 분석했어요. 하나는 전체 리뷰에서 주제(토픽)를 찾는 LDA 토픽모델링이고, 다른 하나는 행동 변수를 기준으로 분석용 집단(A/B/C)을 구성하는 작업이에요. 이 둘은 서로 다른 분석이에요.
      </PageHead>

      <Section title="3-1. LDA 토픽모델링 결과" lead={method.coherenceNote}>
        <div className="grid gap-4 sm:grid-cols-2">
          {method.topics.map((t) => <TopicCard key={t.no} t={t} />)}
        </div>
      </Section>

      <Section title="3-2. 토픽과 리뷰 집단(A/B/C)은 다른 분석이에요">
        <Note label="핵심">{GROUP_DISCLAIMER} 위 4개 토픽은 리뷰 전체에서 주제를 찾은 것이고, 아래 A/B/C는 그 토픽 결과를 입력받은 AI가 정보 탐색/구매 결정 · 루틴/효과 인식 · 기능 활용/제어라는 행동 변수를 기준으로 구성한 분석용 집단이에요. 토픽은 '무엇에 대해 말하는지(내용)', 집단은 '어떻게 행동하는지(행동 패턴)'를 기준으로 나눈 거라 같은 리뷰라도 토픽은 하나, 집단은 중복으로 속할 수 있어요.</Note>
      </Section>

      <Section title="3-3. 리뷰 분석 집단(A/B/C) 구성 기준" lead={`단일 유형 분류 ${method.classification.singleTotal} · 복수 유형 분류 ${method.classification.multiTotal} · 하나 이상 근거가 확인된 데이터 ${method.classification.anyMatch}`}>
        <div className="space-y-4">
          {DATA_IDS.map((p) => {
            const g = study.dataGroups[p]
            const narr = method.groupNarratives[p]
            return (
              <div key={p} className="rounded-2xl border border-g200 p-5">
                <p className="mb-1 flex items-center gap-2 text-cap text-g500"><span className="h-2 w-2 rounded-full" style={{ background: PCOLOR[p] }} />{g.group} · 1차 분류 {g.count}건({g.share}) · 핵심 리뷰 {core[p].length}건 선정</p>
                <h3 className="text-h3">{PNAME[p]}</h3>
                <p className="mt-1 text-b3 text-g600">포함 키워드({S.keywordRules[p]}): {S.keywords[p].join(', ')}</p>
                <ul className="mt-3 flex flex-wrap gap-2 text-b3 text-g700">
                  {narr.flowSteps.map((s, i) => <li key={s} className="flex items-center gap-1.5"><span className="rounded-s bg-g50 px-2 py-1">{s}</span>{i < narr.flowSteps.length - 1 && <span className="text-g400">→</span>}</li>)}
                </ul>
                <p className="mt-3 rounded-xl bg-g50 px-4 py-3 text-b2 text-g900">{g.summary}</p>
                <p className="mt-2 text-b3 text-g600">이 집단에 필요한 경험: {narr.need}</p>
              </div>
            )
          })}
        </div>
        <p className="mt-4 max-w-prose2 text-b3 text-g600">집단 분류는 키워드로 1차 분류한 뒤, 사람이 원문을 다시 읽고 핵심 행동 변수가 실제로 드러나는지 맥락으로 판단했어요. 한 리뷰가 여러 집단에 중복으로 들어갈 수 있어요.</p>
      </Section>

      <section className="mt-8 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
        <h2 className="pt-4 text-t1">3단계 평가</h2>
        <div className="max-w-3xl"><FieldList fields={STEP3_QS} get={(id) => state.step3[id] ?? ''} set={setStep3} /></div>
      </section>

      <StepNav prev="/step2" next="/step4" nextLabel="4단계: 리뷰 기반 AI 분석·퍼소나 근거 검증으로" />
    </div>
  )
}
