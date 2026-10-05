import { Link } from 'react-router-dom'
import { CATS, DATA_IDS, PAIR, PCOLOR, PNAME, PSHORT, core, study, type Cat, type DataPid } from '../lib/data'
import { Note, PageHead, PersonaPill, Section } from '../components/ui'

const S = study.stats
// Toss bar-chart rule: grey bars by default, only the emphasised segment (퍼소나 적합) in brand blue. No axis lines.
const CATCOLOR: Record<Cat, string> = { D: '#3182F6', Q: '#8B95A1', N: '#F04452', X: '#D1D6DB', O: '#E5E8EB', R: '#FF9F2E' }

function DistBar({ p }: { p: DataPid }) {
  const r = S.reclass[p]
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="flex items-center gap-2 text-b2 font-semibold"><span className="h-2 w-2 rounded-full" style={{ background: PCOLOR[p] }} />{PSHORT[p]} · {PNAME[p]}</span>
        <span className="text-b3 text-g500 tabular">{r.n}건</span>
      </div>
      <div className="flex h-8 gap-0.5 overflow-hidden rounded-m" role="img" aria-label={`${PSHORT[p]} 재분류 분포`}>
        {CATS.filter((c) => r.counts[c.id]).map((c) => {
          const pct = r.counts[c.id] / r.n
          return (
            <div key={c.id} title={`${c.label} ${r.counts[c.id]}건`} className="flex items-center justify-center text-cap font-bold tabular"
              style={{ width: `${pct * 100}%`, background: CATCOLOR[c.id], color: c.id === 'X' || c.id === 'O' ? '#4E5968' : '#fff' }}>
              {pct > 0.07 ? `${Math.round(pct * 100)}%` : ''}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const rate = (p: DataPid, lv: 'Strong' | 'Supporting') => {
  const m = S.reclass[p].lv
  const tot = Object.entries(m).filter(([k]) => k.startsWith(lv + '|')).reduce((a, [, v]) => a + v, 0)
  const d = m[`${lv}|D`] ?? 0
  return { d, tot, pct: Math.round((d / tot) * 1000) / 10 }
}

const PAIRS: Record<DataPid, { same: string; diff: string; data: string; qual: string }> = {
  A: {
    same: '둘 다 기기를 정기 루틴 안에서 쓰고, 실제 사용 후 체감으로 효과를 판단해요.',
    diff: '기능을 쓰는 방식이 달라요. 데이터 Primary는 기능 활용 범위·개인화 수준이 낮은 쪽(그룹 1, 5칸 중 2번째)이고, 정성 Primary는 여러 모드 조합과 상황별 조절이 가장 높은 쪽(U1·U3)이에요.',
    data: '적합 리뷰는 272건이에요. 매일·꾸준한 루틴과 구체적인 효과가 함께 나오는 리뷰가 많아요.',
    qual: '정성 Primary와 닮은 행동(스킨케어 단계 병행, 피곤한 날 루틴 축소, 중요한 날 전 집중 관리)은 리뷰에서 48건이에요.',
  },
  B: {
    same: '둘 다 짧게 써보고 단정하지 않고, 일정 기간 써본 뒤 판단해요.',
    diff: '보는 축이 달라요. 데이터 Secondary 1은 구매 전 비교·검증이 핵심이고, 정성 Secondary 1은 구매 후 핵심 기능 1~2개로 정착해 오래 지켜보는 태도가 핵심이에요. U2·U4는 구매 전 탐색·검증 수준이 낮은 쪽이에요.',
    data: '적합 리뷰는 123건으로 1차 분류 902건의 13.6%예요. 무엇을 비교했는지까지 적은 리뷰는 적어요.',
    qual: '정성 Secondary 1과 닮은 행동(핵심 모드 위주로 정착, 효과가 약해도 계속 사용)은 리뷰에서 65건으로, 정성 유사 중 가장 많아요.',
  },
  C: {
    same: '둘 다 피부 상태·시간·부위 같은 상황에 맞춰 사용 방식을 조절해요.',
    diff: '기능 활용 범위가 정반대예요. 데이터 Secondary 2는 여러 모드를 함께 쓰는 쪽 끝이고, 정성 Secondary 2(U5)는 에어샷 하나에 집중하는 쪽 끝이에요.',
    data: '적합 리뷰는 111건이에요. 실제로 컨디션에 따라 모드·강도를 고른 리뷰는 전체에서 13건이고, 여러 모드를 이어 쓰거나 듀얼·앱을 조합한 리뷰가 대부분이에요.',
    qual: '정성 Secondary 2와 닮은 행동(필요할 때만 사용, 특정 기능 집중)은 리뷰에서 13건이에요.',
  },
}

export default function Process() {
  return (
    <div>
      <PageHead title="도출 과정과 교차 검증">
        데이터 퍼소나를 뒷받침하는 리뷰가 실제로 얼마나 되는지 다시 확인하고, 짝으로 묶은 정성 퍼소나와 어디가 같고 다른지 정리했어요. 이 페이지의 비교와 해석은 연구팀의 분석 메모예요.
      </PageHead>

      <Section title="데이터 퍼소나를 도출한 절차">
        <ol className="max-w-prose2 space-y-5">
          {[
            ['리뷰·댓글 3,601건 수집', '메디큐브 공식몰·네이버쇼핑 구매 리뷰와 유튜브 리뷰 영상 댓글이에요. 원문은 고치지 않았어요.'],
            ['키워드 규칙으로 1차 분류', '한 리뷰가 여러 퍼소나에 중복으로 들어갈 수 있어요.'],
            ['퍼소나 기준으로 한 건씩 재분류', '키워드가 아니라 각 퍼소나의 핵심 행동 변수가 원문에 실제로 드러나는지 보고, 6개 분류 중 하나로 판정했어요. 판단 이유는 리뷰 데이터 페이지에서 리뷰마다 볼 수 있어요.'],
            ['핵심 리뷰 선정', `퍼소나 적합 리뷰 중 행동 변수를 가장 많이 함께 보여주는 리뷰를 Primary ${core.A.length} · Secondary 1 ${core.B.length} · Secondary 2 ${core.C.length}건 골랐어요.`],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-weak text-cap font-bold text-brand">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="text-b2 font-bold text-g900">{t}</p>
                <p className="mt-0.5 text-b2 text-g600">{d}</p>
                {i === 1 && (
                  <div className="mt-3 space-y-2">
                    {DATA_IDS.map((p) => (
                      <div key={p} className="rounded-xl bg-g50 p-4 text-b3">
                        <p className="font-semibold text-g900"><span style={{ color: PCOLOR[p] }}>{PSHORT[p]}</span> · {S.keywordRules[p]} <span className="text-g500">→ {S.keywordFlag[p]}건</span></p>
                        <ul className="mt-1.5 space-y-0.5 text-g600">{S.keywords[p].map((k) => <li key={k}>{k}</li>)}</ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="재분류 결과: 키워드로 분류된 리뷰 중 실제 근거는 일부예요" lead="1차 분류된 리뷰가 재분류에서 어디로 갔는지 보여줘요. 파란색이 퍼소나 적합이에요.">
        <div className="max-w-3xl space-y-6">
          {DATA_IDS.map((p) => <DistBar key={p} p={p} />)}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-cap text-g600">
            {CATS.map((c) => <span key={c.id} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: CATCOLOR[c.id] }} />{c.label}</span>)}
          </div>
        </div>
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[32rem] max-w-3xl text-left text-b2">
            <thead className="text-b3 text-g600"><tr className="border-b border-g200"><th className="py-3 pr-6 font-semibold">퍼소나</th><th className="py-3 pr-6 font-semibold">Strong 중 적합</th><th className="py-3 pr-6 font-semibold">Supporting 중 적합</th><th className="py-3 font-semibold">플래그 밖에서 찾은 적합</th></tr></thead>
            <tbody className="divide-y divide-g200 tabular">
              {DATA_IDS.map((p) => {
                const s = rate(p, 'Strong'), u = rate(p, 'Supporting')
                return (
                  <tr key={p}>
                    <td className="py-3 pr-6 font-bold" style={{ color: PCOLOR[p] }}>{PSHORT[p]}</td>
                    <td className="py-3 pr-6">{s.d}/{s.tot} <span className="text-g500">({s.pct}%)</span></td>
                    <td className="py-3 pr-6">{u.d}/{u.tot} <span className="text-g500">({u.pct}%)</span></td>
                    <td className="py-3">{S.reclass[p].outside}건</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="mt-3 text-cap text-g500">Strong·Supporting은 키워드 규칙의 판정 수준이에요. 플래그 밖에서 찾은 적합 리뷰는 이 사이트의 퍼소나별 목록에 넣지 않았어요.</p>
        </div>
      </Section>

      <Section title="데이터 퍼소나와 정성 퍼소나 쌍 비교">
        <div className="space-y-4">
          {DATA_IDS.map((p) => (
            <div key={p} className="rounded-3xl bg-g50 p-6">
              <div className="mb-4 flex flex-wrap items-center gap-2"><PersonaPill id={p} /><span className="text-g400">↔</span><PersonaPill id={PAIR[p]} /></div>
              <dl className="grid gap-4 text-b2 md:grid-cols-2">
                <div className="rounded-xl bg-white p-4"><dt className="mb-1 font-bold text-g900">같은 점</dt><dd className="text-g800">{PAIRS[p].same}</dd></div>
                <div className="rounded-xl bg-white p-4"><dt className="mb-1 font-bold text-g900">다른 점</dt><dd className="text-g800">{PAIRS[p].diff}</dd></div>
                <div className="px-1"><dt className="mb-1 text-b3 font-semibold text-g600">리뷰에서 본 {PSHORT[p]}</dt><dd className="text-b3 text-g600">{PAIRS[p].data}</dd></div>
                <div className="px-1"><dt className="mb-1 text-b3 font-semibold text-g600">리뷰에서 본 짝 정성 퍼소나</dt><dd className="text-b3 text-g600">{PAIRS[p].qual}</dd></div>
              </dl>
              <p className="mt-4"><Link className="text-b3 font-semibold text-brand" to={`/personas?id=${p}`}>두 퍼소나 나란히 보기</Link></p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="두 결과가 다르게 나온 이유(분석 메모)">
        <ol className="max-w-prose2 space-y-4">
          {[
            ['리뷰는 구매 직후에 쓰여요.', '사용 초기임을 밝힌 리뷰가 608건, 몇 주 이상 장기 사용을 밝힌 리뷰가 141건이에요. 오래 쓰면서 생기는 행동(정성 Secondary 1의 장기 관찰, 정성 Secondary 2의 사용 축소)은 리뷰에 잘 드러나지 않아요.'],
            ['데이터 Primary의 루틴→효과 패턴은 일부만 확인돼요.', '1차 분류 824건 중 272건(33.0%)이 적합했고, 정성 퍼소나와 닮은 행동도 함께 나타나요.'],
            ['데이터 Secondary 1의 검증 행동은 약해요.', "'처음' 같은 단어나 할인·구매 맥락만으로 분류된 리뷰가 많아, 적합은 902건 중 123건(13.6%)이에요. '처음'만으로 분류된 리뷰가 202건이에요."],
            ['데이터 Secondary 2는 기능 평가와 제품명 때문에 부풀었어요.', "'모드가 다양해서 좋다'는 평가와 제품명 '부스터'(36건)가 키워드에 걸렸어요. 컨디션별 조절은 13건뿐이고, 오히려 핵심 모드 위주 사용(정성 Secondary 1과 비슷)이 보여요."],
            ['정성 퍼소나의 행동은 리뷰에 드물어요.', '정성 퍼소나와 닮은 리뷰는 3,601건 중 132건(3.7%)이에요.'],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-g100 text-cap font-bold text-g700">{i + 1}</span>
              <p className="text-b2 text-g800"><b className="text-g900">{t}</b> {d}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="확인이 필요한 점">
        <div className="max-w-prose2 space-y-2">
          <Note>기존 데이터 Secondary 2 그룹 자료의 대표 인용 3개 중 2개(#304, #2362)는 재분류에서 데이터 Secondary 2의 직접 근거가 아니었어요. #304는 기능 평가에 가까운 보조·맥락 근거이고, #2362는 앱 설정 때문에 듀얼 모드를 쓰지 않는 반례예요. <Link className="font-semibold text-brand" to="/variables">행동 변수·그룹에서 보기</Link></Note>
          <Note>데이터 Secondary 2의 Pain points와 Needs는 데이터 Primary와 문구가 같아요(원본 자료 기준). 데이터 Secondary 2만의 내용인지 검토가 필요해요.</Note>
        </div>
      </Section>
    </div>
  )
}
