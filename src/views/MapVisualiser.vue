<script setup>
import { ref, onMounted } from 'vue';
import MapRenderer from '@/components/MapRenderer.vue';
import { MapAPI } from '@/services/map/MapAPI';

const mapAPI = ref<MapAPI | null>(null);

onMounted(() => {
  // Access the global mapAPI instance after it's been set by MapRenderer
  const checkMapAPI = () => {
    if (window.mapAPI) {
      mapAPI.value = window.mapAPI;
    } else {
      setTimeout(checkMapAPI, 100);
    }
  };
  checkMapAPI();
});

const resetCamera = () => {
  console.log('Botão de reset clicado!');
  
  if (mapAPI.value) {
    console.log('Usando mapAPI local');
    mapAPI.value.resetCamera();
  } else if (window.mapAPI) {
    console.log('Usando window.mapAPI');
    window.mapAPI.resetCamera();
  } else {
    console.warn('MapAPI não disponível');
    console.log('mapAPI.value:', mapAPI.value);
    console.log('window.mapAPI:', window.mapAPI);
  }
};
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
  
  .reset-button {
    position: fixed !important;
    top: 20px !important;
    right: 2.5% !important;
    background-color: #c9a352 !important;
    color: white !important;
    border: 2px solid red !important; /* Borda vermelha para debug */
    border-radius: 4px !important;
    padding: 12px 24px !important;
    font-size: 16px !important;
    cursor: pointer !important;
    font-weight: bold !important;
    z-index: 9999 !important; /* Valor muito alto para garantir que fique acima de tudo */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
    transition: all 0.2s ease !important;
    opacity: 1 !important;
    visibility: visible !important;
  }
  
  .reset-button:hover {
    background-color: #b3924a;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .reset-button:active {
    transform: translateY(0);
  }

.background {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #ffffff;
  overflow: hidden;
}

.controls-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 0;
  z-index: 10000;
  pointer-events: none;
}

.controls-container > * {
  pointer-events: auto;
}

</style>

<template>
  <main class="background">
    <div class="controls-container">
      <button class="reset-button" @click="resetCamera">
        Resetar Visualização
      </button>
    </div>
    <div class="map-renderer-style">
      <MapRenderer />
    </div>
  </main>
</template>
