import { useEffect, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { EvalProvider, useEval } from './lib/evalStore'
import Start from './pages/Start'
import Profile from './pages/Profile'
import Step1 from './pages/Step1'
import Step2 from './pages/Step2'
import Step3 from './pages/Step3'
import Step4 from './pages/Step4'
import Step5 from './pages/Step5'
import Step6 from './pages/Step6'
import Step7 from './pages/Step7'
import Step8 from './pages/Step8'
import Reviews from './pages/Reviews'
import CorePage from './pages/Core'
import Interviews from './pages/Interviews'
import Variables from './pages/Variables'
import Personas from './pages/Personas'
import Process from './pages/Process'
import { ITEM_COUNT } from './lib/protocol'

export const NAV = [
  { to: '/', label: '시작', step: 0 },
  { to: '/profile', label: '기본 프로필', step: '' },
  { to: '/step1', label: '1. 연구 개요·전체 프로세스', step: 1 },
  { to: '/step2', label: '2. 수집·전처리 검증', step: 2 },
  { to: '/step3', label: '3. 토픽·리뷰 집단 구성 검증', step: 3 },
  { to: '/step4', label: '4. 리뷰 AI 분석·퍼소나 근거', step: 4 },
  { to: '/step5', label: '5. 인터뷰·정성 퍼소나', step: 5 },
  { to: '/step6', label: '6. 두 퍼소나 비교', step: 6 },
  { to: '/step7', label: '7. 최종 퍼소나 품질 평가', step: 7 },
  { to: '/step8', label: '8. 종합 평가·제출', step: 8 },
]
export const REF = [
  { to: '/reviews', label: '리뷰 데이터' },
  { to: '/core', label: '핵심 리뷰' },
  { to: '/interviews', label: '정성 인터뷰' },
  { to: '/variables', label: '행동 변수·그룹' },
  { to: '/personas', label: '결과 퍼소나' },
  { to: '/process', label: '도출 과정·교차 검증(연구팀 메모)' },
]

function Progress() {
  const { state } = useEval()
  const rated = Object.values(state.ratings).reduce((a, r) => a + Object.keys(r).length, 0)
  const total = ITEM_COUNT * 6
  const stepDone = [state.step1.s1_q1, state.step2.s2_q1, state.step3.s3_q1, state.step4.s4_q1, state.step5qual.s5q_q1, state.step6.s6_q1].filter(Boolean).length
  return (
    <div className="mt-4 rounded-xl border border-g200 bg-g50 p-3">
      <p className="text-b2 font-semibold">{state.evaluator ? `${state.evaluator} 님의 평가` : '평가 진행 상황'}</p>
      <p className="mt-1 text-b3 text-g600 tabular">1~6단계 진행 {stepDone}/6</p>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-g200" aria-hidden>
          <div className="h-full rounded-full bg-brand transition-all duration-200" style={{ width: `${(rated / total) * 100}%` }} />
        </div>
        <span className="text-b3 text-g700 tabular">{rated}/{total}</span>
      </div>
      <p className="mt-1 text-b3 text-g600">7단계 척도 평가 문항</p>
      {state.submittedAt && <p className="mt-1 text-b3 text-success">제출했어요</p>}
    </div>
  )
}

const linkCls = ({ isActive }: { isActive: boolean }) => `flex h-10 items-center gap-2.5 rounded-xl px-4 text-b2 transition-colors duration-200 ${isActive ? 'bg-brand-weak text-brand' : 'text-g900 hover:bg-black/[0.06]'}`

function Shell() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [loc.pathname])
  const nav = (
    <nav aria-label="페이지 이동">
      <ol className="space-y-1">
        {NAV.map((n) => (
          <li key={n.to}>
            <NavLink to={n.to} end={n.to === '/'} className={linkCls}>
              <span className="w-3 text-b3 opacity-60 tabular">{n.step}</span>
              {n.label}
            </NavLink>
          </li>
        ))}
      </ol>
      <p className="mb-1 mt-6 px-4 text-b3 text-g600">참고 자료</p>
      <ul className="space-y-1">
        {REF.map((n) => <li key={n.to}><NavLink to={n.to} className={linkCls}>{n.label}</NavLink></li>)}
      </ul>
    </nav>
  )
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r border-g200 bg-white px-3 py-5 lg:block">
        <div className="sticky top-5">
          <p className="mb-5 px-4 text-t1">AI 퍼소나 전문가 평가</p>
          {nav}
          <Progress />
        </div>
      </aside>
      <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-g200 bg-white px-4 lg:hidden">
        <p className="text-t1">AI 퍼소나 전문가 평가</p>
        <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="h-8 rounded-m border border-g300 bg-white px-[15px] text-b2 hover:border-brand-hover hover:text-brand-hover">
          {open ? '닫기' : '메뉴'}
        </button>
      </div>
      {open && (
        <div className="border-b border-g200 bg-white px-3 pb-4 pt-2 lg:hidden">
          {nav}
          <Progress />
        </div>
      )}
      <main className="min-w-0 p-4 sm:p-6">
        <div className="mx-auto max-w-[72rem] rounded-xl bg-white px-4 py-6 sm:px-8 sm:py-8">
          <Routes>
            <Route path="/" element={<Start />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/step1" element={<Step1 />} />
            <Route path="/step2" element={<Step2 />} />
            <Route path="/step3" element={<Step3 />} />
            <Route path="/step4" element={<Step4 />} />
            <Route path="/step5" element={<Step5 />} />
            <Route path="/step6" element={<Step6 />} />
            <Route path="/step7" element={<Step7 />} />
            <Route path="/step8" element={<Step8 />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/core" element={<CorePage />} />
            <Route path="/interviews" element={<Interviews />} />
            <Route path="/variables" element={<Variables />} />
            <Route path="/personas" element={<Personas />} />
            <Route path="/process" element={<Process />} />
            <Route path="*" element={<Start />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <EvalProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </EvalProvider>
  )
}
