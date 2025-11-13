<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCompaniesCache } from '@/composables/useCompaniesCache'
import SideMenu from '@/components/SideMenu.vue'
import MapRenderer from '@/components/MapRenderer.vue'
import LocationSearch from '@/components/LocationSearch.vue'
import ResetCameraButton from '@/components/ResetCameraButton.vue'

interface CompanyPopupInfo {
  name: string
  rooms: string
  floors: string
  building: string
  block: string
}

const route = useRoute()
const { companies, fetchCompanies } = useCompaniesCache()
const showPopup = ref(false)
const popupContent = ref('')
const companyInfo = ref<CompanyPopupInfo | null>(null)

// Load companies on mount
onMounted(async () => {
  try {
    await fetchCompanies()
    console.log('[RoutesView] Companies loaded on mount:', companies.value.length)
  } catch (error) {
    console.error('[RoutesView] Error loading companies:', error)
  }
})

// Watch for route changes to detect when a search/route is performed
watch(() => route.query, (newQuery) => {
  // Show popup when there are route parameters (from and to)
  if (newQuery.from && newQuery.to) {
    showPopup.value = true
    popupContent.value = 'Rota calculada com sucesso!'

    // Find company info based on destination node
    const toNodeId = Number(newQuery.to)
    console.log('[RoutesView] Looking for company with nodeId:', toNodeId)
    console.log('[RoutesView] Available companies:', companies.value.length)

    const company = companies.value.find(c => c.building?.node?.id === toNodeId)
    console.log('[RoutesView] Found company:', company)

    if (company) {
      companyInfo.value = {
        name: company.name,
        rooms: 'Salas 101-105', // Exemplo - pode vir da API futuramente
        floors: '1º Andar', // Exemplo - pode vir da API futuramente
        building: company.building?.name || 'Não informado',
        block: 'Bloco A' // Exemplo - pode vir da API futuramente
      }
      console.log('[RoutesView] Company info set:', companyInfo.value)
    } else {
      companyInfo.value = null
      console.log('[RoutesView] No company found for nodeId:', toNodeId)
    }

    // Popup permanece até o usuário fechar manualmente
  } else {
    showPopup.value = false
    companyInfo.value = null
  }
}, { deep: true, immediate: true })

// Close popup manually
const closePopup = () => {
  showPopup.value = false
}

defineOptions({
  name: 'RoutesView'
})
</script>

<template>
  <main class="screen">
    <SideMenu />
    <section class="content" aria-label="Rotas">
      <LocationSearch />
      <div class="map-container">
        <MapRenderer />
        <ResetCameraButton />
      </div>
      <div class="bottom-spacer"></div>
    </section>

    <!-- Popup no canto inferior esquerdo -->
    <div
      v-if="showPopup"
      class="search-popup"
    >
      <div class="popup-content">
        <button class="popup-close" @click="closePopup">×</button>

        <div v-if="companyInfo" class="company-info">
          <h3 class="company-name">{{ companyInfo.name }}</h3>
          <div class="info-item">
            <strong>Bloco:</strong> {{ companyInfo.block }}
          </div>
          <div class="info-item">
            <strong>Prédio:</strong> {{ companyInfo.building }}
          </div>
          <div class="info-item">
            <strong>Salas:</strong> {{ companyInfo.rooms }}
          </div>
          <div class="info-item">
            <strong>Andar:</strong> {{ companyInfo.floors }}
          </div>
        </div>

        <div v-else-if="showPopup" class="route-info">
          <div class="popup-text">{{ popupContent }}</div>
        </div>
      </div>
    </div>
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
  position: relative;
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

/* Popup Styles */
.search-popup {
  position: fixed;
  bottom: 20px;
  left: 200px;
  z-index: 1000;
  animation: slideInLeft 0.3s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.popup-content {
  background: rgba(201, 163, 82, 0.8);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 20px;
  width: 250px;
  height: 180px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(201, 163, 82, 0.9);
  position: relative;
  text-align: center; /* Centraliza todo o texto */
}

.popup-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 18px;
  color: #5f6368;
  cursor: pointer;
  padding: 4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.15s;
  flex-shrink: 0;
}

.popup-close:hover {
  background-color: #f1f3f4;
}

.company-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  margin-top: 0px;
  text-align: center; /* Centraliza o texto */
  align-items: center; /* Centraliza os elementos */
  justify-content: flex-start; /* Alinha para o topo */
  padding-top: 5px;
}

.company-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0 0 4px 0;
  line-height: 1.3;
  text-align: center;
}

.info-item {
  font-size: 13px;
  color: white;
  line-height: 1.4;
  text-align: center;
}

.info-item strong {
  color: white;
  font-weight: 500;
}

.route-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.popup-text {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  color: white;
  font-weight: 500;
  text-align: center;
}
</style>
