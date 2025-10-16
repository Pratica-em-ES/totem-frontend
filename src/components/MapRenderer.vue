<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import mapService from '@/services/mapService'

const container = ref<HTMLDivElement | null>(null)

onMounted(async () => {
  if (!container.value) return
  mapService.mount(container.value)
  // Inicia carregamento da cena (executa apenas uma vez no service)
  mapService.loadSceneFromUrl()
  // expor funções no window se quiser acesso no console
  // @ts-ignore
  window.highlightN = mapService.highlightN
  // @ts-ignore
  window.unhighlightN = mapService.unhighlightN
  // @ts-ignore
  window.loadedModels = mapService.loadedModels
})

onBeforeUnmount(() => {
  if (!container.value) return
  mapService.unmount(container.value)
})
</script>

<template>
  <div id="map-container" ref="container" class="three-box"></div>
</template>

<style scoped>
.three-box { position: relative; width:100%; height:100%; overflow:hidden; border-radius:16px }
</style>
