<script setup>
import MapRenderer from '@/components/MapRenderer.vue';
</script>

<style scoped>
:root {
  --accent-gold: #c9a352;
  --frame: #2c2c2c;
}

  /* os valores podem ser ajustados livremente */
  .map-renderer-style {
    position: fixed;
    bottom: 5%;
    right: 2.5%;
    width: 75%;
    height: 80%;
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
