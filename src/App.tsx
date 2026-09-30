import { useEffect, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { EvalProvider, useEval } from './lib/evalStore'
import Overview from './pages/Overview'
import Reviews from './pages/Reviews'
import CorePage from './pages/Core'
import Interviews from './pages/Interviews'
import Variables from './pages/Variables'
import Personas from './pages/Personas'
import Process from './pages/Process'
import Evaluate from './pages/Evaluate'

export const NAV = [
  { to: '/', label: '개요', step: 0 },
  { to: '/reviews', label: '리뷰 데이터', step: 1 },
  { to: '/core', label: '핵심 리뷰', step: 2 },
  { to: '/interviews', label: '정성 인터뷰', step: 3 },
  { to: '/variables', label: '행동 변수·그룹', step: 4 },
  { to: '/personas', label: '결과 퍼소나', step: 5 },
  { to: '/process', label: '도출 과정·교차 검증', step: 6 },
  { to: '/evaluate', label: '평가하기', step: 7 },
]

function Progress() {
  const { state } = useEval()
  const done = Object.values(state.personas).filter((p) => Object.keys(p.scores).length === 4).length
  const marked = Object.values(state.reviews).filter((r) => r.verdict).length
  return (
    <div className="mt-6 rounded-lg border border-rule bg-white px-3 py-2.5 text-[0.8rem] text-slate">
      <p className="font-semibold text-ink">{state.evaluator ? `${state.evaluator} 님의 평가` : '평가 진행 상황'}</p>
      <p>퍼소나 점수 {done}/6 · 핵심 리뷰 판정 {marked}개</p>
      {state.submittedAt && <p className="text-pc">제출 완료</p>}
    </div>
  )
}

function Shell() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [loc.pathname])
  const nav = (
    <nav aria-label="페이지 이동">
      <ol className="space-y-0.5">
        {NAV.map((n) => (
          <li key={n.to}>
            <NavLink
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) => `flex items-baseline gap-2.5 rounded-md px-2.5 py-1.5 text-[0.93rem] ${isActive ? 'bg-ink text-white' : 'text-ink hover:bg-white'}`}
            >
              <span className="w-3 text-[0.78rem] tabular-nums opacity-60">{n.step}</span>
              {n.label}
            </NavLink>
          </li>
        ))}
      </ol>
    </nav>
  )
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r border-rule px-5 py-8 lg:block">
        <div className="sticky top-8">
          <p className="mb-6 font-serif text-[1.1rem] font-bold leading-snug">부스터프로 퍼소나<br />도출 검증</p>
          {nav}
          <Progress />
        </div>
      </aside>
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-rule bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
        <p className="font-serif font-bold">퍼소나 도출 검증</p>
        <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="rounded-md border border-rule bg-white px-3 py-1 text-sm">
          {open ? '닫기' : '메뉴'}
        </button>
      </div>
      {open && (
        <div className="border-b border-rule bg-paper px-4 pb-4 pt-2 lg:hidden">
          {nav}
          <Progress />
        </div>
      )}
      <main className="min-w-0 px-4 pb-24 pt-8 sm:px-8 lg:px-12 lg:pt-12">
        <div className="mx-auto max-w-[68rem]">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/core" element={<CorePage />} />
            <Route path="/interviews" element={<Interviews />} />
            <Route path="/variables" element={<Variables />} />
            <Route path="/personas" element={<Personas />} />
            <Route path="/process" element={<Process />} />
            <Route path="/evaluate" element={<Evaluate />} />
            <Route path="*" element={<Overview />} />
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
