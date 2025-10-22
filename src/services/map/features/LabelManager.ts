import * as THREE from 'three'
import type { MapState, NodeDTO } from '../types'

/**
 * Manages text labels for buildings and nodes
 */
export class LabelManager {
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
    excludeNames: string[] = ['tecnopuc']
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
      const fontSize = 144
      const padding = 40

      // Create temporary canvas to measure text
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) return

      tempCtx.font = `bold ${fontSize}px Arial`
      const textMetrics = tempCtx.measureText(name)
      const textWidth = textMetrics.width
      const textHeight = fontSize

      // Create canvas with size adjusted to text
      const canvas = document.createElement('canvas')
      canvas.width = textWidth + padding * 2
      canvas.height = textHeight + padding * 2
      const ctx = canvas.getContext('2d')

      if (ctx) {
        // Semi-transparent dark background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // White text with building name
        ctx.fillStyle = '#ffffff'
        ctx.font = `bold ${fontSize}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(name, canvas.width / 2, canvas.height / 2)
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
      sprite.position.set(center.x, center.y + size.y / 2 + 2, center.z)

      // Scale proportional to canvas size
      const aspectRatio = canvas.width / canvas.height
      const spriteHeight = 4
      const spriteWidth = spriteHeight * aspectRatio
      sprite.scale.set(spriteWidth, spriteHeight, 1)
      sprite.renderOrder = 100

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
    canvas.width = 128
    canvas.height = 64
    const ctx = canvas.getContext('2d')

    if (ctx) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 32px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${node.id}`, canvas.width / 2, canvas.height / 2)
    }

    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false, // Render on top
      depthWrite: false
    })

    const sprite = new THREE.Sprite(material)
    sprite.position.set(node.x, 5, node.y)
    sprite.scale.set(3, 1.5, 1)
    sprite.renderOrder = 1001

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
