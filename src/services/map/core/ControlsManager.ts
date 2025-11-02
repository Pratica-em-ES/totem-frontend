import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { MapState, ControlsConfig } from '../types'

/**
 * Manages camera controls for the map
 */
export class ControlsManager {
  private state: MapState
  private controls: OrbitControls | null = null

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
   */
  update(): void {
    if (this.controls && this.controls.enableDamping) {
      this.controls.update()
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
    
    // Use provided initial camera if available; otherwise fall back to defaults
    const initialPosition = this.state.initialCameraPosition?.position ?? new THREE.Vector3(-250, 300, 200);
    const initialTarget = this.state.initialCameraPosition?.target ?? new THREE.Vector3(0, 0, 0);
    
    this.state.initialCameraPosition = {
      position: initialPosition,
      target: initialTarget
    };
    
    console.log('Initial camera position saved:', {
      position: initialPosition.toArray(),
      target: initialTarget.toArray()
    });
    
    // Set the initial position immediately
    this.state.camera.position.copy(initialPosition);
    this.controls.target.copy(initialTarget);
    this.controls.update();
  }

  /**
   * Reset the camera to the initial position and target
   */
  resetToInitialPosition(animate = true) {
    if (!this.state.initialCameraPosition || !this.controls || !this.state.camera) {
      console.warn('Cannot reset camera: missing initial position, controls, or camera');
      return;
    }

    const { position, target } = this.state.initialCameraPosition;
    
    console.log('Resetting camera to:', {
      position: position.toArray(),
      target: target.toArray()
    });
    
    if (animate) {
      // Smooth animation to initial position
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
        this.controls!.target.lerpVectors(startTarget, target, t);
        this.state.camera!.position.lerpVectors(startPosition, position, t);
        
        if (progress < 1) {
          requestAnimationFrame(animateStep);
        } else {
          // Ensure we end up exactly at the target
          this.controls!.target.copy(target);
          this.state.camera!.position.copy(position);
          this.controls!.update();
        }
      };
      
      animateStep();
    } else {
      // Instant transition
      this.controls.target.copy(target);
      this.state.camera.position.copy(position);
      this.controls.update();
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
