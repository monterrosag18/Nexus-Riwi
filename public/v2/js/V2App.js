const THREE = window.THREE;
import { InfiniteGrid } from './InfiniteGrid.js';
import { NexusCore } from './NexusCore.js';
import { HolographicBanner } from './HolographicBanner.js';
import { StarSystem } from './StarSystem.js';
import { BridgeHUD } from './BridgeHUD.js';
import { TacticalUnits } from './TacticalUnits.js';

export class V2App {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 15000);
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true, 
            logarithmicDepthBuffer: true 
        });
        
        this.bloomComposer = null;
        this.finalComposer = null;
        this.controls = null;
        this.clock = new THREE.Clock();
        this.composer = null; // Simple composer

        this.components = {
            grid: null,
            nexus: null,
            banners: [],
            stars: null,
            hud: null
        };
        
        this.clans = [
            { id: 1, name: "Turing", color: 0x00f3ff, pos: {x: -150, z: 0} },
            { id: 2, name: "Tesla", color: 0xff3344, pos: {x: 180, z: -150} },
            { id: 3, name: "McCarthy", color: 0x33ff66, pos: {x: 50, z: 200} },
            { id: 4, name: "Hamilton", color: 0xffcc33, pos: {x: -120, z: -180} },
            { id: 5, name: "Lovelace", color: 0xff33ff, pos: {x: 250, z: 100} }
        ];

        this.materials = {}; // Cache for selective bloom
        this.darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
    }

    async init() {
        // 1. RENDERER SETUP (Filmic Tone Mapping)
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.container.appendChild(this.renderer.domElement);

        this.scene.background = new THREE.Color(0x020205);
        this.camera.position.set(200, 300, 600);
        this.scene.add(this.camera);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2.1; // Stay above ground

        // 2. SIMPLE BLOOM SETUP (no selective bloom - it was darkening the Nexus model)
        const renderScene = new THREE.RenderPass(this.scene, this.camera);
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.5, 0.3, 0.85
        );

        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(bloomPass);

        // 3. LIGHTING (Clean neutral setup)
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const directional = new THREE.DirectionalLight(0xffffff, 1.5);
        directional.position.set(200, 600, 200);
        this.scene.add(directional);
        const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
        backLight.position.set(-200, 200, -200);
        this.scene.add(backLight);

        // 4. COMPONENTS
        this.components.stars = new StarSystem(this.scene);
        this.components.grid = new InfiniteGrid(this.scene);
        this.components.nexus = new NexusCore(this.scene);
        await this.components.nexus.init();
        this.components.hud = new BridgeHUD(this.scene, this.camera);
        this.components.units = new TacticalUnits(this.scene, this.clans.map(c => c.pos));

        this.clans.forEach(c => {
            const banner = new HolographicBanner(this.scene, c.color, c.pos, c.name);
            this.components.banners.push(banner);
        });

        this.animate();
        window.addEventListener('resize', () => this.onWindowResize());
        return Promise.resolve();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.composer.render();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const time = this.clock.getElapsedTime();

        if (this.controls) this.controls.update();

        this.components.grid.update(time);
        if (this.components.nexus) this.components.nexus.update(time);
        this.components.banners.forEach(b => b.update(time));
        this.components.stars.update(this.camera);

        this.render();
    }
}
