const THREE = window.THREE;

export class InfiniteGrid {
    constructor(scene) {
        this.scene = scene;
        this.count = 2000; // Reduced for better look
        this.mesh = null;
        this.init();
    }

    init() {
        // 1. HEX GEOMETRY (Beveled)
        const extrudeSettings = { depth: 2, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.4 };
        const shape = new THREE.Shape();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * 9.5;
            const y = Math.sin(angle) * 9.5;
            if (i === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
        }
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.rotateX(-Math.PI / 2);

        // 2. NEUTRAL DARK MATERIAL — no pre-painted colors
        const material = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.2,
            roughness: 0.8
        });

        this.mesh = new THREE.InstancedMesh(geometry, material, this.count);
        // Set all instances to the same neutral color
        const neutral = new THREE.Color(0x2a2a2a);

        const matrix = new THREE.Matrix4();
        const hexSpacing = 19;
        let idx = 0;

        // Smaller radius to match what looks clean on screen
        const radius = 650;
        for (let q = -25; q <= 25; q++) {
            for (let r = -25; r <= 25; r++) {
                const x = hexSpacing * (q + r / 2);
                const z = hexSpacing * (Math.sqrt(3) / 2) * r;

                const dist = Math.sqrt(x * x + z * z);
                if (dist < radius && dist > 130) { // Skip center for Nexus
                    if (idx >= this.count) break;
                    matrix.setPosition(x, -5, z);
                    this.mesh.setMatrixAt(idx, matrix);
                    this.mesh.setColorAt(idx, neutral); // All same color
                    idx++;
                }
            }
        }

        this.mesh.instanceMatrix.needsUpdate = true;
        if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
        this.scene.add(this.mesh);
    }

    update(time) {
        // Static
    }
}
