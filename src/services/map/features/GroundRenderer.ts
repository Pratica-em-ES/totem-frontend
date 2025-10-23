import * as THREE from 'three'
import type { MapState, EdgeDTO, NodeDTO } from '../types'

/**
 * Manages ground rendering with street and grass textures
 */
export class GroundRenderer {
  // World Size
  static WORLD_SIZE = 90

  // Road/Street Style
  static ROAD_TEXTURE = 'textures/cobblestone.jpg'
  static ROAD_TEXTURE_REPEAT_X = 22.5
  static ROAD_TEXTURE_REPEAT_Y = 22.5
  static ROAD_ROUGHNESS = 0.6
  static ROAD_METALNESS = 0.1
  static ROAD_WIDTH = 2.5
  static ROAD_COLOR = 'rgba(223, 223, 223, 1)'

  // Grass Style
  static GRASS_TEXTURE = 'textures/grass.jpg'
  static GRASS_TEXTURE_REPEAT_X = 30
  static GRASS_TEXTURE_REPEAT_Y = 30
  static GRASS_ANISOTROPY = 8
  static GRASS_ROUGHNESS = 0.8
  static GRASS_COLOR = 'rgba(114, 196, 82, 1)'

  // Alpha Map Generation
  static ALPHA_MAP_SIZE = 2048

  private state: MapState
  private roadPlane: THREE.Mesh | null = null
  private grassPlane: THREE.Mesh | null = null

  constructor(state: MapState) {
    this.state = state
  }

  /**
   * Load and render the ground (streets + grass)
   */
  async loadGround(streets: EdgeDTO[], nodesMap: Map<number, NodeDTO>): Promise<void> {
    if (!this.state.scene) return

    // Create road alpha map from street edges
    const roadAlphaMap = this.createRoadAlphaMap(streets, nodesMap)

    // Load road texture
    const roadTexture = await this.loadTexture(GroundRenderer.ROAD_TEXTURE)
    roadTexture.wrapS = roadTexture.wrapT = THREE.RepeatWrapping
    roadTexture.repeat.set(GroundRenderer.ROAD_TEXTURE_REPEAT_X, GroundRenderer.ROAD_TEXTURE_REPEAT_Y)

    // Create road material (grayscale texture colored by ROAD_COLOR)
    const roadMaterial = new THREE.MeshStandardMaterial({
      map: roadTexture,
      alphaMap: roadAlphaMap,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      roughness: GroundRenderer.ROAD_ROUGHNESS,
      metalness: GroundRenderer.ROAD_METALNESS,
      color: GroundRenderer.ROAD_COLOR
    })

    // Create road plane
    this.roadPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(GroundRenderer.WORLD_SIZE, GroundRenderer.WORLD_SIZE),
      roadMaterial
    )
    this.roadPlane.position.set(0, 0, 0)
    this.roadPlane.setRotationFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))
    this.state.scene.add(this.roadPlane)

    // Load grass texture
    const grassTexture = await this.loadTexture(GroundRenderer.GRASS_TEXTURE)
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping
    grassTexture.repeat.set(GroundRenderer.GRASS_TEXTURE_REPEAT_X, GroundRenderer.GRASS_TEXTURE_REPEAT_Y)
    grassTexture.anisotropy = GroundRenderer.GRASS_ANISOTROPY

    // Create grass material (grayscale texture colored by GRASS_COLOR)
    const grassMaterial = new THREE.MeshStandardMaterial({
      map: grassTexture,
      depthWrite: false,
      side: THREE.DoubleSide,
      roughness: GroundRenderer.GRASS_ROUGHNESS,
      color: GroundRenderer.GRASS_COLOR
    })

    // Create grass plane
    this.grassPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(GroundRenderer.WORLD_SIZE, GroundRenderer.WORLD_SIZE),
      grassMaterial
    )
    this.grassPlane.position.set(0, 0, 0)
    this.grassPlane.receiveShadow = true
    this.grassPlane.setRotationFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))
    this.state.scene.add(this.grassPlane)
  }

  /**
   * Create alpha map for roads from street edges
   */
  private createRoadAlphaMap(
    streets: EdgeDTO[],
    nodesMap: Map<number, NodeDTO>
  ): THREE.CanvasTexture {
    const sizePx = GroundRenderer.ALPHA_MAP_SIZE
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = sizePx
    const ctx = canvas.getContext('2d')

    if (ctx) {
      ctx.clearRect(0, 0, sizePx, sizePx)

      const mapToCanvas = (x: number, z: number): [number, number] => [
        ((x + GroundRenderer.WORLD_SIZE / 2) / GroundRenderer.WORLD_SIZE) * sizePx,
        ((z + GroundRenderer.WORLD_SIZE / 2) / GroundRenderer.WORLD_SIZE) * sizePx
      ]

      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = 'rgba(255,255,255,1)'

      streets.forEach((edge) => {
        const nodeA = nodesMap.get(edge.aNodeId)
        const nodeB = nodesMap.get(edge.bNodeId)

        if (!nodeA || !nodeB) {
          console.warn(
            `Edge ${edge.id}: Missing nodes - aNodeId: ${edge.aNodeId}, bNodeId: ${edge.bNodeId}`
          )
          return
        }

        // Calculate proportional street width
        ctx.lineWidth = GroundRenderer.ROAD_WIDTH * (sizePx / GroundRenderer.WORLD_SIZE)
        ctx.beginPath()

        const [px1, pz1] = mapToCanvas(nodeA.x, nodeA.y)
        const [px2, pz2] = mapToCanvas(nodeB.x, nodeB.y)

        ctx.moveTo(px1, pz1)
        ctx.lineTo(px2, pz2)
        ctx.stroke()
      })
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping
    texture.needsUpdate = true

    return texture
  }

  /**
   * Load a texture from a path
   */
  private async loadTexture(path: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader()
      loader.load(
        path,
        (texture) => resolve(texture),
        undefined,
        (error) => {
          console.error(`Failed to load texture: ${path}`, error)
          reject(error)
        }
      )
    })
  }

  /**
   * Update ground based on new map data
   */
  async updateGround(streets: EdgeDTO[], nodesMap: Map<number, NodeDTO>): Promise<void> {
    this.dispose()
    await this.loadGround(streets, nodesMap)
  }

  /**
   * Cleanup
   */
  dispose(): void {
    if (!this.state.scene) return

    if (this.roadPlane) {
      this.state.scene.remove(this.roadPlane)
      this.roadPlane.geometry.dispose()
      if (this.roadPlane.material instanceof THREE.Material) {
        this.roadPlane.material.dispose()
      }
      this.roadPlane = null
    }

    if (this.grassPlane) {
      this.state.scene.remove(this.grassPlane)
      this.grassPlane.geometry.dispose()
      if (this.grassPlane.material instanceof THREE.Material) {
        this.grassPlane.material.dispose()
      }
      this.grassPlane = null
    }
  }
}
