import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { PCOLOR, study } from '../lib/data'
import { NextStep, PageHead, PersonaPill } from '../components/ui'

const pick = (u: (typeof study.participants)[number], k: string) => u.info.find((x) => x.k === k)?.v ?? ''

export default function Interviews() {
  const ps = study.participants
  const { hash } = useLocation()
  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 50)
  }, [hash])
  return (
    <div>
      <PageHead step={3} title="정성 인터뷰">
        부스터프로 사용자 6명(U1~U6)을 심층 인터뷰했습니다. 녹취는 U1·U4·U5만 있고, U2·U3·U6은 인터뷰 기록지를 근거로 했습니다. 개인정보를 지우고 프로필 요약과 대표 발화만 싣습니다.
      </PageHead>

      <div className="overflow-x-auto rounded-xl border border-rule bg-white">
        <table className="w-full min-w-[40rem] text-left text-[0.9rem]">
          <thead className="border-b border-rule text-[0.8rem] text-slate">
            <tr>{['참여자', '기본 정보', '사용 제품', '사용 기간', '사용 빈도·시간', '그룹'].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {ps.map((u) => (
              <tr key={u.id}>
                <td className="px-3 py-2.5"><a href={`#${u.id}`} className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[0.75rem] font-bold text-white" style={{ background: PCOLOR[u.id] }}>{u.id.slice(1)}</a></td>
                <td className="px-3 py-2.5">{pick(u, '기본 정보')}</td>
                <td className="px-3 py-2.5">{pick(u, '사용 제품')}</td>
                <td className="px-3 py-2.5">{pick(u, '사용 기간')}</td>
                <td className="px-3 py-2.5 text-[0.85rem]">{pick(u, '현재 사용 빈도·시간')}</td>
                <td className="px-3 py-2.5"><PersonaPill id={u.group} withName={false} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 space-y-10">
        {ps.map((u) => (
          <article key={u.id} id={u.id} className="scroll-mt-20 rounded-xl border border-rule bg-white p-5 sm:p-7">
            <header className="mb-5 flex flex-wrap items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full font-bold text-white" style={{ background: PCOLOR[u.id] }}>{u.id.slice(1)}</span>
              <div>
                <h2 className="font-serif text-[1.25rem] font-bold leading-snug">{u.id} · {u.title}</h2>
                <p className="text-[0.8rem] text-slate">근거 자료: {u.source}</p>
              </div>
              <span className="ml-auto"><PersonaPill id={u.group} /></span>
            </header>

            <div className="grid gap-8 lg:grid-cols-2">
              <dl className="space-y-2 text-[0.9rem]">
                {u.info.filter((x) => x.k !== '기본 정보').map((x) => (
                  <div key={x.k} className="grid grid-cols-[7.5rem_1fr] gap-3">
                    <dt className="text-slate">{x.k}</dt><dd>{x.v}</dd>
                  </div>
                ))}
              </dl>
              <div>
                <h3 className="mb-2 text-sm font-semibold">대표 발화</h3>
                <ul className="space-y-3">
                  {u.quotes.map((q, i) => (
                    <li key={i} className="border-l-2 pl-3 font-serif text-[0.98rem] leading-relaxed" style={{ borderColor: PCOLOR[u.id] }}>“{q}”</li>
                  ))}
                </ul>
                <h3 className="mb-2 mt-6 text-sm font-semibold">Pain point</h3>
                <ul className="space-y-2.5 text-[0.9rem]">
                  {u.pains.map((p) => (
                    <li key={p.title}><p className="font-semibold">{p.title}</p><p className="text-slate">{p.detail}</p></li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
      <NextStep to="/variables" label="4 행동 변수·그룹" />
    </div>
  )
}
