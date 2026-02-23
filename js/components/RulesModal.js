export default function createRulesModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay fade-in';
    // Add the "dark" class directly to ensure tailwind dark mode colors apply
    modalOverlay.classList.add('dark');

    // Auto-close on outside click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            clearTimers();
            modalOverlay.remove();
        }
    });

    modalOverlay.innerHTML = `
        <div class="cyber-modal rules-modal dark:bg-background-dark font-display text-slate-100 relative" style="width: 90vw; max-width: 1200px; height: 90vh; overflow-y: auto; padding: 0;">
            
            <button class="close-modal absolute top-6 right-6 text-white text-4xl hover:text-primary transition-colors z-50">&times;</button>

            <!-- MAIN CONTENT -->
            <main class="relative px-6 py-12 max-w-6xl mx-auto">
                <!-- Scanline Overlay -->
                <div class="absolute inset-0 scanline opacity-10 pointer-events-none"></div>

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
                    <!-- Card 1: The 9 Clans -->
                    <div class="card group relative bg-slate-900 p-6 rounded-xl !bg-transparent glitch-card" data-text="THE 9 CLANS">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                <span class="material-symbols-outlined text-3xl">groups_3</span>
                            </div>
                            <h3 class="text-xl font-bold uppercase tracking-tight">The 9 Clans</h3>
                        </div>
                        <div class="w-full h-40 bg-slate-800 rounded-lg mb-4 overflow-hidden relative">
                            <img src="./assets/img/rules/clanes.jpg" alt="imagen de los 9 clanes" class="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform glitch-img" />
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                        </div>
                        <p class="text-slate-400 text-sm leading-relaxed">
                            Global dominance struggle between 9 elite factions. Align with your brothers-in-arms and coordinate strikes to seize the digital landscape.
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
                            <img src="./assets/img/rules/mapa_clanes.jpg" alt="imagen del mapa de los clanes" class="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform glitch-img" /> 
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                        </div>
                        <p class="text-slate-400 text-sm leading-relaxed">
                            Win quizzes and tactical games to capture hexagonal sectors. Each hex expands your clan's influence across the global mainframe.
                        </p>
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
                            <img class="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform glitch-img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbZGdRzKmSPTmzcn_QO3lAe0b4z2NQAYYTWGIHu_icogmjrC9f2HPtcodWTAefs2XG_lhdlwJWJhRICj-TUZDN7EJx-PkF7Lxf4b1c2DJKmCP_KTwMEMtdLRsZ2NsXJIJG1c0RApDNUekqg__zxt8pAujXlASknLqC2VlY6JfeljzyqLIb4xryZFwjQuFmiTc-iedcgZMwFlBwJidhxypVM7t3VJgQApCK9_zk9DuViK2IUUHJBiI9rInuWtuyks-YzA77FWglRps" />
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                        </div>
                        <p class="text-slate-400 text-sm leading-relaxed">
                            More hexagons = higher points-per-hour yield. Maximize your territory to fund your clan's expensive technological upgrades.
                        </p>
                    </div>

                    <!-- Card 4: The Tech Shop -->
                    <div class="card group relative bg-slate-900 p-6 rounded-xl !bg-transparent glitch-card" data-text="THE ARSENAL">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-lg flex items-center justify-center">
                                <span class="material-symbols-outlined text-3xl">shopping_cart</span>
                            </div>
                            <h3 class="text-xl font-bold uppercase tracking-tight">The Arsenal</h3>
                        </div>
                        <div class="w-full h-40 bg-slate-800 rounded-lg mb-4 overflow-hidden relative">
                            <img src="./assets/img/rules/poderes.jpg" alt="Imagen de los poderes" class="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform glitch-img" />
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                        </div>
                        <p class="text-slate-400 text-sm leading-relaxed">
                            Spend points on <span class="text-primary font-bold">Hacks</span>, <span class="text-cyan-500 font-bold">Shields</span>, and <span class="text-purple-500 font-bold">Overrides</span>. Tactical items can turn the tide of any confrontation.
                        </p>
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
                            <img src="./assets/img/rules/ausencia.jpg" alt="Imagen de ausencia" class="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform glitch-img" />
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                        </div>
                        <p class="text-slate-400 text-sm leading-relaxed">
                            <span class="text-primary font-bold">CRITICAL:</span> Absenteeism leads to sector vulnerability. If a clan goes quiet, their hexagons weaken and become ripe for hostile takeover.
                        </p>
                    </div>

                    <!-- Card 6: Mission Types -->
                    <div class="card group relative bg-slate-900 p-6 rounded-xl !bg-transparent glitch-card" data-text="MISSIONS">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
                                <span class="material-symbols-outlined text-3xl">task_alt</span>
                            </div>
                            <h3 class="text-xl font-bold uppercase tracking-tight">Missions</h3>
                        </div>
                        <div class="w-full h-40 bg-slate-800 rounded-lg mb-4 overflow-hidden relative">
                            <img src="./assets/img/rules/conquista.jpg" alt="Imagen de conquista" class="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform glitch-img" />
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                        </div>
                        <p class="text-slate-400 text-sm leading-relaxed">
                            <span class="text-emerald-500 font-bold uppercase">Primary Objective: Data Quizzes</span>. The foundational method for resource extraction and territory expansion.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    `;

    // References to active timers to clean them up when modal closes
    const activeTimers = [];

    const clearTimers = () => {
        activeTimers.forEach(id => clearInterval(id));
        activeTimers.forEach(id => clearTimeout(id));
    };

    // Interaction & Animations
    const closeBtn = modalOverlay.querySelector('.close-modal');
    closeBtn.onclick = () => {
        clearTimers();
        modalOverlay.remove();
    };

    // Initialize Glitch Effects
    setTimeout(() => {
        const cards = modalOverlay.querySelectorAll('.card');

        cards.forEach((card, index) => {
            const randomDelay = (Math.random() * 3).toFixed(2);
            card.style.setProperty('--glitch-delay', `${randomDelay}s`);
            card.style.setProperty('--glitch-duration', '3s');
        });

        // Title Glitch
        const glitchTitle = modalOverlay.querySelector('.glitch-title');
        if (glitchTitle) {
            const titleInterval = setInterval(() => {
                glitchTitle.classList.remove('active-glitch');
                setTimeout(() => {
                    glitchTitle.classList.add('active-glitch');
                }, 10);
            }, 3000);
            activeTimers.push(titleInterval);
        }

        // Glitch Border
        cards.forEach((card) => {
            const randomDelay = Math.random() * 3000 + 2000;
            const randomInterval = Math.random() * 3000 + 3000;

            const startTimeout = setTimeout(() => {
                card.classList.add('active-glitch-border');
                const clearGlitch = setTimeout(() => {
                    card.classList.remove('active-glitch-border');
                }, 600);
                activeTimers.push(clearGlitch);

                const repeatInterval = setInterval(() => {
                    card.classList.add('active-glitch-border');
                    const innerClear = setTimeout(() => {
                        card.classList.remove('active-glitch-border');
                    }, 600);
                    activeTimers.push(innerClear);
                }, randomInterval);
                activeTimers.push(repeatInterval);

            }, randomDelay);
            activeTimers.push(startTimeout);
        });

        // Hover Dimming Effect
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                cards.forEach(otherCard => {
                    if (otherCard !== card) {
                        otherCard.classList.add('dimmed');
                    } else {
                        card.classList.add('active-hover');
                    }
                });
            });

            card.addEventListener('mouseleave', () => {
                cards.forEach(otherCard => {
                    otherCard.classList.remove('dimmed');
                    otherCard.classList.remove('active-hover');
                });
            });
        });
    }, 100);

    return modalOverlay;
}
