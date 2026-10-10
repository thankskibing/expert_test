import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EVAL_ENDPOINT } from '../lib/config'
import { ITEM_COUNT, STEP8_CHECKLIST, STEP8_QS } from '../lib/protocol'
import { useEval } from '../lib/evalStore'
import { buildPayload } from '../lib/payload'
import { method } from '../lib/data'
import { FieldList } from '../components/form'
import { Button, Note, PageHead, Section } from '../components/ui'

const ORDER = ['A', 'B', 'C', 'P', 'S1', 'S2']

export default function Step8() {
  const { state, setStep8, markSubmitted, reset } = useEval()
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const rated = ORDER.reduce((a, o) => a + Object.keys(state.ratings[o] ?? {}).length, 0)
  const checks = [
    { label: '기본 프로필', ok: !!state.profile.p_age, to: '/profile' },
    { label: '1단계: 연구 개요', ok: !!state.step1.s1_q2, to: '/step1' },
    { label: '2단계: 수집·전처리', ok: !!state.step2.s2_q1, to: '/step2' },
    { label: '3단계: 토픽·집단 구성', ok: !!state.step3.s3_q1, to: '/step3' },
    { label: '4단계: AI 분석·근거', ok: !!state.step4.s4_q1, to: '/step4' },
    { label: '5단계: 인터뷰·정성 퍼소나', ok: !!state.step5qual.s5q_q1, to: '/step5' },
    { label: '6단계: 두 퍼소나 비교', ok: !!state.step6.s6_q1, to: '/step6' },
    { label: `7단계: 최종 품질 평가 ${rated}/${ITEM_COUNT * 6}`, ok: rated === ITEM_COUNT * 6, to: '/step7' },
  ]
  const missing = checks.filter((c) => !c.ok)

  async function submit() {
    if (!state.evaluator.trim()) { setStatus('error'); setMsg('시작 화면에서 평가자 이름을 입력해 주세요.'); return }
    setStatus('sending')
    try {
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
      <PageHead step={8} title="전체 연구방법 종합 평가">
        마지막으로 연구 과정 전체를 돌아보며 종합적으로 평가해 주세요.
      </PageHead>

      <Section title="연구 과정 요약">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-g200 p-5">
            <p className="mb-2 text-t2">{method.aiProcess.review.label}</p>
            <ol className="space-y-1.5 text-b3 text-g700">{method.aiProcess.review.steps.map((s, i) => <li key={s}>{i + 1}. {s}</li>)}</ol>
          </div>
          <div className="rounded-2xl border border-g200 p-5">
            <p className="mb-2 text-t2">{method.aiProcess.interview.label}</p>
            <ol className="space-y-1.5 text-b3 text-g700">{method.aiProcess.interview.steps.map((s, i) => <li key={s}>{i + 1}. {s}</li>)}</ol>
          </div>
        </div>
      </Section>

      <section className="rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
        <h2 className="pt-4 text-t1">전체 연구 방법 평가(10문항)</h2>
        <div className="max-w-3xl"><FieldList fields={STEP8_QS} get={(id) => state.step8[id] ?? ''} set={setStep8} /></div>
      </section>

      <section className="mt-6 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
        <h2 className="pt-4 text-t1">수정이 필요한 단계와 의견</h2>
        <div className="max-w-3xl"><FieldList fields={STEP8_CHECKLIST} get={(id) => state.step8[id] ?? ''} set={setStep8} /></div>
      </section>

      <section className="mt-10 max-w-3xl rounded-xl border border-g200 p-5 sm:p-6">
        <h2 className="text-t1">응답 제출</h2>
        <ul className="mt-3 space-y-1.5">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-2 text-b2">
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white ${c.ok ? 'bg-success' : 'bg-g300'}`}>{c.ok ? '✓' : ''}</span>
              <span className={c.ok ? 'text-g900' : 'text-g600'}>{c.label}</span>
              {!c.ok && <Link to={c.to} className="text-b3 text-brand hover:text-brand-hover">이어서 하기</Link>}
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
