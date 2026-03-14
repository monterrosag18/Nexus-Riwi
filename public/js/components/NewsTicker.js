import { store } from '../store.js';

/**
 * NewsTicker — Scrolling event feed for the Map HUD
 */
export default function createNewsTicker() {
    const bar = document.createElement('div');
    bar.className = 'news-ticker-bar';
    bar.innerHTML = `
        <div class="ticker-label"><i class="fa-solid fa-signal"></i> LIVE FEED</div>
        <div class="ticker-track">
            <div class="ticker-content" id="ticker-content"></div>
        </div>
    `;

    // Reactive Update
    const unsubscribe = store.subscribe(() => {
        updateTicker();
    });

    // Cleanup on remove
    bar.addEventListener('remove', () => unsubscribe());

    // Seed initial events ONLY if log is completely empty AND store is ready
    const log = store.getEventLog();
    if (log.length === 0) {
        // Delay slightly to ensure clans are synced
        setTimeout(() => {
            if (store.getEventLog().length === 0) seedEvents();
        }, 800);
    }

    function seedEvents() {
        const clans = Object.values(store.getState().clans);
        if (clans.length < 2) return;
        const sorted = [...clans].sort((a,b) => b.points - a.points);
        store.logEvent(`🏆 ${sorted[0].name.toUpperCase()} leads with ${sorted[0].points.toLocaleString()} pts`, 'rank-up');
        store.logEvent(`⚡ Weekly cycle is active — all clans competing`, 'info');
        store.logEvent(`🗺️ Territory control being contested across all sectors`, 'territory');
        if (sorted.length > 1) {
            store.logEvent(`📊 ${sorted[1].name.toUpperCase()} trails by ${(sorted[0].points - sorted[1].points).toLocaleString()} pts`, 'info');
        }
    }

    async function updateTicker() {
        const content = bar.querySelector('#ticker-content');
        if (!content) return;

        const events = store.getEventLog();
        if (events.length === 0) return;

        const typeColors = {
            'shop-good': '#00ff88',
            'shop-bad': '#ff3b5c',
            'rank-up': '#ffd700',
            'rank-down': '#ff6600',
            'territory': '#00f0ff',
            'info': '#8b9bb4',
            'admin-warning': '#ff8c00',
            'admin-info': '#00f0ff',
            'admin-alert': '#ff3b5c'
        };

        // Also inject admin news from API
        let allItems = [];
        try {
            const adminRes = await fetch('/api/admin/news');
            if (adminRes.ok) {
                const adminNews = await adminRes.json();
                adminNews.forEach(n => {
                    const prefix = n.type === 'warning' ? '⚠️' : n.type === 'alert' ? '🚨' : 'ℹ️';
                    allItems.push({ msg: `${prefix} ADMIN: ${n.msg}`, type: `admin-${n.type}` });
                });
            }
        } catch(e) {
            console.error('Ticker sync failed', e);
        }

        // Add game events after admin news
        events.forEach(e => allItems.push(e));

        // Deduplicate items to prevent "crazy" repeating news
        const seenMsg = new Set();
        const filteredItems = allItems.filter(item => {
            if (seenMsg.has(item.msg)) return false;
            seenMsg.add(item.msg);
            return true;
        });

        const htmlContent = filteredItems.map(e => {
            const color = typeColors[e.type] || '#8b9bb4';
            return `<span class="ticker-item" style="color:${color}">${e.msg}</span>`;
        }).join('<span class="ticker-separator">◆</span>');

        content.innerHTML = htmlContent;

        // Duplicate for seamless loop ONLY once in the DOM
        if (filteredItems.length > 2) {
             content.innerHTML += '<span class="ticker-separator">◆</span>' + htmlContent;
        }
    }

    updateTicker();
    // Refresh admin news every 10 seconds (background sync)
    const interval = setInterval(() => {
        if (!bar.isConnected) { clearInterval(interval); return; }
        updateTicker();
    }, 10000);

    return bar;
}
