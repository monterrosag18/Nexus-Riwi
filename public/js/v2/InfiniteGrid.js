const THREE = window.THREE;

export class InfiniteGrid {
    constructor(scene) {
        this.scene = scene;
        this.count = 600; 
        this.mesh = null;
        
        this.territories = [
            { center: new THREE.Vector3(-150, 0, 0), color: 0x00f3ff },
            { center: new THREE.Vector3(180, 0, -150), color: 0xff3344 },
            { center: new THREE.Vector3(50, 0, 200), color: 0x33ff66 },
            { center: new THREE.Vector3(-120, 0, -180), color: 0xffcc33 },
            { center: new THREE.Vector3(250, 0, 100), color: 0xff33ff }
        ];

        this.init();
    }

    init() {
        // 1. HEX GEOMETRY (Beveled/Detailed)
        const extrudeSettings = { depth: 2, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.5 };
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

        // 2. METALLIC MATERIAL (PBR)
        const material = new THREE.MeshStandardMaterial({
            color: 0x050505,
            metalness: 1.0,
            roughness: 0.2,
            emissive: 0x000000 // Subtle highlight
        });

        this.mesh = new THREE.InstancedMesh(geometry, material, this.count);
        
        const matrix = new THREE.Matrix4();
        const hexSpacing = 19;
        let idx = 0;

        const radius = 350;
        for (let q = -20; q <= 20; q++) {
            for (let r = -20; r <= 20; r++) {
                const x = hexSpacing * (q + r/2);
                const z = hexSpacing * (Math.sqrt(3)/2) * r;
                
                if (Math.sqrt(x*x + z*z) < radius) {
                    if (idx >= this.count) break;
                    
                    matrix.setPosition(x, 0, z);
                    this.mesh.setMatrixAt(idx, matrix);

                    // Color based on territory
                    let color = new THREE.Color(0x050505);
                    this.territories.forEach(t => {
                        const dist = Math.sqrt(Math.pow(x - t.center.x, 2) + Math.pow(z - t.center.z, 2));
                        if (dist < 100) {
                            color.lerp(new THREE.Color(t.color), 0.15); // Fade in territory color
                        }
                    });
                    this.mesh.setColorAt(idx, color);
                    idx++;
                }
            }
        }

        this.scene.add(this.mesh);
    }

    update(time) {
        // Static for now, but could animate edge glow if needed
    }
}
