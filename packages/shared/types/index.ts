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

export type User = {
  nickname: string
  email: string
  tier: string
  hasAcceptedTerms?: boolean
}

export type UserWithPassword = User & {
  password: string
}

export type UserToken = {
  token: string
  user: User
}

export type ErrorResponse = {
  error: {
    message: string
  }
}

export type RegisterRequest = Omit<UserWithPassword, 'tier' | 'hasAcceptedTerms'> & {}

export type RegisterResponse = User