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

        this.BLOOM_LAYER = 1;

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

        // 2. SELECTIVE BLOOM SETUP
        const renderScene = new THREE.RenderPass(this.scene, this.camera);
        
        // Bloom pass (Subtle)
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.6, 0.2, 0.95
        );

        this.bloomComposer = new THREE.EffectComposer(this.renderer);
        this.bloomComposer.renderToScreen = false;
        this.bloomComposer.addPass(renderScene);
        this.bloomComposer.addPass(bloomPass);

        // Final Mix Pass
        const finalPass = new THREE.ShaderPass(
            new THREE.ShaderMaterial({
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: this.bloomComposer.renderTarget2.texture }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform sampler2D baseTexture;
                    uniform sampler2D bloomTexture;
                    varying vec2 vUv;
                    void main() {
                        gl_FragColor = (texture2D(baseTexture, vUv) + vec4(1.0) * texture2D(bloomTexture, vUv));
                    }
                `,
                defines: {}
            }), "baseTexture"
        );
        finalPass.needsSwap = true;

        this.finalComposer = new THREE.EffectComposer(this.renderer);
        this.finalComposer.addPass(renderScene);
        this.finalComposer.addPass(finalPass);

        // 3. LIGHTING (Cinematic setup)
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.3));
        this.scene.add(new THREE.HemisphereLight(0xffffff, 0x000000, 0.4));
        
        const directional = new THREE.DirectionalLight(0xffffff, 1.2);
        directional.position.set(100, 400, 200);
        this.scene.add(directional);

        // Remove pointLight as it was causing the "ugly green" wash

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
        this.bloomComposer.setSize(window.innerWidth, window.innerHeight);
        this.finalComposer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        // SELECTIVE BLOOM LOGIC
        this.scene.traverse(obj => {
            if (obj.isMesh && obj.layers && typeof obj.layers.isEnabled === 'function' && !obj.layers.isEnabled(this.BLOOM_LAYER)) {
                this.materials[obj.uuid] = obj.material;
                obj.material = this.darkMaterial;
            }
        });

        this.bloomComposer.render();

        this.scene.traverse(obj => {
            if (this.materials[obj.uuid]) {
                obj.material = this.materials[obj.uuid];
                delete this.materials[obj.uuid];
            }
        });

        this.finalComposer.render();
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
