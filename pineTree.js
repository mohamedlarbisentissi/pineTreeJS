import * as THREE from 'three';

export default class PineTree {
    constructor(branchingFactor, recursionDepth) {
        this.baseRadius = 1;
        this.baseLength = 200;
        this.branchAngle = 60 * Math.PI / 180;
        this.scalingFactor = 2;
        this.branchLengthPadding = 0.8;
        this.branchingFactor = branchingFactor;
        this.recursionDepth = recursionDepth;
        // Geometry, Material
        this.geometry = new THREE.CylinderGeometry(this.baseRadius, this.baseRadius, this.baseLength, 32);
        this.material = new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.5, metalness: 0.5 });
    }

    generateMesh() {
        // Construction of base branch Mesh
        const mesh = new THREE.Mesh(this.geometry, this.material);
        // Construction of child branches
        this.#addChildren(mesh, this.recursionDepth);
        return mesh;
    }

    #addChildren(parentMesh, remainingRecursionDepth) {
        // Construction of child branches
        if (remainingRecursionDepth <= 0) {
            return;
        }
        for(let i = 0; i < this.branchingFactor; i++) {
            let child = new THREE.Mesh(this.geometry, this.material);
            parentMesh.add(child);
            child.scale.set(1 / this.scalingFactor, 1 / this.scalingFactor, 1 / this.scalingFactor);
            child.applyMatrix4(new THREE.Matrix4().makeRotationZ(this.branchAngle));
            child.applyMatrix4(new THREE.Matrix4().makeTranslation(-parentMesh.geometry.parameters.height * child.scale.x * Math.sin(child.rotation.z) / 2, 0, 0));
            child.applyMatrix4(new THREE.Matrix4().makeRotationY(i * 2 * Math.PI / this.branchingFactor));
            const yOffset = (this.branchLengthPadding - child.scale.x * Math.cos(this.branchAngle)) * parentMesh.geometry.parameters.height / 2;
            const deltaY = 2 * yOffset / (this.branchingFactor - 1) * i;
            child.applyMatrix4(new THREE.Matrix4().makeTranslation(0, deltaY - yOffset, 0));
            this.#addChildren(child, remainingRecursionDepth - 1);
        }
    }

}