import { useState, useEffect } from 'react'
import { Plus, Trash2, Play, Pause, Square, Mail, CheckCircle2, XCircle, ShieldCheck, FileText, Image as ImageIcon, Users } from 'lucide-react'
import type { Club, CampusEvent, ToastMessage } from '../types'

type AdminDashboardProps = {
  clubs: Club[]
  events: CampusEvent[]
  onToast: (title: string, description: string, type: ToastMessage['type']) => void
  onLogout: () => void
}

export function AdminDashboard({ clubs, events, onToast, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'clubs' | 'attendance' | 'chrono' | 'email' | 'news'>('clubs')

  // --- 1. CRUD CLUBS & REQUÊTES BASE DE DONNÉES ---
  const [clubList, setClubList] = useState<Club[]>(clubs)
  const [membersList, setMembersList] = useState<any[]>([])
  const [newClubName, setNewClubName] = useState('')
  const [newClubCategory, setNewClubCategory] = useState('')
  const [newClubDesc, setNewClubDesc] = useState('')

  // Charger les membres enregistrés en base de données Django
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/memberships/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMembersList(data)
      })
      .catch(err => console.error("Erreur de chargement des membres depuis la BD:", err))
  }, [])

  // --- 2. CHRONOMÈTRES PERSISTANTS ET ALERTES PAR ACTIVITÉ ---
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '1')
 
  const [eventTimers, setEventTimers] = useState<Record<string, { status: 'idle' | 'running' | 'paused' | 'stopped', startTime: number | null, elapsedSeconds: number }>>(() => {
    const saved = localStorage.getItem('isj_admin_event_timers')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) { /* fallback */ }
    }
    return {
      [events[0]?.id || '1']: { status: 'idle', startTime: null, elapsedSeconds: 0 }
    }
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setEventTimers(prev => {
        let hasChanges = false
        const next = { ...prev }

        Object.keys(next).forEach(eventId => {
          const timer = next[eventId]
          if (timer && timer.status === 'running' && timer.startTime) {
            const now = Date.now()
            const currentElapsed = timer.elapsedSeconds + Math.floor((now - timer.startTime) / 1000)
            next[eventId] = { ...timer, startTime: now, elapsedSeconds: currentElapsed }
            hasChanges = true
          }
        })

        if (hasChanges) {
          localStorage.setItem('isj_admin_event_timers', JSON.stringify(next))
        }
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const triggerEventEmailAlert = async (eventTitle: string, statusText: string) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/notify-parent/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'start',
          target: 'school',
          subject: `Alerte Activité ISJ : ${eventTitle}`,
          message: `L'événement/atelier vient de passer au statut : ${statusText}.`
        })
      })
      if (response.ok) {
        onToast("📧 Alerte envoyée", `Les parents ont été notifiés : ${statusText}`, "success")
      }
    } catch (err) {
      console.error("Erreur alerte e-mail auto:", err)
    }
  }

  const handleStartChrono = (ev: CampusEvent) => {
    const now = Date.now()
    setEventTimers(prev => {
      const current = prev[ev.id] || { elapsedSeconds: 0 }
      const updated = {
        ...prev,
        [ev.id]: { status: 'running' as const, startTime: now, elapsedSeconds: current.elapsedSeconds }
      }
      localStorage.setItem('isj_admin_event_timers', JSON.stringify(updated))
      return updated
    })
    triggerEventEmailAlert(ev.title, "DÉBUT DE L'ACTIVITÉ 🚀")
  }

  const handlePauseChrono = (ev: CampusEvent) => {
    setEventTimers(prev => {
      const timer = prev[ev.id]
      if (!timer || timer.status !== 'running') return prev
      const now = Date.now()
      const additional = timer.startTime ? Math.floor((now - timer.startTime) / 1000) : 0
      const updated = {
        ...prev,
        [ev.id]: { status: 'paused' as const, startTime: null, elapsedSeconds: timer.elapsedSeconds + additional }
      }
      localStorage.setItem('isj_admin_event_timers', JSON.stringify(updated))
      return updated
    })
    triggerEventEmailAlert(ev.title, "EN PAUSE ⏸️")
  }

  const handleStopChrono = (ev: CampusEvent) => {
    setEventTimers(prev => {
      const timer = prev[ev.id]
      if (!timer) return prev
      const now = Date.now()
      const additional = (timer.status === 'running' && timer.startTime) ? Math.floor((now - timer.startTime) / 1000) : 0
      const updated = {
        ...prev,
        [ev.id]: { status: 'stopped' as const, startTime: null, elapsedSeconds: timer.elapsedSeconds + additional }
      }
      localStorage.setItem('isj_admin_event_timers', JSON.stringify(updated))
      return updated
    })
    triggerEventEmailAlert(ev.title, "FIN DE L'ACTIVITÉ / CLÔTURE ⏹️")
  }

  // --- 3. FEUILLE DE PRÉSENCE PAR CLUB ---
  const [selectedClubId, setSelectedClubId] = useState<string>(clubs[0]?.id || '1')
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({})

  const togglePresence = (membershipId: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [membershipId]: !prev[membershipId]
    }))
    onToast("Pointage mis à jour", "La présence de l'étudiant a été enregistrée.", "success")
  }

  // --- 4. ENVOI E-MAIL & RAPPORT PARENT (AVEC SUPPORT PHOTO MULTIPART) ---
  const [emailTarget, setEmailTarget] = useState<'individual' | 'club' | 'school'>('individual')
  const [targetClubId, setTargetClubId] = useState<string>(clubs[0]?.id || '1')
  const [parentEmail, setParentEmail] = useState('')
  const [studentName, setStudentName] = useState('')
  const [reportTitle, setReportTitle] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [reportPhoto, setReportPhoto] = useState<File | null>(null)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const handleSendParentReport = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSendingEmail(true)

    try {
      const formData = new FormData()
      formData.append('kind', 'victory')
      formData.append('target', emailTarget)
      formData.append('subject', reportTitle)
      formData.append('message', reportDetails)

      if (emailTarget === 'individual') {
        formData.append('parent_email', parentEmail)
        formData.append('student_name', studentName)
      } else if (emailTarget === 'club') {
        formData.append('club_id', targetClubId)
      }

      if (reportPhoto) {
        formData.append('photo', reportPhoto)
      }

      const response = await fetch('http://127.0.0.1:8000/api/notify-parent/', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (response.ok) {
        onToast("✅ E-mail envoyé avec succès", data.message || "Le compte-rendu a été transmis.", "success")
        setReportTitle('')
        setReportDetails('')
        setParentEmail('')
        setStudentName('')
        setReportPhoto(null)
      } else {
        onToast("❌ Échec de l'envoi", data.error || "Impossible d'envoyer l'e-mail.", "error")
      }
    } catch (err) {
      onToast("❌ Erreur réseau", "Le serveur Django ne répond pas.", "error")
    } finally {
      setIsSendingEmail(false)
    }
  }

  // --- 5. PUBLICATION D'ACTUALITÉS / CIRCULAIRES ---
  const [newsTitle, setNewsTitle] = useState('')
  const [newsContent, setNewsContent] = useState('')
  const [newsFile, setNewsFile] = useState<File | null>(null)
  const [isPublishingNews, setIsPublishingNews] = useState(false)

  const handlePublishNews = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPublishingNews(true)

    try {
      const formData = new FormData()
      formData.append('title', newsTitle)
      formData.append('content', newsContent)
      if (newsFile) {
        formData.append('attachment', newsFile)
      }

      const response = await fetch('http://127.0.0.1:8000/api/news/', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        onToast("Actualité publiée", "L'annonce est désormais en ligne sur le portail.", "success")
        setNewsTitle('')
        setNewsContent('')
        setNewsFile(null)
      } else {
        onToast("Erreur", "Impossible de publier l'actualité.", "error")
      }
    } catch (err) {
      onToast("Erreur réseau", "Impossible de contacter le serveur Django.", "error")
    } finally {
      setIsPublishingNews(false)
    }
  }

  // --- 6. CRUD CLUBS ---
  const handleAddClub = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClubName.trim()) return
    const newClub: Club = {
      id: Date.now().toString(),
      name: newClubName,
      category: newClubCategory || 'Général',
      description: newClubDesc,
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
      membersCount: 0
    }
    setClubList([...clubList, newClub])
    setNewClubName('')
    setNewClubCategory('')
    setNewClubDesc('')
    onToast("Club créé", "L'association a été ajoutée avec succès.", "success")
  }

  const handleDeleteClub = (id: string) => {
    setClubList(clubList.filter(c => c.id !== id))
    onToast("Club supprimé", "L'association a été retirée.", "info")
  }

  const filteredClubMembers = membersList.filter(m => String(m.club) === String(selectedClubId) || String(m.club_id) === String(selectedClubId))

  return (
    <div className="bg-[#121c16] text-white min-h-screen p-4 sm:p-8">
      <div className="max-w-[1320px] mx-auto">
        {/* Header Admin */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-white/10 pb-5">
          <div>
            <span className="bg-[#d5f28a] text-[#121c16] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Espace Sécurisé Superuser</span>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2 flex items-center gap-2">
              <ShieldCheck className="text-[#d5f28a]" size={28} /> Dashboard de Contrôle Administratif ISJ
            </h1>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-500/30 transition"
          >
            Fermer le Panel Admin
          </button>
        </div>

        {/* Navigation Admin */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white/5 p-2 rounded-2xl border border-white/10">
          <button onClick={() => setActiveTab('clubs')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'clubs' ? 'bg-[#d5f28a] text-[#121c16]' : 'text-white/70 hover:bg-white/10'}`}>
            ✨ CRUD Clubs & Stats BD
          </button>
          <button onClick={() => setActiveTab('chrono')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'chrono' ? 'bg-[#d5f28a] text-[#121c16]' : 'text-white/70 hover:bg-white/10'}`}>
            ⏱️ Chronos Activités & Mail Auto
          </button>
          <button onClick={() => setActiveTab('attendance')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'attendance' ? 'bg-[#d5f28a] text-[#121c16]' : 'text-white/70 hover:bg-white/10'}`}>
            📋 Feuille d'Appel par Club (BD)
          </button>
          <button onClick={() => setActiveTab('email')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'email' ? 'bg-[#d5f28a] text-[#121c16]' : 'text-white/70 hover:bg-white/10'}`}>
            📧 Rapport & Photo Parent
          </button>
          <button onClick={() => setActiveTab('news')} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'news' ? 'bg-[#d5f28a] text-[#121c16]' : 'text-white/70 hover:bg-white/10'}`}>
            📰 Actualités & PDF
          </button>
        </div>

        {/* 1. CRUD CLUBS & STATS */}
        {activeTab === 'clubs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2"><Plus size={18} /> Ajouter un nouveau club</h3>
              <form onSubmit={handleAddClub} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Nom du Club</label>
                  <input type="text" value={newClubName} onChange={e => setNewClubName(e.target.value)} required placeholder="Ex: Club Robotique" className="w-full h-10 px-3 bg-black/30 border border-white/20 rounded-xl text-xs outline-none focus:border-[#d5f28a]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Catégorie</label>
                  <input type="text" value={newClubCategory} onChange={e => setNewClubCategory(e.target.value)} placeholder="Ex: Technologie" className="w-full h-10 px-3 bg-black/30 border border-white/20 rounded-xl text-xs outline-none focus:border-[#d5f28a]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Description</label>
                  <textarea value={newClubDesc} onChange={e => setNewClubDesc(e.target.value)} rows={3} placeholder="Description..." className="w-full p-3 bg-black/30 border border-white/20 rounded-xl text-xs outline-none focus:border-[#d5f28a]" />
                </div>
                <button type="submit" className="w-full h-10 bg-[#d5f28a] text-[#121c16] font-bold rounded-xl text-xs hover:bg-white transition">Enregistrer le Club</button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white/5 p-6 rounded-2xl border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold">Base de Données : {clubList.length} Clubs enregistrés</h3>
                <span className="text-xs bg-[#d5f28a]/20 text-[#d5f28a] px-3 py-1 rounded-full font-bold">{events.length} Événements planifiés</span>
              </div>
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                {clubList.map(club => {
                  const clubEventsCount = events.filter(ev => ev.clubId === club.id).length
                  const clubMembersCount = membersList.filter(m => String(m.club) === String(club.id)).length
                  return (
                    <div key={club.id} className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-xl">
                      <div>
                        <span className="text-[10px] bg-[#d5f28a]/20 text-[#d5f28a] px-2 py-0.5 rounded font-bold uppercase">{club.category}</span>
                        <h4 className="font-bold text-sm mt-1">{club.name}</h4>
                        <p className="text-xs text-white/60 mt-1">👥 {clubMembersCount} étudiant(s) inscrit(s) · 📅 {clubEventsCount} événement(s)</p>
                      </div>
                      <button onClick={() => handleDeleteClub(club.id)} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded-lg transition" title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. CHRONOS & EMAILS AUTOMATIQUES */}
        {activeTab === 'chrono' && (
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h3 className="text-lg font-bold mb-2">⏱️ Chronomètre par Activité & Alertes Parentales</h3>
            <p className="text-xs text-white/60 mb-6">Le chronomètre calcule le temps écoulé en temps réel et avertit automatiquement les parents lors du démarrage, de la pause ou de la fin.</p>
           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map(ev => {
                const timerState = eventTimers[ev.id] || { status: 'idle', startTime: null, elapsedSeconds: 0 }
                const currentRunningSeconds = (timerState.status === 'running' && timerState.startTime)
                  ? timerState.elapsedSeconds + Math.floor((Date.now() - timerState.startTime) / 1000)
                  : timerState.elapsedSeconds

                const mins = Math.floor(currentRunningSeconds / 60)
                const secs = currentRunningSeconds % 60

                return (
                  <div key={ev.id} className={`p-5 rounded-2xl border transition ${selectedEventId === ev.id ? 'border-[#d5f28a] bg-white/10' : 'border-white/10 bg-black/20'}`} onClick={() => setSelectedEventId(ev.id)}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#d5f28a]">{ev.format} · {ev.date}</span>
                        <h4 className="font-bold text-base mt-0.5">{ev.title}</h4>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${timerState.status === 'running' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : timerState.status === 'paused' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-300'}`}>
                        {timerState.status === 'running' ? `En cours (${mins}m ${secs}s)` : timerState.status === 'paused' ? `En pause (${mins}m ${secs}s)` : timerState.status === 'stopped' ? `Terminé (${mins}m ${secs}s)` : 'En attente'}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button onClick={() => handleStartChrono(ev)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                        <Play size={14} /> Démarrer & Alerter
                      </button>
                      <button onClick={() => handlePauseChrono(ev)} className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-2 rounded-xl text-xs font-bold" title="Pause">
                        <Pause size={14} />
                      </button>
                      <button onClick={() => handleStopChrono(ev)} className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-xl text-xs font-bold" title="Arrêter">
                        <Square size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 3. FEUILLE D'APPEL PAR CLUB (BD) */}
        {activeTab === 'attendance' && (
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h3 className="text-lg font-bold mb-2">📋 Feuille d'Appel par Club (Basée sur la BD Django)</h3>
            <p className="text-xs text-white/60 mb-6">Consultez les étudiants inscrits via le formulaire public et effectuez l'appel en direct.</p>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {clubList.map(c => (
                <button key={c.id} onClick={() => setSelectedClubId(c.id)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${selectedClubId === c.id ? 'bg-[#d5f28a] text-[#121c16]' : 'bg-black/30 text-white/70 border border-white/10'}`}>
                  {c.name}
                </button>
              ))}
            </div>

            <div className="bg-black/20 p-5 rounded-2xl border border-white/10 max-w-2xl">
              <h4 className="font-bold text-sm mb-4 text-[#d5f28a] flex items-center gap-2"><Users size={16} /> Étudiants inscrits dans ce groupe ({filteredClubMembers.length})</h4>
              {filteredClubMembers.length === 0 ? (
                <p className="text-xs text-white/50 italic py-4">Aucune inscription enregistrée pour ce club en base de données.</p>
              ) : (
                <div className="space-y-3">
                  {filteredClubMembers.map((m) => {
                    const isPresent = attendanceMap[m.id] || false
                    return (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                        <div>
                          <span className="font-semibold text-sm block">{m.student_name || m.studentName}</span>
                          <span className="text-[10px] text-white/50">Étudiant : {m.student_email || m.studentEmail} · Parent : {m.parent_email || m.parentEmail}</span>
                        </div>
                        <button
                          onClick={() => togglePresence(m.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${isPresent ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}
                        >
                          {isPresent ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          {isPresent ? 'Présent' : 'Absent'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. ENVOI E-MAIL & RAPPORT PARENT */}
        {activeTab === 'email' && (
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 max-w-3xl">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><Mail className="text-[#d5f28a]" /> Rapport de Réussite & Envoi de Photo au Parent</h3>
            <p className="text-xs text-white/60 mb-6">Diffusez un compte-rendu personnalisé avec photo aux parents.</p>

            <form onSubmit={handleSendParentReport} className="space-y-4">
              <div className="grid grid-cols-3 gap-3 bg-black/30 p-1.5 rounded-xl border border-white/10">
                <button type="button" onClick={() => setEmailTarget('individual')} className={`py-2 rounded-lg text-xs font-bold transition ${emailTarget === 'individual' ? 'bg-[#d5f28a] text-[#121c16]' : 'text-white/70'}`}>Individuel</button>
                <button type="button" onClick={() => setEmailTarget('club')} className={`py-2 rounded-lg text-xs font-bold transition ${emailTarget === 'club' ? 'bg-[#d5f28a] text-[#121c16]' : 'text-white/70'}`}>Par Club</button>
                <button type="button" onClick={() => setEmailTarget('school')} className={`py-2 rounded-lg text-xs font-bold transition ${emailTarget === 'school' ? 'bg-[#d5f28a] text-[#121c16]' : 'text-white/70'}`}>Toute l'École</button>
              </div>

              {emailTarget === 'individual' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">E-mail du Parent</label>
                    <input type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} required placeholder="parent@example.com" className="w-full h-10 px-3 bg-black/30 border border-white/20 rounded-xl text-xs outline-none focus:border-[#d5f28a]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">Nom de l'étudiant</label>
                    <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} required placeholder="Johann N." className="w-full h-10 px-3 bg-black/30 border border-white/20 rounded-xl text-xs outline-none focus:border-[#d5f28a]" />
                  </div>
                </div>
              )}

              {emailTarget === 'club' && (
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Sélectionner le Club cible</label>
                  <select value={targetClubId} onChange={e => setTargetClubId(e.target.value)} className="w-full h-10 px-3 bg-black/30 border border-white/20 rounded-xl text-xs text-white outline-none focus:border-[#d5f28a]">
                    {clubList.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#121c16] text-white">{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Sujet / Titre de l'événement</label>
                <input type="text" value={reportTitle} onChange={e => setReportTitle(e.target.value)} required placeholder="Ex: 🏆 Victoire Hackathon ISJ" className="w-full h-10 px-3 bg-black/30 border border-white/20 rounded-xl text-xs outline-none focus:border-[#d5f28a]" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Message / Détails</label>
                <textarea value={reportDetails} onChange={e => setReportDetails(e.target.value)} rows={4} required placeholder="Votre enfant s'est illustré aujourd'hui..." className="w-full p-3 bg-black/30 border border-white/20 rounded-xl text-xs outline-none focus:border-[#d5f28a]" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1 flex items-center gap-1.5"><ImageIcon size={14} /> Joindre une photo</label>
                <input type="file" accept="image/*" onChange={e => setReportPhoto(e.target.files?.[0] || null)} className="w-full text-xs text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#d5f28a] file:text-[#121c16] hover:file:bg-white cursor-pointer" />
              </div>

              <button type="submit" disabled={isSendingEmail} className="w-full h-11 bg-[#d5f28a] text-[#121c16] font-bold rounded-xl text-sm hover:bg-white transition shadow-lg flex items-center justify-center gap-2">
                {isSendingEmail ? "Envoi en cours..." : "📤 Envoyer le rapport par e-mail"}
              </button>
            </form>
          </div>
        )}

        {/* 5. ACTUALITÉS & PDF */}
        {activeTab === 'news' && (
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 max-w-3xl">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><FileText className="text-[#d5f28a]" /> Publication d'Actualités & Circulaires PDF</h3>
            <p className="text-xs text-white/60 mb-6">Diffusez des documents officiels visibles immédiatement sur le fil d'actualités.</p>

            <form onSubmit={handlePublishNews} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Titre de l'annonce</label>
                <input type="text" value={newsTitle} onChange={e => setNewsTitle(e.target.value)} required placeholder="Ex: Règlement intérieur mis à jour" className="w-full h-10 px-3 bg-black/30 border border-white/20 rounded-xl text-xs outline-none focus:border-[#d5f28a]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Contenu</label>
                <textarea value={newsContent} onChange={e => setNewsContent(e.target.value)} rows={3} required placeholder="Détails de la circulaire..." className="w-full p-3 bg-black/30 border border-white/20 rounded-xl text-xs outline-none focus:border-[#d5f28a]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Pièce jointe (PDF ou Image)</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setNewsFile(e.target.files?.[0] || null)} className="w-full text-xs text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#d5f28a] file:text-[#121c16] hover:file:bg-white cursor-pointer" />
              </div>
              <button type="submit" disabled={isPublishingNews} className="w-full h-11 bg-[#d5f28a] text-[#121c16] font-bold rounded-xl text-sm hover:bg-white transition shadow-lg">
                {isPublishingNews ? "Publication..." : "Publier l'actualité"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}