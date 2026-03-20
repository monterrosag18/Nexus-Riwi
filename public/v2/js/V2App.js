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
        
        // Clans evenly spaced in a ring at radius 600
        const clanDefs = [
            { name: "Turing",   color: 0x00c3ff },
            { name: "Tesla",    color: 0xff3344 },
            { name: "McCarthy", color: 0x00ff44 },
            { name: "Hamilton", color: 0xF2C94C },
            { name: "Thompson", color: 0x9B51E0 },
        ];
        const clanRingRadius = 620;
        this.clans = clanDefs.map((c, i) => {
            const angle = (i / clanDefs.length) * Math.PI * 2 - Math.PI / 2;
            return {
                id: i + 1,
                ...c,
                pos: {
                    x: Math.cos(angle) * clanRingRadius,
                    z: Math.sin(angle) * clanRingRadius
                }
            };
        });

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
        this.camera.position.set(0, 500, 700);
        this.camera.lookAt(0, 0, 0);
        this.scene.add(this.camera);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2.1; // Stay above ground

        // 2. BLOOM — High intensity for neon glow effect
        const renderScene = new THREE.RenderPass(this.scene, this.camera);
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.8,  // strength
            0.5,  // radius
            0.75  // threshold — only very bright things glow
        );

        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(bloomPass);

        // 3. LIGHTING — Matching nebula palette (purple left, orange right, cyan top)
        this.scene.add(new THREE.AmbientLight(0x111122, 1.0));

        const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
        keyLight.position.set(300, 800, 400);
        this.scene.add(keyLight);

        // Purple fill — left side
        const purpleLight = new THREE.DirectionalLight(0x6633cc, 0.8);
        purpleLight.position.set(-600, 200, 0);
        this.scene.add(purpleLight);

        // Warm orange fill — right side
        const orangeLight = new THREE.DirectionalLight(0xff8833, 0.6);
        orangeLight.position.set(600, 200, 0);
        this.scene.add(orangeLight);

        // Cyan top glow — above the nexus
        const cyanLight = new THREE.PointLight(0x00eeff, 1.2, 1500);
        cyanLight.position.set(0, 500, 0);
        this.scene.add(cyanLight);

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
