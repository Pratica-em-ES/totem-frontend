<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router';
import { MapAPI } from '@/services/map/MapAPI'
import { useCurrentLocation } from '@/composables/useCurrentLocation'

const props = defineProps<{
  initialCamera?: {
    position: { x: number; y: number; z: number }
    target: { x: number; y: number; z: number }
  }
}>()

const container = ref<HTMLDivElement | null>(null)
const route = useRoute()
const mapAPI = new MapAPI()
const { currentLocation } = useCurrentLocation()

// Initialize global map instances registry if needed
if (!window.mapAPIInstances) {
  // @ts-ignore
  window.mapAPIInstances = new Map()
}

onMounted(async () => {
  if (!container.value) return

  if (props.initialCamera) {
    mapAPI.setInitialCamera(props.initialCamera.position, props.initialCamera.target)
  }

  // Set current location BEFORE mounting (so buildings load with pin)
  mapAPI.showCurrentLocationMarker(currentLocation.nodeId)
  console.log('[MapRenderer] Current location set to node', currentLocation.nodeId)

  // Mount and initialize map
  await mapAPI.mount(container.value)

  // Store this mapAPI instance in the registry using route name as key
  window.mapAPIInstances.set(route.name, mapAPI)
  
  // Also expose as current active mapAPI
  window.mapAPI = mapAPI
  
  // Dispara um evento global quando o mapa estiver pronto
  const event = new Event('map-ready')
  window.dispatchEvent(event)

  console.log('[MapRenderer] MapAPI initialized and exposed globally')
})

onBeforeUnmount(() => {
  mapAPI.unmount()

  // Clean up global reference
  // @ts-ignore
  window.mapAPI = undefined
})
</script>

<template>
  <div id="map-container" ref="container" class="three-box"></div>
</template>

<style scoped>
.three-box {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 16px;
}
</style>
