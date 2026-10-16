import { ArrowLeft, ImagePlus, Save } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { categories } from '../data/clubs'
import type { Club, ClubCategory, ClubDraft } from '../types'

type ClubFormProps = {
  club?: Club
  onCancel: () => void
  onSubmit: (draft: ClubDraft) => void
}

export function ClubForm({ club, onCancel, onSubmit }: ClubFormProps) {
  const [name, setName] = useState(club?.name ?? '')
  const [category, setCategory] = useState<ClubCategory>(club?.category ?? 'Sport')
  const [description, setDescription] = useState(club?.description ?? '')
  const [image, setImage] = useState(club?.image ?? '')
  const [capacity, setCapacity] = useState(String(club?.capacity ?? 24))
  const [members, setMembers] = useState(String(club?.members ?? 0))
  const [meeting, setMeeting] = useState(club?.meeting ?? '')
  const [location, setLocation] = useState(club?.location ?? '')
  const [imageError, setImageError] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const memberCount = Number(members)
    const capacityCount = Number(capacity)
    if (memberCount > capacityCount) return
    onSubmit({
      name: name.trim(),
      category,
      description: description.trim(),
      image: image.trim(),
      capacity: capacityCount,
      members: memberCount,
      meeting: meeting.trim(),
      location: location.trim(),
    })
  }

  const inputClass = 'mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/70'

  return (
    <section className="mx-auto max-w-4xl">
      <button type="button" onClick={onCancel} className="mb-5 flex items-center gap-2 text-[12px] font-semibold text-slate-500 transition hover:text-slate-900"><ArrowLeft size={15} /> Retour aux clubs</button>
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#688958]">{club ? 'MODIFICATION' : 'NOUVEAU CLUB'}</p>
        <h1 className="mt-2 text-[28px] font-bold tracking-[-0.04em] text-slate-900 sm:text-[34px]">{club ? 'Mettre à jour le club' : 'Créer un club'}</h1>
        <p className="mt-2 text-[13px] text-slate-500">Les informations du club seront visibles par les étudiants.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <label className="text-[11px] font-semibold text-slate-700">Nom du club <span className="text-rose-500">*</span>
            <input required maxLength={70} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Les Aigles du campus" className={inputClass} />
          </label>
          <label className="text-[11px] font-semibold text-slate-700">Catégorie <span className="text-rose-500">*</span>
            <select value={category} onChange={(event) => setCategory(event.target.value as ClubCategory)} className={inputClass}>
              {categories.slice(1).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-[11px] font-semibold text-slate-700 sm:col-span-2">Description <span className="text-rose-500">*</span>
            <textarea required maxLength={500} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Présentez l’esprit du club, ses activités et ce qui le rend unique..." className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[13px] leading-5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/70" />
            <span className="mt-1 block text-right text-[10px] font-normal text-slate-400">{description.length}/500</span>
          </label>
          <label className="text-[11px] font-semibold text-slate-700 sm:col-span-2">URL de la photo de couverture <span className="text-rose-500">*</span>
            <span className="relative mt-1.5 block">
              <ImagePlus size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input required type="url" value={image} onChange={(event) => { setImage(event.target.value); setImageError(false) }} placeholder="https://exemple.com/photo.jpg" className={`${inputClass} pl-10`} />
            </span>
            {image && !imageError && <img src={image} alt="Aperçu de la couverture" onError={() => setImageError(true)} className="mt-3 h-36 w-full rounded-xl object-cover sm:h-44" />}
            {imageError && <span className="mt-2 block text-[11px] font-normal text-rose-600">Impossible de charger cette image. Vérifiez l’URL.</span>}
          </label>
          <label className="text-[11px] font-semibold text-slate-700">Nombre de places <span className="text-rose-500">*</span>
            <input required type="number" min={1} max={999} value={capacity} onChange={(event) => setCapacity(event.target.value)} className={inputClass} />
          </label>
          <label className="text-[11px] font-semibold text-slate-700">Membres inscrits
            <input type="number" min={0} max={999} value={members} onChange={(event) => setMembers(event.target.value)} className={inputClass} />
            {Number(members) > Number(capacity) && <span className="mt-1 block text-[10px] font-normal text-rose-600">Le nombre de membres ne peut pas dépasser les places disponibles.</span>}
          </label>
          <label className="text-[11px] font-semibold text-slate-700">Jour et horaires <span className="text-rose-500">*</span>
            <input required maxLength={80} value={meeting} onChange={(event) => setMeeting(event.target.value)} placeholder="Ex. Mercredi, 16 h – 18 h" className={inputClass} />
          </label>
          <label className="text-[11px] font-semibold text-slate-700">Lieu de rencontre <span className="text-rose-500">*</span>
            <input required maxLength={100} value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Ex. Gymnase universitaire" className={inputClass} />
          </label>
        </div>
        <div className="mt-7 flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-5 sm:flex-row">
          <button type="button" onClick={onCancel} className="h-11 rounded-xl px-5 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50">Annuler</button>
          <button type="submit" disabled={Number(members) > Number(capacity) || imageError} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1e3527] px-5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#2b4b36] disabled:cursor-not-allowed disabled:opacity-50"><Save size={15} />{club ? 'Enregistrer les modifications' : 'Créer le club'}</button>
        </div>
      </form>
    </section>
  )
}
