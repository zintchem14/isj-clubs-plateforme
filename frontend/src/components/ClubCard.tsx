import { Users, CalendarDays, ArrowUpRight, Heart, Sparkles } from 'lucide-react'
import type { Club, CampusEvent } from '../types'

type ClubCardProps = {
  club: Club
  nextEvent?: CampusEvent
  onDetails: (club: Club) => void
  isLiked?: boolean
  onToggleLike?: (clubId: string) => void
  onOpenRegister?: (club: Club) => void
}

export function ClubCard({ club, nextEvent, onDetails, isLiked = false, onToggleLike, onOpenRegister }: ClubCardProps) {
  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#8faa78] hover:shadow-[0_22px_50px_-24px_rgba(29,61,39,0.25)]">
      
      {/* En-tête avec image de couverture et boutons interactifs */}
      <div className="relative h-[220px] w-full overflow-hidden bg-slate-100">
        <img
          src={club.image || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"}
          alt={club.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101a13]/85 via-[#101a13]/30 to-transparent" />

        {/* Badge Catégorie */}
        <span className="absolute left-4 top-4 rounded-full border border-white/40 bg-white/90 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-[#20382a] backdrop-blur-md shadow-sm">
          {club.category}
        </span>

        {/* Bouton Cœur Interactif sur l'image */}
        {onToggleLike && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleLike(club.id); }}
            className={`absolute right-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur-md transition shadow-md ${
              isLiked 
                ? 'bg-rose-500 text-white' 
                : 'bg-white/90 text-slate-700 hover:text-rose-500 hover:bg-white'
            }`}
            title="Aimer ce club"
          >
            <Heart size={14} className={isLiked ? 'fill-white' : ''} />
            <span>{club.membersCount || 0}</span>
          </button>
        )}

        {/* Titre et nombre de membres incrustés sur l'image */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <span className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-[#d5f28a]">
            <Users size={12} /> {club.membersCount || 0} membres actifs
          </span>
          <h3 className="text-[22px] font-bold leading-tight tracking-tight text-white drop-shadow-sm">
            {club.name}
          </h3>
        </div>
      </div>

      {/* Corps de la carte */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <p className="line-clamp-2 min-h-[40px] text-[12px] leading-relaxed text-slate-600">
          {club.description || "Rejoignez ce club dynamique de l'Institut Saint Jean pour exprimer vos talents et collaborer sur des projets stimulants."}
        </p>

        {/* Prochain événement du club si disponible */}
        {nextEvent && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f4f7f0] p-2.5 border border-[#e2ebd7] text-[11px] text-slate-700">
            <CalendarDays size={14} className="text-[#597b45] shrink-0" />
            <span className="truncate">Prochain : <strong>{nextEvent.title}</strong></span>
          </div>
        )}

        {/* Actions de bas de carte */}
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => onDetails(club)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#20382a] hover:text-[#597b45] transition-colors"
          >
            Explorer <ArrowUpRight size={15} />
          </button>

          {onOpenRegister && (
            <button
              type="button"
              onClick={() => onOpenRegister(club)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#214633] px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-[#152e22] transition"
            >
              <Sparkles size={13} className="text-[#d5f28a]" /> S'inscrire
            </button>
          )}
        </div>
      </div>
    </article>
  )
}