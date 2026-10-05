import { PROFILE } from '../lib/protocol'
import { useEval } from '../lib/evalStore'
import { FieldList } from '../components/form'
import { StepNav } from '../components/flow'
import { PageHead } from '../components/ui'

export default function Profile() {
  const { state, setProfile } = useEval()
  const get = (id: string) => state.profile[id] ?? ''
  return (
    <div>
      <PageHead step={1} title="기본 프로필과 AI 활용 경험">
        연구 참여자의 실무 배경과 생성형 AI 활용 경험을 확인해요. 답하기 어려운 질문은 넘어가셔도 돼요.
      </PageHead>
      {PROFILE.map((sec) => (
        <section key={sec.title} className="mb-10">
          <h2 className="text-h3">{sec.title}</h2>
          {sec.lead && <p className="mt-1 text-b2 text-g600">{sec.lead}</p>}
          <div className="mt-2 max-w-3xl"><FieldList fields={sec.fields} get={get} set={setProfile} /></div>
        </section>
      ))}
      <StepNav prev="/" next="/compare" nextLabel="퍼소나 비교 시작하기" />
    </div>
  )
}
