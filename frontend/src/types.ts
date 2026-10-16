export type ClubCategory = 'Sport' | 'Culture' | 'Solidarité' | 'Art & création' | 'Sciences'

export type Club = {
  id: string
  name: string
  category: ClubCategory
  description: string
  image: string
  members: number
  capacity: number
  meeting: string
  location: string
  status: 'Actif' | 'Complet'
  accent: string
}

export type ClubDraft = Omit<Club, 'id' | 'status' | 'members' | 'accent'> & {
  members?: number
}

export type ToastMessage = {
  title: string
  description: string
  type: 'success' | 'error'
}
