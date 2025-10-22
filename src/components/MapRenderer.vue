<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import mapService from '@/services/mapService'
import { useSelectedBuilding } from '@/composables/useSelectedBuilding'

const container = ref<HTMLDivElement | null>(null)
const { selectedBuildingId } = useSelectedBuilding()

// Click handler para o canvas
const handleClick = (event: MouseEvent) => {
  if (!container.value) return
  mapService.handleCanvasClick(event, container.value)
}

onMounted(async () => {
  if (!container.value) return
  mapService.mount(container.value)
  // Inicia carregamento da cena (executa apenas uma vez no service)
  mapService.loadSceneFromUrl()

  // Adicionar event listener para cliques
  container.value.addEventListener('click', handleClick)

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

  // Remover event listener
  container.value.removeEventListener('click', handleClick)

  mapService.unmount(container.value)
})

// Watch for changes in selected building and update node colors
watch(selectedBuildingId, (newBuildingId) => {
  mapService.highlightBuildingNode(newBuildingId)
})
</script>

<template>
  <div id="map-container" ref="container" class="three-box"></div>
</template>

<style scoped>
.three-box { position: relative; width:100%; height:100%; overflow:hidden; border-radius:16px }
</style>
