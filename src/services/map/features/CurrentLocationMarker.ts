import * as THREE from 'three'
import type { MapState, NodeDTO } from '../types'

/**
 * Manages the "You are here" marker on the map
 * Displays a red location pin sprite at the current totem location
 */
export class CurrentLocationMarker {
  // Pin icon configuration
  static PIN_CANVAS_SIZE = 128
  static PIN_COLOR = '#FF0000' // Red
  static PIN_SCALE = 4 // Size of the pin sprite
  static PIN_HEIGHT = 5 // Height above ground
  static PIN_RENDER_ORDER = 1000

  private state: MapState
  private pinSprite: THREE.Sprite | null = null

  constructor(state: MapState) {
    this.state = state
  }

  /**
   * Create and display the current location marker at a specific node
   */
  createMarker(nodeId: number): void {
    if (!this.state.scene || !this.state.mapData) {
      console.warn('[CurrentLocationMarker] Scene or map data not initialized')
      return
    }

    // Find the node
    const node = this.state.mapData.nodes.find((n) => n.id === nodeId)
    if (!node) {
      console.warn(`[CurrentLocationMarker] Node ${nodeId} not found`)
      return
    }

    // Clear existing marker if any
    this.clearMarker()

    // Create pin sprite
    this.pinSprite = this.createPinSprite()
    this.pinSprite.position.set(node.x, CurrentLocationMarker.PIN_HEIGHT, node.y)

    // Add to scene
    this.state.scene.add(this.pinSprite)

    console.log(`[CurrentLocationMarker] Pin marker created at node ${nodeId} (${node.x}, ${node.y})`)
  }

  /**
   * Create a pin icon sprite (similar to Google Maps pin)
   */
  private createPinSprite(): THREE.Sprite {
    const canvas = document.createElement('canvas')
    const size = CurrentLocationMarker.PIN_CANVAS_SIZE
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    if (ctx) {
      // Clear canvas
      ctx.clearRect(0, 0, size, size)

      // Draw pin shape (teardrop/location marker)
      const centerX = size / 2
      const centerY = size / 2.5
      const radius = size / 3

      ctx.fillStyle = CurrentLocationMarker.PIN_COLOR
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 3

      // Draw the circular top part
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Draw the pointed bottom part (triangle)
      ctx.beginPath()
      ctx.moveTo(centerX - radius * 0.5, centerY + radius * 0.8)
      ctx.lineTo(centerX, centerY + radius * 2.2)
      ctx.lineTo(centerX + radius * 0.5, centerY + radius * 0.8)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Draw white circle in center
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 0.35, 0, Math.PI * 2)
      ctx.fill()
    }

    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false
    })

    const sprite = new THREE.Sprite(material)
    sprite.scale.set(CurrentLocationMarker.PIN_SCALE, CurrentLocationMarker.PIN_SCALE, 1)
    sprite.renderOrder = CurrentLocationMarker.PIN_RENDER_ORDER

    return sprite
  }

  /**
   * Update the marker position (if needed to change location dynamically)
   */
  updatePosition(node: NodeDTO): void {
    if (!this.pinSprite) {
      console.warn('[CurrentLocationMarker] Marker not created yet')
      return
    }

    this.pinSprite.position.set(node.x, CurrentLocationMarker.PIN_HEIGHT, node.y)
  }

  /**
   * Clear the current location marker
   */
  clearMarker(): void {
    if (!this.state.scene) return

    if (this.pinSprite) {
      this.state.scene.remove(this.pinSprite)
      this.pinSprite.material.map?.dispose()
      this.pinSprite.material.dispose()
      this.pinSprite = null
    }
  }

  /**
   * Show/hide the marker
   */
  setVisible(visible: boolean): void {
    if (this.pinSprite) {
      this.pinSprite.visible = visible
    }
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.clearMarker()
  }
}
