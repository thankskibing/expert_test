import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DATA_IDS, PCOLOR, QUAL_IDS, core, personaById } from '../lib/data'
import { EVAL_ENDPOINT } from '../lib/config'
import { CRITERIA, useEval } from '../lib/evalStore'
import { PageHead, PersonaPill, Section } from '../components/ui'

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
    if (!state.evaluator.trim()) { setStatus('error'); setMsg('평가자 이름 또는 이니셜을 입력해 주세요.'); return }
    if (!EVAL_ENDPOINT) { setStatus('error'); setMsg('응답 저장 주소가 아직 설정되지 않았습니다. 아래 "응답 파일로 저장"으로 내려받아 연구팀에 전달해 주세요.'); return }
    setStatus('sending')
    try {
      // Apps Script 웹앱은 CORS 응답을 주지 않으므로 no-cors + text/plain 으로 보냅니다.
      await fetch(EVAL_ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload()) })
      markSubmitted(); setStatus('done'); setMsg('제출했습니다. 수정 후 다시 제출하면 새 응답으로 한 번 더 기록됩니다.')
    } catch {
      setStatus('error'); setMsg('네트워크 문제로 제출하지 못했습니다. 연결을 확인하고 다시 제출해 주세요. 입력한 내용은 이 브라우저에 남아 있습니다.')
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
        퍼소나 6개를 같은 기준 4개로 1점(전혀 그렇지 않다)~5점(매우 그렇다) 평가해 주세요. 입력 내용은 이 브라우저에 자동 저장되며, 맨 아래에서 제출합니다.
      </PageHead>

      <div className="mb-10 max-w-md">
        <label htmlFor="ev2" className="text-sm font-semibold">평가자 이름 또는 이니셜</label>
        <input id="ev2" value={state.evaluator} onChange={(e) => setEvaluator(e.target.value)} className="mt-2 w-full rounded-md border border-rule bg-white px-3 py-2 outline-none focus:border-ink" />
      </div>

      <div className="space-y-6">
        {IDS.map((id) => {
          const p = personaById(id)
          const pe = state.personas[id]
          return (
            <section key={id} className="rounded-xl border border-rule bg-white p-5 sm:p-6" style={{ borderLeft: `4px solid ${PCOLOR[id]}` }}>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <PersonaPill id={id} />
                <Link to={`/personas?id=${id}`} className="text-[0.85rem] text-slate underline">퍼소나 다시 보기</Link>
                {p.kind === 'data' && <Link to={`/core?p=${id}`} className="text-[0.85rem] text-slate underline">핵심 리뷰</Link>}
              </div>
              <div className="space-y-3">
                {CRITERIA.map((c) => (
                  <fieldset key={c.key} className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                    <legend className="contents"><span className="text-[0.92rem]"><b>{c.label}</b> <span className="text-slate">{c.q}</span></span></legend>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((n) => {
                        const on = pe?.scores[c.key] === n
                        return (
                          <label key={n} className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border text-sm tabular-nums ${on ? 'border-ink bg-ink text-white' : 'border-rule hover:border-slate'}`}>
                            <input type="radio" className="sr-only" name={`${id}-${c.key}`} checked={on} onChange={() => setScore(id, c.key, n)} />
                            {n}
                          </label>
                        )
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
              <textarea value={pe?.comment ?? ''} onChange={(e) => setComment(id, e.target.value)} rows={2} placeholder="의견 (선택): 보완할 점, 근거가 부족한 부분 등"
                aria-label={`${p.type} 의견`} className="mt-4 w-full rounded-md border border-rule px-3 py-2 text-[0.92rem] outline-none focus:border-ink" />
            </section>
          )
        })}
      </div>

      <Section title="핵심 리뷰 판정">
        <p className="text-[0.92rem] text-slate">
          {DATA_IDS.map((p) => {
            const rows = reviewRows.filter((r) => r.p === p)
            return `${p} ${rows.filter((r) => r.ev!.verdict === 'fit').length}적합·${rows.filter((r) => r.ev!.verdict === 'unfit').length}부적합 (${core[p].length}건 중)`
          }).join('  ·  ')}
        </p>
        <p className="mt-1 text-[0.85rem] text-slate">핵심 리뷰 판정은 선택입니다. <Link to="/core" className="underline">2단계에서 표시하기</Link></p>
      </Section>

      <Section title="종합 의견">
        <textarea value={state.overall} onChange={(e) => setOverall(e.target.value)} rows={5} placeholder="도출 과정 전반, 데이터 퍼소나와 정성 퍼소나의 관계, 보완 제안 등"
          aria-label="종합 의견" className="w-full max-w-prose2 rounded-md border border-rule bg-white px-3 py-2 outline-none focus:border-ink" />
      </Section>

      <div className="rounded-xl border border-ink bg-white p-5">
        {missing.length > 0 && <p className="mb-3 text-[0.9rem] text-slate">아직 점수가 비어 있는 퍼소나: {missing.map((m) => personaById(m).type).join(', ')}. 비어 있어도 제출할 수 있습니다.</p>}
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={submit} disabled={status === 'sending'} className="rounded-md bg-ink px-5 py-2.5 font-semibold text-white disabled:opacity-50">
            {status === 'sending' ? '제출하는 중…' : state.submittedAt ? '다시 제출' : '평가 제출'}
          </button>
          <button onClick={download} className="rounded-md border border-rule px-4 py-2.5 text-sm">응답 파일로 저장</button>
        </div>
        {msg && <p role="status" className={`mt-3 text-[0.92rem] ${status === 'error' ? 'text-pa' : 'text-pc'}`}>{msg}</p>}
      </div>
    </div>
  )
}
