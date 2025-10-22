/**
 * HTTP Client - Base para todas as requisições API
 * Single Responsibility: Gerenciar requisições HTTP
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

export class HttpClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`[HTTP] GET ${endpoint} failed:`, error)
      throw error
    }
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`[HTTP] POST ${endpoint} failed:`, error)
      throw error
    }
  }
}

// Singleton instance
export const httpClient = new HttpClient()
