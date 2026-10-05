import { useSearchParams } from 'react-router-dom'
import { COMPARE_QS, ROUNDS, type RoundKey } from '../lib/protocol'
import { useEval, xy } from '../lib/evalStore'
import PersonaCard from '../components/PersonaCard'
import { FieldList } from '../components/form'
import { RoundTabs, StepNav } from '../components/flow'
import { PageHead } from '../components/ui'

export default function Compare() {
  const { state, setCompare } = useEval()
  const [sp, setSp] = useSearchParams()
  const rKey = (ROUNDS.some((r) => r.key === sp.get('r')) ? sp.get('r') : 'primary') as RoundKey
  const idx = ROUNDS.findIndex((r) => r.key === rKey)
  const round = ROUNDS[idx]
  const { X, Y } = xy(state, round)
  const done = (k: RoundKey) => !!state.compare[k]?.c_pick
  const go = (k: RoundKey) => { setSp({ r: k }, { replace: true }); window.scrollTo(0, 0) }
  const nextRound = ROUNDS[idx + 1]

  return (
    <div>
      <PageHead step={2} title="퍼소나 비교">
        같은 제품인 메디큐브 부스터 프로 사용자를 대상으로 만든 두 퍼소나예요. 하나는 온라인 사용자 리뷰 데이터, 다른 하나는 사용자 인터뷰 데이터를 기반으로 생성형 AI를 활용해 제작했어요. 어떤 퍼소나가 어떤 데이터로 만들어졌는지는 아직 알려드리지 않아요. 두 퍼소나를 충분히 살펴보신 뒤 답해 주세요.
      </PageHead>

      <RoundTabs value={rKey} onChange={go} done={done} />

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <PersonaCard id={X} label="X" blind />
        <PersonaCard id={Y} label="Y" blind />
      </div>

      <section className="mt-8 rounded-xl border border-g200 bg-g50 px-5 py-2 sm:px-6">
        <h2 className="pt-4 text-t1">{round.label} 퍼소나 쌍에 대한 질문</h2>
        <FieldList fields={COMPARE_QS} get={(id) => state.compare[rKey]?.[id] ?? ''} set={(id, v) => setCompare(rKey, id, v)} />
      </section>

      {nextRound
        ? <StepNav prev={idx === 0 ? '/profile' : undefined} nextLabel={`${nextRound.label} 퍼소나 쌍 보기`} onNext={() => go(nextRound.key)} hint={`${ROUNDS.filter((r) => done(r.key)).length}/3 쌍 응답`} />
        : <StepNav next="/evidence" nextLabel="제작 데이터 확인하기" hint={`${ROUNDS.filter((r) => done(r.key)).length}/3 쌍 응답`} />}
    </div>
  )
}
