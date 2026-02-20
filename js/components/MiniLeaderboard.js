import { store } from '../store.js';

export default function renderMiniLeaderboard() {
    const container = document.createElement('div');
    container.id = 'mini-leaderboard';
    container.className = 'mini-leaderboard-panel';

    function update() {
        const state = store.getState();
        const clans = Object.values(state.clans).sort((a, b) => b.points - a.points);

        container.innerHTML = `
            <div class="leaderboard-glass-panel" 
                 data-tilt data-tilt-max="5" data-tilt-speed="400" data-tilt-glare data-tilt-max-glare="0.2"
                 data-augmented-ui="tr-clip bl-clip border">
                
                <div class="leaderboard-header glow-text">
                    <div class="header-icon"><i class="fa-solid fa-satellite-dish"></i></div>
                    <div class="header-title">NEXUS RANKING</div>
                    <div class="live-indicator"><span class="blink">●</span> LIVE</div>
                </div>

                <div class="leaderboard-strip custom-scrollbar">
                    ${clans.map((clan, index) => `
                        <div class="rank-card clan-${clan.name.toLowerCase()}" 
                             style="animation-delay: ${index * 0.1}s"
                             data-augmented-ui="tl-clip br-clip border">
                            
                            <div class="rank-position">
                                <span>${index + 1}</span>
                            </div>
                            
                            <div class="rank-info">
                                <div class="clan-row">
                                    <span class="clan-title">${clan.name.toUpperCase()}</span>
                                    ${index === 0 ? '<i class="fa-solid fa-crown text-neon-yellow"></i>' : ''}
                                </div>
                                <div class="clan-stats">
                                    <span class="stat-pill points"><i class="fa-solid fa-bolt"></i> ${clan.points.toLocaleString()}</span>
                                    <span class="stat-pill members"><i class="fa-solid fa-user-astronaut"></i> ${clan.members}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="leaderboard-footer">
                    SYSTEM_STATUS: <span class="text-neon-green">OPTIMAL</span>
                </div>
            </div>
        `;

        // Re-init Tilt if library exists
        if (typeof VanillaTilt !== 'undefined') {
            VanillaTilt.init(container.querySelector('.leaderboard-glass-panel'));
        }
    }

    // Initial render
    update();

    // Subscribe to changes
    store.subscribe(update);

    return container;
}
