import * as THREE from 'three'
import type { IMapAPI, MapState, BuildingDTO, NodeDTO } from './types'
import { SceneManager } from './core/SceneManager'
import { RendererManager } from './core/RendererManager'
import { ControlsManager } from './core/ControlsManager'
import { LoaderManager } from './core/LoaderManager'
import { BuildingHighlighter } from './features/BuildingHighlighter'
import { RouteTracer } from './features/RouteTracer'
import { LabelManager } from './features/LabelManager'
import { GroundRenderer } from './features/GroundRenderer'
import { GraphRenderer } from './features/GraphRenderer'
import { MapDataLoader } from './utils/MapDataLoader'
import { RaycastHandler } from './utils/RaycastHandler'
import { featureFlags } from '@/config/featureFlags'

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
  private graphRenderer: GraphRenderer
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
      routeLines: [],
      isCameraAnimating: false
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
    this.graphRenderer = new GraphRenderer(this.state)
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

    // Connect controls manager to renderer for updates in render loop
    this.rendererManager.setControlsManager(this.controlsManager)

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
    this.graphRenderer.dispose()
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

      // Apply feature flags
      this.applyFeatureFlags(nodesMap)
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
   * Apply feature flags after map data is loaded
   */
  private applyFeatureFlags(nodesMap: Map<number, NodeDTO>): void {
    if (!this.state.mapData) return

    console.log('[MapAPI] Applying feature flags:', {
      showBuildingLabels: featureFlags.showBuildingLabels,
      showNodeLabels: featureFlags.showNodeLabels,
      showGraphNodes: featureFlags.showGraphNodes,
      showGraphEdges: featureFlags.showGraphEdges
    })

    // Building labels
    if (!featureFlags.showBuildingLabels) {
      this.labelManager.setBuildingLabelsVisible(false)
    }

    // Node labels (dev feature)
    if (featureFlags.showNodeLabels) {
      console.log('[MapAPI] Creating node labels...')
      this.labelManager.createNodeLabels(nodesMap)
    }

    // Graph nodes (dev feature)
    if (featureFlags.showGraphNodes) {
      console.log('[MapAPI] Rendering graph nodes...')
      this.graphRenderer.renderNodes(this.state.mapData.nodes)
    }

    // Graph edges (dev feature)
    if (featureFlags.showGraphEdges) {
      console.log('[MapAPI] Rendering graph edges...')
      this.graphRenderer.renderEdges(this.state.mapData.edges, nodesMap)
    }
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
   * Animate camera to top-down view with smooth zoom out and rotation
   * Temporarily disables OrbitControls during animation
   */
  animateToTopDownView(duration: number = 1500): void {
    // Check if camera animation is enabled
    if (!featureFlags.enableCameraAnimation) {
      console.log('[MapAPI] Camera animation disabled by feature flag')
      return
    }

    if (!this.state.camera) {
      console.warn('[MapAPI] Camera not initialized')
      return
    }

    const camera = this.state.camera
    const controls = this.controlsManager.getControls()

    console.log('[MapAPI] Starting camera animation...')
    console.log('[MapAPI] Initial position:', camera.position)
    console.log('[MapAPI] Controls enabled:', controls?.enabled)

    // Set animation flag to prevent controls from updating in render loop
    this.state.isCameraAnimating = true

    // Completely disable controls during animation
    const wasEnabled = controls ? controls.enabled : false
    if (controls) {
      controls.enabled = false
      console.log('[MapAPI] Controls disabled for animation')
    }

    const startPosition = camera.position.clone()
    const targetPosition = new THREE.Vector3(0, 600, 0) // Maximum zoom out distance
    const centerTarget = new THREE.Vector3(0, 0, 0)

    // Extract only the "up" vectors to interpolate the roll
    const startUp = camera.up.clone().normalize()
    const targetUp = new THREE.Vector3(0, 1, 0)

    // We'll interpolate up vectors and then use lookAt
    // But we need to make lookAt respect our interpolated up vector
    // Solution: Build camera matrix manually from forward, up, right vectors

    const startTime = Date.now()

    // Easing function for smooth animation (ease-in-out)
    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    const animate = () => {
      const elapsed = Date.now() - startTime
      const rawProgress = Math.min(elapsed / duration, 1)
      const progress = easeInOutCubic(rawProgress)

      // Interpolate position
      camera.position.lerpVectors(startPosition, targetPosition, progress)

      // Interpolate up vector (controls the roll/straightening)
      const interpolatedUp = new THREE.Vector3().lerpVectors(startUp, targetUp, progress).normalize()

      // Set the interpolated up vector
      camera.up.copy(interpolatedUp)

      // Use lookAt to orient camera toward center while respecting the interpolated up vector
      camera.lookAt(centerTarget)

      // Update projection matrix to ensure changes are applied
      camera.updateProjectionMatrix()

      if (rawProgress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Animation complete - update controls target to match new position
        if (controls) {
          controls.target.copy(centerTarget)
          controls.enabled = wasEnabled
          controls.update()
          console.log('[MapAPI] Controls re-enabled')
        }

        // Re-enable controls updates in render loop
        this.state.isCameraAnimating = false

        console.log('[MapAPI] Camera animation completed')
        console.log('[MapAPI] Final position:', camera.position)
        console.log('[MapAPI] Final target:', controls?.target)
      }
    }

    animate()
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

  // ==================== Feature Flag Methods ====================

  /**
   * Toggle building labels visibility
   */
  setBuildingLabelsVisible(visible: boolean): void {
    this.labelManager.setBuildingLabelsVisible(visible)
  }

  /**
   * Toggle node labels visibility (dev feature)
   */
  setNodeLabelsVisible(visible: boolean): void {
    if (!this.state.mapData) return

    if (visible) {
      const nodesMap = new Map<number, NodeDTO>()
      this.state.mapData.nodes.forEach((node) => nodesMap.set(node.id, node))
      this.labelManager.createNodeLabels(nodesMap)
    } else {
      this.labelManager.clearNodeLabels()
    }
  }

  /**
   * Toggle graph nodes visibility (dev feature)
   */
  setGraphNodesVisible(visible: boolean): void {
    if (!this.state.mapData) return

    if (visible) {
      this.graphRenderer.renderNodes(this.state.mapData.nodes)
    } else {
      this.graphRenderer.clearNodes()
    }
  }

  /**
   * Toggle graph edges visibility (dev feature)
   */
  setGraphEdgesVisible(visible: boolean): void {
    if (!this.state.mapData) return

    if (visible) {
      const nodesMap = new Map<number, NodeDTO>()
      this.state.mapData.nodes.forEach((node) => nodesMap.set(node.id, node))
      this.graphRenderer.renderEdges(this.state.mapData.edges, nodesMap)
    } else {
      this.graphRenderer.clearEdges()
    }
  }

  /**
   * Refresh and reapply all feature flags
   * Call this after changing feature flags to see changes without page reload
   */
  refreshFeatureFlags(): void {
    if (!this.state.mapData) {
      console.warn('[MapAPI] Cannot refresh feature flags: map data not loaded')
      return
    }

    console.log('[MapAPI] Refreshing feature flags...')

    const nodesMap = new Map<number, NodeDTO>()
    this.state.mapData.nodes.forEach((node) => nodesMap.set(node.id, node))

    // Clear everything first
    this.labelManager.clearNodeLabels()
    this.graphRenderer.clearNodes()
    this.graphRenderer.clearEdges()

    // Reapply based on current flags
    this.applyFeatureFlags(nodesMap)

    console.log('[MapAPI] Feature flags refreshed!')
  }
}
