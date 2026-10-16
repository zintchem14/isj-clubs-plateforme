import { useCallback, useMemo, useState } from 'react'
import { ArrowDownWideNarrow, ArrowUpRight, Plus, Sparkles, Users, Layers3, UserRoundCheck, SearchX } from 'lucide-react'
import { ClubCard } from './components/ClubCard'
import { ClubDetails } from './components/ClubDetails'
import { ClubForm } from './components/ClubForm'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'
import { Toast } from './components/Toast'
import { categories, initialClubs } from './data/clubs'
import type { Club, ClubDraft, ToastMessage } from './types'

type Page = 'clubs' | 'details' | 'form'

function App() {
  const [clubs, setClubs] = useState(initialClubs)
  const [page, setPage] = useState<Page>('clubs')
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [editingClub, setEditingClub] = useState<Club | undefined>()
  const [category, setCategory] = useState<string>('Toutes les catégories')
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Club | null>(null)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const notify = useCallback((title: string, description: string, type: ToastMessage['type'] = 'success') => {
    setToast({ title, description, type })
  }, [])
  const dismissToast = useCallback(() => setToast(null), [])

  const filteredClubs = useMemo(() => clubs.filter((club) => {
    const matchesCategory = category === 'Toutes les catégories' || club.category === category
    const term = search.trim().toLocaleLowerCase('fr')
    const matchesSearch = !term || `${club.name} ${club.description} ${club.category}`.toLocaleLowerCase('fr').includes(term)
    return matchesCategory && matchesSearch
  }), [clubs, category, search])

  const totalMembers = clubs.reduce((total, club) => total + club.members, 0)
  const totalCapacity = clubs.reduce((total, club) => total + club.capacity, 0)
  const availablePlaces = Math.max(totalCapacity - totalMembers, 0)

  function openCreate() {
    setEditingClub(undefined)
    setPage('form')
  }

  function openEdit(club: Club) {
    setEditingClub(club)
    setPage('form')
  }

  function saveClub(draft: ClubDraft) {
    if (editingClub) {
      const updated: Club = {
        ...editingClub,
        ...draft,
        id: editingClub.id,
        members: draft.members ?? editingClub.members,
        status: (draft.members ?? editingClub.members) >= draft.capacity ? 'Complet' : 'Actif',
      }
      setClubs((current) => current.map((club) => club.id === updated.id ? updated : club))
      setSelectedClub(updated)
      setPage('details')
      notify('Modifications enregistrées', `La fiche « ${updated.name} » a bien été mise à jour.`)
      return
    }
    const created: Club = {
      ...draft,
      id: crypto.randomUUID(),
      members: draft.members ?? 0,
      status: (draft.members ?? 0) >= draft.capacity ? 'Complet' : 'Actif',
      accent: 'from-emerald-400 to-teal-600',
    }
    setClubs((current) => [created, ...current])
    setCategory('Toutes les catégories')
    setSearch('')
    setSelectedClub(created)
    setPage('details')
    notify('Club créé avec succès', `« ${created.name} » apparaît maintenant dans la liste.`)
  }

  function confirmDelete() {
    if (!pendingDelete) return
    setClubs((current) => current.filter((club) => club.id !== pendingDelete.id))
    if (selectedClub?.id === pendingDelete.id) setSelectedClub(null)
    notify('Club supprimé', `« ${pendingDelete.name} » a été retiré de la liste.`)
    setPendingDelete(null)
    setPage('clubs')
  }

  function showDetails(club: Club) {
    setSelectedClub(club)
    setPage('details')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#f7f8f5] text-slate-900">
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarCollapsed((value) => !value)}
        onClubs={() => { setPage('clubs'); setSidebarOpen(false) }}
        active="clubs"
      />
      <div className={`min-h-screen transition-[margin] duration-300 ${sidebarCollapsed ? 'md:ml-[92px]' : 'md:ml-[264px]'}`}>
        <Navbar
          onMenu={() => setSidebarOpen(true)}
          search={search}
          onSearch={setSearch}
          onNotice={() => notify('Tout est à jour', 'Aucune nouvelle notification pour le moment.')}
        />
        <main className="mx-auto min-h-[calc(100vh-72px)] max-w-[1500px] px-4 pb-2 pt-6 sm:px-7 sm:pt-8 lg:px-9">
          {page === 'clubs' && (
            <>
              <section className="relative mb-8 overflow-hidden rounded-[24px] bg-[#e8efdf] px-6 py-6 sm:px-9 sm:py-8">
                <div className="pointer-events-none absolute -right-14 -top-28 h-64 w-64 rounded-full border-[36px] border-white/40" />
                <div className="pointer-events-none absolute -bottom-32 right-[18%] h-56 w-56 rounded-full bg-[#cce0bb]/40 blur-2xl" />
                <div className="relative z-10 max-w-2xl">
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#d7e5cb] bg-white/60 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#59764a]"><Sparkles size={12} /> L’énergie du campus</div>
                  <p className="text-[12px] font-medium text-[#58714b]">Bonjour Aïcha,</p>
                  <h1 className="mt-1 text-[28px] font-bold leading-tight tracking-[-0.045em] text-[#20382a] sm:text-[36px]">Les clubs font battre<br className="hidden sm:block" /> le cœur du campus.</h1>
                  <p className="mt-3 max-w-lg text-[12px] leading-5 text-[#63765c] sm:text-[13px]">Un espace pour découvrir, partager et faire grandir toutes les passions étudiantes. Voici ce qui se passe en ce moment.</p>
                  <button type="button" onClick={openCreate} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#1e3527] px-4 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#2e5038]"><Plus size={15} />Créer un club</button>
                </div>
                <div className="relative z-10 mt-6 grid max-w-[570px] grid-cols-3 gap-2 sm:absolute sm:bottom-7 sm:right-8 sm:mt-0 sm:w-[48%] sm:gap-3">
                  {[
                    { label: 'Clubs actifs', value: clubs.length, icon: Layers3 },
                    { label: 'Membres', value: totalMembers, icon: Users },
                    { label: 'Places libres', value: availablePlaces, icon: UserRoundCheck },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-2xl border border-white/70 bg-white/75 p-3 shadow-[0_6px_22px_-18px_rgba(40,60,40,.4)] backdrop-blur sm:p-4">
                      <div className="flex items-center gap-1.5 text-[9px] font-medium text-slate-500 sm:text-[10px]"><Icon size={13} className="text-[#688958]" />{label}</div>
                      <p className="mt-2 text-[20px] font-bold tracking-tight text-[#20382a] sm:text-[25px]">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section aria-labelledby="clubs-heading">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#688958]">LE CAMPUS EN MOUVEMENT</p>
                    <h2 id="clubs-heading" className="mt-1.5 text-[23px] font-bold tracking-[-0.035em] text-slate-900 sm:text-[27px]">Tous les clubs <span className="ml-1 text-[14px] font-medium text-slate-400">{clubs.length}</span></h2>
                    <p className="mt-1 text-[12px] text-slate-500">Des passions à partager, des gens à rencontrer.</p>
                  </div>
                  <button type="button" onClick={openCreate} className="hidden h-10 items-center gap-2 rounded-xl bg-[#1e3527] px-4 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#2e5038] sm:flex"><Plus size={15} />Nouveau club</button>
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <ArrowDownWideNarrow size={15} className="mr-1 shrink-0 text-slate-400" />
                    {categories.map((item) => (
                      <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-3.5 py-2 text-[10px] font-semibold transition ${category === item ? 'bg-[#1e3527] text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800'}`}>{item}</button>
                    ))}
                  </div>
                  <p className="shrink-0 text-[10px] text-slate-400">{filteredClubs.length} résultat{filteredClubs.length === 1 ? '' : 's'}</p>
                </div>

                {filteredClubs.length > 0 ? (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredClubs.map((club) => <ClubCard key={club.id} club={club} onDetails={showDetails} onEdit={openEdit} onDelete={setPendingDelete} />)}
                  </div>
                ) : (
                  <div className="mt-5 flex min-h-64 flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-300 bg-white/60 px-5 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><SearchX size={21} /></span>
                    <h3 className="mt-4 text-[14px] font-semibold text-slate-800">Aucun club trouvé</h3>
                    <p className="mt-1 max-w-sm text-[11px] leading-5 text-slate-500">Essayez un autre mot-clé ou une autre catégorie pour découvrir les clubs.</p>
                    <button type="button" onClick={() => { setSearch(''); setCategory('Toutes les catégories') }} className="mt-3 text-[11px] font-semibold text-[#426c37] hover:underline">Effacer les filtres</button>
                  </div>
                )}
                <div className="mt-7 flex items-center justify-center gap-2 text-[10px] text-slate-400"><span className="h-px w-9 bg-slate-200" /><span>Chaque passion a sa place ici</span><ArrowUpRight size={12} /><span className="h-px w-9 bg-slate-200" /></div>
              </section>
            </>
          )}

          {page === 'details' && selectedClub && <ClubDetails club={selectedClub} onBack={() => setPage('clubs')} onEdit={openEdit} onToast={(title, description) => notify(title, description)} />}
          {page === 'form' && <ClubForm club={editingClub} onCancel={() => setPage(editingClub && selectedClub ? 'details' : 'clubs')} onSubmit={saveClub} />}
          <Footer />
        </main>
      </div>

      {pendingDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingDelete(null) }}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="delete-heading" aria-describedby="delete-description" className="w-full max-w-sm rounded-[22px] bg-white p-6 shadow-2xl">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><Users size={19} /></span>
            <h2 id="delete-heading" className="mt-4 text-[17px] font-bold text-slate-900">Supprimer ce club ?</h2>
            <p id="delete-description" className="mt-2 text-[12px] leading-5 text-slate-500">Le club « {pendingDelete.name} » sera retiré de la liste. Cette action ne peut pas être annulée.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setPendingDelete(null)} className="h-10 rounded-xl px-4 text-[11px] font-semibold text-slate-600 hover:bg-slate-100">Annuler</button>
              <button type="button" onClick={confirmDelete} className="h-10 rounded-xl bg-rose-600 px-4 text-[11px] font-semibold text-white hover:bg-rose-700">Supprimer le club</button>
            </div>
          </section>
        </div>
      )}
      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}

export default App
