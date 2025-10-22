<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CompanyCard from './CompanyCard.vue'
import { useCompaniesCache } from '@/composables/useCompaniesCache'
import type { CompanyDTO } from '../models/CompanyDTO'

export interface Company {
  id: number
  name: string
  building: string
  description: string
  imagePath: string
  categories: string[]
}

// Usar o cache global de empresas
const { companies: cachedCompanies, loading, error, fetchCompanies } = useCompaniesCache()

const rawCompanies = ref<Company[]>([])

const convertToCompany = (dto: CompanyDTO): Company | null => {
  try {
    return {
      id: dto.id,
      name: dto.name || 'Sem nome',
      building: dto.building?.name || 'Sem prédio',
      description: dto.description || '',
      imagePath: dto.imagePath || '',
      categories: dto.categories?.map(cat => cat.name) || []
    }
  } catch (err) {
    console.error('Erro ao converter empresa:', dto, err)
    return null
  }
}

// Sincronizar dados do cache com o estado local
watch(cachedCompanies, (newCompanies) => {
  rawCompanies.value = newCompanies
    .map(convertToCompany)
    .filter((c): c is Company => c !== null)
}, { immediate: true })

// Função para recarregar (forçar refresh)
const loadCompanies = async () => {
  try {
    await fetchCompanies(true) // forceRefresh = true
  } catch (err) {
    console.error('Erro ao recarregar empresas:', err)
  }
}

export interface SearchFilters {
  searchTerm: string
  building?: string
  category?: string
}

const currentFilters = ref<SearchFilters>({
  searchTerm: '',
  building: '',
  category: 'Todas'
})

const companies = computed(() => {
  let filtered = rawCompanies.value

  // Search term filter
  if (currentFilters.value.searchTerm) {
    const term = currentFilters.value.searchTerm.trim().toLowerCase()
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term)
    )
  }

  // Building filter
  if (currentFilters.value.building) {
    filtered = filtered.filter(c => c.building === currentFilters.value.building)
  }

  // Category filter
  if (currentFilters.value.category && currentFilters.value.category !== 'Todas') {
    filtered = filtered.filter(c =>
      c.categories.includes(currentFilters.value.category!)
    )
  }

  return filtered
})

const handleFiltersChanged = (filters: Partial<SearchFilters>) => {
  currentFilters.value = { ...currentFilters.value, ...filters }
}

// Export for external integration
defineExpose({ 
  setSearch(value: string) { 
    currentFilters.value.searchTerm = value 
  },
  handleFiltersChanged,
  companies: computed(() => companies.value),
  rawCompanies: computed(() => rawCompanies.value)
})
</script>

<template>
  <div class="companies-wrapper">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando empresas...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="loadCompanies" class="retry-button">Tentar novamente</button>
    </div>
    
    <div v-else class="list" role="list">
      <CompanyCard
        v-for="c in companies"
        :key="c.id"
        :name="c.name"
        :building="c.building"
        :description="c.description"
        :image-path="c.imagePath"
      />
      
      <div v-if="companies.length === 0" class="no-results">
        <p>Nenhuma empresa encontrada com os filtros aplicados.</p>
        <p>Tente ajustar os critérios de busca.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.companies-wrapper { 
  display:flex; flex-direction:column; gap:1.2rem;
  flex:1 1 auto;
  min-height: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: #6b7280;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.error-message {
  color: #dc2626;
  font-weight: 500;
}

.retry-button {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #2563eb;
}

.list { 
  display:flex; flex-direction:column; gap:2.4rem; padding-right: 1rem; 
  flex:1 1 auto; min-height:0; overflow-y:auto; overscroll-behavior:contain; padding-bottom:1rem;
  margin-top: 30px;
}

.list::-webkit-scrollbar { width: 12px; }
.list::-webkit-scrollbar-track { background: transparent; }
.list::-webkit-scrollbar-thumb { background:#d4d4d8; border-radius: 8px; border:3px solid #f5f5f8; }
.list:hover::-webkit-scrollbar-thumb { background:#c1c1c7; }

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.no-results p {
  margin: 0.5rem 0;
  font-size: 1rem;
}

.no-results p:first-child {
  font-weight: 500;
  color: #495057;
}
</style>
