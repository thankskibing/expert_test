import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { DATA_IDS, PABBR, PAIR, PCOLOR, core, study } from '../lib/data'
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
      <span className="inline-flex h-5 min-w-[26px] items-center justify-center rounded-s px-1 text-[11px] font-bold text-white" style={{ background: PCOLOR[id] }}>{PABBR[id]}</span>
      <span className="text-[22px] font-bold tabular">{n}</span>
      <span className="text-b3 text-g500">건</span>
    </p>
  )
}

const IMG = 'https://m.themedicube.co.kr/web/product/extra/big/202604/184e32f2aa5e815b76989286ff650b0d.jpg'

function ProductImage() {
  const [ok, setOk] = useState(true)
  if (!ok) return <div className="flex aspect-square items-center justify-center rounded-xl bg-g50 text-b3 text-g500">제품 이미지를 불러오지 못했어요</div>
  return (
    <figure>
      <img src={IMG} alt="메디큐브 에이지알 부스터 프로 X2 제품 이미지" referrerPolicy="no-referrer" loading="lazy" onError={() => setOk(false)} className="aspect-square w-full rounded-xl border border-g200 bg-g50 object-cover" />
      <figcaption className="mt-2 text-b3 text-g500">이미지 출처: 메디큐브 공식몰</figcaption>
    </figure>
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

      <Section title="연구 대상: 메디큐브 에이지알 부스터 프로" lead="제조사 상세페이지 내용을 바탕으로 정리했어요.">
        <div className="grid gap-6 rounded-xl border border-g200 p-5 sm:p-6 md:grid-cols-[minmax(0,15rem)_1fr]">
          <ProductImage />
          <div>
            <p className="text-b2 text-g900">
              에이지알 부스터 프로는 화장품 흡수를 돕는 부스터 기능을 중심으로 미세전류, EMS, 모공 관리 기능을 한 기기에 담은 메디큐브의 홈 뷰티 디바이스예요. 2026년 3월 출시된 <b>부스터 프로 X2</b>는 이전 모델보다 출력이 2배 강해졌다고 소개되며, 두 모드를 함께 쓰는 듀얼 모드와 마스크팩 위에서 쓰는 마스크 모드, AGE-R 앱과 연동한 AI 케어가 더해졌어요.
            </p>
            <table className="mt-4 w-full text-left text-b2">
              <thead><tr className="border-b border-g200 bg-g50"><th className="px-3 py-2 font-semibold">모드</th><th className="px-3 py-2 font-semibold">주요 용도</th></tr></thead>
              <tbody className="divide-y divide-g200">
                {[
                  ['부스터', '스킨케어 제품 흡수, 속건조·윤기'],
                  ['MC(미세전류)', '탄력·볼륨'],
                  ['더마샷(EMS)', '붓기·윤곽'],
                  ['에어샷', '모공·각질'],
                  ['마스크', '시트 마스크팩 위에서 흡수 (X2 추가)'],
                  ['듀얼 · AI 케어', '두 모드 동시 사용, 앱의 맞춤 관리 안내 (X2 추가)'],
                ].map(([m, d]) => <tr key={m}><td className="whitespace-nowrap px-3 py-2 text-g900">{m}</td><td className="px-3 py-2 text-g700">{d}</td></tr>)}
              </tbody>
            </table>
            <p className="mt-3 text-b3 text-g600">
              모드별 단계(강도)를 조절할 수 있어요. 인터뷰 참여자 중에는 1세대 사용자와 X2 사용자가 섞여 있어요.{' '}
              <a href="https://themedicube.co.kr/product/detail.html?product_no=2705" target="_blank" rel="noreferrer" className="text-brand hover:text-brand-hover">제품 상세페이지</a>
            </p>
          </div>
        </div>
      </Section>

      <Section title="도출 흐름" lead="칸을 누르면 해당 단계로 이동해요. 숫자는 모두 실제 건수예요.">
        <div className="space-y-8">
          <Lane
            title="리뷰 데이터에서 데이터 퍼소나로"
            steps={[
              { label: '1단계 리뷰 원자료', to: '/reviews', body: <div><p className="text-[22px] font-bold tabular">3,601<span className="ml-1 text-b3 font-normal text-g500">건</span></p><p className="mt-2 text-b3 text-g700">메디큐브 공식몰 · 네이버쇼핑 구매 리뷰, 유튜브 댓글</p></div> },
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
