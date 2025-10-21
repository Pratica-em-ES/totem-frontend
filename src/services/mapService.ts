import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'

type Building = {
    name: string
    modelPath: string
    node: { x: number; y: number }
}
type Edge = { width: number; nodeA: { x: number; y: number }; nodeB: { x: number; y: number } }

let initialized = false
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let animationRunning = false

const loadedModels = new Map<string, THREE.Object3D>()
const originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>()

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

    // animate loop
    const animate = (time: number) => {
        controls?.update()
        if (renderer && scene && camera) renderer.render(scene, camera)
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
        const data = await res.json()
        if (scene) {
            loadGround(data.edges)
            await loadModels(data.buildings)
        }
    } catch (err) {
        console.error('Erro loadSceneFromUrl', err)
    }
}

/* --- Copiar/portar aqui as funções de loadGround e loadModels (adaptadas) --- */
function loadGround(streets: Edge[]) {
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
            ctx.lineWidth = edge.width * (sizePx / worldSize)
            ctx.beginPath()
            const [px1, pz1] = mapToCanvas(edge.nodeA.x, edge.nodeA.y)
            const [px2, pz2] = mapToCanvas(edge.nodeB.x, edge.nodeB.y)
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

async function loadModels(buildings: Building[]) {
    if (!scene) return
    const loader = new GLTFLoader()
    const fontLoader = new FontLoader()
    let font: any = null
    let fontLoaded = false
    const pendingLabels: Array<{ name: string, model: THREE.Object3D }> = []
    fontLoader.load('/fonts/League-Spartan.json', f => {
        font = f; fontLoaded = true
        pendingLabels.forEach(p => createLabel(p.name, p.model, font))
        pendingLabels.length = 0
    }, undefined, e => console.error('Falha fonte', e))

    const createLabel = (name: string, model: THREE.Object3D, font: any) => {
        try {
            const box = new THREE.Box3().setFromObject(model)
            const size = new THREE.Vector3(); const center = new THREE.Vector3()
            box.getSize(size); box.getCenter(center)
            let shape = font.generateShapes(name, name.length < 5 ? 3.125 : 2.625)
            let geometryS = new THREE.ShapeGeometry(shape); geometryS.computeBoundingBox()
            const holeShapes: any[] = []
            for (const sh of shape) { if (sh.holes) for (const h of sh.holes) holeShapes.push(h) }
            shape.push(...holeShapes)
            const lineText = new THREE.Object3D()
            for (const sh of shape) {
                const points = sh.getPoints()
                const geometry = new THREE.BufferGeometry().setFromPoints(points)
                const lineMesh = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x000000 }))
                lineText.add(lineMesh)
            }
            const textBox = new THREE.Box3().setFromObject(new THREE.Mesh(geometryS))
            const textBoxSize = new THREE.Vector3(); const textBoxCenter = new THREE.Vector3()
            textBox.getSize(textBoxSize); textBox.getCenter(textBoxCenter)
            const corner = [center.x - size.x / 2, center.y + size.y / 2, center.z - size.z / 2]
            const labelPos = [(size.x - textBoxSize.y) / 2, 0, (size.z - textBoxSize.x) / 2]
            const textMesh = new THREE.Mesh(geometryS, new THREE.MeshBasicMaterial({ color: 0xffffff }))
            textMesh.rotation.set(-Math.PI / 2, 0, -Math.PI / 2)
            textMesh.position.set(labelPos[0] + corner[0], labelPos[1] + corner[1] + 0.1, labelPos[2] + corner[2])
            textMesh.add(lineText)
            scene!.add(textMesh)
        } catch (err) { console.error('label fail', err) }
    }

    for (const building of buildings) {
        const name = building.name
        await new Promise<void>((resolve) => {
            loader.load(building.modelPath, gltf => {
                const model = gltf.scene
                loadedModels.set(name, model)
                model.traverse(child => {
                    if ((child as THREE.Mesh).isMesh) {
                        const mesh = child as THREE.Mesh
                        const mat = mesh.material as THREE.MeshStandardMaterial
                        mat.metalness = 0
                    }
                })
                model.position.set(building.node.x, 0.1, building.node.y)
                scene!.add(model)
                if (name !== 'tecnopuc') {
                    if (fontLoaded && font) createLabel(name, model, font)
                    else pendingLabels.push({ name, model })
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

export default {
    mount,
    unmount,
    loadSceneFromUrl,
    highlightModel,
    unhighlightModel,
    highlightN,
    unhighlightN,
    getLoadedNames,
    // expose maps for debug
    loadedModels,
    originalMaterials
}