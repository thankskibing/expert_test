import { PROFILE } from '../lib/protocol'
import { useEval } from '../lib/evalStore'
import { nextLabel } from '../lib/steps'
import { FieldList } from '../components/form'
import { StepNav } from '../components/flow'
import { PageHead } from '../components/ui'

export default function Profile() {
  const { state, setProfile } = useEval()
  const get = (id: string) => state.profile[id] ?? ''
  return (
    <div>
      <PageHead step="0단계 · 사전 질문" title="실무 배경과 생성형 AI 활용 경험">
        연구 참여자의 실무 배경과 생성형 AI 활용 경험을 확인해요. 답하기 어려운 질문은 넘어가셔도 돼요.
      </PageHead>
      {PROFILE.map((sec, i) => (
        <section key={sec.title} className="mb-10">
          <h2 className="text-h3">{sec.title}</h2>
          {sec.lead && <p className="mt-1 text-b2 text-g600">{sec.lead}</p>}
          {/* 섹션마다 Q1부터 다시 세면 녹취에서 구분이 어려워서, 섹션 번호를 붙인 고유 번호(0-2-Q3 등)를 써요. */}
          <div className="mt-2 max-w-3xl"><FieldList fields={sec.fields} get={get} set={setProfile} prefix={`0-${i + 1}-Q`} /></div>
        </section>
      ))}
      <StepNav prev="/" next="/step1" nextLabel={nextLabel(1)} />
    </div>
  )
}
