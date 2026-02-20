import { store } from '../store.js';

export default function renderLeaderboard() {
    const container = document.createElement('div');
    container.className = 'view-content fade-in';
    container.style.padding = '40px';

    // Sort clans
    const clans = Object.values(store.getState().clans).sort((a, b) => b.points - a.points);

    // HTML Structure
    container.innerHTML = `
        <div class="leaderboard-page-container" 
             data-augmented-ui="tr-clip bl-clip border" 
             data-tilt data-tilt-max="2" data-tilt-speed="1000" data-tilt-glare data-tilt-max-glare="0.1">
            
            <div class="cyber-header">
                <div class="header-glitch-wrapper">
                    <h1 class="text-neon-cyan"><i class="fa-solid fa-earth-americas"></i> GLOBAL FACTION RANKINGS</h1>
                    <div class="header-decoration"></div>
                </div>
                <div class="live-status">
                    <span class="pulse-dot"></span> LIVE DATA FEED
                </div>
            </div>

            <div class="rank-list-wrapper custom-scrollbar">
                ${clans.map((clan, index) => {
        const isTop = index < 3;
        const medalColors = ['#ffd700', '#c0c0c0', '#cd7f32'];
        const medalColor = isTop ? medalColors[index] : '#444';

        return `
                    <div class="full-rank-card clan-${clan.name.toLowerCase()}" 
                         data-augmented-ui="tl-clip br-clip border"
                         style="animation-delay: ${index * 0.15}s">
                        
                        <div class="rank-index-box" style="color: ${medalColor}; text-shadow: 0 0 15px ${medalColor}">
                            <div class="rank-number">#${index + 1}</div>
                            ${isTop ? '<i class="fa-solid fa-trophy rank-trophy"></i>' : ''}
                        </div>

                        <div class="rank-details">
                            <div class="faction-name-large">
                                <i class="fa-solid fa-shield-halved"></i> ${clan.name.toUpperCase()}
                            </div>
                            <div class="faction-motto text-muted">ELITE CODING SQUAD</div>
                        </div>

                        <div class="rank-stats-grid">
                            <div class="stat-box">
                                <span class="label">OPERATIVES</span>
                                <span class="value"><i class="fa-solid fa-users"></i> ${clan.members}</span>
                            </div>
                            <div class="stat-box highlight">
                                <span class="label">TOTAL INFLUENCE</span>
                                <span class="value text-neon-cyan"><i class="fa-solid fa-bolt"></i> ${clan.points.toLocaleString()}</span>
                            </div>
                            <div class="stat-box">
                                <span class="label">TERRITORIES</span>
                                <span class="value">--</span>
                            </div>
                        </div>

                        <div class="security-bar"></div>
                    </div>
                    `;
    }).join('')}
            </div>

            <div class="scanner-line"></div>
        </div>
    `;

    // Initialize VanillaTilt on the main container for subtle parallax
    setTimeout(() => {
        if (typeof VanillaTilt !== 'undefined') {
            VanillaTilt.init(container.querySelector('.leaderboard-page-container'), {
                max: 1,
                speed: 400,
                glare: true,
                "max-glare": 0.05
            });
        }
    }, 100);

    return container;
}
