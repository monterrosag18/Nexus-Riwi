import { store } from '../store.js';
import { GalaxyBackground } from './GalaxyBackground.js';
import { HoloBanner } from '../utils/HoloBanner.js';
import createQuestionModal from './QuestionModal.js';
import renderMiniLeaderboard from './MiniLeaderboard.js';
import createNewsTicker from './NewsTicker.js';
import createWeeklyCountdown from './WeeklyCountdown.js';

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
                <div class="nexus-title-glitch" data-text="</riwi> NEXUS" style="text-transform: lowercase;">&lt;/riwi&gt; <span style="text-transform: uppercase;">NEXUS</span></div>
                <div class="nexus-subtitle">SYSTEM: <span class="status-ok">ONLINE</span></div>
            </div>

            <!-- TACTICAL HUD (Always Visible) -->
            <div id="tactical-hud" style="position: absolute; top: 15px; right: 15px; display: block; pointer-events: auto;">
                <!-- HUD INJECTED DYNAMICALLY -->
            </div>
        </div>
    `;

    // 1. Inject Mini Leaderboard
    const hud = container.querySelector('#tactical-hud');
    hud.appendChild(renderMiniLeaderboard());

    // 1b. Inject Weekly Countdown (top-left, offset past sidebar)
    const mapUI = container.querySelector('#map-ui');
    const countdown = createWeeklyCountdown();
    countdown.style.cssText = 'position:absolute;top:15px;left:85px;pointer-events:auto;z-index:60;';
    mapUI.appendChild(countdown);

    // 1c. Inject News Ticker (bottom, offset past sidebar)
    const ticker = createNewsTicker();
    mapUI.appendChild(ticker);

    // 2. Initialize 3D Engine
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
    window.addEventListener('click', onMouseClick, false);

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

    // BUILD GRID (Defensive call)
    try {
        buildTacticalGrid();
    } catch (e) {
        console.warn("Initial grid build skipped:", e);
    }

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

    // 6. REALTIME REACTION
    store.subscribe((state) => {
        // We only care if territories changed. 
        // We can optimize this by checking last update timestamp if we had it,
        // but for now, we'll sync the colors of all hexes to match the state.
        if (state.territories && interactableHexes.length > 0) {
            state.territories.forEach(t => {
                const mesh = interactableHexes.find(m => m.userData.id === t.id);
                if (mesh) {
                    const newOwner = t.owner;
                    if (mesh.userData.owner !== newOwner) {
                        console.log(`[RealtimeMap] Updating Hex ${t.id} -> ${newOwner}`);
                        
                        // Update Data
                        mesh.userData.owner = newOwner;
                        mesh.userData.isTerritory = newOwner !== 'neutral';
                        
                        // Update Visuals
                        const clanData = state.clans[newOwner];
                        const color = clanData ? clanData.color : 0x666666; // Neutral color
                        
                        mesh.material.color.set(color);
                        mesh.material.emissive.set(color);
                        mesh.material.emissiveIntensity = (newOwner !== 'neutral') ? 0.4 : 0;
                        mesh.material.opacity = (newOwner !== 'neutral') ? 0.3 : 0.12;
                        
                        // Also update the line loop (sibling)
                        const line = mesh.parent.children.find(c => c instanceof THREE.LineLoop && c.position.equals(mesh.position));
                        if (line) {
                            line.material.color.set(color);
                            line.material.linewidth = (newOwner !== 'neutral') ? 3 : 1;
                            line.material.opacity = (newOwner !== 'neutral') ? 1.0 : 0.4;
                        }
                    }
                }
            });
        }
    });

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

async function onMouseClick(event) {
    if (!camera || !scene) return;

    // Prevent clicking through other UI elements
    if (event.target.tagName !== 'CANVAS') return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableHexes);

    if (intersects.length > 0) {
        const hit = intersects[0].object;
        const hexData = hit.userData;

        // Let's do a simple check. If it's your own territory, do nothing.
        const userState = store.getState().currentUser;
        if (!userState || !userState.clan) return;

        const clanId = userState.clan.toUpperCase();
        const targetOwner = hexData.owner ? hexData.owner.toUpperCase() : null;

        if (targetOwner === clanId) {
            console.log("Already owned by your clan.");
            return;
        }

        console.log(`Initiating breach sequence for Territory #${hexData.id} (Owner: ${targetOwner || 'NEUTRAL'})`);

        // ADJACENCY RULE - Relaxed for playability, or at least better feedback
        let isAdjacent = false;
        const clickPos = hit.position;
        const hexRadiusValue = 8;
        const maxAdjacencyDist = hexRadiusValue * 2.5; // Slightly more generous buffer

        // Find if this specific click is adjacent to ANY user territory
        for (let i = 0; i < interactableHexes.length; i++) {
            const h = interactableHexes[i];
            const hOwner = h.userData.owner ? h.userData.owner.toUpperCase() : null;
            if (hOwner === clanId) {
                const dist = Math.sqrt((clickPos.x - h.position.x) ** 2 + (clickPos.z - h.position.z) ** 2);
                if (dist < maxAdjacencyDist) {
                    isAdjacent = true;
                    break;
                }
            }
        }

        // Check if map is empty (everyone starts somewhere)
        const totalOwnedByMe = interactableHexes.filter(h => (h.userData.owner || '').toUpperCase() === clanId).length;
        if (totalOwnedByMe === 0) isAdjacent = true;

        if (!isAdjacent && targetOwner !== null) {
            console.warn("OUT OF RANGE! Connection unstable.");
            // We allow the click but maybe show a warning in HUD? 
            // For now, let's just trigger the modal anyway to let them "see" the system
        }

        // Trigger visual "Under Attack"
        hit.material.emissiveIntensity = 1.0;
        hit.userData.isUnderAttack = true;

        // Launch the Question Modal
        const modal = await createQuestionModal(hexData, hit);
        document.body.appendChild(modal);
    }
}

// ------------------------------------------------------------------
// REVISED TACTICAL GRID BUILDER
// ------------------------------------------------------------------
function buildTacticalGrid() {
    interactableHexes = [];
    clanBanners = [];

    while (tacticalGroup.children.length > 0) {
        tacticalGroup.remove(tacticalGroup.children[0]);
    }

    const state = store.getState();
    const territories = state.territories;
    const clans = state.clans;

    // Defensive check: If no data, just show the background/empty scene
    if (!territories || territories.length === 0 || !clans) {
        console.warn("No Map Data Available. Showing Empty Sector.");
        return;
    }

    // 1. Grid Parameters
    const hexRadius = 8;
    const hexWidth = Math.sqrt(3) * hexRadius;
    const hexHeight = 2 * hexRadius;

    // 2. DEFINE CLANS & POSITIONS (Radial Layout)
    const clanIds = Object.keys(clans);
    const totalClans = clanIds.length;

    // Scale map radius based on number of clans so it doesn't get crowded
    const mapRadius = Math.max(90, totalClans * 20);

    // Create Banners in a perfect circle
    const bannerDistributions = {}; // Map clanId to its orbital center

    clanIds.forEach((id, index) => {
        const angle = (360 / totalClans) * index;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * mapRadius;
        const z = Math.sin(rad) * mapRadius;
        const pos = new THREE.Vector3(x, 0, z);

        const clanData = clans[id];
        // Ensure icon exists, fallback if not
        const icon = clanData.icon || '\uf544';

        createClanStandard(clanData.name, pos, clanData.color, icon);
        bannerDistributions[id] = { vec: pos, color: clanData.color, assigned: 0 };

        // Add pulsing ground light for the user's own clan
        const currentUser = state.currentUser;
        if (currentUser && currentUser.clan === id) {
            // Outer pulsing ring
            const ringGeo = new THREE.RingGeometry(12, 16, 64);
            const ringMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(clanData.color),
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            ring.position.set(x, 0.5, z);
            tacticalGroup.add(ring);

            // Inner glow disk
            const diskGeo = new THREE.CircleGeometry(12, 64);
            const diskMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(clanData.color),
                transparent: true,
                opacity: 0.08,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });
            const disk = new THREE.Mesh(diskGeo, diskMat);
            disk.rotation.x = -Math.PI / 2;
            disk.position.set(x, 0.3, z);
            tacticalGroup.add(disk);

            // Point light for the user's clan
            const clanLight = new THREE.PointLight(new THREE.Color(clanData.color), 3, 60);
            clanLight.position.set(x, 8, z);
            scene.add(clanLight);

            // Store for animation
            ring.userData.pulseRing = true;
            ring.userData.baseMat = ringMat;
        }
    });

    // 3. GENERATE HEXAGONS
    // We will generate a hexagonal grid map large enough to cover the banners
    const ringSize = Math.ceil(mapRadius / hexWidth) + 3;
    const allHexes = [];

    // Step A: Collect all valid grid coordinates
    for (let q = -ringSize; q <= ringSize; q++) {
        for (let r = -ringSize; r <= ringSize; r++) {
            if (Math.abs(q + r) <= ringSize) {
                const x = hexWidth * (q + r / 2);
                const z = hexHeight * (3 / 4) * r;

                // Center Exclusion (Tower Safety)
                if (Math.sqrt(x * x + z * z) < 25) continue;

                allHexes.push({ x, z, owner: null, color: COLORS.neutral });
            }
        }
    }

    // Step B: mathematically assign default owners ONLY for hexes that are neutral in the DB
    // This maintains the "Initial Cluster" while allowing the rest of the map to be dynamic
    Object.keys(bannerDistributions).forEach(clanId => {
        const banner = bannerDistributions[clanId];

        // Find neighbors for this banner
        const availableHexes = allHexes.filter(h => h.owner === null);
        availableHexes.sort((a, b) => {
            const distA = Math.sqrt((a.x - banner.vec.x) ** 2 + (a.z - banner.vec.z) ** 2);
            const distB = Math.sqrt((b.x - banner.vec.x) ** 2 + (b.z - banner.vec.z) ** 2);
            return distA - distB;
        });

        // Claim the 5 closest ONLY if they aren't already owned by someone else in the DB
        const closest5 = availableHexes.slice(0, 5);
        closest5.forEach(hex => {
            hex.owner = clanId;
            const clanData = clans[clanId];
            hex.color = clanData ? clanData.color : COLORS.neutral;
        });
    });

    // Step C: Sync with DB Territories
    allHexes.forEach((hex, i) => {
        const dbTerritory = territories.find(t => parseInt(t.id) === i);
        if (dbTerritory && dbTerritory.owner && dbTerritory.owner !== 'neutral') {
            hex.owner = dbTerritory.owner;
            // Robust color lookup
            const ownerId = hex.owner.toLowerCase().replace(/\s+/g, '');
            const clanData = clans[ownerId] || clans[hex.owner];
            hex.color = clanData ? clanData.color : COLORS.neutral;
        } else if (dbTerritory) {
            console.warn(`[HexGrid] DB Territory ${i} found but has no valid owner or is neutral:`, dbTerritory);
        }

        // Strip out excess neutral hexes that are too far into deep space
        if (hex.owner === null) {
            const distFromCenter = Math.sqrt(hex.x * hex.x + hex.z * hex.z);
            if (distFromCenter > mapRadius * 1.1) return;
        }

        const isTerritory = hex.owner !== null;
        const type = dbTerritory ? dbTerritory.type : hex.type || 'code';
        const difficulty = dbTerritory ? dbTerritory.difficulty : hex.difficulty || 1;

        createHexagon(hex.x, hex.z, hexRadius * 0.95, hex.color, isTerritory, hex.owner, i, type, difficulty);
    });
}

function createHexagon(x, z, r, color, isTerritory, ownerId, id, type, difficulty) {
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

    // Bind metadata for Raycaster and logic
    fill.userData = {
        id: id,
        type: type,
        difficulty: difficulty,
        isTerritory: isTerritory,
        owner: ownerId,
        baseColor: color,
        isUnderAttack: false
    };

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
