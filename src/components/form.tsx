import type { Field } from '../lib/protocol'
import { TextArea, TextField } from './ui'

/** Renders one protocol question. Multi-select answers are stored as "a | b"; "기타" text under `${id}_other`. */
export function FieldInput({ f, get, set, no }: { f: Field; get: (id: string) => string; set: (id: string, v: string) => void; no?: string }) {
  const v = get(f.id) ?? ''
  if (f.showIf && get(f.showIf.id) !== f.showIf.value) return null
  const picked = v ? v.split(' | ') : []
  const toggle = (o: string) => set(f.id, (picked.includes(o) ? picked.filter((x) => x !== o) : [...picked, o]).join(' | '))
  const opt = (o: string, on: boolean, onClick: () => void, multi: boolean) => (
    <button key={o} type="button" role={multi ? 'checkbox' : 'radio'} aria-checked={on} onClick={onClick}
      className={`inline-flex min-h-8 items-center gap-2 rounded-m border px-3 py-1 text-left text-b2 transition-colors duration-200 ${on ? 'border-brand bg-brand-weak text-brand' : 'border-g300 bg-white text-g900 hover:border-brand-hover hover:text-brand-hover'}`}>
      <span aria-hidden className={`flex h-4 w-4 shrink-0 items-center justify-center border ${multi ? 'rounded-xs' : 'rounded-full'} ${on ? 'border-brand bg-brand' : 'border-g300 bg-white'}`}>
        {on && (multi ? <svg viewBox="0 0 12 12" className="h-2.5 w-2.5"><path d="M2.5 6.2l2.3 2.3 4.7-5" fill="none" stroke="#fff" strokeWidth="1.8" /></svg> : <span className="h-1.5 w-1.5 rounded-full bg-white" />)}
      </span>
      {o}
    </button>
  )
  return (
    <div className="py-4">
      <p className="text-b2 text-g900">{no && <b className="mr-1.5 font-semibold text-brand">{no}</b>}{f.q}</p>
      {f.hint && <p className="mt-0.5 text-b3 text-g600">{f.hint}</p>}
      <div className="mt-2.5">
        {f.type === 'text' && <TextField value={v} onChange={(e) => set(f.id, e.target.value)} className="max-w-md" aria-label={f.q} />}
        {f.type === 'textarea' && <TextArea value={v} onChange={(e) => set(f.id, e.target.value)} rows={3} aria-label={f.q} placeholder="답변 메모" />}
        {(f.type === 'radio' || f.type === 'select') && (
          <div role="radiogroup" aria-label={f.q} className="flex flex-wrap gap-2">
            {[...(f.options ?? []), ...(f.other ? ['기타'] : [])].map((o) => opt(o, v === o, () => set(f.id, v === o ? '' : o), false))}
          </div>
        )}
        {f.type === 'checks' && (
          <div role="group" aria-label={f.q} className="flex flex-wrap gap-2">
            {[...(f.options ?? []), ...(f.other ? ['기타'] : [])].map((o) => opt(o, picked.includes(o), () => toggle(o), true))}
          </div>
        )}
        {f.other && (v === '기타' || picked.includes('기타')) && (
          <TextField value={get(`${f.id}_other`) ?? ''} onChange={(e) => set(`${f.id}_other`, e.target.value)} placeholder="기타 내용" className="mt-2 max-w-md" aria-label={`${f.q} 기타`} />
        )}
      </div>
    </div>
  )
}

export function FieldList({ fields, get, set, prefix = 'Q' }: { fields: Field[]; get: (id: string) => string; set: (id: string, v: string) => void; prefix?: string }) {
  let n = 0
  return (
    <div className="divide-y divide-g200">
      {fields.map((f) => {
        if (f.showIf && get(f.showIf.id) !== f.showIf.value) return null
        n += 1
        return <FieldInput key={f.id} f={f} get={get} set={set} no={`${prefix}${n}`} />
      })}
    </div>
  )
}
