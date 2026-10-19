import { CATS, DATA_IDS, PCOLOR, PNAME, PSHORT, core, method, study, type Cat, type DataPid } from '../lib/data'
import { PageHead, Section } from '../components/ui'

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

export default function Process() {
  return (
    <div>
      <PageHead title="도출 과정과 재분류 결과">
        리뷰 기반 퍼소나를 어떤 절차로 도출했는지, 그리고 키워드로 1차 분류된 리뷰 중 실제 근거가 되는 리뷰가 얼마나 되는지 정리했어요.
      </PageHead>

      <Section title="리뷰 기반 퍼소나를 도출한 절차">
        <ol className="max-w-prose2 space-y-5">
          {[
            ['분석 대상 리뷰·댓글 3,601건', '메디큐브 공식몰·네이버쇼핑 구매 리뷰와 유튜브 리뷰 영상 댓글을 수집(4,060건)하고 전처리한 분석 대상이에요. 이 사이트에 보이는 리뷰 문장은 전처리 전 원문 그대로예요.'],
            ['키워드 규칙으로 1차 분류', `한 리뷰가 여러 퍼소나에 중복으로 들어갈 수 있어요. 3,601건 중 ${method.classification.anyMatch}이 하나 이상의 유형에 해당했고, 중복을 포함하면 ${method.classification.dupTotals.replace('중복 포함 시 ', '')}이에요.`],
            ['퍼소나 기준으로 한 건씩 재분류', '연구자가 AI가 제시한 근거 원문 일부를 검토한 뒤, 키워드가 아니라 각 퍼소나의 핵심 행동 변수가 원문에 실제로 드러나는지를 기준으로 AI가 6개 범주 중 하나로 최종 판정했어요. 판단 이유는 리뷰 데이터 페이지에서 리뷰마다 볼 수 있어요.'],
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
    </div>
  )
}
