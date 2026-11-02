import { ArrowLeft, ArrowUpRight, CalendarDays, MapPin, Share2, Sparkles, Users } from 'lucide-react'
import type { CampusEvent, Club } from '../types'

type ClubDetailsProps = {
  club: Club
  events: CampusEvent[]
  onBack: () => void
  onEvent: (event: CampusEvent) => void
  onToast: (title: string, description: string) => void
}

export function ClubDetails({ club, events, onBack, onEvent, onToast }: ClubDetailsProps) {
  const clubEvents = events.filter((event) => event.clubId === club.id).sort((a, b) => a.date.localeCompare(b.date))

  async function shareClub() {
    try {
      if (navigator.share) {
        await navigator.share({ title: club.name, text: club.description, url: window.location.href })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href)
        onToast('Lien copié', 'Partage la fiche du club avec tes amis.')
        return
      } else {
        throw new Error('Le partage n’est pas pris en charge sur ce navigateur.')
      }
      onToast('Fiche partagée', 'Fais découvrir ce club autour de toi !')
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      onToast('Partage indisponible', 'Une erreur est survenue lors du partage de cette fiche.')
    }
  }

  return (
    <main className="mx-auto max-w-[1120px] px-5 pb-16 pt-7 sm:px-8">
      <button type="button" onClick={onBack} className="mb-5 flex items-center gap-2 text-[12px] font-semibold text-slate-500 transition hover:text-[#31583d]"><ArrowLeft size={15} />Tous les clubs</button>
      <section className="relative flex min-h-[330px] items-end overflow-hidden rounded-[28px] bg-[#1c2c22] sm:min-h-[410px]">
        <img src={club.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101a13]/85 via-[#101a13]/25 to-transparent" />
        <div className="relative z-10 flex w-full flex-col items-start justify-end gap-5 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-10">
          <div className="max-w-2xl text-white">
            <span className="mb-3 inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.13em] backdrop-blur">{club.category} · Club étudiant</span>
            <h1 className="text-[34px] font-bold leading-tight tracking-[-0.05em] sm:text-[48px]">{club.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-white/75"><Users size={13} />{club.members} étudiants font déjà partie de l’aventure</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={shareClub} className="flex h-10 items-center gap-2 rounded-full border border-white/35 bg-white/10 px-4 text-[11px] font-semibold text-white backdrop-blur hover:bg-white/20"><Share2 size={14} />Partager</button>
            <a href="#club-agenda" className="flex h-10 items-center gap-2 rounded-full bg-[#d5f28a] px-4 text-[11px] font-bold text-[#20382a] transition hover:bg-white">Voir les activités <ArrowUpRight size={14} /></a>
          </div>
        </div>
      </section>

      <div className="grid gap-10 py-9 lg:grid-cols-[1fr_300px]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#71905e]">VIENS COMME TU ES</p>
          <h2 className="mt-2 text-[25px] font-bold tracking-[-0.04em] text-slate-900 sm:text-[30px]">Une passion, mille façons de la vivre.</h2>
          <p className="mt-3 max-w-2xl text-[13px] leading-7 text-slate-600">{club.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">{(club.activities ?? ['Rencontres ouvertes', 'Ateliers créatifs', 'Projets entre étudiants']).map((activity) => <span key={activity} className="rounded-full border border-[#dfe9d6] bg-[#f5f8f1] px-3.5 py-2 text-[10px] font-semibold text-[#567448]">{activity}</span>)}</div>

          <section id="club-agenda" className="mt-10 scroll-mt-24">
            <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#71905e]">ON SE RETROUVE BIENTÔT</p><h2 className="mt-1 text-[20px] font-bold tracking-tight text-slate-900">Les prochains rendez-vous</h2></div><CalendarDays size={19} className="text-[#71905e]" /></div>
            {clubEvents.length ? <div className="space-y-3">{clubEvents.map((event) => {
              const eventDate = new Date(`${event.date}T12:00:00`)
              return <button key={event.id} type="button" onClick={() => onEvent(event)} className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-3 text-left transition hover:border-[#d2e1c7] hover:shadow-sm sm:p-4">
                <span className="flex h-[58px] w-[54px] shrink-0 flex-col items-center justify-center rounded-xl bg-[#eff4e8] text-[#385d3c]"><span className="text-[19px] font-bold leading-none">{new Intl.DateTimeFormat('fr-FR', { day: '2-digit' }).format(eventDate)}</span><span className="mt-1 text-[9px] font-bold uppercase">{new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(eventDate).replace('.', '')}</span></span>
                <span className="min-w-0 flex-1"><span className="block text-[13px] font-bold text-slate-800">{event.title}</span><span className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] text-slate-400"><span>{event.startTime} – {event.endTime}</span><span className="flex items-center gap-1"><MapPin size={11} />{event.location}</span></span></span>
                <ArrowUpRight size={16} className="shrink-0 text-slate-300 transition group-hover:text-[#4b7046]" />
              </button>
            })}</div> : <p className="rounded-2xl border border-dashed border-slate-200 p-5 text-[12px] text-slate-500">Les prochains rendez-vous de ce club arrivent bientôt. Garde l’œil sur l’agenda !</p>}
          </section>
        </div>

        <aside className="h-fit rounded-[22px] bg-[#edf2e7] p-5 sm:p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#678653]"><Sparkles size={18} /></span>
          <p className="mt-4 text-[16px] font-bold text-[#20382a]">Et si tu venais essayer ?</p>
          <p className="mt-2 text-[11px] leading-5 text-[#687b60]">Les clubs, c’est avant tout des rencontres. Viens découvrir une activité et trouver ta place sur le campus.</p>
          <div className="mt-5 flex items-center gap-2 border-t border-[#dce6d3] pt-4 text-[10px] text-[#607656]"><MapPin size={13} />{club.location}</div>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-[#607656]"><CalendarDays size={13} />{club.meeting}</div>
          <button type="button" onClick={() => onToast('On se retrouve bientôt !', `Tu peux venir rencontrer ${club.name} à son prochain rendez-vous.`)} className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#214633] text-[11px] font-semibold text-white transition hover:bg-[#315a41]">Découvrir le club <ArrowUpRight size={14} /></button>
        </aside>
      </div>
    </main>
  )
}
