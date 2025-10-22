# 🗺️ Map Service - Índice de Documentação

## 📖 Documentação

### [API_SUMMARY.md](./API_SUMMARY.md) - **COMECE AQUI**
Resumo rápido dos métodos principais:
- `highlightBuilding(buildingId)` - Aceita **number** ou string
- `getHighlightedBuilding()`
- `clearHighlight()`
- `traceRoute(nodeIdList)`
- `clearRoute()`

### [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)
Exemplos práticos de uso com Vue 3:
- Componente completo com lista de prédios
- Integração com router
- Busca e filtro
- Boas práticas

### [README.md](./README.md)
Documentação completa:
- Todos os métodos da API
- Arquitetura e estrutura
- Configuração
- Troubleshooting

---

## 🏗️ Estrutura do Código

```
map/
├── core/                        # Gerenciadores three.js
│   ├── SceneManager.ts         # Cena, câmera, iluminação
│   ├── RendererManager.ts      # Renderização, post-processing
│   ├── ControlsManager.ts      # Controles de câmera
│   └── LoaderManager.ts        # Carregamento de modelos
│
├── features/                    # Módulos de funcionalidades
│   ├── BuildingHighlighter.ts  # ⭐ Highlight de prédios
│   ├── RouteTracer.ts          # ⭐ Visualização de rotas
│   ├── LabelManager.ts         # Labels de texto
│   └── GroundRenderer.ts       # Chão (ruas + grama)
│
├── utils/                       # Utilitários
│   ├── MapDataLoader.ts        # Carregamento de dados da API
│   └── RaycastHandler.ts       # Detecção de cliques
│
├── types.ts                     # Interfaces TypeScript
├── MapAPI.ts                    # Classe principal da API
└── index.ts                     # Exports públicos
```

---

## 🚀 Quick Start

```typescript
import { createMapAPI } from '@/services/map'

// 1. Criar instância
const mapAPI = createMapAPI()

// 2. Montar no container
await mapAPI.mount(containerElement)

// 3. Usar a API
mapAPI.highlightBuilding(42)           // Por ID (recomendado)
mapAPI.highlightBuilding('Tecnopuc')   // Por nome

mapAPI.traceRoute([1, 2, 3, 4, 5])    // Rota

mapAPI.clearHighlight()                 // Limpar
mapAPI.clearRoute()                     // Limpar rota
```

---

## 🎯 Métodos Principais (Os que você pediu)

### 1. **highlightBuilding** - Destacar prédio
```typescript
mapAPI.highlightBuilding(buildingId: number | string)
```
✅ Aceita `number` (ID) ou `string` (nome)

### 2. **getHighlightedBuilding** - Obter prédio destacado
```typescript
const building = mapAPI.getHighlightedBuilding()
```
Retorna `BuildingDTO | null`

### 3. **clearHighlight** - Limpar destaque
```typescript
mapAPI.clearHighlight()
```

### 4. **traceRoute** - Traçar rota
```typescript
mapAPI.traceRoute(nodeIdList: number[])
```

### 5. **clearRoute** - Limpar rota
```typescript
mapAPI.clearRoute()
```

---

## 📦 Tipos TypeScript

```typescript
interface BuildingDTO {
  id: number        // ⭐ Use este para highlightBuilding()
  name: string
  modelPath: string
  nodeId: number
}

interface IMapAPI {
  // Building operations
  highlightBuilding(buildingId: number | string): void
  getHighlightedBuilding(): BuildingDTO | null
  clearHighlight(): void
  highlightMultiple(buildingIds: Array<number | string>): void

  // Route operations
  traceRoute(nodeIdList: number[]): void
  clearRoute(): void
  getCurrentRoute(): number[] | null

  // Queries
  getBuildingByName(name: string): BuildingDTO | null
  getBuildingById(id: number): BuildingDTO | null
  getAllBuildings(): BuildingDTO[]

  // Lifecycle
  mount(container: HTMLElement): Promise<void>
  unmount(): void
}
```

---

## 💡 Exemplo Mínimo

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { createMapAPI } from '@/services/map'

const mapContainer = ref<HTMLElement>()
const mapAPI = createMapAPI()

onMounted(async () => {
  await mapAPI.mount(mapContainer.value!)

  // Destacar um prédio por ID
  mapAPI.highlightBuilding(42)

  // Ou buscar por nome primeiro
  const building = mapAPI.getBuildingByName('Tecnopuc')
  if (building) {
    mapAPI.highlightBuilding(building.id)  // ✅ Usar o ID
  }
})
</script>

<template>
  <div ref="mapContainer" style="width: 100%; height: 100vh;"></div>
</template>
```

---

## 🔄 Diferença do mapService Antigo

### Antes (mapService.ts)
```typescript
import mapService from '@/services/mapService'

mapService.highlightModel('building-name')
mapService.unhighlightModel('building-name')
mapService.highlightBuildingNode(buildingId)
```

### Agora (Map API)
```typescript
import { createMapAPI } from '@/services/map'

const mapAPI = createMapAPI()
mapAPI.highlightBuilding(buildingId)   // Por ID
mapAPI.clearHighlight()                 // Limpa automaticamente
```

**Vantagens:**
- ✅ Aceita ID ou nome
- ✅ Limpa automaticamente o destaque anterior
- ✅ API mais limpa e intuitiva
- ✅ TypeScript completo
- ✅ Modular e organizado

---

## 📝 Notas Importantes

1. **Use Building ID sempre que possível**
   ```typescript
   // ✅ Bom
   mapAPI.highlightBuilding(building.id)

   // ⚠️ Funciona, mas menos confiável
   mapAPI.highlightBuilding('nome do predio')
   ```

2. **O mapService.ts antigo ainda funciona**
   - Não é necessário migrar tudo de uma vez
   - A nova API é recomendada para código novo

3. **Highlight limpa automaticamente**
   - Não é necessário chamar `clearHighlight()` antes de destacar outro prédio
   - O método já faz isso internamente

4. **Click no mapa já funciona**
   - Cliques em prédios são detectados automaticamente
   - Use `getHighlightedBuilding()` para saber qual foi clicado

---

## 🎨 Efeitos Visuais

- **Highlight:** Outline cyan brilhante com pulse
- **Rota:** Linha verde elevada conectando nodes
- **Labels:** Texto branco em fundo escuro semi-transparente

---

## 🐛 Debug

```typescript
// Console debugging
console.log(mapAPI.getAllBuildings())
console.log(mapAPI.getHighlightedBuilding())
console.log(mapAPI.getCurrentRoute())
console.log(mapAPI.isInitialized())
```

---

## 📚 Leia Mais

1. [API_SUMMARY.md](./API_SUMMARY.md) - Resumo rápido
2. [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) - Exemplos práticos
3. [README.md](./README.md) - Documentação completa
4. [types.ts](./types.ts) - Definições TypeScript
