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
    this.state.scene.background = new THREE.Color(0x75b5ff) // Gray background (same as old)
  }

  /**
   * Create and configure the camera
   */
  private createCamera(): void {
    // FOV base para aspect ratio de referência (16/9) - same as old
    const BASE_FOV = 10

    this.state.camera = new THREE.PerspectiveCamera(
      BASE_FOV,
      window.innerWidth / window.innerHeight,
      0.01,
      2000
    )
    // Posição isométrica/3D com boa visão do mapa - similar à imagem fornecida
    this.state.camera.position.set(-120, 250, 200)
    this.state.camera.up.set(0, 1, 0)
    this.state.camera.lookAt(0, 0, 0)
  }

  /**
   * Create scene lighting (sun + ambient) - same as old mapService
   */
  private createLights(): void {
    if (!this.state.scene) return

    // Directional light (sun) - same as old
    const sunLight = new THREE.DirectionalLight(0xffffff, 1)
    sunLight.position.set(30, 20, 10)
    sunLight.castShadow = true

    // Configure shadow properties - same as old
    sunLight.shadow.camera.top = 200
    sunLight.shadow.camera.bottom = -200
    sunLight.shadow.camera.left = -200
    sunLight.shadow.camera.right = 200
    sunLight.shadow.camera.near = 1
    sunLight.shadow.camera.far = 2000

    this.state.scene.add(sunLight)

    // Ambient + Directional lights - same as old
    this.state.scene.add(new THREE.AmbientLight(0xffffff, 1))
    this.state.scene.add(new THREE.DirectionalLight(0xffffff, 2))
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
