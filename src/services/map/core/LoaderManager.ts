import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import type { MapState } from '../types'

/**
 * Manages loading of external resources (models, textures, fonts)
 */
export class LoaderManager {
  private state: MapState
  private gltfLoader: GLTFLoader
  private textureLoader: THREE.TextureLoader
  private fontLoader: FontLoader

  constructor(state: MapState) {
    this.state = state
    this.gltfLoader = new GLTFLoader()
    this.textureLoader = new THREE.TextureLoader()
    this.fontLoader = new FontLoader()
  }

  /**
   * Load a GLTF/GLB model
   * Returns cached model if already loaded
   */
  async loadModel(path: string): Promise<THREE.Object3D> {
    // Check cache first
    if (this.state.loadedModels.has(path)) {
      const cached = this.state.loadedModels.get(path)!
      return cached.clone()
    }

    // Load new model
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        path,
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

          // Cache the model
          this.state.loadedModels.set(path, model)
          resolve(model.clone())
        },
        undefined,
        (error) => {
          console.error(`Failed to load model: ${path}`, error)
          reject(error)
        }
      )
    })
  }

  /**
   * Load a texture
   */
  async loadTexture(path: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        path,
        (texture) => {
          resolve(texture)
        },
        undefined,
        (error) => {
          console.error(`Failed to load texture: ${path}`, error)
          reject(error)
        }
      )
    })
  }

  /**
   * Load a font (for text rendering)
   */
  async loadFont(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.fontLoader.load(
        path,
        (font) => {
          resolve(font)
        },
        undefined,
        (error) => {
          console.error(`Failed to load font: ${path}`, error)
          reject(error)
        }
      )
    })
  }

  /**
   * Preload multiple models in parallel
   */
  async preloadModels(paths: string[]): Promise<void> {
    const loadPromises = paths.map((path) => this.loadModel(path))
    await Promise.all(loadPromises)
  }

  /**
   * Clear the model cache
   */
  clearCache(): void {
    this.state.loadedModels.clear()
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.state.loadedModels.size
  }
}
