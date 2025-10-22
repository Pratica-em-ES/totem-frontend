# Map API - Resumo Rápido

## 🎯 API Principal

```typescript
import { createMapAPI } from '@/services/map'

const mapAPI = createMapAPI()
await mapAPI.mount(container)
```

## 📍 Métodos Principais Solicitados

### 1. `highlightBuilding(buildingId: number | string)`

Destaca um prédio no mapa.

```typescript
// ✅ Por ID (recomendado)
mapAPI.highlightBuilding(42)

// ✅ Por nome
mapAPI.highlightBuilding('Tecnopuc')
```

**Aceita:**
- `number` - Building ID (mais confiável)
- `string` - Building name (case-sensitive)

**Efeitos:**
- Aplica outline cyan brilhante no prédio
- Destaca o node associado ao prédio
- Limpa highlights anteriores automaticamente

---

### 2. `getHighlightedBuilding()`

Retorna o prédio atualmente destacado.

```typescript
const building = mapAPI.getHighlightedBuilding()

if (building) {
  console.log(building.id)      // ID do prédio
  console.log(building.name)    // Nome do prédio
  console.log(building.nodeId)  // Node associado
}
```

**Retorna:**
- `BuildingDTO` - Se há um prédio destacado
- `null` - Se nenhum prédio está destacado

---

### 3. `clearHighlight()`

Remove todos os destaques do mapa.

```typescript
mapAPI.clearHighlight()
```

**Efeitos:**
- Remove outline do prédio
- Remove destaque do node
- Limpa estado interno

---

### 4. `traceRoute(nodeIdList: number[])`

Visualiza uma rota através de uma lista de node IDs.

```typescript
// Rota através dos nodes 1 → 2 → 3 → 4 → 5
mapAPI.traceRoute([1, 2, 3, 4, 5])
```

**Parâmetros:**
- `nodeIdList` - Array de IDs de nodes (mínimo 2)

**Efeitos:**
- Desenha linha verde conectando os nodes
- Linha elevada 2.5 unidades acima do chão
- Limpa rota anterior automaticamente

**Configuração da linha:**
- Cor padrão: Verde (`0x00ff00`)
- Largura: 5 pixels
- Opacidade: 0.9

---

### 5. `clearRoute()`

Remove a visualização da rota atual.

```typescript
mapAPI.clearRoute()
```

---

## 🔍 Métodos de Query

### Buscar Prédios

```typescript
// Por nome
const building = mapAPI.getBuildingByName('Tecnopuc')

// Por ID
const building = mapAPI.getBuildingById(42)

// Todos os prédios
const buildings = mapAPI.getAllBuildings()
```

### Conversões

```typescript
// Nome → ID
const id = mapAPI.getBuildingIdByName('Tecnopuc')

// Building ID → Node ID
const nodeId = mapAPI.getNodeIdByBuildingId(42)
```

### Estado

```typescript
// Verificar se inicializado
if (mapAPI.isInitialized()) {
  // Mapa pronto
}

// Obter rota atual
const route = mapAPI.getCurrentRoute()
```

---

## 📦 Tipos TypeScript

```typescript
interface BuildingDTO {
  id: number
  name: string
  modelPath: string
  nodeId: number
}

interface NodeDTO {
  id: number
  x: number  // posição X
  y: number  // posição Z (não confundir com altura)
}

interface EdgeDTO {
  id: number
  aNodeId: number
  bNodeId: number
  length: number
}
```

---

## 🎨 Exemplo Completo

```typescript
import { createMapAPI } from '@/services/map'

// 1. Criar e montar
const mapAPI = createMapAPI()
await mapAPI.mount(document.getElementById('map'))

// 2. Buscar prédio
const building = mapAPI.getBuildingByName('Tecnopuc')

// 3. Destacar usando ID
if (building) {
  mapAPI.highlightBuilding(building.id)
}

// 4. Verificar destaque
const highlighted = mapAPI.getHighlightedBuilding()
console.log(`Destacado: ${highlighted?.name}`)

// 5. Criar rota
const path = [1, 5, 10, 15, 20]
mapAPI.traceRoute(path)

// 6. Limpar tudo
setTimeout(() => {
  mapAPI.clearHighlight()
  mapAPI.clearRoute()
}, 5000)

// 7. Cleanup
// mapAPI.unmount()
```

---

## 🔄 Fluxo Típico de Uso

```
1. createMapAPI()
   ↓
2. mount(container)
   ↓
3. getBuildingByName(name) ou getAllBuildings()
   ↓
4. highlightBuilding(building.id)
   ↓
5. getHighlightedBuilding()
   ↓
6. traceRoute([...nodes])
   ↓
7. clearHighlight() / clearRoute()
   ↓
8. unmount()
```

---

## 🎯 Casos de Uso

### Caso 1: Lista de Prédios

```typescript
const buildings = mapAPI.getAllBuildings()

buildings.forEach(building => {
  console.log(`${building.name} (ID: ${building.id})`)
})

// Usuário clica em um item
function onBuildingClick(building: BuildingDTO) {
  mapAPI.highlightBuilding(building.id)  // ✅ Usar building.id
}
```

### Caso 2: Navegação com Rota

```typescript
// Origem e destino
const origem = mapAPI.getBuildingByName('Predio 30')
const destino = mapAPI.getBuildingByName('Tecnopuc')

if (origem && destino) {
  // Calcular caminho (implementar pathfinding)
  const path = await findPath(origem.nodeId, destino.nodeId)

  // Mostrar rota
  mapAPI.traceRoute(path)

  // Destacar destino
  mapAPI.highlightBuilding(destino.id)
}
```

### Caso 3: Sincronizar com Estado Global

```typescript
import { ref, watch } from 'vue'

const selectedBuildingId = ref<number | null>(null)

watch(selectedBuildingId, (buildingId) => {
  if (buildingId) {
    mapAPI.highlightBuilding(buildingId)
  } else {
    mapAPI.clearHighlight()
  }
})

// De qualquer lugar da aplicação
selectedBuildingId.value = 42  // Destaca automaticamente
```

---

## ⚡ Performance

- ✅ Modelos são cacheados após primeiro carregamento
- ✅ Outline usa post-processing (eficiente)
- ✅ Raycasting otimizado para cliques
- ✅ Render loop inteligente

---

## 🐛 Debug

```typescript
// Verificar prédios carregados
console.log(mapAPI.getLoadedBuildingNames())

// Verificar prédio destacado
console.log(mapAPI.getHighlightedBuilding())

// Verificar rota atual
console.log(mapAPI.getCurrentRoute())

// Verificar inicialização
console.log(mapAPI.isInitialized())
```

---

## 📚 Documentação Completa

- [README.md](./README.md) - Documentação detalhada
- [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) - Exemplos práticos
- [types.ts](./types.ts) - Definições TypeScript

---

## 🎨 Efeitos Visuais

### Highlight de Prédio
- Outline cyan brilhante (`#00ffff`)
- Edge strength: 5.0
- Edge glow: 1.0
- Pulse period: 2 segundos

### Rota
- Linha verde elevada
- Largura: 5 pixels
- Y offset: 2.5 unidades
- Opacidade: 0.9
