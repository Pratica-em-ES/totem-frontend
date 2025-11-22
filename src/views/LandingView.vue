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
    <div class="background-map" aria-hidden="true">
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f0f9ff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e0f2fe;stop-opacity:1" />
          </linearGradient>
        </defs>

        <rect width="1200" height="800" fill="url(#bgGradient)"/>

        <g class="roads" stroke-linecap="round" stroke-linejoin="round">
          <path d="M -50,250 Q 180,245 320,260 Q 480,280 620,255 Q 780,225 950,240 Q 1100,250 1250,245"
                stroke="#fbbf24" stroke-width="5" opacity="0.4" fill="none"/>

          <path d="M 150,-50 Q 145,120 160,250 Q 180,420 155,580 Q 140,680 150,850"
                stroke="#fbbf24" stroke-width="5" opacity="0.4" fill="none"/>

          <path d="M -50,450 Q 220,430 380,455 Q 580,485 750,465 Q 920,450 1100,470 L 1250,465"
                stroke="#fbbf24" stroke-width="5" opacity="0.4" fill="none"/>

          <path d="M 850,-50 Q 840,100 855,220 Q 870,380 850,520 Q 835,650 845,850"
                stroke="#fbbf24" stroke-width="5" opacity="0.4" fill="none"/>

          <path d="M -50,150 Q 200,140 350,160 Q 550,185 720,155 Q 900,135 1250,150"
                stroke="#7dd3fc" stroke-width="4" opacity="0.35" fill="none"/>

          <path d="M 350,-50 Q 345,140 360,280 Q 380,450 355,620 Q 340,740 350,850"
                stroke="#7dd3fc" stroke-width="4" opacity="0.35" fill="none"/>

          <path d="M -50,580 Q 280,565 480,590 Q 680,615 900,585 Q 1080,570 1250,580"
                stroke="#7dd3fc" stroke-width="4" opacity="0.35" fill="none"/>

          <path d="M 600,-50 Q 590,180 610,340 Q 630,520 605,680 Q 590,770 600,850"
                stroke="#7dd3fc" stroke-width="4" opacity="0.35" fill="none"/>

          <g opacity="0.25">
            <path d="M -50,80 Q 150,75 280,85 Q 480,100 650,80 Q 850,65 1050,78 L 1250,80"
                  stroke="#d1d5db" stroke-width="3" fill="none"/>

            <path d="M -50,320 Q 220,310 400,330 Q 620,355 840,325 Q 1020,305 1250,320"
                  stroke="#d1d5db" stroke-width="3" fill="none"/>

            <path d="M -50,520 Q 180,510 340,525 Q 540,545 720,520 Q 920,500 1250,515"
                  stroke="#d1d5db" stroke-width="3" fill="none"/>

            <path d="M -50,680 Q 250,670 450,690 Q 680,710 900,685 Q 1100,665 1250,680"
                  stroke="#d1d5db" stroke-width="3" fill="none"/>

            <path d="M 80,-50 Q 75,180 90,350 Q 110,550 85,720 Q 70,780 80,850"
                  stroke="#d1d5db" stroke-width="3" fill="none"/>

            <path d="M 250,-50 Q 245,160 260,320 Q 280,510 255,680 Q 240,770 250,850"
                  stroke="#d1d5db" stroke-width="3" fill="none"/>

            <path d="M 480,-50 Q 475,120 490,280 Q 510,470 485,650 Q 470,750 480,850"
                  stroke="#d1d5db" stroke-width="3" fill="none"/>

            <path d="M 720,-50 Q 715,200 730,380 Q 750,580 725,740 Q 710,800 720,850"
                  stroke="#d1d5db" stroke-width="3" fill="none"/>

            <path d="M 950,-50 Q 945,150 960,310 Q 980,500 955,690 Q 940,780 950,850"
                  stroke="#d1d5db" stroke-width="3" fill="none"/>

            <path d="M 1100,-50 Q 1095,180 1110,360 Q 1130,560 1105,730 Q 1090,800 1100,850"
                  stroke="#d1d5db" stroke-width="3" fill="none"/>
          </g>

          <g opacity="0.25">
            <path d="M 100,100 Q 280,220 420,180 Q 580,140 720,200 Q 860,260 980,220"
                  stroke="#d1d5db" stroke-width="3" fill="none"/>

            <path d="M 50,400 Q 180,520 350,480 Q 520,440 680,500 Q 840,560 1000,520 Q 1120,490 1200,540"
                  stroke="#d1d5db" stroke-width="3" fill="none"/>

            <path d="M 200,50 Q 320,180 380,340 Q 420,480 500,600 Q 580,680 650,750"
                  stroke="#d1d5db" stroke-width="3" fill="none"/>

            <path d="M 900,80 Q 820,200 780,350 Q 740,500 680,650"
                  stroke="#d1d5db" stroke-width="3" fill="none"/>
          </g>

          <g class="blocks" opacity="0.08">
            <rect x="50" y="90" width="70" height="50" fill="#9ca3af" rx="2"/>
            <rect x="180" y="100" width="60" height="40" fill="#9ca3af" rx="2"/>
            <rect x="270" y="95" width="65" height="45" fill="#9ca3af" rx="2"/>
            <rect x="380" y="170" width="80" height="60" fill="#9ca3af" rx="2"/>
            <rect x="500" y="180" width="70" height="50" fill="#9ca3af" rx="2"/>
            <rect x="630" y="90" width="75" height="55" fill="#9ca3af" rx="2"/>
            <rect x="760" y="170" width="65" height="45" fill="#9ca3af" rx="2"/>
            <rect x="880" y="100" width="80" height="60" fill="#9ca3af" rx="2"/>
            <rect x="1020" y="95" width="70" height="50" fill="#9ca3af" rx="2"/>

            <rect x="90" y="260" width="60" height="45" fill="#9ca3af" rx="2"/>
            <rect x="190" y="270" width="70" height="50" fill="#9ca3af" rx="2"/>
            <rect x="370" y="290" width="80" height="60" fill="#9ca3af" rx="2"/>
            <rect x="500" y="300" width="65" height="45" fill="#9ca3af" rx="2"/>
            <rect x="630" y="270" width="75" height="55" fill="#9ca3af" rx="2"/>
            <rect x="760" y="290" width="70" height="50" fill="#9ca3af" rx="2"/>
            <rect x="900" y="280" width="80" height="60" fill="#9ca3af" rx="2"/>

            <rect x="90" y="460" width="70" height="50" fill="#9ca3af" rx="2"/>
            <rect x="200" y="470" width="65" height="45" fill="#9ca3af" rx="2"/>
            <rect x="390" y="490" width="80" height="55" fill="#9ca3af" rx="2"/>
            <rect x="520" y="500" width="70" height="50" fill="#9ca3af" rx="2"/>
            <rect x="650" y="475" width="75" height="60" fill="#9ca3af" rx="2"/>
            <rect x="790" y="490" width="65" height="45" fill="#9ca3af" rx="2"/>
            <rect x="920" y="480" width="80" height="55" fill="#9ca3af" rx="2"/>

            <rect x="100" y="600" width="70" height="50" fill="#9ca3af" rx="2"/>
            <rect x="260" y="610" width="65" height="45" fill="#9ca3af" rx="2"/>
            <rect x="400" y="620" width="80" height="60" fill="#9ca3af" rx="2"/>
            <rect x="540" y="615" width="70" height="50" fill="#9ca3af" rx="2"/>
            <rect x="730" y="600" width="75" height="55" fill="#9ca3af" rx="2"/>
            <rect x="870" y="610" width="80" height="60" fill="#9ca3af" rx="2"/>
          </g>
        </g>
      </svg>
    </div>

    <svg class="route-path" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <path
        class="route-line"
        d="M 100,500 L 100,380 Q 100,330 150,330 L 350,330 Q 400,330 400,280 L 400,250 Q 400,200 450,200 L 650,200 Q 700,200 700,250 L 700,350 Q 700,400 750,400 L 850,400"
        fill="none"
        stroke="#4169e1"
        stroke-width="14"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <circle class="route-origin" cx="100" cy="500" r="25" fill="white" stroke="#4169e1" stroke-width="4"/>
      <circle class="route-origin-inner" cx="100" cy="500" r="12" fill="#4169e1"/>

      <circle class="route-point route-point-1" cx="350" cy="330" r="12" fill="#4169e1"/>
      <circle class="route-point route-point-2" cx="450" cy="200" r="12" fill="#4169e1"/>
      <circle class="route-point route-point-3" cx="700" cy="350" r="12" fill="#4169e1"/>

      <g class="destination-marker">
        <ellipse cx="850" cy="445" rx="30" ry="8" fill="#000000" opacity="0.2"/>
        <path d="M 850,333 C 867,333 882,348 882,365 C 882,382 850,428 850,428 C 850,428 818,382 818,365 C 818,348 833,333 850,333 Z" fill="#0066cc"/>
        <path d="M 850,335 C 866,335 880,349 880,365 C 880,380 850,425 850,425 C 850,425 820,380 820,365 C 820,349 834,335 850,335 Z" fill="#0099ff"/>
        <path d="M 835,350 Q 832,360 834,372" stroke="#66ccff" stroke-width="5" fill="none" opacity="0.7" stroke-linecap="round"/>
        <!-- Círculo interno branco -->
        <circle cx="850" cy="363" r="15" fill="white"/>
        <!-- Ponto central azul -->
        <circle cx="850" cy="363" r="7" fill="#0066cc"/>
      </g>
    </svg>

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
  --accent-blue: #4169e1;
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
  background: #f3f4f6;
  cursor: pointer;
  overflow: hidden;
}

/* Mapa de fundo */
.background-map {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  opacity: 0.5;
}

.background-map svg {
  width: 100%;
  height: 100%;
}


.orb {
  position: absolute;
  width: clamp(260px, 26vw, 420px);
  height: clamp(260px, 26vw, 420px);
  border-radius: 50%;
  opacity: 1;
  z-index: 0;
  pointer-events: none;
}

.orb-gold {
  top: 0;
  left: 50%;
  transform: translate(-50%, -60%);
  background: #4169e1;
}

.orb-blue {
  background: #4169e1;
}

.orb-blue-1 {
  bottom: 0;
  right: 0;
  transform: translate(40%, 50%);
}

.orb-blue-2 {
  top: 50%;
  left: 0;
  transform: translate(-50%, -20%);
  width: clamp(200px, 20vw, 350px);
  height: clamp(200px, 20vw, 350px);
}

.orb-blue-3 {
  bottom: 10%;
  left: 20%;
  transform: translate(-30%, 0);
  width: clamp(150px, 15vw, 280px);
  height: clamp(150px, 15vw, 280px);
  opacity: 0.8;
}

/* Rota animada */
.route-path {
  position: absolute;
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  height: 30%;
  z-index: 0;
  pointer-events: none;
  opacity: 0.85;
}

.map-grid {
  animation: fadeMap 2s ease-in-out infinite alternate;
}

@keyframes fadeMap {
  from { opacity: 0.1; }
  to { opacity: 0.2; }
}

.route-line {
  stroke-dasharray: 2000;
  stroke-dashoffset: 2000;
  animation: drawRoute 5s ease-in-out infinite;
}

@keyframes drawRoute {
  0% {
    stroke-dashoffset: 2000;
  }
  50% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: -2000;
  }
}

.route-origin {
  animation: pulseOrigin 2s ease-in-out infinite;
}

@keyframes pulseOrigin {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.route-origin-inner {
  opacity: 1;
}

.route-point {
  opacity: 0;
  animation: fadeInPoint 5s ease-in-out infinite;
}

.route-point-1 {
  animation-delay: 0.5s;
}

.route-point-2 {
  animation-delay: 1.5s;
}

.route-point-3 {
  animation-delay: 2.5s;
}

.destination-marker {
  animation: bounceDestination 1.5s ease-in-out infinite;
}

@keyframes bounceDestination {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes fadeInPoint {
  0%, 10% {
    opacity: 0;
    transform: scale(0);
  }
  15%, 40% {
    opacity: 1;
    transform: scale(1);
  }
  45%, 100% {
    opacity: 0;
    transform: scale(0.5);
  }
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
  color: #4169e1 !important;
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
