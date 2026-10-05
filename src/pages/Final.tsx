import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EVAL_ENDPOINT } from '../lib/config'
import { FINAL_QS, ITEM_COUNT, ROUNDS } from '../lib/protocol'
import { useEval } from '../lib/evalStore'
import { buildPayload, evalOrder } from '../lib/payload'
import { FieldList } from '../components/form'
import { Button, Note, PageHead } from '../components/ui'

export default function Final() {
  const { state, setFinal, markSubmitted, reset } = useEval()
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const order = evalOrder(state)
  const rated = order.reduce((a, o) => a + Object.keys(state.ratings[o.id] ?? {}).length, 0)
  const checks = [
    { label: '기본 프로필', ok: !!state.profile.p_age, to: '/profile' },
    { label: '퍼소나 비교 3쌍', ok: ROUNDS.every((r) => state.compare[r.key]?.c_pick), to: '/compare' },
    { label: '데이터 출처 확인 3쌍', ok: ROUNDS.every((r) => state.revealed[r.key]), to: '/evidence' },
    { label: `척도 평가 ${rated}/${ITEM_COUNT * 6}`, ok: rated === ITEM_COUNT * 6, to: '/rate' },
    { label: '실무 선택(Q6)', ok: !!state.final.f_choice, to: '/final' },
  ]
  const missing = checks.filter((c) => !c.ok)

  async function submit() {
    if (!state.evaluator.trim()) { setStatus('error'); setMsg('시작 화면에서 평가자 이름을 입력해 주세요.'); return }
    setStatus('sending')
    try {
      // Apps Script 웹앱은 CORS 응답을 주지 않아 no-cors + text/plain 으로 보내요.
      await fetch(EVAL_ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(buildPayload(state)) })
      markSubmitted(); setStatus('done'); setMsg('제출했어요. 고친 뒤 다시 제출하면 새 응답으로 한 줄 더 기록돼요.')
    } catch {
      setStatus('error'); setMsg('네트워크 연결이 끊겨 제출하지 못했어요. 연결을 확인하고 다시 제출해 주세요. 입력한 내용은 이 브라우저에 남아 있어요.')
    }
  }

  function download() {
    const blob = new Blob([JSON.stringify({ ...buildPayload(state), raw: state }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `퍼소나평가_${state.evaluator || '평가자'}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function startOver() {
    if (window.confirm('이 브라우저에 저장된 응답을 모두 지우고 새 평가자로 시작할까요? 제출하지 않은 내용은 사라져요.')) reset()
  }

  return (
    <div>
      <PageHead step={5} title="두 퍼소나 비교 평가">
        마지막으로 온라인 사용자 리뷰 기반 퍼소나와 정성 인터뷰 기반 퍼소나를 비교해서 의견을 여쭤볼게요.
      </PageHead>

      <div className="max-w-3xl"><FieldList fields={FINAL_QS} get={(id) => state.final[id] ?? ''} set={setFinal} /></div>

      <section className="mt-10 max-w-3xl rounded-xl border border-g200 p-5 sm:p-6">
        <h2 className="text-t1">응답 제출</h2>
        <ul className="mt-3 space-y-1.5">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-2 text-b2">
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white ${c.ok ? 'bg-success' : 'bg-g300'}`}>{c.ok ? '✓' : ''}</span>
              <span className={c.ok ? 'text-g900' : 'text-g600'}>{c.label}</span>
              {!c.ok && c.to !== '/final' && <Link to={c.to} className="text-b3 text-brand hover:text-brand-hover">이어서 하기</Link>}
            </li>
          ))}
        </ul>
        {missing.length > 0 && <p className="mt-3 text-b3 text-g600">빠진 응답이 있어도 제출할 수 있어요. 빈 칸은 시트에 빈 값으로 기록돼요.</p>}
        {msg && <div className="mt-4">{status === 'done' ? <p className="rounded-xl border border-[#B7EB8F] bg-[#F6FFED] px-3 py-2 text-b2 text-g900">{msg}</p> : <Note label="오류">{msg}</Note>}</div>}
        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          <Button size="l" variant="ghost" onClick={startOver}>새 평가자로 시작</Button>
          <Button size="l" variant="secondary" onClick={download}>응답 파일로 저장</Button>
          <Button size="l" variant="primary" onClick={submit} disabled={status === 'sending'}>
            {status === 'sending' ? '제출하고 있어요' : state.submittedAt ? '다시 제출하기' : '평가 제출하기'}
          </Button>
        </div>
      </section>
    </div>
  )
}
