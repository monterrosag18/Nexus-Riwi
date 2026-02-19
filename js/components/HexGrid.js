import { store } from '../store.js';

// --- MODULE SCOPE VARIABLES ---
let scene, camera, renderer, composer, controls;
let solarGroup, tacticalGroup; // Groups for toggling
let animationId = null;
let planets = [];
let sunMesh, sunGlow, starfield;
let raycaster, mouse; // For interaction
let interactableHexes = []; // Store fill meshes for raycasting

// Clan Colors (Hex)
const COLORS = {
    turing: 0x00f0ff,   // Cyan
    tesla: 0xff2a2a,    // Red
    mccarthy: 0x00ff88, // Green
    neutral: 0x444444   // Grey
};

export default function renderMap() {
    const container = document.createElement('div');
    container.className = 'galactic-wrapper fade-in';
    // Force Full Screen Breakout
    Object.assign(container.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        zIndex: '1' // Behind UI but above background
    });

    container.innerHTML = `
        <!-- VIEW LAYER: 3D CANVAS -->
        <div id="view-3d-scene" style="position: absolute; inset: 0; z-index: 10;">
            <canvas id="solar-canvas"></canvas>
        </div>

        <!-- LAYER 3: UI HUD -->
        <div id="map-ui" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 50;">
            
            <!-- CENTERED HEADER -->
            <div class="map-header-centered" style="position: absolute; top: 40px; left: 50%; transform: translateX(-50%); text-align: center; pointer-events: auto;">
                <div class="nexus-title-glitch" data-text="RIWI NEXUS">RIWI NEXUS</div>
                <div class="nexus-subtitle">SYSTEM: <span class="status-ok">ONLINE</span></div>
            </div>

            <!-- TACTICAL HUD (Always Visible) -->
            <div id="tactical-hud" style="position: absolute; top: 150px; left: 20px; display: block;">
                <!-- Content injected dynamically if needed, currently clean -->
            </div>
        </div>
    `;

    // 2. Initialize
    setTimeout(() => {
        initSolarSystem();
    }, 0);

    return container;
}

// ------------------------------------------------------------------
// 3D ENGINE
// ------------------------------------------------------------------
function initSolarSystem() {
    const canvas = document.getElementById('solar-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    // Raycaster Init (Always On)
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    window.addEventListener('mousemove', onMouseMove, false);

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Black space

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 100, 150); // Higher vantage point for map view

    // 1.5 RENDERER (Restored)
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // renderer.toneMapping = THREE.ReinhardToneMapping; // REMOVED: Was washing out colors

    // 2. BLOOM POST-PROCESSING (Robust Check)
    try {
        if (THREE.EffectComposer && THREE.RenderPass && THREE.UnrealBloomPass) {
            const renderScene = new THREE.RenderPass(scene, camera);
            composer = new THREE.EffectComposer(renderer);
            composer.addPass(renderScene);

            const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
            bloomPass.threshold = 0.1;
            bloomPass.strength = 1.2;
            bloomPass.radius = 0.5;
            composer.addPass(bloomPass);
        } else {
            throw new Error("Post-processing modules missing");
        }
    } catch (e) {
        console.warn("Bloom disabled due to missing dependencies:", e);
        composer = null; // Fallback to standard renderer
    }

    // 3. CONTROLS
    try {
        if (THREE.OrbitControls) {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 20;
            controls.maxDistance = 600;
        } else {
            console.warn("OrbitControls missing - Navigation disabled");
        }
    } catch (e) {
        console.error("Controls error:", e);
    }

    // 4. LIGHTS
    const ambientLight = new THREE.AmbientLight(0x444444);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 2.0); // Brighter key light
    scene.add(pointLight);

    // Texture Loader
    const loader = new THREE.TextureLoader();
    const basePath = './assets/textures/';

    // 5. BACKGROUND STARS (Restored High-Res Texture)
    createTextureStarfield();

    // 6. BUILD LAYERS
    solarGroup = new THREE.Group();
    tacticalGroup = new THREE.Group();

    scene.add(solarGroup);
    scene.add(tacticalGroup);

    // INITIAL BUILD - Only Sun and Grid, No Planets
    buildTacticalGrid();

    // Force Visible
    tacticalGroup.visible = true;
    solarGroup.visible = true;

    // --- SUN Only ---
    const sunGeo = new THREE.SphereGeometry(15, 64, 64); // Larger Sun for central dominance
    const sunMat = new THREE.MeshBasicMaterial({ // Back to Basic for pure emission
        map: loader.load(basePath + '8k_sun.jpg'),
        color: 0xffaa00 // Tint
    });
    sunMesh = new THREE.Mesh(sunGeo, sunMat);
    solarGroup.add(sunMesh); // Add to solarGroup

    // Sun Lensflare (Improved)
    const flareMat = new THREE.SpriteMaterial({
        map: loader.load(basePath + 'lensflare0.png'),
        color: 0xffaa00,
        transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending
    });
    sunGlow = new THREE.Sprite(flareMat);
    sunGlow.scale.set(100, 100, 1); // Bigger glow
    sunMesh.add(sunGlow);

    // --- ANIM LOOP ---
    const clock = new THREE.Clock();

    function animate() {
        if (!document.getElementById('solar-canvas')) return;

        // Sun Rotation
        if (sunMesh) sunMesh.rotation.y += 0.002;

        // Interaction (Hover)
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactableHexes);

        // Reset
        interactableHexes.forEach(hex => {
            hex.material.opacity = 0.1;
            hex.material.emissiveIntensity = 0;
            hex.scale.set(1, 1, 1);
        });

        // Highlight
        if (intersects.length > 0) {
            const hit = intersects[0].object;
            hit.material.opacity = 0.6;
            hit.scale.set(1.1, 1.1, 1.1);
        }

        if (controls) controls.update();

        // Render Logic (Fallback if Composer fails)
        if (composer) {
            composer.render();
        } else {
            renderer.render(scene, camera);
        }

        animationId = requestAnimationFrame(animate);
    }
    animate();

    // Resize
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (composer) composer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    // Normalize mouse coords (-1 to +1)
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

// ------------------------------------------------------------------
// MISSING FUNCTIONS RESTORED
// ------------------------------------------------------------------

function createTextureStarfield() {
    const loader = new THREE.TextureLoader();
    const starsGeo = new THREE.SphereGeometry(4000, 64, 64);
    const starsMat = new THREE.MeshBasicMaterial({
        map: loader.load('./assets/textures/8k_stars.jpg'),
        side: THREE.BackSide
    });
    starfield = new THREE.Mesh(starsGeo, starsMat);
    scene.add(starfield);
}

// ------------------------------------------------------------------
// REVISED TACTICAL GRID BUILDER
// ------------------------------------------------------------------
function buildTacticalGrid() {
    interactableHexes = []; // Reset interaction array

    // 1. Generate Hex Grid (Larger Scale)
    const hexRadius = 8; // Increased from 4
    const hexWidth = Math.sqrt(3) * hexRadius;
    const hexHeight = 2 * hexRadius;

    // Clan Standards (Shifted for larger map)
    createClanStandard('turing', new THREE.Vector3(-60, 0, -40), COLORS.turing);
    createClanStandard('tesla', new THREE.Vector3(60, 0, -40), COLORS.tesla);
    createClanStandard('mccarthy', new THREE.Vector3(0, 0, 70), COLORS.mccarthy);

    // Procedural Hexes
    const ringSize = 7; // Increased from 4
    for (let q = -ringSize; q <= ringSize; q++) {
        for (let r = -ringSize; r <= ringSize; r++) {
            if (Math.abs(q + r) <= ringSize) {
                const x = hexWidth * (q + r / 2);
                const z = hexHeight * (3 / 4) * r;

                // Exclude larger center zone for Sun safety
                if (Math.sqrt(x * x + z * z) < 20) continue;

                // Determine Owner
                let color = COLORS.neutral;
                if (x < -20 && z < 0) color = COLORS.turing;
                else if (x > 20 && z < 0) color = COLORS.tesla;
                else if (z > 20) color = COLORS.mccarthy;

                createHexagon(x, z, hexRadius * 0.95, color);
            }
        }
    }
}

function createHexagon(x, z, r, color) {
    // 1. Line Loop (The glowing border)
    const points = [];
    for (let i = 0; i <= 6; i++) {
        const angle = (i * Math.PI) / 3;
        points.push(new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: color, linewidth: 2 });
    const hex = new THREE.LineLoop(geometry, material);
    hex.position.set(x, 0, z);

    // 2. Interactable Fill (The clickable area)
    const fillGeo = new THREE.CylinderGeometry(r * 0.9, r * 0.9, 0.5, 6); // Cylinder for volume
    const fillMat = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.1,
        emissive: color,
        emissiveIntensity: 0
    });
    const fill = new THREE.Mesh(fillGeo, fillMat);
    fill.position.set(x, 0, z);

    // Store for raycaster
    interactableHexes.push(fill);

    tacticalGroup.add(hex);
    tacticalGroup.add(fill);
}

function createClanStandard(name, pos, color) {
    const group = new THREE.Group();
    group.position.copy(pos);

    // Base Ring
    const ringGeo = new THREE.RingGeometry(6, 7, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    // Pillar (Hologram Source)
    const pillarGeo = new THREE.CylinderGeometry(0.5, 2, 8, 8);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.2 });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.y = 4;
    group.add(pillar);

    // Hologram Icon (Spinning Shape)
    let iconGeo;
    if (name === 'turing') iconGeo = new THREE.IcosahedronGeometry(3, 0); // Tech Ball
    if (name === 'tesla') iconGeo = new THREE.OctahedronGeometry(3, 0); // Energy Crystal
    if (name === 'mccarthy') iconGeo = new THREE.BoxGeometry(4, 4, 4);  // Logic Cube

    const iconMat = new THREE.MeshBasicMaterial({ color: color, wireframe: true });
    const icon = new THREE.Mesh(iconGeo, iconMat);
    icon.position.y = 10;
    icon.userData = { spin: true };
    group.add(icon);

    // Light
    const light = new THREE.PointLight(color, 2, 20);
    light.position.y = 5;
    group.add(light);

    tacticalGroup.add(group);
}
