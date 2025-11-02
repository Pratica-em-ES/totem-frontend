import type * as THREE from 'three'

// Simple cross-instance sync bus using BroadcastChannel when available,
// falling back to window events. Includes sourceId to avoid feedback loops.

type Vec3 = { x: number; y: number; z: number }

type CameraPayload = { position: Vec3; target: Vec3; sourceId: string }

type EventMap = {
  'camera-set': CameraPayload
}

const CHANNEL_NAME = 'map-sync-channel'

class SyncBus {
  private bc: BroadcastChannel | null = null
  private listeners: { [K in keyof EventMap]?: Array<(payload: EventMap[K]) => void> } = {}
  private lastCamera: CameraPayload | null = null

  constructor() {
    const w: any = typeof globalThis !== 'undefined' ? (globalThis as any) : undefined
    if (!w) return
    // Load last camera from storage if present
    try {
      const raw = w.localStorage?.getItem('map-sync:last-camera')
      if (raw) this.lastCamera = JSON.parse(raw)
    } catch {}
    if (typeof w.BroadcastChannel !== 'undefined') {
      this.bc = new w.BroadcastChannel(CHANNEL_NAME)
      const bc = this.bc
      if (bc) {
        bc.onmessage = (ev: MessageEvent) => {
          const { type, payload } = (ev.data as any) || {}
          this.dispatch(type as keyof EventMap, payload)
        }
      }
    } else if (typeof w.addEventListener === 'function') {
      w.addEventListener('message', (ev: MessageEvent) => {
        const { type, payload } = (ev.data as any) || {}
        this.dispatch(type as keyof EventMap, payload)
      })
    }
  }

  on<K extends keyof EventMap>(type: K, cb: (payload: EventMap[K]) => void) {
    if (!this.listeners[type]) this.listeners[type] = []
    this.listeners[type]!.push(cb)
  }

  emit<K extends keyof EventMap>(type: K, payload: EventMap[K]) {
    if (this.bc) {
      this.bc.postMessage({ type, payload })
    } else if (typeof window !== 'undefined') {
      window.postMessage({ type, payload }, '*')
    }
    this.dispatch(type, payload)
    // Persist last camera for 'camera-set'
    if (type === 'camera-set') {
      this.lastCamera = payload as any
      try {
        const w: any = typeof globalThis !== 'undefined' ? (globalThis as any) : undefined
        w?.localStorage?.setItem('map-sync:last-camera', JSON.stringify(this.lastCamera))
      } catch {}
    }
  }

  private dispatch<K extends keyof EventMap>(type: K, payload: EventMap[K]) {
    const cbs = this.listeners[type]
    if (!cbs) return
    for (const cb of cbs) cb(payload)
  }
}

export const syncBus = new SyncBus()

export function emitCameraSet(position: Vec3, target: Vec3, sourceId: string) {
  syncBus.emit('camera-set', { position, target, sourceId })
}

export function onCameraSet(cb: (payload: CameraPayload) => void) {
  syncBus.on('camera-set', cb)
}

export function getLastCamera(): CameraPayload | null {
  // Expose a read-only snapshot for consumers when mounting
  // Clone to avoid accidental external mutation
  const last = (syncBus as any).lastCamera as CameraPayload | null
  return last ? { position: { ...last.position }, target: { ...last.target }, sourceId: last.sourceId } : null
}
