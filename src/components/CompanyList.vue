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

// Placeholder para futura filtragem/pesquisa.
const filterTerm = ref('')

const companies = computed(() => {
  const term = filterTerm.value.trim().toLowerCase()
  if (!term) return rawCompanies.value
  return rawCompanies.value.filter(c => c.name.toLowerCase().includes(term) || c.description.toLowerCase().includes(term))
})

// Export leve para futura integração da search bar externa.
defineExpose({ setSearch(value: string) { filterTerm.value = value } })
</script>

<template>
  <div class="companies-wrapper">
    <!-- Espaço reservado para a futura search bar / filtros -->
    <div class="toolbar-space" aria-hidden="true"></div>

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
    </div>
  </div>
</template>

<style scoped>
.companies-wrapper { 
  display:flex; flex-direction:column; gap:1.9rem;
  flex:1 1 auto;
  min-height: 0;
}
.toolbar-space { height: 70px; flex: 0 0 auto; }
.list { 
  display:flex; flex-direction:column; gap:2.4rem; padding-right: 1rem; 
  flex:1 1 auto; min-height:0; overflow-y:auto; overscroll-behavior:contain; padding-bottom:1rem;
}

.list::-webkit-scrollbar { width: 12px; }
.list::-webkit-scrollbar-track { background: transparent; }
.list::-webkit-scrollbar-thumb { background:#d4d4d8; border-radius: 8px; border:3px solid #f5f5f8; }
.list:hover::-webkit-scrollbar-thumb { background:#c1c1c7; }
</style>
