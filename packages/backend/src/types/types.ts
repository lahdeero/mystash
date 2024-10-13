export type Note = {
  id: string
  userId: string
  title: string
  content: string
  tags: string[]
  updatedAt: string
  createdAt: string
}

export type GetNotesResponse = Note[]
