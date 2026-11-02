import { useCallback, useMemo, useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, ChevronDown, Compass, Search, Sparkles, Users } from 'lucide-react'
import { CampusCalendar } from './components/CampusCalendar'
import { ClubCard } from './components/ClubCard'
import { ClubDetails } from './components/ClubDetails'
import { EventCard } from './components/EventCard'
import { Footer } from './components/Footer'
import { PublicNavbar } from './components/PublicNavbar'
import { Toast } from './components/Toast'
import { categories, featuredEvents, initialClubs } from './data/clubs'
import type { CampusEvent, Club, ToastMessage } from './types'

function App() {
  const [page, setPage] = useState<'home' | 'club'>('home')
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [category, setCategory] = useState<string>('Toutes les catégories')
  const [search, setSearch] = useState('')
  const [month, setMonth] = useState(new Date(2026, 9, 1))
  const [selectedDate, setSelectedDate] = useState('2026-10-24')
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const notify = useCallback((title: string, description: string, type: ToastMessage['type'] = 'success') => {
    setToast({ title, description, type })
  }, [])
  const dismissToast = useCallback(() => setToast(null), [])

  const visibleClubs = useMemo(() => initialClubs.filter((club) => {
    const matchesCategory = category === 'Toutes les catégories' || club.category === category
    const term = search.trim().toLocaleLowerCase('fr')
    const matchesSearch = !term || `${club.name} ${club.description} ${club.category}`.toLocaleLowerCase('fr').includes(term)
    return matchesCategory && matchesSearch
  }), [category, search])

  const upcomingEvents = useMemo(() => [...featuredEvents].sort((a, b) => a.date.localeCompare(b.date)), [])
  const featuredEvent = featuredEvents.find((event) => event.featured) ?? featuredEvents[0]
  const otherEvents = upcomingEvents.filter((event) => event.id !== featuredEvent.id)
  const eventClub = (event: CampusEvent) => initialClubs.find((club) => club.id === event.clubId)

  function showClub(club: Club) {
    setSelectedClub(club)
    setPage('club')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function navigateTo(section: string) {
    setPage('home')
    window.requestAnimationFrame(() => document.querySelector(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  function selectEvent(event: CampusEvent) {
    const eventDate = new Date(`${event.date}T12:00:00`)
    setSelectedDate(event.date)
    setMonth(new Date(eventDate.getFullYear(), eventDate.getMonth(), 1))
    setPage('home')
    window.requestAnimationFrame(() => document.querySelector('#agenda')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  function selectCalendarDate(date: string) {
    setSelectedDate(date)
    const dateValue = new Date(`${date}T12:00:00`)
    if (dateValue.getMonth() !== month.getMonth() || dateValue.getFullYear() !== month.getFullYear()) {
      setMonth(new Date(dateValue.getFullYear(), dateValue.getMonth(), 1))
    }
  }

  function changeMonth(nextMonth: Date) {
    setMonth(nextMonth)
    const matchingEvent = featuredEvents.find((event) => {
      const eventDate = new Date(`${event.date}T12:00:00`)
      return eventDate.getMonth() === nextMonth.getMonth() && eventDate.getFullYear() === nextMonth.getFullYear()
    })
    setSelectedDate(matchingEvent?.date ?? `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`)
  }

  return (
    <div className="min-h-screen bg-[#fafaf7] text-slate-900">
      <PublicNavbar onNavigate={navigateTo} />

      {page === 'club' && selectedClub ? (
        <ClubDetails
          club={selectedClub}
          events={featuredEvents}
          onBack={() => { setPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          onEvent={selectEvent}
          onToast={(title, description) => notify(title, description)}
        />
      ) : (
        <main>
          <section id="accueil" className="relative isolate min-h-[570px] overflow-hidden bg-[#1a2a20] sm:min-h-[630px]">
            <img src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=2200&q=90" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#101b13]/90 via-[#152219]/68 to-[#16231b]/25" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#152219]/70 via-transparent to-[#101b13]/15" />
            <div className="mx-auto flex min-h-[570px] max-w-[1320px] flex-col justify-center px-5 pb-20 pt-16 sm:min-h-[630px] sm:px-8">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur"><Sparkles size={13} className="text-[#d5f28a]" />ISJ · Une communauté en mouvement</span>
                <p className="mt-7 text-[13px] font-medium text-white/75 sm:text-[15px]">On vient pour les cours.</p>
                <h1 className="mt-1 max-w-3xl text-[45px] font-bold leading-[0.99] tracking-[-0.065em] text-white sm:text-[65px] lg:text-[76px]">On reste pour tout<br className="hidden sm:block" /> ce qu’on vit ensemble.</h1>
                <p className="mt-5 max-w-xl text-[13px] leading-6 text-white/75 sm:text-[15px] sm:leading-7">Des idées qui prennent vie, des rencontres qui comptent, des souvenirs qu’on n’avait pas prévus. Bienvenue dans la vie associative de l’ISJ.</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a href="#clubs" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#d5f28a] px-5 text-[12px] font-bold text-[#20382a] transition hover:bg-white">Trouver ton club <ArrowRight size={15} /></a>
                  <a href="#agenda" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/35 bg-white/10 px-5 text-[12px] font-semibold text-white backdrop-blur transition hover:bg-white/20"><CalendarDays size={15} />Voir l’agenda</a>
                </div>
              </div>
              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/20 pt-5 text-white sm:mt-14">
                <div className="flex items-center gap-2"><Users size={16} className="text-[#d5f28a]" /><span className="text-[11px]"><strong className="mr-1 text-[14px]">6</strong> clubs à découvrir</span></div>
                <div className="flex items-center gap-2"><CalendarDays size={15} className="text-[#d5f28a]" /><span className="text-[11px]"><strong className="mr-1 text-[14px]">{featuredEvents.length}</strong> occasions de se retrouver</span></div>
                <div className="flex items-center gap-2"><Compass size={15} className="text-[#d5f28a]" /><span className="text-[11px]">Ta prochaine histoire commence ici</span></div>
              </div>
            </div>
            <a href="#rendez-vous" className="absolute bottom-5 right-6 hidden items-center gap-2 text-[9px] font-medium uppercase tracking-[0.15em] text-white/65 sm:flex">Faire défiler <ArrowDown size={13} /></a>
          </section>

          <section id="rendez-vous" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20">
            <div className="mx-auto max-w-[1320px]">
              <div className="mb-7 flex flex-col justify-between gap-3 sm:mb-9 sm:flex-row sm:items-end">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.19em] text-[#759263]">À VIVRE BIENTÔT</p><h2 className="mt-2 text-[29px] font-bold tracking-[-0.05em] text-[#20382a] sm:text-[37px]">Le campus te donne rendez-vous.</h2><p className="mt-2 max-w-xl text-[12px] leading-5 text-slate-500 sm:text-[13px]">Des moments imaginés par les étudiants, ouverts à toute la communauté.</p></div>
                <a href="#agenda" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#547547] transition hover:text-[#20382a]">Tout l’agenda <ArrowUpRight size={14} /></a>
              </div>
              <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[1.45fr_.8fr]">
                <EventCard event={featuredEvent} club={eventClub(featuredEvent)} onSelect={selectEvent} featured />
                <div className="flex flex-col gap-3">
                  <div className="mb-0.5 flex items-center justify-between px-1"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Et très bientôt...</p><span className="text-[10px] text-slate-400">{otherEvents.length} rendez-vous</span></div>
                  {otherEvents.slice(0, 3).map((event) => <EventCard key={event.id} event={event} club={eventClub(event)} onSelect={selectEvent} />)}
                  <a href="#agenda" className="mt-auto flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-dashed border-[#cbd9c1] text-[11px] font-semibold text-[#5a794b] transition hover:bg-[#f1f5ec]">Explorer tout le calendrier <ChevronDown size={14} /></a>
                </div>
              </div>
            </div>
          </section>

          <section id="clubs" className="scroll-mt-20 bg-[#f0f2eb] px-5 py-16 sm:px-8 sm:py-20">
            <div className="mx-auto max-w-[1320px]">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.19em] text-[#759263]">DES GENS, DES IDÉES, DU MOUVEMENT</p><h2 className="mt-2 text-[30px] font-bold tracking-[-0.05em] text-[#20382a] sm:text-[38px]">Il y a forcément ta place.</h2><p className="mt-2 max-w-lg text-[12px] leading-5 text-slate-500 sm:text-[13px]">Sport, création, culture ou engagement : découvre celles et ceux qui font vivre le campus.</p></div>
                <label className="relative w-full sm:max-w-[250px]"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="search" aria-label="Rechercher un club" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Une envie en tête ?" className="h-10 w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 text-[11px] outline-none transition focus:border-[#8faa78] focus:ring-4 focus:ring-[#dfead5]" /></label>
              </div>
              <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
                {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-semibold transition ${category === item ? 'bg-[#214633] text-white' : 'border border-slate-200 bg-white/80 text-slate-500 hover:border-[#b7c8aa] hover:text-[#31583d]'}`}>{item}</button>)}
              </div>
              {visibleClubs.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleClubs.map((club) => <ClubCard key={club.id} club={club} nextEvent={featuredEvents.filter((event) => event.clubId === club.id).sort((a, b) => a.date.localeCompare(b.date))[0]} onDetails={showClub} />)}
              </div> : <div className="mt-5 rounded-[22px] border border-dashed border-slate-300 bg-white/65 px-5 py-12 text-center"><p className="text-[14px] font-semibold text-slate-700">Pas encore trouvé ton bonheur ?</p><p className="mt-1 text-[11px] text-slate-500">Essaie un autre mot ou explore une autre catégorie.</p><button type="button" onClick={() => { setSearch(''); setCategory('Toutes les catégories') }} className="mt-3 text-[11px] font-semibold text-[#547547] hover:underline">Réinitialiser la recherche</button></div>}
              <div className="mt-6 flex items-center justify-between rounded-2xl border border-[#dce5d4] bg-white/70 px-4 py-3 sm:px-5"><p className="text-[10px] text-slate-500 sm:text-[11px]"><strong className="text-[#31583d]">{initialClubs.length} clubs</strong> et plein de façons de faire partie de l’histoire.</p><span className="text-[10px] font-semibold text-[#547547]">{visibleClubs.length} affiché{visibleClubs.length === 1 ? '' : 's'}</span></div>
            </div>
          </section>

          <section id="agenda" className="scroll-mt-20 px-5 py-16 sm:px-8 sm:py-20">
            <div className="mx-auto max-w-[1120px]">
              <div className="mb-7 text-center"><p className="text-[10px] font-bold uppercase tracking-[0.19em] text-[#759263]">À GARDER SOUS LA MAIN</p><h2 className="mt-2 text-[30px] font-bold tracking-[-0.05em] text-[#20382a] sm:text-[38px]">Les bons moments, au bon moment.</h2><p className="mx-auto mt-2 max-w-lg text-[12px] leading-5 text-slate-500 sm:text-[13px]">Choisis une date pour voir ce qui se passe sur le campus. Tes prochaines sorties sont à portée de clic.</p></div>
              <CampusCalendar events={featuredEvents} month={month} selectedDate={selectedDate} onMonthChange={changeMonth} onSelectDate={selectCalendarDate} />
            </div>
          </section>

          <section id="moments" className="px-5 pb-16 sm:px-8 sm:pb-20">
            <div className="mx-auto grid max-w-[1320px] overflow-hidden rounded-[28px] bg-[#214633] md:grid-cols-[.85fr_1.15fr]">
              <div className="flex flex-col items-start justify-center p-7 text-white sm:p-10 lg:p-12">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d5f28a]">C’EST AUSSI ÇA, L’ISJ</p>
                <h2 className="mt-3 text-[30px] font-bold leading-[1.05] tracking-[-0.05em] sm:text-[38px]">Les meilleurs souvenirs ne sont pas au programme.</h2>
                <p className="mt-4 max-w-sm text-[12px] leading-6 text-white/70">Ils arrivent entre deux cours, au détour d’un atelier ou quand tout le campus se retrouve. Fais-en partie.</p>
                <a href="#clubs" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[#d5f28a] px-5 text-[11px] font-bold text-[#20382a] transition hover:bg-white">Trouver mon prochain rendez-vous <ArrowRight size={14} /></a>
              </div>
              <div className="grid min-h-[300px] grid-cols-2 grid-rows-2 gap-2 p-2 sm:min-h-[380px] sm:gap-3 sm:p-3">
                <img src="https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=850&q=85" alt="Étudiants réunis pour un événement sur le campus" className="row-span-2 h-full min-h-[300px] w-full rounded-[22px] object-cover sm:min-h-[350px]" />
                <img src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=700&q=85" alt="Une scène ouverte animée par les étudiants" className="h-full min-h-[145px] w-full rounded-[20px] object-cover" />
                <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=85" alt="Des amis partagent un moment convivial" className="h-full min-h-[145px] w-full rounded-[20px] object-cover" />
              </div>
            </div>
          </section>
        </main>
      )}

      <div className="mx-auto max-w-[1320px] px-5 sm:px-8"><Footer /></div>
      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}

export default App
