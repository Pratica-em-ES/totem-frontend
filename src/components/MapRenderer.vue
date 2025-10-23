<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { MapAPI } from '@/services/map/MapAPI'
import { useCurrentLocation } from '@/composables/useCurrentLocation'

const container = ref<HTMLDivElement | null>(null)
const mapAPI = new MapAPI()
const { currentLocation } = useCurrentLocation()

onMounted(async () => {
  if (!container.value) return

  // Set current location BEFORE mounting (so buildings load with pin)
  mapAPI.showCurrentLocationMarker(currentLocation.nodeId)
  console.log('[MapRenderer] Current location set to node', currentLocation.nodeId)

  // Mount and initialize map
  await mapAPI.mount(container.value)

  // Expose mapAPI globally for LocationSearch
  // @ts-ignore
  window.mapAPI = mapAPI

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
