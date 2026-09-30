import { Link } from 'react-router-dom'
import { CATS, DATA_IDS, PAIR, PCOLOR, PNAME, core, study, type Cat, type DataPid } from '../lib/data'
import { NextStep, Note, PageHead, PersonaPill, Section } from '../components/ui'

const S = study.stats
const CATCOLOR: Record<Cat, string> = { D: '#1B2230', Q: '#7B61C9', N: '#E0533F', X: '#B9C0CC', O: '#E4E7EC', R: '#D9A21B' }

function DistBar({ p }: { p: DataPid }) {
  const r = S.reclass[p]
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-[0.88rem]">
        <span className="flex items-center gap-2 font-semibold"><span className="h-2.5 w-2.5 rounded-full" style={{ background: PCOLOR[p] }} />{p} {PNAME[p]}</span>
        <span className="tabular-nums text-slate">{r.n}건</span>
      </div>
      <div className="flex h-7 overflow-hidden rounded-md" role="img" aria-label={`${p} 재분류 분포`}>
        {CATS.filter((c) => r.counts[c.id]).map((c) => (
          <div key={c.id} title={`${c.label} ${r.counts[c.id]}건`} className="flex items-center justify-center text-[0.72rem] font-semibold"
            style={{ width: `${(r.counts[c.id] / r.n) * 100}%`, background: CATCOLOR[c.id], color: c.id === 'D' || c.id === 'Q' || c.id === 'N' ? '#fff' : '#1B2230' }}>
            {r.counts[c.id] / r.n > 0.06 ? `${Math.round((r.counts[c.id] / r.n) * 100)}%` : ''}
          </div>
        ))}
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
    same: '둘 다 기기를 정기 루틴 안에서 쓰고, 실제 사용 후 체감으로 효과를 판단한다.',
    diff: '기능 쓰는 방식이 다르다. 데이터 A는 기능 활용 범위·개인화 수준이 낮은 쪽(그룹 1, 5칸 중 2번째)인 반면, 정성 메인은 다수 모드 조합과 상황별 조절이 가장 높은 쪽(U1·U3)이다.',
    data: '적합 리뷰 272건. 리뷰에 매일·꾸준 루틴과 구체적 효과가 함께 나오는 경우가 많다.',
    qual: '리뷰 중 정성 메인과 닮은 행동(스킨케어 단계 병행, 피곤한 날 루틴 축소, 중요한 날 전 집중 관리)은 48건.',
  },
  B: {
    same: '둘 다 짧은 사용으로 단정하지 않고 일정 기간 써본 뒤 판단한다.',
    diff: '보는 축이 다르다. 데이터 B는 구매 전 비교·검증이 핵심인 반면, 정성 S1은 구매 후 핵심 기능 1~2개로 정착해 장기 관찰하는 태도가 핵심이다. U2·U4는 구매 전 탐색/검증 수준이 낮은 쪽이다.',
    data: '적합 리뷰 123건(1차 분류 902건의 13.6%). 무엇을 비교했는지까지 적은 리뷰는 적다.',
    qual: '리뷰 중 정성 S1과 닮은 행동(핵심 모드 위주 정착, 효과가 약해도 계속 사용)은 65건으로 정성 유사 중 가장 많다.',
  },
  C: {
    same: '둘 다 피부 상태·시간·부위 같은 상황에 맞춰 사용 방식을 조절한다.',
    diff: '기능 활용 범위가 정반대다. 데이터 C는 여러 모드를 복합 활용하는 쪽 끝, 정성 S2(U5)는 에어샷 하나에 집중하는 쪽 끝이다.',
    data: '적합 리뷰 111건. 실제로 컨디션에 따라 모드·강도를 고른 리뷰는 전체에서 13건이고, 여러 모드를 이어 쓰거나 듀얼·앱을 조합한 리뷰가 대부분이다.',
    qual: '리뷰 중 정성 S2와 닮은 행동(필요할 때만 사용, 특정 기능 집중)은 13건.',
  },
}

export default function Process() {
  return (
    <div>
      <PageHead step={6} title="도출 과정과 교차 검증">
        데이터 퍼소나를 뒷받침하는 리뷰가 실제로 얼마나 되는지 다시 확인하고, 같은 짝으로 묶인 정성 퍼소나와 어디가 같고 다른지 정리했습니다. 이 페이지의 비교와 해석은 연구팀의 분석 메모로, 평가 대상입니다.
      </PageHead>

      <Section title="데이터 퍼소나를 도출한 절차">
        <ol className="max-w-prose2 space-y-4">
          <li><p className="font-semibold">1. 리뷰·댓글 3,601건 수집</p><p className="text-slate">부스터프로 구매평과 리뷰 영상 댓글입니다. 원문은 수정하지 않았습니다.</p></li>
          <li>
            <p className="font-semibold">2. 키워드 규칙으로 1차 분류 (한 리뷰가 여러 퍼소나에 중복 가능)</p>
            <div className="mt-2 space-y-3">
              {DATA_IDS.map((p) => (
                <div key={p} className="rounded-lg border border-rule bg-white p-3 text-[0.88rem]">
                  <p className="font-semibold"><span style={{ color: PCOLOR[p] }}>{p}</span> {S.keywordRules[p]} → {S.keywordFlag[p]}건</p>
                  <ul className="mt-1 text-slate">{S.keywords[p].map((k) => <li key={k}>{k}</li>)}</ul>
                </div>
              ))}
            </div>
          </li>
          <li><p className="font-semibold">3. 퍼소나 기준으로 한 건씩 재분류</p><p className="text-slate">키워드가 아니라 각 퍼소나의 핵심 행동 변수가 원문에 실제로 드러나는지로 6개 분류 중 하나를 매겼습니다. 판단 이유는 1단계 리뷰 데이터에서 리뷰마다 볼 수 있습니다.</p></li>
          <li><p className="font-semibold">4. 핵심 리뷰 선정</p><p className="text-slate">퍼소나 적합 리뷰 중 행동 변수를 가장 많이 동시에 보여주는 리뷰를 A {core.A.length} · B {core.B.length} · C {core.C.length}건 골랐습니다.</p></li>
        </ol>
      </Section>

      <Section title="재분류 결과: 키워드로 분류된 리뷰 중 실제 근거는 일부" lead="막대는 1차 분류 리뷰가 재분류에서 어디로 갔는지 보여줍니다. 짙은 색이 퍼소나 적합입니다.">
        <div className="max-w-3xl space-y-5">
          {DATA_IDS.map((p) => <DistBar key={p} p={p} />)}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.8rem] text-slate">
            {CATS.map((c) => <span key={c.id} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: CATCOLOR[c.id] }} />{c.label}</span>)}
          </div>
        </div>
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-[32rem] text-left text-[0.9rem]">
            <thead className="text-[0.8rem] text-slate"><tr><th className="py-2 pr-6">퍼소나</th><th className="py-2 pr-6">Strong 중 적합</th><th className="py-2 pr-6">Supporting 중 적합</th><th className="py-2">플래그 밖에서 찾은 적합</th></tr></thead>
            <tbody className="divide-y divide-rule border-t border-rule">
              {DATA_IDS.map((p) => {
                const s = rate(p, 'Strong'), u = rate(p, 'Supporting')
                return (
                  <tr key={p}>
                    <td className="py-2 pr-6 font-semibold" style={{ color: PCOLOR[p] }}>{p}</td>
                    <td className="py-2 pr-6 tabular-nums">{s.d}/{s.tot} ({s.pct}%)</td>
                    <td className="py-2 pr-6 tabular-nums">{u.d}/{u.tot} ({u.pct}%)</td>
                    <td className="py-2 tabular-nums">{S.reclass[p].outside}건</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="mt-2 text-[0.8rem] text-slate">Strong·Supporting은 키워드 규칙의 판정 수준입니다. 플래그 밖 적합 리뷰는 이 사이트의 퍼소나별 목록에 넣지 않았습니다.</p>
        </div>
      </Section>

      <Section title="데이터 퍼소나와 정성 퍼소나 쌍 비교">
        <div className="space-y-5">
          {DATA_IDS.map((p) => (
            <div key={p} className="rounded-xl border border-rule bg-white p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2"><PersonaPill id={p} /><span className="text-slate">·</span><PersonaPill id={PAIR[p]} /></div>
              <dl className="grid gap-3 text-[0.92rem] md:grid-cols-2">
                <div><dt className="font-semibold">같은 점</dt><dd>{PAIRS[p].same}</dd></div>
                <div><dt className="font-semibold">다른 점</dt><dd>{PAIRS[p].diff}</dd></div>
                <div><dt className="font-semibold text-slate">리뷰에서 본 {p}</dt><dd className="text-slate">{PAIRS[p].data}</dd></div>
                <div><dt className="font-semibold text-slate">리뷰에서 본 짝 정성 퍼소나</dt><dd className="text-slate">{PAIRS[p].qual}</dd></div>
              </dl>
              <p className="mt-3 text-[0.85rem]"><Link className="underline" to={`/personas?id=${p}`}>두 퍼소나 나란히 확인</Link></p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="두 결과가 다르게 나온 이유 (분석 메모)">
        <ol className="max-w-prose2 list-decimal space-y-3 pl-5">
          <li><b>리뷰는 구매 직후에 쓰인다.</b> 사용 초기임을 밝힌 리뷰가 608건, 몇 주 이상 장기 사용을 밝힌 리뷰가 141건입니다. 장기 사용에서 나오는 행동(S1의 장기 관찰, S2의 사용 축소)은 리뷰에 드러나기 어렵습니다.</li>
          <li><b>A의 루틴→효과 패턴은 일부만 확인된다.</b> 1차 분류 824건 중 272건(33.0%)이 적합했고, 정성 퍼소나와 닮은 행동도 함께 나타납니다.</li>
          <li><b>B의 검증 행동은 약하다.</b> ‘처음’ 같은 단어나 할인·구매 맥락만으로 분류된 리뷰가 많아, 적합은 902건 중 123건(13.6%)입니다. ‘처음’만으로 분류된 리뷰가 202건입니다.</li>
          <li><b>C는 기능 평가와 제품명에 부풀려졌다.</b> ‘모드가 다양해서 좋다’는 평가와 제품명 ‘부스터’(36건)가 키워드에 걸렸습니다. 컨디션별 조절은 13건뿐이고, 오히려 핵심 모드 위주 사용(정성 S1과 유사)이 보입니다.</li>
          <li><b>정성 퍼소나의 행동은 리뷰에 드물다.</b> 정성 퍼소나와 닮은 리뷰는 3,601건 중 132건(3.7%)입니다.</li>
        </ol>
      </Section>

      <Section title="확인이 필요한 점">
        <div className="max-w-prose2 space-y-3">
          <Note>기존 C 그룹 자료의 대표 인용 3개 중 2개(#304, #2362)는 재분류에서 C의 직접 근거가 아니었습니다. #304는 기능 평가에 가까운 보조·맥락 근거, #2362는 듀얼 모드를 앱 설정 때문에 쓰지 않는 반례입니다. <Link className="underline" to="/variables">4단계에서 확인</Link></Note>
          <Note>데이터 퍼소나 C의 Pain points와 Needs는 데이터 퍼소나 A와 문구가 같습니다(원본 자료 기준). C 고유의 내용인지 검토가 필요합니다.</Note>
        </div>
      </Section>
      <NextStep to="/evaluate" label="7 평가하기" />
    </div>
  )
}
