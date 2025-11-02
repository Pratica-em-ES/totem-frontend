<script setup lang="ts">
import SideMenu from '@/components/SideMenu.vue'
import SearchBar from '@/components/SearchBar.vue'
import MapRenderer from '@/components/MapRenderer.vue'
import ResetCameraButton from '@/components/ResetCameraButton.vue'

defineOptions({
  name: 'HomeView'
})

function onSearch(payload: { query: string; category: string }) {
  console.log('Home search:', payload)
  // TODO: wire to store or API
}
</script>

<template>
  <main class="screen">
    <SideMenu />
    <section class="content" aria-label="Início">
      <SearchBar @search="onSearch" />
      <div class="map-container">
        <MapRenderer />
        <ResetCameraButton />
      </div>
      <div class="bottom-spacer"></div>
    </section>
  </main>
</template>

<style scoped>
.screen {
  height: 100dvh;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.25rem;
  padding: 1rem 1.25rem;
  overflow: hidden;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
}

.map-container {
  flex: 1;
  min-height: 0;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.bottom-spacer {
  height: 1rem;
  flex-shrink: 0;
}
</style>
