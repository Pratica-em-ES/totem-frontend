<script setup lang="ts">
interface Props {
  name: string
  building: string
  floor?: string
  description: string
  logoUrl?: string
}

const props = defineProps<Props>()
</script>

<template>
  <article class="company-card" :aria-label="`Empresa ${props.name}`">
    <div class="media" aria-hidden="true">
      <div class="placeholder-img">IMG</div>
      <!-- Quando houver logo real: <img :src="logoUrl" :alt="`Logo ${name}`" v-if="logoUrl" /> -->
    </div>
    <div class="body">
      <h3 class="title">{{ name }}</h3>
      <p class="location">Prédio {{ building }}<template v-if="floor">, {{ floor }} andar</template></p>
      <p class="desc">{{ description }}</p>
    </div>
    <div class="cta">
      <button type="button" class="go" aria-label="Ver detalhes de {{ name }}">
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
}

.body { display: flex; flex-direction: column; gap: 0.55rem; }
.title { font-size: 1.32rem; font-weight: 700; color:#111827; line-height: 1.12; }
.location { font-size: 0.97rem; font-weight: 600; color:#1f2937; }
.desc { font-size: 0.95rem; line-height: 1.38; font-weight: 500; color:#111827; max-width: 65ch; }

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
