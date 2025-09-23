<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // para carregar os arquivos dos modelos

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
  camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 2000)
  // camera.fov = 45
  // camera.position.z = -1
  camera.position.x = -17
  camera.position.y = 50
  camera.position.z = 80.71
  camera.lookAt(0,0,0) // olha para a origem!!! (meio do mapa)

  // Scene
  scene = new THREE.Scene()
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 1)
  dirLight.position.set(30, 20, 10)
  scene.add(dirLight)

  // controla a iluminação da cena. Sem algum tipo de luz (e alterações nos materiais),
  // os modelos GLB não são visíveis
  const ambient = new THREE.AmbientLight(0xffffff, 1) // cor, intensidade
  scene.add(ambient)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  container.value.appendChild(renderer.domElement)
  
  // Animation
  renderer.setAnimationLoop(animate)
  renderer.setClearColor(0x666666, 1)

  // renderer.toneMapping = THREE.ACESFilmicToneMapping
  // renderer.toneMappingExposure = 1// >1 makes scene brighter

  // Resize
  window.addEventListener('resize', onResize)
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = false
  controls.minDistance = 60
  controls.maxDistance = 120
  // controls.minPolarAngle = 0.3
  controls.maxPolarAngle = Math.PI / 2 - 0.1

  resizeObserver = new ResizeObserver(() => onResize())
  resizeObserver.observe(container.value)

  loadGround()
  loadModels()
  // renderizar estradas e chao
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  renderer?.setAnimationLoop(null)
  window.removeEventListener('resize', onResize)
  renderer?.dispose()
})

function loadModels() {
  const models: string[] = [
    // '/models/91A.glb',
    // '/models/91B.glb',
    // '/models/92A.glb',
    // '/models/93.glb',
    // '/models/94.glb',
    // '/models/95A.glb',
    // '/models/95c.glb',
    // '/models/96.glb',
    // '/models/96A.glb',
    // '/models/96BCDF.glb',
    // '/models/96j.glb',
    // '/models/97.glb',
    // '/models/99A.glb',
    // '/models/tecnopuc.glb',
  ]
  
  // falhará se o modelo não existir na pasta public. O cubo ainda será renderizado
  // modelos podem ser carregados assincronamente.
  // const glb = await loader.loadAsync('91A.glb')
  const loader = new GLTFLoader()
  models.forEach((modelpath) => {
    loader.load(modelpath, (gltf) => {
      const model = gltf.scene;
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          const mat = mesh.material as THREE.MeshStandardMaterial
          // quanto maior, mais escuro o objeto fica. deve ser 0 no nosso caso
          mat.metalness = 0
        }
      })
      model.position.set(0,0.1,0)
      scene.add(model)
    })
  })
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
    side: THREE.DoubleSide
  })

  const roadPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(worldSize, worldSize),
    roadMaterial
  )
  roadPlane.position.set(0, 0.01, 0)
  roadPlane.setRotationFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))
  scene.add(roadPlane)

  const grassTexture = new THREE.TextureLoader().load('textures/grass.jpg')
  grassTexture.wrapS = THREE.RepeatWrapping
  grassTexture.wrapT = THREE.RepeatWrapping
  grassTexture.repeat.set(64,64)

  const grassMaterial = new THREE.MeshBasicMaterial({
    map: grassTexture,
    depthWrite: false,
    side: THREE.DoubleSide
  })
  const grassGeometry = new THREE.PlaneGeometry(worldSize, worldSize)
  const grassPlane = new THREE.Mesh(grassGeometry, grassMaterial)
  grassPlane.position.set(0, 0, 0)
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
