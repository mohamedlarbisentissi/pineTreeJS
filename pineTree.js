import * as THREE from 'three';

export default class PineTree {
    constructor(pineTreeParams) {
        this.baseRadius = pineTreeParams.baseRadius;
        this.baseLength = pineTreeParams.baseLength;
        this.branchAngle = pineTreeParams.branchAngle;
        this.scalingFactor = pineTreeParams.scalingFactor;
        this.branchLengthPadding = pineTreeParams.branchLengthPadding;
        this.branchingFactor = pineTreeParams.branchingFactor;
        this.recursionDepth = pineTreeParams.recursionDepth;
        // Geometry, Material
        this.geometry = pineTreeParams.geometry;
        this.material = pineTreeParams.material;
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
            const child = new THREE.Mesh(this.geometry, this.material);
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