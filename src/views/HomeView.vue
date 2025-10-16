<script setup lang="ts">
import SideMenu from '@/components/SideMenu.vue'
import SearchBar from '@/components/SearchBar.vue';
import MapRenderer from '@/components/MapRenderer.vue' // <--- import do mapa

function onSearch(payload: { query: string; category: string }) {
  console.log('Home search:', payload);
  // TODO: wire to store or API
}
</script>

<template>
  <main class="screen">
    <SideMenu />
    <section class="content" aria-label="Área principal">
      <SearchBar @search="onSearch" />

      <!-- trocar aqui: usar mesma classe do Visualiser -->
      <div class="map-renderer-style">
        <MapRenderer />
      </div>

    </section>
  </main>
</template>

<style scoped>
.screen {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.25rem;
  padding: 1rem 1.25rem;
}

.content { 
  display:flex; 
  flex-direction:column;
}

/* substituir home-map-host por estilos do Visualiser */
.map-renderer-style {
  position: fixed;
  bottom: 5%;
  right: 2.5%;
  width: 75%;
  height: 80%;
  border-radius: 12px;
  overflow: hidden;
}
</style>
