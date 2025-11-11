import { readonly } from 'vue'

/**
 * Current location configuration for the totem system.
 * This defines the fixed starting point for route calculations.
 */
export interface CurrentLocation {
  id: string
  name: string
  type: 'totem' | 'building' | 'custom'
  nodeId: number
  buildingId: number | null
}

/**
 * Fixed current location configuration
 * CHANGE THIS to update the totem's physical location
 */
const CURRENT_LOCATION: CurrentLocation = {
  id: 'totem-principal',
  name: 'Totem - 99A',
  type: 'totem',
  nodeId: 47, // Graph node ID for route calculations
  buildingId: null
}

/**
 * Composable for accessing the current location configuration
 * This ensures a single source of truth for the totem's location
 */
export function useCurrentLocation() {
  return {
    currentLocation: readonly(CURRENT_LOCATION)
  }
}
