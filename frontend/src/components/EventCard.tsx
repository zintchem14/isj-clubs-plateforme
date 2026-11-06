import { useState } from 'react'
import { ArrowUpRight, CalendarDays, MapPin, Heart, MessageSquare, Mail, Trophy } from 'lucide-react'
import type { CampusEvent, Club } from '../types'

type EventCardProps = {
  event: CampusEvent
  club: Club | undefined
  onSelect: (event: CampusEvent) => void
  featured?: boolean
  onToast?: (title: string, description: string) => void
}

export function EventCard({ event, club, onSelect, featured = false, onToast }: EventCardProps) {
  const date = new Date(`${event.date}T12:00:00`)
  const day = new Intl.DateTimeFormat('fr-FR', { day: '2-digit' }).format(date)
  const month = new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(date).replace('.', '')
  const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(date)
  const dateLabel = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(date)

  const [likes, setLikes] = useState<number>(18)
  const [isLiked, setIsLiked] = useState<boolean>(false)
  const [showComments, setShowComments] = useState<boolean>(false)
  const [comments, setComments] = useState<string[]>([
    "Hâte d'y participer avec toute l'équipe !",
    "Super initiative pour le campus de l'ISJ."
  ])
  const [newComment, setNewComment] = useState<string>('')

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLiked) {
      setLikes(likes - 1)
      setIsLiked(false)
      onToast?.('Cœur retiré', 'Soutien retiré de cet événement.')
    } else {
      setLikes(likes + 1)
      setIsLiked(true)
      onToast?.('Coup de cœur !', 'Vous soutenez cet événement.')
    }
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!newComment.trim()) return
    setComments([newComment, ...comments])
    setNewComment('')
    onToast?.('Commentaire publié', 'Votre message est visible sur cet événement.')
  }

  const handleNotifyParent = async (e: React.MouseEvent, type: 'start' | 'trophy') => {
    e.stopPropagation()
    const title = type === 'start'
      ? `🚀 Début de l'événement : ${event.title}`
      : `🏆 Trophée & Clôture : ${event.title}`
    
    const details = type === 'start'
      ? `Votre enfant vient de participer au lancement de l'événement ${event.title} (${event.location}).`
      : `L'événement ${event.title} s'est achevé avec succès ! Votre enfant a brillamment validé ses compétences.`

    try {
      const response = await fetch('http://127.0.0.1:8000/api/notify-parent/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: 'individual',
          parent_email: "parent@example.com",
          student_name: "Johann N.",
          achievement_title: title,
          message_details: details
        }),
      })

      if (response.ok) {
        onToast?.('📧 E-mail parent envoyé !', type === 'start' ? "Le parent est prévenu du début." : "Le rapport de fin et trophée ont été envoyés.")
      } else {
        onToast?.('Erreur', "Échec de l'envoi de l'e-mail.")
      }
    } catch (error) {
      console.error(error)
      onToast?.('Erreur réseau', "Impossible de joindre l'API Django.")
    }
  }

  if (featured) {
    return (
      <article className="group relative flex min-h-[460px] w-full min-w-0 flex-col justify-end overflow-hidden rounded-[28px] bg-[#1c2c22] p-6 sm:p-10 lg:p-12 shadow-lg">
        <img src={event.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101c15]/95 via-[#142118]/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101c15]/90 via-[#101c15]/40 to-transparent" />

        <div className="relative z-10 max-w-2xl text-white">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#d5f28a]" /> L’événement phare
          </span>
          <p className="mb-2 text-[11px] font-medium capitalize text-white/75">{weekday} {dateLabel} · {event.startTime}</p>
          <h2 className="max-w-xl text-[34px] font-bold leading-[1.04] tracking-[-0.05em] sm:text-[46px]">{event.title}</h2>
          <p className="mt-3 max-w-lg text-[13px] leading-6 text-white/80">{event.description}</p>
          
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-white/80">
            <span className="flex items-center gap-1.5"><MapPin size={13} className="text-[#d5f28a]" />{event.location}</span>
            {club && <span className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-white/50" />Avec {club.name}</span>}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => onSelect(event)} className="inline-flex h-10 items-center gap-2 rounded-full bg-[#d5f28a] px-4 text-[11px] font-bold text-[#20382a] transition hover:bg-white shadow">
              Découvrir <ArrowUpRight size={14} />
            </button>

            <button type="button" onClick={handleToggleLike} className={`flex h-10 items-center gap-1.5 rounded-full px-4 text-[11px] font-semibold backdrop-blur transition ${isLiked ? 'bg-rose-500 text-white' : 'border border-white/35 bg-white/10 text-white hover:bg-white/20'}`}>
              <Heart size={14} className={isLiked ? 'fill-white' : ''} /> <span>{likes}</span>
            </button>

            <button type="button" onClick={(e) => handleNotifyParent(e, 'start')} className="flex h-10 items-center gap-1.5 rounded-full border border-sky-400/50 bg-sky-500/20 px-3.5 text-[10px] font-semibold text-white backdrop-blur hover:bg-sky-500/40 transition" title="Alerter le parent du début">
              <Mail size={13} /> <span>Alerter Début</span>
            </button>

            <button type="button" onClick={(e) => handleNotifyParent(e, 'trophy')} className="flex h-10 items-center gap-1.5 rounded-full border border-emerald-400/50 bg-emerald-500/20 px-3.5 text-[10px] font-semibold text-white backdrop-blur hover:bg-emerald-500/40 transition" title="Envoyer le rapport de fin / trophée">
              <Trophy size={13} className="text-amber-300" /> <span>Envoyer Trophée</span>
            </button>
          </div>
        </div>

        <div className="absolute right-5 top-5 flex h-[66px] w-[62px] flex-col items-center justify-center rounded-2xl border border-white/30 bg-white/90 text-[#20382a] shadow-lg backdrop-blur sm:right-7 sm:top-7">
          <span className="text-[21px] font-bold leading-none">{day}</span>
          <span className="mt-1 text-[9px] font-bold uppercase tracking-widest">{month}</span>
        </div>
      </article>
    )
  }

  return (
    <div className="flex w-full flex-col rounded-2xl border border-slate-200/80 bg-white p-3.5 transition-all duration-300 hover:border-[#b8d2a3] hover:shadow-md sm:p-4">
      <button type="button" onClick={() => onSelect(event)} className="group flex w-full items-center gap-4 text-left">
        <span className="flex h-[62px] w-[58px] shrink-0 flex-col items-center justify-center rounded-xl bg-[#f0f5e9] text-[#365a38]">
          <span className="text-[20px] font-bold leading-none">{day}</span>
          <span className="mt-1 text-[9px] font-bold uppercase tracking-wide">{month}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="mb-1.5 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#6a8c55]">
            <span>{event.format}</span>
            {club && <><span className="h-px w-3 bg-slate-200" /><span className="truncate text-slate-400">{club.name}</span></>}
          </span>
          <span className="block truncate text-[13px] font-bold text-slate-800 sm:text-[14px] group-hover:text-[#274b35] transition-colors">{event.title}</span>
          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><CalendarDays size={11} />{weekday} · {event.startTime}</span>
            <span className="flex items-center gap-1"><MapPin size={11} />{event.location}</span>
          </span>
        </span>
        <ArrowUpRight size={16} className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#3c6947]" />
      </button>

      {/* Barre d'actions rapides (Likes, Commentaires, Alertes parents) */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px]">
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleToggleLike} className={`flex items-center gap-1 rounded-full px-2.5 py-1 transition ${isLiked ? 'bg-rose-50 text-rose-600 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            <Heart size={13} className={isLiked ? 'fill-rose-500 text-rose-500' : ''} /> <span>{likes}</span>
          </button>
          <button type="button" onClick={() => setShowComments(!showComments)} className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 hover:bg-slate-200 transition">
            <MessageSquare size={13} /> <span>{comments.length}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button type="button" onClick={(e) => handleNotifyParent(e, 'start')} className="rounded-lg bg-sky-50 px-2.5 py-1 font-semibold text-sky-700 hover:bg-sky-100 transition" title="Alerter début">
            🚀 Début
          </button>
          <button type="button" onClick={(e) => handleNotifyParent(e, 'trophy')} className="rounded-lg bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 hover:bg-emerald-100 transition" title="Envoyer trophée / fin">
            🏆 Fin / Trophée
          </button>
        </div>
      </div>

      {/* Tiroir de commentaires interactif */}
      {showComments && (
        <div className="mt-3 rounded-xl bg-slate-50 p-3 border border-slate-200">
          <form onSubmit={handleAddComment} className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Écrire un commentaire..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 h-8 px-2.5 text-[11px] rounded-lg border border-slate-200 outline-none focus:border-[#385d3c] bg-white"
            />
            <button type="submit" className="bg-[#214633] text-white px-3 py-1 rounded-lg text-[11px] font-semibold hover:bg-[#152e22] transition">Publier</button>
          </form>
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {comments.map((c, i) => (
              <p key={i} className="text-[11px] bg-white p-2 rounded-md border border-slate-100 text-slate-700">💬 {c}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}