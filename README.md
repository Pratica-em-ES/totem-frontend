# Totem Frontend

Aplicação frontend em Vue 3 + Vite para visualização interativa de um mapa 3D (three.js), com rotas, busca e sincronização de câmera entre múltiplas instâncias do mapa.

## Stack

- Vue 3 (v3.5.18) + TypeScript 5.8
- Vite 6.0.8
- Vue Router 4.5
- three.js 0.179.1
- vue3-simple-typeahead para busca com autocompletar

## Pré-requisitos

- Node.js: ^20.19.0 ou >=22.12.0 (verificado via `engines` no [package.json](package.json))
- npm (ou pnpm/yarn, adaptando os comandos)

## Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env e configure VITE_BACKEND_URL
```

## Scripts

- `npm install`: instala dependências do projeto
- `npm run dev`: inicia o servidor Vite com hot-reload (porta 5173 por padrão)
- `npm run build`: type-check + build de produção (gera arquivos em `dist/`)
- `npm run preview`: pré-visualiza o build de produção
- `npm run type-check`: checagem de tipos com `vue-tsc`
- `npm run lint`: ESLint com auto-correção (`--fix`)
- `npm run format`: Prettier no diretório `src/`

## Variáveis de Ambiente

- `VITE_BACKEND_URL` (**OBRIGATÓRIA**): base URL do backend para API de rotas e empresas
  - **Não existe fallback** - a aplicação requer esta variável configurada
  - Usado em [src/services/api/http.ts](src/services/api/http.ts) como base para todas as requisições
  - Validado no build-time (aplicação não inicia sem esta variável)

### Configuração local

Crie um arquivo `.env.local` (não versionado) ou `.env`:

```env
VITE_BACKEND_URL=http://localhost:8080
```

### Configuração Docker

Use variável de ambiente ou arquivo `.env`:

```bash
# docker-compose.yml
docker compose up

# Ou docker run com variável:
docker run -e VITE_BACKEND_URL=http://backend:8080 -p 8080:8080 totem-frontend
```

### Deploy (Google Cloud Run)

A variável é injetada no build através de:
- GitHub Actions: secrets `VITE_BACKEND_URL` ([.github/workflows/deploy.yml](.github/workflows/deploy.yml))
- Cloud Build: substitution `_VITE_BACKEND_URL` ([cloudbuild.yaml](cloudbuild.yaml))

## Feature Flags

Arquivo: `src/config/featureFlags.ts`

- `enableCameraAnimation`: animações de câmera
- `showBuildingLabels`: rótulos de prédios
- `showNodeLabels`: rótulos de nós (debug)
- `enableBuildingHighlight`: destaque de prédios
- `showGraphNodes`, `showGraphEdges`: visualização do grafo (debug)
- `enableRouteAnimation`: animação de rotas

Pode ser alterado em runtime via `setFeatureFlag(flag, enabled)`.

## Estrutura do Projeto

```
totem-frontend/
├── src/
│   ├── assets/           # CSS e recursos estáticos
│   ├── components/       # Componentes Vue reutilizáveis
│   │   ├── MapRenderer.vue         # Componente principal do mapa 3D
│   │   ├── LocationSearch.vue      # Busca de localização com autocompletar
│   │   ├── ResetCameraButton.vue   # Controle de câmera
│   │   └── CompanyDetailsView.vue  # Detalhes de empresa
│   ├── composables/      # Composables Vue (lógica reutilizável)
│   │   ├── useFeatureFlags.ts      # Gestão de feature flags
│   │   └── useRouteSearch.ts       # Lógica de busca de rotas
│   ├── config/           # Configurações da aplicação
│   │   └── featureFlags.ts         # Definição de feature flags
│   ├── models/           # TypeScript DTOs e tipos
│   │   ├── BuildingDTO.ts
│   │   └── BuildingCompanyDTO.ts
│   ├── router/           # Configuração Vue Router
│   │   └── index.ts      # Definição de rotas
│   ├── services/         # Serviços e lógica de negócio
│   │   ├── api/          # Cliente HTTP e APIs
│   │   │   ├── http.ts   # Cliente HTTP base
│   │   │   └── index.ts  # Exports consolidados
│   │   └── map/          # Sistema do mapa 3D
│   │       ├── MapAPI.ts # API principal do mapa
│   │       ├── core/     # Gerenciadores principais
│   │       ├── features/ # Features do mapa (labels, rotas, etc.)
│   │       └── utils/    # Utilitários (loader, raycast)
│   ├── views/            # Views/páginas da aplicação
│   │   ├── LandingView.vue    # Página inicial
│   │   ├── HomeView.vue       # Mapa principal
│   │   ├── RoutesView.vue     # Visualização de rotas
│   │   ├── CompaniesView.vue  # Lista de empresas
│   │   └── MapVisualiser.vue  # Visualizador de mapa (teste)
│   ├── App.vue           # Componente raiz
│   └── main.ts           # Entry point da aplicação
├── public/               # Arquivos públicos (não processados)
│   ├── models/           # Modelos GLB/GLTF dos prédios
│   └── fonts/            # Fontes customizadas
├── dist/                 # Build de produção (gerado)
├── .env.example          # Template de variáveis de ambiente
├── Dockerfile            # Multi-stage build com nginx
├── docker-compose.yml    # Orquestração local
├── nginx.production.conf # Configuração nginx para produção
├── cloudbuild.yaml       # Google Cloud Build
└── .github/workflows/    # GitHub Actions CI/CD
```

## Arquitetura (resumo)

### Sistema de Mapa 3D

- [src/services/map/MapAPI.ts](src/services/map/MapAPI.ts): fachada principal do mapa. Expõe operações de:
  - Lifecycle: `mount`, `unmount`
  - Consulta/realce de prédios, rotas, controle de câmera (`resetCamera`, `setInitialCamera`)
  - Clique/raycast para interação com objetos 3D

- [src/services/map/core/](src/services/map/core/):
  - `SceneManager`: cena three.js, câmera e luzes
  - `RendererManager`: WebGLRenderer, postprocessing (EffectComposer/OutlinePass), resize responsivo
  - `ControlsManager`: OrbitControls e gerenciamento da posição inicial
  - `SyncBus`: canal de sincronização entre instâncias (BroadcastChannel + localStorage fallback)
  - `LoaderManager`: carregamento de modelos GLB/GLTF

- [src/services/map/features/](src/services/map/features/): rótulos, destaque, terreno, grafo, rotas, marcador de localização atual

- [src/services/map/utils/](src/services/map/utils/): carregamento de dados (backend), raycasting, etc.

### API e Comunicação

- [src/services/api/http.ts](src/services/api/http.ts): cliente HTTP singleton com validação de `VITE_BACKEND_URL`
  - Métodos: `get<T>()`, `post<T>()`
  - Tratamento centralizado de erros
  - Headers padrão: `Content-Type: application/json`

### Rotas da Aplicação

Configuradas em [src/router/index.ts](src/router/index.ts):

- `/` - Landing page (LandingView)
- `/home` - Mapa principal com busca (HomeView)
- `/rotas` - Visualizador de rotas (RoutesView)
- `/empresas` - Lista de empresas (CompaniesView)
- `/empresas/:id` - Detalhes de empresa (CompanyDetailsView)
- `/map` - Visualizador de mapa para testes (MapVisualiser)

### Componentes Principais

- [src/components/MapRenderer.vue](src/components/MapRenderer.vue): componente que instancia `MapAPI`, monta o canvas e expõe `window.mapAPI` para ferramentas auxiliares
- [src/components/LocationSearch.vue](src/components/LocationSearch.vue): busca com autocompletar usando vue3-simple-typeahead

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

### Ambiente Local

```bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
# Edite .env e configure VITE_BACKEND_URL

# Iniciar servidor de desenvolvimento
npm run dev
# Acesse: http://localhost:5173 (ou porta alternativa)
# Vue DevTools: http://localhost:5173/__devtools__/
```

### Desenvolvimento com Docker

```bash
# Build e execução
docker compose up --build

# Acesse: http://localhost:8080
```

### Qualidade de Código

```bash
# Type-checking (sem erros atualmente)
npm run type-check

# Lint (40 warnings conhecidos - principalmente @typescript-eslint/no-explicit-any)
npm run lint

# Formatação
npm run format
```

### Dicas de Desenvolvimento

- O mapa ocupa 100% do container. Ajuste estilos (altura/largura) do container no layout da view
- O `RendererManager` ajusta aspecto/FOV pelo tamanho do container (sem "stretch")
- O botão "Reset Camera" utiliza `mapAPI.resetCamera()` (mantém sincronizado entre instâncias)
- Use Vue DevTools para inspecionar estado, rotas e performance
- Para debug do grafo 3D, habilite `showGraphNodes` e `showGraphEdges` em [src/config/featureFlags.ts](src/config/featureFlags.ts)

## Build e Deploy

### Build Local

```bash
# Build de produção
npm run build
# Arquivos gerados em dist/

# Preview do build
npm run preview
# Acesse: http://localhost:4173
```

### Docker Build

```bash
# Build da imagem
docker build --build-arg VITE_BACKEND_URL=http://backend-url:8080 -t totem-frontend .

# Executar container
docker run -p 8080:8080 totem-frontend
```

### Deploy Google Cloud Run

Configurado para deploy automático via:

1. **GitHub Actions** ([.github/workflows/deploy.yml](.github/workflows/deploy.yml))
   - Trigger: push na branch `main`
   - Secrets necessários:
     - `GCP_PROJECT_ID`: ID do projeto GCP
     - `GCP_REGION`: região de deploy (ex: `us-central1`)
     - `GCP_SA_KEY`: chave JSON da service account
     - `VITE_BACKEND_URL`: URL do backend

2. **Cloud Build** ([cloudbuild.yaml](cloudbuild.yaml))
   - Substitutions:
     - `_VITE_BACKEND_URL`: URL do backend
     - `_REGION`: região de deploy
   - Build multi-stage com nginx
   - Deploy no Cloud Run com `--allow-unauthenticated`

## Troubleshooting

### Erros Comuns

**Erro: "VITE_BACKEND_URL environment variable is not defined"**
- Solução: Configure a variável no arquivo `.env` ou `.env.local`
- A aplicação não inicia sem esta variável

**Porta em uso no Vite**
- O Vite tentará outra porta automaticamente (ex: 5174, 5175)
- Configurado com `strictPort: false` em [vite.config.ts](vite.config.ts)

**Câmera "esticada" ou aspecto incorreto**
- Verifique CSS do container do mapa (altura/largura)
- Recarregue a página - o renderer se ajusta ao tamanho do container
- O resize é tratado automaticamente pelo `RendererManager`

**Backend ausente/offline**
- Verifique se `VITE_BACKEND_URL` está correto
- Confirme que o backend está rodando e acessível
- Verifique CORS se o backend estiver em domínio diferente

**Modelos 3D não carregam**
- Verifique se os arquivos `.glb` estão em [public/models/](public/models/)
- Confirme que os nomes dos arquivos correspondem aos usados no código
- Abra o console do navegador para ver erros de carregamento

**Build warnings sobre chunk size**
- Esperado: three.js é grande (~823 KB após minificação)
- Considere implementar code-splitting se necessário:
  - Dynamic imports para rotas
  - Lazy loading de componentes pesados

### Lint Warnings Conhecidos

O projeto tem 40 warnings do ESLint, principalmente:
- `@typescript-eslint/no-explicit-any`: uso de `any` em vários arquivos
- `@typescript-eslint/ban-ts-comment`: uso de `@ts-ignore` ao invés de `@ts-expect-error`
- `vue/block-lang`: alguns componentes sem `lang` em `<script>`

Estes não afetam a funcionalidade mas devem ser corrigidos gradualmente.

## Tecnologias e Ferramentas

### Frontend Framework
- **Vue 3** com Composition API
- **TypeScript** para type-safety
- **Vue Router** para navegação SPA

### Renderização 3D
- **three.js** para WebGL e renderização 3D
- **GLTFLoader** para modelos 3D
- **OrbitControls** para navegação no mapa
- **EffectComposer** e **OutlinePass** para pós-processamento

### Build e Dev Tools
- **Vite** - bundler e dev server moderno
- **ESLint** - linting de código
- **Prettier** - formatação de código
- **vue-tsc** - type-checking para Vue

### Infraestrutura
- **Docker** - containerização com nginx
- **Google Cloud Run** - serverless container hosting
- **Google Cloud Build** - CI/CD pipeline
- **GitHub Actions** - workflow automation

### Bibliotecas Auxiliares
- **vue3-simple-typeahead** - componente de busca com autocompletar
- **BroadcastChannel API** - sincronização entre tabs/janelas

## Licença

Este projeto é parte do trabalho acadêmico da PUCRS.

