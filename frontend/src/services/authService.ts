import apiClient from './apiClient'
import API_CONFIG from '../config/api'
import { LoginRequest, RegisterRequest, ApiResponse, AuthTokenData, ProfileData } from '../types/api'

export class AuthService {
  // Login user
  async login(credentials: LoginRequest): Promise<{ success: boolean; auth_token?: string }> {
    const response = await apiClient.post<AuthTokenData>(API_CONFIG.ENDPOINTS.LOGIN, credentials)
    
    if (response.success && response.data?.auth_token) {
      apiClient.setToken(response.data.auth_token)
      return { success: true, auth_token: response.data.auth_token }
    }
    
    return { success: false }
  }

  // Register user
  async register(userData: RegisterRequest): Promise<{ success: boolean; auth_token?: string }> {
    const response = await apiClient.post<AuthTokenData>(API_CONFIG.ENDPOINTS.REGISTER, userData)
    
    if (response.success && response.data?.auth_token) {
      apiClient.setToken(response.data.auth_token)
      return { success: true, auth_token: response.data.auth_token }
    }
    
    return { success: false }
  }

  // Get user profile
  async getProfile(): Promise<{ success: boolean; data?: ProfileData }> {
    const response = await apiClient.get<ProfileData>(API_CONFIG.ENDPOINTS.PROFILE)
    
    if (response.success && response.data) {
      return { success: true, data: response.data }
    }
    
    return { success: false }
  }

  // Logout user
  logout(): void {
    apiClient.clearToken()
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return localStorage.getItem('authToken') !== null
  }
}

// Export singleton instance
export const authService = new AuthService()
export default authService
