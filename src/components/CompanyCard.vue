<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { companyService } from '../services/companyService'

interface Props {
  id: string 
  name: string
  building: string
  floor?: string
  description: string
  logoUrl?: string
}

const props = defineProps<Props>()

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
  if (!props.id) {
    isLoadingImage.value = false
    hasImageError.value = true
    console.error('CompanyCard: ID da empresa não foi fornecido para buscar a imagem.')
    return
  }

  try {
    isLoadingImage.value = true
    hasImageError.value = false
    
    const numericId = parseInt(props.id, 10)

    if (isNaN(numericId)) {
      throw new Error('ID da empresa inválido para buscar a imagem.')
    }

    imagePath.value = await companyService.getCompanyImagePath(numericId)
  } catch (error) {
    console.error(`Falha ao buscar caminho da imagem para empresa ${props.id}:`, error)
    hasImageError.value = true
  } finally {
    isLoadingImage.value = false
  }
})
</script>

<template>
  <article class="company-card" :aria-label="`Empresa ${props.name}`">
    <div class="media" aria-hidden="true">
      <div class="placeholder-img">
        
        <div v-if="isLoadingImage" class="img-content loading">
          <span>Carregando...</span>
        </div>
        
        <img
          v-else-if="fullImageUrl && !hasImageError"
          :src="fullImageUrl"
          :alt="`Logo da ${props.name}`"
          class="img-content"
          @error="hasImageError = true" 
        />
        
        <div v-else class="img-content fallback">
          <span>IMG</span>
        </div>
      </div>
    </div>
    <div class="body">
      <h3 class="title">{{ name }}</h3>
      <p class="location">Prédio {{ building }}</p>
      <p class="desc">{{ description }}</p>
    </div>
    
    <div class="cta"> 
      <button type="button" class="go" :aria-label="`Ver detalhes de ${name}`">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  </article>
</template>

<style scoped>
.company-card {
  --radius: 28px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.95rem;
  background: #f5f5f8;
  padding: 2.5rem 2.5rem;
  border-radius: var(--radius);
  position: relative;
  align-items: center;
  box-shadow: 0 3px 8px rgba(0,0,0,0.04), 0 2px 3px rgba(0,0,0,0.03);
  width: 85%;
  max-width: 1500px;
  margin-inline: auto;
}

.media { width: 120px; height: 120px; }
.placeholder-img {
  width: 100%; height: 100%;
  background: linear-gradient(135deg,#d9d9df,#c4c4c9);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 600; color: #4b5563; font-size: 1.15rem;
  letter-spacing: 0.5px;
  overflow: hidden;
}

.img-content {
  width: 100%;
  height: 100%;
  object-fit: cover; 
  object-position: center; 
  display: flex; 
  align-items: center;
  justify-content: center;
  color: #4b5563;
  font-size: 1.15rem;
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

.body { display: flex; flex-direction: column; gap: 0.55rem; }
.title { font-size: 1.32rem; font-weight: 700; color:#111827; line-height: 1.12; }
.location { font-size: 0.97rem; font-weight: 600; color:#1f2937; }
.desc { 
  font-size: 0.95rem; 
  line-height: 1.4; 
  font-weight: 500; 
  color: #111827; 
  max-width: clamp(70ch, 70vw, 90ch);
  
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
  
  max-height: calc(1.4em * 3);
}

.cta { align-self: stretch; display: flex; align-items: center; }
.go { all: unset; cursor:pointer; width: 90px; height: 90px; border-radius: 26px; background:#fff; border:2px solid #c9a352; color:#b3872d; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 8px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.75); }
.go svg { width: 44px; height: 44px; }
.go:active { transform: translateY(2px); }

@media (max-width: 1200px) {
  .company-card { grid-template-columns: auto 1fr; gap: 0.8rem; }
  .cta { position: absolute; top: 1rem; right: 1rem; }
  .go { width: 70px; height: 70px; border-radius: 18px; }
  .go svg { width: 34px; height: 34px; }
}
</style>