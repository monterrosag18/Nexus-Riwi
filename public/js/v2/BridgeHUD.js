const THREE = window.THREE;

export class BridgeHUD {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.group = new THREE.Group();
        this.init();
    }

    init() {
        // 1. COCKPIT FRAME (Dark Metallic) - Fixed to Camera
        const frameGeo = new THREE.RingGeometry(400, 600, 4, 1);
        const frameMat = new THREE.MeshStandardMaterial({ 
            color: 0x111111, 
            metalness: 1.0, 
            roughness: 0.1,
            side: THREE.DoubleSide
        });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.z = -500;
        this.group.add(frame);

        // 2. GLASS EFFECT (Refraction)
        const glassGeo = new THREE.PlaneGeometry(1000, 1000);
        const glassMat = new THREE.MeshPhysicalMaterial({
            transmission: 0.1,
            thickness: 5,
            roughness: 0,
            transparent: true,
            opacity: 0.1,
            color: 0x00f3ff
        });
        const glass = new THREE.Mesh(glassGeo, glassMat);
        glass.position.z = -490;
        this.group.add(glass);

        // 3. DASHBOARD (Bottom part)
        const dashGeo = new THREE.BoxGeometry(1000, 200, 50);
        const dash = new THREE.Mesh(dashGeo, frameMat);
        dash.position.y = -400;
        dash.position.z = -450;
        this.group.add(dash);

        this.camera.add(this.group);
    }

    update() {
        // HUD moves with camera but stays focused
    }
}
