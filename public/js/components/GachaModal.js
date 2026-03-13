import { store } from '../store.js';

// POOL OF POSSIBLE PRIZES (Unified)
export const PRIZE_POOL = [
    // CARDS (Legacy Shop Items)
    { id: 'shield', name: 'Neural Shield', type: 'card', rarity: 'common', cost: 150, image: 'shield.png', effect: 'Protect territory for 1 hour' },
    { id: 'booster', name: 'XP Overdrive', type: 'card', rarity: 'uncommon', cost: 300, image: 'booster.png', effect: 'Double points for 30 mins' },
    { id: 'breach', name: 'System Breach', type: 'card', rarity: 'rare', cost: 500, image: 'hack.png', effect: 'Instantly weaken enemy sector' },
    
    // COSMETICS (New Aesthetic Gacha)
    { id: 'skin_cyan', name: 'Phosphor Cyan', type: 'skin', rarity: 'rare', cost: 1000, color: '#00f0ff', effect: 'Your territories glow cyan' },
    { id: 'skin_magenta', name: 'Neon Pulse', type: 'skin', rarity: 'epic', cost: 2000, color: '#ff00ff', effect: 'Your territories glow magenta' },
    { id: 'border_gold', name: 'Golden Sequence', type: 'border', rarity: 'legendary', cost: 5000, color: '#ffd700', effect: 'Luxury gold borders' }
];

export default function createGachaModal() {
    const modal = document.createElement('div');
    modal.className = 'nexus-modal-overlay fade-in';
    modal.id = 'gacha-modal';
    
    let isSpinning = false;

    function render() {
        const user = store.getState().currentUser;
        const credits = user ? user.credits : 0;

        modal.innerHTML = `
            <div class="nexus-modal-card gacha-card">
                <div class="modal-header">
                    <div class="modal-title"><i class="fa-solid fa-cube"></i> REWARD TERMINAL</div>
                    <button class="modal-close-btn">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="gacha-display">
                        <div class="gacha-orb-container">
                            <div class="gacha-orb">
                                <div class="orb-core"></div>
                                <div class="orb-rings">
                                    <div class="ring r1"></div>
                                    <div class="ring r2"></div>
                                    <div class="ring r3"></div>
                                </div>
                            </div>
                        </div>
                        <div class="gacha-result-preview" id="gacha-preview">
                            <i class="fa-solid fa-cloud-arrow-down"></i>
                            <p>WAITING FOR UPLINK...</p>
                        </div>
                    </div>

                    <div class="gacha-info">
                        <div class="gacha-balance">
                            <span class="label">CREDITS AVAILABLE</span>
                            <span class="value">${credits} CR</span>
                        </div>
                        <div class="gacha-prize-list">
                            <div class="prize-list-header">PROBABILITY POOL</div>
                            <div class="prize-grid">
                                ${PRIZE_POOL.map(p => `
                                    <div class="prize-item ${p.rarity}" title="${p.effect}">
                                        <div class="prize-rarity-dot"></div>
                                        <div class="prize-name">${p.name}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="nexus-btn gacha-spin-btn" ${credits < 100 || isSpinning ? 'disabled' : ''}>
                        <span>INITIALIZE UPLINK (100 CR)</span>
                    </button>
                    <div class="gacha-pity-counter">
                        NEXT GUARANTEED REWARD: ${10 - ((user?.total_spins || 0) % 10)} SPINS
                    </div>
                </div>
            </div>
        `;

        attachEvents();
    }

    function attachEvents() {
        const closeBtn = modal.querySelector('.modal-close-btn');
        closeBtn.onclick = () => modal.remove();

        const spinBtn = modal.querySelector('.gacha-spin-btn');
        if (spinBtn) {
            spinBtn.onclick = async () => {
                if (isSpinning) return;
                isSpinning = true;
                render();
                await handleGachaSpin();
            };
        }
    }

    async function handleGachaSpin() {
        const preview = modal.querySelector('#gacha-preview');
        const orb = modal.querySelector('.gacha-orb');
        
        // 1. Start Animation
        orb.classList.add('spinning');
        preview.innerHTML = `<div class="spinning-loader"></div><p>DECRYPTING DATA...</p>`;

        try {
            // 2. Charge Credits (Atomic)
            const user = store.getState().currentUser;
            const res = await fetch('/api/user/update', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('riwi_token')}`
                },
                body: JSON.stringify({ 
                    username: user.name, 
                    updates: { creditsDelta: -100, incrementSpins: true } 
                })
            });

            if (!res.ok) throw new Error("CREDIT SYNC FAILED");

            // 3. Logic: Check for Pity (every 10th)
            const currentSpins = user.total_spins || 0;
            const isGuaranteed = (currentSpins + 1) % 10 === 0;
            
            let result;
            if (isGuaranteed) {
                const epics = PRIZE_POOL.filter(p => p.rarity === 'rare' || p.rarity === 'epic' || p.rarity === 'legendary');
                result = epics[Math.floor(Math.random() * epics.length)];
            } else {
                // Normal RNG weighted by rarity (simplified)
                const weights = { common: 60, uncommon: 30, rare: 8, epic: 1.5, legendary: 0.5 };
                result = PRIZE_POOL[Math.floor(Math.random() * PRIZE_POOL.length)];
            }

            // 4. Delay for dramatic effect
            await new Promise(r => setTimeout(r, 2000));

            // 5. Show Result
            orb.classList.remove('spinning');
            preview.innerHTML = `
                <div class="result-card ${result.rarity} fade-in">
                    <div class="result-rarity">${result.rarity.toUpperCase()}</div>
                    <div class="result-name">${result.name}</div>
                    <div class="result-effect">${result.effect}</div>
                </div>
            `;

            // 6. Update user (save prize) - To be implemented in later phase
            await store.syncUserProfile();
            
            isSpinning = false;
            // Don't full re-render yet to keep result visible, just update balance
            const balance = modal.querySelector('.gacha-balance .value');
            if (balance) balance.textContent = `${store.getState().currentUser.credits} CR`;
            
            const spinBtn = modal.querySelector('.gacha-spin-btn');
            if (spinBtn) {
                spinBtn.disabled = store.getState().currentUser.credits < 100;
                spinBtn.querySelector('span').textContent = "UPLINK ANOTHER (100 CR)";
            }

        } catch (e) {
            preview.innerHTML = `<p style="color:red">ERROR: ${e.message}</p>`;
            isSpinning = false;
        }
    }

    render();
    return modal;
}
