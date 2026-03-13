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
    const countdown = createWeeklyCountdown();
    countdown.style.cssText = 'position:absolute;top:15px;left:85px;pointer-events:auto;z-index:60;';
    container.querySelector('#map-ui').appendChild(countdown);

    // 1c. Inject News Ticker (bottom, offset past sidebar)
    const ticker = createNewsTicker();
    container.querySelector('#map-ui').appendChild(ticker);

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
        // A. REBUILD GRID IF FIRST LOAD (Data arrived after init)
        const hasClansLoaded = state.clans && Object.keys(state.clans).length > 0;
        if (hasClansLoaded && clanBanners.length === 0) {
            console.log("[HexGrid] Data detected - Building Tactical Grid...");
            buildTacticalGrid();
            return;
        }

        // B. Update existing hexes
        if (state.territories && interactableHexes.length > 0) {
            state.territories.forEach(t => {
                const mesh = interactableHexes.find(m => m.userData.id === t.id);
                if (mesh) {
                    const newOwner = (t.owner || 'neutral').toLowerCase();
                    if ((mesh.userData.owner || '').toLowerCase() !== newOwner) {
                        console.log(`[RealtimeMap] Updating Hex ${t.id} -> ${newOwner}`);
                        
                        // Update Data
                        mesh.userData.owner = newOwner;
                        mesh.userData.isTerritory = newOwner !== 'neutral';
                        
                        // Update Visuals
                        const clanData = state.clans[newOwner];
                        const color = clanData ? clanData.color : 0x666666;
                        
                        mesh.material.color.set(color);
                        mesh.material.emissive.set(color);
                        mesh.material.emissiveIntensity = (newOwner !== 'neutral') ? 0.4 : 0;
                        mesh.material.opacity = (newOwner !== 'neutral') ? 0.3 : 0.12;
                        
                        const line = mesh.parent.children.find(c => c.type === 'LineLoop' && c.position.distanceToSquared(mesh.position) < 0.1);
                        if (line) {
                            line.material = line.material.clone();
                            line.material.color.set(color);
                            line.material.linewidth = (newOwner !== 'neutral') ? 3 : 1;
                            line.material.opacity = (newOwner !== 'neutral') ? 1.0 : 0.6;
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

        // User State
        const userState = store.getState().currentUser;
        if (!userState || !userState.clan) return;

        const clanId = userState.clan.toLowerCase();
        const targetOwner = hexData.owner ? hexData.owner.toLowerCase() : null;

        // BLOCK CLICKS ON OWNED TERRITORY
        if (targetOwner === clanId) {
            const feedback = document.createElement('div');
            feedback.style.cssText = `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                color: #00ff44; font-family: 'Share Tech Mono', monospace;
                font-size: 1.5rem; text-shadow: 0 0 10px #00ff44;
                background: rgba(0,0,0,0.8); padding: 10px 20px; border: 2px solid #00ff44;
                z-index: 9999; pointer-events: none; animation: nexus-fade-out 2s forwards;
            `;
            feedback.textContent = "✔ SECTOR SECURED: CONNECTION ESTABLISHED";
            document.body.appendChild(feedback);
            setTimeout(() => feedback.remove(), 2000);
            return;
        }

        console.log(`Initiating breach sequence for Territory #${hexData.id} (Owner: ${targetOwner || 'NEUTRAL'})`);

        // ADJACENCY RULE
        let isAdjacent = false;
        const clickPos = hit.position;
        const hexRadiusValue = 8;
        const maxAdjacencyDist = hexRadiusValue * 2.5;

        for (let i = 0; i < interactableHexes.length; i++) {
            const h = interactableHexes[i];
            const hOwner = h.userData.owner ? h.userData.owner.toLowerCase() : null;
            if (hOwner === clanId) {
                const dist = Math.sqrt((clickPos.x - h.position.x) ** 2 + (clickPos.z - h.position.z) ** 2);
                if (dist < maxAdjacencyDist) {
                    isAdjacent = true;
                    break;
                }
            }
        }

        // Everyone starts somewhere
        const totalOwnedByMe = interactableHexes.filter(h => (h.userData.owner || '').toLowerCase() === clanId).length;
        if (totalOwnedByMe === 0) isAdjacent = true;

        if (!isAdjacent) {
            const feedback = document.createElement('div');
            feedback.style.cssText = `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                color: #ff3b5c; font-family: 'Share Tech Mono', monospace;
                font-size: 1.5rem; text-shadow: 0 0 10px #ff3b5c;
                background: rgba(0,0,0,0.8); padding: 10px 20px; border: 2px solid #ff3b5c;
                z-index: 9999; pointer-events: none; animation: nexus-fade-out 2s forwards;
            `;
            feedback.textContent = "⚠ CONNECTION FAILED: SECTOR OUT OF RANGE";
            document.body.appendChild(feedback);
            setTimeout(() => feedback.remove(), 2000);
            return;
        }

        hit.material.emissiveIntensity = 1.0;
        hit.userData.isUnderAttack = true;

        const modal = await createQuestionModal(hexData, hit);
        document.body.appendChild(modal);
    }
}

function buildTacticalGrid() {
    interactableHexes = [];
    clanBanners = [];

    while (tacticalGroup.children.length > 0) {
        tacticalGroup.remove(tacticalGroup.children[0]);
    }

    const state = store.getState();
    const territories = state.territories;
    const clans = state.clans;

    if (!clans) return;

    const hexRadius = 8;
    const hexWidth = Math.sqrt(3) * hexRadius;
    const hexHeight = 2 * hexRadius;

    const clanIds = Object.keys(clans);
    const totalClans = clanIds.length;
    const mapRadius = Math.max(90, totalClans * 20);

    const bannerDistributions = {};

    clanIds.forEach((id, index) => {
        const angle = (360 / totalClans) * index;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * mapRadius;
        const z = Math.sin(rad) * mapRadius;
        const pos = new THREE.Vector3(x, 0, z);

        const clanData = clans[id];
        const icon = clanData.icon || '\uf544';

        createClanStandard(clanData.name, pos, clanData.color, icon);
        bannerDistributions[id] = { vec: pos, color: clanData.color };

        const currentUser = state.currentUser;
        if (currentUser && currentUser.clan === id) {
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
        }
    });

    // FIXED GRID SIZE for Deterministic Mapping (Ensures Sectors are always in same spot)
    const ringSize = 12;
    const allHexes = [];

    for (let q = -ringSize; q <= ringSize; q++) {
        for (let r = -ringSize; r <= ringSize; r++) {
            if (Math.abs(q + r) <= ringSize) {
                const x = hexWidth * (q + r / 2);
                const z = hexHeight * (3 / 4) * r;
                // Leave a void for the tower
                if (Math.sqrt(x * x + z * z) < 25) continue;
                allHexes.push({ x, z, owner: null, color: COLORS.neutral });
            }
        }
    }

    allHexes.forEach((hex, i) => {
        const dbTerritory = territories.find(t => parseInt(t.id) === i);
        let currentOwner = null;
        let isVisuallyTinted = false;
        
        if (dbTerritory && dbTerritory.owner && dbTerritory.owner !== 'neutral') {
            currentOwner = dbTerritory.owner.toLowerCase();
            const clanData = clans[currentOwner];
            hex.color = clanData ? clanData.color : COLORS.neutral;
        } else {
            // INITIAL VISUAL TINT LOGIC
            const distances = [];
            clanIds.forEach(cid => {
                const banner = bannerDistributions[cid];
                const d = Math.sqrt((hex.x - banner.vec.x) ** 2 + (hex.z - banner.vec.z) ** 2);
                distances.push({ id: cid, d });
            });
            distances.sort((a, b) => a.d - b.d);
            
            const closest = distances[0];
            if (closest.d < hexRadius * 2.8) {
                const clanData = clans[closest.id];
                hex.color = clanData ? clanData.color : COLORS.neutral;
                isVisuallyTinted = true;
            }
        }

        const distFromCenter = Math.sqrt(hex.x * hex.x + hex.z * hex.z);
        if (!currentOwner && !isVisuallyTinted && distFromCenter > mapRadius * 1.1) return;

        const isTerritory = currentOwner !== null;
        const type = dbTerritory ? dbTerritory.type : 'code';
        const difficulty = dbTerritory ? dbTerritory.difficulty : 1;

        // INCREASED VISIBILITY: 
        // - Neutral/Tinted opacity: 0.25 (up from 0.12)
        // - Owned opacity: 0.5 (up from 0.3)
        // - Emissive for Tinted: 0.2
        const visualOpacity = isTerritory ? 0.5 : (isVisuallyTinted ? 0.25 : 0.12);
        const emissiveIntensity = isTerritory ? 0.4 : (isVisuallyTinted ? 0.2 : 0);

        createHexagon(hex.x, hex.z, hexRadius * 0.95, hex.color, isTerritory, currentOwner, i, type, difficulty, visualOpacity, emissiveIntensity);
    });
}

function createHexagon(x, z, r, color, isTerritory, ownerId, id, type, difficulty, opacity, eIntensity) {
    const points = [];
    for (let i = 0; i <= 6; i++) {
        const angle = (i * Math.PI) / 3;
        points.push(new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({
        color: color,
        linewidth: isTerritory ? 3 : 1,
        transparent: true,
        opacity: isTerritory ? 1.0 : 0.6
    });
    const hex = new THREE.LineLoop(geometry, lineMat);
    hex.position.set(x, 0, z);

    const fillGeo = new THREE.CylinderGeometry(r * 0.9, r * 0.9, 0.5, 6);
    const fillMat = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        emissive: color,
        emissiveIntensity: eIntensity
    });
    const fill = new THREE.Mesh(fillGeo, fillMat);
    fill.position.set(x, 0, z);

    fill.userData = { id, type, difficulty, isTerritory, owner: ownerId, baseColor: color };
    interactableHexes.push(fill);
    tacticalGroup.add(hex);
    tacticalGroup.add(fill);
}

function createClanStandard(name, pos, color, icon) {
    const banner = new HoloBanner(scene, pos, color, name, icon);
    if (banner.mesh) banner.mesh.lookAt(0, 0, 0);
    clanBanners.push(banner);
}

export function executeConquest(hexData, hitMesh, winningClan) {
    const clanColors = {
        'turing': 0x00c3ff,
        'tesla': 0xff0000,
        'mccarthy': 0x00ff44,
        'lovelace': 0xaa00ff,
        'neumann': 0xff6600,
        'thompson': 0x9B51E0,
        'halmiton': 0xF2C94C
    };

    const newColorHex = clanColors[winningClan.toLowerCase()] || 0x00f0ff;
    hitMesh.material = hitMesh.material.clone();
    hitMesh.material.color.setHex(newColorHex);
    hitMesh.material.emissive.setHex(newColorHex);
    hitMesh.material.opacity = 0.3;
    hitMesh.material.emissiveIntensity = 0.4;

    hitMesh.parent.children.forEach(child => {
        if (child.type === 'LineLoop' && child.position.distanceToSquared(hitMesh.position) < 0.1) {
            child.material = child.material.clone();
            child.material.color.setHex(newColorHex);
            child.material.opacity = 1.0;
            child.material.linewidth = 3;
        }
    });

    hitMesh.userData.isTerritory = true;
    hitMesh.userData.owner = winningClan;
    hitMesh.userData.baseColor = newColorHex;

    if (window.gsap) {
        gsap.fromTo(hitMesh.scale,
            { x: 1, y: 1, z: 1 },
            { x: 1.5, y: 1.5, z: 1.5, duration: 0.3, yoyo: true, repeat: 1, ease: "power2.out" }
        );
    }
}
