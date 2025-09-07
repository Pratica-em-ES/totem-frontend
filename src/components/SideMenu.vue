<script setup lang="ts">
import { useRouter } from 'vue-router'

type MenuItem = {
  key: string
  label: string
  icon: string
  to?: string
}

const router = useRouter()

const items: MenuItem[] = [
  { key: 'home', label: 'Início', icon: 'home', to: '/home' },
  { key: 'rotas', label: 'Rotas', icon: 'route', to: '/exemplo' },
  { key: 'empresas', label: 'Empresas', icon: 'users', to: '/exemplo' },
  { key: 'filtrar', label: 'Filtrar', icon: 'sliders', to: '/exemplo' },
]

function go(to?: string) {
}

function exit() {
  router.push({ name: 'landing' })
}

</script>

<template>
  <aside class="side">
    <p class="greet">Olá, <strong>Visitante!</strong></p>

    <nav class="stack" aria-label="Navegação principal">
      <button
        v-for="item in items"
        :key="item.key"
        class="action"
        type="button"
        @click="go(item.to)"
      >
        <span class="pill" aria-hidden="true">
          <svg v-if="item.icon==='home'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M4 10.5 12 4l8 6.5"/>
            <path d="M6.5 9.5V20h11V9.5"/>
          </svg>
          <svg v-else-if="item.icon==='route'" viewBox="0 0 44 44" fill="none">
            <rect x="2" y="2" width="40" height="40" rx="12"/>
            <rect x="8" y="8" width="28" height="28" rx="8" fill="#39393B" transform="rotate(45 22 22)"/>
            <path d="M17 27V22C17 20.8954 17.8954 20 19 20H27" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M24 24L27 20L24 16" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="item.icon==='users'" viewBox="0 0 44 44" fill="none">
            <path d="M16.5 32v-2.2a4.3 4.3 0 0 1 4.3-4.3h2.4a4.3 4.3 0 0 1 4.3 4.3V32" stroke="#39393B" stroke-width="2.2" stroke-linecap="round" fill="none"/>
            <circle cx="22" cy="20" r="4.3" stroke="#39393B" stroke-width="2.2" fill="none"/>
            <path d="M32 32v-2a3.5 3.5 0 0 0-2.6-3.4" stroke="#39393B" stroke-width="2.2" stroke-linecap="round" fill="none"/>
            <path d="M28.5 15.5a3.2 3.2 0 0 1 0 6.1" stroke="#39393B" stroke-width="2.2" fill="none"/>
          </svg>
          <svg v-else-if="item.icon==='sliders'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M4 6h10"/>
            <path d="M4 12h16"/>
            <path d="M10 18h10"/>
            <circle cx="17" cy="6" r="2.2"/>
            <circle cx="7" cy="12" r="2.2"/>
            <circle cx="13" cy="18" r="2.2"/>
          </svg>
        </span>
        <span class="label">{{ item.label }}</span>
      </button>
    </nav>

    <button class="exit" type="button" @click="exit">Sair</button>
  </aside>
  
</template>

<style scoped>
.side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 140px;
  background: #fff;
  min-height: 100dvh;
  box-shadow: 2px 0 12px 0 rgba(0,0,0,0.04);
  justify-content: space-between;
}

.greet {
  align-self: center;
  color: #3f3f46;
  font-size: 1.15rem;
  margin: 2.2rem 0 0.2rem 0;
  text-align: center;
}
.greet strong {
  font-weight: bold;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 1.7rem;
  width: 100%;
}

.action {
  all: unset;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
  cursor: pointer;
}

.pill {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px; height: 62px;
  background: #f4f5f7;
  border-radius: 18px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.06), 0 2px 6px 0 rgba(0,0,0,0.10);
  color: #3f3f46;
  position: relative;
}

.pill svg {
  width: 44px;
  height: 44px;
  filter: drop-shadow(0 2px 2px rgba(0,0,0,0.10));
}

.label {
  color: #3f3f46;
  font-weight: 700;
  font-size: 1.1rem;
  margin-top: 0.18rem;
  text-align: center;
}

.exit {
  margin-top: 0.25rem;
  margin-bottom: 2.5rem;
  align-self: center;
  background: none;
  border: none;
  color: #d14324;
  font-weight: 500;
  font-size: 1.3rem;
  cursor: pointer;
  text-align: center;
  text-decoration: underline;
}

@media (max-width: 960px) {
  .side { width: 180px; }
  .pill { width: 88px; height: 78px; }
  .label { font-size: 1.25rem; }
}
</style>
