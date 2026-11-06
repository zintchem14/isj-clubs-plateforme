import { useState } from 'react'
import { ArrowLeft, ArrowUpRight, CalendarDays, MapPin, Share2, Sparkles, Users, Heart, MessageSquare, ShieldCheck, Trophy, Mail } from 'lucide-react'
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

  // États pour les likes et commentaires interactifs
  const [likes, setLikes] = useState<number>(42)
  const [isLiked, setIsLiked] = useState<boolean>(false)
  const [comments, setComments] = useState<string[]>([
    "Super ambiance et encadrement au top !",
    "J'ai beaucoup progressé grâce aux ateliers pratiques."
  ])
  const [newComment, setNewComment] = useState<string>('')
  const [isJoining, setIsJoining] = useState<boolean>(false)

  // Fonction pour s'inscrire au club via l'API Django
  const handleJoinClub = async () => {
    setIsJoining(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/memberships/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          club: club.id,
        }),
      })

      if (response.ok) {
        onToast('Inscription réussie !', `Vous êtes maintenant membre de ${club.name}.`)
      } else {
        onToast('Information', 'Demande enregistrée ou vous êtes déjà membre.')
      }
    } catch (error) {
      console.error("Erreur d'inscription:", error)
      onToast('Erreur', 'Impossible de joindre le serveur Django.')
    } finally {
      setIsJoining(false)
    }
  }

  const handleToggleLike = () => {
    if (isLiked) {
      setLikes(likes - 1)
      setIsLiked(false)
      onToast('Cœur retiré', 'Vous avez retiré votre soutien.')
    } else {
      setLikes(likes + 1)
      setIsLiked(true)
      onToast('Coup de cœur ajouté !', 'Merci pour votre soutien à ce club.')
    }
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setComments([newComment, ...comments])
    setNewComment('')
    onToast('Commentaire publié !', 'Votre message est visible par la communauté.')
  }

  // Fonction de test d'envoi d'e-mail aux parents (Transparence & Trophée)
  const handleSendParentEmail = async (title: string, details: string) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/notify-parent/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parent_email: "ton-vrai-email@gmail.com", // Remplace par ton email ou celui du parent
          student_name: "Johann",
          achievement_title: title,
          message_details: details
        }),
      })

      if (response.ok) {
        onToast('📧 E-mail envoyé avec succès !', 'Vérifie ta boîte de réception.')
      } else {
        onToast('Erreur', "L'envoi de l'e-mail a échoué.")
      }
    } catch (error) {
      console.error("Erreur réseau:", error)
      onToast('Erreur', 'Impossible de contacter l’API Django.')
    }
  }

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
          <div className="flex shrink-0 gap-2 flex-wrap">
            {/* Bouton S'inscrire au club */}
            <button
              type="button"
              onClick={handleJoinClub}
              disabled={isJoining}
              className="flex h-10 items-center gap-1.5 rounded-full bg-[#d5f28a] px-4 text-[11px] font-bold text-[#20382a] transition hover:bg-white shadow-lg"
            >
              <Users size={14} /> {isJoining ? 'Inscription...' : "S'inscrire"}
            </button>

            {/* Bouton Like interactif */}
            <button
              type="button"
              onClick={handleToggleLike}
              className={`flex h-10 items-center gap-1.5 rounded-full px-4 text-[11px] font-semibold backdrop-blur transition ${isLiked ? 'bg-red-500 text-white' : 'border border-white/35 bg-white/10 text-white hover:bg-white/20'}`}
            >
              <Heart size={14} className={isLiked ? 'fill-white' : ''} />
              <span>{likes}</span>
            </button>
            <button type="button" onClick={shareClub} className="flex h-10 items-center gap-2 rounded-full border border-white/35 bg-white/10 px-4 text-[11px] font-semibold text-white backdrop-blur hover:bg-white/20"><Share2 size={14} />Partager</button>
          </div>
        </div>
      </section>

      {/* Encart Spécial Parents : Soft Skills & Employabilité */}
      <section className="mt-6 rounded-2xl bg-[#edf2e7] p-5 border border-[#d3e2c6] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#214633] text-[#d5f28a] p-3 rounded-xl">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-[#20382a]">Valeur ajoutée pour l'avenir de votre enfant (Parents)</h4>
            <p className="text-[11px] text-slate-600 mt-0.5">Participation validée : développement du leadership, travail d'équipe et gestion de projets concrets.</p>
          </div>
        </div>
        <span className="bg-white px-3 py-1.5 rounded-full text-[10px] font-bold text-[#385d3c] border border-[#cbe0bc] flex items-center gap-1 shrink-0">
          <Trophy size={13} className="text-amber-500" /> Trophée de compétences
        </span>
      </section>

      {/* Panneau de Démo : Envoi d'e-mails de transparence aux parents */}
      <div className="mt-6 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
        <h3 className="text-[13px] font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Mail size={16} className="text-[#385d3c]" /> Panneau de Démo : Transparence et Rapports Parents (E-mails)
        </h3>
        <p className="text-[11px] text-slate-500 mb-3">Simulez l'envoi d'un rapport de suivi vers la boîte mail du parent pour chaque étape clé.</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleSendParentEmail(
              `Annonce d'événement : ${club.name}`,
              `Votre enfant participe aux activités et au lancement du nouvel atelier du club ${club.name}.`
            )}
            className="bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-semibold px-3.5 py-2 rounded-xl transition"
          >
            ✉️ Envoyer l'e-mail (Début d'événement)
          </button>
          <button
            type="button"
            onClick={() => handleSendParentEmail(
              `🏆 Trophée & Clôture : ${club.name}`,
              `L'événement s'est achevé avec brio ! Votre enfant a brillamment validé ses compétences et son implication.`
            )}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-3.5 py-2 rounded-xl transition"
          >
            🏆 Envoyer le joli Mail de Trophée (Fin)
          </button>
        </div>
      </div>

      <div className="grid gap-10 py-9 lg:grid-cols-[1fr_300px]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#71905e]">VIENS COMME TU ES</p>
          <h2 className="mt-2 text-[25px] font-bold tracking-[-0.04em] text-slate-900 sm:text-[30px]">Une passion, mille façons de la vivre.</h2>
          <p className="mt-3 max-w-2xl text-[13px] leading-7 text-slate-600">{club.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">{(club.activities ?? ['Rencontres ouvertes', 'Ateliers créatifs', 'Projets entre étudiants']).map((activity) => <span key={activity} className="rounded-full border border-[#dfe9d6] bg-[#f5f8f1] px-3.5 py-2 text-[10px] font-semibold text-[#567448]">{activity}</span>)}</div>

          {/* Section Commentaires & Échanges */}
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#71905e]">ESPACE COMMUNAUTAIRE</p>
                <h2 className="mt-1 text-[20px] font-bold tracking-tight text-slate-900">Avis et retours d'expérience</h2>
              </div>
              <MessageSquare size={19} className="text-[#71905e]" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Partagez un commentaire ou un encouragement..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 h-10 px-3 text-[12px] rounded-xl border border-slate-200 outline-none focus:border-[#71905e]"
                />
                <button type="submit" className="bg-[#214633] text-white px-4 py-2 rounded-xl text-[12px] font-semibold hover:bg-[#152e22] transition">
                  Publier
                </button>
              </form>

              <div className="space-y-3">
                {comments.map((comment, index) => (
                  <div key={index} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[12px] text-slate-700 flex items-start gap-2">
                    <span className="text-base">💬</span>
                    <div>
                      <p className="font-semibold text-slate-900">Membre de la communauté</p>
                      <p className="text-slate-600 mt-0.5">{comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

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
          <button type="button" onClick={handleJoinClub} className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#214633] text-[11px] font-semibold text-white transition hover:bg-[#315a41]">Rejoindre le club <ArrowUpRight size={14} /></button>
        </aside>
      </div>
    </main>
  )
}