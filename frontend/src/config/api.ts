// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:8000', // Change this to your backend URL
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/a/auth/login',
    REGISTER: '/a/auth/register',
    PROFILE: '/a/auth/profile',
    
    // Meme endpoints
    MEMES: '/a/meme',
    MEME_BY_ID: (id: string) => `/a/meme/${id}`,
    MEME_VOTE: (id: string) => `/a/meme/${id}/vote`,
    MEME_DELETE: (id: string) => `/a/meme/${id}/delete`,
  }
}

export default API_CONFIG
