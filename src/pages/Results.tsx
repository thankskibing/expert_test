import { useMemo, useState, type ReactNode } from 'react'
import raw from '../data/results.json'
import { EV_META, ORAL, STEP_NAMES, THEMES, type EvId, type OralNote } from '../data/resultsQual'
import { DIMS } from '../lib/protocol'
import { Badge, Chip, Disclosure, Note, PageHead, Section, Tabs } from '../components/ui'

/* 전문가 평가 결과(연구자용). 데이터: results.json(시트 병합) + resultsQual.ts(녹취·메모 정리). */

interface Q { key: string; step: number; kind: 'scale' | 'text' | 'choice'; label: string; q: string; scores: Record<string, number | string>; why: Record<string, string> }
interface Judge { ev: string; persona: string; id: string; score: number | null; agree: string; why: string }
const D = raw as unknown as {
  evaluators: EvId[]
  profile: Record<string, Record<string, string>>
  questions: Q[]
  step6: Record<string, Record<string, Record<string, number>>>
  step6Notes: Record<string, Record<string, { strong?: string; weak?: string }>>
  step6Order: Record<string, string>
  e1Memos: { persona: string; dim: string; text: string }[]
  reviewJudge: Judge[]
  interviewJudge: Judge[]
}
const EVS = D.evaluators
const META = Object.fromEntries(EV_META.map((m) => [m.id, m])) as Record<EvId, (typeof EV_META)[number]>
const PERSONAS = ['리뷰 기반 Primary', '인터뷰 기반 Primary'] as const
const PCOL: Record<string, string> = { '리뷰 기반 Primary': '#F5222D', '인터뷰 기반 Primary': '#2F54EB' }

const mean = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN)
const f2 = (n: number) => (Number.isNaN(n) ? '–' : n.toFixed(2))
const nums = (q: Q) => Object.values(q.scores).filter((v): v is number => typeof v === 'number')

/** 3점을 중심으로 낮으면 빨강, 높으면 파랑. 숫자는 늘 같이 보여줘서 색만으로 읽지 않게 해요. */
function tone(v: number) {
  if (Number.isNaN(v)) return { bg: 'transparent', fg: '#BFBFBF' }
  if (v < 2.5) return { bg: '#FFCCC7', fg: '#A8071A' }
  if (v < 3) return { bg: '#FFF1F0', fg: '#CF1322' }
  if (v < 3.5) return { bg: '#F5F5F5', fg: '#434343' }
  if (v < 4.25) return { bg: '#E6F4FF', fg: '#0958D9' }
  return { bg: '#BAE0FF', fg: '#003EB3' }
}
function Cell({ v, bold, title }: { v: number | undefined; bold?: boolean; title?: string }) {
  const n = v === undefined ? NaN : v
  const t = tone(n)
  return (
    <td className="p-0.5" title={title}>
      <div className={`flex h-8 min-w-[2.5rem] items-center justify-center rounded-s text-b2 tabular ${bold ? 'font-semibold' : ''}`} style={{ background: t.bg, color: t.fg }}>
        {Number.isNaN(n) ? '–' : bold ? f2(n) : n}
      </div>
    </td>
  )
}
function EvHead({ e }: { e: EvId }) {
  return (
    <th className="px-0.5 pb-1 text-center text-b3 font-semibold text-g700" title={META[e].date}>
      {e}
    </th>
  )
}
function Legend() {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-cap text-g600">
      {[['2.5 미만', 2], ['2.5~3', 2.7], ['3~3.5', 3.2], ['3.5~4.25', 4], ['4.25 이상', 4.5]].map(([l, v]) => (
        <span key={l as string} className="flex items-center gap-1"><span className="h-3 w-3 rounded-xs" style={{ background: tone(v as number).bg, outline: '1px solid #F0F0F0' }} />{l}</span>
      ))}
      <span>· 1~5점, – 는 응답 없음</span>
    </div>
  )
}

function EvTag({ e }: { e: EvId }) {
  return <span className="inline-flex h-[22px] shrink-0 items-center rounded-s bg-g100 px-1.5 text-b3 font-semibold text-g800">{e}</span>
}
function Quote({ e, src, children, extra }: { e: EvId; src: string; children: ReactNode; extra?: ReactNode }) {
  return (
    <li className="flex gap-2 border-b border-g200 py-2.5 last:border-0">
      <div className="flex w-[7.5rem] shrink-0 flex-wrap items-start gap-1" data-src={src}><EvTag e={e} />{extra}</div>
      <div className="min-w-0 flex-1 whitespace-pre-line text-b2 text-g900">{children}</div>
    </li>
  )
}

/* ───────────────────────── 한눈에 보기 ───────────────────────── */

const SCALE_QS = D.questions.filter((q) => q.kind === 'scale')
const STEP_LABEL: Record<number, string> = { 1: '1 연구 개요', 2: '2 수집·전처리', 3: '3 토픽 모델링', 4: '4 리뷰 기반 분석', 5: '5 인터뷰 기반 분석', 7: '7 종합 평가' }

function persona6(e: string, p: string) { return mean(Object.values(D.step6[e]?.[p] ?? {})) }

function ScoreMatrix({ onPick }: { onPick: (step: number) => void }) {
  const steps = [1, 2, 3, 4, 5, 7]
  return (
    <div className="overflow-x-auto scroll-box">
      <table className="w-full min-w-[44rem] border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="pb-1 text-left text-b3 font-normal text-g500">문항</th>
            {EVS.map((e) => <EvHead key={e} e={e} />)}
            <th className="px-1 pb-1 text-center text-b3 font-semibold text-g900">평균</th>
            <th className="px-1 pb-1 text-center text-b3 font-normal text-g500">n</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((st) => (
            <FragmentRows key={st} label={STEP_LABEL[st]} onPick={() => onPick(st)}>
              {SCALE_QS.filter((q) => q.step === st).map((q) => {
                const v = nums(q)
                return (
                  <tr key={q.key}>
                    <td className="py-0.5 pr-3 text-b2 text-g900" title={q.q}>{q.label}</td>
                    {EVS.map((e) => <Cell key={e} v={q.scores[e] as number | undefined} title={q.why[e]} />)}
                    <Cell v={mean(v)} bold />
                    <td className="text-center text-b3 text-g500 tabular">{v.length}</td>
                  </tr>
                )
              })}
            </FragmentRows>
          ))}
          <FragmentRows label="6 최종 퍼소나 품질 (15문항 평균)" onPick={() => onPick(6)}>
            {PERSONAS.map((p) => {
              const per = EVS.map((e) => persona6(e, p))
              return (
                <tr key={p}>
                  <td className="py-0.5 pr-3 text-b2 text-g900"><span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: PCOL[p] }} />{p}</td>
                  {per.map((v, i) => <Cell key={EVS[i]} v={Math.round(v * 100) / 100} bold />)}
                  <Cell v={mean(per)} bold />
                  <td className="text-center text-b3 text-g500 tabular">{per.filter((x) => !Number.isNaN(x)).length}</td>
                </tr>
              )
            })}
          </FragmentRows>
        </tbody>
      </table>
    </div>
  )
}
function FragmentRows({ label, onPick, children }: { label: string; onPick: () => void; children: ReactNode }) {
  return (
    <>
      <tr><td colSpan={EVS.length + 3} className="pb-1 pt-4">
        <button onClick={onPick} className="text-b3 font-semibold text-g700 hover:text-brand">{label} ›</button>
      </td></tr>
      {children}
    </>
  )
}

function Overview({ go }: { go: (tab: TabId, step?: number, e?: EvId) => void }) {
  const q = (k: string) => D.questions.find((x) => x.key === k)!
  const r6 = mean(EVS.map((e) => persona6(e, PERSONAS[0])))
  const i6 = mean(EVS.map((e) => persona6(e, PERSONAS[1])))
  const kpis: [string, string, string][] = [
    ['평가자', `${EVS.length}명`, '10.10 ~ 11.06 · 파일럿 1명 포함'],
    ['6단계 퍼소나 품질', `${f2(r6)} vs ${f2(i6)}`, '리뷰 Primary vs 인터뷰 Primary'],
    ['가장 낮은 문항', f2(mean(nums(q('s3_q1')))), '3단계 토픽–키워드–리뷰 연결'],
    ['보완 자료로서 가치', f2(mean(nums(q('s8_q10')))), `대체 어려움(역문항) ${f2(mean(nums(q('s8_q11'))))}`],
  ]
  const toneCls = { good: 'border-l-success', mixed: 'border-l-warning', fix: 'border-l-danger' }
  const toneLabel = { good: '강점', mixed: '의견 갈림', fix: '보완 필요' }
  return (
    <div>
      <div className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map(([k, v, s]) => (
          <div key={k} className="rounded-xl border border-g200 p-4">
            <p className="text-b3 text-g600">{k}</p>
            <p className="mt-1 text-h3 tabular">{v}</p>
            <p className="mt-0.5 text-b3 text-g500">{s}</p>
          </div>
        ))}
      </div>

      <Section title="핵심 발견" lead="여러 평가자가 같이 말한 내용만 묶었어요. 평가자 태그를 누르면 그 사람 응답 전체로 가요.">
        <div className="grid gap-3 lg:grid-cols-2">
          {THEMES.map((t) => (
            <article key={t.id} className={`rounded-xl border border-g200 border-l-4 p-4 ${toneCls[t.tone]}`}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-t1">{t.title}</h3>
                <Badge tone={t.tone === 'good' ? 'green' : t.tone === 'mixed' ? 'orange' : 'red'}>{toneLabel[t.tone]}</Badge>
              </div>
              <p className="mt-2 text-b2 text-g800">{t.body}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {t.steps.map((s) => <button key={s} onClick={() => go('steps', Math.floor(s))} className="text-b3 text-brand hover:text-brand-hover">{STEP_NAMES[String(s)]}</button>)}
                <span className="text-g300">|</span>
                {t.evs.map((e) => <button key={e} onClick={() => go('people', undefined, e)} className="text-b3 text-g700 hover:text-brand">{e}</button>)}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="전체 점수표" lead="1~7단계 리커트 문항을 평가자별로 모았어요. 칸에 마우스를 올리면 서면 이유가 보여요. 단계 이름을 누르면 해당 단계 상세로 가요.">
        <ScoreMatrix onPick={(s) => go(s === 6 ? 'persona' : 'steps', s)} />
        <Legend />
        <p className="mt-3 text-b3 text-g600">7단계 "대체 어려움"은 역문항이라 점수가 높을수록 "리뷰 퍼소나만으로는 대체하기 어렵다"에 동의한다는 뜻이에요.</p>
      </Section>
    </div>
  )
}

/* ───────────────────────── 단계별 ───────────────────────── */

function oralFor(step: number) {
  return ORAL.filter((o) => Math.floor(o.step) === step)
}
function OralList({ notes }: { notes: OralNote[] }) {
  if (!notes.length) return <p className="text-b2 text-g500">이 단계에 따로 남은 의견은 없어요.</p>
  return (
    <ul>
      {notes.map((o, i) => (
        <Quote key={i} e={o.ev} src={o.src} extra={o.step !== Math.floor(o.step) ? <Badge>{STEP_NAMES[String(o.step)].split(' ')[0]}</Badge> : o.persona ? <Badge tone={o.persona === '리뷰' ? 'red' : 'blue'}>{o.persona}</Badge> : undefined}>{o.text}</Quote>
      ))}
    </ul>
  )
}

function ScaleBlock({ q }: { q: Q }) {
  const v = nums(q)
  const whys = EVS.filter((e) => q.why[e])
  return (
    <div className="rounded-xl border border-g200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-prose2">
          <p className="text-t2">{q.label}</p>
          <p className="mt-0.5 text-b3 text-g600">{q.q}</p>
        </div>
        <p className="text-h3 tabular" style={{ color: tone(mean(v)).fg }}>{f2(mean(v))}<span className="ml-1 text-b3 font-normal text-g500">n={v.length}</span></p>
      </div>
      <table className="mt-3 border-separate border-spacing-0"><thead><tr>{EVS.map((e) => <EvHead key={e} e={e} />)}</tr></thead>
        <tbody><tr>{EVS.map((e) => <Cell key={e} v={q.scores[e] as number | undefined} />)}</tr></tbody>
      </table>
      {whys.length > 0 && (
        <ul className="mt-3">{whys.map((e) => <Quote key={e} e={e} src="서면"><span className="mr-1 text-g500 tabular">{q.scores[e] ?? '–'}점 ·</span>{q.why[e]}</Quote>)}</ul>
      )}
    </div>
  )
}
function TextBlock({ q }: { q: Q }) {
  const es = EVS.filter((e) => q.scores[e])
  if (!es.length) return null
  return (
    <div className="rounded-xl border border-g200 p-4">
      <p className="text-t2">{q.label}</p>
      <p className="mt-0.5 text-b3 text-g600">{q.q}</p>
      <ul className="mt-2">{es.map((e) => <Quote key={e} e={e} src="서면">{String(q.scores[e])}</Quote>)}</ul>
    </div>
  )
}

function Step7Extras() {
  const diff = D.questions.find((q) => q.key === 's8_diff')!
  const rev = D.questions.find((q) => q.key === 'm_revise')!
  const counts: Record<string, EvId[]> = {}
  EVS.forEach((e) => String(rev.scores[e] ?? '').split(' | ').filter(Boolean).forEach((o) => { const k = o.replace(/^(\d)단계: /, '$1 '); (counts[k] ??= []).push(e) }))
  const dcount: Record<string, EvId[]> = {}
  EVS.forEach((e) => { const v = diff.scores[e]; if (v) (dcount[String(v)] ??= []).push(e) })
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="rounded-xl border border-g200 p-4">
        <p className="text-t2">리뷰·인터뷰 퍼소나 차이 체감</p>
        <ul className="mt-2 space-y-1.5">{Object.entries(dcount).map(([k, es]) => <li key={k} className="flex items-center justify-between gap-2 text-b2"><span>{k}</span><span className="text-g600">{es.join(' · ')}</span></li>)}</ul>
        <p className="mt-2 text-b3 text-g500">E1은 구버전이라 해당 문항이 없어요. E2는 "두 퍼소나 모두 AI 제작"이라는 설명을 들은 뒤 "비슷하다, 보완점 하나가 달랐다"고 정정했어요.</p>
      </div>
      <div className="rounded-xl border border-g200 p-4">
        <p className="text-t2">보완이 필요하다고 고른 단계</p>
        <ul className="mt-2 space-y-1.5">{Object.entries(counts).sort((a, b) => b[1].length - a[1].length).map(([k, es]) => (
          <li key={k} className="flex items-center gap-2 text-b2">
            <span className="w-6 text-right font-semibold tabular">{es.length}</span>
            <span className="h-2 rounded-full bg-brand" style={{ width: `${es.length * 14}px` }} />
            <span className="min-w-0 flex-1">{k}</span><span className="text-b3 text-g500">{es.join(' ')}</span>
          </li>
        ))}</ul>
      </div>
    </div>
  )
}

function StepView({ step, setStep }: { step: number; setStep: (n: number) => void }) {
  const qs = D.questions.filter((q) => q.step === step)
  const steps = [1, 2, 3, 4, 5, 7]
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-1">
        {steps.map((s) => <Chip key={s} on={s === step} onClick={() => setStep(s)}>{STEP_LABEL[s]}</Chip>)}
      </div>
      {step === 7 && <div className="mb-6"><Step7Extras /></div>}
      <div className="space-y-3">
        {qs.filter((q) => q.kind === 'scale').map((q) => <ScaleBlock key={q.key} q={q} />)}
        {qs.filter((q) => q.kind === 'text' && q.key !== 'm_revise').map((q) => <TextBlock key={q.key} q={q} />)}
      </div>
      <Section title="추가 의견">
        <OralList notes={oralFor(step)} />
      </Section>
      {(step === 4 || step === 5) && <p className="text-b2 text-g600">리뷰별·참여자별 점수는 "리뷰·참여자 판정" 탭에 있어요.</p>}
    </div>
  )
}

/* ───────────────────────── 퍼소나 품질 ───────────────────────── */

function PersonaView() {
  const [open, setOpen] = useState<string | null>(null)
  const dimMean = (p: string, dimNo: number) => mean(EVS.flatMap((e) => Object.entries(D.step6[e]?.[p] ?? {}).filter(([k]) => k.startsWith(`${dimNo}-`)).map(([, v]) => v)))
  const itemMean = (p: string, id: string) => mean(EVS.map((e) => D.step6[e]?.[p]?.[id]).filter((v): v is number => v !== undefined))
  return (
    <div>
      <Note label="안내">6단계는 시간 관계상 모든 평가자가 Primary 2개(리뷰 기반·인터뷰 기반)만 평가했어요. E1은 구버전 문구로 평가했지만 문항 번호는 같아요.</Note>
      <Section title="영역별 평균" lead="7개 영역의 평균이에요. 막대는 1~5점 척도 위치이고, 행을 누르면 문항별 점수가 펼쳐져요.">
        <div className="space-y-1">
          <div className="grid grid-cols-[8rem_1fr_3.5rem_3.5rem_3.5rem] items-center gap-3 px-2 text-b3 text-g500">
            <span>영역</span><span /><span className="text-right" style={{ color: PCOL[PERSONAS[0]] }}>리뷰</span><span className="text-right" style={{ color: PCOL[PERSONAS[1]] }}>인터뷰</span><span className="text-right">차이</span>
          </div>
          {DIMS.map((d) => {
            const a = dimMean(PERSONAS[0], d.no), b = dimMean(PERSONAS[1], d.no)
            const on = open === d.id
            return (
              <div key={d.id} className="rounded-m hover:bg-g50">
                <button onClick={() => setOpen(on ? null : d.id)} aria-expanded={on} className="grid w-full grid-cols-[8rem_1fr_3.5rem_3.5rem_3.5rem] items-center gap-3 px-2 py-2 text-left">
                  <span className="text-b2 font-semibold">{d.no}. {d.title}</span>
                  <span className="relative h-5 rounded-full bg-g100" aria-hidden>
                    {[a, b].map((v, i) => <span key={i} className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white" style={{ left: `${((v - 1) / 4) * 100}%`, background: PCOL[PERSONAS[i]] }} />)}
                    <span className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-g300" style={{ left: `${((Math.min(a, b) - 1) / 4) * 100}%`, width: `${(Math.abs(b - a) / 4) * 100}%` }} />
                  </span>
                  <span className="text-right text-b2 tabular">{f2(a)}</span>
                  <span className="text-right text-b2 tabular">{f2(b)}</span>
                  <span className={`text-right text-b2 font-semibold tabular ${b - a > 0.5 ? 'text-brand' : 'text-g700'}`}>{b - a >= 0 ? '+' : ''}{f2(b - a)}</span>
                </button>
                {on && (
                  <div className="overflow-x-auto px-2 pb-3 scroll-box">
                    <table className="border-separate border-spacing-0">
                      <thead><tr><th className="pr-3 text-left text-b3 font-normal text-g500">문항</th><th />{EVS.map((e) => <EvHead key={e} e={e} />)}<th className="px-1 text-b3 text-g900">평균</th></tr></thead>
                      <tbody>
                        {d.items.flatMap((it) => PERSONAS.map((p, pi) => (
                          <tr key={it.id + p}>
                            <td className="max-w-[18rem] pr-3 align-top text-b3 text-g800">{pi === 0 ? <><b className="font-semibold">{it.id}</b> {it.q}</> : null}</td>
                            <td className="pr-2 text-b3 font-semibold" style={{ color: PCOL[p] }}>{pi === 0 ? '리뷰' : '인터뷰'}</td>
                            {EVS.map((e) => <Cell key={e} v={D.step6[e]?.[p]?.[it.id]} />)}
                            <Cell v={itemMean(p, it.id)} bold />
                          </tr>
                        )))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="평가자별 15문항 평균" lead="E1·E3는 두 퍼소나 모두 2~3점대로 엄격했고, E2·E4는 인터뷰 Primary에 만점을 줬어요. E6만 두 퍼소나를 같은 평균으로 평가했어요.">
        <table className="border-separate border-spacing-0">
          <thead><tr><th />{EVS.map((e) => <EvHead key={e} e={e} />)}</tr></thead>
          <tbody>{PERSONAS.map((p) => (
            <tr key={p}><td className="pr-3 text-b2 font-semibold" style={{ color: PCOL[p] }}>{p}</td>{EVS.map((e) => <Cell key={e} v={Math.round(persona6(e, p) * 100) / 100} bold />)}</tr>
          ))}</tbody>
        </table>
      </Section>

      {PERSONAS.map((p) => {
        const short = p.startsWith('리뷰') ? '리뷰' : '인터뷰'
        const strong = EVS.filter((e) => D.step6Notes[e]?.[p]?.strong)
        const weak = EVS.filter((e) => D.step6Notes[e]?.[p]?.weak)
        const oral = ORAL.filter((o) => o.step === 6 && o.persona === short)
        return (
          <Section key={p} title={`${p}에 대한 의견`}>
            <div className="grid gap-4 lg:grid-cols-2">
              <div><p className="mb-1 text-t2 text-success">가장 설득력 있는 점</p>{strong.length ? <ul>{strong.map((e) => <Quote key={e} e={e} src="서면">{D.step6Notes[e][p].strong}</Quote>)}</ul> : <p className="text-b2 text-g500">서면 응답 없음</p>}</div>
              <div><p className="mb-1 text-t2 text-danger">보완이 필요한 점</p>{weak.length ? <ul>{weak.map((e) => <Quote key={e} e={e} src="서면">{D.step6Notes[e][p].weak}</Quote>)}</ul> : <p className="text-b2 text-g500">서면 응답 없음</p>}</div>
            </div>
            <p className="mb-1 mt-6 text-t2">추가 의견</p>
            <OralList notes={oral} />
          </Section>
        )
      })}

      <Section title="두 퍼소나 공통·출처 관련 의견">
        <OralList notes={ORAL.filter((o) => o.step === 6 && !o.persona)} />
      </Section>

      <Section title="E1 파일럿: 영역별 추가 질문 메모" lead="구버전에서는 영역마다 추가 질문을 받았어요. 상동 답변은 뺐어요.">
        <ul>{D.e1Memos.map((m, i) => <Quote key={i} e="E1" src="서면" extra={<Badge tone={m.persona.startsWith('리뷰') ? 'red' : 'blue'}>{m.persona.startsWith('리뷰') ? '리뷰' : '인터뷰'} · {m.dim}</Badge>}>{m.text}</Quote>)}</ul>
      </Section>
    </div>
  )
}

/* ───────────────────────── 판정 ───────────────────────── */

function AgreeDot({ a }: { a: string }) {
  if (!a) return null
  const c = a === '동의' ? '#52C41A' : a === '부분 동의' ? '#FAAD14' : '#FF4D4F'
  return <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: c }} title={a} />
}
function JudgeTable({ rows, label, personaFilter }: { rows: Judge[]; label: string; personaFilter: string }) {
  const sub = rows.filter((r) => r.persona === personaFilter)
  const ids = [...new Set(sub.map((r) => r.id))]
  const get = (id: string, e: string) => sub.find((r) => r.id === id && r.ev === e)
  const reasons = sub.filter((r) => r.why)
  return (
    <div>
      <div className="overflow-x-auto scroll-box">
        <table className="border-separate border-spacing-0">
          <thead><tr><th className="pr-3 text-left text-b3 font-normal text-g500">{label}</th>{EVS.map((e) => <EvHead key={e} e={e} />)}<th className="px-1 text-b3 text-g900">평균</th><th className="px-2 text-left text-b3 font-normal text-g500">동의 / 부분 / 비동의</th></tr></thead>
          <tbody>{ids.map((id) => {
            const rs = EVS.map((e) => get(id, e))
            const sc = rs.map((r) => r?.score).filter((v): v is number => typeof v === 'number')
            const ag = (k: string) => rs.filter((r) => r?.agree === k).length
            return (
              <tr key={id}>
                <td className="pr-3 text-b2 font-semibold tabular">{label === '리뷰' ? `#${id}` : id}</td>
                {rs.map((r, i) => (
                  <td key={EVS[i]} className="p-0.5" title={r ? `${r.agree || '동의 여부 없음'}${r.why ? ` · ${r.why}` : ''}` : ''}>
                    <div className="flex h-8 min-w-[2.5rem] items-center justify-center rounded-s text-b2 tabular" style={{ background: tone(r?.score ?? NaN).bg, color: tone(r?.score ?? NaN).fg }}>
                      {r?.score ?? '–'}<AgreeDot a={r?.agree ?? ''} />
                    </div>
                  </td>
                ))}
                <Cell v={mean(sc)} bold />
                <td className="px-2 text-b2 text-g700 tabular">{ag('동의')} / {ag('부분 동의')} / {ag('동의 안 함')}</td>
              </tr>
            )
          })}</tbody>
        </table>
      </div>
      <p className="mt-2 text-cap text-g600">점 색: 초록 동의 · 노랑 부분 동의 · 빨강 동의 안 함 · 점이 없으면 동의 여부 미응답</p>
      {reasons.length > 0 && <ul className="mt-3">{reasons.map((r, i) => <Quote key={i} e={r.ev as EvId} src="서면" extra={<Badge>{label === '리뷰' ? `#${r.id}` : r.id}</Badge>}><span className="mr-1 text-g500">{r.score}점 · {r.agree || '–'} ·</span>{r.why}</Quote>)}</ul>}
    </div>
  )
}
function JudgeView() {
  return (
    <div>
      <Section title="4-3 리뷰별 판정: 리뷰 기반 Primary 근거 리뷰" lead="E2부터는 같은 리뷰 5건(#30·82·166·219·614)을 봤어요. E1 파일럿은 구성이 달라 #175·195를 보고 #614는 보지 않았어요.">
        <JudgeTable rows={D.reviewJudge} label="리뷰" personaFilter="리뷰 기반 Primary" />
        <div className="mt-2"><OralList notes={ORAL.filter((o) => o.step === 4.3)} /></div>
      </Section>
      <Section title="E1 파일럿: Secondary 근거 리뷰" lead="파일럿에서만 Secondary 리뷰까지 판정했어요.">
        <div className="space-y-6">
          <JudgeTable rows={D.reviewJudge} label="리뷰" personaFilter="리뷰 기반 Secondary 1" />
          <JudgeTable rows={D.reviewJudge} label="리뷰" personaFilter="리뷰 기반 Secondary 2" />
        </div>
      </Section>
      <Section title="5-3 참여자별 판정: 인터뷰 기반 Primary" lead="U1·U3·U6 발화가 Primary 행동을 얼마나 보여주는지예요. E4는 U1(2점)·U6(3점), E6는 U6(2점)에 낮은 점수를 줬어요.">
        <JudgeTable rows={D.interviewJudge} label="참여자" personaFilter="인터뷰 기반 Primary" />
        <div className="mt-2"><OralList notes={ORAL.filter((o) => o.step === 5.3)} /></div>
      </Section>
      <Section title="E1 파일럿: Secondary 참여자">
        <div className="space-y-6">
          <JudgeTable rows={D.interviewJudge} label="참여자" personaFilter="인터뷰 기반 Secondary 1" />
          <JudgeTable rows={D.interviewJudge} label="참여자" personaFilter="인터뷰 기반 Secondary 2" />
        </div>
      </Section>
    </div>
  )
}

/* ───────────────────────── 평가자별 ───────────────────────── */

const PROFILE_ROWS: [string, string][] = [['age', '연령대'], ['major', '전공'], ['role', '직무'], ['industry', '업종'], ['career', '경력'], ['aiTools', '사용 AI'], ['aiFreq', 'AI 사용 빈도'], ['aiReview', 'AI 결과물 검토'], ['uresMethod', '인터뷰 대신 쓰는 방법'], ['uresWhy', '그 이유·경험'], ['pxMade', '퍼소나 경험'], ['pxAi', 'AI 퍼소나 제작'], ['pxDiff', 'AI 퍼소나 어려움']]

function PersonView({ ev, setEv }: { ev: EvId; setEv: (e: EvId) => void }) {
  const m = META[ev]
  const pf = D.profile[ev] ?? {}
  const steps = [1, 2, 3, 4, 5, 7]
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-1">{EVS.map((e) => <Chip key={e} on={e === ev} onClick={() => setEv(e)}>{e}</Chip>)}</div>
      <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
        <aside className="h-fit rounded-xl border border-g200 p-4">
          <p className="text-t1">{m.id}</p>
          <p className="mt-0.5 text-b3 text-g600">{m.date}</p>
          <dl className="mt-4 space-y-2 border-t border-g200 pt-3">
            {PROFILE_ROWS.filter(([k]) => pf[k]).map(([k, l]) => (
              <div key={k}><dt className="text-b3 text-g500">{l}</dt><dd className="text-b2 text-g900">{pf[k]}</dd></div>
            ))}
          </dl>
          {D.step6Order[ev] && <p className="mt-3 border-t border-g200 pt-3 text-b3 text-g600">6단계 제시 순서: {D.step6Order[ev]}</p>}
        </aside>
        <div className="min-w-0 space-y-8">
          {steps.map((s) => {
            const qs = D.questions.filter((q) => q.step === s && (q.scores[ev] !== undefined || q.why[ev]))
            const oral = ORAL.filter((o) => o.ev === ev && Math.floor(o.step) === s)
            if (!qs.length && !oral.length) return null
            return (
              <section key={s}>
                <h3 className="mb-2 text-t1">{STEP_LABEL[s]}</h3>
                <ul>
                  {qs.map((q) => (
                    <li key={q.key} className="flex gap-3 border-b border-g200 py-2">
                      {q.kind === 'scale'
                        ? <div className="w-10 shrink-0"><div className="flex h-8 items-center justify-center rounded-s text-b2 font-semibold tabular" style={{ background: tone(q.scores[ev] as number).bg, color: tone(q.scores[ev] as number).fg }}>{q.scores[ev] ?? '–'}</div></div>
                        : <div className="w-10 shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-b2 font-semibold text-g900">{q.label}</p>
                        {q.kind !== 'scale' && <p className="whitespace-pre-line text-b2 text-g800">{String(q.scores[ev])}</p>}
                        {q.why[ev] && <p className="whitespace-pre-line text-b2 text-g700">{q.why[ev]}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
                {oral.length > 0 && <div className="mt-2"><OralList notes={oral} /></div>}
              </section>
            )
          })}
          <section>
            <h3 className="mb-2 text-t1">6 최종 퍼소나 품질</h3>
            <table className="border-separate border-spacing-0">
              <thead><tr><th />{DIMS.map((d) => <th key={d.id} className="px-0.5 text-b3 font-normal text-g600">{d.title}</th>)}<th className="px-1 text-b3 text-g900">평균</th></tr></thead>
              <tbody>{PERSONAS.map((p) => (
                <tr key={p}>
                  <td className="pr-3 text-b2 font-semibold" style={{ color: PCOL[p] }}>{p.startsWith('리뷰') ? '리뷰' : '인터뷰'}</td>
                  {DIMS.map((d) => <Cell key={d.id} v={Math.round(mean(d.items.map((it) => D.step6[ev]?.[p]?.[it.id]).filter((v): v is number => v !== undefined)) * 100) / 100} />)}
                  <Cell v={Math.round(persona6(ev, p) * 100) / 100} bold />
                </tr>
              ))}</tbody>
            </table>
            <ul className="mt-3">
              {PERSONAS.flatMap((p) => (['strong', 'weak'] as const).filter((k) => D.step6Notes[ev]?.[p]?.[k]).map((k) => (
                <Quote key={p + k} e={ev} src="서면" extra={<Badge tone={k === 'strong' ? 'green' : 'red'}>{p.startsWith('리뷰') ? '리뷰' : '인터뷰'} {k === 'strong' ? '강점' : '보완'}</Badge>}>{D.step6Notes[ev][p][k]}</Quote>
              )))}
            </ul>
            <div className="mt-2"><OralList notes={ORAL.filter((o) => o.ev === ev && o.step === 6)} /></div>
            {ev === 'E1' && <Disclosure summary={`영역별 추가 질문 메모 ${D.e1Memos.length}건`} className="mt-3"><ul>{D.e1Memos.map((x, i) => <Quote key={i} e="E1" src="서면" extra={<Badge>{x.dim}</Badge>}>{x.text}</Quote>)}</ul></Disclosure>}
          </section>
          {ORAL.some((o) => o.ev === ev && o.step === 0) && (
            <section><h3 className="mb-2 text-t1">사전 질문 관련</h3><OralList notes={ORAL.filter((o) => o.ev === ev && o.step === 0)} /></section>
          )}
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── 데이터 메모 ───────────────────────── */

function DataView() {
  return (
    <div>
      <Section title="평가자별 자료와 병합 방식">
        <div className="overflow-x-auto scroll-box">
          <table className="w-full min-w-[40rem] text-left text-b2">
            <thead className="text-b3 text-g500"><tr className="border-b border-g200"><th className="py-2 pr-3 font-normal">평가자</th><th className="pr-3 font-normal">날짜</th><th className="pr-3 font-normal">녹취</th><th className="font-normal">병합·유의 사항</th></tr></thead>
            <tbody>{EV_META.map((m) => (
              <tr key={m.id} className="border-b border-g200 align-top">
                <td className="whitespace-nowrap py-2.5 pr-3 font-semibold">{m.id}</td>
                <td className="whitespace-nowrap pr-3 tabular">{m.date}</td>
                <td className="whitespace-nowrap pr-3"><Badge tone={m.recording === 'ok' ? 'green' : m.recording === 'none' ? 'red' : 'orange'}>{m.recordingNote}</Badge></td>
                <td className="py-2.5 text-g800">{m.merge}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Section>
      <Section title="집계 기준">
        <ul className="max-w-prose2 list-disc space-y-1.5 pl-5 text-b2 text-g800">
          <li>시트의 단계별 탭에서 같은 평가자의 여러 제출을 순서대로 합쳤어요. 같은 칸에 값이 두 번 있으면 나중 값을 썼어요.</li>
          <li>받은 JSON 파일 7개(E2 1, E3 1, E4 2, E5 1, E6 2)를 시트 값과 대조했어요. E2의 6단계 리뷰 Primary 3-2 한 칸(JSON 5, 시트 3)만 다르고 나머지는 모두 같아요. 시트가 몇 초 뒤의 실제 제출본이라 시트 값을 썼어요.</li>
          <li>평균은 응답한 사람만으로 계산해서 문항마다 n이 달라요. 표의 n을 같이 봐 주세요.</li>
          <li>E1은 구버전 문항이라 현행 문항과 1:1로 대응되는 값만 들어가 있어요(예: 7단계 Q2·Q5·Q6·Q12). 7단계 Q10(보완 가치)·Q11(대체 어려움)은 구버전에 없던 문항이라 연구자가 녹취를 참고해 추가 입력했어요(2점·4점).</li>
          <li>7단계 종합 문항(연구 목적 달성 적절성과 그 이유)은 결과에서 뺐어요.</li>
          <li>7단계 Q11은 역문항이라 점수가 높을수록 "대체하기 어렵다"는 뜻이에요.</li>
        </ul>
      </Section>
    </div>
  )
}

/* ───────────────────────── 페이지 ───────────────────────── */

type TabId = 'overview' | 'steps' | 'persona' | 'judge' | 'people' | 'data'
const TABS: TabId[] = ['overview', 'steps', 'persona', 'judge', 'people', 'data']
const TAB_LABEL: Record<TabId, string> = { overview: '한눈에 보기', steps: '단계별 결과', persona: '6단계 퍼소나 품질', judge: '리뷰·참여자 판정', people: '평가자별', data: '데이터 메모' }

export default function Results() {
  const [tab, setTab] = useState<TabId>('overview')
  const [step, setStep] = useState(1)
  const [ev, setEv] = useState<EvId>('E1')
  const go = useMemo(() => (t: TabId, s?: number, e?: EvId) => {
    setTab(t)
    if (s !== undefined && t === 'steps') setStep(s === 6 ? 7 : s)
    if (e) setEv(e)
    window.scrollTo(0, 0)
  }, [])
  return (
    <div>
      <PageHead step="연구자용" title="전문가 평가 결과">
        전문가 6명(E1~E6)의 평가 결과를 한곳에 모았어요.
      </PageHead>
      <Tabs label="결과 보기" items={TABS} value={tab} onChange={(t) => setTab(t)} render={(t) => TAB_LABEL[t]} />
      <div className="mt-8">
        {tab === 'overview' && <Overview go={go} />}
        {tab === 'steps' && <StepView step={step} setStep={setStep} />}
        {tab === 'persona' && <PersonaView />}
        {tab === 'judge' && <JudgeView />}
        {tab === 'people' && <PersonView ev={ev} setEv={setEv} />}
        {tab === 'data' && <DataView />}
      </div>
    </div>
  )
}

