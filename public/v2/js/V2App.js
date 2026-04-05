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
        
        // --- 3D COMMAND NEXUS ---
        this.commandGroup = new THREE.Group();
        this.scene.add(this.commandGroup);
        this.isCommandMode = false;
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

        // --- BRIDGE DIAGNOSTICS ANIMATION ---
        const cpu = document.getElementById('diag-cpu');
        const sync = document.getElementById('diag-sync');
        const react = document.getElementById('diag-reactor');
        if (cpu) cpu.style.width = `${70 + Math.sin(time * 0.005) * 10}%`;
        if (sync) sync.style.width = `${40 + Math.cos(time * 0.008) * 15}%`;
        if (react) react.style.width = `${85 + Math.sin(time * 0.003) * 5}%`;


        this.components.space.update(this.camera);

        this.render();
    }

    // ── GAME LOGIC ────────────────────────────────────────────────────────
    _onPointerDown(event) {
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.pointer, this.camera);

        // Interaction during 3D Command Mode
        if (this.isCommandMode) {
            const intersects = this.raycaster.intersectObjects(this.commandGroup.children);
            if (intersects.length > 0) {
                const obj = intersects[0].object;
                if (obj.userData.onSelect) obj.userData.onSelect();
            }
            return;
        }

        // Standard Hex Selection
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
        this.isCommandMode = true;
        document.getElementById('game-selector').style.display = 'none';
        
        // Hide only the center logic area of the card, keep header/footer
        document.getElementById('game-panel').style.display = 'block';
        document.getElementById('game-content').style.opacity = '0'; // We use 3D space instead

        // --- CINEMATIC CAMERA ZOOM ---
        const hexPos = this.components.grid.getHexPos(this.selectedHexIndex);
        if (hexPos) {
            this.controls.enabled = false;
            gsap.to(this.camera.position, {
                x: hexPos.x, y: 150, z: hexPos.z + 180,
                duration: 1.5, ease: "power2.inOut"
            });
            gsap.to(this.controls.target, {
                x: hexPos.x, y: 0, z: hexPos.z,
                duration: 1.5, ease: "power2.inOut",
                onComplete: () => {
                    this.renderChallenge(type);
                    this.startTimer();
                }
            });

            // Focus Effect: Darken map background
            gsap.to(this.components.grid.fills.material, { opacity: 0.1, duration: 1 });
            gsap.to(this.components.grid.lines.material, { opacity: 0.2, duration: 1 });
        }
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
        const obj = document.getElementById('bridge-objective');
        const debug = document.getElementById('debug-lines');
        debug.innerHTML = ''; 
        this.gameType = type;

        // Massive Briefing Log
        this.addDebugLine(">>> INITIATING_CINEMATIC_MASTERY_PROTOCOL <<<");
        this.addDebugLine(">>> DEPLOYING_VISUAL_INTERFACE_v4.0 <<<");

        if (type === 'code') {
            obj.innerText = "[OBJECTIVE]: SYNC ALL CORE RODS USING A LOOP STRUCTURE";
            title.innerText = '[ULTRA_REACTOR_CORE]';
            this._create3DReactor();
            content.innerHTML = `
                <div class="console-container">
                    <textarea id="code-input" class="console-ui" spellcheck="false">for(let i=0; i<5; i++) {\n  bars[i].sync();\n}</textarea>
                </div>
                <button class="btn-action" onclick="window.v2app.checkAnswer('code')">EXECUTE_SYNC</button>
            `;
        } else if (type === 'english') {
            obj.innerText = "[OBJECTIVE]: RECONSTRUCT ENCRYPTED SIGNAL FRAGMENTS";
            title.innerText = '[SIGNAL_DECRYPT_STATION]';
            this.reassemblyWords = [];
            // For now, simpler 3D representation or keep text fragments floating
            this._create3DSignalNodes();
            content.innerHTML = `
                <div class="reassembly-slot" id="reassembly-display" style="font-size: 24px; margin: 20px 0;">READY_FOR_INPUT</div>
                <div class="fragment-container"> 
                    <!-- Fragments handled via Raycasting later -->
                    ${["INITIATE", "SECTOR", "PERSISTENCE", "SEQUENCE", "NOW"].map(f => `
                        <div class="fragment" style="font-size: 16px; padding: 15px;" onclick="window.v2app.addFragment('${f}')">${f}</div>
                    `).join('')}
                </div>
            `;
        } else {
            obj.innerText = "[OBJECTIVE]: ALIGN HEX-LOGICAL CORES (A&B) OR C";
            title.innerText = '[NEURAL_3D_ROUTING]';
            this.circuitState = { A: false, B: false, C: false };
            this._create3DNeuralFlow();
            content.innerHTML = ''; // Full 3D
        }
    }

    _create3DNeuralFlow() {
        this.commandGroup.clear();
        const hexPos = this.components.grid.getHexPos(this.selectedHexIndex);
        const startX = hexPos.x - 40;
        const startZ = hexPos.z;

        const createNode = (id, x, y, z) => {
            const geo = new THREE.CylinderGeometry(8, 8, 4, 6);
            const mat = new THREE.MeshStandardMaterial({ 
                color: 0xff4400, emissive: 0xff4400, emissiveIntensity: 0.5, transparent: true, opacity: 0.8 
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, y + 20, z);
            mesh.rotation.x = Math.PI/2;
            mesh.userData = { id, type: 'switch', onSelect: () => this.toggleSwitch(id) };
            this.commandGroup.add(mesh);
            return mesh;
        };

        this.nodeA = createNode('A', startX, 40, startZ - 30);
        this.nodeB = createNode('B', startX, 0, startZ - 30);
        this.nodeC = createNode('C', startX, -40, startZ - 30);

        // Core
        const coreGeo = new THREE.IcosahedronGeometry(15, 1);
        const coreMat = new THREE.MeshStandardMaterial({ color: 0x222222, wireframe: true });
        this.neuralCore = new THREE.Mesh(coreGeo, coreMat);
        this.neuralCore.position.set(startX + 80, 0, startZ - 30);
        this.commandGroup.add(this.neuralCore);
    }

    _create3DReactor() {
        this.commandGroup.clear();
        const hexPos = this.components.grid.getHexPos(this.selectedHexIndex);
        this.reactorBars = [];
        for(let i=0; i<5; i++) {
            const geo = new THREE.BoxGeometry(6, 40, 6);
            const mat = new THREE.MeshStandardMaterial({ color: 0xff0044, emissive: 0xff0044, emissiveIntensity: 0.2 });
            const bar = new THREE.Mesh(geo, mat);
            bar.position.set(hexPos.x - 40 + i*20, 20, hexPos.z - 20);
            this.commandGroup.add(bar);
            this.reactorBars.push(bar);
        }
    }

    _create3DSignalNodes() {
        this.commandGroup.clear(); // Placeholder for 3D signal visualization
    }

    addDebugLine(msg) {
        const d = document.getElementById('debug-lines');
        const line = document.createElement('div');
        line.className = 'debug-line active';
        line.innerText = `>> ${msg}`;
        d.appendChild(line);
        setTimeout(() => line.classList.remove('active'), 500);
        d.scrollTop = d.scrollHeight;
    }

    toggleSwitch(id) {
        this.circuitState[id] = !this.circuitState[id];
        const el = document.getElementById(`sw-${id}`);
        el.classList.toggle('active', this.circuitState[id]);
        el.classList.toggle('inactive', !this.circuitState[id]);
        this.updateCircuit();
    }

    updateCircuit() {
        const { A, B, C } = this.circuitState;
        const g1 = A && B;
        const g2 = g1 || C;

        // Update 3D Nodes
        const updateNode = (node, active) => {
            node.material.color.set(active ? 0x00f3ff : 0xff4400);
            node.material.emissive.set(active ? 0x00f3ff : 0xff4400);
            node.material.emissiveIntensity = active ? 1.5 : 0.5;
        };

        if (this.nodeA) updateNode(this.nodeA, A);
        if (this.nodeB) updateNode(this.nodeB, B);
        if (this.nodeC) updateNode(this.nodeC, C);
        
        if (g2 && this.neuralCore) {
            this.neuralCore.material.color.set(0x00f3ff);
            this.neuralCore.material.wireframe = false;
            this.addDebugLine("NEURAL_HEX_STABILIZED: CONDUIT_OPEN");
            setTimeout(() => this.winChallenge(), 1200);
        }
    }

    typeLog(msg) {
        const term = document.getElementById('system-terminal');
        const line = document.createElement('div');
        line.innerHTML = `[${new Date().toLocaleTimeString()}]: ${msg}`;
        term.appendChild(line);
        term.scrollTop = term.scrollHeight;
    }

    triggerGlitch() {
        const overlay = document.getElementById('challenge-overlay');
        overlay.style.animation = 'glitch 0.2s 3';
        setTimeout(() => overlay.style.animation = '', 600);
    }

    // --- REASSEMBLY LOGIC ---
    addFragment(word) {
        this.reassemblyWords.push(word);
        this.addDebugLine(`FRAGMENT_CAPTURED: ${word}`);
        document.getElementById('reassembly-display').innerText = this.reassemblyWords.join(" ");
        if (this.reassemblyWords.length === 5) {
            if (this.reassemblyWords.join(" ") === "INITIATE SECTOR PERSISTENCE SEQUENCE NOW") {
                this.winChallenge();
            } else {
                this.addDebugLine("ERROR: PARSING_FAILED_REINJECTING...");
                this.triggerGlitch();
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
            this.typeLog("WAVE_LOCK_SUCCESSFUL");
            this.winChallenge();
        } else {
            this.typeLog("WAVE_LOCK_FAILED: OUT_OF_SYNC");
            this.triggerGlitch();
        }
    }

    checkAnswer(type) {
        if (type === 'code') {
            const code = document.getElementById('code-input').value;
            const isLoop = code.includes('for') || code.includes('while') || code.includes('forEach');
            if (isLoop && code.includes('bars[i].sync()')) {
                this.addDebugLine("ORCHESTRATING_ULTRA_SYNC...");
                let i = 0;
                const interval = setInterval(() => {
                    if (this.reactorBars[i]) {
                        this.reactorBars[i].material.color.set(0x00f3ff);
                        this.reactorBars[i].material.emissiveIntensity = 2;
                        this.reactorBars[i].scale.y = 1.5;
                    }
                    this.addDebugLine(`CORE_UNIT_0${i+1}:_STABILIZED_100%`);
                    i++;
                    if (i === 5) {
                        clearInterval(interval);
                        setTimeout(() => this.winChallenge(), 600);
                    }
                }, 400);
            } else {
                this.addDebugLine("FATAL_ERROR: CODE_INJECTION_REJECTED");
                this.triggerGlitch();
            }
        }
    }

    winChallenge() {
        clearInterval(this.gameTimer);
        this.typeLog("CONQUEST_CONFIRMED: INITIATING_ORBITAL_STRIKE");
        this.createOrbitalStrike();
        
        if (this.selectedHexIndex !== null) {
            this.components.grid.setTerritoryColor([this.selectedHexIndex], 0x00f3ff);
        }
        setTimeout(() => {
            alert('¡MAESTRÍA DEMOSTRADA! SECTOR ASEGURADO.');
            this.closeChallenge();
        }, 1500);
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

    closeChallenge() {
        const overlay = document.getElementById('challenge-overlay');
        overlay.style.display = 'none';
        this.selectedHexIndex = null;
        clearInterval(this.gameTimer);
        this.typeLog("SYSTEM_SHUTDOWN: TERMINATING_USER_SESSION");
        if (this.particles) {
            this.scene.remove(this.particles);
            this.particles = null;
        }
    }
}
