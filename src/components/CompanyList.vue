<script setup lang="ts">
import { computed, ref } from 'vue'
import CompanyCard from './CompanyCard.vue'

export interface Company {
  id: string
  name: string
  building: string
  floor?: string
  description: string
  logoUrl?: string | null
  tags?: string[]
}

export interface SearchFilters {
  searchTerm: string
  building: string
  floor: string
  tag: string
}

const rawCompanies = ref<Company[]>([{
  id: '1',
  name: 'Apple Developer Academy',
  building: '99A', floor: '13',
  description: 'The Apple Developer Academy is a program focused on developing app development skills, encompassing coding, design, and professional skills.',
  logoUrl: null,
  tags: ['tecnologia','educacao']
}, {
  id: '2',
  name: 'Dell',
  building: '99A', floor: '13',
  description: 'The Apple Developer Academy is a program focused on developing app development skills, encompassing coding, design, and professional skills.',
  logoUrl: null,
  tags: ['hardware','tech']
}, {
  id: '3',
  name: 'HP',
  building: '99A', floor: '13',
  description: 'The Apple Developer Academy is a program focused on developing app development skills, encompassing coding, design, and professional skills.',
  logoUrl: null,
  tags: ['hardware']
}, {
  id: '4',
  name: 'IBM',
  building: '99A', floor: '12',
  description: 'Global technology and consulting company providing infrastructure, cloud and AI solutions.',
  logoUrl: null,
  tags: ['cloud','ai']
}, {
  id: '5',
  name: 'Accenture',
  building: '99B', floor: '7',
  description: 'Consultoria global em tecnologia e negócios com foco em inovação e transformação digital.',
  logoUrl: null,
  tags: ['consultoria','inovacao']
}, {
  id: '6',
  name: 'NVIDIA',
  building: '99C', floor: '5',
  description: 'Líder em computação acelerada e soluções de inteligência artificial.',
  logoUrl: null,
  tags: ['gpu','ai']
}])

const currentFilters = ref<SearchFilters>({
  searchTerm: '',
  building: '',
  floor: '',
  tag: ''
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

  // Floor filter
  if (currentFilters.value.floor) {
    filtered = filtered.filter(c => c.floor === currentFilters.value.floor)
  }

  // Tag filter
  if (currentFilters.value.tag) {
    filtered = filtered.filter(c => 
      c.tags && c.tags.includes(currentFilters.value.tag)
    )
  }

  return filtered
})

const handleFiltersChanged = (filters: SearchFilters) => {
  currentFilters.value = filters
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
    <div class="list" role="list">
      <CompanyCard
        v-for="c in companies"
        :key="c.id"
        :name="c.name"
        :building="c.building"
        :floor="c.floor"
        :description="c.description"
        :logo-url="c.logoUrl || undefined"
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
.list { 
  display:flex; flex-direction:column; gap:2.4rem; padding-right: 1rem; 
  flex:1 1 auto; min-height:0; overflow-y:auto; overscroll-behavior:contain; padding-bottom:1rem;
  margin-top: 12px; /* small space under search bar */
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
