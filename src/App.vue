<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useCompaniesCache } from '@/composables/useCompaniesCache'
import { useModelsCache } from '@/composables/useModelsCache'

const { fetchCompanies } = useCompaniesCache()
const { fetchModels } = useModelsCache()

// Carregar empresas e modelos ao iniciar a aplicação
onMounted(async () => {
  try {
    // Carregar ambos em paralelo para otimizar o tempo de inicialização
    await Promise.all([
      fetchCompanies(),
      fetchModels()
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
