import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EVAL_ENDPOINT } from '../lib/config'
import { ITEM_COUNT, PROFILE, STEP1_QS, STEP2_QS, STEP3_QS, STEP4_PROCESS_QS, STEP4_REVIEW_QS, STEP5_GROUP_QS, STEP5_PATTERN_QS, STEP5_REVIEW_QS, STEP6_QS, STEP8_AI_QS, STEP8_CHECKLIST, STEP8_FINAL_QS, STEP8_PROCEDURE_QS, STEP8_QS, STEP8_USE_QS, type Field } from '../lib/protocol'
import { stepByNo } from '../lib/steps'
import { useEval } from '../lib/evalStore'
import { buildPayload } from '../lib/payload'
import { method } from '../lib/data'
import { FieldList, unanswered } from '../components/form'
import { Button, Note, PageHead, Section } from '../components/ui'

const ORDER = ['A', 'B', 'C', 'P', 'S1', 'S2']

export default function Step8() {
  const { state, setStep8, markSubmitted, reset } = useEval()
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const rated = ORDER.reduce((a, o) => a + Object.keys(state.ratings[o] ?? {}).length, 0)
  // 단계마다 아직 답하지 않은 척도·선택 문항 수를 세서 보여줘요(서술형은 선택이라 세지 않아요).
  const left = (fields: Field[], src: Record<string, string>) => unanswered(fields, (id) => src[id] ?? '')
  const row = (no: number, n: number, extra = '') => ({ label: `${no}단계: ${stepByNo(no).short}${extra}`, ok: n === 0, left: n, to: stepByNo(no).to })

  const checks = [
    row(0, left(PROFILE.flatMap((s) => s.fields), state.profile)),
    row(1, left(STEP1_QS, state.step1)),
    row(2, left(STEP2_QS, state.step2)),
    row(3, left(STEP3_QS, state.step3)),
    row(4, left([...STEP4_PROCESS_QS, ...STEP4_REVIEW_QS], state.step4)),
    row(5, left([...STEP5_PATTERN_QS, ...STEP5_GROUP_QS, ...STEP5_REVIEW_QS], state.step5pattern)),
    row(6, left(STEP6_QS, state.step6)),
    row(7, ITEM_COUNT * 6 - rated, ` ${rated}/${ITEM_COUNT * 6}`),
    row(8, left(STEP8_QS, state.step8)),
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
      <PageHead step={8} title={stepByNo(8).title}>
        마지막으로 연구 과정 전체를 돌아보며 종합적으로 평가해 주세요.
      </PageHead>

      <Section title="연구 과정 요약">
        <div className="grid gap-4 md:grid-cols-2 md:items-stretch">
          <div className="rounded-2xl border border-g200 p-5">
            <p className="mb-2 text-t2">{method.aiProcess.review.label}</p>
            <ol className="space-y-2 text-b3 text-g700">
              {method.aiProcess.review.steps.map((s, i) => (
                <li key={s} className="flex gap-2.5"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-weak text-cap font-bold text-brand">{i + 1}</span>{s}</li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl border border-g200 p-5">
            <p className="mb-2 text-t2">{method.aiProcess.interview.label}</p>
            <ol className="space-y-2 text-b3 text-g700">
              {method.aiProcess.interview.steps.map((s, i) => (
                <li key={s} className="flex gap-2.5"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-weak text-cap font-bold text-brand">{i + 1}</span>{s}</li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      <section className="rounded-xl border border-g200 bg-g50 px-5 py-4 sm:px-6">
        <h2 className="text-t1">1. 전체 연구 방법 평가</h2>
        <p className="mt-1 max-w-prose2 text-b2 text-g700">각 문항을 읽고 연구 방법과 분석 결과에 대한 동의 정도를 평가해 주세요.</p>
        <p className="mt-1 text-b3 text-g600">평가 척도(5점 리커트 척도) · 1 전혀 그렇지 않다 · 2 그렇지 않다 · 3 보통이다 · 4 그렇다 · 5 매우 그렇다</p>

        <p className="mt-1 text-b3 text-g600">두 퍼소나 비교에 관한 문항은 6단계 비교 화면 바로 아래로 옮겼어요.</p>

        <h3 className="mt-6 text-t2">① 연구 절차의 타당성</h3>
        <div className="max-w-3xl"><FieldList fields={STEP8_PROCEDURE_QS} get={(id) => state.step8[id] ?? ''} set={setStep8} prefix="8-Q" start={1} /></div>

        <h3 className="mt-2 text-t2">② 생성형 AI 분석 및 검증</h3>
        <div className="max-w-3xl"><FieldList fields={STEP8_AI_QS} get={(id) => state.step8[id] ?? ''} set={setStep8} prefix="8-Q" start={5} /></div>

        <h3 className="mt-2 text-t2">③ 활용 가능성</h3>
        <div className="max-w-3xl"><FieldList fields={STEP8_USE_QS} get={(id) => state.step8[id] ?? ''} set={setStep8} prefix="8-Q" start={8} /></div>

        <h3 className="mt-2 text-t2">④ 종합 평가</h3>
        <div className="max-w-3xl"><FieldList fields={STEP8_FINAL_QS} get={(id) => state.step8[id] ?? ''} set={setStep8} prefix="8-Q" start={12} /></div>
      </section>

      <section className="mt-6 rounded-xl border border-g200 bg-g50 px-5 py-4 sm:px-6">
        <h2 className="text-t1">2. 수정이 필요한 단계 및 전문가 의견</h2>
        <div className="max-w-3xl"><FieldList fields={STEP8_CHECKLIST} get={(id) => state.step8[id] ?? ''} set={setStep8} prefix="8-Q" start={14} /></div>
      </section>

      <section className="mt-10 max-w-3xl rounded-xl border border-g200 p-5 sm:p-6">
        <h2 className="text-t1">응답 제출</h2>
        <ul className="mt-3 space-y-1.5">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-2 text-b2">
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white ${c.ok ? 'bg-success' : 'bg-g300'}`}>{c.ok ? '✓' : ''}</span>
              <span className={c.ok ? 'text-g900' : 'text-g600'}>{c.label}</span>
              {!c.ok && <span className="text-b3 text-g500 tabular">미응답 {c.left}개</span>}
              {!c.ok && <Link to={c.to} className="text-b3 text-brand hover:text-brand-hover">이어서 하기</Link>}
            </li>
          ))}
        </ul>
        {missing.length > 0 && <p className="mt-3 text-b3 text-g600">빠진 응답이 있어도 제출할 수 있어요. 빈 칸은 시트에 빈 값으로 기록돼요.</p>}
        {msg && <div className="mt-4">{status === 'done' ? <p className="rounded-xl border border-[#B7EB8F] bg-[#F6FFED] px-3 py-2 text-b2 text-g900">{msg}</p> : <Note label="오류">{msg}</Note>}</div>}
        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          <Button size="l" variant="secondary" onClick={download}>응답 파일로 저장</Button>
          <Button size="l" variant="primary" onClick={submit} disabled={status === 'sending'}>
            {status === 'sending' ? '제출하고 있어요' : state.submittedAt ? '다시 제출하기' : '평가 제출하기'}
          </Button>
        </div>
      </section>

      {/* 제출 버튼 옆에 두면 잘못 눌러 응답을 지울 수 있어서, 제출 영역 밖 아래쪽으로 떼어 두었어요(누르면 한 번 더 확인해요). */}
      <div className="mt-16 max-w-3xl border-t border-g200 pt-4">
        <p className="text-b3 text-g600">다음 전문가의 평가를 이 브라우저에서 시작하려면, 제출을 마친 뒤 저장된 응답을 지워 주세요.</p>
        <button onClick={startOver} className="mt-1 text-b3 font-semibold text-g600 underline hover:text-[#CF1322]">저장된 응답 지우고 새 평가자로 시작</button>
      </div>
    </div>
  )
}
