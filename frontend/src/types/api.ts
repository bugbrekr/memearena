// Types for API requests and responses
export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  email: string
}

export interface MemeRequest {
  title: string
  description: string
}

export interface MemeVoteRequest {
  upvote: boolean
  clicked: boolean
}

export interface ApiResponse<T = any> {
  success: boolean
  code: number
  message?: string
  data?: T
}

export interface AuthTokenData {
  auth_token: string
}

export interface ProfileData {
  username: string
  email: string
  is_admin?: boolean
}

export interface User {
  id: string
  username: string
  email: string
  is_admin?: boolean
}

export interface Meme {
  meme_id: string
  title: string
  username: string  // Backend uses 'username' instead of 'author'
  votes: number
  created_at: number  // Backend returns timestamp as number
  user_vote: boolean | null  // true = upvote, false = downvote, null = no vote
  image_url?: string
  description?: string
}

export interface MemesListData {
  memes: Meme[]
}
