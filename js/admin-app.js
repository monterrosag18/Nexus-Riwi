/**
 * admin-app.js
 * Independent logic for the standalone Faction Admin Dashboard.
 * Interacts safely with localStorage without touching Three.js engine.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- State Management ---
    const RIWI_CLANS_KEY = 'riwi_clans_db';

    // Base Faction Default Roster
    const defaultClans = {
        turing: { name: 'Turing', color: '#2D9CDB', points: 2606, members: 25, icon: '\uf2db' },
        tesla: { name: 'Tesla', color: '#EB5757', points: 1932, members: 28, icon: '\uf0e7' },
        mccarthy: { name: 'McCarthy', color: '#27AE60', points: 1373, members: 22, icon: '\uf544' },
        lovelace: { name: 'Lovelace', color: '#9B51E0', points: 1105, members: 18, icon: '\uf121' },
        neumann: { name: 'Neumann', color: '#F2C94C', points: 940, members: 15, icon: '\uf0c3' }
    };

    function getClans() {
        try {
            const raw = localStorage.getItem(RIWI_CLANS_KEY);
            return raw ? JSON.parse(raw) : defaultClans;
        } catch (e) {
            console.error('Error fetching admin clans', e);
            return defaultClans;
        }
    }

    function saveClans(clans) {
        localStorage.setItem(RIWI_CLANS_KEY, JSON.stringify(clans));
    }

    function removeClan(id) {
        if (confirm(`WARNING: Decommission FACTION ${id.toUpperCase()}? This is irreversible.`)) {
            const clans = getClans();
            delete clans[id];
            saveClans(clans);

            // If deleting the currently edited clan, reset the form.
            if (editingClanId === id) {
                editingClanId = null;
                createForm.reset();
                createForm.querySelector('button[type="submit"]').innerHTML = '<i class="fa-solid fa-upload"></i> INJECT TO MATRIX';
                document.querySelector('#create-view h3').innerHTML = '<i class="fa-solid fa-folder-plus"></i> Initialize New Designation';

                // Clear color selection natively
                colorSwatches.forEach(s => s.classList.remove('selected'));
                if (colorSwatches.length > 0) {
                    colorSwatches[0].classList.add('selected');
                    hiddenColorInput.value = colorSwatches[0].dataset.color;
                }
            }

            renderRoster();
            localStorage.setItem('riwi_force_regen', 'true');
        }
    }

    // --- DOM Elements ---
    const rosterView = document.getElementById('roster-view');
    const createView = document.getElementById('create-view');
    const rosterGrid = document.getElementById('faction-grid-container');
    const navLinks = document.querySelectorAll('.admin-nav a');

    // Form Elements
    const createForm = document.getElementById('create-clan-form');
    const nameInput = document.getElementById('clan-name');
    const iconSelect = document.getElementById('clan-icon');
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const hiddenColorInput = document.getElementById('clan-color');
    const regenBtn = document.getElementById('btn-force-regenerate');

    let editingClanId = null; // Tracks if the user is editing an active clan.

    // --- Setup Color Picker UI ---
    // Auto-select first color
    if (colorSwatches.length > 0) {
        colorSwatches[0].classList.add('selected');
        hiddenColorInput.value = colorSwatches[0].dataset.color;
    }

    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            colorSwatches.forEach(s => s.classList.remove('selected'));
            e.target.classList.add('selected');
            hiddenColorInput.value = e.target.dataset.color;
        });
    });

    // --- Navigation Routing ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.classList.contains('danger-zone')) return; // Allow normal hyperlink

            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const target = link.getAttribute('href');
            if (target === '#roster') {
                createView.style.display = 'none';
                rosterView.style.display = 'block';
                renderRoster(); // Refresh
            } else if (target === '#create') {
                rosterView.style.display = 'none';
                createView.style.display = 'block';
                nameInput.focus();
            }
        });
    });

    // --- Force Grid Regen Action ---
    regenBtn.addEventListener('click', () => {
        regenBtn.classList.add('shimmer');
        regenBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> RECALCULATING...';

        // This flag instructs the game client's store.js to throw out the old map
        // array next time it boots and draw fresh geometric bounds for the new roster.
        localStorage.setItem('riwi_force_regen', 'true');

        setTimeout(() => {
            regenBtn.innerHTML = '<i class="fa-solid fa-check"></i> OVERRIDE SUCCESS';
            regenBtn.classList.remove('shimmer');
            setTimeout(() => {
                regenBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> FORCE GRID REGEN';
            }, 2000);
        }, 1500);
    });

    // --- Form Submission / Reconfiguration ---
    createForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const color = hiddenColorInput.value;
        const icon = iconSelect.value;
        const id = name.toLowerCase().replace(/\s+/g, '');

        if (!name || !color || !id) return;

        const currentClans = getClans();
        const activeProfiles = Object.values(currentClans);

        // 1. Validate ID Duplication (bypass if it's the same clan)
        if (currentClans[id] && editingClanId !== id) {
            alert('CRITICAL: A FACTION WITH THIS DESIGNATION ID ALREADY COMPUTES.');
            return;
        }

        // 2. Validate Name Duplication
        const nameDuplicate = activeProfiles.find(
            clan => clan.name.toLowerCase() === name.toLowerCase() && (!editingClanId || currentClans[editingClanId] !== clan)
        );
        if (nameDuplicate) {
            alert(`CRITICAL: THE NAME "${name.toUpperCase()}" IS ALREADY IN USE BY AN ACTIVE FACTION.`);
            return;
        }

        // 3. Validate Color Duplication
        const colorDuplicate = activeProfiles.find(
            clan => clan.color.toLowerCase() === color.toLowerCase() && (!editingClanId || currentClans[editingClanId] !== clan)
        );
        if (colorDuplicate) {
            alert(`CRITICAL: THE HEX COLOR [${color}] IS ALREADY ASSIGNED TO FACTION "${colorDuplicate.name.toUpperCase()}". PLEASE SELECT A UNIQUE SIGNATURE COLOR.`);
            return;
        }

        // Structure new or updated clan properties
        let clanData = {
            name: name,
            color: color,
            icon: icon, // Unicode escape string
            points: 0,
            members: 0,
            isCustom: true
        };

        // If editing, preserve the stats & state
        if (editingClanId) {
            clanData.points = currentClans[editingClanId].points;
            clanData.members = currentClans[editingClanId].members;
            clanData.isCustom = currentClans[editingClanId].isCustom;

            // If the user changed the name, the dictionary key changes, so delete the old key
            if (editingClanId !== id) {
                delete currentClans[editingClanId];
            }
        }

        currentClans[id] = clanData;

        saveClans(currentClans);
        localStorage.setItem('riwi_force_regen', 'true'); // Flag map for recalculation

        // Cleanup Editing State
        editingClanId = null;
        createForm.querySelector('button[type="submit"]').innerHTML = '<i class="fa-solid fa-upload"></i> INJECT TO MATRIX';
        document.querySelector('#create-view h3').innerHTML = '<i class="fa-solid fa-folder-plus"></i> Initialize New Designation';

        // Reset and redirect
        nameInput.value = '';
        navLinks[0].click(); // Simulate clicking Roster
    });

    // --- Render Roster Loop ---
    function getDisplayIcon(unicodeString) {
        // Map common unicode back to icon classes for the HTML UI display
        // The unicode is what Three.js needs for TextGeometry Canvas.
        const iconMap = {
            '\uf521': 'fa-solid fa-crown',
            '\uf6d5': 'fa-solid fa-dragon',
            '\uf54c': 'fa-solid fa-skull',
            '\uf3ed': 'fa-solid fa-shield-halved',
            '\uf3a5': 'fa-solid fa-gem',
            '\uf06d': 'fa-solid fa-fire',
            '\uf0e7': 'fa-solid fa-bolt',
            '\uf5fc': 'fa-solid fa-jedi',
            '\uf441': 'fa-solid fa-chess-knight',
            '\uf70c': 'fa-solid fa-meteor',
            '\uf70b': 'fa-solid fa-ring',
            '\uf185': 'fa-solid fa-sun',
            '\uf186': 'fa-solid fa-moon',
            '\uf005': 'fa-solid fa-star',
            '\uf06e': 'fa-solid fa-eye',
            '\uf5a6': 'fa-solid fa-monument',
            '\uf504': 'fa-solid fa-user-ninja',
            '\uf4fb': 'fa-solid fa-user-astronaut',
            '\uf24e': 'fa-solid fa-scale-balanced',
            '\uf1e2': 'fa-solid fa-bomb',
            '\uf0c3': 'fa-solid fa-flask',
            '\uf21e': 'fa-solid fa-heartbeat',
            '\uf5d2': 'fa-solid fa-atom',
            '\uf0eb': 'fa-solid fa-lightbulb'
        };
        return iconMap[unicodeString] || 'fa-solid fa-shield-halved';
    }

    function renderRoster() {
        const clans = getClans();
        rosterGrid.innerHTML = '';

        const clanIds = Object.keys(clans);

        if (clanIds.length === 0) {
            rosterGrid.innerHTML = `<div class="p-4 text-gray-500">No active factions found in DB.</div>`;
            return;
        }

        clanIds.forEach(id => {
            const clan = clans[id];
            const htmlIcon = getDisplayIcon(clan.icon);

            const card = document.createElement('div');
            card.className = 'faction-card';
            // Extract a slightly glowing border color based on clan color
            card.style.borderLeft = `4px solid ${clan.color}`;

            card.innerHTML = `
                <div class="card-header">
                    <div class="faction-identity">
                        <i class="${htmlIcon}" style="color: ${clan.color}; font-size: 1.5rem;"></i>
                        <h4 style="margin: 0;">${clan.name.toUpperCase()}</h4>
                    </div>
                </div>
                <div class="card-stats">
                    <div class="stat-block">
                        <span class="label">INFLUENCE</span>
                        <span class="value" style="color: ${clan.color};">${clan.points}</span>
                    </div>
                    <div class="stat-block">
                        <span class="label">OPERATORS</span>
                        <span class="value">${clan.members}</span>
                    </div>
                </div>
                <!-- Reconfiguration and Removal Actions -->
                <div class="card-actions" style="display: flex; gap: 0.5rem; justify-content: center;">
                    <button class="delete-btn btn-decommission" style="flex: 1;" data-id="${id}">
                        <i class="fa-solid fa-trash-can"></i> DECOMMISSION
                    </button>
                    <button class="action-button btn-reconfigure" style="flex: 1; padding: 0.5rem; font-size: 0.8rem; border-color: ${clan.color}; color: ${clan.color}; background: rgba(0,0,0,0.3);" data-id="${id}">
                        <i class="fa-solid fa-pen-to-square"></i> RECONFIGURE
                    </button>
                </div>
            `;
            rosterGrid.appendChild(card);
        });

        // Safely attach listeners avoiding inline strings completely
        rosterGrid.querySelectorAll('.btn-decommission').forEach(btn => {
            btn.addEventListener('click', (e) => removeClan(e.currentTarget.dataset.id));
        });
        rosterGrid.querySelectorAll('.btn-reconfigure').forEach(btn => {
            btn.addEventListener('click', (e) => editClan(e.currentTarget.dataset.id));
        });
    }

    function editClan(id) {
        const clans = getClans();
        const clan = clans[id];
        if (!clan) return;

        editingClanId = id;

        // Populate Name
        nameInput.value = clan.name;

        // Populate Color
        hiddenColorInput.value = clan.color.toUpperCase();
        colorSwatches.forEach(s => {
            s.classList.remove('selected');
            if (s.dataset.color.toUpperCase() === clan.color.toUpperCase()) {
                s.classList.add('selected');
            }
        });

        // Populate Select Icon
        iconSelect.value = clan.icon;

        // Update View State
        createForm.querySelector('button[type="submit"]').innerHTML = '<i class="fa-solid fa-pen-nib"></i> UPDATE DESIGNATION';
        document.querySelector('#create-view h3').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Reconfigure Active Designation';
        navLinks[1].click(); // Simulate clicking Initialize to swap screen
    }

    // Still exposing if needed externally, though internal bindings work natively now
    window.adminRemoveClan = removeClan;
    window.adminEditClan = editClan;

    // --- Init ---
    createView.style.display = 'none'; // Hide by default
    renderRoster();
});
