import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { MapState, ControlsConfig } from '../types'

/**
 * Manages camera controls for the map
 */
export class ControlsManager {
  private state: MapState
  private controls: OrbitControls | null = null

  // Static variables to store camera positions across instances
  private static originalPosition: { position: THREE.Vector3; target: THREE.Vector3 } | null = null
  private static currentPosition: { position: THREE.Vector3; target: THREE.Vector3 } | null = null

  constructor(state: MapState) {
    this.state = state
  }

  /**
   * Initialize orbit controls
   */
  initialize(config: ControlsConfig = {}): void {
    if (!this.state.camera || !this.state.renderer) {
      throw new Error('Camera and renderer must be initialized before controls')
    }

    this.controls = new OrbitControls(
      this.state.camera,
      this.state.renderer.domElement
    )

    this.configure(config)

    // Add event listener to track camera position changes
    this.controls.addEventListener('change', () => {
      if (this.state.camera && this.controls) {
        ControlsManager.currentPosition = {
          position: this.state.camera.position.clone(),
          target: this.controls.target.clone()
        }
      }
    })
  }

  /**
   * Configure control parameters
   */
  configure(config: ControlsConfig): void {
    if (!this.controls) return

    const {
      enablePan = false,
      enableDamping = true,
      minDistance = 120,
      maxDistance = 600,
      maxPolarAngle = Math.PI / 2 - 0.1
    } = config

    this.controls.enablePan = enablePan
    this.controls.enableDamping = enableDamping
    this.controls.minDistance = minDistance
    this.controls.maxDistance = maxDistance
    this.controls.maxPolarAngle = maxPolarAngle

    if (enableDamping) {
      this.controls.dampingFactor = 0.05
    }
  }

  /**
   * Update controls (call in render loop if damping is enabled)
   * FIX: Evitar que a câmera passe exatamente pelo ponto do target,
   * deslocando levemente o target se necessário para prevenir singularidade
   */
  update(): void {
    if (this.controls && this.controls.enableDamping) {
      // FIX: Proteção contra singularidade - evitar que câmera cruze exatamente o target
      // Quando distance < 0.1, desloca o target levemente em Y para evitar vetor direção zero
      const distanceToTarget = this.state.camera
        ? this.state.camera.position.distanceTo(this.controls.target)
        : Infinity

      if (distanceToTarget < 0.1) {
        // Deslocar o target levemente para evitar singularidade matemática
        const originalTargetY = this.controls.target.y
        this.controls.target.y += 0.01
        this.controls.update()
        // Restaurar Y original para não afetar comportamento geral
        this.controls.target.y = originalTargetY
      } else {
        this.controls.update()
      }
    }
  }

  /**
   * Get the controls instance
   */
  getControls(): OrbitControls | null {
    return this.controls
  }

  /**
   * Save the initial camera position and target
   * Using fixed values to ensure consistent behavior
   */
  saveInitialPosition() {
    if (!this.state.camera || !this.controls) {
      console.warn('Camera or controls not initialized when saving initial position');
      return;
    }

    // Set original position only if it hasn't been set before (first instance)
    if (!ControlsManager.originalPosition) {
      const initialPosition = this.state.initialCameraPosition?.position ?? new THREE.Vector3(-250, 300, 200);
      const initialTarget = this.state.initialCameraPosition?.target ?? new THREE.Vector3(0, 0, 0);

      ControlsManager.originalPosition = {
        position: initialPosition.clone(),
        target: initialTarget.clone()
      };

      ControlsManager.currentPosition = {
        position: initialPosition.clone(),
        target: initialTarget.clone()
      };
    }

    // Use current position if available (subsequent instances)
    const positionToUse = ControlsManager.currentPosition || ControlsManager.originalPosition;

    this.state.camera.position.copy(positionToUse!.position);
    this.controls.target.copy(positionToUse!.target);
    this.controls.update();
  }

  /**
   * Reset the camera to the initial position and target
   */
  resetToInitialPosition(animate = true) {
    if (!this.controls || !this.state.camera) {
      console.warn('Cannot reset camera: missing controls or camera');
      return;
    }

    // FIX: Usar a mesma posição inicial para evitar quebra abrupta
    // Posição isométrica/3D com boa visão do mapa
    const resetPosition = new THREE.Vector3(1000, 500, -600);
    const resetTarget = new THREE.Vector3(0, 0, 0);

    if (animate) {
      // Smooth animation to reset position
      const duration = 1000; // 1 second
      const startTime = Date.now();
      const startPosition = this.state.camera.position.clone();
      const startTarget = this.controls.target.clone();

      const animateStep = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease in-out function for smooth animation
        const t = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        // Interpolate position and target
        this.controls!.target.lerpVectors(startTarget, resetTarget, t);
        this.state.camera!.position.lerpVectors(startPosition, resetPosition, t);
        
        // Fixar o up vector durante a animação
        this.state.camera!.up.set(0, 1, 0);

        if (progress < 1) {
          requestAnimationFrame(animateStep);
        } else {
          // Ensure we end up exactly at the reset position
          this.controls!.target.copy(resetTarget);
          this.state.camera!.position.copy(resetPosition);
          this.state.camera!.up.set(0, 1, 0);
          this.controls!.update();

          // Update current position after reset
          ControlsManager.currentPosition = {
            position: resetPosition.clone(),
            target: resetTarget.clone()
          };
        }
      };

      animateStep();
    } else {
      // Instant transition
      this.controls.target.copy(resetTarget);
      this.state.camera.position.copy(resetPosition);
      this.state.camera.up.set(0, 1, 0);
      this.controls.update();

      // Update current position after reset
      ControlsManager.currentPosition = {
        position: resetPosition.clone(),
        target: resetTarget.clone()
      };
    }
  }

  /**
   * Cleanup
   */
  dispose(): void {
    if (this.controls) {
      this.controls.dispose()
      this.controls = null
    }
  }
}
