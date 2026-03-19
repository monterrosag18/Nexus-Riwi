const THREE = window.THREE;

export class TacticalUnits {
    constructor(scene, centers) {
        this.scene = scene;
        this.centers = centers; // Clan centers
        this.init();
    }

    init() {
        this.centers.forEach(c => {
            // Group of units around the banner
            for(let i=0; i<3; i++) {
                const angle = (i / 3) * Math.PI * 2;
                const dist = 30 + Math.random() * 20;
                const pos = {
                    x: c.x + Math.cos(angle) * dist,
                    z: c.z + Math.sin(angle) * dist
                };

                if (Math.random() > 0.5) {
                    this.createTank(pos, c.color);
                } else {
                    this.createMech(pos, c.color);
                }
            }
        });
    }

    createTank(pos, color) {
        const group = new THREE.Group();
        group.position.set(pos.x, 1, pos.z);

        const bodyGeo = new THREE.BoxGeometry(10, 4, 15);
        const mat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.3 });
        const body = new THREE.Mesh(bodyGeo, mat);
        group.add(body);

        const turretGeo = new THREE.CylinderGeometry(3, 4, 3, 16);
        const turret = new THREE.Mesh(turretGeo, mat);
        turret.position.y = 3.5;
        group.add(turret);

        const barrelGeo = new THREE.CylinderGeometry(0.8, 0.8, 12, 8);
        const barrel = new THREE.Mesh(barrelGeo, mat);
        barrel.rotation.x = Math.PI/2;
        barrel.position.y = 4;
        barrel.position.z = 8;
        group.add(barrel);

        // Core light removed — was causing colored halo effect
        this.scene.add(group);
    }

    createMech(pos, color) {
        const group = new THREE.Group();
        group.position.set(pos.x, 0, pos.z);

        const mat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9, roughness: 0.2 });
        
        // Legs
        const legGeo = new THREE.CylinderGeometry(1, 1, 12, 8);
        const l1 = new THREE.Mesh(legGeo, mat);
        l1.position.set(-3, 6, 0);
        group.add(l1);
        const l2 = new THREE.Mesh(legGeo, mat);
        l2.position.set(3, 6, 0);
        group.add(l2);

        // Body
        const bodyGeo = new THREE.SphereGeometry(6, 4, 4); // Low poly diamond shape
        const body = new THREE.Mesh(bodyGeo, mat);
        body.position.y = 15;
        group.add(body);

        // Head/Core
        const coreGeo = new THREE.BoxGeometry(4, 4, 4);
        const coreMat = new THREE.MeshStandardMaterial({ emissive: color, emissiveIntensity: 2 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.y = 15;
        core.position.z = 4;
        core.layers.set(1); // Bloom
        group.add(core);

        this.scene.add(group);
    }
}
