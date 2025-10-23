import * as THREE from 'three'
import type { MapState } from '../types'

/**
 * Handles raycasting for click detection on buildings
 */
export class RaycastHandler {
  private state: MapState
  private raycaster: THREE.Raycaster
  private mouse: THREE.Vector2
  private onBuildingClick?: (buildingId: number) => void

  constructor(state: MapState) {
    this.state = state
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
  }

  /**
   * Handle canvas click event
   */
  handleClick(event: MouseEvent, canvas: HTMLCanvasElement): void {
    if (!this.state.camera || !this.state.scene) return

    // Calculate mouse position in normalized device coordinates (-1 to +1)
    const rect = canvas.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.state.camera)

    // Perform raycast
    const intersects = this.raycaster.intersectObjects(this.state.scene.children, true)

    // Find first mesh with building ID
    for (const intersect of intersects) {
      if (intersect.object instanceof THREE.Mesh) {
        const buildingId = this.state.meshToBuildingIdMap.get(intersect.object)

        if (buildingId !== undefined) {
          console.log('Building clicked:', buildingId)

          // Call callback if registered
          if (this.onBuildingClick) {
            this.onBuildingClick(buildingId)
          }

          return
        }
      }
    }

    // No building clicked
    console.log('No building clicked')
  }

  /**
   * Register callback for building click events
   */
  onBuildingClickCallback(callback: (buildingId: number) => void): void {
    this.onBuildingClick = callback
  }

  /**
   * Get building ID at screen coordinates
   */
  getBuildingAtPosition(x: number, y: number, canvas: HTMLCanvasElement): number | null {
    if (!this.state.camera || !this.state.scene) return null

    // Calculate normalized device coordinates
    const rect = canvas.getBoundingClientRect()
    this.mouse.x = ((x - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((y - rect.top) / rect.height) * 2 + 1

    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.state.camera)

    // Perform raycast
    const intersects = this.raycaster.intersectObjects(this.state.scene.children, true)

    // Find first mesh with building ID
    for (const intersect of intersects) {
      if (intersect.object instanceof THREE.Mesh) {
        const buildingId = this.state.meshToBuildingIdMap.get(intersect.object)
        if (buildingId !== undefined) {
          return buildingId
        }
      }
    }

    return null
  }

  /**
   * Check if a point on screen intersects with any building
   */
  hasIntersection(x: number, y: number, canvas: HTMLCanvasElement): boolean {
    return this.getBuildingAtPosition(x, y, canvas) !== null
  }

  /**
   * Get all buildings within a screen rectangle
   */
  getBuildingsInRect(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    canvas: HTMLCanvasElement
  ): number[] {
    // This is a simplified implementation
    // For a proper rect selection, we'd need to test multiple points
    const buildingIds = new Set<number>()

    // Sample points within the rectangle
    const steps = 10
    for (let i = 0; i <= steps; i++) {
      for (let j = 0; j <= steps; j++) {
        const x = x1 + ((x2 - x1) * i) / steps
        const y = y1 + ((y2 - y1) * j) / steps

        const buildingId = this.getBuildingAtPosition(x, y, canvas)
        if (buildingId !== null) {
          buildingIds.add(buildingId)
        }
      }
    }

    return Array.from(buildingIds)
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.onBuildingClick = undefined
  }
}
