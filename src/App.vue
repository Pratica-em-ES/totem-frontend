<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useCompaniesCache } from '@/composables/useCompaniesCache'
import { useModelsCache } from '@/composables/useModelsCache'
import { useImagesCache } from '@/composables/useImagesCache'

const { fetchCompanies } = useCompaniesCache()
const { fetchModels } = useModelsCache()
const { fetchImages } = useImagesCache()

// Carregar empresas, modelos e imagens ao iniciar a aplicação
onMounted(async () => {
  try {
    // Carregar todos em paralelo para otimizar o tempo de inicialização
    await Promise.all([
      fetchCompanies(),
      fetchModels(),
      fetchImages()
    ])
  } catch (err) {
    console.error('Erro ao carregar dados na inicialização:', err)
  }
})
</script>

<template>
  <div class="app-shell">
    <RouterView />
  </div>
  
</template>

<style scoped>
.app-shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #fff;
}
</style>
