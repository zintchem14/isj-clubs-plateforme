import { Bell, ChevronDown, Menu, Search, Sparkles } from 'lucide-react'

type NavbarProps = {
  onMenu: () => void
  search: string
  onSearch: (value: string) => void
  onNotice: () => void
}

export function Navbar({ onMenu, search, onSearch, onNotice }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[#f7f8f5]/90 backdrop-blur-xl">
      <div className="flex h-[72px] items-center justify-between gap-3 px-4 sm:px-7 lg:px-9">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" aria-label="Ouvrir le menu" onClick={onMenu} className="rounded-xl p-2 text-slate-600 hover:bg-white md:hidden"><Menu size={20} /></button>
          <div className="hidden items-center gap-2 text-[12px] text-slate-400 sm:flex">
            <span>Administration</span><span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-700">Les clubs</span>
          </div>
          <div className="relative w-full max-w-[240px] sm:hidden">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input aria-label="Rechercher un club" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Rechercher..." className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-emerald-400" />
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <label className="relative hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input aria-label="Rechercher un club" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Rechercher un club..." className="h-10 w-[230px] rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[12px] outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/70" />
          </label>
          <button type="button" onClick={onNotice} aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-slate-300">
            <Bell size={17} /><span className="absolute right-[9px] top-[8px] h-1.5 w-1.5 rounded-full bg-orange-400 ring-2 ring-white" />
          </button>
          <div className="hidden items-center gap-2.5 border-l border-slate-200 pl-3 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1d4b3] text-[11px] font-bold text-[#593d2d]">AM</div>
            <div className="leading-tight"><p className="text-[11px] font-semibold text-slate-800">Aïcha Mballa</p><p className="mt-1 text-[10px] text-slate-400">Administratrice</p></div>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e9f3dd] text-[#5d843d] sm:hidden"><Sparkles size={16} /></span>
        </div>
      </div>
    </header>
  )
}
