const THREE = window.THREE;
import { InfiniteGrid } from './InfiniteGrid.js';
import { NexusCore } from './NexusCore.js';
import { CrystalMonument } from './CrystalMonument.js';
import { SpaceBackground } from './SpaceBackground.js';
import { BridgeHUD } from './BridgeHUD.js';
import { TacticalUnits } from './TacticalUnits.js';
import { ParticleStreams } from './ParticleStreams.js';
import { AsteroidField } from './AsteroidField.js';
import { AudioManager } from './AudioManager.js';
import { ClanShips } from './ClanShips.js';
import { NexusSign } from './NexusSign.js';
import { ShootingStars } from './ShootingStars.js';



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
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.selectedHexIndex = null;
        this.gameTimer = null;
        this.gameTimeLeft = 60;

        this.components = {
            grid:      null,
            nexus:     null,
            streams:   null,
            asteroids: null,
            banners:   [],
            space:     null,
            hud:       null,
            audio:     null,
            ships:     null,
            sign:      null,
            stars:     null
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

        // Background handled by SpaceBackground — pure black fallback
        this.scene.background = new THREE.Color(0x000005);
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
        this.components.space  = new SpaceBackground(this.scene);
        this.components.grid   = new InfiniteGrid(this.scene);
        this.components.nexus  = new NexusCore(this.scene);
        await this.components.nexus.init();
        this.components.streams   = new ParticleStreams(this.scene);
        this.components.asteroids  = new AsteroidField(this.scene);   // 🪨 asteroids
        this.components.hud     = new BridgeHUD(this.scene, this.camera);
        this.components.units   = new TacticalUnits(this.scene, this.clans.map(c => c.pos));

        this.clans.forEach(c => {
            const monument = new CrystalMonument(this.scene, this.camera, c.name, c.color, c.pos);
            this.components.banners.push(monument);
        });

        this.components.audio = new AudioManager(this.camera);
        this.components.ships = new ClanShips(this.scene, this.camera, this.clans);
        this.components.sign = new NexusSign(this.scene, this.camera);
        this.components.stars = new ShootingStars(this.scene);
        this._initUI();

        // Reveal the app to the window for HTML button access
        window.v2app = this;
        this.renderer.domElement.addEventListener('pointerdown', (e) => this._onPointerDown(e));



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

    _initUI() {
        const startOverlay = document.getElementById('start-overlay');
        const settingsTrigger = document.getElementById('settings-trigger');
        const settingsPanel = document.getElementById('settings-panel');
        const closeSettings = document.getElementById('close-settings');
        const audioToggle = document.getElementById('audio-toggle');
        const bloomToggle = document.getElementById('bloom-toggle');

        // Start Overlay (Audio context requires user interaction)
        startOverlay.addEventListener('click', () => {
            if (this.components.audio) this.components.audio.start();
            gsap.to(startOverlay, { opacity: 0, duration: 1, onComplete: () => startOverlay.remove() });
        });

        // Settings Toggle
        settingsTrigger.addEventListener('click', () => {
            settingsPanel.classList.toggle('open');
        });

        closeSettings.addEventListener('click', () => {
            settingsPanel.classList.remove('open');
        });

        // Audio Mute Toggle
        audioToggle.addEventListener('change', (e) => {
            if (this.components.audio) this.components.audio.toggleMute();
        });

        // Bloom Toggle
        bloomToggle.addEventListener('change', (e) => {
            const bloomPass = this.composer.passes.find(p => p.strength !== undefined);
            if (bloomPass) {
                bloomPass.enabled = e.target.checked;
            }
        });
    }

    render() {
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const time = this.clock.getElapsedTime();
        const dt   = this.clock.getDelta ? 0.016 : 0.016; // ~60fps delta

        if (this.controls) this.controls.update();

        this.components.grid.update(time);
        if (this.components.nexus)    this.components.nexus.update(time);
        if (this.components.streams)   this.components.streams.update(0.016);
        if (this.components.asteroids)  this.components.asteroids.update(0.016);
        if (this.components.ships)      this.components.ships.update(time);
        if (this.components.sign)       this.components.sign.update(time);
        if (this.components.stars)      this.components.stars.update(time);
        this.components.banners.forEach(b => b.update(time));


        this.components.space.update(this.camera);

        this.render();
    }

    // ── GAME LOGIC ────────────────────────────────────────────────────────
    _onPointerDown(event) {
        // Only trigger if no challenge is active
        if (this.selectedHexIndex !== null) return;

        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersects = this.raycaster.intersectObject(this.components.grid.fills);

        if (intersects.length > 0) {
            this.selectedHexIndex = intersects[0].instanceId;
            this.openSelector();
        }
    }

    openSelector() {
        const overlay = document.getElementById('challenge-overlay');
        overlay.style.display = 'flex';
        setTimeout(() => overlay.classList.add('active'), 10);
        document.getElementById('game-selector').style.display = 'block';
        document.getElementById('game-panel').style.display = 'none';
    }

    startChallenge(type) {
        this.gameTimeLeft = 60;
        document.getElementById('game-selector').style.display = 'none';
        document.getElementById('game-panel').style.display = 'block';
        this.renderChallenge(type);
        this.startTimer();
    }

    startTimer() {
        clearInterval(this.gameTimer);
        this.gameTimer = setInterval(() => {
            this.gameTimeLeft--;
            const timerEl = document.getElementById('challenge-timer');
            if (timerEl) timerEl.innerText = `00:${this.gameTimeLeft.toString().padStart(2, '0')}`;
            if (this.gameTimeLeft <= 0) this.failChallenge('TIEMPO AGOTADO');
        }, 1000);
    }

    renderChallenge(type) {
        const title = document.getElementById('game-title');
        const content = document.getElementById('game-content');
        this.nodesState = [90, 180, 0, 270, 90, 0, 180, 270, 90]; // Initial rotations

        if (type === 'code') {
            title.innerText = 'REACTOR INJEKTOR: CORE STABILIZATION';
            content.innerHTML = `
                <div class="reactor-hud">
                    <div id="reactor-core" class="reactor-core"></div>
                </div>
                <p>Define <span class="highlight">status = "online"</span> para sincronizar los núcleos gravitacionales.</p>
                <textarea id="code-input" class="code-area" oninput="window.v2app.updateReactor()">let status = "offline";\n\n// ESCRIBE AQUÍ: status = "online";\n</textarea>
                <button class="btn-action" onclick="window.v2app.checkAnswer('code')">ESTABILIZAR NÚCLEO</button>
            `;
        } else if (type === 'english') {
            title.innerText = 'TACTICAL RADIO: LIAISON PROTOCOL';
            content.innerHTML = `
                <div class="radio-screen">
                    <div id="radio-text" class="glitch-text">Esperando señal de Barranquilla...</div>
                </div>
                <p style="margin-top:15px;">Barranquilla dice: <span class="highlight">"We need to bypass the firewall manually."</span> ¿Cómo respondes?</p>
                <div class="option-item" onclick="window.v2app.checkAnswer('english', 1)">A) "Copy that, attacking the wall now."</div>
                <div class="option-item" onclick="window.v2app.checkAnswer('english', 2)">B) "Understood, initiating manual bypass sequence."</div>
                <div class="option-item" onclick="window.v2app.checkAnswer('english', 3)">C) "Roger, closing the firewall immediately."</div>
            `;
            setTimeout(() => { document.getElementById('radio-text').innerText = "CONEXIÓN ESTABLE: RECIBIENDO ÓRDENES..."; }, 1000);
        } else {
            title.innerText = 'NEURAL-FLOW: LOGIC ROUTING';
            content.innerHTML = `
                <p>Rota los nodos para conectar el flujo de datos de <span class="highlight">ENTRADA</span> a <span class="accent">SALIDA</span>.</p>
                <div class="logic-grid" id="logic-grid">
                    ${this.nodesState.map((rot, i) => `
                        <div class="node" id="node-${i}" style="transform: rotate(${rot}deg)" onclick="window.v2app.rotateNode(${i})">
                            ${i === 4 ? '⬢' : (i % 2 === 0 ? '┗' : '┃')}
                        </div>
                    `).join('')}
                </div>
                <button class="btn-action" onclick="window.v2app.checkAnswer('soft')">VALIDAR RUTA</button>
            `;
        }
    }

    updateReactor() {
        const val = document.getElementById('code-input').value;
        const core = document.getElementById('reactor-core');
        if (val.includes('status = "online"')) {
            core.classList.add('stable');
        } else {
            core.classList.remove('stable');
        }
    }

    rotateNode(index) {
        this.nodesState[index] = (this.nodesState[index] + 90) % 360;
        const node = document.getElementById(`node-${index}`);
        node.style.transform = `rotate(${this.nodesState[index]}deg)`;
        node.classList.add('active');
        setTimeout(() => node.classList.remove('active'), 200);
    }

    checkAnswer(type, selection) {
        let win = false;
        if (type === 'code') {
            const val = document.getElementById('code-input').value;
            if (val.includes('status = "online"')) win = true;
        } else if (type === 'english') {
            if (selection === 2) win = true;
        } else {
            // Neural-Flow win condition: Simple check for 0-degree rotation on critical path
            win = this.nodesState.every(rot => rot === 0); 
            // For the demo, let's make it easier: if all nodes are at 0 deg
            if (!win) alert('FLUJO INTERRUMPIDO: ALINEA LOS NODOS (TODOS A 0°)');
        }

        if (win) this.winChallenge();
        else if (type !== 'soft') alert('PROTOCOLO FALLIDO: REINTENTA');
    }

    winChallenge() {
        clearInterval(this.gameTimer);
        alert('¡BREACH EXITOSO! SECTOR CONQUISTADO.');
        
        // Change hex color logic
        if (this.selectedHexIndex !== null) {
            this.components.grid.setTerritoryColor([this.selectedHexIndex], 0x00f3ff);
            // Optional: Launch ship impact effect here
        }
        
        this.closeChallenge();
    }

    failChallenge(reason) {
        clearInterval(this.gameTimer);
        alert(`FALLO CRÍTICO: ${reason}`);
        this.closeChallenge();
    }

    closeChallenge() {
        const overlay = document.getElementById('challenge-overlay');
        overlay.classList.remove('active');
        setTimeout(() => overlay.style.display = 'none', 500);
        this.selectedHexIndex = null;
        clearInterval(this.gameTimer);
    }
}
