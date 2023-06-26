import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import PineTree from './pineTree';
import './style.css';
import { GUI } from 'dat.gui';

// Geometry parameters
const pineTreeParams = {
    branchingFactor: 4,
    recursionDepth: 2.
};

// Size of the canvas
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

// Scene
const scene = new THREE.Scene();

// Geometry, Material, Mesh
let baseMesh = new PineTree(pineTreeParams.branchingFactor, pineTreeParams.recursionDepth).generateMesh();
scene.add(baseMesh);

// GUI to control branching factor and recursion depth
const gui = new GUI();
const branchingFactorController = gui.add(pineTreeParams, 'branchingFactor', 2, 10, 1);
const recursionDepthController = gui.add(pineTreeParams, 'recursionDepth', 1, 10, 1);
branchingFactorController.onFinishChange((value) => {
    pineTreeParams.branchingFactor = value;
    scene.remove(baseMesh);
    baseMesh = new PineTree(pineTreeParams.branchingFactor, pineTreeParams.recursionDepth).generateMesh();
    scene.add(baseMesh);
});
recursionDepthController.onFinishChange((value) => {
    pineTreeParams.recursionDepth = value;
    scene.remove(baseMesh);
    baseMesh = new PineTree(pineTreeParams.branchingFactor, pineTreeParams.recursionDepth).generateMesh();
    scene.add(baseMesh);
});

// Light
const light = new THREE.DirectionalLight(0xffffff, 0.5);
light.position.set(0, 1, 1);
scene.add(light);

// Camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000);
camera.position.z = 300;
scene.add(camera);

// Renderer
const canvas = document.querySelector('.webgl');
canvas.style.display = "block";
const renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(2);
renderer.render(scene, camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.autoRotate = false;
controls.autoRotateSpeed = 3.0;

// Resize
window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
});

// Main animation loop
const animate = () => {
    window.requestAnimationFrame(animate);

    // Update controls
    controls.update();

    // Render
    //scene.updateMatrixWorld();
    renderer.render(scene, camera);
}
animate();
