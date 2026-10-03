import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { DATA_IDS, PAIR, PCOLOR, core, study } from '../lib/data'
import { useEval } from '../lib/evalStore'
import { NextStep, PersonaPill, Section, TextField } from '../components/ui'

const S = study.stats

function Lane({ title, steps }: { title: string; steps: { label: string; to: string; body: ReactNode }[] }) {
  return (
    <div>
      <p className="mb-3 text-b2 font-semibold text-g700">{title}</p>
      <ol className="grid gap-2 md:grid-cols-4">
        {steps.map((s, i) => (
          <li key={i}>
            <Link to={s.to} className="flex h-full flex-col rounded-xl border border-g200 bg-white p-5 transition-shadow duration-200 hover:shadow-e1">
              <p className="mb-3 text-b3 text-g600">{s.label}</p>
              {s.body}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Num({ id, n }: { id: string; n: number | string }) {
  return (
    <p className="flex items-center gap-2 leading-tight">
      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-s px-1 text-[11px] font-bold text-white" style={{ background: PCOLOR[id] }}>{id}</span>
      <span className="text-[22px] font-bold tabular">{n}</span>
      <span className="text-b3 text-g500">건</span>
    </p>
  )
}

export default function Overview() {
  const { state, setEvaluator } = useEval()
  return (
    <div>
      <header className="mb-12 max-w-[52rem]">
        <p className="mb-3 text-b3 font-semibold text-brand">메디큐브 부스터프로 사용자 연구 · 전문가 평가</p>
        <h1 className="text-[30px] font-bold leading-[1.3] sm:text-display">
          온라인 리뷰와 정성 인터뷰,<br className="hidden sm:block" /> 데이터에 따라 AI 퍼소나는 어떻게 달라질까요
        </h1>
        <p className="mt-5 max-w-prose2 text-b1 text-g700">
          부스터프로 리뷰 3,601건과 사용자 인터뷰 6명을 각각 생성형 AI로 분석해, 데이터마다 Primary 퍼소나 1개와 Secondary 퍼소나 2개씩 모두 6개의 퍼소나를 도출했어요. 원자료부터 결과 퍼소나까지의 과정을 확인하고 평가해 주세요.
        </p>
        <div className="mt-8 rounded-xl border border-g200 bg-g50 p-5 sm:p-6">
          <p className="text-t1">연구 문제</p>
          <ol className="mt-3 space-y-3">
            {[
              '데이터 유형(온라인 텍스트 데이터 vs. 정성 인터뷰 데이터)에 따라 생성형 AI가 도출한 퍼소나의 구성 요소에는 어떤 차이가 나타나는가?',
              '온라인 사용자 데이터 기반 AI 퍼소나는 정성 인터뷰 기반 AI 퍼소나와 비교했을 때 어떤 강점과 한계를 가지는가?',
              'UX 전문가는 두 유형의 AI 퍼소나가 서비스 기획 실무에 얼마나 유용하다고 평가하는가?',
            ].map((q, i) => (
              <li key={i} className="flex gap-3 text-b2 text-g900">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-b3 font-semibold text-white">{i + 1}</span>
                <span className="pt-0.5">{q}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-b3 text-g600">리뷰와 인터뷰 원문은 고치지 않았어요.</p>
        </div>
      </header>

      <Section title="도출 흐름" lead="칸을 누르면 해당 단계로 이동해요. 숫자는 모두 실제 건수예요.">
        <div className="space-y-8">
          <Lane
            title="리뷰 데이터에서 데이터 퍼소나로"
            steps={[
              { label: '1단계 리뷰 원자료', to: '/reviews', body: <p className="text-[22px] font-bold tabular">3,601<span className="ml-1 text-b3 font-normal text-g500">건</span></p> },
              { label: '키워드 규칙으로 1차 분류(중복 포함)', to: '/process', body: <div className="space-y-1">{DATA_IDS.map((p) => <Num key={p} id={p} n={S.keywordFlag[p]} />)}</div> },
              { label: '재분류 후 퍼소나 적합', to: '/reviews', body: <div className="space-y-1">{DATA_IDS.map((p) => <Num key={p} id={p} n={S.reclass[p].counts.D} />)}</div> },
              { label: '2단계 핵심 리뷰', to: '/core', body: <div className="space-y-1">{DATA_IDS.map((p) => <Num key={p} id={p} n={core[p].length} />)}</div> },
            ]}
          />
          <Lane
            title="정성 인터뷰에서 정성 퍼소나로"
            steps={[
              { label: '3단계 인터뷰 참여자', to: '/interviews', body: <p className="text-[22px] font-bold">U1 ~ U6</p> },
              { label: '4단계 행동 변수', to: '/variables', body: <p className="text-b2 text-g800">공통 5개 + 신규 4개<br />그룹핑 패턴 6개</p> },
              { label: '참여자 그룹', to: '/variables', body: <p className="text-b2 text-g800">U1·U3·U6<br />U2·U4<br />U5</p> },
              { label: '5단계 결과 퍼소나', to: '/personas', body: <p className="text-b2 text-g800">Primary 1개<br />Secondary 2개</p> },
            ]}
          />
        </div>
      </Section>

      <Section title="비교하는 퍼소나 쌍" lead="데이터 퍼소나와 정성 퍼소나를 같은 색으로 짝지었어요. 진한 색이 데이터 퍼소나, 옅은 색이 정성 퍼소나예요.">
        <ul className="divide-y divide-g200 rounded-2xl border border-g200">
          {DATA_IDS.map((p, i) => (
            <li key={p} className="flex flex-wrap items-center gap-2 px-5 py-4">
              <span className="w-28 shrink-0 text-b2 font-semibold text-g700">{['Primary', 'Secondary 1', 'Secondary 2'][i]}</span>
              <PersonaPill id={p} />
              <span aria-label="짝" className="text-g400">↔</span>
              <PersonaPill id={PAIR[p]} />
            </li>
          ))}
        </ul>
        <p className="mt-3 max-w-prose2 text-b3 text-g600">같은 순위(Primary, Secondary 1, Secondary 2)끼리 짝지었어요. 짝끼리 얼마나 맞는지는 6단계에서 다뤄요.</p>
      </Section>

      <Section title="평가 방법" lead="입력한 내용은 이 브라우저에 자동으로 저장되고, 7단계에서 한 번에 제출해요.">
        <ol className="max-w-prose2 space-y-3">
          {[
            '1~4단계에서 리뷰·인터뷰 원자료와 행동 변수를 확인해요.',
            '2단계 핵심 리뷰마다 퍼소나의 근거로 적합한지 표시해요. 이 단계는 선택이에요.',
            '5·6단계에서 결과 퍼소나와 도출 과정을 보고, 7단계에서 퍼소나 6개를 기준 4개로 평가해요.',
          ].map((t, i) => (
            <li key={i} className="flex gap-3 text-b2 text-g800">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-weak text-cap font-bold text-brand">{i + 1}</span>
              <span className="pt-0.5">{t}</span>
            </li>
          ))}
        </ol>
        <div className="mt-8 max-w-md">
          <label htmlFor="ev" className="mb-2 block text-b3 font-semibold text-g700">평가자 이름 또는 이니셜</label>
          <TextField id="ev" value={state.evaluator} onChange={(e) => setEvaluator(e.target.value)} placeholder="예: 김OO" />
          <p className="mt-2 text-cap text-g500">여러 전문가의 응답을 구분하는 데만 써요.</p>
        </div>
      </Section>

      <NextStep to="/reviews" label="리뷰 데이터 보기" />
    </div>
  )
}
