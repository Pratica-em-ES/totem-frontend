/**
 * Map Service - Modular 3D Map Visualization
 *
 * Clean API for managing 3D campus/building visualization with three.js
 *
 * @example
 * ```typescript
 * import { createMapAPI } from '@/services/map'
 *
 * const mapAPI = createMapAPI()
 * await mapAPI.mount(containerElement)
 *
 * // Highlight a building
 * mapAPI.highlightBuilding('building-name')
 *
 * // Trace a route
 * mapAPI.traceRoute([1, 2, 3, 4])
 *
 * // Get highlighted building
 * const building = mapAPI.getHighlightedBuilding()
 *
 * // Clear highlight
 * mapAPI.clearHighlight()
 *
 * // Clear route
 * mapAPI.clearRoute()
 * ```
 */

import { MapAPI } from './MapAPI'
import type { IMapAPI } from './types'

// Export types
export type {
  IMapAPI,
  MapState,
  BuildingDTO,
  NodeDTO,
  EdgeDTO,
  MapDTO,
  RendererConfig,
  ControlsConfig,
  HighlightConfig,
  RouteConfig,
  BuildingModel,
  RouteSegment
} from './types'

// Singleton instance (optional - for backward compatibility)
let mapAPIInstance: MapAPI | null = null

/**
 * Create a new MapAPI instance
 */
export function createMapAPI(): IMapAPI {
  return new MapAPI()
}

/**
 * Get or create the singleton MapAPI instance
 * @deprecated Use createMapAPI() instead for better control
 */
export function getMapAPI(): IMapAPI {
  if (!mapAPIInstance) {
    mapAPIInstance = new MapAPI()
  }
  return mapAPIInstance
}

/**
 * Reset the singleton instance
 * @deprecated Use createMapAPI() instead
 */
export function resetMapAPI(): void {
  if (mapAPIInstance) {
    mapAPIInstance.unmount()
    mapAPIInstance = null
  }
}

// Default export
export default {
  createMapAPI,
  getMapAPI,
  resetMapAPI
}
