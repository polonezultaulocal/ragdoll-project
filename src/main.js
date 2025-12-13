import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

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

// BUTTON TO START ANIMATION
const button = document.createElement('button');
button.textContent = 'Start Animation';
button.style.position = 'absolute';
button.style.top = '20px';
button.style.right = '20px';
button.style.padding = '10px 20px';
button.style.fontSize = '16px';
document.body.appendChild(button);

let animationActive = false;
button.addEventListener('click', () => {
    animationActive = !animationActive; // TOGGLE ANIMATION
    button.textContent = animationActive ? 'Stop Robot Wave' : 'Start Robot Wave';
});

// CREDITS
const creditDiv = document.createElement('div');
creditDiv.style.position = 'absolute';
creditDiv.style.top = '10px';
creditDiv.style.left = '50%';
creditDiv.style.transform = 'translateX(-50%)';
creditDiv.style.color = 'white';
creditDiv.style.fontFamily = 'Arial, sans-serif';
creditDiv.style.fontSize = '14px';
creditDiv.style.textAlign = 'center';
creditDiv.innerHTML = `
  Model by <a href="https://www.patreon.com/quaternius" target="_blank" style="color: #aaf; text-decoration: underline;">Tomas Laulhe</a> | HDR Background by <a href="https://polyhaven.com/a/skate_park" target="_blank" style="color: #aaf; text-decoration: underline;">Greg Zaal</a>
`;
document.body.appendChild(creditDiv);

const bottomDiv = document.createElement('div');
bottomDiv.style.position = 'absolute';
bottomDiv.style.bottom = '10px'; 
bottomDiv.style.left = '50%';
bottomDiv.style.transform = 'translateX(-50%)';
bottomDiv.style.color = 'white';
bottomDiv.style.fontFamily = 'Arial, sans-serif';
bottomDiv.style.fontSize = '14px';
bottomDiv.style.textAlign = 'center';
bottomDiv.innerHTML = `
  An attempt at coding something by <a href="https://github.com/polonezultaulocal/ragdoll-project" target="_blank" style="color: #aaf; text-decoration: underline;">Alexander Botoaca</a> with support from Radu Marias
`;
document.body.appendChild(bottomDiv);



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
  new THREE.PlaneGeometry(5, 5),
  new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 })
);
ground.rotation.x = -Math.PI/2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

const rgbeLoader = new RGBELoader();
rgbeLoader.load(
    '/skate_park_1k.hdr', 
    (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture; 
        scene.environment = texture;  
    },
    undefined,
    (err) => console.error('Error loading HDR:', err)
);

// LOADER
const loader = new GLTFLoader();

// ARM BONES REFERENCES
let shoulderR, upperArmR, lowerArmR, palm1R;
const clock = new THREE.Clock();

// RAYCASTING
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const boneNameDiv = document.createElement('div');
boneNameDiv.style.position = 'absolute';
boneNameDiv.style.top = '10px';
boneNameDiv.style.left = '10px';
boneNameDiv.style.color = 'white';
boneNameDiv.style.fontFamily = 'Arial';
boneNameDiv.style.fontSize = '16px';
boneNameDiv.style.pointerEvents = 'none';
document.body.appendChild(boneNameDiv);

// MOUSE TRACKING
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

let boneHelpers = [];

// LOAD MODEL
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

    // FIND ARM BONES + CREATE INVISIBLE MESHES FOR RAYCASTING
    model.traverse((child) => {
      if (child.isBone) {

        if (child.children.length > 0) {
          const startPos = new THREE.Vector3();
          const endPos = new THREE.Vector3();
          child.getWorldPosition(startPos);
          child.children[0].getWorldPosition(endPos);

          const length = startPos.distanceTo(endPos);
          const geometry = new THREE.CylinderGeometry(0.05, 0.05, length, 8); 
          const material = new THREE.MeshBasicMaterial({ visible: false });
          const mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);

          // MIDPOINT
          const midPos = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
          mesh.position.copy(midPos);

          // ORIENT MESH ALONG BONE
          const dir = new THREE.Vector3().subVectors(endPos, startPos).normalize();
          const axis = new THREE.Vector3(0, 1, 0); 
          const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, dir);
          mesh.quaternion.copy(quaternion);

          boneHelpers.push({ bone: child, mesh: mesh });
        }

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
  },
  undefined,
  (err) => console.error('Error loading model:', err)
);

// ANIMATION
function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  if (animationActive && shoulderR && lowerArmR) {
    lowerArmR.rotation.z = Math.sin(t * 4) * 0.4;
    lowerArmR.rotation.y = Math.PI / 2 + Math.sin(t * 3) * 0.2;
  }

  // UPDATE BONE HELPER MESHES
  boneHelpers.forEach(({ bone, mesh }) => {
    const startPos = new THREE.Vector3();
    const endPos = new THREE.Vector3();
    bone.getWorldPosition(startPos);
    if (bone.children.length > 0) {
      bone.children[0].getWorldPosition(endPos);
      const length = startPos.distanceTo(endPos);
      mesh.scale.set(1, length / mesh.geometry.parameters.height, 1); 
      const midPos = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
      mesh.position.copy(midPos);

      const dir = new THREE.Vector3().subVectors(endPos, startPos).normalize();
      const axis = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, dir);
      mesh.quaternion.copy(quaternion);
    }
  });

  // RAYCASTING
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(boneHelpers.map(b => b.mesh), true);

  if (intersects.length > 0) {
    const hoveredBone = boneHelpers.find(b => b.mesh === intersects[0].object);
    if (hoveredBone) boneNameDiv.textContent = hoveredBone.bone.name;
  } else {
    boneNameDiv.textContent = '';
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

