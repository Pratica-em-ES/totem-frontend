# Map Service - 3D Campus Visualization

Clean, modular API for 3D building and route visualization using three.js.

## 🚀 Quick Start

```typescript
import { createMapAPI } from '@/services/map'

// Create a new map instance
const mapAPI = createMapAPI()

// Mount to a container
await mapAPI.mount(document.getElementById('map-container'))

// Highlight a building by ID (recommended - more reliable)
mapAPI.highlightBuilding(42)

// Or by name
mapAPI.highlightBuilding('building-name')

// Trace a route through nodes
mapAPI.traceRoute([1, 2, 3, 4, 5])

// Get currently highlighted building
const building = mapAPI.getHighlightedBuilding()

// Clear highlight
mapAPI.clearHighlight()

// Clear route
mapAPI.clearRoute()

// Cleanup when done
mapAPI.unmount()
```

## 📋 API Reference

### Core Methods

#### `mount(container: HTMLElement): Promise<void>`
Initialize and mount the map to a DOM container.

```typescript
await mapAPI.mount(containerElement)
```

#### `unmount(): void`
Cleanup and remove the map from the DOM.

```typescript
mapAPI.unmount()
```

### Building Operations

#### `highlightBuilding(buildingId: number | string): void`
Highlight a building by ID (number) or name (string).

**Parameters:**
- `buildingId`: Can be either:
  - `number` - Building ID (recommended, more reliable)
  - `string` - Building name (case-sensitive)

```typescript
// ✅ Recommended: Highlight by building ID
mapAPI.highlightBuilding(42)

// ✅ Alternative: Highlight by building name
mapAPI.highlightBuilding('Predio 30')

// Example with actual usage
const building = mapAPI.getBuildingByName('Tecnopuc')
if (building) {
  mapAPI.highlightBuilding(building.id)  // Using ID
}
```

> **Note:** Using building ID is recommended as it's more reliable and doesn't depend on name matching. Building names are case-sensitive and must match exactly.

#### `getHighlightedBuilding(): BuildingDTO | null`
Get the currently highlighted building.

```typescript
const building = mapAPI.getHighlightedBuilding()
if (building) {
  console.log(`Highlighted: ${building.name}`)
}
```

#### `clearHighlight(): void`
Clear all building highlights.

```typescript
mapAPI.clearHighlight()
```

#### `highlightMultiple(buildingIds: Array<number | string>): void`
Highlight multiple buildings (currently highlights the first one).

```typescript
mapAPI.highlightMultiple(['building1', 'building2'])
```

### Route Operations

#### `traceRoute(nodeIdList: number[]): void`
Visualize a route through a list of node IDs.

```typescript
mapAPI.traceRoute([1, 2, 3, 4, 5])
```

#### `clearRoute(): void`
Clear the current route visualization.

```typescript
mapAPI.clearRoute()
```

#### `getCurrentRoute(): number[] | null`
Get the current route node list.

```typescript
const route = mapAPI.getCurrentRoute()
```

### Query Methods

#### `getBuildingByName(name: string): BuildingDTO | null`
Find a building by name.

```typescript
const building = mapAPI.getBuildingByName('Predio 30')
```

#### `getBuildingById(id: number): BuildingDTO | null`
Find a building by ID.

```typescript
const building = mapAPI.getBuildingById(42)
```

#### `getAllBuildings(): BuildingDTO[]`
Get all buildings in the map.

```typescript
const buildings = mapAPI.getAllBuildings()
```

#### `getLoadedBuildingNames(): string[]`
Get names of all loaded buildings.

```typescript
const names = mapAPI.getLoadedBuildingNames()
```

### Click Handling

#### `handleClick(event: MouseEvent): void`
Handle click events (automatically set up on mount).

```typescript
mapAPI.handleClick(event)
```

### Utility Methods

#### `isInitialized(): boolean`
Check if the map is initialized.

```typescript
if (mapAPI.isInitialized()) {
  // Map is ready
}
```

#### `reload(url?: string): Promise<void>`
Reload map data from backend.

```typescript
await mapAPI.reload()
// or from a specific URL
await mapAPI.reload('https://api.example.com/map')
```

## 🏗️ Architecture

### Directory Structure

```
src/services/map/
├── core/                        # Core three.js managers
│   ├── SceneManager.ts         # Scene, camera, lighting
│   ├── RendererManager.ts      # WebGL renderer, post-processing
│   ├── ControlsManager.ts      # Orbit controls
│   └── LoaderManager.ts        # GLTF, texture loading
├── features/                    # Feature modules
│   ├── BuildingHighlighter.ts  # Building highlight logic
│   ├── RouteTracer.ts          # Route visualization
│   ├── LabelManager.ts         # Text labels
│   └── GroundRenderer.ts       # Street/grass rendering
├── utils/                       # Utilities
│   ├── MapDataLoader.ts        # API data fetching
│   └── RaycastHandler.ts       # Click detection
├── types.ts                     # TypeScript interfaces
├── MapAPI.ts                    # Main API class
├── index.ts                     # Public exports
└── README.md                    # This file
```

### Module Responsibilities

#### Core Modules

**SceneManager**
- Creates and manages three.js scene
- Configures camera
- Sets up lighting (sun + ambient)

**RendererManager**
- WebGL renderer initialization
- Post-processing pipeline (outline effects)
- Animation loop
- Window resize handling

**ControlsManager**
- Orbit camera controls
- Pan/zoom constraints
- Damping configuration

**LoaderManager**
- GLTF/GLB model loading
- Texture loading
- Model caching

#### Feature Modules

**BuildingHighlighter**
- Building selection state
- Outline effect application
- Material color changes
- Node highlighting

**RouteTracer**
- Route path visualization
- Line rendering (three.js Line2)
- Route segment creation
- Color/width configuration

**LabelManager**
- Building name labels
- Node ID labels (debug mode)
- Canvas-based sprite rendering

**GroundRenderer**
- Street alpha map generation
- Grass/road texture application
- Ground plane rendering

#### Utilities

**MapDataLoader**
- Fetches map data from backend API
- Data validation
- Environment variable handling

**RaycastHandler**
- Mouse click detection
- Building intersection testing
- Screen-to-3D coordinate conversion

## 🎨 Visual Effects

### Outline Highlighting

Buildings are highlighted with a glowing cyan outline using post-processing:

- **Edge Strength:** 5.0
- **Edge Glow:** 1.0
- **Edge Thickness:** 2.0
- **Pulse Period:** 2 seconds
- **Color:** Cyan (#00ffff)

### Route Visualization

Routes are rendered as elevated lines:

- **Default Color:** Green (0x00ff00)
- **Line Width:** 5 pixels
- **Y Offset:** 2.5 units (above ground)
- **Opacity:** 0.9

## 🔧 Configuration

### Environment Variables

```bash
VITE_BACKEND_URL=http://localhost:8080
```

The map loads data from `${VITE_BACKEND_URL}/map`

### Camera Settings

- **FOV:** 75°
- **Initial Position:** (-68, 200, 322.84)
- **Min Distance:** 120 units
- **Max Distance:** 600 units
- **Max Polar Angle:** 80° (prevents looking below ground)

### Renderer Settings

- **Tone Mapping:** ACES Filmic
- **Shadow Map:** Enabled (PCF Soft)
- **Antialiasing:** Enabled

## 📦 Data Models

### BuildingDTO
```typescript
{
  id: number
  name: string
  modelPath: string
  nodeId: number
}
```

### NodeDTO
```typescript
{
  id: number
  x: number  // position
  y: number  // position
}
```

### EdgeDTO
```typescript
{
  id: number
  aNodeId: number
  bNodeId: number
  length: number
}
```

### MapDTO
```typescript
{
  buildings: BuildingDTO[]
  nodes: NodeDTO[]
  edges: EdgeDTO[]
}
```

## 🧪 Usage Examples

### Complete Vue Component with Building ID

```vue
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { createMapAPI, type BuildingDTO } from '@/services/map'

const mapContainer = ref<HTMLElement>()
const mapAPI = createMapAPI()
const buildings = ref<BuildingDTO[]>([])
const selectedBuildingId = ref<number | null>(null)

onMounted(async () => {
  if (mapContainer.value) {
    await mapAPI.mount(mapContainer.value)
    buildings.value = mapAPI.getAllBuildings()
  }
})

onBeforeUnmount(() => {
  mapAPI.unmount()
})

// Watch for selection changes
watch(selectedBuildingId, (buildingId) => {
  if (buildingId) {
    mapAPI.highlightBuilding(buildingId)  // Pass building ID directly
  } else {
    mapAPI.clearHighlight()
  }
})

function selectBuilding(building: BuildingDTO) {
  selectedBuildingId.value = building.id
}

function clearSelection() {
  selectedBuildingId.value = null
}
</script>

<template>
  <div class="container">
    <div ref="mapContainer" class="map-container"></div>

    <div class="building-list">
      <h3>Buildings</h3>
      <button
        v-for="building in buildings"
        :key="building.id"
        :class="{ active: selectedBuildingId === building.id }"
        @click="selectBuilding(building)"
      >
        {{ building.name }}
      </button>
      <button @click="clearSelection">Clear Selection</button>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  height: 100vh;
}

.map-container {
  flex: 1;
}

.building-list {
  width: 300px;
  padding: 20px;
  overflow-y: auto;
}

.building-list button {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
  cursor: pointer;
}

.building-list button.active {
  background-color: #00ffff;
  color: black;
}
</style>
```

### Vue Component Integration

```vue
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { createMapAPI } from '@/services/map'

const mapContainer = ref<HTMLElement>()
const mapAPI = createMapAPI()

onMounted(async () => {
  if (mapContainer.value) {
    await mapAPI.mount(mapContainer.value)
  }
})

onBeforeUnmount(() => {
  mapAPI.unmount()
})

function selectBuilding(name: string) {
  mapAPI.highlightBuilding(name)
}

function showRoute(nodes: number[]) {
  mapAPI.traceRoute(nodes)
}
</script>

<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
}
</style>
```

### Building Selection with State (Using Building ID)

```typescript
import { createMapAPI } from '@/services/map'
import { ref, watch } from 'vue'

const selectedBuildingId = ref<number | null>(null)
const mapAPI = createMapAPI()

// Watch for building ID changes and highlight accordingly
watch(selectedBuildingId, (newId) => {
  if (newId) {
    mapAPI.highlightBuilding(newId)  // Pass building ID directly
  } else {
    mapAPI.clearHighlight()
  }
})

// Example: Select building by ID
function selectBuilding(buildingId: number) {
  selectedBuildingId.value = buildingId
}

// Example: Select building by clicking on a list item
function onBuildingClick(building: BuildingDTO) {
  selectedBuildingId.value = building.id  // Use building.id
}
```

### Pathfinding Visualization

```typescript
import { createMapAPI } from '@/services/map'

const mapAPI = createMapAPI()

// After calculating a path
const path = await calculatePath(startNodeId, endNodeId)
mapAPI.traceRoute(path)

// Clear when done
setTimeout(() => {
  mapAPI.clearRoute()
}, 5000)
```

## 🔄 Migration from Legacy mapService

### Before (Legacy)
```typescript
import mapService from '@/services/mapService'

await mapService.loadSceneFromUrl()
mapService.mount(container)
mapService.highlightModel('building-name')
mapService.handleCanvasClick(event, canvas)
```

### After (New API)
```typescript
import { createMapAPI } from '@/services/map'

const mapAPI = createMapAPI()
await mapAPI.mount(container)
mapAPI.highlightBuilding('building-name')
// Click handling is automatic
```

## 🐛 Debugging

### Enable Node Markers (Development)

Node markers are automatically shown in development mode:

```typescript
// In development (DEV=true), yellow circles show at each node
// Red circles indicate the highlighted building's node
```

### Console Debugging

```typescript
// Get all loaded buildings
console.log(mapAPI.getLoadedBuildingNames())

// Check if initialized
console.log(mapAPI.isInitialized())

// Get current highlight
console.log(mapAPI.getHighlightedBuilding())

// Get current route
console.log(mapAPI.getCurrentRoute())
```

## 📝 Notes

- The old `mapService.ts` remains for backward compatibility
- Camera damping is enabled for smooth controls
- Building labels are auto-generated from building names
- Models are cached for performance
- All textures are loaded from `/public/textures/`
- All building models are loaded from `/public/models/`

## 🚀 Performance

- **Model Caching:** GLTF models are cached after first load
- **Instancing:** Models can be cloned from cache
- **Post-Processing:** Single-pass outline effect
- **Smart Rendering:** Animation loop only renders when needed
- **Texture Compression:** Anisotropic filtering enabled

## 🔮 Future Enhancements

- [ ] Multi-building selection
- [ ] Animated route tracing
- [ ] Camera flyover animations
- [ ] Building information popups
- [ ] Minimap overlay
- [ ] Performance metrics
- [ ] VR/AR support
