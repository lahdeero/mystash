export type UserDbItem = {
  id: string
  email: string
  password?: string
  firstName: string
  lastName: string
  tier: string
}

export type User = {
  email: string
  firstName: string
  lastName: string
  tier: string
}

export type Note = {
  id: string
  userId: string
  title: string
  content: string
  tags: string[]
  updatedAt: string
  createdAt: string
}

export type FileType = {
  id: string
  fileName: string
  mimeType: string
  eTag: string
  title?: string
  createdAt: string
  updatedAt: string
  noteId: string
  userId: string
}

export type GetNotesResponse = Note[]

export type GetNoteFilesResponse = {
  noteId: string
  files: FileType[]
}

export enum Tier {
  Free = 'free',
  Premium = 'premium',
  Admin = 'admin',
}

export type UserToken = {
  token: string
  user: User
}

export type GitHubUser = {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  user_view_type: string
  site_admin: boolean
  name: string
  company: string | null
  blog: string
  location: string
  email: string | null
  hireable: boolean | null
  bio: string | null
  twitter_username: string | null
  notification_email: string | null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
  private_gists: number
  total_private_repos: number
  owned_private_repos: number
  disk_usage: number
  collaborators: number
  two_factor_authentication: boolean
  plan: {
    name: string
    space: number
    collaborators: number
    private_repos: number
  }
}
