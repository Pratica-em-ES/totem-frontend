import * as THREE from 'three'
import type { MapState, EdgeDTO, NodeDTO } from '../types'

/**
 * Manages ground rendering with street and grass textures
 */
export class GroundRenderer {
  private state: MapState
  private worldSize = 90
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
    const roadTexture = await this.loadTexture('textures/cobblestone.jpg')
    roadTexture.wrapS = roadTexture.wrapT = THREE.RepeatWrapping
    roadTexture.repeat.set(this.worldSize / 4, this.worldSize / 4)

    // Create road material
    const roadMaterial = new THREE.MeshStandardMaterial({
      map: roadTexture,
      alphaMap: roadAlphaMap,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      roughness: 0.6,
      metalness: 0.1
    })

    // Create road plane
    this.roadPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(this.worldSize, this.worldSize),
      roadMaterial
    )
    this.roadPlane.position.set(0, 0, 0)
    this.roadPlane.setRotationFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))
    this.state.scene.add(this.roadPlane)

    // Load grass texture
    const grassTexture = await this.loadTexture('textures/grass.jpg')
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping
    grassTexture.repeat.set(30, 30)
    grassTexture.anisotropy = 8

    // Create grass material
    const grassMaterial = new THREE.MeshStandardMaterial({
      map: grassTexture,
      depthWrite: false,
      side: THREE.DoubleSide,
      roughness: 0.8,
      color: 0x4caf50
    })

    // Create grass plane
    this.grassPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(this.worldSize, this.worldSize),
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
    const sizePx = 2048
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = sizePx
    const ctx = canvas.getContext('2d')

    if (ctx) {
      ctx.clearRect(0, 0, sizePx, sizePx)

      const mapToCanvas = (x: number, z: number): [number, number] => [
        ((x + this.worldSize / 2) / this.worldSize) * sizePx,
        ((z + this.worldSize / 2) / this.worldSize) * sizePx
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
        const defaultWidth = 2.5
        ctx.lineWidth = defaultWidth * (sizePx / this.worldSize)
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
