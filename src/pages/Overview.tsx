import { Link } from 'react-router-dom'
import { DATA_IDS, PAIR, PCOLOR, core, study } from '../lib/data'
import { useEval } from '../lib/evalStore'
import { NextStep, PersonaPill, Section } from '../components/ui'

const S = study.stats

function Lane({ title, steps }: { title: string; steps: { label: string; to: string; body: React.ReactNode }[] }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-slate">{title}</p>
      <ol className="grid gap-3 md:grid-cols-4">
        {steps.map((s, i) => (
          <li key={i} className="relative">
            <Link to={s.to} className="block h-full rounded-xl border border-rule bg-white p-4 hover:border-ink">
              <p className="mb-2 text-[0.8rem] text-slate">{s.label}</p>
              {s.body}
            </Link>
            {i < steps.length - 1 && <span aria-hidden className="absolute -right-2.5 top-1/2 hidden h-px w-2 bg-slate md:block" />}
          </li>
        ))}
      </ol>
    </div>
  )
}

function Num({ id, n, sub }: { id: string; n: number | string; sub?: string }) {
  return (
    <p className="flex items-baseline gap-2 leading-tight">
      <span className="inline-block h-2 w-2 translate-y-[-2px] rounded-full" style={{ background: PCOLOR[id] }} />
      <span className="font-serif text-[1.35rem] font-bold tabular-nums">{n}</span>
      {sub && <span className="text-[0.78rem] text-slate">{sub}</span>}
    </p>
  )
}

export default function Overview() {
  const { state, setEvaluator } = useEval()
  return (
    <div>
      <header className="mb-12 max-w-[52rem]">
        <p className="mb-3 text-sm text-slate">메디큐브 부스터프로 사용자 연구 · 전문가 검토용</p>
        <h1 className="font-serif text-[2.1rem] font-bold leading-[1.25] tracking-tight sm:text-[2.8rem]">
          리뷰 3,601건과 인터뷰 6명에서<br className="hidden sm:block" /> 퍼소나 6개가 나오기까지
        </h1>
        <p className="mt-5 max-w-prose2 text-[1.05rem] text-slate">
          이 사이트는 원자료부터 결과 퍼소나까지 도출 과정을 순서대로 보여줍니다. 각 단계를 보고 퍼소나가 근거에서 타당하게 나왔는지 평가해 주세요. 리뷰 원문은 수정하지 않았습니다.
        </p>
      </header>

      <Section title="도출 흐름" lead="각 칸을 누르면 해당 단계로 이동합니다. 숫자는 실제 건수입니다.">
        <div className="space-y-8">
          <Lane
            title="리뷰 데이터 → 데이터 퍼소나"
            steps={[
              { label: '1 리뷰 원자료', to: '/reviews', body: <p className="font-serif text-[1.35rem] font-bold">3,601건</p> },
              { label: '키워드 규칙으로 1차 분류 (중복 포함)', to: '/process', body: <div className="space-y-0.5">{DATA_IDS.map((p) => <Num key={p} id={p} n={S.keywordFlag[p]} sub={p} />)}</div> },
              { label: '재분류 후 퍼소나 적합', to: '/reviews', body: <div className="space-y-0.5">{DATA_IDS.map((p) => <Num key={p} id={p} n={S.reclass[p].counts.D} sub={p} />)}</div> },
              { label: '2 핵심 리뷰', to: '/core', body: <div className="space-y-0.5">{DATA_IDS.map((p) => <Num key={p} id={p} n={core[p].length} sub={p} />)}</div> },
            ]}
          />
          <Lane
            title="정성 인터뷰 → 정성 퍼소나"
            steps={[
              { label: '3 인터뷰 참여자', to: '/interviews', body: <p className="font-serif text-[1.35rem] font-bold">U1 ~ U6</p> },
              { label: '4 행동 변수', to: '/variables', body: <p className="text-[0.93rem]">공통 5개 + 신규 4개<br />그룹핑 패턴 6개</p> },
              { label: '그룹', to: '/variables', body: <p className="text-[0.93rem]">U1·U3·U6<br />U2·U4<br />U5</p> },
              { label: '5 결과 퍼소나', to: '/personas', body: <p className="text-[0.93rem]">메인 · S1 · S2</p> },
            ]}
          />
        </div>
      </Section>

      <Section title="비교하는 퍼소나 쌍" lead="데이터 퍼소나와 정성 퍼소나를 같은 색으로 짝지었습니다. 칠해진 표시가 데이터 퍼소나, 테두리 표시가 정성 퍼소나입니다.">
        <ul className="space-y-2.5">
          {DATA_IDS.map((p) => (
            <li key={p} className="flex flex-wrap items-center gap-2">
              <PersonaPill id={p} />
              <span aria-label="짝" className="text-slate">↔</span>
              <PersonaPill id={PAIR[p]} />
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-prose2 text-[0.9rem] text-slate">
          데이터 A와 정성 메인이 각 연구의 메인(Primary) 퍼소나입니다. 짝끼리 얼마나 일치하는지는 6단계에서 다룹니다.
        </p>
      </Section>

      <Section title="평가 방법" lead="평가는 이 브라우저에 자동 저장되고, 7단계에서 한 번에 제출합니다.">
        <ol className="max-w-prose2 list-decimal space-y-2 pl-5">
          <li>1~4단계에서 리뷰·인터뷰 원자료와 행동 변수를 확인합니다.</li>
          <li>2단계 핵심 리뷰마다 퍼소나 근거로 <b>적합</b>한지 <b>부적합</b>한지 표시합니다(선택).</li>
          <li>5·6단계에서 결과 퍼소나와 도출 과정을 확인하고, 7단계에서 퍼소나 6개를 4개 기준으로 평가합니다.</li>
        </ol>
        <div className="mt-6 max-w-md rounded-xl border border-rule bg-white p-4">
          <label htmlFor="ev" className="text-sm font-semibold">평가자 이름 또는 이니셜</label>
          <input id="ev" value={state.evaluator} onChange={(e) => setEvaluator(e.target.value)} placeholder="예: 김OO" className="mt-2 w-full rounded-md border border-rule px-3 py-2 outline-none focus:border-ink" />
          <p className="mt-2 text-[0.8rem] text-slate">여러 전문가의 응답을 구분하는 데만 씁니다.</p>
        </div>
      </Section>

      <NextStep to="/reviews" label="1 리뷰 데이터" />
    </div>
  )
}
