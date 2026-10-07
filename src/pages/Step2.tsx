import { method } from '../lib/data'
import { STEP2_QS } from '../lib/protocol'
import { useEval } from '../lib/evalStore'
import { FieldList } from '../components/form'
import { StepNav } from '../components/flow'
import { PageHead, Section } from '../components/ui'

export default function Step2() {
  const { state, setStep2 } = useEval()
  const c = method.collection
  const p = method.preprocessing
  return (
    <div>
      <PageHead step={2} title="온라인 리뷰 데이터 수집·전처리 검증">
        퍼소나를 만들기 전, 리뷰 데이터를 어떤 기준으로 모으고 다듬었는지부터 확인해 주세요.
      </PageHead>

      <Section title="데이터 수집 기준" lead={`수집 기간: ${c.period} · 커머스 리뷰는 ${c.reviewPeriod} · 유튜브는 ${c.youtubeCriteria}`}>
        <p className="max-w-prose2 text-b2 text-g700">검색 키워드: {c.keywords.join(', ')}</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-b2">
            <thead className="text-b3 text-g600"><tr className="border-b border-g200"><th className="py-2 pr-4 font-semibold">제품</th><th className="py-2 pr-4 font-semibold">커머스 리뷰</th><th className="py-2 pr-4 font-semibold">유튜브 댓글</th><th className="py-2 font-semibold">합계</th></tr></thead>
            <tbody className="divide-y divide-g200">
              {c.initialTable.map((r) => (
                <tr key={r.product}><td className="py-2 pr-4 text-g900">{r.product}</td><td className="py-2 pr-4 text-g700">{r.commerce}</td><td className="py-2 pr-4 text-g700">{r.youtube}</td><td className="py-2 tabular text-g900">{r.total}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="왜 국내 메디큐브 부스터프로로 범위를 좁혔나요" lead={c.initialScope}>
        <p className="max-w-prose2 rounded-xl bg-g50 px-4 py-3 text-b2 text-g900">{c.narrowReason}</p>
      </Section>

      <Section title="텍스트 전처리" lead="분석 정확도를 높이기 위해 거친 네 단계예요.">
        <ol className="max-w-prose2 space-y-2.5">
          {p.steps.map((s, i) => (
            <li key={s} className="flex gap-3 text-b2 text-g800">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-weak text-cap font-bold text-brand">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        <details className="group mt-5 max-w-prose2">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-b2 font-semibold text-g700 hover:text-g900">
            전처리 규칙 자세히 보기 <span className="transition-transform duration-200 group-open:rotate-180" aria-hidden>⌄</span>
          </summary>
          <div className="mt-3 overflow-x-auto rounded-xl border border-g200">
            <table className="w-full text-left text-b2">
              <thead className="bg-g50 text-b3 text-g600"><tr><th className="px-4 py-2 font-semibold">구분</th><th className="px-4 py-2 font-semibold">예시</th></tr></thead>
              <tbody className="divide-y divide-g200">
                {p.table.map((r) => <tr key={r.cat}><td className="px-4 py-2 font-semibold text-g900">{r.cat}</td><td className="px-4 py-2 text-g700">{r.example}</td></tr>)}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-b3 text-g600 tabular">형태소 결합 처리 {p.counts.nouns}개 고유명사·복합어, 재결합 규칙 {p.counts.rules}개 · 기본 불용어 {p.counts.stopwords}개 + 추가 불용어 {p.counts.extraStopwords}개 제거</p>
        </details>
      </Section>

      <section className="mt-8 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
        <h2 className="pt-4 text-t1">2단계 평가</h2>
        <div className="max-w-3xl"><FieldList fields={STEP2_QS} get={(id) => state.step2[id] ?? ''} set={setStep2} /></div>
      </section>

      <StepNav prev="/step1" next="/step3" nextLabel="3단계: 토픽·리뷰 집단 구성 검증으로" />
    </div>
  )
}
