<script setup lang="ts">
import { ref, computed } from 'vue'
import SideMenu from '@/components/SideMenu.vue'
import CompanyList from '@/components/CompanyList.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { SearchFilters, Company } from '@/components/CompanyList.vue'

const companyListRef = ref<InstanceType<typeof CompanyList>>()
const searchBarRef = ref<InstanceType<typeof SearchBar>>()

// Get companies data from CompanyList
const companies = computed(() => {
  return companyListRef.value?.rawCompanies || []
})

const handleFiltersChanged = (filters: SearchFilters) => {
  if (companyListRef.value) {
    companyListRef.value.handleFiltersChanged(filters)
  }
}
</script>

<template>
  <main class="screen">
    <SideMenu />
    <section class="content" aria-label="Empresas">
      <SearchBar 
        ref="searchBarRef"
        :companies="companies"
        @filters-changed="handleFiltersChanged"
      />
      <CompanyList ref="companyListRef" />
    </section>
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
}
.content { 
  display:flex; 
  flex-direction:column; 
  overflow: hidden;
}
</style>
