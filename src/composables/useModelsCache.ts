import { ref } from 'vue'
import type * as THREE from 'three'
import type { ModelSource } from '@/services/map/sources/ModelSource'
import { LocalModelSource } from '@/services/map/sources/LocalModelSource'
import { RemoteModelSource } from '@/services/map/sources/RemoteModelSource'
import { mapApi } from '@/services/api'

// Global cache - shared across the entire application
const modelsCache = ref<Map<string, THREE.Object3D>>(new Map())
const isLoaded = ref(false)
const isLoading = ref(false)

// Model source configuration
let modelSource: ModelSource = new LocalModelSource()

/**
 * Composable for managing global models cache
 * Models are fetched once during app initialization and cached
 */
export function useModelsCache() {
  /**
   * Configure the model source strategy
   * @param source - ModelSource instance (LocalModelSource or RemoteModelSource)
   */
  const configureModelSource = (source: ModelSource) => {
    console.log(`[useModelsCache] Configuring model source: ${source.getSourceType()}`)
    modelSource = source

    // Clear cache when changing source
    modelsCache.value.clear()
    isLoaded.value = false
  }

  /**
   * Set to use local models (default)
   */
  const useLocalModels = () => {
    configureModelSource(new LocalModelSource())
  }

  /**
   * Set to use remote models
   * @param baseUrl - Base URL for remote models
   */
  const useRemoteModels = (baseUrl: string) => {
    configureModelSource(new RemoteModelSource(baseUrl))
  }

  /**
   * Fetch and cache all models from the map data
   * This should be called once during app initialization
   */
  const fetchModels = async (): Promise<void> => {
    if (isLoaded.value || isLoading.value) {
      console.log('[useModelsCache] Models already loaded or loading')
      return
    }

    try {
      isLoading.value = true
      console.log('[useModelsCache] Starting models preload...')

      // Fetch map data to get all model paths
      const mapData = await mapApi.getMapData()
      const modelPaths = mapData.buildings.map((building) => building.modelPath)
      const uniquePaths = [...new Set(modelPaths)]

      console.log(`[useModelsCache] Found ${uniquePaths.length} unique models to load`)

      // Load all models in parallel
      const loadPromises = uniquePaths.map(async (path) => {
        try {
          const model = await modelSource.loadModel(path)
          modelsCache.value.set(path, model)
          console.log(`[useModelsCache] Cached model: ${path}`)
        } catch (error) {
          console.error(`[useModelsCache] Failed to load model: ${path}`, error)
          throw error
        }
      })

      await Promise.all(loadPromises)

      isLoaded.value = true
      console.log(`[useModelsCache] Successfully cached ${modelsCache.value.size} models`)
    } catch (error) {
      console.error('[useModelsCache] Error loading models:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get a cached model by path
   * Returns a clone to avoid sharing instances
   */
  const getModel = (modelPath: string): THREE.Object3D | null => {
    const cached = modelsCache.value.get(modelPath)
    if (!cached) {
      console.warn(`[useModelsCache] Model not found in cache: ${modelPath}`)
      return null
    }
    return cached.clone()
  }

  /**
   * Check if a model exists in cache
   */
  const hasModel = (modelPath: string): boolean => {
    return modelsCache.value.has(modelPath)
  }

  /**
   * Get cache statistics
   */
  const getCacheStats = () => {
    return {
      size: modelsCache.value.size,
      isLoaded: isLoaded.value,
      isLoading: isLoading.value,
      sourceType: modelSource.getSourceType(),
      cachedPaths: Array.from(modelsCache.value.keys())
    }
  }

  /**
   * Clear the cache
   */
  const clearCache = () => {
    modelsCache.value.clear()
    isLoaded.value = false
    console.log('[useModelsCache] Cache cleared')
  }

  return {
    // State
    isLoaded,
    isLoading,

    // Configuration
    configureModelSource,
    useLocalModels,
    useRemoteModels,

    // Operations
    fetchModels,
    getModel,
    hasModel,
    getCacheStats,
    clearCache
  }
}
