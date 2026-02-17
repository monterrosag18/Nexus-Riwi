import { store } from '../store.js';

export default function renderMiniLeaderboard() {
    const container = document.createElement('div');
    container.id = 'mini-leaderboard';
    container.className = 'mini-leaderboard-panel';

    function update() {
        const state = store.getState();
        const clans = Object.values(state.clans).sort((a, b) => b.points - a.points);

        container.innerHTML = `
            <div class="leaderboard-label"><i class="fa-solid fa-trophy"></i> LIVE RANKING</div>
            <div class="leaderboard-strip">
                ${clans.map((clan, index) => `
                    <div class="rank-chip rank-${index + 1} ${clan.id}">
                        <span class="rank-num">#${index + 1}</span>
                        <span class="clan-name">${clan.name}</span>
                        <span class="clan-xp">${clan.points} XP</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Initial render
    update();

    // Subscribe to changes
    store.subscribe(update);

    return container;
}
