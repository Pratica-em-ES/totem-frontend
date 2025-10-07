<script setup lang="ts">
import SideMenu from '@/components/SideMenu.vue'
import CompanyList from '@/components/CompanyList.vue'
import SearchBar from '@/components/SearchBar.vue';
</script>

<template>
  <main class="screen">
    <SideMenu />
    <section class="content" aria-label="Empresas">
      <SearchBar/>
      <CompanyList />
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
