import * as THREE from 'three'
import type { MapState } from '../types'

/**
 * Manages the three.js scene, camera, and lighting
 */
export class SceneManager {
  private state: MapState

  constructor(state: MapState) {
    this.state = state
  }

  /**
   * Initialize the scene with camera and lights
   */
  initialize(): void {
    this.createScene()
    this.createCamera()
    this.createLights()
  }

  /**
   * Create the main three.js scene
   */
  private createScene(): void {
    this.state.scene = new THREE.Scene()
    this.state.scene.background = new THREE.Color(0x87ceeb) // Sky blue
  }

  /**
   * Create and configure the camera
   */
  private createCamera(): void {
    this.state.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.state.camera.position.set(-68, 200, 322.84)
  }

  /**
   * Create scene lighting (sun + ambient)
   */
  private createLights(): void {
    if (!this.state.scene) return

    // Directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1)
    sunLight.position.set(50, 100, 50)
    sunLight.castShadow = true

    // Configure shadow properties
    sunLight.shadow.mapSize.width = 2048
    sunLight.shadow.mapSize.height = 2048
    sunLight.shadow.camera.near = 0.5
    sunLight.shadow.camera.far = 500
    sunLight.shadow.camera.left = -100
    sunLight.shadow.camera.right = 100
    sunLight.shadow.camera.top = 100
    sunLight.shadow.camera.bottom = -100

    this.state.scene.add(sunLight)

    // Ambient light (soft fill)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    this.state.scene.add(ambientLight)
  }

  /**
   * Update camera aspect ratio on resize
   */
  updateCameraAspect(width: number, height: number): void {
    if (!this.state.camera) return

    this.state.camera.aspect = width / height
    this.state.camera.updateProjectionMatrix()
  }

  /**
   * Get the scene
   */
  getScene(): THREE.Scene | null {
    return this.state.scene
  }

  /**
   * Get the camera
   */
  getCamera(): THREE.PerspectiveCamera | null {
    return this.state.camera
  }

  /**
   * Cleanup
   */
  dispose(): void {
    // Scene cleanup is handled by RendererManager
    // Camera doesn't need explicit disposal
  }
}
