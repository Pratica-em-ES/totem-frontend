import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { Line2 } from 'three/addons/lines/Line2.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import { LineGeometry } from 'three/addons/lines/LineGeometry.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import type { MapDTO, MapBuildingDTO } from '../models/MapDTO'
import type { EdgeDTO } from '../models/EdgeDTO'
import type { NodeDTO } from '../models/NodeDTO'

let initialized = false
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let animationRunning = false

// Post-processing para outline effect
let composer: EffectComposer | null = null
let outlinePass: OutlinePass | null = null

const loadedModels = new Map<string, THREE.Object3D>()
const originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>()
const nodeMarkers: THREE.Sprite[] = []
const nodeLabels: THREE.Sprite[] = []
const buildingLabels: THREE.Sprite[] = []

// Mapping de building ID para node ID
const buildingIdToNodeIdMap = new Map<number, number>()
// Mapping de building name para building ID (para CompanyCard que tem apenas o nome)
const buildingNameToIdMap = new Map<string, number>()
// Mapping de building ID para o modelo 3D
const buildingIdToModelMap = new Map<number, THREE.Object3D>()
let currentNodesMap: Map<number, NodeDTO> | null = null

// Mapping de mesh para building ID (para raycasting)
const meshToBuildingIdMap = new Map<THREE.Mesh, number>()

// Raycaster para detecção de cliques
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

// Flag para mostrar marcadores de nodes (apenas em dev)
const SHOW_NODE_MARKERS = import.meta.env.DEV

async function initIfNeeded(containerSize?: { w: number, h: number }) {
    if (initialized) return
    initialized = true

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(10, (containerSize?.w ?? 1) / (containerSize?.h ?? 1), 0.01, 2000)
    camera.position.set(-68, 200, 322.84)
    camera.up.set(0, 1, 0)
    camera.lookAt(0, 0, 0)

    const sunlight = new THREE.DirectionalLight(0xffffff, 1)
    sunlight.position.set(30, 20, 10)
    sunlight.castShadow = true
    sunlight.shadow.camera.top = 200
    sunlight.shadow.camera.bottom = -200
    sunlight.shadow.camera.left = -200
    sunlight.shadow.camera.right = 200
    sunlight.shadow.camera.near = 1
    sunlight.shadow.camera.far = 2000
    scene.add(sunlight)

    scene.add(new THREE.AmbientLight(0xffffff, 1))
    scene.add(new THREE.DirectionalLight(0xffffff, 2))

    renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    // @ts-ignore older three versions:
    renderer.outputColorSpace = THREE.SRGBColorSpace ?? (renderer as any).outputEncoding
    renderer.shadowMap.enabled = true

    renderer.setClearColor(0x808080, 1)
    if (scene) scene.background = new THREE.Color(0x808080)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.minDistance = 120
    controls.maxDistance = 600
    controls.enableDamping = true
    controls.maxPolarAngle = Math.PI / 2 - 0.1

    // Setup post-processing para outline effect
    composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    outlinePass = new OutlinePass(
        new THREE.Vector2(containerSize?.w ?? 1, containerSize?.h ?? 1),
        scene,
        camera
    )
    // Configurar aparência do outline (estilo Spectral Arrow do Minecraft)
    outlinePass.edgeStrength = 5.0      // Intensidade da borda
    outlinePass.edgeGlow = 1.0          // Brilho/glow da borda
    outlinePass.edgeThickness = 2.0     // Espessura da borda
    outlinePass.pulsePeriod = 2         // Período de pulsação (em segundos)
    outlinePass.visibleEdgeColor.set('#00ffff')  // Cor ciano brilhante (tipo spectral)
    outlinePass.hiddenEdgeColor.set('#0088ff')   // Cor azul para partes ocultas
    composer.addPass(outlinePass)

    // Adicionar OutputPass para manter o brilho e cores corretas
    const outputPass = new OutputPass()
    composer.addPass(outputPass)

    // animate loop
    const animate = (time: number) => {
        controls?.update()

        // Atualizar orientação dos marcadores de nodes para sempre ficarem de frente para a câmera
        if (SHOW_NODE_MARKERS && camera) {
            const cameraPos = camera.position
            nodeMarkers.forEach(marker => {
                marker.lookAt(cameraPos)
            })
            nodeLabels.forEach(label => {
                label.lookAt(cameraPos)
            })
        }

        // Atualizar orientação dos labels das buildings
        if (camera) {
            const cameraPos = camera.position
            buildingLabels.forEach(label => {
                label.lookAt(cameraPos)
            })
        }

        // Renderizar com post-processing (inclui outline)
        if (composer) {
            composer.render()
        } else if (renderer && scene && camera) {
            renderer.render(scene, camera)
        }
    }
    renderer.setAnimationLoop(animate)
    animationRunning = true
}

function mount(container: HTMLElement) {
    const rect = container.getBoundingClientRect()
    initIfNeeded({ w: rect.width, h: rect.height })
    if (!renderer) return
    container.appendChild(renderer.domElement)
    renderer.setSize(rect.width, rect.height)
    window.addEventListener('resize', () => {
        const r = container.getBoundingClientRect()
        camera!.aspect = r.width / r.height
        camera!.updateProjectionMatrix()
        renderer!.setSize(r.width, r.height)
        composer?.setSize(r.width, r.height)
    })
}

function unmount(container: HTMLElement) {
    if (!renderer) return
    if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
    }
    // manter renderer em memória para preservar estado
}

async function loadSceneFromUrl(url?: string) {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'
    const mapUrl = url || `${API_BASE_URL}/map`

    try {
        const res = await fetch(mapUrl)
        const data: MapDTO = await res.json()
        if (scene) {
            // Criar mapa de nodes a partir da lista de nodes
            const nodesMap = new Map<number, NodeDTO>()
            data.nodes.forEach(node => {
                nodesMap.set(node.id, node)
            })

            // Armazenar referência para uso posterior
            currentNodesMap = nodesMap

            // Criar mapas de buildings
            buildingIdToNodeIdMap.clear()
            buildingNameToIdMap.clear()
            data.buildings.forEach(building => {
                buildingIdToNodeIdMap.set(building.id, building.nodeId)
                buildingNameToIdMap.set(building.name, building.id)
            })

            // Processar edges para carregar o chão
            loadGround(data.edges, nodesMap)
            // Criar marcadores visuais nos nodes (apenas em dev)
            createNodeMarkers(nodesMap)
            // Criar labels com IDs nos nodes (apenas em dev)
            createNodeIdLabels(nodesMap)
            // Criar linhas entre nodes usando edges (apenas em dev)
            createEdgeLines(data.edges, nodesMap)
            // Carregar modelos 3D dos buildings
            await loadModels(data.buildings, nodesMap)
        }
    } catch (err) {
        console.error('Erro loadSceneFromUrl', err)
    }
}

/* --- Função para criar marcadores visuais nos nodes --- */
function createNodeMarkers(nodesMap: Map<number, NodeDTO>, highlightedNodeId?: number) {
    if (!scene || !SHOW_NODE_MARKERS) return

    // Limpar marcadores anteriores
    nodeMarkers.forEach(marker => scene!.remove(marker))
    nodeMarkers.length = 0

    // Função auxiliar para criar canvas com círculo colorido
    const createCircleCanvas = (color: string) => {
        const canvas = document.createElement('canvas')
        canvas.width = 64
        canvas.height = 64
        const ctx = canvas.getContext('2d')
        if (ctx) {
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(32, 32, 30, 0, Math.PI * 2)
            ctx.fill()
        }
        return canvas
    }

    // Criar um sprite para cada node
    nodesMap.forEach(node => {
        // Determinar a cor: vermelho se for o node destacado, amarelo caso contrário
        const isHighlighted = highlightedNodeId !== undefined && node.id === highlightedNodeId
        const color = isHighlighted ? 'rgba(255, 0, 0, 1)' : 'rgba(255, 255, 0, 1)'
        const colorHex = isHighlighted ? 0xff0000 : 0xffff00

        const canvas = createCircleCanvas(color)
        const texture = new THREE.CanvasTexture(canvas)

        const markerMaterial = new THREE.SpriteMaterial({
            color: colorHex,
            map: texture,
            transparent: true,
            opacity: 0.8,
            depthTest: false,  // Renderiza acima de tudo
            depthWrite: false
        })
        markerMaterial.needsUpdate = true

        const sprite = new THREE.Sprite(markerMaterial)
        sprite.position.set(node.x, 5, node.y)  // Altura de 5 unidades acima do chão
        sprite.scale.set(1.5, 1.5, 1)  // Tamanho do círculo
        sprite.renderOrder = 999  // Renderiza por último (acima de tudo)

        scene!.add(sprite)
        nodeMarkers.push(sprite)
    })
}

/* --- Função para criar labels de IDs nos nodes --- */
function createNodeIdLabels(nodesMap: Map<number, NodeDTO>) {
    if (!scene || !SHOW_NODE_MARKERS) return

    // Limpar labels anteriores
    nodeLabels.forEach(label => scene!.remove(label))
    nodeLabels.length = 0

    nodesMap.forEach(node => {
        // Criar canvas para o texto
        const canvas = document.createElement('canvas')
        const fontSize = 48
        canvas.width = 128
        canvas.height = 64
        const ctx = canvas.getContext('2d')

        if (ctx) {
            // Fundo semi-transparente escuro
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Texto branco com o ID
            ctx.fillStyle = '#ffffff'
            ctx.font = `bold ${fontSize}px Arial`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(`${node.id}`, canvas.width / 2, canvas.height / 2)
        }

        // Criar textura e material
        const texture = new THREE.CanvasTexture(canvas)
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false
        })

        // Criar sprite
        const sprite = new THREE.Sprite(material)
        sprite.position.set(node.x, 7, node.y)  // 2 unidades acima do círculo (que está em y=5)
        sprite.scale.set(2, 1, 1)  // Proporção do label
        sprite.renderOrder = 1000  // Renderiza acima dos círculos

        scene!.add(sprite)
        nodeLabels.push(sprite)
    })
}

/* --- Função para criar linhas entre nodes usando edges --- */
function createEdgeLines(edges: EdgeDTO[], nodesMap: Map<number, NodeDTO>) {
    if (!scene || !SHOW_NODE_MARKERS || !renderer) return

    // Criar material emissivo azul para as linhas com espessura 3x maior
    const lineMaterial = new LineMaterial({
        color: 0x0088ff,
        linewidth: 6,  // 6 pixels de espessura (3x maior que o original de 2)
        transparent: true,
        opacity: 0.8,
        depthTest: false,  // Renderiza acima de tudo
        depthWrite: false,
        worldUnits: false,  // Espessura em pixels de tela
        resolution: new THREE.Vector2(
            renderer.domElement.width,
            renderer.domElement.height
        )
    })

    edges.forEach(edge => {
        const nodeA = nodesMap.get(edge.aNodeId)
        const nodeB = nodesMap.get(edge.bNodeId)

        if (!nodeA || !nodeB) {
            console.warn(`Edge ${edge.id}: Missing nodes - aNodeId: ${edge.aNodeId}, bNodeId: ${edge.bNodeId}`)
            return
        }

        // Criar geometria da linha usando Line2 (suporta espessura real)
        const positions = [
            nodeA.x, 5, nodeA.y,  // Mesma altura dos círculos
            nodeB.x, 5, nodeB.y
        ]
        const geometry = new LineGeometry()
        geometry.setPositions(positions)

        const line = new Line2(geometry, lineMaterial)
        line.renderOrder = 998  // Renderiza antes dos círculos mas acima de tudo mais
        line.computeLineDistances()  // Necessário para Line2

        scene!.add(line)
    })
}

/* --- Copiar/portar aqui as funções de loadGround e loadModels (adaptadas) --- */
function loadGround(streets: EdgeDTO[], nodesMap: Map<number, NodeDTO>) {
    if (!scene) return
    const worldSize = 90
    // canvas roads -> alpha map
    const sizePx = 2048
    const cvs = document.createElement('canvas')
    cvs.width = cvs.height = sizePx
    const ctx = cvs.getContext('2d')
    if (ctx) {
        ctx.clearRect(0, 0, sizePx, sizePx)
        const mapToCanvas = (x: number, z: number) => [
            ((x + worldSize / 2) / worldSize) * sizePx,
            ((z + worldSize / 2) / worldSize) * sizePx
        ]
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = 'rgba(255,255,255,1)'
        streets.forEach(edge => {
            const nodeA = nodesMap.get(edge.aNodeId)
            const nodeB = nodesMap.get(edge.bNodeId)

            if (!nodeA || !nodeB) {
                console.warn(`Edge ${edge.id}: Missing nodes - aNodeId: ${edge.aNodeId}, bNodeId: ${edge.bNodeId}`)
                return
            }

            // Usar o comprimento (length) para calcular a largura proporcional da rua
            // Assumindo uma largura padrão baseada no comprimento
            const defaultWidth = 2.5
            ctx.lineWidth = defaultWidth * (sizePx / worldSize)
            ctx.beginPath()
            const [px1, pz1] = mapToCanvas(nodeA.x, nodeA.y)
            const [px2, pz2] = mapToCanvas(nodeB.x, nodeB.y)
            ctx.moveTo(px1, pz1); ctx.lineTo(px2, pz2); ctx.stroke()
        })
    }
    const roadAlphaMap = new THREE.CanvasTexture(cvs)
    roadAlphaMap.wrapS = roadAlphaMap.wrapT = THREE.ClampToEdgeWrapping
    roadAlphaMap.needsUpdate = true

    const roadTexture = new THREE.TextureLoader().load('textures/cobblestone.jpg')
    roadTexture.wrapS = roadTexture.wrapT = THREE.RepeatWrapping
    roadTexture.repeat.set(worldSize / 4, worldSize / 4)

    const roadMaterial = new THREE.MeshStandardMaterial({
        map: roadTexture,
        alphaMap: roadAlphaMap,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        roughness: 0.6,
        metalness: 0.1,
    })
    const roadPlane = new THREE.Mesh(new THREE.PlaneGeometry(worldSize, worldSize), roadMaterial)
    roadPlane.position.set(0, 0, 0)
    roadPlane.setRotationFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))
    scene!.add(roadPlane)

    const grassTexture = new THREE.TextureLoader().load('textures/grass.jpg')
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping
    grassTexture.repeat.set(30, 30)
    grassTexture.anisotropy = 8

    const grassMaterial = new THREE.MeshStandardMaterial({
        map: grassTexture,
        depthWrite: false,
        side: THREE.DoubleSide,
        roughness: 0.8,
        color: 0x4caf50,
    })
    const grassPlane = new THREE.Mesh(new THREE.PlaneGeometry(worldSize, worldSize), grassMaterial)
    grassPlane.position.set(0, 0, 0)
    grassPlane.receiveShadow = true
    grassPlane.setRotationFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))
    scene!.add(grassPlane)
}

async function loadModels(buildings: MapBuildingDTO[], nodesMap: Map<number, NodeDTO>) {
    if (!scene) return
    const loader = new GLTFLoader()

    const createLabel = (name: string, model: THREE.Object3D) => {
        try {
            // Calcular bounding box do modelo para posicionar o label acima
            const box = new THREE.Box3().setFromObject(model)
            const size = new THREE.Vector3()
            const center = new THREE.Vector3()
            box.getSize(size)
            box.getCenter(center)

            // Configuração do texto (2x maior que antes)
            const fontSize = 144  // 2x maior que os 72px anteriores
            const padding = 40    // Padding ao redor do texto

            // Criar canvas temporário para medir o texto
            const tempCanvas = document.createElement('canvas')
            const tempCtx = tempCanvas.getContext('2d')
            if (!tempCtx) return

            tempCtx.font = `bold ${fontSize}px Arial`
            const textMetrics = tempCtx.measureText(name)
            const textWidth = textMetrics.width
            const textHeight = fontSize  // Aproximação da altura

            // Criar canvas com tamanho ajustado ao texto
            const canvas = document.createElement('canvas')
            canvas.width = textWidth + padding * 2
            canvas.height = textHeight + padding * 2
            const ctx = canvas.getContext('2d')

            if (ctx) {
                // Fundo semi-transparente escuro (ajustado ao tamanho do texto)
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
                ctx.fillRect(0, 0, canvas.width, canvas.height)

                // Texto branco com o nome do prédio
                ctx.fillStyle = '#ffffff'
                ctx.font = `bold ${fontSize}px Arial`
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText(name, canvas.width / 2, canvas.height / 2)
            }

            // Criar textura e material
            const texture = new THREE.CanvasTexture(canvas)
            const material = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                depthTest: true,  // Respeita profundidade (diferente dos markers de debug)
                depthWrite: false
            })

            // Criar sprite
            const sprite = new THREE.Sprite(material)
            // Posicionar acima do topo do prédio
            sprite.position.set(center.x, center.y + size.y / 2 + 2, center.z)

            // Escala proporcional ao tamanho do canvas (2x maior que antes: 8x2 -> 16x4)
            const aspectRatio = canvas.width / canvas.height
            const spriteHeight = 4  // 2x maior que os 2 anteriores
            const spriteWidth = spriteHeight * aspectRatio
            sprite.scale.set(spriteWidth, spriteHeight, 1)
            sprite.renderOrder = 100  // Renderiza depois dos modelos mas antes dos debug markers

            scene!.add(sprite)
            buildingLabels.push(sprite)
        } catch (err) {
            console.error('label fail', err)
        }
    }

    for (const building of buildings) {
        const name = building.name
        const node = nodesMap.get(building.nodeId)

        if (!node) {
            console.warn(`Building ${name}: Node ${building.nodeId} not found`)
            continue
        }

        await new Promise<void>((resolve) => {
            loader.load(building.modelPath, gltf => {
                const model = gltf.scene
                loadedModels.set(name, model)
                buildingIdToModelMap.set(building.id, model)  // Mapear building ID para modelo
                model.traverse(child => {
                    if ((child as THREE.Mesh).isMesh) {
                        const mesh = child as THREE.Mesh
                        const mat = mesh.material as THREE.MeshStandardMaterial
                        mat.metalness = 0
                        // Mapear mesh para building ID (para raycasting)
                        meshToBuildingIdMap.set(mesh, building.id)
                    }
                })
                model.position.set(node.x, 0.1, node.y)
                scene!.add(model)
                if (name !== 'tecnopuc') {
                    createLabel(name, model)
                }
                resolve()
            }, undefined, err => { console.error('Falha ao carregar modelo:', name, err); resolve() })
        })
    }
}

function highlightModel(modelName: string) {
    const model = loadedModels.get(modelName)
    if (!model) { console.warn('modelo nao encontrado', modelName); return }
    model.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            if (!originalMaterials.has(mesh)) originalMaterials.set(mesh, mesh.material)
            mesh.material = new THREE.MeshStandardMaterial({ color: 0xFF0000, metalness: 0, roughness: 0.5 })
        }
    })
}

function unhighlightModel(modelName: string) {
    const model = loadedModels.get(modelName)
    if (!model) { console.warn('modelo nao encontrado', modelName); return }
    model.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            const orig = originalMaterials.get(mesh)
            if (orig) { mesh.material = orig; originalMaterials.delete(mesh) }
        }
    })
}

function highlightN(names: string[]) { names.forEach(n => highlightModel(n)) }
function unhighlightN(names: string[]) { names.forEach(n => unhighlightModel(n)) }
function getLoadedNames() { return Array.from(loadedModels.keys()) }

/* --- Função para obter building ID a partir do nome --- */
function getBuildingIdByName(buildingName: string): number | undefined {
    return buildingNameToIdMap.get(buildingName)
}

/* --- Função para destacar node de um building --- */
function highlightBuildingNode(buildingId: number | null) {
    if (!currentNodesMap) return

    if (buildingId === null) {
        // Limpar destaque - todos os nodes ficam amarelos e remover outline
        createNodeMarkers(currentNodesMap)
        if (outlinePass) {
            outlinePass.selectedObjects = []
        }
    } else {
        // Destacar o node do building selecionado em vermelho
        const nodeId = buildingIdToNodeIdMap.get(buildingId)
        if (nodeId !== undefined) {
            createNodeMarkers(currentNodesMap, nodeId)
        }

        // Adicionar outline brilhante no building
        const buildingModel = buildingIdToModelMap.get(buildingId)
        if (buildingModel && outlinePass) {
            // Coletar todos os meshes do modelo para aplicar outline
            const meshes: THREE.Object3D[] = []
            buildingModel.traverse(child => {
                if ((child as THREE.Mesh).isMesh) {
                    meshes.push(child)
                }
            })
            outlinePass.selectedObjects = meshes
        }
    }
}

/* --- Função para lidar com cliques no canvas --- */
function handleCanvasClick(event: MouseEvent, canvas: HTMLElement) {
    if (!camera || !scene) return

    // Calcular posição do mouse normalizada (-1 a +1)
    const rect = canvas.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    // Atualizar raycaster
    raycaster.setFromCamera(mouse, camera)

    // Verificar interseções com todos os meshes
    const intersects = raycaster.intersectObjects(scene.children, true)

    for (const intersect of intersects) {
        const object = intersect.object
        if ((object as THREE.Mesh).isMesh) {
            const mesh = object as THREE.Mesh
            const buildingId = meshToBuildingIdMap.get(mesh)
            if (buildingId !== undefined) {
                // Encontrou um building - destacar o node
                highlightBuildingNode(buildingId)
                return
            }
        }
    }
}

export default {
    mount,
    unmount,
    loadSceneFromUrl,
    highlightModel,
    unhighlightModel,
    highlightN,
    unhighlightN,
    getLoadedNames,
    getBuildingIdByName,
    highlightBuildingNode,
    handleCanvasClick,
    // expose maps for debug
    loadedModels,
    originalMaterials
}