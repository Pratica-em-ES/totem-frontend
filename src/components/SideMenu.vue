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
  { key: 'rotas', label: 'Rotas', icon: 'route', to: '/rotas' },
  { key: 'empresas', label: 'Empresas', icon: 'users', to: '/empresas' },
]

function go(to?: string) {
  if (to) router.push(to)
}

function exit() {
  router.push({ name: 'landing' })
}

</script>

<template>
  <aside class="side">
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
          <svg v-else-if="item.icon==='route'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M7 5h7a4 4 0 1 1 0 8H10a4 4 0 0 0 0 8h7"/>
            <circle cx="7" cy="5" r="2.2"/>
            <circle cx="17" cy="21" r="2.2"/>
          </svg>
          <svg v-else-if="item.icon==='users'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M16.5 21v-1.8a3.7 3.7 0 0 0-3.7-3.7H7.2A3.7 3.7 0 0 0 3.5 19.2V21"/>
            <circle cx="10.4" cy="9" r="3.4"/>
            <path d="M20.5 21v-2a3 3 0 0 0-2.2-2.9"/>
            <path d="M17.2 3.9a3.2 3.2 0 0 1 0 6.1"/>
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
  justify-content: center;
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
  gap: 0.4rem;
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
  width: 86px; height: 76px;
  background: #f4f5f7;
  border-radius: 22px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.85);
  color: #3f3f46;
  transition: background .2s;
}

.pill svg { width: 50px; height: 50px; }

.action:active .pill { transform: translateY(2px); }

.label {
  color: #3f3f46;
  font-weight: 700;
  font-size: 1.1rem;
  margin-top: 0.18rem;
  text-align: center;
}

.exit {
  margin-top: 2rem;
  margin-bottom: 0;
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
  .side { width: 170px; }
  .pill { width: 94px; height: 84px; }
  .pill svg { width: 56px; height: 56px; }
  .label { font-size: 1.22rem; }
}
</style>
