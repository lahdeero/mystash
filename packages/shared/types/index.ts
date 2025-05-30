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

export type UpdateNoteResponse = Note

export type CreateNoteResponse = Note

export type DeleteNoteResponse = Note
