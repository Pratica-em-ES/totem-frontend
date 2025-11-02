# Totem Frontend

Aplicação frontend em Vue 3 + Vite para visualização interativa de um mapa 3D (three.js), com rotas, busca e sincronização de câmera entre múltiplas instâncias do mapa.

## Stack

- Vue 3 + TypeScript
- Vite 6
- Vue Router 4
- three.js 0.179

## Pré‑requisitos

- Node.js: ^20.19.0 ou >=22.12.0 (verificado via `engines` no package.json)
- npm (ou pnpm/yarn, adaptando os comandos)

## Scripts
- `npm install`: instala dependências do projeto
- `npm run dev`: inicia o servidor Vite com hot-reload
- `npm run build`: type-check + build de produção
- `npm run preview`: pré-visualiza o build
- `npm run type-check`: checagem de tipos (`vue-tsc`)
- `npm run lint`: ESLint com `--fix`
- `npm run format`: Prettier no diretório `src/`

## Variáveis de Ambiente

- `VITE_BACKEND_URL` (opcional): base URL do backend para rotas
  - Default: `http://localhost:8080`
  - Usado em `MapAPI.traceRouteByNodeIds`

Crie um arquivo `.env.local` (não versionado) se necessário:

```env
VITE_BACKEND_URL=http://localhost:8080
```

## Feature Flags

Arquivo: `src/config/featureFlags.ts`

- `enableCameraAnimation`: animações de câmera
- `showBuildingLabels`: rótulos de prédios
- `showNodeLabels`: rótulos de nós (debug)
- `enableBuildingHighlight`: destaque de prédios
- `showGraphNodes`, `showGraphEdges`: visualização do grafo (debug)
- `enableRouteAnimation`: animação de rotas

Pode ser alterado em runtime via `setFeatureFlag(flag, enabled)`.

## Arquitetura (resumo)

- `src/services/map/MapAPI.ts`: fachada principal do mapa. Expõe operações de:
  - Lifecycle: `mount`, `unmount`
  - Consulta/realce de prédios, rotas, controle de câmera (`resetCamera`, `setInitialCamera`)
  - Clique/raycast
- `src/services/map/core/*`:
  - `SceneManager`: cena, câmera e luzes
  - `RendererManager`: WebGLRenderer, postprocessing (EffectComposer/OutlinePass), resize para o container
  - `ControlsManager`: OrbitControls e gerenciamento da posição inicial
  - `SyncBus`: canal de sincronização entre instâncias (BroadcastChannel + fallback)
- `src/services/map/features/*`: rótulos, destaque, terreno, grafo, rotas, marcador de localização atual
- `src/services/map/utils/*`: carregamento de dados (backend), raycasting etc.
- `src/components/MapRenderer.vue`: componente que instancia `MapAPI`, monta o canvas e expõe `window.mapAPI` para ferramentas auxiliares (ex.: busca)

### Sincronização de câmera entre instâncias

- Ao montar, uma instância do mapa:
  - Lê o último estado de câmera do `SyncBus` e adota imediatamente (se existir)
  - Só emite seu estado inicial se ainda não existir um estado conhecido (evita “resetar” outras telas)
- Mudanças via OrbitControls disparam broadcast para manter todas as instâncias sincronizadas
- `SyncBus` persiste o último estado em memória e `localStorage`

### Configuração de câmera inicial

- API pública:
  - `mapAPI.setInitialCamera({ x, y, z }, { x, y, z })`
- Via componente:

```vue
<MapRenderer
  :initialCamera="{
    position: { x: -150, y: 250, z: 180 },
    target: { x: 0, y: 0, z: 0 }
  }"
/>
```

## Desenvolvimento

```bash
npm run dev
# Local: http://localhost:5173 (ou porta alternativa)
# Vue DevTools: http://localhost:5173/__devtools__/
```

### Dicas

- O mapa ocupa 100% do container. Ajuste estilos (altura/largura) do container no layout da view
- O `RendererManager` ajusta aspecto/FOV pelo tamanho do container (sem “stretch”)
- O botão “Reset Camera” utiliza `mapAPI.resetCamera()` (mantém sincronizado)

### Qualidade

```bash
npm run type-check
npm run lint
npm run format
```

## Troubleshooting

- Porta em uso no Vite: ele tentará outra porta automaticamente
- Se a câmera parecer “esticada”, verifique CSS do container (altura/largura) e recarregue; o renderer se ajusta ao container
- Backend ausente para rotas: configure `VITE_BACKEND_URL` ou inicie o backend local em `http://localhost:8080`

