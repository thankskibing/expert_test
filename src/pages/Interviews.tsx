import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { PCOLOR, study } from '../lib/data'
import { Badge, PageHead, PersonaPill } from '../components/ui'

const pick = (u: (typeof study.participants)[number], k: string) => u.info.find((x) => x.k === k)?.v ?? ''

function Avatar({ id, size = 36 }: { id: string; size?: number }) {
  return <span className="flex shrink-0 items-center justify-center rounded-l text-b2 font-bold text-white" style={{ width: size, height: size, background: PCOLOR[id] }}>{id.slice(1)}</span>
}

export default function Interviews() {
  const ps = study.participants
  const { hash } = useLocation()
  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 50)
  }, [hash])
  return (
    <div>
      <PageHead title="정성 인터뷰">
        부스터프로 사용자 6명(U1~U6)을 심층 인터뷰했어요. 개인정보는 지우고 프로필 요약과 대표 발화만 보여드려요.
      </PageHead>

      <ul className="divide-y divide-g200 rounded-2xl border border-g200">
        {ps.map((u) => (
          <li key={u.id}>
            <a href={`#${u.id}`} className="flex items-center gap-3.5 px-5 py-3.5 transition-colors duration-200 hover:bg-g50">
              <Avatar id={u.id} size={40} />
              <div className="min-w-0 flex-1">
                <p className="text-b2 font-semibold text-g900">{u.id} · {pick(u, '기본 정보')}</p>
                <p className="truncate text-b3 text-g600">{pick(u, '사용 제품')} · {pick(u, '사용 기간')} · {pick(u, '현재 사용 빈도·시간')}</p>
              </div>
              <span className="hidden sm:block"><PersonaPill id={u.group} withName={false} /></span>
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-12 space-y-6">
        {ps.map((u) => (
          <article key={u.id} id={u.id} className="scroll-mt-20 rounded-3xl bg-g50 p-5 sm:p-8">
            <header className="mb-6 flex flex-wrap items-center gap-3">
              <Avatar id={u.id} size={44} />
              <div className="min-w-0">
                <h2 className="text-h3">{u.id} · {u.title}</h2>
              </div>
              <span className="ml-auto"><PersonaPill id={u.group} /></span>
            </header>

            <div className="grid gap-6 lg:grid-cols-2">
              <dl className="divide-y divide-g200 rounded-2xl bg-white px-5 text-b3">
                {u.info.filter((x) => x.k !== '기본 정보').map((x) => (
                  <div key={x.k} className="grid grid-cols-[7.5rem_1fr] gap-3 py-3">
                    <dt className="text-g600">{x.k}</dt><dd className="text-g900">{x.v}</dd>
                  </div>
                ))}
              </dl>
              <div>
                <h3 className="mb-3 text-t2">대표 발화</h3>
                <ul className="space-y-2">
                  {u.quotes.map((q, i) => (
                    <li key={i} className="rounded-xl border border-g200 bg-white px-4 py-3 text-b2 text-g900">{q}</li>
                  ))}
                </ul>
                <h3 className="mb-3 mt-8 text-t2">Pain point</h3>
                <ul className="space-y-3">
                  {u.pains.map((p) => (
                    <li key={p.title}>
                      <p className="flex items-start gap-2 text-b2 font-semibold text-g900"><Badge tone="red">Pain</Badge><span>{p.title}</span></p>
                      <p className="mt-1 text-b3 text-g600">{p.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
