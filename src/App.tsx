import { useEffect, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { EvalProvider, allRevealed, useEval } from './lib/evalStore'
import Start from './pages/Start'
import Profile from './pages/Profile'
import Compare from './pages/Compare'
import Evidence from './pages/Evidence'
import Rate from './pages/Rate'
import Final from './pages/Final'
import Reviews from './pages/Reviews'
import CorePage from './pages/Core'
import Interviews from './pages/Interviews'
import Variables from './pages/Variables'
import Personas from './pages/Personas'
import Process from './pages/Process'
import { ITEM_COUNT, ROUNDS } from './lib/protocol'
import type { ReactNode } from 'react'

export const NAV = [
  { to: '/', label: '시작', step: 0 },
  { to: '/profile', label: '기본 프로필', step: 1 },
  { to: '/compare', label: '퍼소나 비교', step: 2 },
  { to: '/evidence', label: '제작 데이터 확인', step: 3 },
  { to: '/rate', label: '전문가 평가', step: 4 },
  { to: '/final', label: '비교 평가·제출', step: 5 },
]
export const REF = [
  { to: '/reviews', label: '리뷰 데이터' },
  { to: '/core', label: '핵심 리뷰' },
  { to: '/interviews', label: '정성 인터뷰' },
  { to: '/variables', label: '행동 변수·그룹' },
  { to: '/personas', label: '결과 퍼소나' },
  { to: '/process', label: '도출 과정·교차 검증' },
]

function Progress() {
  const { state } = useEval()
  const rated = Object.values(state.ratings).reduce((a, r) => a + Object.keys(r).length, 0)
  const total = ITEM_COUNT * 6
  const compared = ROUNDS.filter((r) => state.compare[r.key]?.c_pick).length
  const revealed = ROUNDS.filter((r) => state.revealed[r.key]).length
  return (
    <div className="mt-4 rounded-xl border border-g200 bg-g50 p-3">
      <p className="text-b2 font-semibold">{state.evaluator ? `${state.evaluator} 님의 평가` : '평가 진행 상황'}</p>
      <p className="mt-1 text-b3 text-g600 tabular">퍼소나 비교 {compared}/3 · 출처 확인 {revealed}/3</p>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-g200" aria-hidden>
          <div className="h-full rounded-full bg-brand transition-all duration-200" style={{ width: `${(rated / total) * 100}%` }} />
        </div>
        <span className="text-b3 text-g700 tabular">{rated}/{total}</span>
      </div>
      <p className="mt-1 text-b3 text-g600">척도 평가 문항</p>
      {state.submittedAt && <p className="mt-1 text-b3 text-success">제출했어요</p>}
    </div>
  )
}

function Locked({ children }: { children: ReactNode }) {
  const { state } = useEval()
  if (allRevealed(state)) return <>{children}</>
  return (
    <div className="py-16 text-center">
      <p className="text-h3">아직 볼 수 없는 자료예요</p>
      <p className="mx-auto mt-2 max-w-md text-b2 text-g600">참고 자료에는 퍼소나의 데이터 출처가 드러나 있어요. 제작 데이터 확인 단계에서 세 쌍의 출처를 모두 확인하면 열려요.</p>
      <NavLink to="/evidence" className="mt-6 inline-flex h-10 items-center rounded-l bg-brand px-[15px] text-b1 text-white hover:bg-brand-hover">제작 데이터 확인으로 가기</NavLink>
    </div>
  )
}

const linkCls = ({ isActive }: { isActive: boolean }) => `flex h-10 items-center gap-2.5 rounded-xl px-4 text-b2 transition-colors duration-200 ${isActive ? 'bg-brand-weak text-brand' : 'text-g900 hover:bg-black/[0.06]'}`

function Shell() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [loc.pathname])
  const { state } = useEval()
  const open2 = allRevealed(state)
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
      <p className="mb-1 mt-6 flex items-center gap-1.5 px-4 text-b3 text-g600">
        참고 자료
        {!open2 && <svg aria-label="잠김" viewBox="0 0 16 16" className="h-3.5 w-3.5"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" /><path d="M5.5 7V5a2.5 2.5 0 015 0v2" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>}
      </p>
      {open2 ? (
        <ul className="space-y-1">
          {REF.map((n) => <li key={n.to}><NavLink to={n.to} className={linkCls}>{n.label}</NavLink></li>)}
        </ul>
      ) : (
        <p className="px-4 text-b3 text-g500">데이터 출처를 모두 확인하면 열려요.</p>
      )}
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
            <Route path="/compare" element={<Compare />} />
            <Route path="/evidence" element={<Evidence />} />
            <Route path="/rate" element={<Rate />} />
            <Route path="/final" element={<Final />} />
            <Route path="/reviews" element={<Locked><Reviews /></Locked>} />
            <Route path="/core" element={<Locked><CorePage /></Locked>} />
            <Route path="/interviews" element={<Locked><Interviews /></Locked>} />
            <Route path="/variables" element={<Locked><Variables /></Locked>} />
            <Route path="/personas" element={<Locked><Personas /></Locked>} />
            <Route path="/process" element={<Locked><Process /></Locked>} />
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
