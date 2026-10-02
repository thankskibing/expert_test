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
    <div className="mt-4 rounded-xl border border-g200 bg-g50 p-3">
      <p className="text-b2 font-semibold">{state.evaluator ? `${state.evaluator} 님의 평가` : '평가 진행 상황'}</p>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-g200" aria-hidden>
          <div className="h-full rounded-full bg-brand transition-all duration-200" style={{ width: `${(done / 6) * 100}%` }} />
        </div>
        <span className="text-b3 text-g700 tabular">{done}/6</span>
      </div>
      <p className="mt-1 text-b3 text-g600 tabular">핵심 리뷰 판정 {marked}개</p>
      {state.submittedAt && <p className="mt-1 text-b3 text-success">제출했어요</p>}
    </div>
  )
}

function Shell() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [loc.pathname])
  const nav = (
    <nav aria-label="페이지 이동">
      <ol className="space-y-1">
        {NAV.map((n) => (
          <li key={n.to}>
            <NavLink
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) => `flex h-10 items-center gap-2.5 rounded-xl px-4 text-b2 transition-colors duration-200 ${isActive ? 'bg-brand-weak text-brand' : 'text-g900 hover:bg-black/[0.06]'}`}
            >
              <span className="w-3 text-b3 opacity-60 tabular">{n.step}</span>
              {n.label}
            </NavLink>
          </li>
        ))}
      </ol>
    </nav>
  )
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r border-g200 bg-white px-3 py-5 lg:block">
        <div className="sticky top-5">
          <p className="mb-5 px-4 text-t1">부스터프로 퍼소나 도출 검증</p>
          {nav}
          <Progress />
        </div>
      </aside>
      <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-g200 bg-white px-4 lg:hidden">
        <p className="text-t1">퍼소나 도출 검증</p>
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
