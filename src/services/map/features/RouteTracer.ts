import * as THREE from 'three'
import { Line2 } from 'three/addons/lines/Line2.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import { LineGeometry } from 'three/addons/lines/LineGeometry.js'
import type { MapState, RouteConfig, NodeDTO } from '../types'

/**
 * Manages route visualization on the map
 */
export class RouteTracer {
  private state: MapState
  private routeLines: THREE.Object3D[] = []
  private config: Required<RouteConfig>

  constructor(state: MapState, config: RouteConfig = {}) {
    this.state = state
    this.config = {
      lineColor: config.lineColor ?? 0x00ff00,
      lineWidth: config.lineWidth ?? 5,
      lineOpacity: config.lineOpacity ?? 0.9,
      animated: config.animated ?? false
    }
  }

  /**
   * Trace a route through a list of node IDs
   */
  traceRoute(nodeIdList: number[]): void {
    if (!this.state.scene || !this.state.mapData) {
      console.warn('Scene or map data not initialized')
      return
    }

    if (nodeIdList.length < 2) {
      console.warn('Route must contain at least 2 nodes')
      return
    }

    // Clear previous route
    this.clearRoute()

    // Store current route
    this.state.currentRoute = nodeIdList

    // Create nodes map for quick lookup
    const nodesMap = new Map<number, NodeDTO>()
    this.state.mapData.nodes.forEach((node) => {
      nodesMap.set(node.id, node)
    })

    // Create route segments
    for (let i = 0; i < nodeIdList.length - 1; i++) {
      const fromNodeId = nodeIdList[i]
      const toNodeId = nodeIdList[i + 1]

      const fromNode = nodesMap.get(fromNodeId)
      const toNode = nodesMap.get(toNodeId)

      if (!fromNode || !toNode) {
        console.warn(`Missing node in route: ${fromNodeId} or ${toNodeId}`)
        continue
      }

      this.createRouteSegment(fromNode, toNode)
    }
  }

  /**
   * Clear the current route visualization
   */
  clearRoute(): void {
    if (!this.state.scene) return

    // Remove all route lines from the scene
    this.routeLines.forEach((line) => {
      this.state.scene!.remove(line)

      // Dispose geometry and material
      if (line instanceof Line2) {
        line.geometry.dispose()
        line.material.dispose()
      }
    })

    this.routeLines = []
    this.state.currentRoute = null
  }

  /**
   * Get the current route
   */
  getCurrentRoute(): number[] | null {
    return this.state.currentRoute
  }

  /**
   * Update route configuration
   */
  updateConfig(config: Partial<RouteConfig>): void {
    this.config = {
      ...this.config,
      ...config
    }

    // Redraw route if one exists
    if (this.state.currentRoute) {
      const currentRoute = [...this.state.currentRoute]
      this.traceRoute(currentRoute)
    }
  }

  /**
   * Create a route segment between two nodes
   */
  private createRouteSegment(fromNode: NodeDTO, toNode: NodeDTO): void {
    if (!this.state.scene) return

    // Create line geometry with elevated Y position
    const yOffset = 2.5 // Elevate the line above the ground
    const positions = [
      fromNode.x, yOffset, fromNode.y,
      toNode.x, yOffset, toNode.y
    ]

    const lineGeometry = new LineGeometry()
    lineGeometry.setPositions(positions)

    const lineMaterial = new LineMaterial({
      color: this.config.lineColor,
      linewidth: this.config.lineWidth,
      opacity: this.config.lineOpacity,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      alphaToCoverage: true
    })

    // Resolution for line rendering
    lineMaterial.resolution.set(window.innerWidth, window.innerHeight)

    const line = new Line2(lineGeometry, lineMaterial)
    line.computeLineDistances()
    line.renderOrder = 999 // Render on top

    this.state.scene.add(line)
    this.routeLines.push(line)
  }

  /**
   * Create a simple route visualization (alternative method using basic lines)
   */
  traceRouteSimple(nodeIdList: number[]): void {
    if (!this.state.scene || !this.state.mapData) return

    this.clearRoute()
    this.state.currentRoute = nodeIdList

    const nodesMap = new Map<number, NodeDTO>()
    this.state.mapData.nodes.forEach((node) => {
      nodesMap.set(node.id, node)
    })

    const points: THREE.Vector3[] = []
    nodeIdList.forEach((nodeId) => {
      const node = nodesMap.get(nodeId)
      if (node) {
        points.push(new THREE.Vector3(node.x, 2.5, node.y))
      }
    })

    if (points.length < 2) return

    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: this.config.lineColor,
      linewidth: 2,
      opacity: this.config.lineOpacity,
      transparent: true
    })

    const line = new THREE.Line(geometry, material)
    line.renderOrder = 999

    this.state.scene.add(line)
    this.routeLines.push(line)
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.clearRoute()
  }
}
