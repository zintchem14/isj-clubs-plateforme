import { ArrowLeft, CalendarDays, Check, Clock3, MapPin, Pencil, Share2, Users } from 'lucide-react'
import type { Club } from '../types'

type ClubDetailsProps = {
  club: Club
  onBack: () => void
  onEdit: (club: Club) => void
  onToast: (title: string, description: string) => void
}

export function ClubDetails({ club, onBack, onEdit, onToast }: ClubDetailsProps) {
  const remaining = Math.max(club.capacity - club.members, 0)
  const occupancy = Math.min(Math.round((club.members / club.capacity) * 100), 100)

  async function shareClub() {
    try {
      if (navigator.share) {
        await navigator.share({ title: club.name, text: club.description, url: window.location.href })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href)
      } else {
        throw new Error('Le partage n’est pas pris en charge sur ce navigateur.')
      }
      onToast('Fiche prête à partager', 'Le lien du club a été copié ou partagé.')
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      onToast('Partage indisponible', 'Une erreur est survenue lors du partage de cette fiche.')
    }
  }

  return (
    <section className="mx-auto max-w-5xl">
      <button type="button" onClick={onBack} className="mb-5 flex items-center gap-2 text-[12px] font-semibold text-slate-500 transition hover:text-slate-900"><ArrowLeft size={15} /> Tous les clubs</button>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm">
        <div className="relative h-[230px] sm:h-[320px]">
          <img src={club.image} alt={`Illustration du club ${club.name}`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
          <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-slate-700 backdrop-blur">{club.category}</span>
          <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-4 sm:bottom-7 sm:left-8 sm:right-8">
            <div className="text-white">
              <span className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold ${club.status === 'Complet' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}><span className={`h-1.5 w-1.5 rounded-full ${club.status === 'Complet' ? 'bg-amber-500' : 'bg-emerald-500'}`} />{club.status}</span>
              <h1 className="text-[28px] font-bold tracking-[-0.04em] sm:text-[38px]">{club.name}</h1>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={shareClub} className="flex h-10 items-center gap-2 rounded-xl border border-white/35 bg-white/15 px-3 text-[11px] font-semibold text-white backdrop-blur transition hover:bg-white/25"><Share2 size={14} /><span className="hidden sm:inline">Partager</span></button>
              <button type="button" onClick={() => onEdit(club)} className="flex h-10 items-center gap-2 rounded-xl bg-[#c6f06b] px-3.5 text-[11px] font-bold text-[#1a3025] transition hover:bg-[#d4f694]"><Pencil size={14} />Modifier</button>
            </div>
          </div>
        </div>
        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_300px]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#688958]">À propos du club</p>
            <p className="mt-3 max-w-2xl text-[14px] leading-7 text-slate-600">{club.description}</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl bg-[#f6f8f4] p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#638650] shadow-sm"><CalendarDays size={18} /></span><div><p className="text-[10px] text-slate-400">RENDEZ-VOUS</p><p className="mt-1 text-[12px] font-semibold text-slate-800">{club.meeting}</p></div></div>
              <div className="flex items-center gap-3 rounded-2xl bg-[#f6f8f4] p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#638650] shadow-sm"><MapPin size={18} /></span><div><p className="text-[10px] text-slate-400">LIEU</p><p className="mt-1 text-[12px] font-semibold text-slate-800">{club.location}</p></div></div>
            </div>
          </div>
          <aside className="rounded-2xl border border-slate-100 bg-[#fbfcfa] p-5">
            <p className="text-[12px] font-bold text-slate-800">La vie du club</p>
            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500"><Users size={16} /><span className="text-[11px]">Membres</span></div>
              <span className="text-[13px] font-bold text-slate-900">{club.members}<span className="font-medium text-slate-400"> / {club.capacity}</span></span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><span className={`block h-full rounded-full bg-gradient-to-r ${club.accent}`} style={{ width: `${occupancy}%` }} /></div>
            <div className="mt-2 flex justify-between text-[10px] text-slate-400"><span>Places occupées</span><span>{occupancy}%</span></div>
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-white p-3 text-[11px] text-slate-600"><Clock3 size={15} className="text-[#6e9656]" />{remaining > 0 ? <><strong className="text-slate-800">{remaining} places</strong> encore disponibles</> : <><Check size={14} className="text-amber-600" />Les inscriptions sont complètes</>}</div>
            <p className="mt-4 text-[10px] leading-5 text-slate-400">Les inscriptions étudiantes pourront être activées lors de la prochaine étape.</p>
          </aside>
        </div>
      </div>
    </section>
  )
}
