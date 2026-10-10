import { method } from '../lib/data'
import { STEP3_QS } from '../lib/protocol'
import { useEval } from '../lib/evalStore'
import { FieldList } from '../components/form'
import { StepNav } from '../components/flow'
import { Badge, PageHead, Section } from '../components/ui'

function TopicCard({ t }: { t: (typeof method.topics)[number] }) {
  return (
    <div className="grid grid-rows-subgrid row-span-4 rounded-2xl border border-g200 p-5">
      <div>
        <p className="text-cap text-g500">Topic {t.no} · Proportion {(t.proportion * 100).toFixed(1)}% · Coherence {t.coherence.toFixed(2)}</p>
        <h3 className="mt-1 text-h3">{t.name}</h3>
      </div>
      <p className="mt-2 flex flex-wrap content-start gap-1.5">{t.keywords.map((k) => <Badge key={k}>{k}</Badge>)}</p>
      <p className="mt-3 text-b2 text-g700">{t.characteristic}</p>
      <ul className="mt-3 space-y-2 content-start">
        {t.comments.map((c) => <li key={c} className="rounded-xl bg-g50 px-3 py-2 text-b3 text-g700">“{c}”</li>)}
      </ul>
    </div>
  )
}

export default function Step3() {
  const { state, setStep3 } = useEval()
  return (
    <div>
      <PageHead step={3} title="토픽 모델링 검증">
        리뷰 3,601건 전체에서 LDA 토픽모델링으로 주제(토픽)를 찾았어요. 아래 결과가 리뷰 내용을 잘 설명하는지 확인해 주세요.
      </PageHead>

      <Section title="LDA 토픽모델링 결과" lead={method.coherenceNote}>
        <details className="group mb-5 max-w-prose2">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-b2 font-semibold text-g700 hover:text-g900">
            토픽 LDA 모델이란? <span className="transition-transform duration-200 group-open:rotate-180" aria-hidden>⌄</span>
          </summary>
          <div className="mt-3 space-y-2.5 rounded-xl bg-g50 px-4 py-3 text-b2 text-g800">
            <p>LDA(토픽모델링)는 사람이 미리 주제를 정해두지 않아도, 글 속에서 어떤 단어들이 자주 함께 쓰이는지를 보고 숨어 있는 주제(토픽)를 찾아내는 통계 기법이에요.</p>
            <p>비유하면 스무디예요. 완성된 스무디(리뷰)에서는 맛(단어)만 보이고 딸기·바나나가 각각 얼마나 들어갔는지(토픽 비중)는 보이지 않죠. LDA는 그 맛을 거꾸로 분석해서 "이 리뷰는 토픽1이 60%, 토픽2가 40%일 것"이라고 추정하는 방법이에요.</p>
            <p>그 결과로 ① 리뷰 하나하나가 어떤 토픽을 얼마나 섞어 쓰는지, ② 각 토픽에 어떤 단어가 몰려 있는지 두 가지를 얻을 수 있어요. 토픽의 이름(예: 입문/효과/기능/루틴)은 알고리즘이 정해주지 않아서, 연구자가 키워드를 보고 직접 붙였어요.</p>
          </div>
        </details>
        <div className="grid grid-rows-[auto_auto_auto_auto] gap-x-4 gap-y-4 sm:grid-cols-2">
          {method.topics.map((t) => <TopicCard key={t.no} t={t} />)}
        </div>
      </Section>

      <section className="mt-8 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
        <h2 className="pt-4 text-t1">3단계 평가</h2>
        <div className="max-w-3xl"><FieldList fields={STEP3_QS} get={(id) => state.step3[id] ?? ''} set={setStep3} /></div>
      </section>

      <StepNav prev="/step2" next="/step4" nextLabel="4단계: 리뷰 기반 AI 분석·퍼소나 근거 검증으로" />
    </div>
  )
}
