import { store } from '../store.js';

export default function renderMiniLeaderboard() {
    const container = document.createElement('div');
    container.id = 'mini-leaderboard-container';

    function renderBoard() {
        const state = store.getState();
        const clans = state.clans;

        // Convert object to array and sort by points descending
        const sortedClans = Object.keys(clans).map(key => {
            return {
                id: key,
                ...clans[key]
            };
        }).sort((a, b) => b.points - a.points);

        container.innerHTML = `
            <div class="mini-ld-header">
                <div class="mini-ld-title">
                    <i class="fa-solid fa-ranking-star"></i> NEXUS RANKING
                </div>
                <div class="mini-ld-live">LIVE</div>
            </div>
            <ul class="mini-ld-list">
                ${sortedClans.map((clan, index) => `
                    <li class="mini-ld-item" data-clan="${clan.id}">
                        <span class="mini-ld-rank">#${index + 1}</span>
                        <span class="mini-ld-name">${clan.name}</span>
                        <span class="mini-ld-points">${clan.points.toLocaleString()}</span>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    renderBoard();

    // Subscribe to store changes so it updates live
    // store.subscribe returns a function we can use to unsubscribe if the DOM is destroyed
    const unsubscribe = store.subscribe(renderBoard);

    // Provide a way to cleanup if manually removed
    container.destroy = () => {
        if (typeof unsubscribe === 'function') {
            unsubscribe();
        }
    };

    return container;
}
