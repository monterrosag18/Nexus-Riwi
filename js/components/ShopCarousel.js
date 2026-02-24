import { store } from '../store.js';
import { ShopScene } from './ShopScene.js';

const SHOP_ITEMS = [
    {
        id: 'shield',
        name: 'ION SHIELD',
        type: 'defensive',
        subtitle: 'CLASS IV DEFENSIVE MODULE',
        icon: 'fa-shield-halved',
        colorClass: 'text-neon-blue',
        cost: 500,
        specs: { absorption: '85%', recharge: '4.2s', weight: '12kg', energy: 'HIGH' },
        desc: 'Generates a localized ionic field capable of dispersing directed energy weapons.'
    },
    {
        id: 'siphon',
        name: 'DATA SIPHON',
        type: 'offensive',
        subtitle: 'COVERT EXTRACTION PROTOCOL',
        icon: 'fa-database',
        colorClass: 'text-neon-red',
        cost: 1500,
        specs: { yield: 'HIGH', trace: 'LOW', duration: 'INSTANT', energy: 'CRIT' },
        desc: 'A malicious packet injector designed to siphon raw Influence Points directly from a rival clan mainframe.',
        isOffensive: true,
        stealAmount: 200
    },
    {
        id: 'overclock',
        name: 'OVERCLOCK KIT',
        type: 'utility',
        subtitle: 'HARDWARE ACCELERATOR',
        icon: 'fa-bolt',
        colorClass: 'text-neon-yellow',
        cost: 800,
        specs: { boost: '+40%', heat: 'DANGEROUS', duration: '60s', energy: 'MED' },
        desc: 'Bypasses safety limiters on core processors, boosting speeds at the risk of system damage.'
    },
    {
        id: 'cloak',
        name: 'STEALTH CLOAK',
        type: 'utility',
        subtitle: 'OPTICAL CAMOUFLAGE',
        icon: 'fa-ghost',
        colorClass: 'text-neon-purple',
        cost: 1200,
        specs: { visibility: 'ZERO', heat_sig: 'MASKED', duration: '120s', energy: 'HIGH' },
        desc: 'Bends local light waves around the operator, rendering them invisible to standard optics.'
    },
    {
        id: 'scanner',
        name: 'OMNI-SCANNER',
        type: 'utility',
        subtitle: 'SECTOR RECONNAISSANCE',
        icon: 'fa-eye',
        colorClass: 'text-neon-green',
        cost: 2000,
        specs: { range: '50km', penetration: 'DEEP', type: 'PASSIVE', energy: 'LOW' },
        desc: 'Advanced telemetry suit that highlights weak points in enemy territory.'
    }
];

export default function renderShop() {
    const container = document.createElement('div');
    container.className = 'cockpit-wrapper fade-in';

    let activeItem = SHOP_ITEMS[0];
    let shopSceneInstance = null;
    let unsubscribe = null;

    function renderDOM() {
        const state = store.getState();
        const user = state.currentUser || { name: 'GUEST', clan: 'neutral', credits: 0 };
        const credits = user.credits || 0;

        container.innerHTML = `
            <!-- 3D BACKGROUND -->
            <div id="shop-scene-container" style="position: absolute; inset: 0; z-index: 0;"></div>

            <!-- GLOBAL OVERLAYS -->
            <div class="cockpit-frame" style="pointer-events: none; z-index: 10;">
                <div class="frame-top"></div>
                <div class="frame-bottom"></div>
            </div>
            <div class="scan-lines"></div>
            <div class="holo-noise"></div>

            <!-- MAIN GRID LAYOUT -->
            <div class="holo-grid-container" style="z-index: 20; position: relative; display: grid; grid-template-columns: 350px 1fr 300px; height: 100vh; padding: 80px 40px 40px 40px; gap: 20px;">
                
                <!-- COLUMN 1: INVENTORY & MODULES -->
                <div class="holo-column col-left">
                    <div class="holo-panel mini-profile">
                        <div class="panel-header">OPERATOR STATUS</div>
                        <div class="profile-row">
                            <div class="avatar-frame"><i class="fa-solid fa-user-astronaut"></i></div>
                            <div class="profile-info">
                                <div class="name">${user.name.toUpperCase()}</div>
                                <div class="rank">SECTOR: ${user.clan.toUpperCase()}</div>
                            </div>
                        </div>
                    </div>

                    <div class="holo-tabs">
                        <button class="holo-tab active">BLACK MARKET</button>
                    </div>

                    <div class="holo-list-scroll">
                        ${SHOP_ITEMS.map(item => `
                            <div class="holo-item-row ${activeItem.id === item.id ? 'selected' : ''}" data-id="${item.id}">
                                <div class="item-icon"><i class="fa-solid ${item.icon}"></i></div>
                                <div class="item-details">
                                    <div class="item-name">${item.name}</div>
                                    <div class="item-cost ${item.colorClass}">${item.cost} CR</div>
                                </div>
                                <div class="item-status">${credits >= item.cost ? 'AVAILABLE' : 'LOCKED'}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- COLUMN 2: CENTER STAGE -->
                <div class="holo-column col-center" style="pointer-events: none;"> 
                    <div class="hologram-header">
                        <h1 class="item-title-large" style="text-shadow: 0 0 10px var(--primary-cyan);">${activeItem.name}</h1>
                        <div class="item-subtitle" style="color: var(--primary-cyan);">${activeItem.subtitle}</div>
                    </div>
                    
                    <div class="action-bar" style="pointer-events: auto;">
                        <button id="btn-purchase" class="action-btn primary" ${credits < activeItem.cost ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                            <span class="btn-text">PURCHASE MODULE</span>
                            <span class="btn-glare"></span>
                        </button>
                         <div class="credit-readout">
                            <div class="label">CREDITS AVAILABLE</div>
                            <div class="value">${credits.toLocaleString()} <small>CR</small></div>
                        </div>
                    </div>
                </div>

                <!-- COLUMN 3: TECH SPECS -->
                <div class="holo-column col-right">
                    <div class="holo-panel specs-panel">
                        <div class="panel-header">TECHNICAL SPECIFICATIONS</div>
                        <div class="spec-grid">
                            ${Object.keys(activeItem.specs).map(key => `
                                <div class="spec-item">
                                    <div class="spec-label">${key.toUpperCase()}</div>
                                    <div class="spec-val ${key === 'energy' ? 'text-neon-red' : 'text-neon-cyan'}">${activeItem.specs[key]}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="panel-divider"></div>
                        <div class="description-box">
                            <p class="desc-text">${activeItem.desc}</p>
                        </div>
                        <div class="radar-widget">
                            <div class="radar-circle small"><div class="radar-sweep"></div></div>
                            <div class="radar-text">LIVE FEED // SECURE</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- OFFENSIVE TARGET MODAL (Hidden by default) -->
            <div id="target-modal" class="hidden" style="position: absolute; inset:0; z-index: 100; display:none; justify-content:center; align-items:center; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);">
                <div class="holo-panel" style="width: 400px; border-color: red; box-shadow: 0 0 30px rgba(255,0,0,0.3);">
                    <div class="panel-header" style="color: red; border-bottom-color: red;"><i class="fa-solid fa-triangle-exclamation"></i> SELECT TARGET CLAN</div>
                    <div class="p-4 text-center">
                        <p class="text-sm text-gray-300 mb-4">Deploying ${activeItem.name}. Select a rival clan to siphon influence points from their mainframe.</p>
                        <select id="target-clan-select" class="w-full bg-black border border-red-500 text-red-500 p-2 mb-4 font-mono outline-none">
                            ${Object.values(store.getState().clans).filter(c => c.name.toLowerCase() !== user.clan.toLowerCase()).map(c =>
            `<option value="${c.name.toLowerCase()}">${c.name.toUpperCase()} (PTS: ${c.points})</option>`
        ).join('')}
                        </select>
                        <div class="flex gap-4">
                            <button id="btn-cancel-strike" class="flex-1 border border-gray-600 text-gray-400 py-2 hover:bg-gray-800 transition">ABORT</button>
                            <button id="btn-confirm-strike" class="flex-1 bg-red-600/20 border border-red-500 text-red-500 py-2 hover:bg-red-600 hover:text-white transition font-bold" style="box-shadow: 0 0 10px rgba(255,0,0,0.5);">EXECUTE STRIKE</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function attachEvents() {
        // Row selection
        const rows = container.querySelectorAll('.holo-item-row');
        rows.forEach(row => {
            row.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const selected = SHOP_ITEMS.find(i => i.id === id);
                if (selected && selected.id !== activeItem.id) {
                    activeItem = selected;
                    updateUI();
                    if (shopSceneInstance) shopSceneInstance.setItem(activeItem.id);
                }
            });
        });

        // Purchase Button
        const btnPurchase = container.querySelector('#btn-purchase');
        if (btnPurchase) {
            btnPurchase.addEventListener('click', () => {
                const user = store.getState().currentUser;
                if (!user || user.credits < activeItem.cost) return;

                if (activeItem.isOffensive) {
                    // Open Target Modal
                    const modal = container.querySelector('#target-modal');
                    modal.style.display = 'flex';
                } else {
                    // Normal purchase
                    if (store.purchaseItem(activeItem.cost)) {
                        triggerPurchaseSuccess();
                    }
                }
            });
        }

        // Modal Buttons
        const btnCancel = container.querySelector('#btn-cancel-strike');
        const btnConfirm = container.querySelector('#btn-confirm-strike');
        const modal = container.querySelector('#target-modal');
        const select = container.querySelector('#target-clan-select');

        if (btnCancel) {
            btnCancel.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        if (btnConfirm) {
            btnConfirm.addEventListener('click', () => {
                const target = select.value;
                if (store.purchaseItem(activeItem.cost)) {
                    const result = store.executeTacticalStrike(target, activeItem.stealAmount);
                    modal.style.display = 'none';
                    if (result.success) {
                        triggerPurchaseSuccess(`STEALTH HACK SUCCESSFUL. EXTRACTED ${result.actualStolen} PTS FROM ${target.toUpperCase()}.`);
                    }
                }
            });
        }
    }

    function updateUI() {
        const state = store.getState();
        const user = state.currentUser || { name: 'GUEST', clan: 'neutral', credits: 0 };
        const credits = user.credits || 0;

        // 1. Update List Styles
        const rows = container.querySelectorAll('.holo-item-row');
        rows.forEach(row => {
            const id = row.getAttribute('data-id');
            const item = SHOP_ITEMS.find(i => i.id === id);

            if (id === activeItem.id) {
                row.classList.add('selected');
            } else {
                row.classList.remove('selected');
            }

            // Update lock status
            const statusNode = row.querySelector('.item-status');
            if (statusNode && item) {
                statusNode.innerText = credits >= item.cost ? 'AVAILABLE' : 'LOCKED';
            }
        });

        // 2. Update Center Panel Text
        const title = container.querySelector('.item-title-large');
        const subtitle = container.querySelector('.item-subtitle');
        if (title) title.innerText = activeItem.name;
        if (subtitle) subtitle.innerText = activeItem.subtitle;

        // 3. Update Action Bar
        const btnPurchase = container.querySelector('#btn-purchase');
        if (btnPurchase) {
            if (credits < activeItem.cost) {
                btnPurchase.setAttribute('disabled', 'true');
                btnPurchase.style.opacity = '0.5';
                btnPurchase.style.cursor = 'not-allowed';
            } else {
                btnPurchase.removeAttribute('disabled');
                btnPurchase.style.opacity = '1';
                btnPurchase.style.cursor = 'pointer';
            }
        }

        const creditValue = container.querySelector('.credit-readout .value');
        if (creditValue) {
            creditValue.innerHTML = `${credits.toLocaleString()} <small>CR</small>`;
        }

        // 4. Update Specs Panel
        const specGrid = container.querySelector('.spec-grid');
        if (specGrid) {
            specGrid.innerHTML = Object.keys(activeItem.specs).map(key => `
                <div class="spec-item">
                    <div class="spec-label">${key.toUpperCase()}</div>
                    <div class="spec-val ${key === 'energy' ? 'text-neon-red' : 'text-neon-cyan'}">${activeItem.specs[key]}</div>
                </div>
            `).join('');
        }

        const descText = container.querySelector('.desc-text');
        if (descText) {
            descText.innerText = activeItem.desc;
        }
    }

    function triggerPurchaseSuccess(customMsg) {
        // Flash screen logic or notification bubble
        const centerCol = container.querySelector('.col-center');
        const msg = document.createElement('div');
        msg.className = 'text-neon-green font-bold text-center mt-4 absolute w-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl pointer-events-none z-50';
        msg.style.textShadow = '0 0 20px #0f0';
        msg.innerText = customMsg || 'MODULE ACQUIRED. CREDITS DEDUCTED.';
        centerCol.appendChild(msg);

        // Flash Light
        if (typeof window.gsap !== 'undefined') {
            window.gsap.fromTo(msg, { scale: 0.8, opacity: 1 }, { scale: 1.2, opacity: 0, duration: 2, ease: "power2.out" });
            if (shopSceneInstance && shopSceneInstance.scene) {
                const light = shopSceneInstance.scene.children.find(c => c instanceof THREE.AmbientLight);
                if (light) window.gsap.fromTo(light, { intensity: 10 }, { intensity: 2, duration: 1 });
            }
        }
        setTimeout(() => { if (msg.parentElement) msg.remove(); }, 2000);
    }

    // Initial Render
    renderDOM();

    // Init 3D Scene once, delayed
    setTimeout(() => {
        const sceneContainer = container.querySelector('#shop-scene-container');
        if (sceneContainer && typeof ShopScene !== 'undefined') {
            shopSceneInstance = new ShopScene('shop-scene-container');
            shopSceneInstance.setItem(activeItem.id);
        }
        attachEvents();

        if (typeof window.gsap !== 'undefined') {
            const tl = window.gsap.timeline();
            tl.from(container.querySelector('.col-left'), { x: -50, opacity: 0, duration: 0.6, ease: "power2.out" })
                .from(container.querySelector('.col-right'), { x: 50, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.4")
                .from(container.querySelector('.hologram-header'), { y: -30, opacity: 0, duration: 0.8 }, "-=0.4")
                .from(container.querySelector('.action-bar'), { y: 30, opacity: 0, duration: 0.8 }, "-=0.6");
        }
    }, 100);

    // Keep UI updated if credits change
    unsubscribe = store.subscribe(() => {
        updateUI();
    });

    container.destroy = () => {
        if (unsubscribe) unsubscribe();
    };

    return container;
}
