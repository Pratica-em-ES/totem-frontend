import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { ModelSource } from './ModelSource'

/**
 * Loads models from remote URLs
 * Expects full URLs like 'https://cdn.example.com/models/building.glb'
 * or uses a base URL + relative path
 */
export class RemoteModelSource implements ModelSource {
  private gltfLoader: GLTFLoader
  private baseUrl: string

  /**
   * @param baseUrl - Base URL for models. If provided, modelPath will be appended to it.
   *                  Example: 'https://cdn.example.com/models'
   *                  If empty, modelPath must be a full URL
   */
  constructor(baseUrl: string = '') {
    this.gltfLoader = new GLTFLoader()
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  }

  getSourceType(): string {
    return 'remote'
  }

  /**
   * Resolve the full URL for a model
   */
  private resolveUrl(modelPath: string): string {
    // If modelPath is already a full URL, use it directly
    if (modelPath.startsWith('http://') || modelPath.startsWith('https://')) {
      return modelPath
    }

    // Otherwise, combine with base URL
    if (this.baseUrl) {
      const path = modelPath.startsWith('/') ? modelPath : `/${modelPath}`
      return `${this.baseUrl}${path}`
    }

    // If no base URL and not a full URL, throw error
    throw new Error(
      `[RemoteModelSource] Invalid model path: ${modelPath}. Must be a full URL or baseUrl must be configured.`
    )
  }

  async loadModel(modelPath: string): Promise<THREE.Object3D> {
    const url = this.resolveUrl(modelPath)

    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          const model = gltf.scene

          // Configure materials
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.metalness = 0
              }
              child.castShadow = true
              child.receiveShadow = true
            }
          })

          resolve(model)
        },
        (progress) => {
          // Optional: log download progress
          if (progress.lengthComputable) {
            const percentComplete = (progress.loaded / progress.total) * 100
            console.log(`[RemoteModelSource] Loading ${modelPath}: ${percentComplete.toFixed(2)}%`)
          }
        },
        (error) => {
          console.error(`[RemoteModelSource] Failed to load model from: ${url}`, error)
          reject(error)
        }
      )
    })
  }

  async preloadModels(modelPaths: string[]): Promise<void> {
    console.log(`[RemoteModelSource] Preloading ${modelPaths.length} models from remote...`)
    const loadPromises = modelPaths.map((path) => this.loadModel(path))
    await Promise.all(loadPromises)
    console.log(`[RemoteModelSource] Successfully preloaded ${modelPaths.length} models`)
  }
}
