/**
 * Feature Flags Configuration
 *
 * Centralized configuration for enabling/disabling features in the totem application.
 * All features can be toggled easily from this single file.
 */

export interface FeatureFlags {
  enableCameraAnimation: boolean
  showBuildingLabels: boolean
  showNodeLabels: boolean
  enableBuildingHighlight: boolean
  showGraphNodes: boolean
  showGraphEdges: boolean
  enableRouteAnimation: boolean
}

/**
 * Default feature flags configuration
 *
 * Modify these values to enable/disable features globally
 */
export const featureFlags: FeatureFlags = {
  // Animation features
  enableCameraAnimation: true,

  // Label features
  showBuildingLabels: true,
  showNodeLabels: false,

  // Highlight features
  enableBuildingHighlight: false,

  // Development/Debug features
  showGraphNodes: false,
  showGraphEdges: false,

  // Route visualization
  enableRouteAnimation: false
}

/**
 * Set a feature flag value (for runtime toggling)
 */
export function setFeatureFlag(feature: keyof FeatureFlags, enabled: boolean): void {
  featureFlags[feature] = enabled
}
