import { DATA_IDS, PAIR, core, type DataPid } from '../lib/data'
import { STEP6_QS } from '../lib/protocol'
import { useEval } from '../lib/evalStore'
import { FieldList } from '../components/form'
import { FullPersonaPair } from '../components/PersonaCard'
import { StepNav } from '../components/flow'
import { PageHead, PersonaPill } from '../components/ui'

const PAIRS: Record<DataPid, { same: string; diff: string; data: string; qual: string }> = {
  A: {
    same: '둘 다 기기를 정기 루틴 안에서 쓰고, 실제 사용 후 체감으로 효과를 판단해요.',
    diff: '기능을 쓰는 방식이 달라요. 데이터 Primary는 기능 활용 범위·개인화 수준이 낮은 쪽이고, 정성 Primary는 여러 모드 조합과 상황별 조절이 가장 높은 쪽이에요.',
    data: '적합 리뷰는 272건이에요. 매일·꾸준한 루틴과 구체적인 효과가 함께 나오는 리뷰가 많아요.',
    qual: '정성 Primary와 닮은 행동(스킨케어 단계 병행, 피곤한 날 루틴 축소, 중요한 날 전 집중 관리)은 리뷰에서 48건이에요.',
  },
  B: {
    same: '둘 다 짧게 써보고 단정하지 않고, 일정 기간 써본 뒤 판단해요.',
    diff: '보는 축이 달라요. 데이터 Secondary 1은 구매 전 비교·검증이 핵심이고, 정성 Secondary 1은 구매 후 핵심 기능 1~2개로 정착해 오래 지켜보는 태도가 핵심이에요.',
    data: '적합 리뷰는 123건(1차 분류 902건의 13.6%)이에요. 무엇을 비교했는지까지 적은 리뷰는 적어요.',
    qual: '정성 Secondary 1과 닮은 행동(핵심 모드 위주로 정착, 효과가 약해도 계속 사용)은 리뷰에서 65건으로, 정성 유사 중 가장 많아요.',
  },
  C: {
    same: '둘 다 피부 상태·시간·부위 같은 상황에 맞춰 사용 방식을 조절해요.',
    diff: '기능 활용 범위가 정반대예요. 데이터 Secondary 2는 여러 모드를 함께 쓰는 쪽 끝이고, 정성 Secondary 2는 에어샷 하나에 집중하는 쪽 끝이에요.',
    data: '적합 리뷰는 111건이에요. 컨디션에 따라 모드·강도를 고른 리뷰는 13건이고, 여러 모드를 이어 쓰거나 듀얼·앱을 조합한 리뷰가 대부분이에요.',
    qual: '정성 Secondary 2와 닮은 행동(필요할 때만 사용, 특정 기능 집중)은 리뷰에서 13건이에요.',
  },
}

export default function Step6() {
  const { state, setStep6 } = useEval()
  return (
    <div>
      <PageHead step={6} title="리뷰 기반 퍼소나와 인터뷰 기반 퍼소나 비교">
        같은 역할(Primary/Secondary)로 짝지은 두 퍼소나를 나란히 놓고, 공통점과 차이점을 확인해 주세요.
      </PageHead>

      <div className="space-y-8">
        {DATA_IDS.map((p) => {
          const q = PAIR[p]
          return (
            <div key={p} className="border-t border-g200 pt-6 first:border-0 first:pt-0">
              <div className="mb-3 flex flex-wrap items-center gap-2"><PersonaPill id={p} /><span className="text-g400">↔</span><PersonaPill id={q} /></div>
              <FullPersonaPair aId={p} bId={q} />
              <dl className="mt-4 grid gap-3 text-b2 md:grid-cols-2 md:items-stretch">
                <div className="rounded-xl bg-g50 p-4"><dt className="mb-1 font-bold text-g900">공통점</dt><dd className="text-g800">{PAIRS[p].same}</dd></div>
                <div className="rounded-xl bg-g50 p-4"><dt className="mb-1 font-bold text-g900">차이점</dt><dd className="text-g800">{PAIRS[p].diff}</dd></div>
                <div className="px-1"><dt className="mb-1 text-b3 font-semibold text-g600">리뷰에서 본 {p}</dt><dd className="text-b3 text-g600">{PAIRS[p].data} (핵심 리뷰 {core[p].length}건)</dd></div>
                <div className="px-1"><dt className="mb-1 text-b3 font-semibold text-g600">리뷰에서 본 짝 정성 퍼소나</dt><dd className="text-b3 text-g600">{PAIRS[p].qual}</dd></div>
              </dl>
            </div>
          )
        })}
      </div>

      <section className="mt-8 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
        <h2 className="pt-4 text-t1">6단계 평가</h2>
        <div className="max-w-3xl"><FieldList fields={STEP6_QS} get={(id) => state.step6[id] ?? ''} set={setStep6} /></div>
      </section>

      <StepNav prev="/step5" next="/step7" nextLabel="7단계: 최종 퍼소나 품질 평가로" />
    </div>
  )
}
