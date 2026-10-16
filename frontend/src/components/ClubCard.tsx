import { ArrowUpRight, MapPin, MoreHorizontal, Users } from 'lucide-react'
import type { Club } from '../types'

type ClubCardProps = {
  club: Club
  onDetails: (club: Club) => void
  onEdit: (club: Club) => void
  onDelete: (club: Club) => void
}

export function ClubCard({ club, onDetails, onEdit, onDelete }: ClubCardProps) {
  const remaining = Math.max(club.capacity - club.members, 0)
  const occupancy = Math.min(Math.round((club.members / club.capacity) * 100), 100)

  return (
    <article className="group overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_3px_12px_-8px_rgba(15,23,42,.2)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(15,23,42,.3)]">
      <button type="button" onClick={() => onDetails(club)} className="relative block h-[190px] w-full overflow-hidden text-left">
        <img src={club.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        <span className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/5 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-white/50 bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-slate-700 backdrop-blur">{club.category}</span>
        <span className={`absolute right-4 top-4 rounded-full px-2.5 py-1.5 text-[9px] font-semibold ${club.status === 'Complet' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
          <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${club.status === 'Complet' ? 'bg-amber-500' : 'bg-emerald-500'}`} />{club.status}
        </span>
        <span className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
          <span className="pr-2 text-[18px] font-bold leading-tight tracking-[-0.02em]">{club.name}</span>
          <span className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 opacity-0 backdrop-blur transition group-hover:opacity-100"><ArrowUpRight size={16} /></span>
        </span>
      </button>
      <div className="p-4 sm:p-5">
        <p className="line-clamp-2 min-h-[40px] text-[12px] leading-5 text-slate-500">{club.description}</p>
        <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5"><Users size={14} className="text-slate-400" />{club.members} membres</span>
          <span className="flex items-center gap-1.5"><MapPin size={13} className="text-slate-400" />{club.location}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"><span className={`block h-full rounded-full bg-gradient-to-r ${club.accent}`} style={{ width: `${occupancy}%` }} /></div>
          <span className="shrink-0 text-[9px] font-medium text-slate-400">{remaining === 0 ? 'Complet' : `${remaining} places`}</span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <button type="button" onClick={() => onDetails(club)} className="text-[11px] font-semibold text-[#426c37] transition hover:text-[#243f2c]">Voir la fiche <span aria-hidden="true">→</span></button>
          <div className="flex items-center gap-1">
            <button type="button" title="Modifier le club" onClick={() => onEdit(club)} className="rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900">Modifier</button>
            <div className="group/actions relative">
              <button type="button" aria-label={`Plus d’actions pour ${club.name}`} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"><MoreHorizontal size={16} /></button>
              <div className="pointer-events-none absolute bottom-full right-0 z-10 mb-1 w-32 translate-y-1 rounded-xl border border-slate-100 bg-white p-1 opacity-0 shadow-xl transition group-hover/actions:pointer-events-auto group-hover/actions:translate-y-0 group-hover/actions:opacity-100 focus-within:pointer-events-auto focus-within:translate-y-0 focus-within:opacity-100">
                <button type="button" onClick={() => onDelete(club)} className="w-full rounded-lg px-3 py-2 text-left text-[11px] font-medium text-rose-600 hover:bg-rose-50">Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
