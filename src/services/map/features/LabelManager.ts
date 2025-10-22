import * as THREE from 'three'
import type { MapState, NodeDTO } from '../types'

/**
 * Manages text labels for buildings and nodes
 */
export class LabelManager {
  // Building Label Style
  static BUILDING_FONT_SIZE = 100
  static BUILDING_FONT_FAMILY = 'Arial'
  static BUILDING_FONT_WEIGHT = 'normal'
  static BUILDING_PADDING = 20
  static BUILDING_BG_COLOR = 'rgba(0, 0, 0, 0)'
  static BUILDING_TEXT_COLOR = '#ffffff'
  static BUILDING_OUTLINE_COLOR = '#000000'
  static BUILDING_OUTLINE_WIDTH = 20
  static BUILDING_HEIGHT_OFFSET = 2
  static BUILDING_SPRITE_HEIGHT = 2.5
  static BUILDING_RENDER_ORDER = 100

  // Node Label Style
  static NODE_CANVAS_WIDTH = 128
  static NODE_CANVAS_HEIGHT = 64
  static NODE_FONT_SIZE = 32
  static NODE_FONT_FAMILY = 'Arial'
  static NODE_FONT_WEIGHT = 'bold'
  static NODE_BG_COLOR = 'rgba(0, 0, 0, 0.6)'
  static NODE_TEXT_COLOR = '#ffffff'
  static NODE_OUTLINE_COLOR = '#000000'
  static NODE_OUTLINE_WIDTH = 3
  static NODE_HEIGHT = 5
  static NODE_SCALE_X = 3
  static NODE_SCALE_Y = 1.5
  static NODE_RENDER_ORDER = 1001

  private state: MapState
  private buildingLabels: THREE.Sprite[] = []
  private nodeLabels: THREE.Sprite[] = []

  constructor(state: MapState) {
    this.state = state
  }

  /**
   * Create a label for a building
   */
  createBuildingLabel(
    name: string,
    model: THREE.Object3D,
    excludeNames: string[] = ['tecnopuc'],
    isCurrentLocation: boolean = false
  ): void {
    if (!this.state.scene) return

    // Skip excluded buildings
    if (excludeNames.includes(name.toLowerCase())) {
      return
    }

    try {
      // Calculate bounding box to position label above building
      const box = new THREE.Box3().setFromObject(model)
      const size = new THREE.Vector3()
      const center = new THREE.Vector3()
      box.getSize(size)
      box.getCenter(center)

      // Text configuration
      const fontSize = LabelManager.BUILDING_FONT_SIZE
      const padding = LabelManager.BUILDING_PADDING
      const pinSize = isCurrentLocation ? 120 : 0 // Pin icon size (increased for visibility)
      const pinPadding = isCurrentLocation ? 25 : 0 // Space between pin and text

      // Create temporary canvas to measure text
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) return

      tempCtx.font = `${LabelManager.BUILDING_FONT_WEIGHT} ${fontSize}px ${LabelManager.BUILDING_FONT_FAMILY}`
      const textMetrics = tempCtx.measureText(name)
      const textWidth = textMetrics.width
      const textHeight = fontSize

      // Create canvas with size adjusted to text + pin if needed
      const canvas = document.createElement('canvas')
      canvas.width = textWidth + padding * 2 + pinSize + pinPadding
      canvas.height = Math.max(textHeight + padding * 2, pinSize + padding * 2)
      const ctx = canvas.getContext('2d')

      if (ctx) {
        // Semi-transparent dark background
        ctx.fillStyle = LabelManager.BUILDING_BG_COLOR
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        let textStartX = canvas.width / 2

        // Draw pin icon if this is current location
        if (isCurrentLocation) {
          const pinCenterX = padding + pinSize / 2
          const pinCenterY = canvas.height / 2
          const pinRadius = pinSize / 3

          // Draw red pin
          ctx.fillStyle = '#b90a04ff'

          // Circular top part
          ctx.beginPath()
          ctx.arc(pinCenterX, pinCenterY - pinRadius * 0.3, pinRadius, 0, Math.PI * 2)
          ctx.fill()

          // Pointed bottom part (triangle)
          ctx.beginPath()
          ctx.moveTo(pinCenterX - pinRadius * 0.5, pinCenterY + pinRadius * 0.5)
          ctx.lineTo(pinCenterX, pinCenterY + pinRadius * 1.5)
          ctx.lineTo(pinCenterX + pinRadius * 0.5, pinCenterY + pinRadius * 0.5)
          ctx.closePath()
          ctx.fill()

          // White circle in center
          ctx.fillStyle = '#FFFFFF'
          ctx.beginPath()
          ctx.arc(pinCenterX, pinCenterY - pinRadius * 0.3, pinRadius * 0.35, 0, Math.PI * 2)
          ctx.fill()

          // Adjust text position to be after the pin
          textStartX = padding + pinSize + pinPadding + textWidth / 2
        }

        // Configure font
        ctx.font = `${LabelManager.BUILDING_FONT_WEIGHT} ${fontSize}px ${LabelManager.BUILDING_FONT_FAMILY}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // Draw text outline
        ctx.strokeStyle = LabelManager.BUILDING_OUTLINE_COLOR
        ctx.lineWidth = LabelManager.BUILDING_OUTLINE_WIDTH
        ctx.strokeText(name, textStartX, canvas.height / 2)

        // Draw text fill
        ctx.fillStyle = LabelManager.BUILDING_TEXT_COLOR
        ctx.fillText(name, textStartX, canvas.height / 2)
      }

      // Create texture and material
      const texture = new THREE.CanvasTexture(canvas)
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: true,
        depthWrite: false
      })

      // Create sprite
      const sprite = new THREE.Sprite(material)
      sprite.position.set(center.x, center.y + size.y / 2 + LabelManager.BUILDING_HEIGHT_OFFSET, center.z)

      // Scale proportional to canvas size
      const aspectRatio = canvas.width / canvas.height
      const spriteHeight = LabelManager.BUILDING_SPRITE_HEIGHT
      const spriteWidth = spriteHeight * aspectRatio
      sprite.scale.set(spriteWidth, spriteHeight, 1)
      sprite.renderOrder = LabelManager.BUILDING_RENDER_ORDER

      this.state.scene.add(sprite)
      this.buildingLabels.push(sprite)
    } catch (err) {
      console.error('Failed to create building label:', err)
    }
  }

  /**
   * Create labels for all nodes (debug/development mode)
   */
  createNodeLabels(nodes: Map<number, NodeDTO>): void {
    if (!this.state.scene) return

    // Clear existing node labels
    this.clearNodeLabels()

    nodes.forEach((node) => {
      this.createNodeLabel(node)
    })
  }

  /**
   * Create a label for a single node
   */
  private createNodeLabel(node: NodeDTO): void {
    if (!this.state.scene) return

    const canvas = document.createElement('canvas')
    canvas.width = LabelManager.NODE_CANVAS_WIDTH
    canvas.height = LabelManager.NODE_CANVAS_HEIGHT
    const ctx = canvas.getContext('2d')

    if (ctx) {
      ctx.fillStyle = LabelManager.NODE_BG_COLOR
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Configure font
      ctx.font = `${LabelManager.NODE_FONT_WEIGHT} ${LabelManager.NODE_FONT_SIZE}px ${LabelManager.NODE_FONT_FAMILY}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Draw text outline
      ctx.strokeStyle = LabelManager.NODE_OUTLINE_COLOR
      ctx.lineWidth = LabelManager.NODE_OUTLINE_WIDTH
      ctx.strokeText(`${node.id}`, canvas.width / 2, canvas.height / 2)

      // Draw text fill
      ctx.fillStyle = LabelManager.NODE_TEXT_COLOR
      ctx.fillText(`${node.id}`, canvas.width / 2, canvas.height / 2)
    }

    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false
    })

    const sprite = new THREE.Sprite(material)
    sprite.position.set(node.x, LabelManager.NODE_HEIGHT, node.y)
    sprite.scale.set(LabelManager.NODE_SCALE_X, LabelManager.NODE_SCALE_Y, 1)
    sprite.renderOrder = LabelManager.NODE_RENDER_ORDER

    this.state.scene.add(sprite)
    this.nodeLabels.push(sprite)
  }

  /**
   * Clear all building labels
   */
  clearBuildingLabels(): void {
    if (!this.state.scene) return

    this.buildingLabels.forEach((label) => {
      this.state.scene!.remove(label)
      label.material.map?.dispose()
      label.material.dispose()
    })

    this.buildingLabels = []
  }

  /**
   * Clear all node labels
   */
  clearNodeLabels(): void {
    if (!this.state.scene) return

    this.nodeLabels.forEach((label) => {
      this.state.scene!.remove(label)
      label.material.map?.dispose()
      label.material.dispose()
    })

    this.nodeLabels = []
  }

  /**
   * Clear all labels
   */
  clearAll(): void {
    this.clearBuildingLabels()
    this.clearNodeLabels()
  }

  /**
   * Show/hide building labels
   */
  setBuildingLabelsVisible(visible: boolean): void {
    this.buildingLabels.forEach((label) => {
      label.visible = visible
    })
  }

  /**
   * Show/hide node labels
   */
  setNodeLabelsVisible(visible: boolean): void {
    this.nodeLabels.forEach((label) => {
      label.visible = visible
    })
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.clearAll()
  }
}
