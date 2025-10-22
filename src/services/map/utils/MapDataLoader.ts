import type { MapDTO } from '@/models/MapDTO'

/**
 * Handles loading map data from the backend API
 */
export class MapDataLoader {
  private apiUrl: string

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || this.getDefaultApiUrl()
  }

  /**
   * Load map data from the backend
   */
  async loadMapData(): Promise<MapDTO> {
    try {
      const response = await fetch(this.apiUrl)

      if (!response.ok) {
        throw new Error(`Failed to load map data: ${response.statusText}`)
      }

      const data = await response.json()
      return this.validateMapData(data)
    } catch (error) {
      console.error('Error loading map data:', error)
      throw error
    }
  }

  /**
   * Load map data from a specific URL
   */
  async loadMapDataFromUrl(url: string): Promise<MapDTO> {
    const loader = new MapDataLoader(url)
    return loader.loadMapData()
  }

  /**
   * Validate map data structure
   */
  private validateMapData(data: any): MapDTO {
    if (!data) {
      throw new Error('Map data is null or undefined')
    }

    if (!Array.isArray(data.buildings)) {
      throw new Error('Map data missing buildings array')
    }

    if (!Array.isArray(data.nodes)) {
      throw new Error('Map data missing nodes array')
    }

    if (!Array.isArray(data.edges)) {
      throw new Error('Map data missing edges array')
    }

    return data as MapDTO
  }

  /**
   * Get the default API URL from environment variables
   */
  private getDefaultApiUrl(): string {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'
    return `${backendUrl}/map`
  }

  /**
   * Update the API URL
   */
  setApiUrl(url: string): void {
    this.apiUrl = url
  }

  /**
   * Get the current API URL
   */
  getApiUrl(): string {
    return this.apiUrl
  }
}
