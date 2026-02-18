export default function renderShop() {
    const container = document.createElement('div');
    container.className = 'cockpit-wrapper fade-in';

    container.innerHTML = `
        <!-- Cockpit Frame Overlay (Window Structure) -->
        <div class="cockpit-frame">
            <div class="frame-top"></div>
            <div class="frame-left"></div>
            <div class="frame-right"></div>
            <div class="frame-bottom"></div>
        </div>

        <!-- Background Overlay specific for immersion -->
        <div class="scan-lines"></div>

        <!-- Main Content (HUD) -->
        <div class="reward-hub-container">
            
            <!-- Left Console (Physical Panel) -->
            <div class="console-panel left-console" data-tilt data-tilt-max="2" data-tilt-speed="1000">
                <div class="console-screen">
                    <div class="console-header">SYSTEM DIAGNOSTICS</div>
                    <div class="console-grid">
                        <div class="console-stat">
                            <span class="label">ENERGY</span>
                            <div class="bar-container"><div class="bar-val anim-bar-1"></div></div>
                        </div>
                        <div class="console-stat">
                            <span class="label">SHIELD INTEGRITY</span>
                            <div class="bar-container"><div class="bar-val anim-bar-2" style="width: 85%; background: var(--primary-blue)"></div></div>
                        </div>
                        <div class="console-stat">
                            <span class="label">WARP DRIVE</span>
                            <div class="text-val blink-text">STANDBY</div>
                        </div>
                    </div>
                </div>
                <div class="console-buttons">
                    <div class="phys-btn red"></div>
                    <div class="phys-btn yellow"></div>
                    <div class="phys-btn blue"></div>
                </div>
            </div>

            <!-- Left HUD Panel (Floating) -->
            <div class="hud-panel left-panel floating-ui">
                <div class="panel-header">
                    <i class="fa-solid fa-microchip"></i> SYSTEM STATS
                </div>
                <!-- ... (mismos stats de antes) ... -->
                <div class="stat-row"><span class="stat-label">ENERGY</span><span class="stat-value text-neon-blue">21106</span></div>
                <div class="stat-row"><span class="stat-label">POINTS</span><span class="stat-value text-neon-green">2106</span></div>
                <div class="stat-row"><span class="stat-label warning">WARNING</span><span class="stat-value text-neon-red">10</span></div>
                <div class="stat-divider"></div>
                <div class="stat-row"><span class="stat-label">COOLDOWN</span><span class="stat-value">1h 59m</span></div>
            </div>

            <!-- Center Stage: The Core Projector -->
            <div class="center-stage">
                <div class="hologram-title" id="holo-title">BONUS BENEFITS</div>
                
                <div class="shield-core-container" id="shield-core">
                    <div class="energy-ring ring-outer"></div>
                    <div class="energy-ring ring-inner"></div>
                    
                    <!-- Lightning Arcs -> Ultra-Premium Effect -->
                    <div class="lightning-arc arc-1"></div>
                    <div class="lightning-arc arc-2"></div>
                    <div class="lightning-arc arc-3"></div>
                    
                    <div class="shield-emblem">
                        <i class="fa-solid fa-shield-halved"></i>
                    </div>
                    <div class="arc-text top">ACTIVATE SHIELD - 500 POINTS</div>
                    <div class="arc-text bottom">ACTIVATE SHIELD - 500 POINTS</div>
                </div>

                <!-- Physical Projector Base on the floor -->
                <div class="projector-base">
                    <div class="base-light"></div>
                    <div class="base-ring"></div>
                </div>

                <div class="core-footer floating-ui">
                    <div class="territory-label">TERRITORY SHIELD</div>
                    <div class="points-available-bar">
                        <div class="bar-fill" style="width: 75%"></div>
                        <span class="bar-text">POINTS AVAILABLE: 2106</span>
                    </div>
                    <button class="confirm-redemption-btn">
                        CONFIRM REDEMPTION
                    </button>
                </div>
            </div>

            <!-- Right Cards Cluster -->
            <div class="cards-cluster floating-ui">
                <!-- Card 1 -->
                <div class="hud-card" data-tilt>
                    <div class="card-glow"></div>
                    <div class="card-icon-area"><i class="fa-solid fa-burst fa-3x"></i><span class="xp-label">XP</span></div>
                    <div class="card-title">Double XP Nova</div>
                    <div class="card-cooldown">COOLDOWN: 5m</div>
                </div>
                <!-- Card 2 -->
                <div class="hud-card" data-tilt>
                    <div class="card-glow"></div>
                    <div class="card-icon-area"><i class="fa-solid fa-satellite fa-3x"></i></div>
                    <div class="card-title">Sabotage Satellite</div>
                    <div class="card-cooldown">COOLDOWN: 71m</div>
                </div>
                 <!-- Card 3 -->
                 <div class="hud-card" data-tilt>
                    <div class="card-glow"></div>
                    <div class="card-icon-area"><i class="fa-solid fa-rocket fa-3x"></i></div>
                    <div class="card-title">Warp Speed Boost</div>
                    <div class="card-cooldown">COOLDOWN: 5m</div>
                </div>
            </div>

            <!-- Right Console (Physical Panel) -->
            <div class="console-panel right-console" data-tilt data-tilt-max="2" data-tilt-speed="1000">
                <div class="console-screen radar-screen">
                    <div class="radar-circle">
                         <div class="radar-sweep"></div>
                         <div class="radar-dot dot-1"></div>
                         <div class="radar-dot dot-2"></div>
                    </div>
                    <div class="console-header small">SECTOR SCAN</div>
                </div>
                <div class="console-buttons">
                    <div class="phys-switch"></div>
                    <div class="phys-switch"></div>
                    <div class="phys-btn red"></div>
                </div>
            </div>

        </div>
    `;

    // --- ANIMATIONS & INTERACTIONS ---

    // 1. Initialize Tilt
    setTimeout(() => {
        if (typeof VanillaTilt !== 'undefined') {
            VanillaTilt.init(container.querySelectorAll("[data-tilt]"), {
                max: 10,
                speed: 400,
                glare: true,
                "max-glare": 0.3,
                scale: 1.02
            });
        }
    }, 100);

    // 2. GSAP Entrance Animations
    setTimeout(() => {
        if (typeof gsap !== 'undefined') {
            const tl = gsap.timeline();

            // Consoles slide up/in
            tl.from(container.querySelectorAll('.console-panel'), {
                y: 100,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: "power3.out"
            })
                // Projector base rises
                .from(container.querySelector('.projector-base'), {
                    scale: 0,
                    opacity: 0,
                    duration: 0.8,
                    ease: "back.out(1.7)"
                }, "-=0.5")
                // Shield Core expands
                .from(container.querySelector('#shield-core'), {
                    scale: 0,
                    opacity: 0,
                    rotation: -180,
                    duration: 1.2,
                    ease: "elastic.out(1, 0.5)"
                }, "-=0.3")
                // HUD UI floats in
                .from(container.querySelectorAll('.floating-ui'), {
                    y: 20,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "power2.out"
                }, "-=0.8");

            // Continuous animations for console bars
            if (container.querySelector('.anim-bar-1')) {
                gsap.to(container.querySelector('.anim-bar-1'), {
                    width: "90%",
                    duration: 2,
                    yoyo: true,
                    repeat: -1,
                    ease: "sine.inOut"
                });
            }
        }
    }, 200);

    return container;
}
