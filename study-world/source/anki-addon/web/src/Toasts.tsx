import { useToasts } from './store.ts'

export function Toasts() {
  const toasts = useToasts()
  if (!toasts.length) return null
  return (
    <div className="lw-toasts" role="status">
      {toasts.map((t) => <div key={t.id} className="pix-note lw-toast">{t.text}</div>)}
    </div>
  )
}
