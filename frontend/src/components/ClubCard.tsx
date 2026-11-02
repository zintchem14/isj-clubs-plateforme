import { ArrowUpRight, CalendarDays, Users } from 'lucide-react'
import type { CampusEvent, Club } from '../types'

type ClubCardProps = {
  club: Club
  nextEvent?: CampusEvent
  onDetails: (club: Club) => void
}

export function ClubCard({ club, nextEvent, onDetails }: ClubCardProps) {
  return (
    <article className="group overflow-hidden rounded-[22px] border border-slate-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:border-[#d4e3c9] hover:shadow-[0_20px_48px_-26px_rgba(29,61,39,.4)]">
      <button type="button" onClick={() => onDetails(club)} aria-label={`Découvrir le club ${club.name}`} className="relative block h-[210px] w-full overflow-hidden text-left">
        <img src={club.image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
        <span className="absolute inset-0 bg-gradient-to-t from-[#101a13]/70 via-[#101a13]/5 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-white/45 bg-white/90 px-3 py-1.5 text-[9px] font-semibold text-slate-700 backdrop-blur">{club.category}</span>
        <span className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
          <span><span className="mb-1 block text-[9px] font-medium text-white/75">{club.members} étudiants font déjà partie de l’aventure</span><span className="block text-[21px] font-bold leading-tight tracking-[-0.04em]">{club.name}</span></span>
          <span className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#274b35] transition group-hover:bg-[#d5f28a]"><ArrowUpRight size={17} /></span>
        </span>
      </button>
      <div className="p-5">
        <p className="line-clamp-2 min-h-[42px] text-[12px] leading-[1.8] text-slate-500">{club.description}</p>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3.5">
          <span className="flex min-w-0 items-center gap-1.5 text-[10px] text-slate-400"><Users size={13} className="shrink-0 text-[#789566]" />Une place pour toi</span>
          {nextEvent ? <span className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold text-[#547547]"><CalendarDays size={12} className="shrink-0" /><span className="truncate">{new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(`${nextEvent.date}T12:00:00`))} · {nextEvent.title}</span></span> : <span className="text-[10px] text-slate-400">À découvrir</span>}
        </div>
      </div>
    </article>
  )
}
