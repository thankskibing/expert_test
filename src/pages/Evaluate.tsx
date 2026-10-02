import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DATA_IDS, PCOLOR, QUAL_IDS, core, personaById } from '../lib/data'
import { EVAL_ENDPOINT } from '../lib/config'
import { CRITERIA, useEval } from '../lib/evalStore'
import { Button, PageHead, PersonaPill, Section, TextArea, TextField } from '../components/ui'

const IDS = [...DATA_IDS, ...QUAL_IDS] as string[]

export default function Evaluate() {
  const { state, setEvaluator, setScore, setComment, setOverall, markSubmitted } = useEval()
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const missing = IDS.filter((id) => Object.keys(state.personas[id]?.scores ?? {}).length < 4)
  const reviewRows = DATA_IDS.flatMap((p) => core[p].map((r) => ({ p, idx: r.idx, ev: state.reviews[`${p}-${r.idx}`] }))).filter((x) => x.ev?.verdict)

  const payload = () => ({
    evaluator: state.evaluator.trim(),
    submittedAt: new Date().toISOString(),
    personas: IDS.map((id) => ({ id, name: personaById(id).type, ...Object.fromEntries(CRITERIA.map((c) => [c.key, state.personas[id]?.scores[c.key] ?? ''])), comment: state.personas[id]?.comment ?? '' })),
    reviews: reviewRows.map((x) => ({ persona: x.p, idx: x.idx, verdict: x.ev!.verdict === 'fit' ? '적합' : '부적합', note: x.ev!.note })),
    overall: state.overall,
  })

  async function submit() {
    if (!state.evaluator.trim()) { setStatus('error'); setMsg('평가자 이름이나 이니셜을 위에 입력하면 제출할 수 있어요.'); return }
    if (!EVAL_ENDPOINT) { setStatus('error'); setMsg('응답 저장 주소가 아직 연결되지 않았어요. "응답 파일로 저장"으로 내려받아 연구팀에 보내 주세요.'); return }
    setStatus('sending')
    try {
      // Apps Script 웹앱은 CORS 응답을 주지 않아 no-cors + text/plain 으로 보내요.
      await fetch(EVAL_ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload()) })
      markSubmitted(); setStatus('done'); setMsg('제출했어요. 고친 뒤 다시 제출하면 새 응답으로 한 번 더 기록돼요.')
    } catch {
      setStatus('error'); setMsg('네트워크 연결이 끊겨 제출하지 못했어요. 연결을 확인하고 다시 제출해 주세요. 입력한 내용은 이 브라우저에 남아 있어요.')
    }
  }

  function download() {
    const blob = new Blob([JSON.stringify(payload(), null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `퍼소나평가_${state.evaluator || '평가자'}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div>
      <PageHead step={7} title="평가하기">
        퍼소나 6개를 같은 기준 4개로 1점(전혀 그렇지 않아요)부터 5점(매우 그래요)까지 평가해 주세요. 입력한 내용은 이 브라우저에 자동으로 저장되고, 맨 아래에서 제출해요.
      </PageHead>

      <div className="mb-10 max-w-md">
        <label htmlFor="ev2" className="mb-2 block text-b3 font-semibold text-g700">평가자 이름 또는 이니셜</label>
        <TextField id="ev2" value={state.evaluator} onChange={(e) => setEvaluator(e.target.value)} placeholder="예: 김OO" />
      </div>

      <div className="space-y-4">
        {IDS.map((id) => {
          const p = personaById(id)
          const pe = state.personas[id]
          const filled = Object.keys(pe?.scores ?? {}).length
          return (
            <section key={id} className="rounded-3xl border border-g200 p-5 sm:p-7">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <PersonaPill id={id} />
                <span className="text-cap text-g500 tabular">{filled}/4</span>
                <span className="ml-auto flex gap-1">
                  <Link to={`/personas?id=${id}`} className="inline-flex h-8 items-center px-2 text-b2 text-brand hover:text-brand-hover">퍼소나 다시 보기</Link>
                  {p.kind === 'data' && <Link to={`/core?p=${id}`} className="inline-flex h-8 items-center px-2 text-b2 text-brand hover:text-brand-hover">핵심 리뷰</Link>}
                </span>
              </div>
              <div className="divide-y divide-g200">
                {CRITERIA.map((c) => (
                  <fieldset key={c.key} className="grid gap-3 py-4 first:pt-0 sm:grid-cols-[1fr_auto] sm:items-center">
                    <legend className="contents"><span className="text-b2"><b className="text-g900">{c.label}</b><span className="mt-0.5 block text-b3 text-g600">{c.q}</span></span></legend>
                    <div className="flex gap-1 rounded-l bg-g100 p-1">
                      {[1, 2, 3, 4, 5].map((n) => {
                        const on = pe?.scores[c.key] === n
                        return (
                          <label key={n} className={`flex h-9 w-11 cursor-pointer items-center justify-center rounded-m text-b2 font-bold transition-colors duration-200 tabular ${on ? 'bg-white text-g900 shadow-e1' : 'text-g500 hover:text-g800'}`} >
                            <input type="radio" className="sr-only" name={`${id}-${c.key}`} checked={on} onChange={() => setScore(id, c.key, n)} />
                            {n}
                          </label>
                        )
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
              <TextArea value={pe?.comment ?? ''} onChange={(e) => setComment(id, e.target.value)} rows={2} placeholder="의견(선택): 보완할 점, 근거가 부족한 부분 등"
                aria-label={`${p.type} 의견`} className="mt-2" />
            </section>
          )
        })}
      </div>

      <Section title="핵심 리뷰 판정">
        <div className="grid gap-2 sm:grid-cols-3">
          {DATA_IDS.map((p) => {
            const rows = reviewRows.filter((r) => r.p === p)
            return (
              <div key={p} className="rounded-2xl bg-g50 p-4">
                <p className="text-b3 font-semibold text-g700"><span style={{ color: PCOLOR[p] }}>{p}</span> 핵심 리뷰 {core[p].length}건</p>
                <p className="mt-1 text-b2 tabular"><b className="text-[#029359]">적합 {rows.filter((r) => r.ev!.verdict === 'fit').length}</b> · <b className="text-danger">부적합 {rows.filter((r) => r.ev!.verdict === 'unfit').length}</b></p>
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-b3 text-g600">핵심 리뷰 판정은 선택이에요. <Link to="/core" className="font-semibold text-brand">2단계에서 표시하기</Link></p>
      </Section>

      <Section title="종합 의견">
        <TextArea value={state.overall} onChange={(e) => setOverall(e.target.value)} rows={5} placeholder="도출 과정 전반, 데이터 퍼소나와 정성 퍼소나의 관계, 보완 제안 등"
          aria-label="종합 의견" className="max-w-prose2" />
      </Section>

      {missing.length > 0 && <p className="mb-2 max-w-prose2 text-b3 text-g600">아직 점수가 비어 있는 퍼소나: {missing.map((m) => personaById(m).type).join(', ')}. 비어 있어도 제출할 수 있어요.</p>}
      {msg && <p role="status" className={`mb-2 max-w-prose2 text-b2 font-semibold ${status === 'error' ? 'text-danger' : 'text-[#029359]'}`}>{msg}</p>}

      {/* Footer toolbar: one primary action, secondary actions as default buttons */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-g200 bg-white px-4 py-4 pb-[max(16px,env(safe-area-inset-bottom))] sm:-mx-8 sm:px-8">
        <div className="flex justify-end gap-2">
          <Button size="l" variant="secondary" onClick={download}>응답 파일로 저장</Button>
          <Button size="l" variant="primary" onClick={submit} disabled={status === 'sending'}>
            {status === 'sending' ? '제출하고 있어요' : state.submittedAt ? '다시 제출하기' : '평가 제출하기'}
          </Button>
        </div>
      </div>
    </div>
  )
}
