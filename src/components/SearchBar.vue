<template>
  <div class="search-bar">
    <div class="search-input-container">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Pesquisar empresas..."
        class="search-input"
        @input="handleSearch"
      />
      <div class="search-icon">🔍</div>
    </div>
    
    <div class="filters-container">
      <div class="filter-group">
        <label class="filter-label">Prédio:</label>
        <select v-model="selectedBuilding" @change="handleFilterChange" class="filter-select">
          <option value="">Todos os prédios</option>
          <option v-for="building in uniqueBuildings" :key="building" :value="building">
            {{ building }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label class="filter-label">Andar:</label>
        <select v-model="selectedFloor" @change="handleFilterChange" class="filter-select">
          <option value="">Todos os andares</option>
          <option v-for="floor in uniqueFloors" :key="floor" :value="floor">
            {{ floor }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label class="filter-label">Tag:</label>
        <select v-model="selectedTag" @change="handleFilterChange" class="filter-select">
          <option value="">Todas as tags</option>
          <option v-for="tag in uniqueTags" :key="tag" :value="tag">
            {{ tag }}
          </option>
        </select>
      </div>
      
      <button @click="clearFilters" class="clear-button" v-if="hasActiveFilters">
        Limpar filtros
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface Company {
  id: string
  name: string
  building: string
  floor?: string
  description: string
  logoUrl?: string | null
  tags?: string[]
}

interface SearchFilters {
  searchTerm: string
  building: string
  floor: string
  tag: string
}

const props = defineProps<{
  companies: Company[]
}>()

const emit = defineEmits<{
  filtersChanged: [filters: SearchFilters]
}>()

const searchTerm = ref('')
const selectedBuilding = ref('')
const selectedFloor = ref('')
const selectedTag = ref('')

// Computed properties for unique filter options
const uniqueBuildings = computed(() => {
  const buildings = props.companies.map(c => c.building)
  return [...new Set(buildings)].sort()
})

const uniqueFloors = computed(() => {
  const floors = props.companies
    .map(c => c.floor)
    .filter(floor => floor !== undefined && floor !== null)
  return [...new Set(floors)].sort((a, b) => {
    const numA = parseInt(a || '0')
    const numB = parseInt(b || '0')
    return numA - numB
  })
})

const uniqueTags = computed(() => {
  const allTags = props.companies
    .flatMap(c => c.tags || [])
    .filter(tag => tag && tag.trim() !== '')
  return [...new Set(allTags)].sort()
})

const hasActiveFilters = computed(() => {
  return searchTerm.value || selectedBuilding.value || selectedFloor.value || selectedTag.value
})

// Watch for changes in building filter to update floor options
watch(selectedBuilding, (newBuilding) => {
  if (newBuilding) {
    // Reset floor selection if it's not available in the selected building
    const availableFloors = props.companies
      .filter(c => c.building === newBuilding)
      .map(c => c.floor)
      .filter(floor => floor !== undefined && floor !== null)
    
    if (selectedFloor.value && !availableFloors.includes(selectedFloor.value)) {
      selectedFloor.value = ''
    }
  }
})

const handleSearch = () => {
  emitFilters()
}

const handleFilterChange = () => {
  emitFilters()
}

const emitFilters = () => {
  const filters: SearchFilters = {
    searchTerm: searchTerm.value,
    building: selectedBuilding.value,
    floor: selectedFloor.value,
    tag: selectedTag.value
  }
  emit('filtersChanged', filters)
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedBuilding.value = ''
  selectedFloor.value = ''
  selectedTag.value = ''
  emitFilters()
}

// Expose method to clear filters from parent
defineExpose({
  clearFilters
})
</script>

<style scoped>
.search-bar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: #6c757d;
  font-size: 1rem;
  pointer-events: none;
}

.filters-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 120px;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #495057;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.clear-button {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  align-self: flex-end;
}

.clear-button:hover {
  background: #c82333;
}

.clear-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.3);
}

@media (max-width: 768px) {
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .clear-button {
    align-self: stretch;
  }
}
</style>
