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

type Building = {
  name: string
  modelPath: string
  coordinate: {
    x: number
    y: number
  }
};

type Street = {
  width: number
  coordinateA: {
    x: number
    y: number
  }
  coordinateB: {
    x: number
    y: number
  }
};

onMounted(async () => {
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
  
  container.value.appendChild(renderer.domElement)

  const fetchScene = async () => {
    try {
      const res = await fetch("http://localhost:8080/map");  // TODO: Mudar o endpoint para o correto
      const data = await res.json(); // Pega o corpo da resposta e transforma em JSON
      console.log("Dados do endpoint:", data);
      // setStands(data.stands);  // Atualiza o estado com os dados recebidos da API
      // setRoads(data.roads);  // Atualiza o estado com os dados recebidos da API
      loadGround(data.streets)
      loadModels(data.buildings)
    } catch (err) {
      console.error("Erro ao buscar configuração do Mapscene:", err);
    }
  };
  fetchScene();  // Chama a função para buscar os dados quando o componente é montado
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  renderer?.setAnimationLoop(null)
  window.removeEventListener('resize', onResize)
  renderer?.dispose()
})

function loadModels(data: Building[]) {
  const models: Building[] = data
  
  // falhará se o modelo não existir na pasta public. O cubo ainda será renderizado
  // modelos podem ser carregados assincronamente.
  // const glb = await loader.loadAsync('91A.glb')
  const loader = new GLTFLoader()
  const fontLoader = new FontLoader();

  let font: any
  fontLoader.load('/fonts/League-Spartan.json', (loadedFont) => {
    font = loadedFont
  })
  models.forEach(({name, modelPath, coordinate}) => {
    loader.load(modelPath, (gltf) => {
      const model = gltf.scene;
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
      model.position.set(coordinate.x, 0.1, coordinate.y)
      scene.add(model)

      if (name === 'tecnopuc') {
        return
      }

      // Labels!!
      const box = new THREE.Box3().setFromObject(model)
      const size = new THREE.Vector3()
      const center = new THREE.Vector3()
      box.getSize(size)
      box.getCenter(center)
      
      let shape = font.generateShapes(name, name.length < 5 ? 3.125 : 2.625)
	    let geometryS = new THREE.ShapeGeometry(shape)
      geometryS.computeBoundingBox()

      // Adaptado daqui: https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_text_shapes.html#L76
      const holeShapes = [];
			for ( let i = 0; i < shape.length; i ++ ) {
				const sh = shape[i];
				if ( sh.holes && sh.holes.length > 0 ) {
					for ( let j = 0; j < sh.holes.length; j ++ ) {
						const hole = sh.holes[j];
						holeShapes.push(hole);
					}
				}
      }

      shape.push( ...holeShapes );
			const lineText = new THREE.Object3D();
			for ( let i = 0; i < shape.length; i ++ ) {
				const sh = shape[ i ];
				const points = sh.getPoints();
				const geometry = new THREE.BufferGeometry().setFromPoints(points);
				const lineMesh = new THREE.Line( geometry, new THREE.LineBasicMaterial({ color:0x000000 }));
				lineText.add(lineMesh);
			}
      // fim da adaptacao

      const textBox = new THREE.Box3().setFromObject(new THREE.Mesh(geometryS))
      const textBoxSize = new THREE.Vector3()
      const textBoxCenter = new THREE.Vector3()
      textBox.getSize(textBoxSize)
      textBox.getCenter(textBoxCenter)      
      
      const corner = [center.x - size.x/2, center.y + size.y/2, center.z - size.z/2]
      const labelPos = [(size.x - textBoxSize.y) / 2, 0, (size.z - textBoxSize.x) / 2]
      // labelPos[0] += 1.5
      // labelPos[2] -= 3
      const textMesh = new THREE.Mesh(geometryS, new THREE.MeshBasicMaterial({ color: 0xffffff }))
      textMesh.rotation.set(-Math.PI / 2, 0, -Math.PI / 2)
      textMesh.position.set(labelPos[0] + corner[0], labelPos[1] + corner[1] + 0.1, labelPos[2] + corner[2])
      
      // const contourMesh = new THREE.Mesh(contourGeo, new THREE.MeshBasicMaterial({ color: 0x000000 }))
      // contou.scale.set(.5, .5, .5)
      // contourMesh.position.x -= .5
      textMesh.add(lineText)
      
      scene.add(textMesh)
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

function loadGround(streets: Street[]) {
  let worldSize = 90
  const roads: Street[] = streets
  console.log(roads)

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
    roads.forEach(({width, coordinateA, coordinateB}) => {
      // Line width proportional to canvas size and world size
      ctx.lineWidth = width * (sizePx / worldSize)
      ctx.beginPath()
      const [px1, pz1] = mapToCanvas(coordinateA.x, coordinateA.y)
      const [px2, pz2] = mapToCanvas(coordinateB.x, coordinateB.y)
      ctx.moveTo(px1, pz1)
      ctx.lineTo(px2, pz2)
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
