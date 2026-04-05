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
        this.particles = null; // Orbital Strike System

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

        if (this.particles) {
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] -= 2; // fall speed
                if (positions[i+1] < -10) positions[i+1] = 500; 
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }


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
        this.gameType = type;

        if (type === 'code') {
            title.innerText = 'REACTOR MASTERY: LOOP SYNCHRONIZATION';
            content.innerHTML = `
                <div class="reactor-mastery" id="reactor-bars">
                    ${[0,1,2,3,4].map(i => `<div class="reactor-bar" id="bar-${i}"></div>`).join('')}
                </div>
                <p>Estabiliza las 5 barras usando un <span class="highlight">for loop</span>. Usa <span class="accent">bars[i].sync();</span></p>
                <textarea id="code-input" class="code-area">for(let i=0; i<5; i++) {\n  // Escribe: bars[i].sync();\n}</textarea>
                <button class="btn-action" onclick="window.v2app.checkAnswer('code')">EJECUTAR BUCLE</button>
            `;
        } else if (type === 'english') {
            title.innerText = 'SIGNAL REASSEMBLY: TECHNICAL ENGLISH';
            this.reassemblyWords = [];
            const fragments = ["INITIATE", "SECTOR", "PERSISTENCE", "SEQUENCE", "NOW"];
            content.innerHTML = `
                <div class="reassembly-slot" id="reassembly-display">... CONSTRUYENDO COMANDO ...</div>
                <p>Rearma la instrucción de defensa de la Flota:</p>
                <div class="fragment-container">
                    ${fragments.sort(() => Math.random() - 0.5).map(f => `
                        <div class="fragment" onclick="window.v2app.addFragment('${f}')">${f}</div>
                    `).join('')}
                </div>
                <button class="btn-action" style="background:#444;" onclick="window.v2app.clearFragments()">REINICIAR</button>
            `;
        } else {
            title.innerText = 'NEURAL-SYNC: DATA TIMING';
            content.innerHTML = `
                <div class="sync-container">
                    <div id="data-packet" class="data-packet"></div>
                    <div id="sync-gate" class="sync-gate" onclick="window.v2app.checkSync()">GATE</div>
                </div>
                <p>Cliquea el <span class="highlight">GATE</span> justo cuando el paquete de datos pase por el centro.</p>
            `;
            this.startPacketAnimation();
        }
    }

    // --- REASSEMBLY LOGIC ---
    addFragment(word) {
        this.reassemblyWords.push(word);
        document.getElementById('reassembly-display').innerText = this.reassemblyWords.join(" ");
        if (this.reassemblyWords.length === 5) {
            if (this.reassemblyWords.join(" ") === "INITIATE SECTOR PERSISTENCE SEQUENCE NOW") {
                this.winChallenge();
            } else {
                alert("COMANDO INVÁLIDO: REINICIANDO");
                this.clearFragments();
            }
        }
    }
    clearFragments() { 
        this.reassemblyWords = []; 
        document.getElementById('reassembly-display').innerText = "..."; 
    }

    // --- NEURAL SYNC LOGIC ---
    startPacketAnimation() {
        const packet = document.getElementById('data-packet');
        gsap.to(packet, {
            left: "100%", duration: 2, repeat: -1, ease: "none"
        });
    }
    checkSync() {
        const packet = document.getElementById('data-packet');
        const pos = parseFloat(packet.style.left);
        if (pos > 65 && pos < 75) {
            this.winChallenge();
        } else {
            alert("FUERA DE SINCRONÍA: EL PAQUETE SE PERDIÓ");
        }
    }

    checkAnswer(type) {
        if (type === 'code') {
            const code = document.getElementById('code-input').value;
            // Enhanced loop simulator
            if (code.includes('for') && code.includes('bars[i].sync()')) {
                let i = 0;
                const interval = setInterval(() => {
                    document.getElementById(`bar-${i}`).classList.add('active');
                    i++;
                    if (i === 5) {
                        clearInterval(interval);
                        setTimeout(() => this.winChallenge(), 1000);
                    }
                }, 400);
            } else {
                alert("ERROR DE SINTAXIS: BUCLE NO DETECTADO");
            }
        }
    }

    winChallenge() {
        clearInterval(this.gameTimer);
        this.createOrbitalStrike();
        alert('¡MAESTRÍA DEMOSTRADA! SECTOR ASEGURADO.');
        
        if (this.selectedHexIndex !== null) {
            this.components.grid.setTerritoryColor([this.selectedHexIndex], 0x00f3ff);
        }
        this.closeChallenge();
    }

    createOrbitalStrike() {
        // Particle beam from sky
        const geometry = new THREE.BufferGeometry();
        const pts = [];
        for(let i=0; i<100; i++) {
            pts.push((Math.random()-0.5)*20, 500*Math.random(), (Math.random()-0.5)*20);
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
        const material = new THREE.PointsMaterial({ color: 0x00f3ff, size: 2 });
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
        
        setTimeout(() => {
            this.scene.remove(this.particles);
            this.particles = null;
        }, 2000);
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
