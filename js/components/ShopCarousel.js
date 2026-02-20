import { ShopScene } from './ShopScene.js';

export default function renderShop() {
    const container = document.createElement('div');
    container.className = 'cockpit-wrapper fade-in';

    // --- UI STRUCTURE (Holo-Grid Layout) ---
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
                <!-- Profile Summary -->
                <div class="holo-panel mini-profile">
                    <div class="panel-header">OPERATOR</div>
                    <div class="profile-row">
                        <div class="avatar-frame"><i class="fa-solid fa-user-astronaut"></i></div>
                        <div class="profile-info">
                            <div class="name">COMMANDER CODEMAN</div>
                            <div class="rank">LVL 42 | ELITE</div>
                        </div>
                    </div>
                    <div class="stat-bar-group">
                        <div class="stat-label">XP PROGRESS</div>
                        <div class="bar-track"><div class="bar-fill" style="width: 65%"></div></div>
                    </div>
                </div>

                <!-- Item Categories (Tabs) -->
                <div class="holo-tabs">
                    <button class="holo-tab active" data-cat="defensive">DEFENSE</button>
                    <button class="holo-tab" data-cat="utility">UTILITY</button>
                    <button class="holo-tab" data-cat="cosmetic">COSMETIC</button>
                </div>

                <!-- Item List (Scrollable Grid) -->
                <div class="holo-list-scroll">
                    <!-- Dynamic Items will be injected here, but hardcoded for visual flair now -->
                    <div class="holo-item-row selected">
                        <div class="item-icon"><i class="fa-solid fa-shield-halved"></i></div>
                        <div class="item-details">
                            <div class="item-name">ION SHIELD</div>
                            <div class="item-cost text-neon-blue">500 CR</div>
                        </div>
                        <div class="item-status">OWNED</div>
                    </div>
                    <div class="holo-item-row">
                        <div class="item-icon"><i class="fa-solid fa-ghost"></i></div>
                        <div class="item-details">
                            <div class="item-name">STEALTH CLOAK</div>
                            <div class="item-cost text-neon-yellow">1200 CR</div>
                        </div>
                        <div class="item-status">LOCKED</div>
                    </div>
                    <div class="holo-item-row">
                        <div class="item-icon"><i class="fa-solid fa-bolt"></i></div>
                        <div class="item-details">
                            <div class="item-name">OVERCLOCK KIT</div>
                            <div class="item-cost text-neon-yellow">800 CR</div>
                        </div>
                        <div class="item-status">LOCKED</div>
                    </div>
                    <div class="holo-item-row">
                        <div class="item-icon"><i class="fa-solid fa-database"></i></div>
                        <div class="item-details">
                            <div class="item-name">DATA SIPHON</div>
                            <div class="item-cost text-neon-yellow">1500 CR</div>
                        </div>
                        <div class="item-status">LOCKED</div>
                    </div>
                     <div class="holo-item-row">
                        <div class="item-icon"><i class="fa-solid fa-eye"></i></div>
                        <div class="item-details">
                            <div class="item-name">OMNI-SCANNER</div>
                            <div class="item-cost text-neon-yellow">2000 CR</div>
                        </div>
                        <div class="item-status">LOCKED</div>
                    </div>
                </div>
            </div>

            <!-- COLUMN 2: CENTER STAGE (3D View + Context) -->
            <div class="holo-column col-center" style="pointer-events: none;"> 
                <!-- Top Header -->
                <div class="hologram-header">
                    <h1 class="item-title-large">ION SHIELD GENERATOR</h1>
                    <div class="item-subtitle">CLASS IV DEFENSIVE MODULE</div>
                </div>

                <!-- 3D Area is transparent here, showing the scene behind -->
                
                <!-- Bottom Action Bar -->
                <div class="action-bar" style="pointer-events: auto;">
                    <button class="action-btn primary">
                        <span class="btn-text">EQUIP MODULE</span>
                        <span class="btn-glare"></span>
                    </button>
                     <div class="credit-readout">
                        <div class="label">CREDITS AVAILABLE</div>
                        <div class="value">2,106 <small>CR</small></div>
                    </div>
                </div>
            </div>

            <!-- COLUMN 3: TECH SPECS -->
            <div class="holo-column col-right">
                <div class="holo-panel specs-panel">
                    <div class="panel-header">TECHNICAL SPECIFICATIONS</div>
                    
                    <div class="spec-grid">
                        <div class="spec-item">
                            <div class="spec-label">ABSORPTION</div>
                            <div class="spec-val text-neon-green">85%</div>
                        </div>
                        <div class="spec-item">
                            <div class="spec-label">RECHARGE</div>
                            <div class="spec-val">4.2s</div>
                        </div>
                        <div class="spec-item">
                            <div class="spec-label">WEIGHT</div>
                            <div class="spec-val">12kg</div>
                        </div>
                         <div class="spec-item">
                            <div class="spec-label">ENERGY COST</div>
                            <div class="spec-val text-neon-red">HIGH</div>
                        </div>
                    </div>

                    <div class="panel-divider"></div>

                    <div class="description-box">
                        <p class="desc-text">
                            Generates a localized ionic field capable of dispersing directed energy weapons. 
                            Standard issue for frontline vanguards.
                        </p>
                    </div>

                    <div class="radar-widget">
                        <div class="radar-circle small">
                            <div class="radar-sweep"></div>
                        </div>
                        <div class="radar-text">LIVE FEED // SECURE</div>
                    </div>
                </div>
            </div>

        </div>
    `;

    // --- INITIALIZATION ---
    setTimeout(() => {
        // 1. Init 3D Scene
        const sceneContainer = container.querySelector('#shop-scene-container');
        if (sceneContainer) { // Ensure element exists
            if (typeof ShopScene !== 'undefined') {
                new ShopScene('shop-scene-container');
            }
        }

        // 2. Interactive List Logic (Fake for now)
        const rows = container.querySelectorAll('.holo-item-row');
        rows.forEach(row => {
            row.addEventListener('click', () => {
                rows.forEach(r => r.classList.remove('selected'));
                row.classList.add('selected');
                // Play click sound if we had one
            });

            // Hover sound setup (if SoundManager exists)
            row.addEventListener('mouseenter', () => {
                // SoundManager.play('hover');
            });
        });

        // 3. GSAP Entrance
        if (typeof gsap !== 'undefined') {
            const tl = gsap.timeline();

            // Sidebar comes in from left
            tl.from(container.querySelector('.col-left'), { x: -50, opacity: 0, duration: 0.6, ease: "power2.out" })
                // Specs come in from right
                .from(container.querySelector('.col-right'), { x: 50, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.4")
                // Title drops in
                .from(container.querySelector('.hologram-header'), { y: -30, opacity: 0, duration: 0.8 }, "-=0.4")
                // Action bar rises
                .from(container.querySelector('.action-bar'), { y: 30, opacity: 0, duration: 0.8 }, "-=0.6");
        }
    }, 100);

    return container;
}
