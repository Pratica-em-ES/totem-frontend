import type { IMapAPI, MapState, BuildingDTO, NodeDTO } from './types'
import { SceneManager } from './core/SceneManager'
import { RendererManager } from './core/RendererManager'
import { ControlsManager } from './core/ControlsManager'
import { LoaderManager } from './core/LoaderManager'
import { BuildingHighlighter } from './features/BuildingHighlighter'
import { RouteTracer } from './features/RouteTracer'
import { LabelManager } from './features/LabelManager'
import { GroundRenderer } from './features/GroundRenderer'
import { MapDataLoader } from './utils/MapDataLoader'
import { RaycastHandler } from './utils/RaycastHandler'

/**
 * Main Map API - Clean interface for all map operations
 */
export class MapAPI implements IMapAPI {
  private state: MapState
  private sceneManager: SceneManager
  private rendererManager: RendererManager
  private controlsManager: ControlsManager
  private loaderManager: LoaderManager
  private buildingHighlighter: BuildingHighlighter
  private routeTracer: RouteTracer
  private labelManager: LabelManager
  private groundRenderer: GroundRenderer
  private mapDataLoader: MapDataLoader
  private raycastHandler: RaycastHandler
  private initialized = false

  constructor() {
    // Initialize state
    this.state = {
      mapData: null,
      scene: null,
      camera: null,
      renderer: null,
      container: null,
      buildingIdToNodeIdMap: new Map(),
      buildingNameToIdMap: new Map(),
      buildingIdToModelMap: new Map(),
      meshToBuildingIdMap: new Map(),
      loadedModels: new Map(),
      highlightedBuildingId: null,
      highlightedNodeId: null,
      currentRoute: null,
      routeLines: []
    }

    // Initialize managers
    this.sceneManager = new SceneManager(this.state)
    this.rendererManager = new RendererManager(this.state)
    this.controlsManager = new ControlsManager(this.state)
    this.loaderManager = new LoaderManager(this.state)
    this.buildingHighlighter = new BuildingHighlighter(this.state, this.rendererManager)
    this.routeTracer = new RouteTracer(this.state)
    this.labelManager = new LabelManager(this.state)
    this.groundRenderer = new GroundRenderer(this.state)
    this.mapDataLoader = new MapDataLoader()
    this.raycastHandler = new RaycastHandler(this.state)
  }

  /**
   * Mount the map to a container and initialize
   */
  async mount(container: HTMLElement): Promise<void> {
    if (this.initialized) {
      console.warn('Map already initialized. Call unmount() first.')
      return
    }

    this.state.container = container

    // Initialize scene
    this.sceneManager.initialize()

    // Initialize renderer
    this.rendererManager.initialize(container, {
      antialias: true,
      shadowsEnabled: true
    })

    // Initialize controls
    this.controlsManager.initialize({
      enablePan: false,
      enableDamping: true,
      minDistance: 120,
      maxDistance: 600,
      maxPolarAngle: Math.PI / 2 - 0.1
    })

    // Setup click handler
    const canvas = this.rendererManager.getDomElement()
    if (canvas) {
      canvas.addEventListener('click', (event) => this.handleClick(event))
    }

    // Register building click callback
    this.raycastHandler.onBuildingClickCallback((buildingId) => {
      this.highlightBuilding(buildingId)
    })

    this.initialized = true

    // Load map data
    await this.loadMapData()
  }

  /**
   * Unmount the map and cleanup
   */
  unmount(): void {
    if (!this.initialized) return

    this.rendererManager.dispose()
    this.controlsManager.dispose()
    this.buildingHighlighter.dispose()
    this.routeTracer.dispose()
    this.labelManager.dispose()
    this.groundRenderer.dispose()
    this.raycastHandler.dispose()

    this.initialized = false
  }

  /**
   * Load map data from backend
   */
  private async loadMapData(url?: string): Promise<void> {
    try {
      const mapData = url
        ? await this.mapDataLoader.loadMapDataFromUrl(url)
        : await this.mapDataLoader.loadMapData()

      this.state.mapData = mapData

      // Build lookup maps
      this.buildLookupMaps()

      // Load ground
      const nodesMap = new Map<number, NodeDTO>()
      mapData.nodes.forEach((node) => nodesMap.set(node.id, node))
      await this.groundRenderer.loadGround(mapData.edges, nodesMap)

      // Load buildings
      await this.loadBuildings(mapData.buildings, nodesMap)
    } catch (error) {
      console.error('Failed to load map data:', error)
      throw error
    }
  }

  /**
   * Build lookup maps for fast queries
   */
  private buildLookupMaps(): void {
    if (!this.state.mapData) return

    this.state.buildingIdToNodeIdMap.clear()
    this.state.buildingNameToIdMap.clear()

    this.state.mapData.buildings.forEach((building) => {
      this.state.buildingIdToNodeIdMap.set(building.id, building.nodeId)
      this.state.buildingNameToIdMap.set(building.name, building.id)
    })
  }

  /**
   * Load building models
   */
  private async loadBuildings(
    buildings: BuildingDTO[],
    nodesMap: Map<number, NodeDTO>
  ): Promise<void> {
    for (const building of buildings) {
      const node = nodesMap.get(building.nodeId)
      if (!node) {
        console.warn(`Building ${building.name}: Node ${building.nodeId} not found`)
        continue
      }

      try {
        const model = await this.loaderManager.loadModel(building.modelPath)

        // Store model references
        this.state.loadedModels.set(building.name, model)
        this.state.buildingIdToModelMap.set(building.id, model)

        // Map meshes to building ID for raycasting
        model.traverse((child) => {
          if ((child as any).isMesh) {
            this.state.meshToBuildingIdMap.set(child as any, building.id)
          }
        })

        // Position the model
        model.position.set(node.x, 0.1, node.y)

        // Add to scene
        if (this.state.scene) {
          this.state.scene.add(model)
        }

        // Create label
        this.labelManager.createBuildingLabel(building.name, model)
      } catch (error) {
        console.error(`Failed to load building: ${building.name}`, error)
      }
    }
  }

  // ==================== Public API Methods ====================

  /**
   * Get the currently highlighted building
   */
  getHighlightedBuilding(): BuildingDTO | null {
    return this.buildingHighlighter.getHighlightedBuilding()
  }

  /**
   * Highlight a building by ID or name
   */
  highlightBuilding(buildingId: number | string): void {
    this.buildingHighlighter.highlightBuilding(buildingId)
  }

  /**
   * Clear all highlights
   */
  clearHighlight(): void {
    this.buildingHighlighter.clearHighlight()
  }

  /**
   * Highlight multiple buildings
   */
  highlightMultiple(buildingIds: Array<number | string>): void {
    this.buildingHighlighter.highlightMultiple(buildingIds)
  }

  /**
   * Trace a route through node IDs
   */
  traceRoute(nodeIdList: number[]): void {
    this.routeTracer.traceRoute(nodeIdList)
  }

  /**
   * Clear the current route
   */
  clearRoute(): void {
    this.routeTracer.clearRoute()
  }

  /**
   * Get building by name
   */
  getBuildingByName(name: string): BuildingDTO | null {
    if (!this.state.mapData) return null
    return this.state.mapData.buildings.find((b) => b.name === name) || null
  }

  /**
   * Get building by ID
   */
  getBuildingById(id: number): BuildingDTO | null {
    if (!this.state.mapData) return null
    return this.state.mapData.buildings.find((b) => b.id === id) || null
  }

  /**
   * Get all buildings
   */
  getAllBuildings(): BuildingDTO[] {
    return this.state.mapData?.buildings || []
  }

  /**
   * Handle click events
   */
  handleClick(event: MouseEvent): void {
    const canvas = this.rendererManager.getDomElement()
    if (canvas) {
      this.raycastHandler.handleClick(event, canvas)
    }
  }

  // ==================== Additional Utility Methods ====================

  /**
   * Get building ID by name (helper method)
   */
  getBuildingIdByName(name: string): number | null {
    return this.state.buildingNameToIdMap.get(name) || null
  }

  /**
   * Get node ID for a building
   */
  getNodeIdByBuildingId(buildingId: number): number | null {
    return this.state.buildingIdToNodeIdMap.get(buildingId) || null
  }

  /**
   * Get all loaded building names
   */
  getLoadedBuildingNames(): string[] {
    return Array.from(this.state.loadedModels.keys())
  }

  /**
   * Get current route
   */
  getCurrentRoute(): number[] | null {
    return this.routeTracer.getCurrentRoute()
  }

  /**
   * Check if map is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Reload map data
   */
  async reload(url?: string): Promise<void> {
    await this.loadMapData(url)
  }
}
