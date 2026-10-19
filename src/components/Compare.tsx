import { Link } from 'react-router-dom'
import { DATA_IDS, PAIR, type DataPid } from '../lib/data'
import { PersonaPill } from './ui'

/** 쌍을 어떤 기준으로 묶었는지(순위 기준) 비교 화면마다 같은 문장으로 밝힌다. */
export const PAIR_NOTE = '두 트랙의 퍼소나는 각 트랙 안의 순위(Primary↔Primary, Secondary 1↔Secondary 1, Secondary 2↔Secondary 2)로 짝을 지었어요. 행동이 비슷한 것끼리 묶은 것이 아니어서, 쌍에 따라 같은 점보다 다른 점이 더 클 수 있어요.'

/** 쌍 비교 내용(연구팀 분석 메모). Process 페이지와 6단계 비교 화면이 같은 내용을 쓴다. */
export const PAIRS: Record<DataPid, { same: string; diff: string; data: string; qual: string }> = {
  A: {
    same: '둘 다 기기를 정기 루틴 안에서 쓰고, 실제 사용 후 체감으로 효과를 판단해요.',
    diff: '기능을 쓰는 방식이 달라요. 리뷰 기반 Primary는 기능 활용 범위·개인화 수준이 낮은 쪽(5칸 척도 중 2번째)이고, 인터뷰 기반 Primary는 여러 모드 조합과 상황별 조절이 가장 높은 쪽(U1·U3)이에요.',
    data: '적합 리뷰는 272건이에요. 매일·꾸준한 루틴과 구체적인 효과가 함께 나오는 리뷰가 많아요.',
    qual: '인터뷰 기반 Primary와 닮은 행동(스킨케어 단계 병행, 피곤한 날 루틴 축소, 중요한 날 전 집중 관리)은 리뷰에서 48건이에요.',
  },
  B: {
    same: '둘 다 짧게 써보고 단정하지 않고, 일정 기간 써본 뒤 판단해요.',
    diff: '보는 축이 달라요. 리뷰 기반 Secondary 1은 구매 전 비교·검증이 핵심이고, 인터뷰 기반 Secondary 1은 구매 후 핵심 기능 1~2개로 정착해 오래 지켜보는 태도가 핵심이에요. U2·U4는 구매 전 탐색·검증 수준이 낮은 쪽이에요.',
    data: '적합 리뷰는 123건으로 1차 분류 902건의 13.6%예요. 무엇을 비교했는지까지 적은 리뷰는 적어요.',
    qual: '인터뷰 기반 Secondary 1과 닮은 행동(핵심 모드 위주로 정착, 효과가 약해도 계속 사용)은 리뷰에서 65건으로, 인터뷰 기반 퍼소나 유사 리뷰 중 가장 많아요.',
  },
  C: {
    same: '둘 다 피부 상태·시간·부위 같은 상황에 맞춰 사용 방식을 조절해요.',
    diff: '기능 활용 범위가 정반대예요. 리뷰 기반 Secondary 2는 여러 모드를 함께 쓰는 쪽 끝이고, 인터뷰 기반 Secondary 2(U5)는 에어샷 하나에 집중하는 쪽 끝이에요.',
    data: '적합 리뷰는 111건이에요. 실제로 컨디션에 따라 모드·강도를 고른 리뷰는 전체에서 13건이고, 여러 모드를 이어 쓰거나 듀얼·앱을 조합한 리뷰가 대부분이에요.',
    qual: '인터뷰 기반 Secondary 2와 닮은 행동(필요할 때만 사용, 특정 기능 집중)은 리뷰에서 13건이에요.',
  },
}

export const MEMO: [string, string][] = [
  ['리뷰는 구매 직후에 쓰여요.', '사용 초기임을 밝힌 리뷰가 608건, 몇 주 이상 장기 사용을 밝힌 리뷰가 141건이에요. 오래 쓰면서 생기는 행동(인터뷰 기반 Secondary 1의 장기 관찰, 인터뷰 기반 Secondary 2의 사용 축소)은 리뷰에 잘 드러나지 않아요.'],
  ['리뷰 기반 Primary의 루틴→효과 패턴은 일부만 확인돼요.', '1차 분류 824건 중 272건(33.0%)이 적합했고, 인터뷰 기반 퍼소나와 닮은 행동도 함께 나타나요.'],
  ['리뷰 기반 Secondary 1의 검증 행동은 약해요.', "'처음' 같은 단어나 할인·구매 맥락만으로 분류된 리뷰가 많아, 적합은 902건 중 123건(13.6%)이에요. '처음'만으로 분류된 리뷰가 202건이에요."],
  ['리뷰 기반 Secondary 2는 기능 평가와 제품명 때문에 부풀었어요.', "'모드가 다양해서 좋다'는 평가와 제품명 '부스터'(36건)가 키워드에 걸렸어요. 컨디션별 조절은 13건뿐이고, 오히려 핵심 모드 위주 사용(인터뷰 기반 Secondary 1과 비슷)이 보여요."],
  ['인터뷰 기반 퍼소나의 행동은 리뷰에 드물어요.', '인터뷰 기반 퍼소나와 닮은 리뷰는 3,601건 중 132건(3.7%)이에요.'],
]

export function ComparePairs({ only }: { only?: DataPid }) {
  const ids = only ? [only] : DATA_IDS
  return (
    <div className="space-y-4">
      {ids.map((p) => (
        <div key={p} className="rounded-3xl bg-g50 p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2"><PersonaPill id={p} /><span className="text-g400">↔</span><PersonaPill id={PAIR[p]} /></div>
          <dl className="grid gap-4 text-b2 md:grid-cols-2">
            <div className="rounded-xl bg-white p-4"><dt className="mb-1 font-bold text-g900">같은 점</dt><dd className="text-g800">{PAIRS[p].same}</dd></div>
            <div className="rounded-xl bg-white p-4"><dt className="mb-1 font-bold text-g900">다른 점</dt><dd className="text-g800">{PAIRS[p].diff}</dd></div>
            <div className="px-1"><dt className="mb-1 text-b3 font-semibold text-g600">리뷰에서 본 리뷰 기반 퍼소나</dt><dd className="text-b3 text-g600">{PAIRS[p].data}</dd></div>
            <div className="px-1"><dt className="mb-1 text-b3 font-semibold text-g600">리뷰에서 본 짝 인터뷰 기반 퍼소나</dt><dd className="text-b3 text-g600">{PAIRS[p].qual}</dd></div>
          </dl>
          <p className="mt-4"><Link className="text-b3 font-semibold text-brand" to={`/personas?id=${p}`}>두 퍼소나 나란히 보기</Link></p>
        </div>
      ))}
    </div>
  )
}

export function CompareMemo() {
  return (
    <ol className="max-w-prose2 space-y-4">
      {MEMO.map(([t, d], i) => (
        <li key={t} className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-g100 text-cap font-bold text-g700">{i + 1}</span>
          <p className="text-b2 text-g800"><b className="text-g900">{t}</b> {d}</p>
        </li>
      ))}
    </ol>
  )
}
