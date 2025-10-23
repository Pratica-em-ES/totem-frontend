import * as THREE from 'three'
import { Line2 } from 'three/addons/lines/Line2.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import { LineGeometry } from 'three/addons/lines/LineGeometry.js'
import type { MapState, RouteConfig, NodeDTO } from '../types'

/**
 * Manages route visualization on the map
 */
export class RouteTracer {
  // Route Style
  static ROUTE_COLOR = 0x005ae2  // rgb(0, 90, 226) in hex
  static ROUTE_WIDTH = 2.0
  static ROUTE_OPACITY = 1
  static ROUTE_HEIGHT = 0
  static ROUTE_RENDER_ORDER = 99
  static ROUTE_MATERIAL_SIDE = THREE.DoubleSide


  private state: MapState
  private routeLines: THREE.Object3D[] = []
  private config: Required<RouteConfig>

  constructor(state: MapState, config: RouteConfig = {}) {
    this.state = state
    this.config = {
      lineColor: config.lineColor ?? RouteTracer.ROUTE_COLOR,
      lineWidth: config.lineWidth ?? 5,
      lineOpacity: config.lineOpacity ?? RouteTracer.ROUTE_OPACITY,
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
      } else if (line instanceof THREE.Mesh) {
        line.geometry.dispose()
        if (Array.isArray(line.material)) {
          line.material.forEach((mat) => mat.dispose())
        } else {
          line.material.dispose()
        }
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
   * Create a route segment between two nodes as a plane/ribbon with rounded caps
   */
  private createRouteSegment(fromNode: NodeDTO, toNode: NodeDTO): void {
    if (!this.state.scene) return

    const yOffset = RouteTracer.ROUTE_HEIGHT
    const ribbonWidth = RouteTracer.ROUTE_WIDTH
    const halfWidth = ribbonWidth / 2

    // Calculate direction vector
    const dx = toNode.x - fromNode.x
    const dz = toNode.y - fromNode.y
    const length = Math.sqrt(dx * dx + dz * dz)

    // Normalize direction
    const dirX = dx / length
    const dirZ = dz / length

    // Perpendicular vector for width
    const perpX = -dirZ
    const perpZ = dirX

    // Create material
    const material = new THREE.MeshBasicMaterial({
      color: this.config.lineColor,
      opacity: this.config.lineOpacity,
      transparent: true,
      side: RouteTracer.ROUTE_MATERIAL_SIDE,
      depthTest: true,
      depthWrite: false
    })

    // 1. Create main ribbon body
    const v1 = new THREE.Vector3(
      fromNode.x + perpX * halfWidth,
      yOffset,
      fromNode.y + perpZ * halfWidth
    )
    const v2 = new THREE.Vector3(
      fromNode.x - perpX * halfWidth,
      yOffset,
      fromNode.y - perpZ * halfWidth
    )
    const v3 = new THREE.Vector3(
      toNode.x - perpX * halfWidth,
      yOffset,
      toNode.y - perpZ * halfWidth
    )
    const v4 = new THREE.Vector3(
      toNode.x + perpX * halfWidth,
      yOffset,
      toNode.y + perpZ * halfWidth
    )

    const geometry = new THREE.BufferGeometry()
    const vertices = new Float32Array([
      v1.x, v1.y, v1.z,
      v2.x, v2.y, v2.z,
      v3.x, v3.y, v3.z,
      v1.x, v1.y, v1.z,
      v3.x, v3.y, v3.z,
      v4.x, v4.y, v4.z
    ])
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    geometry.computeVertexNormals()

    const mesh = new THREE.Mesh(geometry, material)
    mesh.renderOrder = RouteTracer.ROUTE_RENDER_ORDER
    this.state.scene.add(mesh)
    this.routeLines.push(mesh)

    // 2. Add rounded cap at start (circle)
    const startCapGeometry = new THREE.CircleGeometry(halfWidth, 16)
    startCapGeometry.rotateX(-Math.PI / 2)
    const startCap = new THREE.Mesh(startCapGeometry, material.clone())
    startCap.position.set(fromNode.x, yOffset, fromNode.y)
    startCap.renderOrder = RouteTracer.ROUTE_RENDER_ORDER
    this.state.scene.add(startCap)
    this.routeLines.push(startCap)

    // 3. Add rounded cap at end (circle)
    const endCapGeometry = new THREE.CircleGeometry(halfWidth, 16)
    endCapGeometry.rotateX(-Math.PI / 2)
    const endCap = new THREE.Mesh(endCapGeometry, material.clone())
    endCap.position.set(toNode.x, yOffset, toNode.y)
    endCap.renderOrder = RouteTracer.ROUTE_RENDER_ORDER
    this.state.scene.add(endCap)
    this.routeLines.push(endCap)
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
