import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react'
import type { CampusEvent, Club } from '../types'

type EventCardProps = {
  event: CampusEvent
  club: Club | undefined
  onSelect: (event: CampusEvent) => void
  featured?: boolean
}

export function EventCard({ event, club, onSelect, featured = false }: EventCardProps) {
  const date = new Date(`${event.date}T12:00:00`)
  const day = new Intl.DateTimeFormat('fr-FR', { day: '2-digit' }).format(date)
  const month = new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(date).replace('.', '')
  const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(date)
  const dateLabel = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(date)

  if (featured) {
    return (
      <article className="group relative flex min-h-[420px] w-full min-w-0 overflow-hidden rounded-[28px] bg-[#1c2c22] sm:min-h-[480px]">
        <img src={event.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101c15]/90 via-[#142118]/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101c15]/75 via-transparent to-[#101c15]/15" />
        <div className="relative z-10 flex max-w-2xl flex-col items-start justify-end p-6 text-white sm:p-10 lg:p-12">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] backdrop-blur"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#d5f28a]" />L’événement phare</span>
          <p className="mb-2 text-[11px] font-medium capitalize text-white/75">{weekday} {dateLabel} · {event.startTime}</p>
          <h2 className="max-w-xl text-[38px] font-bold leading-[1.04] tracking-[-0.05em] sm:text-[52px] lg:text-[62px]">{event.title}</h2>
          <p className="mt-4 max-w-lg text-[13px] leading-6 text-white/80 sm:text-[14px]">{event.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-white/80"><span className="flex items-center gap-1.5"><MapPin size={13} />{event.location}</span>{club && <span className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-white/50" />Avec {club.name}</span>}</div>
          <button type="button" onClick={() => onSelect(event)} className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-[#d5f28a] px-5 text-[11px] font-bold text-[#20382a] transition hover:bg-white">Découvrir l’événement <ArrowUpRight size={15} /></button>
        </div>
        <div className="absolute right-5 top-5 flex h-[66px] w-[62px] flex-col items-center justify-center rounded-2xl border border-white/30 bg-white/90 text-[#20382a] shadow-lg backdrop-blur sm:right-7 sm:top-7">
          <span className="text-[21px] font-bold leading-none">{day}</span><span className="mt-1 text-[9px] font-bold uppercase tracking-widest">{month}</span>
        </div>
      </article>
    )
  }

  return (
    <button type="button" onClick={() => onSelect(event)} className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-[#d3e4c4] hover:shadow-[0_12px_32px_-22px_rgba(29,61,39,.45)] sm:gap-5 sm:p-4">
      <span className="flex h-[62px] w-[58px] shrink-0 flex-col items-center justify-center rounded-xl bg-[#f0f5e9] text-[#365a38] transition group-hover:bg-[#e5efda]"><span className="text-[20px] font-bold leading-none">{day}</span><span className="mt-1 text-[9px] font-bold uppercase tracking-wide">{month}</span></span>
      <span className="min-w-0 flex-1">
        <span className="mb-1.5 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#6a8c55]"><span>{event.format}</span>{club && <><span className="h-px w-3 bg-slate-200" /><span className="truncate text-slate-400">{club.name}</span></>}</span>
        <span className="block truncate text-[13px] font-bold text-slate-800 sm:text-[14px]">{event.title}</span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400"><span className="flex items-center gap-1"><CalendarDays size={11} />{weekday} · {event.startTime}</span><span className="flex items-center gap-1"><MapPin size={11} />{event.location}</span></span>
      </span>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition group-hover:bg-[#edf4e7] group-hover:text-[#3c6947]"><ArrowUpRight size={15} /></span>
    </button>
  )
}
