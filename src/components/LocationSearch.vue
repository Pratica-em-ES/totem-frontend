<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCompaniesCache } from '@/composables/useCompaniesCache'
import { useCurrentLocation } from '@/composables/useCurrentLocation'
import { useSelectedCompany } from '@/composables/useSelectedCompany'

// Get current location from composable
const { currentLocation } = useCurrentLocation()
const { setSelectedCompany, clearSelectedCompany } = useSelectedCompany()
const route = useRoute()
const router = useRouter()

interface SearchableItem {
  id: string
  displayName: string
  subtitle: string
  nodeId: number
  buildingId: number
  type: 'building' | 'company'
  icon: string
}

const { companies, fetchCompanies } = useCompaniesCache()
const searchQuery = ref('')
const selectedItem = ref<SearchableItem | null>(null)
const selectedItemId = ref<string | null>(null)
const isSelectionInProgress = ref(false)
const isLoadingRoute = ref(false)
const mapData = ref<any>(null)
const showDropdown = ref(false)
const highlightedIndex = ref(0)
const previousSearchQuery = ref('')

// Build searchable items from companies cache and map data
const searchableItems = computed<SearchableItem[]>(() => {
  const items: SearchableItem[] = []

  console.log('[LocationSearch] Building searchable items...')
  console.log('[LocationSearch] companies.value.length:', companies.value.length)
  console.log('[LocationSearch] mapData.value:', mapData.value)

  // Add companies from cache
  companies.value.forEach((company) => {
    // Skip companies without building info
    if (!company.building || !company.building.node) {
      console.warn('[LocationSearch] Skipping company without building:', company.name)
      return
    }

    items.push({
      id: `company-${company.id}`,
      displayName: company.name,
      subtitle: `${company.building.name}`,
      nodeId: company.building.node.id,
      buildingId: company.building.id,
      type: 'company',
      icon: '🏪'
    })
  })

  // Add buildings from map data
  if (mapData.value?.buildings) {
    mapData.value.buildings.forEach((building: any) => {
      items.push({
        id: `building-${building.id}`,
        displayName: building.name,
        subtitle: 'Prédio',
        nodeId: building.nodeId,
        buildingId: building.id,
        type: 'building',
        icon: '🏢'
      })
    })
  }

  console.log('[LocationSearch] Total items built:', items.length)
  return items
})

// Filter items based on search query (top 5 matches)
const filteredItems = computed<SearchableItem[]>(() => {
  console.log('[LocationSearch] searchQuery:', searchQuery.value)
  console.log('[LocationSearch] searchableItems total:', searchableItems.value.length)

  if (!searchQuery.value || searchQuery.value.length < 1) {
    console.log('[LocationSearch] Query too short or empty')
    return []
  }

  const query = searchQuery.value.toLowerCase()
  const matches = searchableItems.value.filter((item) => {
    return (
      item.displayName.toLowerCase().includes(query) ||
      item.subtitle.toLowerCase().includes(query)
    )
  })

  console.log('[LocationSearch] Matches found:', matches.length)
  console.log('[LocationSearch] First 5 matches:', matches.slice(0, 5))

  return matches.slice(0, 5) // Top 5 matches
})

// Watch search query to show/hide dropdown and detect manual clear
watch(searchQuery, (newValue, oldValue) => {
  console.log('[LocationSearch] Watch triggered, newValue:', newValue)
  console.log('[LocationSearch] filteredItems.value.length:', filteredItems.value.length)
  showDropdown.value = newValue.length > 0 && filteredItems.value.length > 0
  console.log('[LocationSearch] showDropdown set to:', showDropdown.value)
  highlightedIndex.value = 0

  if (oldValue && oldValue.length > 0 && newValue.length === 0) {
    console.log('[LocationSearch] User manually cleared input, resetting camera')
    resetCameraAndClearRoute()
  }

  previousSearchQuery.value = oldValue
})

// Extract route processing logic to be reused by multiple watchers
const processRouteParams = async () => {
  console.log('[LocationSearch] Processing route params...')

  const fromParam = route.query.from
  const toParam = route.query.to

  // If no params, clear everything
  if (!fromParam || !toParam) {
    console.log('[LocationSearch] No route params, clearing route and search')
    searchQuery.value = ''
    selectedItem.value = null
    selectedItemId.value = null

    // Wait for mapAPI and clear route
    await waitForMapAPI()
    // @ts-ignore
    if (window.mapAPI && window.mapAPI.clearRoute) {
      // @ts-ignore
      window.mapAPI.clearRoute()
      console.log('[LocationSearch] Route cleared from map')
    }
    return
  }

  // Params exist, update UI and trace route
  const fromNodeId = Number(fromParam)
  const toNodeId = Number(toParam)

  console.log('[LocationSearch] URL has route params:', fromNodeId, '->', toNodeId)

  // Wait for data to be loaded
  if (searchableItems.value.length === 0) {
    console.log('[LocationSearch] Waiting for searchableItems to be loaded...')
    return
  }

  // Update UI: find destination using stored selectedItemId (for exact company match)
  // If selectedItemId is set, use it to find the correct item
  // Otherwise, find by nodeId (for back button or direct URL access)
  let destinationItem: SearchableItem | undefined
  
  if (selectedItemId.value) {
    destinationItem = searchableItems.value.find(item => item.id === selectedItemId.value)
    console.log('[LocationSearch] Found destination using selectedItemId:', destinationItem?.displayName)
  }
  
  if (!destinationItem) {
    destinationItem = searchableItems.value.find(item => item.nodeId === toNodeId)
    console.log('[LocationSearch] Found destination using nodeId:', destinationItem?.displayName)
  }

  // Only update search query if it hasn't been set by selectItem
  // This preserves the exact company name selected by the user
  if (destinationItem && (!selectedItem.value || selectedItem.value.id !== destinationItem.id)) {
    searchQuery.value = `${destinationItem.icon} ${destinationItem.displayName}`
    selectedItem.value = destinationItem
    console.log('[LocationSearch] UI updated with destination:', destinationItem.displayName)
  } else if (destinationItem) {
    console.log('[LocationSearch] Keeping existing selection:', destinationItem.displayName)
  }

  // Wait for mapAPI and trace route
  await waitForMapAPI()

  // @ts-ignore
  if (window.mapAPI && window.mapAPI.traceRouteByNodeIds) {
    console.log('[LocationSearch] Tracing route on map:', fromNodeId, '->', toNodeId)
    // @ts-ignore
    await window.mapAPI.traceRouteByNodeIds(fromNodeId, toNodeId)
    console.log('[LocationSearch] Route traced successfully')
  } else {
    console.warn('[LocationSearch] mapAPI.traceRouteByNodeIds not available')
  }
}

// Watch route query params - SINGLE SOURCE OF TRUTH for route state
watch(() => route.query, async (newQuery) => {
  console.log('[LocationSearch] Route query changed:', newQuery)
  await processRouteParams()
}, { deep: true, immediate: true })

// Watch searchableItems - re-process route when data loads
watch(searchableItems, async (newItems) => {
  console.log('[LocationSearch] searchableItems changed, length:', newItems.length)

  // Only re-process if data just became available AND route params exist
  if (newItems.length > 0 && (route.query.from || route.query.to)) {
    console.log('[LocationSearch] Data loaded with route params present, re-processing...')
    await processRouteParams()
  }
})

// Load data on mount
onMounted(async () => {
  console.log('[LocationSearch] Loading data...')

  try {
    // Fetch companies cache
    await fetchCompanies()
    console.log('[LocationSearch] Companies loaded:', companies.value.length)

    // Fetch map data for buildings
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
    const response = await fetch(`${API_BASE_URL}/map`)
    mapData.value = await response.json()
    console.log('[LocationSearch] Map loaded, buildings:', mapData.value.buildings.length)

    console.log('[LocationSearch] Total searchable items:', searchableItems.value.length)

    // Note: Route handling is now done by the watch on route.query
    // This ensures consistent behavior whether params are present on mount or change later
  } catch (error) {
    console.error('[LocationSearch] Error loading data:', error)
  }
})

// Handle item selection
const selectItem = async (item: SearchableItem) => {
  console.log('[LocationSearch] Selected item:', item)

  // Store the selected item ID and immediately update the search query display
  // This ensures the correct company name is displayed before route processing
  selectedItemId.value = item.id
  selectedItem.value = item
  searchQuery.value = `${item.icon} ${item.displayName}`
  showDropdown.value = false
  
  // If it's a company, store it in the shared selected company state
  if (item.type === 'company') {
    const company = companies.value.find(c => c.id === Number(item.id.replace('company-', '')))
    if (company) {
      setSelectedCompany(company)
      console.log('[LocationSearch] Stored selected company:', company.name)
    }
  } else {
    // If it's a building, clear the selected company
    clearSelectedCompany()
  }
  
  console.log('[LocationSearch] Updated UI immediately with:', item.displayName)
  console.log('[LocationSearch] Stored selectedItemId:', selectedItemId.value)

  // Use nextTick to ensure UI is updated before route change triggers watcher
  await nextTick()

  // Update URL with route params
  // The watcher will automatically trace the route when URL changes
  const fromNodeId = currentLocation.nodeId
  const toNodeId = item.nodeId

  router.replace({
    path: '/rotas',
    query: {
      from: fromNodeId,
      to: toNodeId
    }
  })

  console.log('[LocationSearch] URL updated with route params:', { from: fromNodeId, to: toNodeId })
  console.log('[LocationSearch] Watcher will handle route tracing')
  
  // Mark selection as complete after a short delay
  setTimeout(() => {
    isSelectionInProgress.value = false
    console.log('[LocationSearch] Selection complete')
  }, 100)
}

// Handle keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  if (!showDropdown.value || filteredItems.value.length === 0) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(
        highlightedIndex.value + 1,
        filteredItems.value.length - 1
      )
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      if (filteredItems.value[highlightedIndex.value]) {
        selectItem(filteredItems.value[highlightedIndex.value])
      }
      break
    case 'Escape':
      showDropdown.value = false
      break
  }
}

// Handle input focus
const handleFocus = () => {
  if (searchQuery.value.length > 0 && filteredItems.value.length > 0) {
    showDropdown.value = true
  }
}

// Handle click outside to close dropdown
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.input-group-destination')) {
    showDropdown.value = false
  }
}

// Wait for mapAPI to be available
const waitForMapAPI = (): Promise<void> => {
  return new Promise((resolve) => {
    // @ts-ignore
    if (window.mapAPI) {
      resolve()
      return
    }

    const checkInterval = setInterval(() => {
      // @ts-ignore
      if (window.mapAPI) {
        clearInterval(checkInterval)
        resolve()
      }
    }, 100)

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval)
      console.warn('[LocationSearch] mapAPI not available after 10s timeout')
      resolve()
    }, 10000)
  })
}

// Clear input and reset camera
const clearInput = async () => {
  console.log('[LocationSearch] Clearing input and resetting camera')
  searchQuery.value = ''
  selectedItem.value = null
  selectedItemId.value = null
  showDropdown.value = false
  clearSelectedCompany()

  await resetCameraAndClearRoute()
}

// Reset camera and clear route on map
const resetCameraAndClearRoute = async () => {
  console.log('[LocationSearch] Resetting camera and clearing route')

  // Clear selected item ID
  selectedItemId.value = null

  // Wait for mapAPI to be available
  await waitForMapAPI()

  // @ts-ignore
  if (window.mapAPI) {
    // Clear route from map
    // @ts-ignore
    if (window.mapAPI.clearRoute) {
      // @ts-ignore
      window.mapAPI.clearRoute()
      console.log('[LocationSearch] Route cleared from map')
    }

    // Reset camera
    // @ts-ignore
    if (window.mapAPI.resetCamera) {
      // @ts-ignore
      window.mapAPI.resetCamera()
      console.log('[LocationSearch] Camera reset')
    }
  } else {
    console.warn('[LocationSearch] mapAPI not available')
  }

  // Clear URL query params
  router.replace({
    path: '/rotas',
    query: {}
  })
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="location-search-container">
    <!-- Fixed Start Location -->
    <div class="input-group input-group-start">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="icon"
      >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      <input
        type="text"
        :value="currentLocation.name"
        disabled
        class="input-fixed"
      />
    </div>

    <!-- Destination Search with Autocomplete -->
    <div class="input-group input-group-destination">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="icon"
      >
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
        <circle cx="12" cy="10" r="3" />
      </svg>

      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar destino (prédio, empresa...)"
        class="input-search"
        @keydown="handleKeyDown"
        @focus="handleFocus"
      />

      <button
        v-if="searchQuery.length > 0"
        @click="clearInput"
        class="clear-button"
        aria-label="Limpar destino"
      >
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
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <!-- Dropdown with suggestions -->
      <div v-if="showDropdown" class="dropdown">
        <div
          v-for="(item, index) in filteredItems"
          :key="item.id"
          :class="['dropdown-item', { highlighted: index === highlightedIndex }]"
          @click="selectItem(item)"
          @mouseenter="highlightedIndex = index"
        >
          <span class="item-icon">{{ item.icon }}</span>
          <div class="item-content">
            <div class="item-name">{{ item.displayName }}</div>
            <div class="item-subtitle">{{ item.subtitle }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoadingRoute" class="loading-indicator">
      Calculando rota...
    </div>
  </div>
</template>

<style scoped>
.location-search-container {
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
}

.input-group {
  display: flex;
  align-items: center;
  background-color: #f1f3f4;
  border-radius: 50px;
  padding: 0.75rem 1rem;
  transition: box-shadow 0.2s ease-in-out;
  position: relative;
}

.input-group:focus-within {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.icon {
  width: 20px;
  height: 20px;
  color: #5f6368;
  flex-shrink: 0;
}

input {
  flex-grow: 1;
  border: none;
  outline: none;
  background-color: transparent;
  font-size: 1rem;
  margin: 0 0.75rem;
  color: #202124;
}

input::placeholder {
  color: #5f6368;
  opacity: 1;
}

.input-fixed {
  color: #5f6368;
  cursor: not-allowed;
}

.input-search {
  cursor: text;
}

.clear-button {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
  color: #5f6368;
  flex-shrink: 0;
}

.clear-button:hover {
  background-color: rgba(95, 99, 104, 0.1);
}

.clear-button:active {
  background-color: rgba(95, 99, 104, 0.2);
}

.loading-indicator {
  text-align: center;
  padding: 0.5rem;
  color: #5f6368;
  font-size: 0.9rem;
  font-style: italic;
}

/* Dropdown Styles */
.dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  animation: slideDown 0.15s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.15s;
  gap: 0.75rem;
}

.dropdown-item:hover,
.dropdown-item.highlighted {
  background-color: #f1f3f4;
}

.dropdown-item:first-child {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.dropdown-item:last-child {
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.item-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.item-content {
  flex-grow: 1;
  min-width: 0;
}

.item-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: #202124;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-subtitle {
  font-size: 0.85rem;
  color: #5f6368;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
