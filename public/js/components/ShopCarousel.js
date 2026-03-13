import { store } from '../store.js';
import { ShopScene } from './ShopScene.js';

// --- MODULE STATE ---
let shopMode = 'CARDS';
let spinState = 'READY';
let activeCard = null; // Initialized in renderShop
let lastResult = null;
let spinInterval = null;
let shopScene = null;

// ═══════════════════════════════════════════════
//  THE 8 NEXUS CARDS — 4 GOOD / 4 BAD
// ═══════════════════════════════════════════════
const NEXUS_CARDS = [
    // ✅ GOOD CARDS
    {
        id: 'ion-shield', name: 'ION SHIELD', type: 'good',
        subtitle: 'DEFENSIVE PROTOCOL',
        desc: 'Emergency defense matrix activated. Quantum credits surge through your account.',
        effect: '+500 CREDITS', effectDetail: 'Your account receives 500 bonus credits.',
        image: 'escudo_habilidad.png', rgb: '0, 220, 255',
        icon: 'fa-shield-halved',
        execute: async () => {
            const user = store.getState().currentUser;
            if (!user) return { msg: 'NO OPERATOR', success: false };
            try {
                const res = await store.authenticatedFetch('/api/shop/card-effect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user.name, cardId: 'ion-shield' })
                });
                if (res.ok) {
                    await store.syncUserProfile();
                    return { msg: 'ION SHIELD activated! +500 CR deposited.', success: true };
                }
            } catch (e) { console.error(e); }
            return { msg: 'SYNC ERROR', success: false };
        }
    },
    {
        id: 'neural-patch', name: 'NEURAL PATCH', type: 'good',
        subtitle: 'CLAN BOOST MODULE',
        desc: 'A neural uplink patch that feeds raw influence data directly to your faction.',
        effect: '+200 CLAN PTS', effectDetail: 'Your clan gains 200 influence points.',
        image: 'parche_habilidad.png', rgb: '0, 255, 136',
        icon: 'fa-microchip',
        execute: async () => {
            const user = store.getState().currentUser;
            if (!user) return { msg: 'NO OPERATOR', success: false };
            try {
                const res = await store.authenticatedFetch('/api/shop/card-effect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user.name, cardId: 'neural-patch' })
                });
                if (res.ok) {
                    await store.syncUserProfile();
                    await store.loadInitialData(); // Sync clan points
                    return { msg: 'NEURAL PATCH deployed! +200 pts to your clan.', success: true };
                }
            } catch (e) { console.error(e); }
            return { msg: 'SYNC ERROR', success: false };
        }
    },
    {
        id: 'xp-elixir', name: 'XP ELIXIR', type: 'good',
        subtitle: 'EXPERIENCE CATALYST',
        desc: 'Rare quantum elixir that amplifies clan experience output for a limited window.',
        effect: '+300 CLAN PTS', effectDetail: 'Your clan surges with 300 bonus points.',
        image: 'pocion_habilidad.png', rgb: '170, 0, 255',
        icon: 'fa-flask',
        execute: async () => {
            const user = store.getState().currentUser;
            if (!user) return { msg: 'NO OPERATOR', success: false };
            try {
                const res = await store.authenticatedFetch('/api/shop/card-effect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user.name, cardId: 'xp-elixir' })
                });
                if (res.ok) {
                    await store.syncUserProfile();
                    await store.loadInitialData();
                    return { msg: 'XP ELIXIR consumed! +300 pts to your clan!', success: true };
                }
            } catch (e) { console.error(e); }
            return { msg: 'SYNC ERROR', success: false };
        }
    },
    {
        id: 'data-scroll', name: 'DATA SCROLL', type: 'good',
        subtitle: 'HYBRID REWARD',
        desc: 'Ancient encrypted scroll containing both credits and influence data fragments.',
        effect: '+150 PTS +200 CR', effectDetail: 'Your clan gains 150 pts and you gain 200 credits.',
        image: 'pergamino_habilidad.png', rgb: '255, 215, 0',
        icon: 'fa-scroll',
        execute: async () => {
            const user = store.getState().currentUser;
            if (!user) return { msg: 'NO OPERATOR', success: false };
            try {
                const res = await store.authenticatedFetch('/api/shop/card-effect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user.name, cardId: 'data-scroll' })
                });
                if (res.ok) {
                    await store.syncUserProfile();
                    await store.loadInitialData();
                    return { msg: 'DATA SCROLL decoded! +150 clan pts +200 CR!', success: true };
                }
            } catch (e) { console.error(e); }
            return { msg: 'SYNC ERROR', success: false };
        }
    },
    // ❌ BAD CARDS
    {
        id: 'sys-overload', name: 'SYSTEM OVERLOAD', type: 'bad',
        subtitle: 'CRITICAL FAILURE',
        desc: 'Power surge damages your clan\'s infrastructure. Influence points are lost.',
        effect: '−300 CLAN PTS', effectDetail: 'Your clan loses 300 influence points.',
        image: 'bomba_habilidad.png', rgb: '255, 60, 60',
        icon: 'fa-explosion',
        execute: async () => {
            const user = store.getState().currentUser;
            if (!user) return { msg: 'NO OPERATOR', success: false };
            try {
                const res = await store.authenticatedFetch('/api/shop/card-effect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user.name, cardId: 'sys-overload' })
                });
                if (res.ok) {
                    await store.syncUserProfile();
                    await store.loadInitialData();
                    return { msg: 'SYSTEM OVERLOAD! Your clan lost 300 pts!', success: false };
                }
            } catch (e) { console.error(e); }
            return { msg: 'SYNC ERROR', success: false };
        }
    },
    {
        id: 'data-leak', name: 'DATA LEAK', type: 'bad',
        subtitle: 'ESPIONAGE BREACH',
        desc: 'A rival faction intercepts your data stream. Points leak to the enemy.',
        effect: '−200 PTS → RIVAL', effectDetail: 'Your clan loses 200 pts; a random rival gains them.',
        image: 'fuga_habilidad.png', rgb: '255, 0, 85',
        icon: 'fa-skull-crossbones',
        execute: async () => {
            const user = store.getState().currentUser;
            if (!user) return { msg: 'NO OPERATOR', success: false };
            try {
                const res = await store.authenticatedFetch('/api/shop/card-effect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user.name, cardId: 'data-leak' })
                });
                if (res.ok) {
                    await store.syncUserProfile();
                    await store.loadInitialData();
                    return { msg: 'DATA LEAK! −200 pts leaked to rival!', success: false };
                }
            } catch (e) { console.error(e); }
            return { msg: 'SYNC ERROR', success: false };
        }
    },
    {
        id: 'trojan', name: 'TROJAN INJECTION', type: 'bad',
        subtitle: 'ACCOUNT COMPROMISE',
        desc: 'Malware drains quantum credits from your personal account reserves.',
        effect: '−400 CREDITS', effectDetail: 'You lose 400 credits from your account.',
        image: 'inyectador_habilidad.png', rgb: '255, 120, 0',
        icon: 'fa-syringe',
        execute: async () => {
            const user = store.getState().currentUser;
            if (!user) return { msg: 'NO OPERATOR', success: false };
            try {
                const res = await store.authenticatedFetch('/api/shop/card-effect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user.name, cardId: 'trojan' })
                });
                if (res.ok) {
                    await store.syncUserProfile();
                    return { msg: 'TROJAN INJECTION! −400 CR drained!', success: false };
                }
            } catch (e) { console.error(e); }
            return { msg: 'SYNC ERROR', success: false };
        }
    },
    {
        id: 'corrupt-script', name: 'CORRUPTED SCRIPT', type: 'bad',
        subtitle: 'DOUBLE DAMAGE',
        desc: 'A corrupted execution damages both your credits and clan influence.',
        effect: '−150 PTS −100 CR', effectDetail: 'Your clan loses 150 pts and you lose 100 credits.',
        image: 'script_habilidad.png', rgb: '180, 0, 0',
        icon: 'fa-bug',
        execute: async () => {
            const user = store.getState().currentUser;
            if (!user) return { msg: 'NO OPERATOR', success: false };
            try {
                const res = await store.authenticatedFetch('/api/shop/card-effect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user.name, cardId: 'corrupt-script' })
                });
                if (res.ok) {
                    await store.syncUserProfile();
                    await store.loadInitialData();
                    return { msg: 'CORRUPTED SCRIPT! −150 clan pts −100 CR!', success: false };
                }
            } catch (e) { console.error(e); }
            return { msg: 'SYNC ERROR', success: false };
        }
    }
];

// ═══════════════════════════════════════════════
//  MAIN RENDER FUNCTION
// ═══════════════════════════════════════════════
export default function renderShop() {
    const container = document.createElement('div');
    container.className = 'shop-container fade-in';
    
    // Set initial active card if not set
    if (!activeCard) activeCard = NEXUS_CARDS[0];

    // STABLE CANVAS LAYER (Doesn't get wiped by render)
    const canvasLayer = document.createElement('div');
    canvasLayer.id = 'shop-3d-canvas';
    canvasLayer.style.cssText = 'position:absolute;inset:0;z-index:0;';
    container.appendChild(canvasLayer);

    function render() {
        const state = store.getState();
        const user = state.currentUser || { name: 'GUEST', clan: 'neutral', credits: 0, ownedCosmetics: [] };
        // Ensure properties exist on user
        const userName = (user.name || 'GUEST').toUpperCase();
        const userCredits = user.credits || 0;
        const userClan = user.clan || 'neutral';
        const clanData = (state.clans && state.clans[userClan]) || { name: 'Unknown', points: 0 };

        // Define content (excluding the canvas which is now stable)
        const contentHTML = `
            <!-- VIGNETTE OVERLAY -->
            <div style="position:absolute;inset:0;z-index:1;pointer-events:none;
                background:radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.85) 100%);"></div>

            <!-- SCANLINE TEXTURE -->
            <div style="position:absolute;inset:0;z-index:1;pointer-events:none;opacity:0.04;
                background:repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px);"></div>

            <!-- MAIN 3-PANEL LAYOUT -->
            <div class="shop-nexus-layout" style="position:relative;z-index:10;">

                <!-- ═══ LEFT PANEL: CARD GALLERY / BOUTIQUE ITEMS ═══ -->
                <div class="nexus-panel nexus-left-panel">
                    <div class="panel-header">
                        <i class="fa-solid ${shopMode === 'CARDS' ? 'fa-layer-group' : 'fa-shirt'}"></i> 
                        ${shopMode === 'CARDS' ? 'NEXUS ARSENAL' : 'COSMETIC VAULT'}
                    </div>
                    
                    <div class="card-gallery custom-scrollbar">
                        ${shopMode === 'CARDS' ? 
                            NEXUS_CARDS.map(card => `
                                <div class="gallery-card ${card.type}" data-card-id="${card.id}">
                                    <div class="gallery-card-img">
                                        <img src="/assets/img/rules/skills/${card.image}" alt="${card.name}" />
                                    </div>
                                    <div class="gallery-card-info">
                                        <span class="gallery-card-name">${card.name}</span>
                                        <span class="gallery-card-effect ${card.type}">${card.effect}</span>
                                    </div>
                                </div>
                            `).join('') 
                            : 
                            state.cosmetics.map(item => {
                                const isOwned = user.ownedCosmetics?.includes(item.id);
                                return `
                                <div class="boutique-item ${isOwned ? 'owned' : ''}" data-item-id="${item.id}" style="
                                    background: rgba(0,0,0,0.4);
                                    margin-bottom: 10px;
                                    padding: 10px;
                                    border: 1px solid rgba(255,255,255,0.05);
                                    border-radius: 8px;
                                    display: flex;
                                    gap: 12px;
                                    cursor: pointer;
                                    transition: all 0.2s;
                                    position: relative;
                                    overflow: hidden;
                                ">
                                    <div class="item-preview" style="
                                        width: 50px;
                                        height: 50px;
                                        background: ${item.color}22;
                                        border: 1px solid ${item.color}66;
                                        border-radius: 6px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        font-size: 1.2rem;
                                        color: ${item.color};
                                    ">
                                        <i class="fa-solid fa-palette"></i>
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="color: #fff; font-family: 'Rajdhani'; font-weight: 700; font-size: 0.9rem;">${item.name}</div>
                                        <div style="color: ${isOwned ? '#0f0' : '#888'}; font-family: 'Share Tech Mono'; font-size: 0.7rem;">
                                            ${isOwned ? '<i class="fa-solid fa-check-circle"></i> OWNED' : item.cost + ' CR'}
                                        </div>
                                    </div>
                                </div>
                            `}).join('')
                        }
                    </div>
                </div>

                <!-- ═══ CENTER: ROULETTE / BOUTIQUE ═══ -->
                <div class="nexus-center">
                    <!-- MODE TABS -->
                    <div class="nexus-tabs" style="display: flex; gap: 5px; margin-bottom: 20px;">
                        <button class="nexus-tab-btn ${shopMode === 'CARDS' ? 'active' : ''}" id="tab-cards" style="
                            flex: 1; padding: 12px; background: rgba(255,255,255,0.05); border: none; color: #555; font-family: 'Share Tech Mono'; cursor: pointer;
                        ">CARDS</button>
                        <button class="nexus-tab-btn ${shopMode === 'COSMETICS' ? 'active' : ''}" id="tab-cosmetics" style="
                            flex: 1; padding: 12px; background: rgba(255,255,255,0.05); border: none; color: #555; font-family: 'Share Tech Mono'; cursor: pointer;
                        ">BOUTIQUE</button>
                    </div>

                    ${shopMode === 'CARDS' ? `
                        <!-- ACTIVE CARD DISPLAY -->
                        <div class="nexus-active-card ${spinState === 'SPINNING' ? 'spinning-blur' : ''}" id="active-card-display">
                            <div class="active-card-inner" style="--card-rgb: ${activeCard.rgb};">
                                <div class="active-card-type-badge ${activeCard.type}">
                                    ${activeCard.type === 'good' ? '✦ REWARD' : '⚠ HAZARD'}
                                </div>
                                <div class="active-card-image">
                                    <img src="/assets/img/rules/skills/${activeCard.image}" alt="${activeCard.name}" />
                                </div>
                                <h2 class="active-card-title">${activeCard.name}</h2>
                                <p class="active-card-subtitle">${activeCard.subtitle}</p>
                                <div class="active-card-effect ${activeCard.type}">${activeCard.effect}</div>
                                <p class="active-card-desc">${activeCard.desc}</p>
                            </div>
                        </div>

                        <!-- RESULT OVERLAY -->
                        ${lastResult ? `
                        <div class="nexus-result-overlay ${lastResult.success ? 'result-good' : 'result-bad'}" id="result-overlay">
                            <div class="result-icon">${lastResult.success ? '✦' : '⚠'}</div>
                            <p class="result-msg">${lastResult.msg}</p>
                            <button class="result-dismiss" id="btn-dismiss">ACKNOWLEDGED</button>
                        </div>
                        ` : ''}

                        <!-- SPIN BUTTON -->
                        <div class="nexus-action-bar">
                            <button class="nexus-spin-btn ${spinState === 'SPINNING' ? 'btn-spinning' : ''}" id="btn-spin"
                                ${(spinState === 'SPINNING' || user.credits < 100) ? 'disabled' : ''}>
                                <span class="spin-btn-icon"><i class="fa-solid fa-atom"></i></span>
                                <span class="spin-btn-text">
                                    ${spinState === 'SPINNING' ? 'SYNTHESIZING...' : 'SPIN THE NEXUS — 100 CR'}
                                </span>
                            </button>
                        </div>
                    ` : `
                        <div class="boutique-main-display" style="
                            background: rgba(0,20,40,0.6);
                            border: 1px solid rgba(0,240,255,0.1);
                            border-radius: 12px;
                            padding: 40px;
                            min-height: 400px;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            text-align: center;
                        ">
                            <div id="item-purchase-area">
                                <i class="fa-solid fa-user-astronaut" style="font-size: 4rem; color: #00f3ff22; margin-bottom: 20px;"></i>
                                <h2 style="color: #fff; font-family: 'Rajdhani'; font-weight: 300;">PREMIUM CURATIONS</h2>
                                <p style="color: #666; font-family: 'Share Tech Mono';">SELECT AN OVERLAY FROM THE VAULT TO PREVIEW</p>
                            </div>
                        </div>
                    `}
                </div>

                <!-- ═══ RIGHT PANEL: CLAN INTEL ═══ -->
                <div class="nexus-panel nexus-right-panel">
                    <div class="panel-header"><i class="fa-solid fa-satellite-dish"></i> STATUS</div>
                    <div class="intel-section">
                        <div class="intel-label">OPERATOR</div>
                        <div class="intel-value">${userName}</div>
                    </div>
                    <div class="intel-section">
                        <div class="intel-label">QUANTUM CREDITS</div>
                        <div class="intel-value credits" style="color:#0f0; font-size:1.4rem;">${userCredits.toLocaleString()} CR</div>
                    </div>
                    <div class="intel-divider"></div>
                    <div class="intel-section">
                        <div class="intel-label">OWNED SKINS</div>
                        <div class="intel-value">${user.ownedCosmetics?.length || 0} ITEMS</div>
                    </div>
            </div>
        `;

        // Update UI layer without touching the canvas
        let uiLayer = container.querySelector('#shop-ui-layer');
        if (!uiLayer) {
            uiLayer = document.createElement('div');
            uiLayer.id = 'shop-ui-layer';
            uiLayer.style.cssText = 'position:relative; z-index:10;';
            container.appendChild(uiLayer);
        }
        uiLayer.innerHTML = contentHTML;

        attachEvents();

        // Init Three.js scene
        setTimeout(() => {
            const canvas = container.querySelector('#shop-3d-canvas');
            if (canvas && !shopScene) {
                shopScene = new ShopScene('shop-3d-canvas');
                console.log("[Shop] 3D Scene Initialized");
            }
        }, 50);
    }

    async function handleSpin() {
        const state = store.getState();
        const user = state.currentUser;
        if (!user || user.credits < 100 || spinState !== 'READY') return;

        // Charge spin cost (sync with DB - ATOMIC DELTA)
        try {
            await fetch('/api/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: user.name, 
                    updates: { 
                        creditsDelta: -100,
                        incrementSpins: true 
                    } 
                })
            });
            await store.syncUserProfile();
        } catch (e) { 
             alert("SYNC FAILED. CHECK LINK.");
             return;
        }

        lastResult = null;
        spinState = 'SPINNING';
        render();

        if (shopScene) shopScene.setSpinning(true);

        // Reset counters for every spin
        let cycleCount = 0;
        const maxCycles = 30 + Math.floor(Math.random() * 15);
        
        // ROULETTE REWARD LOGIC: Every 10th spin is a guaranteed GOOD card
        const currentSpins = user.total_spins || 0;
        const isGuaranteedReward = (currentSpins + 1) % 10 === 0;

        const runCycle = () => {
            cycleCount++;
            
            // Filter cards if it's a guaranteed reward
            let pool = NEXUS_CARDS;
            if (isGuaranteedReward && cycleCount > maxCycles * 0.8) {
                pool = NEXUS_CARDS.filter(c => c.type === 'good');
            }

            const rndCard = pool[Math.floor(Math.random() * pool.length)];
            activeCard = rndCard;

            // Update card display without full re-render
            const display = container.querySelector('#active-card-display');
            if (display) {
                const inner = display.querySelector('.active-card-inner');
                if (inner) inner.style.setProperty('--card-rgb', rndCard.rgb);
                const img = display.querySelector('.active-card-image img');
                if (img) img.src = `/assets/img/rules/skills/${rndCard.image}`;
                const title = display.querySelector('.active-card-title');
                if (title) title.textContent = rndCard.name;
                const subtitle = display.querySelector('.active-card-subtitle');
                if (subtitle) subtitle.textContent = rndCard.subtitle;
                const effect = display.querySelector('.active-card-effect');
                if (effect) {
                    effect.textContent = rndCard.effect;
                    effect.className = `active-card-effect ${rndCard.type}`;
                }
                const badge = display.querySelector('.active-card-type-badge');
                if (badge) {
                    badge.textContent = rndCard.type === 'good' ? '✦ REWARD' : '⚠ HAZARD';
                    badge.className = `active-card-type-badge ${rndCard.type}`;
                }
            }

            if (cycleCount < maxCycles) {
                const nextDelay = 80 + (cycleCount * 5); // Decelerate
                spinInterval = setTimeout(runCycle, nextDelay);
            } else {
                spinInterval = null;
                // Execute effect
                activeCard.execute().then(result => {
                    lastResult = result;
                    
                    // Add extra reward label if it was a 10th spin
                    if (isGuaranteedReward) {
                        lastResult.msg = "[10-SPIN BONUS] " + lastResult.msg;
                    }

                    spinState = 'READY';

                    const logUser = store.getState().currentUser;
                    const clanLabel = logUser ? (store.getState().clans[logUser.clan]?.name || logUser.clan).toUpperCase() : 'UNKNOWN';
                    const logType = activeCard.type === 'good' ? 'shop-good' : 'shop-bad';
                    store.logEvent(`⚡ ${clanLabel} drew ${activeCard.name} — ${activeCard.effect}`, logType);

                    if (shopScene) {
                        shopScene.setSpinning(false);
                        shopScene.setColor(activeCard.type === 'good' ? '#00ff88' : '#ff0055');
                    }

                    setTimeout(() => render(), 200);
                });

                setTimeout(() => {
                    if (shopScene) shopScene.setColor('#22d3ee');
                }, 3000);
            }
        };

        runCycle();
    }

    function attachEvents() {
        // Tab switching
        const tabCards = container.querySelector('#tab-cards');
        const tabCosmetics = container.querySelector('#tab-cosmetics');
        
        if (tabCards) tabCards.addEventListener('click', () => {
            shopMode = 'CARDS';
            render();
        });
        
        if (tabCosmetics) tabCosmetics.addEventListener('click', () => {
            shopMode = 'COSMETICS';
            render();
        });

        // Spin button (only in CARDS mode)
        const btnSpin = container.querySelector('#btn-spin');
        if (btnSpin) btnSpin.addEventListener('click', handleSpin);

        // Card gallery selection
        container.querySelectorAll('.gallery-card').forEach(card => {
            card.addEventListener('click', () => {
                if (spinState === 'SPINNING') return;
                const id = card.dataset.cardId;
                const found = NEXUS_CARDS.find(c => c.id === id);
                if (found) {
                    activeCard = found;
                    render();
                }
            });
        });

        // Boutique item selection
        container.querySelectorAll('.boutique-item').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.itemId;
                const item = store.getState().cosmetics.find(c => c.id === id);
                if (item) showItemPreview(item);
            });
        });

        // Result overlay dismiss
        const btnDismiss = container.querySelector('#btn-dismiss');
        if (btnDismiss) {
            btnDismiss.onclick = () => {
                lastResult = null;
                render();
            };
        }
    }

    function showItemPreview(item) {
        const area = container.querySelector('#item-purchase-area');
        if (!area) return;
        
        const user = store.getState().currentUser;
        const isOwned = user.ownedCosmetics?.includes(item.id);
        const iconMap = {
            'skin': 'fa-user-astronaut',
            'chat': 'fa-comments',
            'border': 'fa-square-full',
            'shield': 'fa-shield-halved'
        };

        area.innerHTML = `
            <div class="preview-card fade-in" style="
                border: 1px solid ${item.color}44;
                background: linear-gradient(135deg, ${item.color}11 0%, rgba(0,0,0,0.6) 100%);
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 0 50px ${item.color}22;
                max-width: 450px;
                margin: auto;
                position: relative;
                overflow: hidden;
            ">
                <div style="position:absolute; top: -10px; right: -10px; font-size: 8rem; color: ${item.color}08; pointer-events:none;">
                    <i class="fa-solid ${iconMap[item.type] || 'fa-palette'}"></i>
                </div>

                <div style="background: ${item.color}33; color: ${item.color}; border: 1px solid ${item.color}44;
                    padding: 5px 15px; border-radius: 30px; font-family: 'Share Tech Mono'; font-size: 0.75rem; display: inline-block; margin-bottom: 20px; font-weight: bold;">
                    PREMIUM ${item.type.toUpperCase()}
                </div>
                
                <h3 style="color:#fff; margin: 10px 0; font-family: 'Rajdhani'; font-size: 2.2rem; font-weight: 700; letter-spacing: 2px; text-shadow: 0 0 10px ${item.color}44;">
                    ${item.name}
                </h3>
                
                <p style="color:#aaa; font-family: 'Share Tech Mono'; font-size: 0.9rem; margin-bottom: 30px; line-height: 1.6;">
                    ENHANCE YOUR OPERATIVE PROFILE WITH THIS ${item.type.toUpperCase()} MODULE. 
                    PERMANENTLY UNLOCKS DECORATIVE ASSETS FOR YOUR INTERFACE.
                </p>
                
                <div style="margin-top: 30px;">
                    ${isOwned ? 
                        `<div style="color:${item.color}; font-weight:700; font-family:'Share Tech Mono'; font-size: 1.1rem; padding: 15px; border: 1px dashed ${item.color}66; border-radius: 10px;">
                            <i class="fa-solid fa-circle-check"></i> ACTIVE IN INVENTORY
                        </div>` :
                        `<button id="btn-buy-cosmetic" class="nexus-spin-btn" style="
                            background:${item.color}; border:none; width:100%; height:60px; font-size: 1.1rem; box-shadow: 0 10px 20px ${item.color}33;
                        ">
                            PURCHASE FOR ${item.cost} CR
                        </button>`
                    }
                </div>
            </div>
        `;

        const buyBtn = area.querySelector('#btn-buy-cosmetic');
        if (buyBtn) buyBtn.addEventListener('click', async () => {
            const success = await store.purchaseCosmetic(item);
            if (success) {
                store.logEvent(`🛍️ PURCHASED: ${item.name}`, 'info');
                render();
            } else {
                alert("INSUFFICIENT QUANTUM CREDITS.");
            }
        });
    }

    render();
    return container;
}
