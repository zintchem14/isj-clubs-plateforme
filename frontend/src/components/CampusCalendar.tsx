import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { useMemo } from 'react'
import type { CampusEvent } from '../types'

type CampusCalendarProps = {
  events: CampusEvent[]
  month: Date
  selectedDate: string
  onMonthChange: (month: Date) => void
  onSelectDate: (date: string) => void
}

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export function CampusCalendar({ events, month, selectedDate, onMonthChange, onSelectDate }: CampusCalendarProps) {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
  const mondayOffset = (monthStart.getDay() + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const calendarStart = new Date(month.getFullYear(), month.getMonth(), 1 - mondayOffset)
  const days = Array.from({ length: Math.ceil((mondayOffset + daysInMonth) / 7) * 7 }, (_, index) => {
    const day = new Date(calendarStart.getFullYear(), calendarStart.getMonth(), calendarStart.getDate() + index)
    return { date: day, key: dateKey(day), inMonth: day.getMonth() === month.getMonth() }
  })
  const eventDates = useMemo(() => new Set(events.map((event) => event.date)), [events])
  const selectedEvents = events.filter((event) => event.date === selectedDate)
  const monthTitle = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(month)
  const selectedLabel = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${selectedDate}T12:00:00`))

  return (
    <div className="grid overflow-hidden rounded-[24px] border border-slate-200/80 bg-white lg:grid-cols-[1.15fr_.85fr]">
      <div className="p-5 sm:p-7">
        <div className="flex items-center justify-between">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#72915e]">LE MOIS EN UN COUP D’ŒIL</p><h3 className="mt-1 text-[20px] font-bold capitalize tracking-[-0.035em] text-slate-900">{monthTitle}</h3></div>
          <div className="flex gap-1.5">
            <button type="button" aria-label="Mois précédent" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"><ChevronLeft size={16} /></button>
            <button type="button" aria-label="Mois suivant" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-7 text-center">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => <span key={`${day}-${index}`} className="pb-2 text-[9px] font-bold text-slate-400">{day}</span>)}
          {days.map(({ date, key, inMonth }) => {
            const hasEvent = eventDates.has(key)
            const isSelected = selectedDate === key
            return <button key={key} type="button" onClick={() => onSelectDate(key)} aria-label={`${date.getDate()} ${new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(date)}${hasEvent ? ', événement prévu' : ''}`} aria-pressed={isSelected} className={`relative mx-auto my-0.5 flex h-9 w-9 flex-col items-center justify-center rounded-full text-[11px] transition sm:h-10 sm:w-10 ${isSelected ? 'bg-[#214633] font-bold text-white' : inMonth ? 'text-slate-700 hover:bg-[#f0f5e9]' : 'text-slate-300 hover:bg-slate-50'}`}>
              {date.getDate()}<span className={`absolute bottom-1 h-1 w-1 rounded-full ${hasEvent ? isSelected ? 'bg-[#d5f28a]' : 'bg-[#81a66a]' : 'bg-transparent'}`} />
            </button>
          })}
        </div>
        <p className="mt-3 flex items-center gap-2 text-[10px] text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-[#81a66a]" />Les jours avec un point ont un événement</p>
      </div>
      <div className="border-t border-slate-100 bg-[#fafbf8] p-5 sm:p-7 lg:border-l lg:border-t-0">
        <div className="flex items-start justify-between gap-2">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#72915e]">À TON AGENDA</p><h3 className="mt-1 text-[16px] font-bold capitalize text-slate-900">{selectedLabel}</h3></div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#64844f] shadow-sm"><CalendarDays size={17} /></span>
        </div>
        {selectedEvents.length ? <div className="mt-4 space-y-3">
          {selectedEvents.map((event) => <article key={event.id} className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3.5"><span className="mt-0.5 h-10 w-1 shrink-0 rounded-full bg-[#8fac77]" /><div className="min-w-0"><p className="text-[12px] font-bold text-slate-800">{event.title}</p><p className="mt-1 text-[10px] text-slate-500">{event.startTime} – {event.endTime}</p><p className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400"><MapPin size={11} />{event.location}</p></div></article>)}
        </div> : <div className="mt-4 flex min-h-[126px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 text-center"><p className="text-[12px] font-semibold text-slate-600">Rien de prévu ce jour-là</p><p className="mt-1.5 text-[10px] leading-4 text-slate-400">Choisis une date marquée d’un point pour découvrir ce qui s’y passe.</p></div>}
      </div>
    </div>
  )
}
