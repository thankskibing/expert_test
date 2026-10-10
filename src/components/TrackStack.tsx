import { useLayoutEffect, useRef, useState } from 'react'
import { PCOLOR, type Track } from '../lib/data'

interface Props {
  tracks: Track[]
  ids: string[] // ids drawn on each track (A/B/C or U1..U6)
  scale?: number // divide positions by this (data vars use 0..4)
  paths: string[] // ids whose path is drawn through all tracks
  focus?: string[] | null // ids kept at full opacity (others dimmed); defaults to paths
  label?: (id: string) => string
  showArea?: boolean
}

/** Stacked behavior-variable scales with one dot per group, and a path that threads the active group's dots. */
export default function TrackStack({ tracks, ids, scale = 1, paths, focus, label = (id) => id.replace('U', ''), showArea }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const lines = useRef<(HTMLDivElement | null)[]>([])
  const [pts, setPts] = useState<Record<string, { x: number; y: number }[]>>({})
  const keep = focus ?? (paths.length ? paths : null)
  const pkey = paths.join(',')

  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const measure = () => {
      const base = el.getBoundingClientRect()
      const next: Record<string, { x: number; y: number }[]> = {}
      for (const id of paths) {
        next[id] = []
        tracks.forEach((t, i) => {
          const ln = lines.current[i]
          const v = t.pos[id]
          if (!ln || v === undefined) return
          const r = ln.getBoundingClientRect()
          next[id].push({ x: r.left - base.left + (v / scale) * r.width, y: r.top - base.top + r.height / 2 + offsetFor(t, id, scale) })
        })
      }
      setPts(next)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks, pkey, scale])

  let lastArea: string | undefined
  return (
    <div ref={wrap} className="relative">
      {Object.keys(pts).length > 0 && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          {Object.entries(pts).filter(([, p]) => p.length > 1).map(([id, p]) => (
            <polyline key={id} points={p.map((q) => `${q.x},${q.y}`).join(' ')} fill="none" stroke={PCOLOR[id]} strokeWidth={2} strokeOpacity={0.55} />
          ))}
        </svg>
      )}
      {tracks.map((t, i) => {
        const areaHead = showArea && t.area && t.area !== lastArea
        lastArea = t.area
        return (
          <div key={t.key}>
            {areaHead && <p className="mb-1 mt-6 text-b3 font-semibold text-g600 first:mt-0">{t.area}</p>}
            <div className="border-b border-g200 py-3.5 last:border-0">
              <p className="mb-2 text-b2 font-semibold text-g900">{t.name}</p>
              <div className="grid grid-cols-[1fr] items-center gap-x-3 sm:grid-cols-[8.5rem_1fr_8.5rem]">
                <span className="hidden text-right text-b3 leading-tight text-g600 sm:block">{t.left}</span>
                <div className="relative h-8" ref={(n) => { lines.current[i] = n }}>
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-g200" />
                  <div className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-g200" />
                  <div className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-g200" />
                  {ids.filter((id) => t.pos[id] !== undefined).map((id) => {
                    const dim = keep && !keep.includes(id)
                    return (
                      <span
                        key={id}
                        title={`${id}: ${t.name}`}
                        className="absolute flex h-[22px] w-[22px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-bold text-white ring-2 ring-white transition-opacity"
                        style={{ left: `${(t.pos[id] / scale) * 100}%`, top: `calc(50% + ${offsetFor(t, id, scale)}px)`, background: PCOLOR[id], opacity: dim ? 0.28 : 1, zIndex: keep?.includes(id) ? 2 : 1 }}
                      >
                        {label(id)}
                      </span>
                    )
                  })}
                </div>
                <span className="hidden text-b3 leading-tight text-g600 sm:block">{t.right}</span>
                <div className="mt-4 flex justify-between gap-4 text-cap text-g600 sm:hidden">
                  <span>{t.left}</span>
                  <span className="text-right">{t.right}</span>
                </div>
              </div>
              {t.note && <p className="mt-1.5 text-cap text-g600">{t.note}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Dots closer than 3.5% of the track get nudged up/down so each stays readable. */
function offsetFor(t: Track, id: string, scale: number) {
  const entries = Object.entries(t.pos).sort((a, b) => a[1] - b[1])
  let flip = 0
  let prev = -1
  for (const [k, v] of entries) {
    const x = v / scale
    flip = prev >= 0 && x - prev < 0.035 ? flip + 1 : 0
    prev = x
    if (k === id) return flip === 0 ? 0 : flip % 2 === 1 ? -9 : 9
  }
  return 0
}
