import type * as THREE from 'three'

/**
 * Interface for different model loading strategies
 */
export interface ModelSource {
  /**
   * Load a model from the configured source
   * @param modelPath - The path/identifier of the model
   * @returns Promise that resolves to the loaded THREE.Object3D
   */
  loadModel(modelPath: string): Promise<THREE.Object3D>

  /**
   * Optional: Preload multiple models in parallel
   * @param modelPaths - Array of model paths to preload
   */
  preloadModels?(modelPaths: string[]): Promise<void>

  /**
   * Get a unique identifier for this source type
   */
  getSourceType(): string
}
