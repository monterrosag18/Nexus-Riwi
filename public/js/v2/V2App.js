const THREE = window.THREE;
import { InfiniteGrid } from './InfiniteGrid.js';
import { SpectralPrism } from './SpectralPrism.js';
import { HolographicBanner } from './HolographicBanner.js';

export class V2App {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        this.composer = null;
        this.controls = null;
        this.clock = new THREE.Clock();

        this.components = {
            grid: null,
            tower: null,
            banners: []
        };
    }

    async init() {
        // 1. RENDERER SETUP
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.set(400, 300, 600);
        this.camera.lookAt(0, 0, 0);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // 2. POST-PROCESSING (AAA BLOOM)
        const renderScene = new THREE.RenderPass(this.scene, this.camera);
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            2.0, // Strength (Increase for that sci-fi pop)
            0.5, // Radius
            0.4  // Threshold (Lower to catch more glow)
        );

        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(bloomPass);

        // 3. LIGHTING
        this.scene.add(new THREE.AmbientLight(0x222244, 0.5));
        const directional = new THREE.DirectionalLight(0xffffff, 1.0);
        directional.position.set(100, 500, 100);
        this.scene.add(directional);

        // 4. ENVIRONMENT (Galaxy)
        this.createGalaxy();

        // 5. V2 COMPONENTS
        this.components.grid = new InfiniteGrid(this.scene);
        this.components.tower = new SpectralPrism(this.scene);
        
        // Add clanes (holographic positions)
        const clans = [
            { color: 0x00f3ff, pos: {x: -200, z: 0} },    // Turing
            { color: 0xff0000, pos: {x: 180, z: -150} }, // Tesla
            { color: 0x00ff00, pos: {x: 50, z: 200} },   // McCarthy
            { color: 0xffff00, pos: {x: -120, z: -180} } // Hamilton
        ];

        clans.forEach(c => {
            this.components.banners.push(new HolographicBanner(this.scene, c.color, {x: c.pos.x, y: 0, z: c.pos.z}));
        });

        // 6. START LOOP
        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
        console.log("[NexusV2] Infinity Protocol Engaged.");
        return Promise.resolve();
    }

    createGalaxy() {
        const loader = new THREE.TextureLoader();
        const starsGeo = new THREE.SphereGeometry(4000, 64, 64);
        const starsMat = new THREE.MeshBasicMaterial({
            map: loader.load('./assets/textures/8k_stars.jpg'),
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.6
        });
        this.galaxy = new THREE.Mesh(starsGeo, starsMat);
        this.scene.add(this.galaxy);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        if (this.controls) this.controls.update();

        // Update Components
        if (this.components.grid) this.components.grid.update(time);
        if (this.components.tower) this.components.tower.update(time);
        this.components.banners.forEach(b => b.update(time));
        
        if (this.galaxy) this.galaxy.rotation.y += 0.0001;

        this.composer.render();
    }
}
