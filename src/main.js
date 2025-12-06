import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// SCENA
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa);

// CAMERA
const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(2, 2, 5);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);
controls.update();

// LUMINI
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 8, 5);
scene.add(dirLight);

// FUNDAL
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 })
);
ground.rotation.x = -Math.PI/2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

// LOAD
const loader = new GLTFLoader();
loader.load(
  '/model.glb',
  (gltf) => {
    const model = gltf.scene;

    model.position.set(0, 0, 0);
    model.scale.set(0.01, 0.01, 0.01); 

    scene.add(model);
    console.log('Model loaded:', model);
  },
  undefined,
  (err) => console.error('Error loading model:', err)
);


function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
