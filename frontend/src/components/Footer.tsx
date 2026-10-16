import { Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200/80 py-5">
      <div className="flex flex-col items-center justify-between gap-2 text-center text-[10px] text-slate-400 sm:flex-row sm:text-left">
        <p>© 2026 Campus Clubs · Fait avec <Heart size={11} className="mx-0.5 inline text-rose-400" fill="currentColor" /> pour la vie étudiante.</p>
        <p>La vie du campus, c’est vous qui la faites.</p>
      </div>
    </footer>
  )
}
