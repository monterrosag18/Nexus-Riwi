import { store } from '../store.js';
import createChallengeModal from './ChallengeModal.js';

export default function renderMap() {
    const container = document.createElement('div');
    container.className = 'view-content fade-in';

    // Header (Enhanced HUD)
    const header = document.createElement('div');
    header.className = 'map-header enhanced-hud';
    header.innerHTML = `
        <div class="hud-left">
            <h2 class="text-neon-blue">NEXUS MAP</h2>
            <div class="hud-status"><i class="fa-solid fa-satellite-dish"></i> LIVE FEED</div>
        </div>
        <div class="hud-stats">
            <div class="stat-badge turing">
                <i class="fa-solid fa-microchip"></i> 
                <span class="badget-label">TURING</span>
                <span class="badge-value">${store.state.clans.turing.points} XP</span>
            </div>
            <div class="stat-badge tesla">
                <i class="fa-solid fa-bolt"></i> 
                <span class="badget-label">TESLA</span>
                <span class="badge-value">${store.state.clans.tesla.points} XP</span>
            </div>
            <div class="stat-badge mccarthy">
                <i class="fa-solid fa-brain"></i> 
                <span class="badget-label">MCCARTHY</span>
                <span class="badge-value">${store.state.clans.mccarthy.points} XP</span>
            </div>
        </div>
    `;
    container.appendChild(header);

    // Grid Container
    const perspectiveWrapper = document.createElement('div');
    perspectiveWrapper.className = 'hex-perspective-wrapper';

    const gridContainer = document.createElement('div');
    gridContainer.className = 'hex-grid-container';

    // Tooltip Element
    const tooltip = document.createElement('div');
    tooltip.id = 'hex-tooltip';
    tooltip.className = 'hex-tooltip';
    document.body.appendChild(tooltip); // Append to body for absolute positioning

    // Attack Overlay (SVG)
    const svgOverlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgOverlay.classList.add('battle-overlay');
    svgOverlay.style.position = 'absolute';
    svgOverlay.style.top = '0';
    svgOverlay.style.left = '0';
    svgOverlay.style.width = '100%';
    svgOverlay.style.height = '100%';
    svgOverlay.style.pointerEvents = 'none';
    svgOverlay.style.zIndex = '20';
    svgOverlay.style.overflow = 'visible';
    gridContainer.appendChild(svgOverlay);

    // Safe Data Access
    const state = store.getState();
    const territories = state.territories || [];
    const currentUser = state.currentUser;

    if (territories.length === 0) {
        gridContainer.innerHTML = '<p class="text-neon-red" style="text-align:center; margin-top: 2rem;">ERROR: SECTOR DATA CORRUPTED OR EMPTY</p>';
    } else {
        // Updated chunk pattern for 9 cols (Odd-r layout approximation)
        // [9, 9] ensures consistent rows, CSS handles toggle offset
        const rows = chunkArray(territories, [9]);
        rows.forEach((rowItems, rowIndex) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = `hex-row ${rowIndex % 2 === 0 ? 'even' : 'odd'}`;
            rowItems.forEach(terr => {
                const hex = createHexElement(terr);

                if (terr.type !== 'void') {
                    // Tooltip Interaction
                    hex.addEventListener('mouseenter', (e) => {
                        const rect = hex.getBoundingClientRect();
                        tooltip.style.display = 'block';
                        tooltip.innerHTML = `
                            <div class="tooltip-header owner-${terr.owner}">
                                <span class="tooltip-id">SECTOR #${terr.id}</span>
                                <span class="tooltip-owner">${terr.owner.toUpperCase()}</span>
                            </div>
                            <div class="tooltip-body">
                                <div class="tooltip-row">
                                    <span class="label">BIOME:</span>
                                    <span class="value" style="color:#fff">${terr.biome ? terr.biome.toUpperCase() : 'UNKNOWN'}</span>
                                </div>
                                <div class="tooltip-row">
                                    <span class="label">TYPE:</span>
                                    <span class="value">${terr.type.toUpperCase()}</span>
                                </div>
                                <div class="tooltip-row">
                                    <span class="label">DIFF:</span>
                                    <span class="value stars">${'★'.repeat(terr.difficulty)}</span>
                                </div>
                                <div class="tooltip-row">
                                    <span class="label">STATUS:</span>
                                    <span class="value status">${terr.owner === 'neutral' ? 'CONTESTABLE' : 'OCCUPIED'}</span>
                                </div>
                            </div>
                        `;
                    });

                    hex.addEventListener('mouseleave', () => {
                        tooltip.style.display = 'none';
                    });

                    hex.addEventListener('mousemove', (e) => {
                        tooltip.style.left = e.pageX + 15 + 'px';
                        tooltip.style.top = e.pageY + 15 + 'px';
                    });
                } else {
                    // Disable interaction for void
                    hex.style.pointerEvents = 'none';
                }

                rowDiv.appendChild(hex);
            });
            gridContainer.appendChild(rowDiv);
        });
    }

    perspectiveWrapper.appendChild(gridContainer);
    container.appendChild(perspectiveWrapper);

    // 3D Tilt Effect
    container.addEventListener('mousemove', (e) => {
        const { offsetWidth: width, offsetHeight: height } = container;
        const { offsetX: x, offsetY: y } = e;

        const moveX = (x / width) - 0.5;
        const moveY = (y / height) - 0.5;

        // Max rotation deg
        const deg = 5; // Subtle tilt

        gridContainer.style.transform = `rotateY(${moveX * deg}deg) rotateX(${-moveY * deg}deg)`;
    });

    container.addEventListener('mouseleave', () => {
        gridContainer.style.transform = `rotateY(0deg) rotateX(0deg)`;
        tooltip.style.display = 'none'; // Ensure tooltip hides
    });



    // Interaction Logic
    gridContainer.addEventListener('click', (e) => {
        const hex = e.target.closest('.hex-item');
        if (!hex) return;

        const id = parseInt(hex.dataset.id);
        const terr = territories.find(t => t.id === id);

        if (!terr || !currentUser) return;

        // Logic
        if (terr.owner === currentUser.clan) {
            alert(`This sector belongs to ${currentUser.clan.toUpperCase()}.\nStatus: SECURE`);
        } else if (terr.owner === 'neutral') {
            // Check Adjacency
            const isAdjacent = store.checkAdjacency(id, currentUser.clan);

            if (isAdjacent) {
                // Open Modal
                const modal = createChallengeModal(terr, (success) => {
                    if (success) {
                        const captured = store.conquerTerritory(id, currentUser.clan);
                        if (captured) {
                            // Re-render is automatic via store listener? 
                            // Wait, we need to ensure View updates. 
                            // The store.notify() calls listeners. 
                            // We rely on the router/app to re-render or we can handle it here if we were using a framework.
                            // For Vanilla JS, the store listener usually re-renders the whole view.
                            // Let's assume App or Router handles store updates by re-rendering current view.
                            // If not, we might need to manually trigger a refresh or let the notification system handle it.
                        }
                    }
                });
                document.body.appendChild(modal); // Append to body for overlay
            } else {
                alert('OUT OF RANGE.\nYou must expand from adjacent territories.');
            }
        } else {
            alert(`Sector occupied by ${terr.owner.toUpperCase()}.\nCombat modules not yet online.`);
        }
    });

    // Start Battle Simulation
    startBattleSimulation(svgOverlay, territories);

    // Live HUD Updates
    const unsubscribe = store.subscribe((newState) => {
        // Self-cleanup: content removed from DOM
        if (!document.body.contains(container)) {
            unsubscribe();
            return;
        }

        const turing = container.querySelector('.stat-badge.turing .badge-value');
        const tesla = container.querySelector('.stat-badge.tesla .badge-value');
        const mccarthy = container.querySelector('.stat-badge.mccarthy .badge-value');

        if (turing) turing.textContent = `${newState.clans.turing.points} XP`;
        if (tesla) tesla.textContent = `${newState.clans.tesla.points} XP`;
        if (mccarthy) mccarthy.textContent = `${newState.clans.mccarthy.points} XP`;
    });

    return container;
}

function createHexElement(terr) {
    const hex = document.createElement('div');
    let classes = 'hex-item';

    if (terr.type === 'void') {
        classes += ' hex-void'; // New class for invisible/water hexes
    } else {
        if (terr.owner !== 'neutral') {
            classes += ` owner-${terr.owner}`;
        } else {
            classes += ` owner-neutral`;
        }
        // Add Biome Class
        if (terr.biome) classes += ` biome-${terr.biome}`;
    }

    hex.className = classes;
    hex.dataset.id = terr.id;
    // hex.title = ... removed tooltip replaced with rich tooltip

    // If Void, return empty hex structure
    if (terr.type === 'void') {
        hex.innerHTML = '<div class="hex-inner void-inner"></div>';
        return hex;
    }

    // Resource Icon (Type)
    let typeIconClass = 'fa-cube';
    if (terr.type === 'code') typeIconClass = 'fa-code';
    if (terr.type === 'english') typeIconClass = 'fa-language';
    if (terr.type === 'soft-skills') typeIconClass = 'fa-handshake';

    // Biome Icon (Background hint) - REMOVED for clean premium look
    // let biomeIcon = '';
    // if (terr.biome === 'city') biomeIcon = '<i class="fa-solid fa-city biome-bg-icon"></i>';
    // ...

    // Clan Insignia (Owner) - Professional Icons on Shields
    let insigniaHtml = '';

    if (terr.owner === 'turing') {
        insigniaHtml = `<i class="fa-solid fa-microchip clan-icon turing-icon"></i>`;
    } else if (terr.owner === 'tesla') {
        insigniaHtml = `<i class="fa-solid fa-bolt clan-icon tesla-icon"></i>`;
    } else if (terr.owner === 'mccarthy') {
        insigniaHtml = `<i class="fa-solid fa-brain clan-icon mccarthy-icon"></i>`;
    } else {
        // Neutral or Biome specific
        // insigniaHtml = biomeIcon; // Clean neutral
        insigniaHtml = '';
    }

    // HTML Structure
    let contentHtml = '';

    if (terr.owner === 'neutral') {
        contentHtml = `
            <div class="resource-badge neutral"><i class="fa-solid ${typeIconClass}"></i></div>
            <span class="hex-id" style="opacity:0.3; font-size: 0.7rem;">#${terr.id}</span>
        `;
    } else {
        contentHtml = `
            <div class="clan-shield">${insigniaHtml}</div>
            <div class="resource-badge"><i class="fa-solid ${typeIconClass}"></i></div>
            <span class="hex-id">#${terr.id}</span>
        `;
    }

    hex.innerHTML = `
        <div class="hex-inner">
            <div class="hex-content">
                ${contentHtml}
            </div>
            <div class="hex-overlay"></div>
        </div>
    `;
    return hex;
}

// --- Battle Simulation Logic ---

function startBattleSimulation(svgLayer, territories) {
    // Run an attack simulation every 0.8 seconds (Much faster)
    setInterval(() => {
        simulateAttack(svgLayer, territories);
    }, 800);
}

function simulateAttack(svgLayer, territories) {
    if (!document.body.contains(svgLayer)) return;

    const aggressors = territories.filter(t => t.owner !== 'neutral');
    if (aggressors.length === 0) return;

    // Pick multiple attackers for chaos? No, lets keep one but fast.
    const attacker = aggressors[Math.floor(Math.random() * aggressors.length)];
    const attackerHex = document.querySelector(`.hex-item[data-id="${attacker.id}"]`);
    if (!attackerHex) return;

    // Find neighbors visually
    const rect1 = attackerHex.getBoundingClientRect();
    const centerX1 = rect1.left + rect1.width / 2;
    const centerY1 = rect1.top + rect1.height / 2;

    const allHexes = document.querySelectorAll('.hex-item');
    let targetHex = null;

    // 1. Find valid neighbors
    const neighbors = [];
    allHexes.forEach(hex => {
        if (hex === attackerHex) return;
        const rect2 = hex.getBoundingClientRect();
        const centerX2 = rect2.left + rect2.width / 2;
        const centerY2 = rect2.top + rect2.height / 2;
        const dist = Math.hypot(centerX1 - centerX2, centerY1 - centerY2);

        if (dist < 140 && dist > 10) { // Tuned distance
            neighbors.push(hex);
        }
    });

    if (neighbors.length > 0) {
        // Pick a random neighbor
        targetHex = neighbors[Math.floor(Math.random() * neighbors.length)];
    }

    if (targetHex) {
        drawAttackLine(svgLayer, attackerHex, targetHex, attacker.owner);

        // --- Living Map: Conquest Logic ---
        // 50% Chance to successfully conquer if target is NEUTRAL or DIFFERENT CLAN
        const targetId = parseInt(targetHex.dataset.id);
        const targetTerr = territories.find(t => t.id === targetId);

        // Higher chance (0.5) for more dynamism
        if (targetTerr && targetTerr.owner !== attacker.owner && Math.random() < 0.5) {
            setTimeout(() => {
                // Visual Update Only? NO! User wants real-time stats reflection.
                // We MUST update the store to trigger the Graph update.
                const success = store.conquerTerritory(targetId, attacker.owner);

                // Note: store.conquerTerritory updates the 'territories' array in state.
                // Since 'targetTerr' is a reference to an object in that array (if not deep copied), 
                // it might already be updated. But store.conquerTerritory handles it.

                // Visual Flash & Shake logic continues...
                // We keep local DOM manipulation for smooth animation without full re-render.

                const oldOwner = targetTerr.owner; // This might be new owner now if ref is shared
                // Wait, if targetTerr is reference to store object, store.conquerTerritory updated it to new owner.
                // So oldOwner needs to be grabbed BEFORE store call?
                // Actually, let's grab it from DOM class to be safe/visual.
                let visualOldOwner = 'neutral';
                if (targetHex.classList.contains('owner-turing')) visualOldOwner = 'turing';
                if (targetHex.classList.contains('owner-tesla')) visualOldOwner = 'tesla';
                if (targetHex.classList.contains('owner-mccarthy')) visualOldOwner = 'mccarthy';

                // Update is handled by store for data, but we do visuals manually for effect
                // targetTerr.owner = attacker.owner; // Store did this already

                // Visual Flash & Shake
                targetHex.style.transition = 'all 0.1s';
                targetHex.classList.add('sector-captured'); // New CSS class for impact

                setTimeout(() => {
                    // Remove old class
                    targetHex.classList.remove(`owner-${visualOldOwner}`);
                    targetHex.classList.remove('owner-neutral');

                    // Add new class
                    targetHex.classList.add(`owner-${attacker.owner}`);

                    // Update Icon Structure
                    const content = targetHex.querySelector('.hex-content');
                    if (content) {
                        // Recalculate Icons
                        let typeIconClass = 'fa-cube';
                        if (targetTerr.type === 'code') typeIconClass = 'fa-code';
                        if (targetTerr.type === 'english') typeIconClass = 'fa-language';
                        if (targetTerr.type === 'soft-skills') typeIconClass = 'fa-handshake';

                        let insigniaHtml = '';
                        if (targetTerr.owner === 'turing') {
                            insigniaHtml = `<i class="fa-solid fa-microchip clan-icon turing-icon"></i>`;
                        } else if (targetTerr.owner === 'tesla') {
                            insigniaHtml = `<i class="fa-solid fa-bolt clan-icon tesla-icon"></i>`;
                        } else if (targetTerr.owner === 'mccarthy') {
                            insigniaHtml = `<i class="fa-solid fa-brain clan-icon mccarthy-icon"></i>`;
                        }

                        content.innerHTML = `
                            <div class="clan-shield">${insigniaHtml}</div>
                            <div class="resource-badge"><i class="fa-solid ${typeIconClass}"></i></div>
                            <span class="hex-id">#${targetTerr.id}</span>
                         `;
                    }

                    setTimeout(() => {
                        targetHex.classList.remove('sector-captured');
                        targetHex.style.transition = '';
                    }, 500);

                }, 150);

            }, 600); // Wait for laser to hit
        }
    }
}

function drawAttackLine(svg, source, target, owner) {
    // Coordinates relative to the grid container
    // We need to account for the gridContainer's layout
    // Best way: get relative position to the SVG

    const svgRect = svg.getBoundingClientRect();
    const sRect = source.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();

    const x1 = (sRect.left + sRect.width / 2) - svgRect.left;
    const y1 = (sRect.top + sRect.height / 2) - svgRect.top;
    const x2 = (tRect.left + tRect.width / 2) - svgRect.left;
    const y2 = (tRect.top + tRect.height / 2) - svgRect.top;

    // Create Line
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);

    // Color based on clan
    let color = '#fff';
    if (owner === 'turing') color = '#00f0ff'; // Blue
    if (owner === 'tesla') color = '#ff2a6d'; // Red
    if (owner === 'mccarthy') color = '#05ffa1'; // Green

    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", "3");
    line.setAttribute("stroke-linecap", "round");
    line.classList.add('attack-laser');

    svg.appendChild(line);

    // Impact Effect on Target
    setTimeout(() => {
        // Flash target
        target.classList.add('under-attack');
        setTimeout(() => target.classList.remove('under-attack'), 500);

        // Remove line after ANIMATION
        setTimeout(() => line.remove(), 1000);
    }, 100); // Slight delay for line to appear
}

function chunkArray(array, pattern) {
    const results = [];
    let i = 0;
    let p = 0;
    while (i < array.length) {
        const size = pattern[p % pattern.length];
        results.push(array.slice(i, i + size));
        i += size;
        p++;
    }
    return results;
}
