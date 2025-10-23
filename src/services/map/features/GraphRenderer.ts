import * as THREE from 'three'
import { Line2 } from 'three/addons/lines/Line2.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import { LineGeometry } from 'three/addons/lines/LineGeometry.js'
import type { MapState, EdgeDTO, NodeDTO } from '../types'

/**
 * Renders graph nodes and edges for development/debugging purposes
 */
export class GraphRenderer {

  // Node Style
  static NODE_COLOR = 'rgba(255, 255, 0, 0.7)'
  static NODE_BORDER_COLOR = 'rgba(255, 255, 0, 0.7)'
  static NODE_BORDER_WIDTH = 0 
  static NODE_SIZE = 32
  static NODE_SCALE = 1.5
  static NODE_HEIGHT = 1
  static NODE_RENDER_ORDER = 1000

  // Edge Style
  static EDGE_COLOR = 'rgba(240, 88, 61, 0.7)'
  static EDGE_WIDTH = 8
  static EDGE_OPACITY = 1
  static EDGE_HEIGHT = 1
  static EDGE_RENDER_ORDER = 999

  private state: MapState
  private nodeCircles: THREE.Sprite[] = []
  private edgeLines: Line2[] = []

  constructor(state: MapState) {
    this.state = state
  }

  /**
   * Render all graph nodes as circles
   */
  renderNodes(nodes: NodeDTO[]): void {
    if (!this.state.scene) return

    this.clearNodes()

    nodes.forEach((node) => {
      this.createNodeCircle(node)
    })
  }

  /**
   * Create a visual circle for a graph node as a billboard sprite
   */
  private createNodeCircle(node: NodeDTO): void {
    if (!this.state.scene || !this.state.camera) return

    // Create canvas for the circle
    const size = GraphRenderer.NODE_SIZE
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    if (ctx) {
      // Draw filled circle
      ctx.fillStyle = GraphRenderer.NODE_COLOR
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2)
      ctx.fill()

      // Draw border for better visibility
      ctx.strokeStyle = GraphRenderer.NODE_BORDER_COLOR
      ctx.lineWidth = GraphRenderer.NODE_BORDER_WIDTH
      ctx.stroke()
    }

    // Create sprite texture and material
    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      sizeAttenuation: true
    })

    const sprite = new THREE.Sprite(material)
    sprite.position.set(node.x, GraphRenderer.NODE_HEIGHT, node.y)
    sprite.scale.set(GraphRenderer.NODE_SCALE, GraphRenderer.NODE_SCALE, 1)
    sprite.renderOrder = GraphRenderer.NODE_RENDER_ORDER

    this.state.scene.add(sprite)
    this.nodeCircles.push(sprite)
  }

  /**
   * Render all graph edges as lines
   */
  renderEdges(edges: EdgeDTO[], nodesMap: Map<number, NodeDTO>): void {
    if (!this.state.scene) return

    // Clear existing edges
    this.clearEdges()

    edges.forEach((edge) => {
      this.createEdgeLine(edge, nodesMap)
    })
  }

  /**
   * Create a visual line for a graph edge with thickness
   */
  private createEdgeLine(edge: EdgeDTO, nodesMap: Map<number, NodeDTO>): void {
    if (!this.state.scene) return

    const nodeA = nodesMap.get(edge.aNodeId)
    const nodeB = nodesMap.get(edge.bNodeId)

    if (!nodeA || !nodeB) {
      console.warn(`Edge ${edge.id}: Missing nodes`)
      return
    }

    // Create line geometry
    const positions = [
      nodeA.x, GraphRenderer.EDGE_HEIGHT, nodeA.y,
      nodeB.x, GraphRenderer.EDGE_HEIGHT, nodeB.y
    ]

    const geometry = new LineGeometry()
    geometry.setPositions(positions)

    // Create material with thickness
    const material = new LineMaterial({
      color: GraphRenderer.EDGE_COLOR,
      linewidth: GraphRenderer.EDGE_WIDTH,
      transparent: true,
      opacity: GraphRenderer.EDGE_OPACITY,
      depthTest: false
    })

    // Need to set resolution for LineMaterial
    if (this.state.renderer) {
      const size = new THREE.Vector2()
      this.state.renderer.getSize(size)
      material.resolution.set(size.x, size.y)
    }

    const line = new Line2(geometry, material)
    line.renderOrder = GraphRenderer.EDGE_RENDER_ORDER
    line.computeLineDistances()

    this.state.scene.add(line)
    this.edgeLines.push(line)
  }

  /**
   * Clear all rendered nodes
   */
  clearNodes(): void {
    if (!this.state.scene) return

    this.nodeCircles.forEach((sprite) => {
      this.state.scene!.remove(sprite)
      if (sprite.material.map) {
        sprite.material.map.dispose()
      }
      sprite.material.dispose()
    })

    this.nodeCircles = []
  }

  /**
   * Clear all rendered edges
   */
  clearEdges(): void {
    if (!this.state.scene) return

    this.edgeLines.forEach((line) => {
      this.state.scene!.remove(line)
      line.geometry.dispose()
      line.material.dispose()
    })

    this.edgeLines = []
  }

  /**
   * Show/hide nodes
   */
  setNodesVisible(visible: boolean): void {
    this.nodeCircles.forEach((sprite) => {
      sprite.visible = visible
    })
  }

  /**
   * Show/hide edges
   */
  setEdgesVisible(visible: boolean): void {
    this.edgeLines.forEach((line) => {
      line.visible = visible
    })
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.clearNodes()
    this.clearEdges()
  }
}
