import apiClient from './apiClient'
import API_CONFIG from '../config/api'
import { MemeRequest, MemeVoteRequest, ApiResponse, Meme, MemesListData } from '../types/api'

export class MemeService {
  // Get all memes
  async getMemes(): Promise<ApiResponse<MemesListData>> {
    return apiClient.get<MemesListData>(API_CONFIG.ENDPOINTS.MEMES)
  }

  // Get meme by ID
  async getMeme(id: string): Promise<ApiResponse<Meme>> {
    return apiClient.get<Meme>(API_CONFIG.ENDPOINTS.MEME_BY_ID(id))
  }

  // Upload meme with binary file
  async uploadMemeFile(title: string, file: File): Promise<ApiResponse<Meme>> {
    const formData = new FormData()
    formData.append('title', title)
    formData.append('image', file)

    // Use the generic request method from apiClient for FormData
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MEMES}`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('File upload failed:', error)
      return {
        success: false,
        code: 500,
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Create new meme (legacy method for URL-based memes)
  async createMeme(memeData: MemeRequest): Promise<ApiResponse<Meme>> {
    return apiClient.post<Meme>(API_CONFIG.ENDPOINTS.MEMES, memeData)
  }

  // Vote on meme
  async voteMeme(id: string, upvote: boolean, clicked: boolean): Promise<ApiResponse<Meme>> {
    return apiClient.put<Meme>(API_CONFIG.ENDPOINTS.MEME_VOTE(id), { upvote, clicked })
  }

  // Delete meme (admin only)
  async deleteMeme(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(API_CONFIG.ENDPOINTS.MEME_DELETE(id))
  }
}

// Export singleton instance
export const memeService = new MemeService()
export default memeService
