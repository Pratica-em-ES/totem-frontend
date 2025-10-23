import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { ModelSource } from './ModelSource'

/**
 * Loads models from local public folder
 * Uses relative paths like '/models/building.glb'
 */
export class LocalModelSource implements ModelSource {
  private gltfLoader: GLTFLoader

  constructor() {
    this.gltfLoader = new GLTFLoader()
  }

  getSourceType(): string {
    return 'local'
  }

  async loadModel(modelPath: string): Promise<THREE.Object3D> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        modelPath,
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
        undefined,
        (error) => {
          console.error(`[LocalModelSource] Failed to load model: ${modelPath}`, error)
          reject(error)
        }
      )
    })
  }

  async preloadModels(modelPaths: string[]): Promise<void> {
    const loadPromises = modelPaths.map((path) => this.loadModel(path))
    await Promise.all(loadPromises)
  }
}
