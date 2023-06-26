import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import PineTree from './pineTree';
import './style.css';
import { GUI } from 'dat.gui';

// Geometry parameters
const pineTreeParams = {
    branchingFactor: 4,
    recursionDepth: 2,
    baseRadius: 1,
    baseLength: 200,
    branchAngle: 60 * Math.PI / 180,
    scalingFactor: 2,
    branchLengthPadding: 0.8,
};
pineTreeParams.geometry = new THREE.CylinderGeometry(pineTreeParams.baseRadius, pineTreeParams.baseRadius, pineTreeParams.baseLength, 32);
pineTreeParams.material = new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.5, metalness: 0.5 });

// Size of the canvas
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

// Scene
const scene = new THREE.Scene();

// Mesh
let baseMesh = new PineTree(pineTreeParams).generateMesh();
scene.add(baseMesh);

// GUI to control branching factor and recursion depth
const gui = new GUI();
const branchingFactorController = gui.add(pineTreeParams, 'branchingFactor', 2, 10, 1);
const recursionDepthController = gui.add(pineTreeParams, 'recursionDepth', 1, 10, 1);
branchingFactorController.onFinishChange((value) => {
    pineTreeParams.branchingFactor = value;
    scene.remove(baseMesh);
    baseMesh = new PineTree(pineTreeParams).generateMesh();
    scene.add(baseMesh);
});
recursionDepthController.onFinishChange((value) => {
    pineTreeParams.recursionDepth = value;
    scene.remove(baseMesh);
    baseMesh = new PineTree(pineTreeParams).generateMesh();
    scene.add(baseMesh);
});

// Light
const light = new THREE.DirectionalLight(0xffffff, 3);
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

// Mouse position and click tracking
const pointer = new THREE.Vector2();
window.addEventListener('mousemove', (event) => {
    pointer.x = (event.clientX / sizes.width) * 2 - 1;
    pointer.y = -(event.clientY / sizes.height) * 2 + 1;
});

// Raycasting to intersect with meshes and add new branches
const raycaster = new THREE.Raycaster();
window.addEventListener('click', (event) => {
    if(event.button === 0) {
        // Raycasting
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(scene.children);
        if(intersects.length > 0)
        {
            const child = new THREE.Mesh(pineTreeParams.geometry, pineTreeParams.material);
            const parent = intersects[0].object;
            parent.add(child);
            const localCoords = parent.worldToLocal(intersects[0].point);
            child.position.set(localCoords.x, localCoords.y, localCoords.z);
            child.scale.set(1 / pineTreeParams.scalingFactor, 1 / pineTreeParams.scalingFactor, 1 / pineTreeParams.scalingFactor);
            const trueNormal = intersects[0].normal.clone().normalize();
            const crossVec = new THREE.Vector3().crossVectors(trueNormal, parent.localToWorld(new THREE.Vector3(0, 1, 0))).normalize();
            trueNormal.applyAxisAngle(crossVec, Math.PI / 2 - pineTreeParams.branchAngle);
            child.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), trueNormal);
            child.translateOnAxis(new THREE.Vector3(0, 1, 0), pineTreeParams.baseLength / pineTreeParams.scalingFactor / 2);
        }
    }
});

// Main animation loop
const animate = () => {
    // Rotate all branches
    baseMesh.traverse((child) => {
        child.applyMatrix4(new THREE.Matrix4().makeRotationY(1e-3));
    });

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call animate again on the next frame
    window.requestAnimationFrame(animate);
};
animate();