import { useCallback, useMemo, useState, useEffect } from 'react'
import { ArrowRight, Sparkles, Search, FileText, Lock, ShieldCheck, Users, Heart, Clock } from 'lucide-react'
import { CampusCalendar } from './components/CampusCalendar'
import { ClubCard } from './components/ClubCard'
import { ClubDetails } from './components/ClubDetails'
import { EventCard } from './components/EventCard'
import { Footer } from './components/Footer'
import { PublicNavbar } from './components/PublicNavbar'
import { Toast } from './components/Toast'
import { AdminDashboard } from './components/AdminDashboard'
import { categories, featuredEvents, initialClubs } from './data/clubs'
import type { CampusEvent, Club, ToastMessage, News } from './types'

function App() {
  const [page, setPage] = useState<'home' | 'club'>('home')
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [category, setCategory] = useState<string>('Toutes les catégories')
  const [search, setSearch] = useState('')
  const [month, setMonth] = useState(new Date(2026, 9, 1))
  const [selectedDate, setSelectedDate] = useState('2026-10-24')
  const [toast, setToast] = useState<ToastMessage | null>(null)

  // --- ÉTATS AUTHENTIFICATION ADMIN ---
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [adminUser, setAdminUser] = useState('')
  const [adminPass, setAdminPass] = useState('')

  // --- ÉTATS CLUBS & LIKES ---
  const [clubsList, setClubsList] = useState<Club[]>(initialClubs)
  const [likedClubs, setLikedClubs] = useState<Record<string, boolean>>({})

  const handleToggleLike = (clubId: string) => {
    setLikedClubs(prev => {
      const isLiked = !prev[clubId]
      setClubsList(list => list.map(c => c.id === clubId ? { ...c, membersCount: c.membersCount + (isLiked ? 1 : -1) } : c))
      return { ...prev, [clubId]: isLiked }
    })
    notify("Cœur enregistré ❤️", "Votre avis a été pris en compte sur ce club.", "success")
  }

  // --- FIL D'ACTUALITÉS CHARGÉ DEPUIS LA BD DJANGO ---
  const [newsList, setNewsList] = useState<News[]>([])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/news/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formattedNews = data.map((item: any) => ({
            id: String(item.id),
            title: item.title,
            content: item.content,
            authorName: item.author_name || 'Administration ISJ',
            attachmentType: item.attachment ? (item.attachment.endsWith('.pdf') ? 'pdf' : 'image') : undefined,
            attachmentUrl: item.attachment ? `http://127.0.0.1:8000${item.attachment}` : undefined,
            createdAt: new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
          }))
          setNewsList(formattedNews)
        }
      })
      .catch(err => {
        console.error("Impossible de charger les actualités depuis Django :", err)
        setNewsList([
          {
            id: '1',
            title: 'Affiche Officielle : Hackathon Code & Dev ISJ',
            content: 'Découvrez l’affiche officielle de notre prochain grand tournoi technologique inter-filières.',
            authorName: 'Administration ISJ',
            attachmentType: 'image',
            attachmentUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
            createdAt: "Aujourd'hui, 08:30"
          }
        ])
      })
  }, [])

  // --- CHRONOMÈTRE EN DIRECT ---
  const [liveTimerSeconds, setLiveTimerSeconds] = useState(() => {
    const saved = localStorage.getItem('isj_live_timer')
    return saved ? parseInt(saved, 10) : 0
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTimerSeconds(prev => {
        const nextVal = prev + 1
        localStorage.setItem('isj_live_timer', nextVal.toString())
        return nextVal
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins} min ${secs} sec`
  }

  // --- INSCRIPTION ÉTUDIANT AUX CLUBS ---
  const [studentModalClub, setStudentModalClub] = useState<Club | null>(null)
  const [studentNameInput, setStudentNameInput] = useState('')
  const [studentEmailInput, setStudentEmailInput] = useState('')
  const [parentEmailInput, setParentEmailInput] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  const handleStudentMembershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentModalClub) return
    setIsRegistering(true)

    try {
      const response = await fetch('http://127.0.0.1:8000/api/memberships/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          club: studentModalClub.id,
          student_name: studentNameInput,
          student_email: studentEmailInput,
          parent_email: parentEmailInput
        })
      })

      if (response.ok || response.status === 201) {
        notify("🎉 Inscription réussie en BD !", `${studentNameInput} est officiellement inscrit au club ${studentModalClub.name}. L'administration validera l'adhésion.`, "success")
        setStudentModalClub(null)
        setStudentNameInput('')
        setStudentEmailInput('')
        setParentEmailInput('')
      } else {
        const errData = await response.json()
        notify("❌ Échec de l'inscription", errData.error || "Vérifiez les champs saisis.", "error")
      }
    } catch (err) {
      notify("❌ Erreur de connexion", "Impossible de joindre le serveur Django sur 127.0.0.1:8000.", "error")
    } finally {
      setIsRegistering(false)
    }
  }

  // --- CONNEXION ADMIN ---
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin-login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUser, password: adminPass })
      })
      const data = await response.json()
      if (response.ok) {
        setIsAdminLoggedIn(true)
        setShowLoginModal(false)
        setAdminPass('')
        notify("Connexion réussie", `Bienvenue dans l'espace Administrateur, ${data.username} !`, "success")
      } else {
        notify("Erreur de connexion", data.error || "Identifiants incorrects.", "error")
      }
    } catch (err) {
      notify("Erreur réseau", "Impossible de joindre le serveur Django sur 127.0.0.1:8000.", "error")
    }
  }

  const notify = useCallback((title: string, description: string, type: ToastMessage['type'] = 'success') => {
    setToast({ title, description, type })
  }, [])
  const dismissToast = useCallback(() => setToast(null), [])

  const visibleClubs = useMemo(() => clubsList.filter((club) => {
    const matchesCategory = category === 'Toutes les catégories' || club.category === category
    const term = search.trim().toLocaleLowerCase('fr')
    const matchesSearch = !term || `${club.name} ${club.description} ${club.category}`.toLocaleLowerCase('fr').includes(term)
    return matchesCategory && matchesSearch
  }), [clubsList, category, search])

  const upcomingEvents = useMemo(() => [...featuredEvents].sort((a, b) => a.date.localeCompare(b.date)), [])
  const featuredEvent = featuredEvents.find((event) => event.featured) ?? featuredEvents[0]
  const otherEvents = upcomingEvents.filter((event) => event.id !== featuredEvent.id)
  const eventClub = (event: CampusEvent) => clubsList.find((club) => club.id === event.clubId)

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
    setSelectedDate(event.date)
    setPage('home')
    window.requestAnimationFrame(() => document.querySelector('#agenda')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  if (isAdminLoggedIn) {
    return (
      <>
        <AdminDashboard
          clubs={clubsList}
          events={featuredEvents}
          onToast={notify}
          onLogout={() => { setIsAdminLoggedIn(false); notify("Déconnecté", "Retour au mode public.", "info") }}
        />
        {toast && <Toast title={toast.title} description={toast.description} type={toast.type} onClose={dismissToast} />}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafaf7] text-slate-900">
      <PublicNavbar onNavigate={navigateTo} />

      {/* Barre supérieure d'accès Admin & Chrono en direct */}
      <div className="bg-[#15251c] text-white py-2.5 px-4 text-xs flex flex-col sm:flex-row justify-between items-center shadow-md border-b border-white/15 gap-2">
        <div className="max-w-[1320px] mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-2">
          <span className="flex items-center gap-2 font-semibold text-center sm:text-left">
            <Sparkles size={14} className="text-[#d5f28a]" />
            ISJ Campus · Portail officiel & Transparence
          </span>
         
          <div className="flex items-center gap-2 bg-emerald-900/60 border border-emerald-500/40 px-3 py-1 rounded-full text-emerald-200 font-bold">
            <Clock size={14} className="animate-pulse text-[#d5f28a]" />
            <span>Activité en cours : {formatTimer(liveTimerSeconds)}</span>
          </div>

          <button
            onClick={() => setShowLoginModal(true)}
            className="bg-[#d5f28a] text-[#20382a] px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5 hover:bg-white transition shadow"
          >
            <Lock size={13} /> Connexion Admin
          </button>
        </div>
      </div>

      {/* MODALE DE CONNEXION ADMIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#20382a] flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" size={24} /> Authentification Admin
              </h3>
              <button onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom d'utilisateur (Superuser)</label>
                <input
                  type="text"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  required
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#20382a]"
                  placeholder="Ex: admin"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  required
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#20382a]"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" className="w-full h-11 bg-[#20382a] text-white font-bold rounded-xl text-sm hover:bg-[#15251c] transition shadow-lg mt-2">
                Se connecter au Dashboard
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE D'INSCRIPTION ÉTUDIANT */}
      {studentModalClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#20382a] flex items-center gap-2">
                <Users className="text-emerald-600" size={22} /> Inscription : {studentModalClub.name}
              </h3>
              <button onClick={() => setStudentModalClub(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleStudentMembershipSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom complet de l'étudiant</label>
                <input
                  type="text"
                  value={studentNameInput}
                  onChange={(e) => setStudentNameInput(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#20382a]"
                  placeholder="Ex: Johann N."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail institutionnel étudiant</label>
                <input
                  type="email"
                  value={studentEmailInput}
                  onChange={(e) => setStudentEmailInput(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#20382a]"
                  placeholder="johann@institutsaintjean.org"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail du parent (pour la transparence)</label>
                <input
                  type="email"
                  value={parentEmailInput}
                  onChange={(e) => setParentEmailInput(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#20382a]"
                  placeholder="parent@example.com"
                />
              </div>
              <button type="submit" disabled={isRegistering} className="w-full h-11 bg-[#20382a] text-white font-bold rounded-xl text-xs hover:bg-[#152e22] transition shadow-lg mt-2">
                {isRegistering ? "Enregistrement en BD..." : "Valider mon inscription au club"}
              </button>
            </form>
          </div>
        </div>
      )}

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
          <section id="accueil" className="relative isolate min-h-[500px] overflow-hidden bg-[#1a2a20] sm:min-h-[580px]">
            <img src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=2200&q=90" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#101b13]/90 via-[#152219]/68 to-[#16231b]/25" />
            <div className="mx-auto flex min-h-[500px] max-w-[1320px] flex-col justify-center px-5 pb-20 pt-16 sm:min-h-[580px] sm:px-8">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur"><Sparkles size={13} className="text-[#d5f28a]" />ISJ · Plateforme officielle d'engagement</span>
                <h1 className="mt-3 max-w-3xl text-[40px] font-bold leading-[0.99] tracking-[-0.065em] text-white sm:text-[60px]">La vie associative & la transparence parentale réunies.</h1>
                <p className="mt-4 max-w-xl text-[13px] leading-6 text-white/75 sm:text-[15px]">Inscrivez-vous aux clubs, suivez les événements en direct et recevez les rapports de réussite en famille.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="#clubs" className="inline-flex h-11 items-center gap-2 rounded-full bg-[#d5f28a] px-5 text-[12px] font-bold text-[#20382a] transition hover:bg-white">Explorer les clubs <ArrowRight size={15} /></a>
                  <a href="#news" className="inline-flex h-11 items-center gap-2 rounded-full border border-white/35 bg-white/10 px-5 text-[12px] font-semibold text-white backdrop-blur transition hover:bg-white/20"><FileText size={15} />Actualités & Documents</a>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION NEWS & DOCUMENTS OFFICIELS */}
          <section id="news" className="bg-[#1e3a2f] text-white py-12 px-5 sm:px-8 border-t border-white/10">
            <div className="mx-auto max-w-[1320px]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                  <span className="text-[#d5f28a] text-[10px] font-bold uppercase tracking-widest">FIL D'ACTUALITÉS & DOCUMENTS</span>
                  <h2 className="text-2xl sm:text-3xl font-bold mt-1">Annonces officielles & Circulaires en Direct</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {newsList.map((item) => (
                  <div key={item.id} className="bg-white/10 p-6 rounded-2xl border border-white/15 backdrop-blur flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-[#d5f28a] text-[#20382a] text-[10px] font-bold px-2.5 py-1 rounded-full">{item.authorName}</span>
                        <span className="text-[10px] text-white/60">{item.createdAt}</span>
                      </div>
                      <h3 className="font-bold text-lg">{item.title}</h3>
                      <p className="text-xs text-white/80 mt-2 leading-relaxed">{item.content}</p>

                      {item.attachmentType === 'image' && item.attachmentUrl && (
                        <div className="mt-4 rounded-xl overflow-hidden border border-white/20 shadow-lg">
                          <img src={item.attachmentUrl} alt={item.title} className="w-full h-48 object-cover hover:scale-105 transition duration-300" />
                        </div>
                      )}

                      {item.attachmentType === 'pdf' && item.attachmentUrl && (
                        <div className="mt-4">
                          <a href={item.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-xs font-bold transition">
                            <FileText size={14} /> Télécharger le document PDF joint
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="rendez-vous" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20">
            <div className="mx-auto max-w-[1320px]">
              <div className="mb-7 flex flex-col justify-between gap-3 sm:mb-9 sm:flex-row sm:items-end">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.19em] text-[#759263]">À VIVRE BIENTÔT</p><h2 className="mt-2 text-[29px] font-bold tracking-[-0.05em] text-[#20382a] sm:text-[37px]">Le campus te donne rendez-vous.</h2></div>
              </div>
              <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[1.45fr_.8fr]">
                <EventCard event={featuredEvent} club={eventClub(featuredEvent)} onSelect={selectEvent} featured onToast={(t, d) => notify(t, d)} />
                <div className="flex flex-col gap-3">
                  {otherEvents.slice(0, 3).map((event) => <EventCard key={event.id} event={event} club={eventClub(event)} onSelect={selectEvent} onToast={(t, d) => notify(t, d)} />)}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION CLUBS */}
          <section id="clubs" className="scroll-mt-20 bg-[#f0f2eb] px-5 py-16 sm:px-8 sm:py-20">
            <div className="mx-auto max-w-[1320px]">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.19em] text-[#759263]">DES GENS, DES IDÉES, DU MOUVEMENT</p><h2 className="mt-2 text-[30px] font-bold tracking-[-0.05em] text-[#20382a] sm:text-[38px]">Il y a forcément ta place.</h2></div>
                <label className="relative w-full sm:max-w-[250px]"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="search" aria-label="Rechercher un club" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un club..." className="h-10 w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 text-[11px] outline-none transition focus:border-[#8faa78]" /></label>
              </div>
              <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
                {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-semibold transition ${category === item ? 'bg-[#214633] text-white' : 'border border-slate-200 bg-white/80 text-slate-500'}`}>{item}</button>)}
              </div>
             
              {visibleClubs.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleClubs.map((club) => {
                  const isLiked = likedClubs[club.id] || false
                  return (
                    <ClubCard
                      key={club.id}
                      club={club}
                      nextEvent={featuredEvents.filter((event) => event.clubId === club.id).sort((a, b) => a.date.localeCompare(b.date))[0]}
                      onDetails={showClub}
                      isLiked={isLiked}
                      onToggleLike={() => handleToggleLike(club.id)}
                      onOpenRegister={() => setStudentModalClub(club)}
                    />
                  )
                })}
              </div> : null}
            </div>
          </section>

          <section id="agenda" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20">
            <div className="mx-auto max-w-[1320px]">
              <CampusCalendar
                events={featuredEvents}
                month={month}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onChangeMonth={setMonth}
                onSelectEvent={selectEvent}
              />
            </div>
          </section>
        </main>
      )}

      <Footer onNavigate={navigateTo} />
      {toast && <Toast title={toast.title} description={toast.description} type={toast.type} onClose={dismissToast} />}
    </div>
  )
}

export default App