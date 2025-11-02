import * as THREE from 'three'
import type { IMapAPI, MapState, MapBuildingDTO, NodeDTO } from './types'
import { SceneManager } from './core/SceneManager'
import { RendererManager } from './core/RendererManager'
import { ControlsManager } from './core/ControlsManager'
import { LoaderManager } from './core/LoaderManager'
import { BuildingHighlighter } from './features/BuildingHighlighter'
import { RouteTracer } from './features/RouteTracer'
import { LabelManager } from './features/LabelManager'
import { GroundRenderer } from './features/GroundRenderer'
import { GraphRenderer } from './features/GraphRenderer'
import { CurrentLocationMarker } from './features/CurrentLocationMarker'
import { MapDataLoader } from './utils/MapDataLoader'
import { RaycastHandler } from './utils/RaycastHandler'
import { featureFlags } from '@/config/featureFlags'
import { emitCameraSet, onCameraSet, getLastCamera } from './core/SyncBus'

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
  private currentLocationMarker: CurrentLocationMarker
  private mapDataLoader: MapDataLoader
  private raycastHandler: RaycastHandler
  private initialized = false
  private currentLocationNodeId: number | null = null
  private currentAnimationFrame: number | null = null
  private currentAnimationPromise: Promise<void> | null = null

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
      isCameraAnimating: false,
      initialCameraPosition: null
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
    this.currentLocationMarker = new CurrentLocationMarker(this.state)
    this.mapDataLoader = new MapDataLoader()
    this.raycastHandler = new RaycastHandler(this.state)

    // Sync setup
    this.state.instanceId = Math.random().toString(36).slice(2)
    onCameraSet(({ position, target, sourceId }) => {
      if (sourceId === this.state.instanceId) return
      const controls = this.controlsManager.getControls()
      if (!this.state.camera || !controls) return
      this.state.isApplyingSync = true
      this.state.camera.position.set(position.x, position.y, position.z)
      controls.target.set(target.x, target.y, target.z)
      controls.update()
      this.state.isApplyingSync = false
    })
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

    const controls = this.controlsManager.getControls()
    // Read last known camera state once per mount
    const last = getLastCamera()
    // If there is a last known camera from another instance, adopt it immediately
    if (last && this.state.camera && controls) {
      this.state.isApplyingSync = true
      this.state.initialCameraPosition = {
        position: new THREE.Vector3(last.position.x, last.position.y, last.position.z),
        target: new THREE.Vector3(last.target.x, last.target.y, last.target.z)
      }
      this.state.camera.position.set(last.position.x, last.position.y, last.position.z)
      controls.target.set(last.target.x, last.target.y, last.target.z)
      controls.update()
      this.state.isApplyingSync = false
    }

    if (controls) {
      controls.addEventListener('change', () => {
        if (this.state.isApplyingSync) return
        if (!this.state.camera || !controls) return
        const p = this.state.camera.position
        const t = controls.target
        emitCameraSet({ x: p.x, y: p.y, z: p.z }, { x: t.x, y: t.y, z: t.z }, this.state.instanceId!)
      })
    }

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

    // Load map data and save initial camera position
    await this.loadMapData()
    this.controlsManager.saveInitialPosition()
    // Emit initial camera state only if there is no previously known camera
    if (!last) {
      const controlsForEmit = this.controlsManager.getControls()
      if (this.state.camera && controlsForEmit) {
        const p = this.state.camera.position
        const t = controlsForEmit.target
        emitCameraSet({ x: p.x, y: p.y, z: p.z }, { x: t.x, y: t.y, z: t.z }, this.state.instanceId!)
      }
    }
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
    this.currentLocationMarker.dispose()
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
    buildings: MapBuildingDTO[],
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

        // Create label (with pin if this is current location)
        const isCurrentLocation = this.currentLocationNodeId === building.nodeId
        this.labelManager.createBuildingLabel(building.name, model, ['tecnopuc'], isCurrentLocation)
      } catch (error) {
        console.error(`Failed to load building: ${building.name}`, error)
      }
    }
  }
  
  /**
   * Get the currently highlighted building
   */
  getHighlightedBuilding(): MapBuildingDTO | null {
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
   * Trace a route from one node to another by fetching from backend
   * This is the main entry point for route tracing
   */
  async traceRouteByNodeIds(fromNodeId: number, toNodeId: number): Promise<void> {
    try {
      console.log('[MapAPI] Fetching route from:', fromNodeId, 'to:', toNodeId)

      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'
      const response = await fetch(
        `${API_BASE_URL}/routes?fromNodeId=${fromNodeId}&toNodeId=${toNodeId}`
      )

      if (!response.ok) {
        console.error('[MapAPI] Failed to fetch route, status:', response.status)
        if (response.status === 404) {
          console.warn('[MapAPI] No route found between nodes')
        }
        return
      }

      const nodeIds: number[] = await response.json()
      console.log('[MapAPI] Route received:', nodeIds)

      if (nodeIds.length === 0) {
        console.warn('[MapAPI] Empty route received')
        return
      }

      // Clear existing route first
      this.clearRoute()

      // Small delay to ensure route is cleared
      await new Promise(resolve => setTimeout(resolve, 50))

      // Trace the new route
      this.traceRoute(nodeIds)

      // Animate to top-down view and wait for it to complete
      await this.animateToTopDownView(2000)

      console.log('[MapAPI] Route traced and animated successfully')
    } catch (error) {
      console.error('[MapAPI] Error fetching/tracing route:', error)
    }
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
  getBuildingByName(name: string): MapBuildingDTO | null {
    if (!this.state.mapData) return null
    return this.state.mapData.buildings.find((b) => b.name === name) || null
  }

  /**
   * Get building by ID
   */
  getBuildingById(id: number): MapBuildingDTO | null {
    if (!this.state.mapData) return null
    return this.state.mapData.buildings.find((b) => b.id === id) || null
  }

  /**
   * Get all buildings
   */
  getAllBuildings(): MapBuildingDTO[] {
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
   * Returns a promise that resolves when animation completes
   */
  animateToTopDownView(duration: number = 1500): Promise<void> {
    // Return existing promise if animation is already running
    if (this.currentAnimationPromise) {
      console.log('[MapAPI] Animation already in progress, returning existing promise')
      return this.currentAnimationPromise
    }

    // Check if camera animation is enabled
    if (!featureFlags.enableCameraAnimation) {
      console.log('[MapAPI] Camera animation disabled by feature flag')
      return Promise.resolve()
    }

    if (!this.state.camera) {
      console.warn('[MapAPI] Camera not initialized')
      return Promise.resolve()
    }

    // Cancel any ongoing animation frame
    if (this.currentAnimationFrame !== null) {
      console.log('[MapAPI] Cancelling previous animation frame:', this.currentAnimationFrame)
      cancelAnimationFrame(this.currentAnimationFrame)
      this.currentAnimationFrame = null
    }

    const camera = this.state.camera
    const controls = this.controlsManager.getControls()

    const targetPosition = new THREE.Vector3(0, 600, 0) // Top-down maximum zoom out
    const targetUp = new THREE.Vector3(0, 1, 0) // Upright orientation
    const centerTarget = new THREE.Vector3(0, 0, 0) // Always look at center

    // Check if already at target position (within threshold)
    const positionThreshold = 5 // 5 units tolerance
    const upThreshold = 0.01 // Very small tolerance for up vector
    const isAtTargetPosition = camera.position.distanceTo(targetPosition) < positionThreshold
    const isUpright = camera.up.distanceTo(targetUp) < upThreshold

    if (isAtTargetPosition && isUpright) {
      console.log('[MapAPI] Camera already at target position, skipping animation')

      // Ensure controls are looking at center
      if (controls) {
        controls.target.copy(centerTarget)
        controls.update()
      }

      return Promise.resolve()
    }

    console.log('[MapAPI] Starting camera animation...')
    console.log('[MapAPI] Initial position:', camera.position)
    console.log('[MapAPI] Target position:', targetPosition)

    // Completely disable controls during animation
    const wasEnabled = controls ? controls.enabled : false
    if (controls) {
      controls.enabled = false
      console.log('[MapAPI] Controls disabled for animation')
    }

    const startPosition = camera.position.clone()
    const startQuaternion = camera.quaternion.clone()

    // Use Euler angles for explicit control
    // For top-down view with north up:
    // - Pitch (X): -90° (looking straight down)
    // - Yaw (Y): 0° (north direction)
    // - Roll (Z): 0° (no tilt)
    // Order: YXZ is important for proper gimbal behavior

    const targetEuler = new THREE.Euler(-Math.PI / 2, 0, 0, 'YXZ')
    const targetQuaternion = new THREE.Quaternion().setFromEuler(targetEuler)

    console.log('[MapAPI] Start quaternion:', startQuaternion)
    console.log('[MapAPI] Target Euler angles (degrees): pitch=-90, yaw=0, roll=0')
    console.log('[MapAPI] Target quaternion:', targetQuaternion)

    const startTime = Date.now()

    // Easing function for smooth animation (ease-in-out)
    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    // Wrap animation in a promise
    this.currentAnimationPromise = new Promise<void>((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime
        const rawProgress = Math.min(elapsed / duration, 1)
        const progress = easeInOutCubic(rawProgress)

        // Simultaneously interpolate BOTH position AND rotation smoothly
        // This ensures camera rotates to correct orientation while moving

        // 1. Interpolate position (move to top-down location)
        camera.position.lerpVectors(startPosition, targetPosition, progress)

        // 2. Interpolate rotation using spherical linear interpolation (slerp)
        //    This smoothly transitions the camera orientation (rotation + up vector)
        //    while maintaining the look-at-center throughout
        camera.quaternion.slerpQuaternions(startQuaternion, targetQuaternion, progress)

        // 3. Update camera matrices to apply changes
        camera.updateMatrix()
        camera.updateMatrixWorld()

        // 4. Keep controls centered
        if (controls) {
          controls.target.copy(centerTarget)
          controls.update()
        }

        if (rawProgress < 1) {
          this.currentAnimationFrame = requestAnimationFrame(animate)
        } else {
          // Animation complete - clear state
          this.currentAnimationFrame = null
          this.currentAnimationPromise = null

          // Re-enable controls
          if (controls) {
            controls.target.copy(centerTarget)
            controls.enabled = wasEnabled
            controls.update()
            console.log('[MapAPI] Controls re-enabled, focused on center')
          }

          console.log('[MapAPI] Camera animation completed')
          console.log('[MapAPI] Final position:', camera.position)
          console.log('[MapAPI] Final up vector:', camera.up)
          console.log('[MapAPI] Focused on:', centerTarget)

          // Resolve promise
          resolve()
        }
      }

      // Start animation
      this.currentAnimationFrame = requestAnimationFrame(animate)
    })

    return this.currentAnimationPromise
  }

  /**
   * Check if map is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Reset the camera to the initial position
   * @param animate Whether to animate the transition (default: true)
   */
  resetCamera(animate = true): void {
    if (!this.initialized) {
      console.warn('Mapa não inicializado')
      return
    }
    this.controlsManager.resetToInitialPosition(animate)
  }

  /**
   * Define the initial camera position and target. Should be called before mount.
   */
  setInitialCamera(
    position: { x: number; y: number; z: number },
    target: { x: number; y: number; z: number }
  ): void {
    this.state.initialCameraPosition = {
      position: new THREE.Vector3(position.x, position.y, position.z),
      target: new THREE.Vector3(target.x, target.y, target.z)
    }

    // If already initialized and we have camera/controls, apply immediately
    const controls = this.controlsManager.getControls()
    if (this.state.camera && controls) {
      this.state.camera.position.set(position.x, position.y, position.z)
      controls.target.set(target.x, target.y, target.z)
      controls.update()
    }
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

  // ==================== Current Location Marker Methods ====================

  /**
   * Show the current location marker at a specific node
   * This will mark the building at this node with a red pin in its label
   */
  showCurrentLocationMarker(nodeId: number): void {
    this.currentLocationNodeId = nodeId

    // If map is already loaded, we need to reload buildings to show the pin
    // Otherwise, the pin will be shown when buildings are loaded
    if (this.state.mapData && this.initialized) {
      console.log('[MapAPI] Current location set to node', nodeId, '- reload map to see pin in label')
    }
  }

  /**
   * Hide the current location marker
   */
  hideCurrentLocationMarker(): void {
    this.currentLocationMarker.clearMarker()
  }

  /**
   * Set current location marker visibility
   */
  setCurrentLocationMarkerVisible(visible: boolean): void {
    this.currentLocationMarker.setVisible(visible)
  }
}
