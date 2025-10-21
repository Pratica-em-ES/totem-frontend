<script setup>
import MapRenderer from '@/components/MapRenderer.vue';
</script>

<style scoped>
:root {
  --accent-gold: #c9a352;
  --frame: #2c2c2c;
}
  .screen {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.25rem;
  padding: 1rem 1.25rem;
  }
  
  /* os valores podem ser ajustados livremente */
  .map-renderer-style {
    position: fixed;
    bottom: 5%;
    right: 2.5%;
    width: 77%;
    height: 81%;
    /* border: 1px solid red; */
  }

.background {
  background: #ffffff;
  min-width: 100vw;
  min-height: 100vw;
}

</style>

<template>
  <main class="background">
    <!-- paragrafo serve so para confirmar que a div nao cobre o resto da pagina -->
    <div class="map-renderer-style">
      <MapRenderer />
    </div>
  </main>
</template>
