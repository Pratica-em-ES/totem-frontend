<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // para carregar os arquivos dos modelos

const container = ref<HTMLDivElement | null>(null)
let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let mesh: THREE.Mesh
let controls: OrbitControls // para poder rotacionar o mapa e controlar zoom
let resizeObserver: ResizeObserver // para caso o componente pai seja redimensionado em vez da tela

onMounted(() => {
  if (!container.value) return

  const width: number = container.value.clientWidth
  const height: number = container.value.clientHeight

  // Camera
  camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 100)
  camera.position.z = -1

  // Scene
  scene = new THREE.Scene()

  // Cube
  const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
  const material = new THREE.MeshNormalMaterial()
  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  const loader = new GLTFLoader()
  // falhará se o modelo não existir na pasta public. O cubo ainda será renderizado
  // modelos podem ser carregados assincronamente. sera necessario anotar a lambda acima em onMounted como async
  // const glb = await loader.loadAsync('91A.glb')
  const models = import.meta.glob('/models/*.{glb}', { eager: true })
  console.log(models)
  for (const p in models) {
    console.log(models)
  }
  loader.load('/models/91A.glb', (gltf) => {
    const model = gltf.scene;
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        const mat = mesh.material as THREE.MeshStandardMaterial
        // valores meio arbitrários. alterações em roughness não parece causar nenhum efeito
        mat.roughness = 0.5
        // quanto maior, mais escuro o objeto fica
        mat.metalness = 0.1
      }
    })
    model.position.set(0,0,0)
    model.scale.set(0.3,0.3,0.3)
    scene.add(model)
  })

  // caso o modelo seja carregado assincronamente:
  // const model = glb.scene;
  // model.traverse((child) => {
    // if ((child as THREE.Mesh).isMesh) {
      // const mesh = child as THREE.Mesh
      // const mat = mesh.material as THREE.MeshStandardMaterial
      // // valores meio arbitrários.
      // mat.roughness = 0.5
      // // quanto maior, mais escuro o objeto fica
      // mat.metalness = 0.1
    // }
  // })
  // model.position.set(0,0,0)
  // model.scale.set(0.3,0.3,0.3)
  // scene.add(model)
  
  // pouco útil
  // const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 10)
  // hemiLight.position.set(0, 20, 0)
  // scene.add(hemiLight)
  
  // pouco útil
  // const dirLight = new THREE.DirectionalLight(0xffffff, 1)
  // dirLight.position.set(30, 20, 10)
  // scene.add(dirLight)

  // controla a iluminação da cena. Sem algum tipo de luz (e alterações nos materiais),
  // os modelos GLB não são visíveis
  const ambient = new THREE.AmbientLight(0xffffff, 2) // cor, intensidade
  scene.add(ambient)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  container.value.appendChild(renderer.domElement)
  
  // Animation
  renderer.setAnimationLoop(animate)

  // renderer.toneMapping = THREE.ACESFilmicToneMapping
  // renderer.toneMappingExposure = 1.5 // >1 makes scene brighter

  // Resize
  window.addEventListener('resize', onResize)
  controls = new OrbitControls(camera, renderer.domElement)
  resizeObserver = new ResizeObserver(() => onResize())
  resizeObserver.observe(container.value)

  renderer.setClearColor(0x666666, 1)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  renderer?.setAnimationLoop(null)
  window.removeEventListener('resize', onResize)
  renderer?.dispose()
})

function animate(time: number) {
  mesh.rotation.x = time / 2000
  mesh.rotation.y = time / 1000
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
</script>

<template>
  <!-- full screen container -->
  <div ref="container" class="three-box"></div>
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
