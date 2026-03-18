const THREE = window.THREE;
import { InfiniteGrid } from './InfiniteGrid.js';
import { SpectralPrism } from './SpectralPrism.js';
import { HolographicBanner } from './HolographicBanner.js';
import { EnergyNetwork } from './EnergyNetwork.js';
import { NebulaShader } from './NebulaShader.js';

export class V2App {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true });
        
        this.composer = null;
        this.controls = null;
        this.clock = new THREE.Clock();

        this.components = {
            grid: null,
            tower: null,
            banners: [],
            network: null
        };
        
        this.clans = [
            { id: 1, name: "Turing", color: 0x00f3ff, pos: {x: -150, z: 0} },
            { id: 2, name: "Tesla", color: 0xff0000, pos: {x: 150, z: -100} },
            { id: 3, name: "McCarthy", color: 0x00ff00, pos: {x: 50, z: 150} },
            { id: 4, name: "Hamilton", color: 0xffff00, pos: {x: -100, z: -150} },
            { id: 5, name: "Lovelace", color: 0xff00ff, pos: {x: 200, z: 100} }
        ];
    }

    async init() {
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.set(500, 400, 700);
        this.camera.lookAt(0, 0, 0);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.maxDistance = 1500;
        this.controls.minDistance = 200;

        // POST-PROCESSING Pipeline
        const renderScene = new THREE.RenderPass(this.scene, this.camera);
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            2.5, // High intensity bloom for "AAA" look
            0.6,
            0.3
        );

        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(bloomPass);

        // BACKGROUND SHADER
        this.createNebula();

        // COMPONENTS
        this.components.grid = new InfiniteGrid(this.scene);
        this.components.tower = new SpectralPrism(this.scene);
        this.components.network = new EnergyNetwork(this.scene, this.clans.map(c => c.pos));
        
        this.clans.forEach(c => {
            this.components.banners.push(new HolographicBanner(this.scene, c.color, c.pos, c.name));
        });

        // CINEMATIC LIGHTING
        this.scene.add(new THREE.AmbientLight(0x101020, 0.5));
        const spot = new THREE.SpotLight(0xffffff, 2);
        spot.position.set(0, 500, 0);
        spot.angle = 0.5;
        spot.penumbra = 0.5;
        this.scene.add(spot);

        this.animate();
        window.addEventListener('resize', () => this.onWindowResize());
        return Promise.resolve();
    }

    createNebula() {
        const geo = new THREE.SphereGeometry(4000, 32, 32);
        const mat = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(NebulaShader.uniforms),
            vertexShader: NebulaShader.vertexShader,
            fragmentShader: NebulaShader.fragmentShader,
            side: THREE.BackSide
        });
        this.nebula = new THREE.Mesh(geo, mat);
        this.scene.add(this.nebula);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const time = this.clock.getElapsedTime();

        if (this.controls) this.controls.update();

        this.components.grid.update(time);
        this.components.tower.update(time);
        this.components.network.update(time);
        this.components.banners.forEach(b => b.update(time));
        
        if (this.nebula) this.nebula.material.uniforms.time.value = time;

        this.composer.render();
    }
}
