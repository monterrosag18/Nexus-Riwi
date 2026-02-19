import { ShopScene } from './ShopScene.js';

export default function renderShopCarousel() {
    const container = document.createElement('div');
    container.className = 'shop-overlay-container fade-in';

    // HTML Structure - High Fidelity Implementation
    container.innerHTML = `
        <!-- 3D BACKGROUND LAYER (THREE.JS) -->
        <div id="shop-3d-bg" style="position: absolute; inset: 0; z-index: 0;"></div>

        <!-- POST-PROC EFFECTS -->
        <div class="scan-lines"></div>
        <div class="vignette-overlay"></div>
        <div class="chromatic-aberration"></div>

        <!-- HUD FRAME -->
        <div class="hud-frame-top">
            <div class="hud-line-left"></div>
            <div class="nexus-header-text">NEXUS ARMORY</div>
            <div class="hud-line-right"></div>
        </div>

        <div class="hud-frame-sides">
            <div class="side-bar left"></div>
            <div class="side-bar right"></div>
        </div>

        <!-- 3D CAROUSEL CONTAINER -->
        <div class="carousel-stage" style="z-index: 10;">
            <div class="swiper mySwiper">
                <div class="swiper-wrapper">
                    
                    <!-- CARD 1: XP BOOSTER (Energy Fracture) -->
                    <div class="swiper-slide">
                        <div class="holo-card neon-cyan" data-tilt data-tilt-glare data-tilt-max-glare="0.8">
                            <div class="card-frame"></div>
                            <div class="card-corner top-left"></div>
                            <div class="card-corner top-right"></div>
                            <div class="card-corner bottom-left"></div>
                            <div class="card-corner bottom-right"></div>
                            
                            <div class="card-inner">
                                <div class="holo-icon svg-icon">
                                    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M50 5 L55 40 L90 40 L45 95 L50 60 L10 60 Z" stroke-linejoin="round" fill="rgba(0,255,255,0.1)"/>
                                        <circle cx="50" cy="50" r="45" stroke-dasharray="10 5" opacity="0.5"/>
                                        <path d="M50 10 L50 90" stroke-width="0.5" opacity="0.3"/>
                                        <path d="M10 50 L90 50" stroke-width="0.5" opacity="0.3"/>
                                    </svg>
                                </div>
                                <h3 class="holo-title">XP BOOSTER</h3>
                                <div class="holo-stat">2x POINTS</div>
                                <div class="holo-scanline"></div>
                            </div>
                        </div>
                        <div class="price-plate">500 CR</div>
                    </div>

                    <!-- CARD 2: PLASMA RIFLE (Weapon Schematic) -->
                    <div class="swiper-slide">
                        <div class="holo-card neon-blue" data-tilt data-tilt-glare data-tilt-max-glare="0.5">
                            <div class="card-frame"></div>
                            <div class="card-corner top-left"></div>
                            <div class="card-corner top-right"></div>
                            <div class="card-corner bottom-left"></div>
                            <div class="card-corner bottom-right"></div>

                            <div class="card-inner">
                                <div class="holo-icon svg-icon">
                                    <svg viewBox="0 0 100 60" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M10 20 L30 20 L35 10 L70 10 L80 20 L95 20 L95 30 L80 30 L75 40 L30 40 L25 50 L10 50 Z" fill="rgba(0,136,255,0.1)"/>
                                        <rect x="40" y="25" width="30" height="5" fill="currentColor" opacity="0.5"/>
                                        <line x1="35" y1="20" x2="35" y2="40" stroke-width="1"/>
                                        <circle cx="85" cy="25" r="3"/>
                                    </svg>
                                </div>
                                <h3 class="holo-title">PLASMA RIFLE</h3>
                                <div class="holo-stat">DMG +50</div>
                            </div>
                        </div>
                        <div class="price-plate">1200 CR</div>
                    </div>

                    <!-- CARD 3: STEALTH MODULE (Chip Circuit) -->
                    <div class="swiper-slide">
                        <div class="holo-card neon-green" data-tilt data-tilt-glare data-tilt-max-glare="0.5">
                            <div class="card-frame"></div>
                            <div class="card-corner top-left"></div>
                            <div class="card-corner top-right"></div>
                            <div class="card-corner bottom-left"></div>
                            <div class="card-corner bottom-right"></div>

                            <div class="card-inner">
                                <div class="holo-icon svg-icon">
                                    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="20" y="20" width="60" height="60" rx="5" fill="rgba(0,255,136,0.1)"/>
                                        <path d="M20 30 H10 M20 40 H10 M20 60 H10 M20 70 H10" stroke-linecap="round"/>
                                        <path d="M80 30 H90 M80 40 H90 M80 60 H90 M80 70 H90" stroke-linecap="round"/>
                                        <path d="M30 20 V10 M40 20 V10 M60 20 V10 M70 20 V10" stroke-linecap="round"/>
                                        <rect x="35" y="35" width="30" height="30" stroke-width="1"/>
                                        <circle cx="50" cy="50" r="5" fill="currentColor"/>
                                    </svg>
                                </div>
                                <h3 class="holo-title">STEALTH MOD</h3>
                                <div class="holo-stat">VISIBILITY -40%</div>
                            </div>
                        </div>
                        <div class="price-plate">800 CR</div>
                    </div>

                    <!-- CARD 4: SHIELD GENERATOR (Geodesic Orb) -->
                    <div class="swiper-slide">
                        <div class="holo-card neon-orange" data-tilt data-tilt-glare data-tilt-max-glare="0.5">
                            <div class="card-frame"></div>
                            <div class="card-corner top-left"></div>
                            <div class="card-corner top-right"></div>
                            <div class="card-corner bottom-left"></div>
                            <div class="card-corner bottom-right"></div>

                            <div class="card-inner">
                                <div class="holo-icon svg-icon">
                                    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="50" cy="50" r="40" stroke-opacity="0.3"/>
                                        <path d="M50 10 Q90 50 50 90 Q10 50 50 10" fill="rgba(255,170,0,0.1)"/>
                                        <ellipse cx="50" cy="50" rx="40" ry="15" stroke-dasharray="5 5"/>
                                        <path d="M20 30 L80 70 M80 30 L20 70" stroke-opacity="0.5"/>
                                    </svg>
                                </div>
                                <h3 class="holo-title">AEGIS SHIELD</h3>
                                <div class="holo-stat">DEFENSE +100</div>
                            </div>
                        </div>
                        <div class="price-plate">2000 CR</div>
                    </div>

                </div>
            </div>
            <!-- Note: Pedestal rendered in 3D scene -->
        </div>
        
        <!-- BOTTOM NAVIGATION (Simplified) -->
        <div class="hud-nav-bottom">
            <button class="nav-btn active"><i class="fa-solid fa-cart-shopping"></i> STORE</button>
        </div>

        <button id="btn-close-shop" class="btn-close-hex"><i class="fa-solid fa-xmark"></i></button>
    `;

    // Initialize logic after append
    setTimeout(() => {
        // 1. Init 3D Background
        new ShopScene('shop-3d-bg');

        // 2. Swiper Init
        const swiper = new Swiper(".mySwiper", {
            effect: "coverflow",
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: "auto",
            coverflowEffect: {
                rotate: 0,
                stretch: 0,
                depth: 300,
                modifier: 1,
                slideShadows: false,
            },
            keyboard: { enabled: true },
            loop: true
        });

        // 3. Tilt Init
        VanillaTilt.init(document.querySelectorAll(".holo-card"), {
            max: 15,
            speed: 400,
            glare: true,
            "max-glare": 0.5,
            scale: 1.05
        });

        // 4. Close Handler
        document.getElementById('btn-close-shop').addEventListener('click', () => {
            container.classList.add('fade-out');
            setTimeout(() => {
                window.location.hash = '#map';
            }, 500);
        });

    }, 100);

    return container;
}
