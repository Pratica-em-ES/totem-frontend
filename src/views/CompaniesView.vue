<script setup lang="ts">
import { ref } from 'vue'
import SideMenu from '@/components/SideMenu.vue'
import CompanyList from '@/components/CompanyList.vue'
import SearchBar from '@/components/SearchBar.vue'

const companyListRef = ref<InstanceType<typeof CompanyList> | null>(null)

function onSearch(payload: { query: string; category: string }) {
  if (companyListRef.value) {
    companyListRef.value.handleFiltersChanged({
      searchTerm: payload.query,
      category: payload.category
    })
  }
}
</script>

<template>
  <main class="screen">
    <SideMenu />
    <section class="content" aria-label="Empresas">
      <SearchBar @search="onSearch" />
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
}
</style>
