# Map API - Exemplos de Uso

## Uso Básico com Building ID

### Exemplo 1: Highlight por Building ID

```typescript
import { createMapAPI } from '@/services/map'

const mapAPI = createMapAPI()
await mapAPI.mount(container)

// Destacar prédio pelo ID (recomendado)
mapAPI.highlightBuilding(42)

// Obter o prédio destacado
const highlightedBuilding = mapAPI.getHighlightedBuilding()
console.log(highlightedBuilding?.name) // Nome do prédio

// Limpar destaque
mapAPI.clearHighlight()
```

### Exemplo 2: Integração com Lista de Prédios

```typescript
import { createMapAPI, type BuildingDTO } from '@/services/map'
import { ref } from 'vue'

const mapAPI = createMapAPI()
const selectedBuildingId = ref<number | null>(null)

// Carregar todos os prédios
const buildings = mapAPI.getAllBuildings()

// Selecionar um prédio da lista
function onBuildingClick(building: BuildingDTO) {
  selectedBuildingId.value = building.id
  mapAPI.highlightBuilding(building.id)  // Usar building.id
}

// Limpar seleção
function clearSelection() {
  selectedBuildingId.value = null
  mapAPI.clearHighlight()
}
```

### Exemplo 3: Buscar e Destacar por Nome

```typescript
import { createMapAPI } from '@/services/map'

const mapAPI = createMapAPI()

// Buscar prédio por nome
const building = mapAPI.getBuildingByName('Tecnopuc')

if (building) {
  // Destacar usando o ID
  mapAPI.highlightBuilding(building.id)
  console.log(`Destacando: ${building.name} (ID: ${building.id})`)
}
```

### Exemplo 4: Rota entre Prédios

```typescript
import { createMapAPI } from '@/services/map'

const mapAPI = createMapAPI()

// Obter prédios de origem e destino
const origem = mapAPI.getBuildingByName('Predio 30')
const destino = mapAPI.getBuildingByName('Tecnopuc')

if (origem && destino) {
  // Calcular rota (implementar pathfinding)
  const path = await calculatePath(origem.nodeId, destino.nodeId)

  // Visualizar rota
  mapAPI.traceRoute(path)

  // Destacar prédio de destino
  mapAPI.highlightBuilding(destino.id)
}
```

### Exemplo 5: Componente Vue Completo

```vue
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { createMapAPI, type BuildingDTO } from '@/services/map'

// Refs
const mapContainer = ref<HTMLElement>()
const selectedBuildingId = ref<number | null>(null)
const buildings = ref<BuildingDTO[]>([])
const searchQuery = ref('')

// Map API
const mapAPI = createMapAPI()

// Lifecycle
onMounted(async () => {
  if (mapContainer.value) {
    await mapAPI.mount(mapContainer.value)
    buildings.value = mapAPI.getAllBuildings()
  }
})

onBeforeUnmount(() => {
  mapAPI.unmount()
})

// Computed
const filteredBuildings = computed(() => {
  if (!searchQuery.value) return buildings.value

  return buildings.value.filter(b =>
    b.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Watch
watch(selectedBuildingId, (buildingId) => {
  if (buildingId) {
    mapAPI.highlightBuilding(buildingId)
  } else {
    mapAPI.clearHighlight()
  }
})

// Methods
function selectBuilding(building: BuildingDTO) {
  selectedBuildingId.value = building.id
}

function clearSelection() {
  selectedBuildingId.value = null
}

function onMapClick(event: MouseEvent) {
  // Click no mapa é tratado automaticamente
  // O prédio clicado será destacado
  const highlighted = mapAPI.getHighlightedBuilding()
  if (highlighted) {
    selectedBuildingId.value = highlighted.id
  }
}
</script>

<template>
  <div class="map-view">
    <aside class="sidebar">
      <h2>Prédios</h2>

      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar prédio..."
        class="search-input"
      />

      <div class="building-list">
        <button
          v-for="building in filteredBuildings"
          :key="building.id"
          :class="{ active: selectedBuildingId === building.id }"
          @click="selectBuilding(building)"
          class="building-item"
        >
          <span class="building-name">{{ building.name }}</span>
          <span class="building-id">ID: {{ building.id }}</span>
        </button>
      </div>

      <button
        v-if="selectedBuildingId"
        @click="clearSelection"
        class="clear-button"
      >
        Limpar Seleção
      </button>
    </aside>

    <main ref="mapContainer" class="map-container"></main>
  </div>
</template>

<style scoped>
.map-view {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 300px;
  padding: 20px;
  background: #f5f5f5;
  overflow-y: auto;
}

.search-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.building-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.building-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.building-item:hover {
  background: #e0e0e0;
}

.building-item.active {
  background: #00ffff;
  border-color: #00cccc;
  color: #000;
}

.building-name {
  font-weight: 500;
}

.building-id {
  font-size: 0.85em;
  color: #666;
}

.building-item.active .building-id {
  color: #000;
}

.clear-button {
  width: 100%;
  margin-top: 15px;
  padding: 12px;
  background: #ff5555;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.clear-button:hover {
  background: #ff3333;
}

.map-container {
  flex: 1;
}
</style>
```

### Exemplo 6: Integração com Router (Seleção via URL)

```vue
<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createMapAPI } from '@/services/map'

const route = useRoute()
const router = useRouter()
const mapAPI = createMapAPI()

onMounted(async () => {
  await mapAPI.mount(container.value)

  // Destacar prédio da URL se existir
  const buildingId = route.query.building
  if (buildingId) {
    mapAPI.highlightBuilding(Number(buildingId))
  }
})

// Watch mudanças na URL
watch(() => route.query.building, (buildingId) => {
  if (buildingId) {
    mapAPI.highlightBuilding(Number(buildingId))
  } else {
    mapAPI.clearHighlight()
  }
})

// Função para navegar para um prédio
function navigateToBuilding(buildingId: number) {
  router.push({
    query: { building: buildingId.toString() }
  })
}
</script>
```

### Exemplo 7: Highlight Múltiplos Prédios (Futuro)

```typescript
// Atualmente highlightMultiple destaca apenas o primeiro
// No futuro, poderá destacar múltiplos simultaneamente

const buildingIds = [1, 2, 3, 4, 5]
mapAPI.highlightMultiple(buildingIds)

// Por enquanto, use um loop para destacar um por vez
buildingIds.forEach(id => {
  // Implementar lógica customizada se necessário
})
```

## Métodos Importantes

### Query Methods

```typescript
// Buscar por nome
const building = mapAPI.getBuildingByName('Tecnopuc')

// Buscar por ID
const building = mapAPI.getBuildingById(42)

// Obter todos os prédios
const allBuildings = mapAPI.getAllBuildings()

// Obter nomes carregados
const names = mapAPI.getLoadedBuildingNames()

// Obter prédio destacado
const highlighted = mapAPI.getHighlightedBuilding()
```

### Conversão entre Nome e ID

```typescript
// Nome → ID
const buildingId = mapAPI.getBuildingIdByName('Tecnopuc')
if (buildingId) {
  console.log(`ID do Tecnopuc: ${buildingId}`)
}

// ID → Building
const building = mapAPI.getBuildingById(buildingId)
console.log(`Nome: ${building?.name}`)

// ID → Node ID
const nodeId = mapAPI.getNodeIdByBuildingId(buildingId)
console.log(`Node ID: ${nodeId}`)
```

## Boas Práticas

### ✅ Recomendado

```typescript
// 1. Sempre use Building ID para highlight
const building = mapAPI.getBuildingByName('Predio 30')
if (building) {
  mapAPI.highlightBuilding(building.id)  // ✅ Usar ID
}

// 2. Armazene ID em vez de nome
const selectedId = ref<number | null>(null)  // ✅

// 3. Use TypeScript para type safety
const buildings: BuildingDTO[] = mapAPI.getAllBuildings()  // ✅
```

### ❌ Evitar

```typescript
// 1. Não usar nome diretamente sem validação
mapAPI.highlightBuilding('predio 30')  // ❌ Case-sensitive, pode falhar

// 2. Não armazenar nome em vez de ID
const selectedName = ref<string>('')  // ❌ Menos confiável

// 3. Não assumir que o prédio existe
mapAPI.highlightBuilding(999)  // ❌ Verificar se existe antes
```

## Troubleshooting

### Prédio não é destacado

```typescript
// Verificar se o prédio existe
const building = mapAPI.getBuildingById(42)
if (!building) {
  console.error('Prédio não encontrado!')
  return
}

// Verificar se o mapa está inicializado
if (!mapAPI.isInitialized()) {
  console.error('Mapa não inicializado!')
  return
}

// Verificar se há erro no console
mapAPI.highlightBuilding(building.id)
const highlighted = mapAPI.getHighlightedBuilding()
console.log('Destacado:', highlighted)
```

### Highlight não limpa

```typescript
// Sempre limpar antes de destacar novo
mapAPI.clearHighlight()
mapAPI.highlightBuilding(newBuildingId)
```
