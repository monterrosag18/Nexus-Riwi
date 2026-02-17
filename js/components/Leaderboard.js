import { store } from '../store.js';

export default function renderLeaderboard() {
    const container = document.createElement('div');
    container.className = 'view-content fade-in';

    container.innerHTML = `
        <div class="cyber-panel-header">
            <h2 class="text-neon-gold"><i class="fa-solid fa-trophy"></i> GLOBAL RANKINGS</h2>
            <p class="text-muted">LIVE DATA FEED // TOP PERFORMING FACTIONS</p>
        </div>
    `;

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'leaderboard-wrapper';

    const table = document.createElement('table');
    table.className = 'cyber-table';

    // Header
    table.innerHTML = `
        <thead>
            <tr>
                <th>RANK</th>
                <th>FACTION</th>
                <th>OPERATIVES</th>
                <th>INFLUENCE (PTS)</th>
            </tr>
        </thead>
    `;

    const tbody = document.createElement('tbody');

    // Sort clans by points (descending)
    const clans = Object.values(store.getState().clans).sort((a, b) => b.points - a.points);

    clans.forEach((clan, index) => {
        const row = document.createElement('tr');
        row.className = 'cyber-row';

        // Highlight logic could go here if we tracked "my clan" specifically in a visual way
        const isTop = index === 0;

        const rank = index + 1;
        let rankDisplay = `#${rank}`;
        if (rank === 1) rankDisplay = '<i class="fa-solid fa-trophy" style="color:#ffd700"></i>';
        if (rank === 2) rankDisplay = '<i class="fa-solid fa-trophy" style="color:#c0c0c0"></i>';
        if (rank === 3) rankDisplay = '<i class="fa-solid fa-trophy" style="color:#cd7f32"></i>';

        row.innerHTML = `
            <td class="rank-cell">
                <div class="rank-badge ${isTop ? 'gold' : ''}">${rankDisplay}</div>
            </td>
            <td class="faction-cell" style="color: ${clan.color}; text-shadow: 0 0 10px ${clan.color};">
                <i class="fa-solid fa-shield-halved"></i> ${clan.name.toUpperCase()}
            </td>
            <td>${clan.members} AGENTS</td>
            <td class="points-cell">${clan.points.toLocaleString()}</td>
        `;
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);

    return container;
}
