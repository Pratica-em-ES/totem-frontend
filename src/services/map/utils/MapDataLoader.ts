import type { MapDTO } from '@/models/MapDTO'
import { mapApi } from '@/services/api'

/**
 * Handles loading map data from the backend API
 * Simplified to use centralized API layer
 */
export class MapDataLoader {
  /**
   * Load map data from the backend
   */
  async loadMapData(): Promise<MapDTO> {
    try {
      const data = await mapApi.getMapData()
      return this.validateMapData(data)
    } catch (error) {
      console.error('[MapDataLoader] Error loading map data:', error)
      throw error
    }
  }

  /**
   * Load map data from a specific URL (for testing/development)
   */
  async loadMapDataFromUrl(url: string): Promise<MapDTO> {
    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to load map data: ${response.statusText}`)
      }

      const data = await response.json()
      return this.validateMapData(data)
    } catch (error) {
      console.error('[MapDataLoader] Error loading map data from URL:', error)
      throw error
    }
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
}
