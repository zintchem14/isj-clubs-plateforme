import { BookOpen, CalendarDays, ChevronLeft, ChevronRight, CircleHelp, LayoutDashboard, Users, X } from 'lucide-react'

type SidebarProps = {
  open: boolean
  collapsed: boolean
  onClose: () => void
  onToggle: () => void
  onClubs: () => void
  active: 'clubs' | 'other'
}

export function Sidebar({ open, collapsed, onClose, onToggle, onClubs, active }: SidebarProps) {
  const widthClass = collapsed ? 'md:w-[92px]' : 'md:w-[264px]'
  const menuItems = [
    { label: 'Vue d’ensemble', icon: LayoutDashboard, disabled: true },
    { label: 'Les clubs', icon: Users, disabled: false },
    { label: 'Inscriptions', icon: BookOpen, disabled: true },
    { label: 'Événements', icon: CalendarDays, disabled: true },
  ]

  return (
    <>
      {open && <button aria-label="Fermer le menu" className="fixed inset-0 z-40 bg-slate-950/40 md:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[#172820] px-4 py-5 text-white transition-all duration-300 ${widthClass} ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className={`flex h-12 items-center ${collapsed ? 'md:justify-center' : 'justify-between'} px-2`}>
          <a href="#" onClick={(event) => { event.preventDefault(); onClubs() }} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#c6f06b] text-[#1a3025]">
              <BookOpen size={19} strokeWidth={2.4} />
            </span>
            <span className={collapsed ? 'md:hidden' : ''}>
              <span className="block text-[15px] font-bold tracking-tight">campus<span className="text-[#c6f06b]">clubs</span></span>
              <span className="block text-[10px] font-medium tracking-[0.16em] text-white/45">ESPACE ADMIN</span>
            </span>
          </a>
          <button aria-label="Fermer le menu" onClick={onClose} className="rounded-lg p-2 text-white/55 hover:bg-white/10 md:hidden"><X size={18} /></button>
        </div>

        <div className={`mb-3 mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35 ${collapsed ? 'md:text-center' : ''}`}>
          {collapsed ? <span className="md:hidden">Espace de travail</span> : 'Espace de travail'}
          {collapsed && <span className="hidden md:inline">···</span>}
        </div>
        <nav aria-label="Navigation principale" className="space-y-1">
          {menuItems.map(({ label, icon: Icon, disabled }) => {
            const selected = label === 'Les clubs' && active === 'clubs'
            return (
              <button
                key={label}
                type="button"
                disabled={disabled}
                title={collapsed ? label : undefined}
                onClick={label === 'Les clubs' ? onClubs : undefined}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium transition-colors ${selected ? 'bg-white text-[#1b3025] shadow-sm' : disabled ? 'cursor-not-allowed text-white/35' : 'text-white/75 hover:bg-white/10'} ${collapsed ? 'md:justify-center md:px-2' : ''}`}
              >
                <Icon size={18} className={selected ? 'text-[#4b762c]' : ''} />
                <span className={collapsed ? 'md:hidden' : ''}>{label}</span>
                {disabled && !collapsed && <span className="ml-auto rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-white/45">Bientôt</span>}
              </button>
            )
          })}
        </nav>

        <div className={`mt-auto rounded-2xl border border-white/10 bg-white/[0.06] p-4 ${collapsed ? 'md:hidden' : ''}`}>
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#c6f06b]/15 text-[#c6f06b]"><CircleHelp size={18} /></div>
          <p className="text-[13px] font-semibold">Besoin d’un coup de main ?</p>
          <p className="mt-1.5 text-[11px] leading-5 text-white/55">On est là pour vous aider à faire vivre le campus.</p>
          <button type="button" className="mt-3 text-[11px] font-semibold text-[#c6f06b] hover:text-white">Contacter l’équipe <span aria-hidden="true">↗</span></button>
        </div>

        <div className={`mt-4 flex items-center gap-3 rounded-xl px-2 py-3 ${collapsed ? 'md:justify-center' : ''}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1d4b3] text-[11px] font-bold text-[#593d2d]">AM</div>
          <div className={`min-w-0 flex-1 ${collapsed ? 'md:hidden' : ''}`}>
            <p className="truncate text-[12px] font-semibold">Aïcha Mballa</p>
            <p className="text-[10px] text-white/45">Administratrice</p>
          </div>
          <button type="button" onClick={onToggle} aria-label={collapsed ? 'Développer le menu' : 'Réduire le menu'} className={`hidden rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white md:block ${collapsed ? 'md:hidden' : ''}`}>
            <ChevronLeft size={16} />
          </button>
        </div>
        <button type="button" onClick={onToggle} aria-label="Développer le menu" className={`absolute bottom-[82px] right-[-12px] hidden h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:text-emerald-700 md:flex ${collapsed ? '' : 'md:hidden'}`}>
          <ChevronRight size={15} />
        </button>
      </aside>
    </>
  )
}
