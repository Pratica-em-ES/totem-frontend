<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()

const logoOk = ref(true)
const logoSrc = ref('/logo_tecnopuc.png')
let triedJpg = false

function start() {
  router.push({ name: 'home' })
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    start()
  }
}

function onLogoError() {
  if (!triedJpg) {
    triedJpg = true
    logoSrc.value = '/logo_tecnopuc.jpg'
  } else {
    logoOk.value = false
  }
}
</script>

<template>
  <main
    class="landing"
    role="button"
    tabindex="0"
    aria-label="Clique para iniciar"
    @click="start"
    @keydown="onKey"
  >
    <div class="orb" aria-hidden="true"></div>

    <section class="content">
      <p class="welcome">SEJA BEM-VINDO(A) AO TECNOPUC!</p>
      <h1 class="headline">CLIQUE PARA INICIAR</h1>

      <img
        v-if="logoOk"
        class="brand-logo"
        :src="logoSrc"
        alt="Logo do Tecnopuc"
        loading="eager"
        decoding="sync"
        @error="onLogoError"
      />
      <div v-else class="brand-fallback" aria-hidden="true">TECNOPUC</div>
    </section>
  </main>
  
</template>

<style scoped>
:root {
  --accent-gold: #c9a352;
  --frame: #2c2c2c;
}

.landing {
  position: relative;
  min-height: 100dvh;
  width: 100%;
  display: grid;
  place-items: center;
  padding: 3.5rem 2rem;
  border: 12px solid var(--frame);
  background: #ffffff;
  cursor: pointer;
  overflow: hidden;
}

.orb {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -60%);
  width: clamp(260px, 26vw, 420px);
  height: clamp(260px, 26vw, 420px);
  background: #c9a352;
  border-radius: 50%;
  opacity: 1;
  z-index: 0;
  pointer-events: none;
}

.content {
  position: relative;
  z-index: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(1200px, 92vw);
  margin-inline: auto;
  gap: 0.5rem;
}

.welcome {
  color: #c9a352 !important;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin-bottom: 0.75rem;
  font-size: clamp(1rem, 1.5vw, 1.35rem);
  opacity: 1;
}

.headline {
  color: #6b7280 !important;
  font-weight: 800;
  line-height: 1.05;
  font-size: clamp(2.4rem, 7.2vw, 5rem);
  margin: 0 0 0.6rem 0;
  opacity: 1;
}

.brand-logo {
  display: block;
  width: clamp(170px, 21vw, 340px);
  max-width: min(88vw, 380px);
  height: auto;
  margin: 0.25rem auto 0;
}

.brand-fallback {
  color: #6b7280;
  font-weight: 800;
  font-size: clamp(1.2rem, 2.2vw, 2rem);
}

@media (min-width: 1024px) {
  .landing { padding: 4rem 3rem; }
}
</style>
