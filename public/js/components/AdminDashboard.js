import { store } from '../store.js';

export default function renderAdminDashboard() {
    const container = document.createElement('div');
    container.className = 'admin-wrapper fade-in';

    // State for the form
    let newClanName = '';
    let newClanColor = '#00f0ff';
    let unsubscribe = null;

    const PREDEFINED_COLORS = [
        '#00f0ff', // Cyan
        '#ff2a6d', // Neon Red
        '#05ffa1', // Neon Green
        '#aa00ff', // Purple
        '#ffaa00', // Warning Orange
        '#ffff00', // Yellow
        '#ffffff', // White
        '#ff00ff'  // Magenta
    ];

    function renderDOM() {
        const state = store.getState();
        const clans = state.clans || {};

        container.innerHTML = `
            <div class="admin-panel">
                <div class="admin-header">
                    <div class="admin-title">
                        <i class="fa-solid fa-server"></i> NEXUS CORE OVERRIDE
                    </div>
                    <button class="btn-cyber btn-close" style="width: auto; padding: 0.5rem 1rem;">
                        <i class="fa-solid fa-xmark"></i> CLOSE
                    </button>
                </div>

                <div class="admin-content">
                    <!-- LEFT SIDEBAR: CREATION FORM -->
                    <div class="admin-sidebar">
                        <div class="admin-section-title">REGISTER NEW SUB-FACTION</div>
                        
                        <div class="form-group">
                            <label class="form-label">CLAN DESIGNATION</label>
                            <input type="text" id="clan-name-input" class="form-input" placeholder="E.g. OMEGA" value="${newClanName}" autocomplete="off">
                        </div>

                        <div class="form-group">
                            <label class="form-label">FACTION SIGNATURE COLOR</label>
                            <div class="color-picker-grid">
                                ${PREDEFINED_COLORS.map(color => `
                                    <div class="color-swatch ${newClanColor === color ? 'selected' : ''}" 
                                         style="background-color: ${color}; color: ${color}" 
                                         data-color="${color}">
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <button id="btn-create-clan" class="btn-cyber">
                            <i class="fa-solid fa-plus"></i> INITIALIZE CLAN
                        </button>
                        
                        <div style="margin-top: 3rem;">
                            <div class="admin-section-title" style="color: #ffaa00; border-color: rgba(255,170,0,0.3);">MAP ARCHITECTURE</div>
                            <p style="font-size: 0.8rem; color: #a0c0d0; margin-bottom: 1rem;">
                                Rebuild the central geometric structure to accommodate current registered factions.
                            </p>
                            <button id="btn-rebuild-map" class="btn-cyber danger" style="border-color: #ffaa00; color: #ffaa00; background: rgba(255,170,0,0.1);">
                                <i class="fa-solid fa-hammer"></i> REGENERATE HEX GRID
                            </button>
                        </div>
                    </div>

                    <!-- MAIN AREA: ROSTER -->
                    <div class="admin-main">
                        <div class="admin-section-title">ACTIVE FACTION ROSTER (${Object.keys(clans).length})</div>
                        <div class="roster-grid">
                            ${Object.keys(clans).map(clanId => {
            const c = clans[clanId];
            return `
                                <div class="clan-card" style="--clan-color: ${c.color};">
                                    <div class="clan-card-header">
                                        <h3 class="clan-card-title">${c.name.toUpperCase()}</h3>
                                        <i class="fa-solid fa-shield-halved" style="color: ${c.color}; font-size: 1.2rem;"></i>
                                    </div>
                                    <div class="clan-stat">
                                        <span>INFLUENCE</span>
                                        <span class="clan-stat-val text-neon-cyan">${c.points.toLocaleString()} PTS</span>
                                    </div>
                                    <div class="clan-stat">
                                        <span>AGENTS</span>
                                        <span class="clan-stat-val">${c.members || 1}</span>
                                    </div>
                                    <div class="card-actions">
                                        <button class="btn-icon delete btn-delete-clan" data-id="${clanId}" title="Decommission Clan">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                `;
        }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function attachEvents() {
        // Close Button
        const btnClose = container.querySelector('.btn-close');
        if (btnClose) {
            btnClose.addEventListener('click', () => {
                window.location.hash = '#map';
            });
        }

        // Color Swatches
        const swatches = container.querySelectorAll('.color-swatch');
        swatches.forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                newClanColor = e.target.getAttribute('data-color');
                // Persist the input name before re-render
                const input = container.querySelector('#clan-name-input');
                if (input) newClanName = input.value;
                reRender();
            });
        });

        // Create Clan
        const btnCreate = container.querySelector('#btn-create-clan');
        if (btnCreate) {
            btnCreate.addEventListener('click', () => {
                const input = container.querySelector('#clan-name-input');
                const name = input ? input.value.trim() : '';
                if (name.length > 0) {
                    store.addClan(name, newClanColor);
                    newClanName = ''; // Reset form
                    reRender();
                }
            });
        }

        // Delete Clan
        const deleteBtns = container.querySelectorAll('.btn-delete-clan');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Find closest button in case icon was clicked
                const id = e.target.closest('button').getAttribute('data-id');
                if (confirm(`Are you sure you want to delete ${id.toUpperCase()}? This will orphan their points.`)) {
                    store.removeClan(id);
                    reRender();
                }
            });
        });

        // Regenerate Map Button
        const btnRebuild = container.querySelector('#btn-rebuild-map');
        if (btnRebuild) {
            btnRebuild.addEventListener('click', () => {
                if (confirm("Regenerating the map will randomly reassign owners to guarantee 5 zones per clan. Proceed?")) {
                    store.regenerateMapDynamic();
                    // Flash notification or redirect
                    const btn = document.getElementById('btn-rebuild-map');
                    const oldText = btn.innerHTML;
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> REGENERATED';
                    btn.style.backgroundColor = 'rgba(0,255,136,0.2)';
                    btn.style.borderColor = '#00ff88';
                    btn.style.color = '#00ff88';
                    setTimeout(() => {
                        window.location.hash = '#map';
                    }, 1000);
                }
            });
        }
    }

    function reRender() {
        // Save focus if needed, but for simplicity we wipe DOM here
        const input = container.querySelector('#clan-name-input');
        if (input) newClanName = input.value;

        renderDOM();
        attachEvents();

        // Restore input value/focus
        const newInput = container.querySelector('#clan-name-input');
        if (newInput) {
            newInput.value = newClanName;
            newInput.focus();
        }
    }

    // Initial Render
    renderDOM();
    attachEvents();

    // Keep UI updated if anything else modifies the store
    unsubscribe = store.subscribe(() => {
        // We only re-render if we aren't currently typing to avoid losing characters
        if (document.activeElement.id !== 'clan-name-input') {
            reRender();
        }
    });

    container.destroy = () => {
        if (unsubscribe) unsubscribe();
    };

    return container;
}
