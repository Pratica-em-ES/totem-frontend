
<script setup lang="ts">
import SideMenu from '@/components/SideMenu.vue'
import EmptyPlaceholder from '@/components/EmptyPlaceholder.vue'
import SearchBar from '@/components/SearchBar.vue';
</script>

<template>
  <main class="screen">
    <SideMenu />
    <section class="content" aria-label="Área principal">
      <SearchBar />
      <EmptyPlaceholder />
    </section>
  </main>
</template>

<style scoped>
.screen {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.25rem;
  padding: 1rem 1.25rem;
}

.content { display: grid; }

</style>
