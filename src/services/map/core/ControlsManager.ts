import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { MapState, ControlsConfig } from '../types'

/**
 * Manages camera controls for the map
 */
export class ControlsManager {
  private state: MapState
  private controls: OrbitControls | null = null

  constructor(state: MapState) {
    this.state = state
  }

  /**
   * Initialize orbit controls
   */
  initialize(config: ControlsConfig = {}): void {
    if (!this.state.camera || !this.state.renderer) {
      throw new Error('Camera and renderer must be initialized before controls')
    }

    this.controls = new OrbitControls(
      this.state.camera,
      this.state.renderer.domElement
    )

    this.configure(config)
  }

  /**
   * Configure control parameters
   */
  configure(config: ControlsConfig): void {
    if (!this.controls) return

    const {
      enablePan = false,
      enableDamping = true,
      minDistance = 120,
      maxDistance = 600,
      maxPolarAngle = Math.PI / 2 - 0.1
    } = config

    this.controls.enablePan = enablePan
    this.controls.enableDamping = enableDamping
    this.controls.minDistance = minDistance
    this.controls.maxDistance = maxDistance
    this.controls.maxPolarAngle = maxPolarAngle

    if (enableDamping) {
      this.controls.dampingFactor = 0.05
    }
  }

  /**
   * Update controls (call in render loop if damping is enabled)
   */
  update(): void {
    if (this.controls && this.controls.enableDamping) {
      this.controls.update()
    }
  }

  /**
   * Get the controls instance
   */
  getControls(): OrbitControls | null {
    return this.controls
  }

  /**
   * Cleanup
   */
  dispose(): void {
    if (this.controls) {
      this.controls.dispose()
      this.controls = null
    }
  }
}
