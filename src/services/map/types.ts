import * as THREE from 'three'
import type { MapDTO } from '@/models/MapDTO'
import type { BuildingDTO } from '@/models/BuildingDTO'
import type { NodeDTO } from '@/models/NodeDTO'
import type { EdgeDTO } from '@/models/EdgeDTO'

/**
 * Public API interface for the map service
 */
export interface IMapAPI {
  // Lifecycle
  mount(container: HTMLElement): Promise<void>
  unmount(): void

  // Building Operations
  getHighlightedBuilding(): BuildingDTO | null
  highlightBuilding(buildingId: number | string): void
  clearHighlight(): void
  highlightMultiple(buildingIds: Array<number | string>): void

  // Route Operations
  traceRoute(nodeIdList: number[]): void
  clearRoute(): void

  // Queries
  getBuildingByName(name: string): BuildingDTO | null
  getBuildingById(id: number): BuildingDTO | null
  getAllBuildings(): BuildingDTO[]

  // Click Handling
  handleClick(event: MouseEvent): void
}

/**
 * Internal map state shared between modules
 */
export interface MapState {
  // Data
  mapData: MapDTO | null

  // Three.js objects
  scene: THREE.Scene | null
  camera: THREE.PerspectiveCamera | null
  renderer: THREE.WebGLRenderer | null
  container: HTMLElement | null

  // Lookup maps
  buildingIdToNodeIdMap: Map<number, number>
  buildingNameToIdMap: Map<string, number>
  buildingIdToModelMap: Map<number, THREE.Object3D>
  meshToBuildingIdMap: Map<THREE.Mesh, number>
  loadedModels: Map<string, THREE.Object3D>

  // Highlight state
  highlightedBuildingId: number | null
  highlightedNodeId: number | null

  // Route state
  currentRoute: number[] | null
  routeLines: THREE.Object3D[]
}

/**
 * Configuration for the renderer
 */
export interface RendererConfig {
  antialias?: boolean
  alpha?: boolean
  shadowsEnabled?: boolean
}

/**
 * Configuration for orbit controls
 */
export interface ControlsConfig {
  enablePan?: boolean
  enableDamping?: boolean
  minDistance?: number
  maxDistance?: number
  maxPolarAngle?: number
}

/**
 * Configuration for building highlighting
 */
export interface HighlightConfig {
  outlineColor?: string
  outlineStrength?: number
  outlineGlow?: number
  outlineThickness?: number
  pulsePeriod?: number
  nodeHighlightColor?: number
}

/**
 * Configuration for route visualization
 */
export interface RouteConfig {
  lineColor?: number
  lineWidth?: number
  lineOpacity?: number
  animated?: boolean
}

/**
 * Building model with mesh reference
 */
export interface BuildingModel {
  id: number
  name: string
  nodeId: number
  model: THREE.Object3D
  meshes: THREE.Mesh[]
  boundingBox: THREE.Box3
}

/**
 * Route segment for visualization
 */
export interface RouteSegment {
  fromNode: NodeDTO
  toNode: NodeDTO
  edge?: EdgeDTO
}

export type { MapDTO, BuildingDTO, NodeDTO, EdgeDTO }
