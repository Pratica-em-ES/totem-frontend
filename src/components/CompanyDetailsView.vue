<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { companyService } from '@/services/companyService'
import type { CompanyDTO } from '@/models/CompanyDTO'

const route = useRoute()
const router = useRouter()
const company = ref<CompanyDTO | null>(null)
const loading = ref(true)
const imagePath = ref<string | null>(null)
const isLoadingImage = ref<boolean>(true)
const hasImageError = ref<boolean>(false)

const fullImageUrl = computed(() => {
  if (imagePath.value) {
    return imagePath.value.startsWith('/') ? imagePath.value : `/${imagePath.value}`
  }
  return null
})

onMounted(async () => {
  const companyId = route.params.id as string

  try {
    company.value = await companyService.getCompanyById(companyId)
    loading.value = false

    // Buscar imagem da empresa se os dados foram carregados com sucesso
    if (company.value && companyId) {
      try {
        isLoadingImage.value = true
        hasImageError.value = false

        const numericId = Number.parseInt(companyId, 10)

        if (Number.isNaN(numericId)) {
          throw new TypeError('ID da empresa inválido para buscar a imagem.')
        }

        imagePath.value = await companyService.getCompanyImagePath(numericId)
      } catch (error) {
        console.error(`Falha ao buscar caminho da imagem para empresa ${companyId}:`, error)
        hasImageError.value = true
      } finally {
        isLoadingImage.value = false
      }
    }
  } catch (error) {
    console.error('Erro ao carregar empresa:', error)
    loading.value = false
  }
})

const goBack = () => {
  router.push('/empresas')
}

const goToMap = () => {
  if (company.value) {
    router.push({
      path: '/rotas',
      query: { destinoId: company.value.id, destinoNome: company.value.name }
    })
  } else {
    router.push('/rotas')
  }
}
</script>

<template>
  <main class="screen">
    <section class="content" aria-label="Detalhes da Empresa">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Carregando detalhes da empresa...</p>
      </div>

      <div v-else-if="!company" class="error">
        <h2>Empresa não encontrada</h2>
        <p>A empresa solicitada não foi encontrada.</p>
      </div>

      <div v-else class="company-details-wrapper">
        <div class="company-details">
          <div class="company-header">
            <div class="company-main-content">
              <div class="action-buttons">
                <button @click="goBack" class="back-button-absolute" aria-label="Voltar para lista de empresas">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              <div class="title-row">
                <h1 class="company-name">{{ company.name }}</h1>
              </div>
              <div class="company-info">
                <div class="info-item">
                  <strong>Localização:</strong> Prédio {{ company.building }}<template v-if="company.floor">, {{ company.floor }}º andar</template>
                </div>

                <div class="info-item">
                  <strong>Descrição:</strong>
                  <span class="description-text">{{ company.description }}</span>
                </div>

                <div class="info-item" v-if="company.category">
                  <strong>Categoria:</strong> {{ company.category }}
                </div>

                <div class="route-button-container">
                  <button @click="goToMap" class="route-button" aria-label="Ver rotas no mapa">
                    <span class="route-text">Rotas</span>
                    <svg viewBox="0 0 32 32" fill="#d4af37" stroke="none">
                      <path d="M18 26V12c0-3-2-5-5-5H6l4-4-1.5-1.5L2 8l6.5 6.5L10 13l-4-4h7c1.5 0 3 1.5 3 3v14h2z"/>
                    </svg>
                  </button>
                </div>

                <div class="info-item" v-if="company.services?.length">
                  <strong>Serviços:</strong>
                  <div class="services-list">
                    <span v-for="service in company.services" :key="service" class="service-tag">
                      {{ service }}
                    </span>
                  </div>
                </div>

                <div class="info-item" v-if="company.fullDescription">
                  <strong>Descrição Completa:</strong> {{ company.fullDescription }}
                </div>
              </div>
            </div>
            <div class="company-logo">
              <div class="placeholder-img">
                <div v-if="isLoadingImage" class="img-content loading">
                  <span>Carregando...</span>
                </div>

                <img
                  v-else-if="fullImageUrl && !hasImageError"
                  :src="fullImageUrl"
                  :alt="`Logo da ${company.name}`"
                  class="img-content"
                  @error="hasImageError = true"
                />

                <div v-else class="img-content fallback">
                  <span>IMG</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.screen {
  height: 100dvh;
  overflow: hidden;
}

.content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  gap: 1rem;
  padding: 3rem 1.25rem 1rem;
}

.company-details-wrapper {
  background: #f5f5f8;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  padding: 2.5rem 0;
}

.company-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 950px;
  margin: 0 auto;
  width: 85%;
  padding: 0 1.25rem;
  overflow: visible;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #d4af37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.error h2 {
  color: #374151;
  margin-bottom: 0.5rem;
}

.company-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 4rem;
}

.company-main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2.5rem;
  min-height: 300px;
  position: relative;
  overflow: visible;
}

.title-row {
  display: flex;
  align-items: center;
}

.company-name {
  font-size: 2.8rem;
  font-weight: 700;
  color: #d4af37;
  line-height: 1.3;
  margin: 0;
  word-wrap: break-word;
  hyphens: auto;
  flex: 1;
}

.action-buttons {
  position: absolute;
  left: -150px;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 10;
}

.back-button-absolute {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: none;
  color: black;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 12px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-button-absolute:hover {
  background-color: #f5f5f5;
  color: black;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.back-button-absolute svg {
  width: 24px;
  height: 24px;
}

.route-button-container {
  margin-top: 1rem;
}

.route-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 12px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 65px;
  height: 85px;
  gap: 0.2rem;
}

.route-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.route-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: #d4af37;
  margin: 0;
}

.route-button svg {
  width: 36px;
  height: 36px;
  stroke: #d4af37;
}

.company-logo {
  width: 250px;
  height: 250px;
  flex-shrink: 0;
}

.placeholder-img {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #d9d9df, #c4c4c9);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #4b5563;
  font-size: 1.5rem;
  letter-spacing: 0.5px;
  overflow: hidden;
}

.img-content {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563;
  font-size: 1.5rem;
  border-radius: 16px;
}

.img-content.fallback {
  background-color: #e0e0e0;
}

.img-content.loading span {
  font-size: 1.2rem;
  color: #6b7280;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.company-info {
  display: flex;
  flex-direction: column;
  gap: 2.0rem;
  max-width: 550px;
}

.info-item {
  font-size: 1.1rem;
  line-height: 1.5;
  color: #374151;
}

.info-item strong {
  color: #111827;
  font-weight: 700;
}

.description-text {
  display: block;
  margin-top: 0.25rem;
}

.services-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.service-tag {
  background: #d4af37;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(212, 175, 55, 0.2);
}

@media (max-width: 768px) {
  .company-header {
    flex-direction: column;
    gap: 2rem;
    text-align: left;
  }

  .title-row {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .company-logo {
    width: 350px;
    height: 200px;
    align-self: center;
  }

  .company-name {
    font-size: 2.5rem;
    text-align: center;
  }

  .company-main-content {
    text-align: center;
  }

  .company-details {
    width: 95%;
    padding: 0 1rem;
  }

  .action-buttons {
    position: relative;
    left: 0;
    flex-direction: row;
    justify-content: center;
    margin-bottom: 1rem;
  }
}
</style>
