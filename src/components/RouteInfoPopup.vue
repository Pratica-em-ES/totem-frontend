<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCompaniesCache } from '@/composables/useCompaniesCache'

const route = useRoute()
const { companies, fetchCompanies } = useCompaniesCache()

const showPopup = ref(false)
const popupData = ref<{
  title: string
  buildingName: string
  block: string | null
  room: string | null
  floor: string | null
  isSameLocation: boolean
} | null>(null)

// Close popup
const closePopup = () => {
  showPopup.value = false
  popupData.value = null
}

// Load companies on mount
onMounted(async () => {
  try {
    await fetchCompanies()
  } catch (error) {
    console.error('[RouteInfoPopup] Error loading companies:', error)
  }
})

// Update popup when route changes
watch(() => route.query, async (newQuery) => {
  const fromParam = newQuery.from
  const toParam = newQuery.to

  if (!fromParam || !toParam) {
    showPopup.value = false
    popupData.value = null
    return
  }

  const fromNodeId = Number(fromParam)
  const toNodeId = Number(toParam)

  // Check if same location
  const isSameLocation = fromNodeId === toNodeId

  // Find company or building info
  const company = companies.value.find(c => c.building?.node?.id === toNodeId)

  if (company) {
    // Access dynamic fields that may exist in the API response
    const companyData = company as any
    popupData.value = {
      title: company.name,
      buildingName: company.building.name,
      block: companyData.block || null,
      room: companyData.room || null,
      floor: companyData.floor || null,
      isSameLocation
    }
  } else {
    // Try to get building info from map data
    try {
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
      const response = await fetch(`${API_BASE_URL}/map`)
      const mapData = await response.json()
      const building = mapData.buildings.find((b: any) => b.nodeId === toNodeId)

      if (building) {
        popupData.value = {
          title: building.name,
          buildingName: building.name,
          block: null,
          room: null,
          floor: null,
          isSameLocation
        }
      }
    } catch (error) {
      console.error('[RouteInfoPopup] Error fetching building data:', error)
    }
  }

  showPopup.value = true
}, { deep: true })
</script><template>
  <div v-if="showPopup && popupData" class="route-popup">
    <button class="close-button" @click="closePopup" aria-label="Fechar">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>

    <div v-if="popupData.isSameLocation" class="popup-content">
      <h3 class="popup-title">Você já está aqui!</h3>
    </div>

    <div v-else class="popup-content">
      <h3 class="popup-title">{{ popupData.title }}</h3>

      <div class="popup-info">
        <div class="info-item">
          <span class="info-label">Prédio:</span>
          <span class="info-value">{{ popupData.buildingName }}</span>
        </div>

        <div v-if="popupData.block" class="info-item">
          <span class="info-label">Bloco:</span>
          <span class="info-value">{{ popupData.block }}</span>
        </div>

        <div v-if="popupData.room" class="info-item">
          <span class="info-label">Sala:</span>
          <span class="info-value">{{ popupData.room }}</span>
        </div>

        <div v-if="popupData.floor" class="info-item">
          <span class="info-label">Andar:</span>
          <span class="info-value">{{ popupData.floor }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.route-popup {
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  background-color: #4169e1;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  max-width: 280px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 100;
  animation: slideInBottom 0.3s ease-out;
  border: 2px solid transparent;
}

@keyframes slideInBottom {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.close-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  color: white;
  padding: 0;
}

.close-button svg {
  width: 14px;
  height: 14px;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.popup-content {
  color: white;
  padding-right: 1.5rem;
}

.popup-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.popup-message {
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.4;
}

.popup-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.info-item {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.info-label {
  font-weight: 600;
  opacity: 0.95;
  white-space: nowrap;
  min-width: 70px;
}

.info-value {
  font-weight: 500;
  opacity: 0.9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
