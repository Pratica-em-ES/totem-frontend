import { ref, computed } from 'vue'
import { featureFlags, setFeatureFlag, type FeatureFlags } from '@/config/featureFlags'

/**
 * Composable for managing feature flags in Vue components
 */
export function useFeatureFlags() {
  // Create reactive references for each flag
  const flags = ref<FeatureFlags>({ ...featureFlags })

  /**
   * Toggle a feature flag
   */
  const toggleFeature = (feature: keyof FeatureFlags) => {
    const newValue = !flags.value[feature]
    flags.value[feature] = newValue
    setFeatureFlag(feature, newValue)

    // Notify MapAPI if available
    updateMapAPI(feature, newValue)
  }

  /**
   * Set a feature flag to a specific value
   */
  const setFeature = (feature: keyof FeatureFlags, value: boolean) => {
    flags.value[feature] = value
    setFeatureFlag(feature, value)

    // Notify MapAPI if available
    updateMapAPI(feature, value)
  }

  /**
   * Update MapAPI based on feature flag changes
   */
  const updateMapAPI = (feature: keyof FeatureFlags, value: boolean) => {
    // @ts-ignore - MapAPI is exposed globally by MapRenderer
    const mapAPI = window.mapAPI

    if (!mapAPI) {
      console.warn('[useFeatureFlags] MapAPI not available')
      return
    }

    switch (feature) {
      case 'showBuildingLabels':
        mapAPI.setBuildingLabelsVisible(value)
        break
      case 'showNodeLabels':
        mapAPI.setNodeLabelsVisible(value)
        break
      case 'showGraphNodes':
        mapAPI.setGraphNodesVisible(value)
        break
      case 'showGraphEdges':
        mapAPI.setGraphEdgesVisible(value)
        break
      case 'enableCameraAnimation':
        // Camera animation is checked internally in MapAPI
        console.log(`[useFeatureFlags] Camera animation ${value ? 'enabled' : 'disabled'}`)
        break
      case 'enableRouteAnimation':
        // Route animation would be implemented in RouteTracer if needed
        console.log(`[useFeatureFlags] Route animation ${value ? 'enabled' : 'disabled'}`)
        break
    }
  }

  /**
   * Computed properties for specific flags (for convenience)
   */
  const cameraAnimationEnabled = computed(() => flags.value.enableCameraAnimation)
  const buildingLabelsVisible = computed(() => flags.value.showBuildingLabels)
  const nodeLabelsVisible = computed(() => flags.value.showNodeLabels)
  const graphNodesVisible = computed(() => flags.value.showGraphNodes)
  const graphEdgesVisible = computed(() => flags.value.showGraphEdges)
  const routeAnimationEnabled = computed(() => flags.value.enableRouteAnimation)

  return {
    flags,
    toggleFeature,
    setFeature,
    cameraAnimationEnabled,
    buildingLabelsVisible,
    nodeLabelsVisible,
    graphNodesVisible,
    graphEdgesVisible,
    routeAnimationEnabled
  }
}
