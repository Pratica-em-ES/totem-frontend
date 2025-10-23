import * as THREE from 'three'
import type { MapState, BuildingDTO } from '../types'
import type { RendererManager } from '../core/RendererManager'
import { featureFlags } from '@/config/featureFlags'

/**
 * Manages building highlighting with outline effects and material changes
 */
export class BuildingHighlighter {
  // Legacy Color Change Style (changeBuildingColor method)
  static HIGHLIGHT_COLOR = 0xff0000                  // Red (hex color)
  static MATERIAL_METALNESS = 0                      // Metalness (0-1)
  static MATERIAL_ROUGHNESS = 0.5                    // Roughness (0-1)

  // Note: Outline effect is configured in RendererManager (OutlinePass)
  // To customize outline: see RendererManager.ts

  private state: MapState
  private rendererManager: RendererManager
  private originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>()

  constructor(state: MapState, rendererManager: RendererManager) {
    this.state = state
    this.rendererManager = rendererManager
  }

  /**
   * Highlight a building by ID or name
   */
  highlightBuilding(buildingId: number | string): void {
    // Check if highlighting is enabled
    if (!featureFlags.enableBuildingHighlight) {
      console.log('[BuildingHighlighter] Highlighting disabled by feature flag')
      return
    }

    const id = this.resolveBuildingId(buildingId)
    if (id === null) {
      console.warn('Building not found:', buildingId)
      return
    }

    // Clear previous highlight
    this.clearHighlight()

    // Set current highlight
    this.state.highlightedBuildingId = id

    // Apply visual effects
    this.applyOutlineEffect(id)
    this.highlightBuildingNode(id)
  }

  /**
   * Clear all highlights
   */
  clearHighlight(): void {
    if (this.state.highlightedBuildingId === null) return

    // Clear outline effect
    this.rendererManager.clearOutline()

    // Clear node highlight
    this.state.highlightedNodeId = null

    // Reset highlighted building
    this.state.highlightedBuildingId = null
  }

  /**
   * Highlight multiple buildings
   */
  highlightMultiple(buildingIds: Array<number | string>): void {
    // For now, just highlight the first one
    // In the future, this could support multi-select
    if (buildingIds.length > 0) {
      this.highlightBuilding(buildingIds[0])
    }
  }

  /**
   * Get the currently highlighted building
   */
  getHighlightedBuilding(): BuildingDTO | null {
    if (this.state.highlightedBuildingId === null || !this.state.mapData) {
      return null
    }

    const building = this.state.mapData.buildings.find(
      (b) => b.id === this.state.highlightedBuildingId
    )

    return building || null
  }

  /**
   * Change building material color (legacy method)
   */
  changeBuildingColor(buildingName: string, color: number): void {
    const model = this.state.loadedModels.get(buildingName)
    if (!model) {
      console.warn('Model not found:', buildingName)
      return
    }

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh

        // Save original material if not already saved
        if (!this.originalMaterials.has(mesh)) {
          this.originalMaterials.set(mesh, mesh.material)
        }

        // Apply new colored material
        mesh.material = new THREE.MeshStandardMaterial({
          color,
          metalness: BuildingHighlighter.MATERIAL_METALNESS,
          roughness: BuildingHighlighter.MATERIAL_ROUGHNESS
        })
      }
    })
  }

  /**
   * Restore original building material color
   */
  restoreBuildingColor(buildingName: string): void {
    const model = this.state.loadedModels.get(buildingName)
    if (!model) {
      console.warn('Model not found:', buildingName)
      return
    }

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        const originalMaterial = this.originalMaterials.get(mesh)

        if (originalMaterial) {
          mesh.material = originalMaterial
          this.originalMaterials.delete(mesh)
        }
      }
    })
  }

  /**
   * Apply outline effect to a building
   */
  private applyOutlineEffect(buildingId: number): void {
    const buildingModel = this.state.buildingIdToModelMap.get(buildingId)
    if (!buildingModel) return

    // Collect all meshes from the model
    const meshes: THREE.Object3D[] = []
    buildingModel.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        meshes.push(child)
      }
    })

    // Apply outline to all meshes
    this.rendererManager.setOutlinedObjects(meshes)
  }

  /**
   * Highlight the node associated with a building
   */
  private highlightBuildingNode(buildingId: number): void {
    const nodeId = this.state.buildingIdToNodeIdMap.get(buildingId)
    if (nodeId !== undefined) {
      this.state.highlightedNodeId = nodeId
    }
  }

  /**
   * Resolve building ID from either ID number or name string
   */
  private resolveBuildingId(buildingId: number | string): number | null {
    if (typeof buildingId === 'number') {
      return buildingId
    }

    // Convert name to ID
    const id = this.state.buildingNameToIdMap.get(buildingId)
    return id !== undefined ? id : null
  }

  /**
   * Legacy method: highlight model by name (red material)
   */
  highlightModelByName(modelName: string): void {
    this.changeBuildingColor(modelName, BuildingHighlighter.HIGHLIGHT_COLOR)
  }

  /**
   * Legacy method: unhighlight model by name
   */
  unhighlightModelByName(modelName: string): void {
    this.restoreBuildingColor(modelName)
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.originalMaterials.clear()
    this.clearHighlight()
  }
}
