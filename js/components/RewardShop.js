export default function renderShop() {
    const container = document.createElement('div');
    container.className = 'view-content fade-in';

    container.innerHTML = `
        <div class="cyber-panel-header">
            <h2 class="text-neon-pink"><i class="fa-solid fa-cart-shopping"></i> BLACK MARKET</h2>
            <p class="text-muted">EXCHANGE CRYPTO-POINTS FOR TACTICAL ASSETS</p>
        </div>
    `;

    const grid = document.createElement('div');
    grid.className = 'cyber-shop-grid';

    const items = [
        { name: "NET.SHIELD V1", icon: "fa-shield-virus", cost: 500, type: "def", desc: "Protects a sector for 24h against hostile takeover." },
        { name: "XP BOOSTER", icon: "fa-angles-up", cost: 1000, type: "buff", desc: "2x points for your clan's next submission." },
        { name: "ICE BREAKER", icon: "fa-bug", cost: 750, type: "atk", desc: "Temporarily freeze enemy progress in a target sector." },
        { name: "HOLO-BADGE", icon: "fa-medal", cost: 200, type: "cosmetic", desc: "Exclusive profile flair to show dominance." },
        { name: "GHOST PROTOCOL", icon: "fa-satellite-dish", cost: 600, type: "stealth", desc: "Hide your clan's moves on the map for 1 hour." },
        { name: "HEADHUNTER", icon: "fa-user-plus", cost: 300, type: "bonus", desc: "Bonus points for referring a new coder." }
    ];

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'cyber-card';
        card.innerHTML = `
            <div class="card-header">
                <span class="item-type">${item.type.toUpperCase()}</span>
                <i class="fa-solid ${item.icon} item-icon"></i>
            </div>
            <div class="card-body">
                <h3>${item.name}</h3>
                <p>${item.desc}</p>
            </div>
            <div class="card-footer">
                <button class="cyber-buy-btn">
                    <i class="fa-solid fa-bolt"></i> ${item.cost}
                </button>
            </div>
        `;

        // Mock Interaction
        const btn = card.querySelector('.cyber-buy-btn');
        btn.onclick = () => {
            if (confirm(`INITIATE TRANSACTION?\nItem: ${item.name}\nCost: ${item.cost} PTS`)) {
                alert('TRANSACTION VERIFIED. ASSET TRANSFERRED TO INVENTORY.');
            }
        };

        grid.appendChild(card);
    });

    container.appendChild(grid);
    return container;
}
