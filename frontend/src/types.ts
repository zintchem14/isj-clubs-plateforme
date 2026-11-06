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
  activities?: string[]
}

export type ClubDraft = Omit<Club, 'id' | 'status' | 'members' | 'accent'> & {
  members?: number
}

export type CampusEvent = {
  id: string
  clubId: string
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  location: string
  image: string
  format: 'À ne pas manquer' | 'Atelier' | 'Rencontre' | 'Tournoi'
  featured?: boolean
  status?: 'upcoming' | 'ongoing' | 'finished' // Pour gérer le cycle de l'événement (début / fin)
}

// 📰 Type News : Gère les actualités, annonces école/Internet, filtrées par club avec support de fichiers (Images/PDF)
export type News = {
  id: string
  title: string
  content: string
  clubId?: string         // Permet de filtrer les news selon un club spécifique
  clubName?: string       // Nom du club associé si applicable
  authorName?: string     // Auteur de l'annonce (ex: Administration, Responsable)
  attachmentUrl?: string  // URL du document joint (Image ou PDF envoyé par l'admin)
  attachmentType?: 'image' | 'pdf' | 'none'
  createdAt: string
}

export type Comment = {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

export type ToastMessage = {
  title: string
  description: string
  type: 'success' | 'error'
}