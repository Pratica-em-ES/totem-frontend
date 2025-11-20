<script setup lang="ts">
import type { MapBuildingDTO } from '@/models/MapDTO';
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';

const mapAPI = ref<any>(null);
const route = useRoute();
let checkInterval: number | null = null;

const findMapAPI = () => {
  // Tenta encontrar o mapAPI em diferentes locais
  if (window.mapAPI) {
    return window.mapAPI;
  }
  
  // Tenta encontrar o mapAPI no elemento do mapa
  const mapContainer = document.querySelector('#map-container');
  if (mapContainer && (mapContainer as any).__vue_app__?.config?.globalProperties?.$mapAPI) {
    return (mapContainer as any).__vue_app__.config.globalProperties.$mapAPI;
  }
  
  return null;
};

const startAPICheck = () => {
  if (checkInterval) {
    clearInterval(checkInterval);
  }
  
  // Tenta encontrar o mapAPI imediatamente
  const api = findMapAPI();
  if (api) {
    mapAPI.value = api;
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
    return;
  }
  
  // Se não encontrar, inicia a verificação periódica
  checkInterval = window.setInterval(() => {
    const api = findMapAPI();
    if (api) {
      mapAPI.value = api;
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
    }
  }, 100) as unknown as number;
};

onMounted(() => {
  startAPICheck();
  
  // Adiciona um listener para o evento personalizado que o MapRenderer pode disparar
  const handleMapReady = () => {
    console.log('Evento map-ready detectado');
    startAPICheck();
  };
  
  window.addEventListener('map-ready', handleMapReady);
  
  return () => {
    window.removeEventListener('map-ready', handleMapReady);
  };
});

// Observa mudanças de rota para reconectar quando necessário
watch(() => route.path, () => {
  console.log('Rota mudou, tentando reconectar ao mapAPI...');
  mapAPI.value = null;
  startAPICheck();
});

onBeforeUnmount(() => {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
  // HACK!!!! Quando highlight multiplo eh usado, trocar a view deixa a tela do mapa vazia
  let highlighted = mapAPI.value.getHighlightedBuildings() as MapBuildingDTO[] | null;
  mapAPI.value.higlightMultiple(highlighted?.map((b) => b.id));
  // end HACK!!!!
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
    console.warn('MapAPI não disponível, tentando encontrar novamente...');
    startAPICheck();
  }
};
</script>

<template>
  <button class="reset-camera-button" @click="resetCamera" aria-label="Resetar visualização do mapa">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-9 9z"></path>
      <path d="M12 3v4"></path>
      <path d="M12 17v4"></path>
      <path d="M3 12h4"></path>
      <path d="M17 12h4"></path>
      <path d="M19.07 4.93l-2.83 2.83"></path>
      <path d="M7.76 16.24l-2.83 2.83"></path>
      <path d="M19.07 19.07l-2.83-2.83"></path>
      <path d="M7.76 7.76 4.93 4.93"></path>
    </svg>
    <span>Centralizar Mapa</span>
  </button>
</template>

<style scoped>
.reset-camera-button {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #c9a352;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  z-index: 100;
  border: 2px solid transparent;
}

.reset-camera-button:hover {
  background-color: #b3924a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.reset-camera-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.reset-camera-button svg {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

/* Hide text on small screens */
@media (max-width: 480px) {
  .reset-camera-button span {
    display: none;
  }
  
  .reset-camera-button {
    padding: 0.5rem;
    border-radius: 50%;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
