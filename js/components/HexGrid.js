import { store } from '../store.js';
import { GalaxyBackground } from './GalaxyBackground.js';
import { HoloBanner } from '../utils/HoloBanner.js';

// --- MODULE SCOPE VARIABLES ---
let scene, camera, renderer, composer, controls;
let galaxy; // New Background Controller
let tacticalGroup; // Group for the Grid
let animationId = null;
let raycaster, mouse; // For interaction
let interactableHexes = []; // Store fill meshes for raycasting
let clanBanners = []; // Store banners for animation

// Clan Colors (Hex) - Tuned for Hologram Contrast (Darker = More Color in Additive)
const COLORS = {
    turing: 0x00c3ff,   // Deep Cyan
    tesla: 0xff0000,    // Pure Red
    mccarthy: 0x00ff44, // Matrix Green
    lovelace: 0xaa00ff, // Deep Violet (Was too white)
    neumann: 0xff6600,  // Safety Orange (Was too yellow/white)
    neutral: 0x666666   // Medium Grey (Much brighter for visibility)
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

    // 4. LIGHTS (Scene Global Lights)
    const ambientLight = new THREE.AmbientLight(0x444444);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 2.0); // Brighter key light
    scene.add(pointLight);

    // 5. BUILD LAYERS

    // --> Layer A: Background (Stars & Sun) - Separated!
    galaxy = new GalaxyBackground(scene);

    // --> Layer B: Tactical Grid
    tacticalGroup = new THREE.Group();
    scene.add(tacticalGroup);

    // BUILD GRID
    buildTacticalGrid();

    // Force Visible
    tacticalGroup.visible = true;

    // --- ANIM LOOP ---
    const clock = new THREE.Clock();

    function animate() {
        if (!document.getElementById('solar-canvas')) return;

        // Update Background (Sun rotation, etc)
        if (galaxy) galaxy.update();

        // Update Holo Banners
        if (clanBanners && clanBanners.length > 0) {
            clanBanners.forEach(banner => banner.update(clock.getElapsedTime()));
        }

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
// REVISED TACTICAL GRID BUILDER
// ------------------------------------------------------------------
function buildTacticalGrid() {
    interactableHexes = []; // Reset interaction array
    clanBanners = [];       // Reset banners (Important!)

    // Clear previous items if any (though logic usually rebuilds scene, let's be safe)
    // In a full app we'd clear tacticalGroup.children. Here we assume clean start or reload.
    while (tacticalGroup.children.length > 0) {
        tacticalGroup.remove(tacticalGroup.children[0]);
    }

    // 1. Grid Parameters
    const hexRadius = 8;
    const hexWidth = Math.sqrt(3) * hexRadius;
    const hexHeight = 2 * hexRadius;

    // 2. DEFINE CLANS & POSITIONS (Pentagon Layout)
    // Radius of the circle where banners sit - Pushed to extreme corners
    const mapRadius = 105;
    const clans = [
        { id: 'TURING', color: COLORS.turing, angle: 0, icon: '\uf2db' }, // Microchip
        { id: 'MCCARTHY', color: COLORS.mccarthy, angle: 72, icon: '\uf544' }, // Robot
        { id: 'LOVELACE', color: COLORS.lovelace, angle: 144, icon: '\uf121' }, // Code
        { id: 'TESLA', color: COLORS.tesla, angle: 216, icon: '\uf0e7' }, // Bolt
        { id: 'NEUMANN', color: COLORS.neumann, angle: 288, icon: '\uf0c3' }  // Flask (Science)
    ];

    // Create Banners
    const bannerPositions = []; // Store to check hex proximity later

    clans.forEach(clan => {
        // Convert Polar to Cartesian
        const rad = (clan.angle * Math.PI) / 180;
        const x = Math.cos(rad) * mapRadius;
        const z = Math.sin(rad) * mapRadius;
        const pos = new THREE.Vector3(x, 0, z);

        createClanStandard(clan.id, pos, clan.color, clan.icon);
        bannerPositions.push({ vec: pos, color: clan.color });
    });

    // 3. GENERATE HEXAGONS
    const ringSize = 11; // Expanded map size to ensure ground under corners
    for (let q = -ringSize; q <= ringSize; q++) {
        for (let r = -ringSize; r <= ringSize; r++) {
            if (Math.abs(q + r) <= ringSize) {
                const x = hexWidth * (q + r / 2);
                const z = hexHeight * (3 / 4) * r;

                // Center Exclusion (Sun Safety)
                if (Math.sqrt(x * x + z * z) < 25) continue;

                // COLOR LOGIC: Check distance to any banner
                let hexColor = COLORS.neutral;
                let isTerritory = false;

                for (let i = 0; i < bannerPositions.length; i++) {
                    const bannerPos = bannerPositions[i].vec;
                    const dist = Math.sqrt((x - bannerPos.x) ** 2 + (z - bannerPos.z) ** 2);

                    // Territory Radius: Tightened to < 18 to capture ~3 hexes (Center + 2 neighbors)
                    if (dist < 18) {
                        hexColor = bannerPositions[i].color;
                        isTerritory = true;
                        break; // Found owner
                    }
                }

                // Create Hex
                createHexagon(x, z, hexRadius * 0.95, hexColor, isTerritory);
            }
        }
    }
}

function createHexagon(x, z, r, color, isTerritory) {
    // 1. Line Loop (The glowing border)
    const points = [];
    for (let i = 0; i <= 6; i++) {
        const angle = (i * Math.PI) / 3;
        points.push(new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Territory lines are thicker/brighter
    const lineMat = new THREE.LineBasicMaterial({
        color: color,
        linewidth: isTerritory ? 3 : 1,
        transparent: true,
        opacity: isTerritory ? 1.0 : 0.4 // Slightly brighter lines (was 0.3)
    });
    const hex = new THREE.LineLoop(geometry, lineMat);
    hex.position.set(x, 0, z);

    // 2. Interactable Fill
    // Territory hexes have a slight glow fill
    const fillGeo = new THREE.CylinderGeometry(r * 0.9, r * 0.9, 0.5, 6);
    const fillMat = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: isTerritory ? 0.3 : 0.12, // More visible neutral fill (was 0.05)
        emissive: color,
        emissiveIntensity: isTerritory ? 0.4 : 0
    });
    const fill = new THREE.Mesh(fillGeo, fillMat);
    fill.position.set(x, 0, z);

    // Store for raycaster
    interactableHexes.push(fill);

    tacticalGroup.add(hex);
    tacticalGroup.add(fill);
}

function createClanStandard(name, pos, color, icon) {
    // NEW IMPLEMENTATION: Use HoloBanner Class
    const banner = new HoloBanner(scene, pos, color, name, icon);

    // Rotate banners to face center (0,0,0) roughly
    if (banner.mesh) {
        banner.mesh.lookAt(0, 0, 0);
    }

    clanBanners.push(banner);
}
