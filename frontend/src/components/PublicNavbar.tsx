import { ArrowUpRight, BookOpen, Menu, X } from 'lucide-react'
import { useState } from 'react'

type PublicNavbarProps = {
  onNavigate: (section: string) => void
}

const links = [
  { label: 'Les clubs', href: '#clubs' },
  { label: 'Agenda', href: '#agenda' },
  { label: 'La vie du campus', href: '#moments' },
]

export function PublicNavbar({ onNavigate }: PublicNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-[#fafaf7]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 sm:px-8">
        <a href="#accueil" onClick={() => onNavigate('#accueil')} className="flex items-center gap-2.5" aria-label="Campus vivant, accueil">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#214633] text-[#d5f28a]"><BookOpen size={18} /></span>
          <span className="text-[15px] font-extrabold tracking-[-0.045em] text-[#20382a]">campus<span className="text-[#699455]">vivant</span><span className="ml-1 align-top text-[9px] font-medium tracking-wide text-slate-400">ISJ</span></span>
        </a>
        <nav aria-label="Navigation principale" className="hidden items-center gap-8 md:flex">
          {links.map((link) => <a key={link.href} href={link.href} onClick={() => onNavigate(link.href)} className="text-[12px] font-medium text-slate-600 transition hover:text-[#386644]">{link.label}</a>)}
        </nav>
        <a href="#agenda" onClick={() => onNavigate('#agenda')} className="hidden h-10 items-center gap-2 rounded-full bg-[#214633] px-4 text-[11px] font-semibold text-white transition hover:bg-[#315a41] sm:flex">Prochains événements <ArrowUpRight size={14} /></a>
        <button type="button" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menuOpen} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden">{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>
      </div>
      {menuOpen && (
        <nav aria-label="Navigation mobile" className="absolute left-0 right-0 top-full border-t border-slate-100 bg-[#fafaf7] px-5 py-3 shadow-lg md:hidden">
          {links.map((link) => <a key={link.href} href={link.href} onClick={() => { setMenuOpen(false); onNavigate(link.href) }} className="block rounded-xl px-3 py-3 text-[13px] font-medium text-slate-700 hover:bg-white">{link.label}</a>)}
        </nav>
      )}
    </header>
  )
}
