import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// SCENE
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

// LIGHTS
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 8, 5);
scene.add(dirLight);

// GROUND
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 })
);
ground.rotation.x = -Math.PI/2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

// LOADER
const loader = new GLTFLoader();

// ARM BONES REFERENCES
let shoulderR, upperArmR, lowerArmR, palm1R;
const clock = new THREE.Clock();

loader.load(
  '/RobotExpressive.glb',
  (gltf) => {
    const model = gltf.scene;
    model.position.set(0, 0, 0);
    model.scale.set(1, 1, 1);
    scene.add(model);

    // SHOW SKELETON
    const skeletonHelper = new THREE.SkeletonHelper(model);
    skeletonHelper.visible = true;
    skeletonHelper.material.linewidth = 2; 
    scene.add(skeletonHelper);

    // FIND ARM BONES (for wave animation)
    model.traverse((child) => {
      if (child.isBone) {
        console.log('Bone Name:', child.name);
        if (child.name === 'ShoulderR') {
          shoulderR = child;
          shoulderR.rotation.z = Math.PI / 1.5;
        }
        if (child.name === 'UpperArmR') {
          upperArmR = child;
          upperArmR.rotation.y = Math.PI / 2;
        }
        if (child.name === 'LowerArmR') {
          lowerArmR = child;
          lowerArmR.rotation.z = Math.PI / 4;
        }
        if (child.name === 'Palm1R'){
          palm1R = child;
        }
      }
    });
    console.log('Model loaded:', model);
    console.log('Right arm bones ready:', shoulderR, upperArmR, lowerArmR, palm1R);
  },
  undefined,
  (err) => console.error('Error loading model:', err)
);

// ANIMATION
function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  if (shoulderR && lowerArmR) {
    
    lowerArmR.rotation.z = Math.sin(t * 4) * 0.4;
    lowerArmR.rotation.y = Math.PI / 2 + Math.sin(t * 3) * 0.2;
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

