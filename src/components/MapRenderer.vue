<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js' // para carregar os arquivos dos modelos
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js' // para as labels dos predios
import { FontLoader } from 'three/addons/loaders/FontLoader.js'

const container = ref<HTMLDivElement | null>(null)
let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
// let mesh: THREE.Mesh // mesh do Cubo
let controls: OrbitControls // para poder rotacionar o mapa e controlar zoom
let resizeObserver: ResizeObserver // para caso o componente pai seja redimensionado em vez da tela

onMounted(() => {
  if (!container.value) return

  const width: number = container.value.clientWidth
  const height: number = container.value.clientHeight

  // Camera
  camera = new THREE.PerspectiveCamera(10, width / height, 0.01, 2000)
  // camera.fov = 45
  // camera.position.z = -1
  camera.position.x = -68
  camera.position.y = 200
  camera.position.z = 322.84
  camera.up.set(0, 1, 0) // eixo Y é o "cima"
  camera.lookAt(0,0,0) // olha para a origem!!! (meio do mapa)

  // Scene
  scene = new THREE.Scene()
  
  const sunlight = new THREE.DirectionalLight(0xffffff, 1)
  sunlight.position.set(30, 20, 10)
  sunlight.castShadow = true;
  sunlight.shadow.camera.top = 200;
  sunlight.shadow.camera.bottom = -200;
  sunlight.shadow.camera.left = -200;
  sunlight.shadow.camera.right = 200;
  sunlight.shadow.camera.near = 1;
  sunlight.shadow.camera.far = 2000;
  scene.add(sunlight)

  // controla a iluminação da cena. Sem algum tipo de luz (e alterações nos materiais),
  // os modelos GLB não são visíveis
  const ambient = new THREE.AmbientLight(0xffffff, 1) // cor, intensidade
  const directional = new THREE.DirectionalLight(0xffffff, 2);
  directional.castShadow = true
  scene.add(ambient)
  scene.add(directional)

  // Renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: true
  })
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = true
  renderer.setSize(width, height)
  
  // Animation
  renderer.setAnimationLoop(animate)
  renderer.setClearColor(0x666666, 1)

  // Resize
  window.addEventListener('resize', onResize)
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = false
  controls.minDistance = 120
  controls.maxDistance = 600
  controls.enableDamping = true
  // controls.minPolarAngle = 0.3
  controls.maxPolarAngle = Math.PI / 2 - 0.1

  resizeObserver = new ResizeObserver(() => onResize())
  resizeObserver.observe(container.value)
  
  loadGround()
  loadModels()

  container.value.appendChild(renderer.domElement)

    //teste highlight
    setTimeout(() => {
    highlightModel('91A')
     }, 10000)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  renderer?.setAnimationLoop(null)
  window.removeEventListener('resize', onResize)
  renderer?.dispose()
})

function loadModels() {
  const models: string[] = [
    '/models/91A.glb',
    '/models/91B.glb',
    '/models/92A.glb',
    '/models/93.glb',
    '/models/94.glb',
    '/models/95A.glb',
    '/models/95c.glb',
    '/models/96.glb',
    '/models/96A.glb',
    '/models/96BCDF.glb',
    '/models/96j.glb',
    '/models/97.glb',
    '/models/99A.glb',
    '/models/tecnopuc.glb',
  ]
  
  // falhará se o modelo não existir na pasta public. O cubo ainda será renderizado
  // modelos podem ser carregados assincronamente.
  // const glb = await loader.loadAsync('91A.glb')
  const loader = new GLTFLoader()
  const fontLoader = new FontLoader();

  let font: any
  fontLoader.load('/fonts/League-Spartan.json', (loadedFont) => {
    font = loadedFont
  })
  models.forEach((modelpath) => {
    loader.load(modelpath, (gltf) => {
      const model = gltf.scene;

      const name = modelpath.split('/').pop()!.replace('.glb', '')
      loadedModels.set(name, model)
      
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          const mat = mesh.material as THREE.MeshStandardMaterial
          // quanto maior, mais escuro o objeto fica. deve ser 0 no nosso caso
          mat.metalness = 0
          // mesh.receiveShadow = true
          // mesh.castShadow = true
        }
      })
      model.position.set(0,0.1,0)
      scene.add(model)


      // Labels!!
      // const box = new THREE.Box3().setFromObject(model)
      // const size = new THREE.Vector3()
      // const center = new THREE.Vector3()
      // box.getSize(size)
      // box.getCenter(center)
      
      
      // let shape = font.generateShapes("91A", 3)
	    // let geometryS = new THREE.ShapeGeometry(shape)
      // geometryS.computeBoundingBox()

      // const textBox = new THREE.Box3().setFromObject(new THREE.Mesh(geometryS))
      // const textBoxSize = new THREE.Vector3()
      // const textBoxCenter = new THREE.Vector3()
      // textBox.getSize(textBoxSize)
      // textBox.getCenter(textBoxCenter)
      
      
      // const labelPos = [(center.x - size.x/2) + (size.x - textBoxSize.x) / 2, center.y + size.y / 2 + 0.2, (center.z - size.z/2) + (size.z - textBoxSize.z) / 2]
      // const textMesh = new THREE.Mesh(geometryS, new THREE.MeshBasicMaterial({ color: 0xffffff }))
      // // textMesh.scale.set(.5, .5, .5)
      // textMesh.rotation.set(-Math.PI / 2, 0, -Math.PI / 2)
      // textMesh.position.set(labelPos[0], labelPos[1], labelPos[2])
      // scene.add(textMesh)
    })
  })
}

const loadedModels = new Map<string, THREE.Object3D>()
const originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>()

function highlightModel(modelName: String) {
  const model = loadedModels.get(modelName as string)
  if (!model) return

  model.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      if (!originalMaterials.has(mesh)) {
        originalMaterials.set(mesh, mesh.material)
      }
      mesh.material = new THREE.MeshStandardMaterial({
        color: 0xFF0000,
        metalness: 0.5,
        roughness: 0.5,
      })
    }
  })
  console.log(`Highlighted model: ${modelName}`)
}

function animate(time: number) {
  // mesh.rotation.x = time / 2000
  // mesh.rotation.y = time / 1000
  controls.update()
  renderer.render(scene, camera)
}

function onResize() {
  if (!container.value) return
  const width = container.value.clientWidth
  const height = container.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function loadGround() {
  type RoadObj = {
    width: number
    points: number[][]
  };

  let worldSize = 90
  const roads: RoadObj[] = [
    /* 1 ─ Norte-sul longo */
    {
      width: 3,
      points: [
        [-13, 28],
        [-13, -26],
      ],
    },
    /* 2 ─ Diagonal curta (próximo aos prédios verdes) */
    {
      width: 3,
      points: [
        [31.45, 8.56],
        [19, 18.29],
      ],
    },
    /* 3 ─ Diagonal longa no canto superior-dir. */
    {
      width: 3,
      points: [
        [30, 29],
        [13.5, 12.9],
      ],
    },
    /* 4 ─ Rua leste-oeste (altura z ≈ 13) */
    {
      width: 3,
      points: [
        [13, 13],
        [-13, 13],
      ],
    },
    /* 5 ─ Rua leste-oeste (altura z ≈ -22) */
    {
      width: 3,
      points: [
        [-13, -22],
        [17.73, -22],
      ],
    },
    /* 6 ─ Avenida norte-sul pelo x ≈ 13 */
    {
      width: 3,
      points: [
        [13, 36],
        [13, -20],
      ],
    },
    /* 7 ─ Rua leste-oeste (altura z ≈ -1.5) */
    {
      width: 3,
      points: [
        [-13, -1.5],
        [13, -1.5],
      ],
    },
    /* 8 ─ Rua leste-oeste (altura z ≈ 28) */
    {
      width: 3,
      points: [
        [-13, 28],
        [12, 28],
      ],
    },
    /* 9 ─ Via larga (12 u) descendo pelo x ≈ 15 */
    {
      width: 12,
      points: [
        [17, -21],
        [17, -29.5],
      ],
    },
    /* 10 ─ Extensão no extremo esquerdo */
    {
      width: 3,
      points: [
        [-14, 21],
        [-31, 21],
      ],
    },
    {
      width: 3,
      points: [
        [-31, 21],
        [-31, 30.08],
      ],
    },
    /*PORTAS */
    {
      width: 3,
      points: [
        [-18.66, 10.5],
        [-14.1, 10.5],
      ],
    },
    /* 11 ─ Extensão no extremo direito */
    {
      width: 3,
      points: [
        [3.2, 4.58],
        [3.2, -0.25],
      ],
    },
    /* 12 ─ Extensão no extremo direito */
    {
      width: 3,
      points: [
        [0.7, 14.14],
        [1.03, 17.37],
      ],
    },
    /* 13 ─ Extensão no extremo direito */
    {
      width: 3,
      points: [
        [3.1, 29.22],
        [3.1, 32.76],
      ],
    },
    {
      width: 3,
      points: [
        [-17.95, -11.01],
        [-13.71, -11.11],
      ],
    },
    /*caminho do predio vermelho*/
    {
      width: 3,
      points: [
        [12.77, -30.41],
        [11.31, -38.15],
      ],
    },
    {
      width: 3,
      points: [
        [11.07, -38.85],
        [6.99, -38.85],
      ],
    },
    {
      width: 3,
      points: [
        [3.16, -30.6],
        [6.51, -38.57],
      ],
    },
    {
      width: 3,
      points: [
        [4.76, -11],
        [11.8, -11],
      ],
    },
    /*CAMINHO ENTRADA PRINCIPAL*/
    {
      width: 4,
      points: [
        [26.9, -25.08],
        [34.52, -33.1],
        [35.59, -37.6],
        [44.66, -40.07],
      ],
    },
  ]

  // RUAS
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
    roads.forEach(({ points, width }) => {
      // Line width proportional to canvas size and world size
      ctx.lineWidth = width * (sizePx / worldSize)
      ctx.beginPath()
      points.forEach(([x, z], i) => {
        const [px, pz] = mapToCanvas(x, z)
        if (i === 0) {
          ctx.moveTo(px, pz)
        } else {
          ctx.lineTo(px, pz)
        }
      })
      ctx.stroke()
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
    // color: 0x9b111e
  })

  const roadPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(worldSize, worldSize),
    roadMaterial
  )
  // roadPlane.receiveShadow = true
  roadPlane.position.set(0, 0, 0)
  roadPlane.setRotationFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))
  scene.add(roadPlane)

  // GRAMA
  const grassTexture = new THREE.TextureLoader().load('textures/grass.jpg')
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping
  grassTexture.repeat.set(30,30)
  grassTexture.anisotropy = 8

  const grassMaterial = new THREE.MeshStandardMaterial({
    map: grassTexture,
    depthWrite: false,
    side: THREE.DoubleSide,
    roughness: 0.8,
    color: 0x4caf50,
  })
  const grassGeometry = new THREE.PlaneGeometry(worldSize, worldSize)
  const grassPlane = new THREE.Mesh(grassGeometry, grassMaterial)
  grassPlane.position.set(0, 0, 0)
  grassPlane.receiveShadow = true
  grassPlane.setRotationFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))
  scene.add(grassPlane)
}
</script>

<template>
  <!-- full screen container -->
  <div id="map-container" ref="container" class="three-box"></div>
</template>

<style scoped>
.three-box {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;      /* full parent width */
  height: 100%;     /* full parent height */
  overflow: hidden;
  border-radius: 16px;
}
</style>
