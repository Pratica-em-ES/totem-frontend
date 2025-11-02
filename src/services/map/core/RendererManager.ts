import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import type { MapState, RendererConfig, HighlightConfig } from '../types'

/**
 * Manages the WebGL renderer and post-processing effects
 */
export class RendererManager {
  private state: MapState
  private composer: EffectComposer | null = null
  private outlinePass: OutlinePass | null = null
  private animationFrameId: number | null = null
  private controlsManager: any = null

  constructor(state: MapState) {
    this.state = state
  }

  /**
   * Set controls manager reference for render loop updates
   */
  setControlsManager(controlsManager: any): void {
    this.controlsManager = controlsManager
  }

  /**
   * Initialize the renderer with the given container
   */
  initialize(container: HTMLElement, config: RendererConfig = {}): void {
    this.createRenderer(container, config)
    this.setupPostProcessing()
    this.startRenderLoop()
    this.setupResizeHandler()
    // Perform an initial resize to ensure camera/composer match the container
    this.resizeToContainer()
  }

  /**
   * Create the WebGL renderer (same as old mapService)
   */
  private createRenderer(container: HTMLElement, config: RendererConfig): void {
    const { antialias = true, shadowsEnabled = true } = config

    this.state.renderer = new THREE.WebGLRenderer({
      antialias,
      logarithmicDepthBuffer: true
    })
    this.state.renderer.setSize(container.clientWidth, container.clientHeight)
    this.state.renderer.toneMapping = THREE.ACESFilmicToneMapping
    // @ts-ignore - outputColorSpace compatibility (same as old)
    this.state.renderer.outputColorSpace = THREE.SRGBColorSpace ?? (this.state.renderer as any).outputEncoding

    if (shadowsEnabled) {
      this.state.renderer.shadowMap.enabled = true
    }

    // Set clear color to gray (same as old)
    this.state.renderer.setClearColor(0x808080, 1)

    container.appendChild(this.state.renderer.domElement)
    this.state.container = container
  }

  /**
   * Setup post-processing pipeline with outline effect
   */
  private setupPostProcessing(): void {
    if (!this.state.renderer || !this.state.scene || !this.state.camera) return

    this.composer = new EffectComposer(this.state.renderer)

    // Main render pass
    const renderPass = new RenderPass(this.state.scene, this.state.camera)
    this.composer.addPass(renderPass)

    // Outline pass for highlighting
    const width = this.state.container?.clientWidth ?? this.state.renderer.domElement.width
    const height = this.state.container?.clientHeight ?? this.state.renderer.domElement.height
    this.outlinePass = new OutlinePass(
      new THREE.Vector2(width, height),
      this.state.scene,
      this.state.camera
    )

    this.configureOutlinePass({
      outlineColor: '#00ffff',
      outlineStrength: 5.0,
      outlineGlow: 1.0,
      outlineThickness: 2.0,
      pulsePeriod: 2
    })

    this.composer.addPass(this.outlinePass)

    // Output pass
    const outputPass = new OutputPass()
    this.composer.addPass(outputPass)
  }

  /**
   * Configure the outline pass parameters
   */
  configureOutlinePass(config: HighlightConfig): void {
    if (!this.outlinePass) return

    const {
      outlineColor = '#00ffff',
      outlineStrength = 5.0,
      outlineGlow = 1.0,
      outlineThickness = 2.0,
      pulsePeriod = 2
    } = config

    this.outlinePass.edgeStrength = outlineStrength
    this.outlinePass.edgeGlow = outlineGlow
    this.outlinePass.edgeThickness = outlineThickness
    this.outlinePass.pulsePeriod = pulsePeriod
    this.outlinePass.visibleEdgeColor.set(outlineColor)
    this.outlinePass.hiddenEdgeColor.set(outlineColor)
  }

  /**
   * Set objects to be outlined
   */
  setOutlinedObjects(objects: THREE.Object3D[]): void {
    if (!this.outlinePass) return
    this.outlinePass.selectedObjects = objects
  }

  /**
   * Clear all outlined objects
   */
  clearOutline(): void {
    if (!this.outlinePass) return
    this.outlinePass.selectedObjects = []
  }

  /**
   * Start the animation/render loop
   */
  private startRenderLoop(): void {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate)
      this.render()
    }
    animate()
  }

  /**
   * Render a single frame
   */
  private render(): void {
    // Update controls only when not animating camera
    if (this.controlsManager && !this.state.isCameraAnimating) {
      this.controlsManager.update()
    }

    if (this.composer) {
      this.composer.render()
    } else if (this.state.renderer && this.state.scene && this.state.camera) {
      this.state.renderer.render(this.state.scene, this.state.camera)
    }
  }

  /**
   * Setup window resize handler with FOV adaptation (same as old mapService)
   */
  private setupResizeHandler(): void {
    const BASE_FOV = 10
    const REFERENCE_ASPECT = 16 / 9

    const handleResize = () => {
      if (!this.state.container || !this.state.renderer || !this.state.camera) return

      const width = this.state.container.clientWidth
      const height = this.state.container.clientHeight
      const currentAspect = width / height

      // Ajustar FOV baseado no aspect ratio para manter visualização consistente (same as old)
      const fovAdjustment = currentAspect / REFERENCE_ASPECT
      this.state.camera.fov = BASE_FOV * (1 / Math.sqrt(fovAdjustment))
      this.state.camera.aspect = currentAspect
      this.state.camera.updateProjectionMatrix()

      this.state.renderer.setSize(width, height)

      if (this.composer) {
        this.composer.setSize(width, height)
      }

      if (this.outlinePass) {
        this.outlinePass.resolution.set(width, height)
      }
    }

    window.addEventListener('resize', handleResize)
  }

  /**
   * Resize camera, renderer, and postprocessing to match the container
   */
  private resizeToContainer(): void {
    if (!this.state.container || !this.state.renderer || !this.state.camera) return
    const BASE_FOV = 10
    const REFERENCE_ASPECT = 16 / 9
    const width = this.state.container.clientWidth
    const height = this.state.container.clientHeight
    const currentAspect = width / height

    const fovAdjustment = currentAspect / REFERENCE_ASPECT
    this.state.camera.fov = BASE_FOV * (1 / Math.sqrt(fovAdjustment))
    this.state.camera.aspect = currentAspect
    this.state.camera.updateProjectionMatrix()

    this.state.renderer.setSize(width, height)
    if (this.composer) this.composer.setSize(width, height)
    if (this.outlinePass) this.outlinePass.resolution.set(width, height)
  }

  /**
   * Get the renderer's DOM element
   */
  getDomElement(): HTMLCanvasElement | null {
    return this.state.renderer?.domElement || null
  }

  /**
   * Stop rendering and cleanup
   */
  dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    if (this.composer) {
      this.composer.dispose()
      this.composer = null
    }

    if (this.state.renderer) {
      if (this.state.container && this.state.renderer.domElement.parentNode === this.state.container) {
        this.state.container.removeChild(this.state.renderer.domElement)
      }
      this.state.renderer.dispose()
      this.state.renderer = null
    }

    this.outlinePass = null
  }
}
