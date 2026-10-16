import { CheckCircle2, CircleAlert, X } from 'lucide-react'
import { useEffect } from 'react'
import type { ToastMessage } from '../types'

type ToastProps = {
  toast: ToastMessage | null
  onDismiss: () => void
}

export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(onDismiss, 3800)
    return () => window.clearTimeout(timeout)
  }, [toast, onDismiss])

  if (!toast) return null
  const Icon = toast.type === 'success' ? CheckCircle2 : CircleAlert

  return (
    <div role="status" aria-live="polite" className="fixed bottom-5 right-5 z-[80] flex w-[calc(100%-2.5rem)] max-w-sm items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-16px_rgba(15,23,42,.3)]">
      <Icon size={20} className={toast.type === 'success' ? 'mt-0.5 shrink-0 text-emerald-600' : 'mt-0.5 shrink-0 text-rose-500'} />
      <div className="min-w-0 flex-1"><p className="text-[13px] font-semibold text-slate-900">{toast.title}</p><p className="mt-1 text-[12px] leading-5 text-slate-500">{toast.description}</p></div>
      <button type="button" aria-label="Fermer la notification" onClick={onDismiss} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={15} /></button>
    </div>
  )
}
