import { store } from '../store.js';

export default function renderFieldManual() {
    const container = document.createElement('div');
    container.className = 'manual-view fade-in shared-theme';
    
    container.innerHTML = `
        <div class="space-bg" aria-hidden="true">
            <canvas id="manual-starfield"></canvas>
            <div class="space-glow"></div>
            <div class="space-nebula-left"></div>
            <div class="space-vignette"></div>
        </div>
        
        <div class="page-content relative">
            <!-- Scanline Overlay -->
            <div class="fixed inset-0 scanline opacity-10 pointer-events-none"></div>

            <!-- MAIN CONTENT -->
            <main class="relative px-6 py-12 max-w-6xl mx-auto">
                <!-- HERO SECTION -->
                <div class="text-center mb-16 relative mt-8">
                    <div class="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/10 blur-3xl rounded-full"></div>
                    <h1 class="text-4xl md:text-6xl font-black text-slate-100 tracking-tighter uppercase mb-4 relative inline-block rgb-split glitch-title" data-text="Protocol Decrypted: Field Manual">
                    Protocol Decrypted: <span class="text-primary italic">Field Manual</span>
                    </h1>
                    <p class="text-slate-400 font-mono text-sm max-w-2xl mx-auto border-y border-primary/10 py-2">
                    // SYSTEM STATUS: AUTHORIZED ACCESS // ESTABLISHING CLAN DATA FEED...
                    </p>
                </div>

                <!-- CARDS GRID (3x2) -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    <!-- Card 1: The Clans -->
                    <div class="card group relative bg-slate-900 p-6 rounded-xl !bg-transparent glitch-card" data-text="THECLANS">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                <span class="material-symbols-outlined text-3xl">groups_3</span>
                            </div>
                            <h3 class="text-xl font-bold uppercase tracking-tight">The 5 Clans</h3>
                        </div>
                        <div class="w-full h-40 bg-slate-800 rounded-lg mb-4 overflow-hidden relative">
                            <img src="./assets/img/manual/clans.png" alt="Imagen de los 5 clanes" class="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform glitch-img" loading="lazy" />
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                        </div>
                        <p class="text-slate-400 text-sm leading-relaxed">
                            Battle for glory between the 5 official factions: Turing, Tesla, Hamilton, McCarthy, and Thompson. Coordinate with your brothers to dominate the grid.
                        </p>
                    </div>

                    <!-- Card 2: Territory Conquest -->
                    <div class="card group relative bg-slate-900 p-6 rounded-xl !bg-transparent glitch-card" data-text="HEX-TERRITORY">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-12 h-12 bg-cyan-500/10 text-cyan-500 rounded-lg flex items-center justify-center">
                                <span class="material-symbols-outlined text-3xl">hexagon</span>
                            </div>
                            <h3 class="text-xl font-bold uppercase tracking-tight">Hex-Territory</h3>
                        </div>
                        <div class="w-full h-40 bg-slate-800 rounded-lg mb-4 overflow-hidden relative">
                            <img src="./assets/img/manual/map.png" alt="Imagen del mapa de los clanes" class="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform glitch-img" loading="lazy" />
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                        </div>
                        <p class="text-slate-400 text-sm leading-relaxed">
                            Conquer sectors using axial movement. You can only invade hexes adjacent to your current territory or starting base. Expand your influence!
                        </p>
                        <a class="shop-button" href="#map">ACCESS MAP</a>
                    </div>

                    <!-- Card 3: Points & Scoring -->
                    <div class="card group relative bg-slate-900 p-6 rounded-xl !bg-transparent glitch-card" data-text="PASSIVE YIELD">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-lg flex items-center justify-center">
                                <span class="material-symbols-outlined text-3xl">monitoring</span>
                            </div>
                            <h3 class="text-xl font-bold uppercase tracking-tight">Passive Yield</h3>
                        </div>
                        <div class="w-full h-40 bg-slate-800 rounded-lg mb-4 overflow-hidden relative">
                            <img class="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform glitch-img" src="./assets/img/manual/yield.png" loading="lazy" />
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                        </div>
                        <p class="text-slate-400 text-sm leading-relaxed">
                            Holding territory generates Credits (CR) and Clan Points. The more sectors you control at the end of the hour, the higher your yield for internal upgrades.
                        </p>
                    </div>

                    <!-- Card 4: The Tech Shop -->
                    <div class="card group relative bg-slate-900 p-6 rounded-xl !bg-transparent glitch-card" data-text="Tech Shop">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-lg flex items-center justify-center">
                                <span class="material-symbols-outlined text-3xl">shopping_cart</span>
                            </div>
                            <h3 class="text-xl font-bold uppercase tracking-tight">The Boutique</h3>
                        </div>
                        <div class="w-full h-40 bg-slate-800 rounded-lg mb-4 overflow-hidden relative">
                            <img src="./assets/img/manual/shop.png" alt="Imagen de los poderes" class="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform glitch-img" loading="lazy" />
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                        </div>
                        <p class="text-slate-400 text-sm leading-relaxed">
                            Unlocks cosmetic enhancements, neural patches, and tactical modules. Use the Roulette to obtain rare cards or purchase items from the premium vault.
                        </p>
                        <a class="shop-button" href="#shop">GO TO SHOP</a>
                    </div>

                    <!-- Card 5: Inactivity Decay -->
                    <div class="card group relative bg-slate-900 p-6 rounded-xl overflow-hidden !bg-transparent glitch-card" data-text="DECAY SYSTEM">
                        <div class="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest -rotate-45 translate-x-4 translate-y-2" style="z-index: 20;">Warning</div>
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-12 h-12 bg-primary/20 text-primary rounded-lg flex items-center justify-center animate-pulse">
                                <span class="material-symbols-outlined text-3xl">warning</span>
                            </div>
                            <h3 class="text-xl font-bold uppercase tracking-tight">Decay System</h3>
                        </div>
                        <div class="w-full h-40 bg-slate-800 rounded-lg mb-4 overflow-hidden relative">
                            <img src="./assets/img/manual/decay.png" alt="Imagen de ausencia" class="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform glitch-img" loading="lazy" />
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                        </div>
                        <p class="text-slate-400 text-sm leading-relaxed">
                            <span class="text-primary font-bold">WARNING:</span> If a sector is left undefended for long periods, its defensive integrity drops, making it open for hostile takeover without shields.
                        </p>
                    </div>

                    <!-- Card 6: Mission Types -->
                    <div class="card group relative bg-slate-900 p-6 rounded-xl !bg-transparent glitch-card" data-text="MISSIONS">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
                                <span class="material-symbols-outlined text-3xl">task_alt</span>
                            </div>
                            <h3 class="text-xl font-bold uppercase tracking-tight">Neural Quizzes</h3>
                        </div>
                        <div class="w-full h-40 bg-slate-800 rounded-lg mb-4 overflow-hidden relative">
                            <img src="./assets/img/manual/missions.png" alt="Imagen de conquista" class="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform glitch-img" loading="lazy" />
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                        </div>
                        <p class="text-slate-400 text-sm leading-relaxed">
                            <span class="text-emerald-500 font-bold uppercase">Main Node</span>. Solve algorithmic challenges, English tests, and soft-skill assessments to claim neutral or enemy sectors.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    `;

    // Initialize logic after returning the component
    setTimeout(() => {
        initManualBackground(container);
        initGlitchEffects(container);
    }, 100);

    return container;
}

function initManualBackground(container) {
    const canvas = container.querySelector('#manual-starfield');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    let particles = [];
    let lastTime = 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const createParticles = () => {
        const count = Math.max(240, Math.min(720, Math.floor((width * height) / 3200)));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.0 + 0.4,
            alpha: Math.random() * 0.7 + 0.2,
            twinkle: Math.random() * 1.8 + 0.6,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.03 + 0.006,
            drift: (Math.random() - 0.5) * 0.015
        }));
    };

    const resize = () => {
        width = container.clientWidth || window.innerWidth;
        height = container.clientHeight || window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        createParticles();
    };

    const renderStars = (now) => {
        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'lighter';

        particles.forEach((particle) => {
            const pulse = (Math.sin(now * 0.0018 * particle.twinkle + particle.phase) + 1) / 2;
            const twinkle = 0.15 + Math.pow(pulse, 1.7) * 0.85;
            ctx.beginPath();
            ctx.fillStyle = `rgba(220, 240, 255, ${particle.alpha * twinkle})`;
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalCompositeOperation = 'source-over';
    };

    let animationFrame;
    const draw = (time) => {
        // Stop if container is removed from DOM
        if (!container.parentElement) return;

        if (prefersReducedMotion) {
            renderStars(time || 0);
            return;
        }

        const now = time || 0;
        const delta = (now - lastTime) / 1000;
        lastTime = now;

        particles.forEach((particle) => {
            particle.y += particle.speed * (delta * 60);
            particle.x += particle.drift * (delta * 60);

            if (particle.y > height + 4) particle.y = -4;
            if (particle.x < -4) particle.x = width + 4;
            if (particle.x > width + 4) particle.x = -4;
        });

        renderStars(now);
        animationFrame = requestAnimationFrame(draw);
    };

    resize();
    animationFrame = requestAnimationFrame(draw);

    window.addEventListener('resize', resize);
    
    // Cleanup reference if needed (Vanilla SPA)
    container._cleanup = () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationFrame);
    };
}

function initGlitchEffects(container) {
    const cards = Array.from(container.querySelectorAll('.card'));
    if (cards.length === 0) return;

    cards.forEach((card) => {
        const randomDelay = (Math.random() * 3).toFixed(2);
        card.style.setProperty('--glitch-delay', `${randomDelay}s`);
        card.style.setProperty('--glitch-duration', '3s');
    });

    const glitchTitle = container.querySelector('.glitch-title');
    if (glitchTitle) {
        setInterval(() => {
            if (!container.parentElement) return;
            glitchTitle.classList.remove('active-glitch');
            setTimeout(() => {
                glitchTitle.classList.add('active-glitch');
            }, 10);
        }, 3000);
    }

    cards.forEach((card) => {
        const randomDelay = Math.random() * 3000 + 2000;
        const randomInterval = Math.random() * 3000 + 3000;

        setTimeout(() => {
            if (!container.parentElement) return;
            card.classList.add('active-glitch-border');
            setTimeout(() => {
                card.classList.remove('active-glitch-border');
            }, 600);

            setInterval(() => {
                if (!container.parentElement) return;
                card.classList.add('active-glitch-border');
                setTimeout(() => {
                    card.classList.remove('active-glitch-border');
                }, 600);
            }, randomInterval);
        }, randomDelay);
    });

    cards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
            cards.forEach((otherCard) => {
                if (otherCard !== card) {
                    otherCard.classList.add('dimmed');
                } else {
                    card.classList.add('active-hover');
                }
            });
        });

        card.addEventListener('mouseleave', () => {
            cards.forEach((otherCard) => {
                otherCard.classList.remove('dimmed');
                otherCard.classList.remove('active-hover');
            });
        });
    });
}
