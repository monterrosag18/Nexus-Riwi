import { store } from '../store.js';
import { ShopScene } from './ShopScene.js';

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
        execute: () => {
            const user = store.getState().currentUser;
            if (user) { user.credits += 500; store.setUser(user); }
            return { msg: 'ION SHIELD activated! +500 CR deposited.', success: true };
        }
    },
    {
        id: 'neural-patch', name: 'NEURAL PATCH', type: 'good',
        subtitle: 'CLAN BOOST MODULE',
        desc: 'A neural uplink patch that feeds raw influence data directly to your faction.',
        effect: '+200 CLAN PTS', effectDetail: 'Your clan gains 200 influence points.',
        image: 'parche_habilidad.png', rgb: '0, 255, 136',
        icon: 'fa-microchip',
        execute: () => {
            const user = store.getState().currentUser;
            if (user) store.addPoints(user.clan, 200);
            return { msg: 'NEURAL PATCH deployed! +200 pts to your clan.', success: true };
        }
    },
    {
        id: 'xp-elixir', name: 'XP ELIXIR', type: 'good',
        subtitle: 'EXPERIENCE CATALYST',
        desc: 'Rare quantum elixir that amplifies clan experience output for a limited window.',
        effect: '+300 CLAN PTS', effectDetail: 'Your clan surges with 300 bonus points.',
        image: 'pocion_habilidad.png', rgb: '170, 0, 255',
        icon: 'fa-flask',
        execute: () => {
            const user = store.getState().currentUser;
            if (user) store.addPoints(user.clan, 300);
            return { msg: 'XP ELIXIR consumed! +300 pts to your clan!', success: true };
        }
    },
    {
        id: 'data-scroll', name: 'DATA SCROLL', type: 'good',
        subtitle: 'HYBRID REWARD',
        desc: 'Ancient encrypted scroll containing both credits and influence data fragments.',
        effect: '+150 PTS +200 CR', effectDetail: 'Your clan gains 150 pts and you gain 200 credits.',
        image: 'pergamino_habilidad.png', rgb: '255, 215, 0',
        icon: 'fa-scroll',
        execute: () => {
            const user = store.getState().currentUser;
            if (user) {
                store.addPoints(user.clan, 150);
                user.credits += 200;
                store.setUser(user);
            }
            return { msg: 'DATA SCROLL decoded! +150 clan pts +200 CR!', success: true };
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
        execute: () => {
            const user = store.getState().currentUser;
            if (user) store.addPoints(user.clan, -300);
            return { msg: 'SYSTEM OVERLOAD! Your clan lost 300 pts!', success: false };
        }
    },
    {
        id: 'data-leak', name: 'DATA LEAK', type: 'bad',
        subtitle: 'ESPIONAGE BREACH',
        desc: 'A rival faction intercepts your data stream. Points leak to the enemy.',
        effect: '−200 PTS → RIVAL', effectDetail: 'Your clan loses 200 pts; a random rival gains them.',
        image: 'fuga_habilidad.png', rgb: '255, 0, 85',
        icon: 'fa-skull-crossbones',
        execute: () => {
            const state = store.getState();
            const user = state.currentUser;
            if (!user) return { msg: 'NO OPERATOR', success: false };
            const rivals = Object.keys(state.clans).filter(k => k !== user.clan);
            if (rivals.length > 0) {
                const target = rivals[Math.floor(Math.random() * rivals.length)];
                store.addPoints(user.clan, -200);
                store.addPoints(target, 200);
                const rivalName = state.clans[target]?.name || target;
                return { msg: `DATA LEAK! −200 pts leaked to ${rivalName.toUpperCase()}!`, success: false };
            }
            store.addPoints(user.clan, -200);
            return { msg: 'DATA LEAK! Your clan lost 200 pts!', success: false };
        }
    },
    {
        id: 'trojan', name: 'TROJAN INJECTION', type: 'bad',
        subtitle: 'ACCOUNT COMPROMISE',
        desc: 'Malware drains quantum credits from your personal account reserves.',
        effect: '−400 CREDITS', effectDetail: 'You lose 400 credits from your account.',
        image: 'inyectador_habilidad.png', rgb: '255, 120, 0',
        icon: 'fa-syringe',
        execute: () => {
            const user = store.getState().currentUser;
            if (user) {
                user.credits = Math.max(0, user.credits - 400);
                store.setUser(user);
            }
            return { msg: 'TROJAN INJECTION! −400 CR drained!', success: false };
        }
    },
    {
        id: 'corrupt-script', name: 'CORRUPTED SCRIPT', type: 'bad',
        subtitle: 'DOUBLE DAMAGE',
        desc: 'A corrupted execution damages both your credits and clan influence.',
        effect: '−150 PTS −100 CR', effectDetail: 'Your clan loses 150 pts and you lose 100 credits.',
        image: 'script_habilidad.png', rgb: '180, 0, 0',
        icon: 'fa-bug',
        execute: () => {
            const user = store.getState().currentUser;
            if (user) {
                store.addPoints(user.clan, -150);
                user.credits = Math.max(0, user.credits - 100);
                store.setUser(user);
            }
            return { msg: 'CORRUPTED SCRIPT! −150 clan pts −100 CR!', success: false };
        }
    }
];

// ═══════════════════════════════════════════════
//  MAIN RENDER FUNCTION
// ═══════════════════════════════════════════════
export default function renderShop() {
    const container = document.createElement('div');
    container.className = 'cockpit-wrapper fade-in';

    let activeCard = NEXUS_CARDS[0];
    let shopScene = null;
    let spinState = 'READY'; // READY -> SPINNING -> RESULT
    let spinInterval = null;
    let lastResult = null;

    function render() {
        const state = store.getState();
        const user = state.currentUser || { name: 'GUEST', clan: 'neutral', credits: 0 };
        const clanData = state.clans[user.clan] || { name: 'Unknown', points: 0 };

        container.innerHTML = `
            <!-- THREE.JS CANVAS LAYER -->
            <div id="shop-3d-canvas" style="position:absolute;inset:0;z-index:0;"></div>

            <!-- VIGNETTE OVERLAY -->
            <div style="position:absolute;inset:0;z-index:1;pointer-events:none;
                background:radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.85) 100%);"></div>

            <!-- SCANLINE TEXTURE -->
            <div style="position:absolute;inset:0;z-index:1;pointer-events:none;opacity:0.04;
                background:repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px);"></div>

            <!-- MAIN 3-PANEL LAYOUT -->
            <div class="shop-nexus-layout" style="position:relative;z-index:10;">

                <!-- ═══ LEFT PANEL: CARD GALLERY ═══ -->
                <div class="nexus-panel nexus-left-panel">
                    <div class="panel-header">
                        <i class="fa-solid fa-layer-group"></i> NEXUS ARSENAL
                    </div>
                    <div class="card-gallery">
                        ${NEXUS_CARDS.map(card => `
                            <div class="gallery-card ${card.type}" data-card-id="${card.id}">
                                <div class="gallery-card-img">
                                    <img src="./assets/img/rules/skills/${card.image}" alt="${card.name}" />
                                </div>
                                <div class="gallery-card-info">
                                    <span class="gallery-card-name">${card.name}</span>
                                    <span class="gallery-card-effect ${card.type}">${card.effect}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- ═══ CENTER: ROULETTE ═══ -->
                <div class="nexus-center">
                    <!-- ACTIVE CARD DISPLAY -->
                    <div class="nexus-active-card ${spinState === 'SPINNING' ? 'spinning-blur' : ''}" id="active-card-display">
                        <div class="active-card-inner" style="--card-rgb: ${activeCard.rgb};">
                            <div class="active-card-type-badge ${activeCard.type}">
                                ${activeCard.type === 'good' ? '✦ REWARD' : '⚠ HAZARD'}
                            </div>
                            <div class="active-card-image">
                                <img src="./assets/img/rules/skills/${activeCard.image}" alt="${activeCard.name}" />
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
                </div>

                <!-- ═══ RIGHT PANEL: CLAN INTEL ═══ -->
                <div class="nexus-panel nexus-right-panel">
                    <div class="panel-header">
                        <i class="fa-solid fa-satellite-dish"></i> CLAN INTEL
                    </div>

                    <div class="intel-section">
                        <div class="intel-label">COMMANDER</div>
                        <div class="intel-value">${user.name.toUpperCase()}</div>
                    </div>

                    <div class="intel-section">
                        <div class="intel-label">FACTION</div>
                        <div class="intel-value clan-name">${clanData.name.toUpperCase()}</div>
                    </div>

                    <div class="intel-section">
                        <div class="intel-label">CLAN INFLUENCE</div>
                        <div class="intel-value points">${(clanData.points || 0).toLocaleString()} PTS</div>
                    </div>

                    <div class="intel-section">
                        <div class="intel-label">QUANTUM CREDITS</div>
                        <div class="intel-value credits">${user.credits.toLocaleString()} CR</div>
                    </div>

                    <div class="intel-divider"></div>

                    <div class="intel-warning">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <span>TACTICAL ADVISORY: Consult your clan before engaging the Nexus Roulette. 50% chance of hazard cards.</span>
                    </div>

                    <div class="intel-odds">
                        <div class="odds-row good">
                            <span class="odds-label">REWARD ODDS</span>
                            <span class="odds-value">50%</span>
                        </div>
                        <div class="odds-row bad">
                            <span class="odds-label">HAZARD ODDS</span>
                            <span class="odds-value">50%</span>
                        </div>
                    </div>

                    ${lastResult ? `
                    <div class="intel-divider"></div>
                    <div class="intel-section">
                        <div class="intel-label">LAST OUTCOME</div>
                        <div class="intel-value ${lastResult.success ? 'result-good-text' : 'result-bad-text'}">
                            ${lastResult.msg}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        attachEvents();

        // Init Three.js scene
        setTimeout(() => {
            const canvas = container.querySelector('#shop-3d-canvas');
            if (canvas && !shopScene) {
                shopScene = new ShopScene('shop-3d-canvas');
            }
        }, 100);
    }

    function attachEvents() {
        // Spin button
        const btnSpin = container.querySelector('#btn-spin');
        if (btnSpin) {
            btnSpin.addEventListener('click', () => {
                const user = store.getState().currentUser;
                if (!user || user.credits < 100 || spinState !== 'READY') return;

                // Charge spin cost
                user.credits -= 100;
                store.setUser(user);
                lastResult = null;
                spinState = 'SPINNING';
                render();

                if (shopScene) shopScene.setSpinning(true);

                // Rapid card cycling
                let cycleCount = 0;
                const maxCycles = 30 + Math.floor(Math.random() * 15);
                spinInterval = setInterval(() => {
                    cycleCount++;
                    const rndCard = NEXUS_CARDS[Math.floor(Math.random() * NEXUS_CARDS.length)];
                    activeCard = rndCard;

                    // Update card display without full re-render
                    const display = container.querySelector('#active-card-display');
                    if (display) {
                        const inner = display.querySelector('.active-card-inner');
                        if (inner) inner.style.setProperty('--card-rgb', rndCard.rgb);
                        const img = display.querySelector('.active-card-image img');
                        if (img) img.src = `./assets/img/rules/skills/${rndCard.image}`;
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

                    // Slow down near end
                    if (cycleCount >= maxCycles) {
                        clearInterval(spinInterval);
                        spinInterval = null;

                        // Execute effect
                        lastResult = activeCard.execute();
                        spinState = 'READY';

                        // Log to event feed for News Ticker
                        const logUser = store.getState().currentUser;
                        const clanLabel = logUser ? (store.getState().clans[logUser.clan]?.name || logUser.clan).toUpperCase() : 'UNKNOWN';
                        const logType = activeCard.type === 'good' ? 'shop-good' : 'shop-bad';
                        store.logEvent(`⚡ ${clanLabel} drew ${activeCard.name} — ${activeCard.effect}`, logType);

                        if (shopScene) {
                            shopScene.setSpinning(false);
                            shopScene.setColor(activeCard.type === 'good' ? '#00ff88' : '#ff0055');
                        }

                        // Full re-render to show result
                        setTimeout(() => render(), 200);

                        // Reset Three.js color after a while
                        setTimeout(() => {
                            if (shopScene) shopScene.setColor('#22d3ee');
                        }, 3000);
                    }
                }, 80 + cycleCount * 4); // Gradually slows down
            });
        }

        // Dismiss result
        const btnDismiss = container.querySelector('#btn-dismiss');
        if (btnDismiss) {
            btnDismiss.addEventListener('click', () => {
                lastResult = null;
                render();
            });
        }

        // Gallery card hover
        container.querySelectorAll('.gallery-card').forEach(card => {
            card.addEventListener('click', () => {
                if (spinState === 'SPINNING') return;
                const id = card.dataset.cardId;
                const found = NEXUS_CARDS.find(c => c.id === id);
                if (found) {
                    activeCard = found;
                    if (shopScene) shopScene.setColor(`rgb(${found.rgb})`);
                    render();
                }
            });
        });
    }

    render();
    return container;
}
