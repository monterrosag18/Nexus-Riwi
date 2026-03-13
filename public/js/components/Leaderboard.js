import { store } from '../store.js';

// ─────────────────────────────────────────────────────────────────────────────
//  CSS-BASED HEX BACKGROUND ELEMENTS
// ─────────────────────────────────────────────────────────────────────────────
function injectHexBackground(container) {
    const hexSVG = `<svg viewBox="0 0 120 104" xmlns="http://www.w3.org/2000/svg"><polygon points="60,2 112,30 112,74 60,102 8,74 8,30" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;

    const orbs = [1,2,3,4,5,6,7,8].map(i => {
        const el = document.createElement('div');
        el.className = `hex-orb hex-orb-${i}`;
        el.innerHTML = hexSVG;
        return el;
    });

    const circuits = Array.from({length: 10}, (_, i) => {
        const el = document.createElement('div');
        const isV = i >= 6;
        el.className = `hex-circuit ${isV ? 'hex-circuit-v' : 'hex-circuit-h'} hex-circuit-${i+1}`;
        return el;
    });

    const nodes = Array.from({length: 8}, (_, i) => {
        const el = document.createElement('div');
        el.className = `hex-node hex-node-${i+1}`;
        return el;
    });

    const particles = Array.from({length: 12}, (_, i) => {
        const el = document.createElement('div');
        el.className = `hex-particle hex-particle-${i+1}`;
        return el;
    });

    [...orbs, ...circuits, ...nodes, ...particles].forEach(el => container.appendChild(el));
}

// ─────────────────────────────────────────────────────────────────────────────
//  RENDER LEADERBOARD
// ─────────────────────────────────────────────────────────────────────────────
export default function renderLeaderboard() {
    const container = document.createElement('div');
    container.className = 'view-content fade-in w-full h-full theme-leaderboard-bg dark shared-theme';
    container.style.padding = '0';
    container.style.margin = '0';

    injectHexBackground(container);

    const state = store.getState();
    const clans = Object.values(state.clans).sort((a, b) => b.points - a.points);
    const currentUser = state.currentUser || { name: 'GUEST', clan: 'UNASSIGNED' };
    const userClanKey = (currentUser.clan || '').toLowerCase();

    const getClanStyles = (clanName) => {
        const name = (clanName || '').toLowerCase();
        if (name === 'turing') return { icon: 'security', colorClass: 'text-primary', bgClass: 'bg-primary/10 border-primary', glowClass: 'theme-neon-glow', accentColor: 'rgba(0,245,255,0.12)', borderHex: '#00f5ff', badgeClass: 'bg-primary/10 text-primary border-primary/40 theme-neon-soft-glow' };
        if (name === 'tesla') return { icon: 'bolt', colorClass: 'text-blue-500', bgClass: 'bg-blue-500/10 border-blue-500', glowClass: 'theme-blue-glow', accentColor: 'rgba(123,97,255,0.12)', borderHex: '#7b61ff', badgeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/40' };
        if (name === 'mccarthy') return { icon: 'code', colorClass: 'text-green-400', bgClass: 'bg-green-400/10 border-green-400', glowClass: 'shadow-[0_0_10px_rgba(74,222,128,0.8)]', accentColor: 'rgba(74,222,128,0.12)', borderHex: '#4ade80', badgeClass: 'bg-green-400/10 text-green-400 border-green-400/40' };
        if (name === 'lovelace' || name === 'thompson') return { icon: 'memory', colorClass: 'text-purple-400', bgClass: 'bg-purple-400/10 border-purple-400', glowClass: 'shadow-[0_0_10px_rgba(192,132,252,0.8)]', accentColor: 'rgba(192,132,252,0.12)', borderHex: '#c084fc', badgeClass: 'bg-purple-400/10 text-purple-400 border-purple-400/40' };
        if (name === 'neumann' || name === 'hamilton') return { icon: 'lightbulb', colorClass: 'text-yellow-400', bgClass: 'bg-yellow-400/10 border-yellow-400', glowClass: 'shadow-[0_0_10px_rgba(250,204,21,0.8)]', accentColor: 'rgba(250,204,21,0.12)', borderHex: '#facc15', badgeClass: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/40' };
        return { icon: 'shield', colorClass: 'text-gray-400', bgClass: 'bg-gray-400/10 border-gray-400', glowClass: '', accentColor: 'rgba(150,150,150,0.1)', borderHex: '#6b7280', badgeClass: 'bg-gray-400/10 text-gray-400 border-gray-400/40' };
    };

    const getAvatarBg = (clanName) => {
        const name = (clanName || '').toLowerCase();
        if (name === 'turing') return 'from-cyan-500/40 to-cyan-900/60';
        if (name === 'tesla') return 'from-blue-500/40 to-blue-900/60';
        if (name === 'mccarthy') return 'from-green-500/40 to-green-900/60';
        if (name === 'lovelace' || name === 'thompson') return 'from-purple-500/40 to-purple-900/60';
        if (name === 'neumann' || name === 'hamilton') return 'from-yellow-500/40 to-yellow-900/60';
        return 'from-gray-500/40 to-gray-900/60';
    };

    const renderUserRow = (user, index) => {
        const isTop3 = index < 3;
        const rankColors = ['bg-yellow-500/10 text-yellow-500 border-yellow-500 shadow-[0_0_10px_rgba(255,215,0,0.3)]', 'bg-gray-400/10 text-gray-400 border-gray-400 shadow-[0_0_10px_rgba(192,192,192,0.3)]', 'bg-orange-700/10 text-orange-700 border-orange-700 shadow-[0_0_10px_rgba(205,127,50,0.3)]'];
        const rankClass = isTop3 ? rankColors[index] : 'text-gray-500 border-transparent';
        const styles = getClanStyles(user.clan);
        const initials = (user.username || user.name || '??').slice(0, 2).toUpperCase();
        const isCurrentUser = currentUser.username && (user.username || user.name) && currentUser.username.toLowerCase() === (user.username || user.name).toLowerCase();

        return `
            <tr class="hover:bg-blue-500/5 transition-colors group/row border-l-2 ${isCurrentUser ? 'border-blue-500 bg-blue-500/5' : 'border-transparent hover:border-blue-500'}">
                <td class="py-4 pl-6 pr-2 text-center">
                    ${isTop3 ? `<div class="w-8 h-8 mx-auto flex items-center justify-center border text-sm font-bold ${rankClass}">${index + 1}</div>` : `<span class="text-gray-500 font-bold font-mono text-lg">${index + 1}</span>`}
                </td>
                <td class="py-4 px-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 border border-gray-600 overflow-hidden relative flex items-center justify-center bg-gradient-to-tr ${getAvatarBg(user.clan)}">
                            <span class="text-xs font-bold text-white font-mono">${initials}</span>
                        </div>
                        <span class="font-bold ${isTop3 ? 'text-white' : 'text-gray-300'} tracking-wide group-hover/row:text-blue-500 transition-colors">
                            ${user.username || user.name || 'Unknown'}
                        </span>
                    </div>
                </td>
                <td class="py-4 px-4 text-center">
                    <span class="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider border ${styles.badgeClass}">${user.clan_id || user.clan || 'N/A'}</span>
                </td>
                <td class="py-4 px-4 pr-6 text-right font-bold ${isTop3 ? 'text-white' : 'text-gray-400'} font-mono tracking-wider">${(user.points || 0).toLocaleString()}</td>
            </tr>
        `;
    };

    const CLAN_GRID = '80px 1fr 130px 150px';
    const generateClanRows = (clansList) => clansList.map((clan, index) => {
        const styles = getClanStyles(clan.name);
        const isTop3 = index < 3;
        const rankColors = ['bg-yellow-500/10 text-yellow-500 border-yellow-500 shadow-[0_0_10px_rgba(255,215,0,0.3)]', 'bg-gray-400/10 text-gray-400 border-gray-400 shadow-[0_0_10px_rgba(192,192,192,0.3)]', 'bg-orange-700/10 text-orange-700 border-orange-700 shadow-[0_0_10px_rgba(205,127,50,0.3)]'];
        const rankClass = isTop3 ? rankColors[index] : 'text-gray-500 border-transparent';
        const isOwnClan = (clan.id || '').toLowerCase() === userClanKey;
        return `
            <div data-clan="${(clan.id || '').toLowerCase()}" class="clan-row transition-all border-l-2 border-transparent select-none border-b border-gray-800 hover:bg-white/5 active:scale-[0.99] group/clan" style="display:grid;grid-template-columns:${CLAN_GRID};align-items:center;cursor:pointer;background-color:${isOwnClan ? styles.accentColor : ''};border-left-color:${isOwnClan ? styles.borderHex + '55' : 'transparent'};">
                <div style="padding:14px 8px 14px 24px;display:flex;justify-content:center;">
                    <div class="w-8 h-8 flex items-center justify-center border text-sm font-bold font-mono ${rankClass}">${index + 1}</div>
                </div>
                <div style="padding:14px 16px;display:flex;align-items:center;gap:12px;overflow:hidden;">
                    <div class="p-1.5 bg-gray-900 border border-gray-700 flex-shrink-0"><span class="material-symbols-outlined ${styles.colorClass} text-sm">${styles.icon}</span></div>
                    <span class="font-bold font-display tracking-wide ${isTop3 ? 'text-white text-lg' : 'text-gray-300'} group-hover/clan:text-white transition-colors" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${(clan.name || '').toUpperCase()}</span>
                </div>
                <div style="padding:14px 16px;text-align:center;" class="text-gray-400 font-mono text-sm">${clan.members || 0}</div>
                <div style="padding:14px 24px 14px 16px;text-align:right;display:flex;align-items:center;justify-content:flex-end;gap:8px;">
                    <span class="font-bold font-mono tracking-wider ${styles.colorClass} ${isTop3 ? 'text-lg' : 'text-sm'} ${styles.glowClass}">${(clan.points || 0).toLocaleString()}</span>
                    <span class="material-symbols-outlined text-sm text-gray-600 group-hover/clan:text-primary transition-colors">chevron_right</span>
                </div>
            </div>`;
    }).join('');

    container.insertAdjacentHTML('beforeend', `
        <div class="flex-1 flex flex-col w-full h-full text-gray-100 font-body antialiased overflow-y-auto custom-scrollbar relative" style="z-index:1;background:transparent;">
            <header class="w-full pt-4 pb-4 px-6 flex justify-between items-center backdrop-blur-md border-b border-primary/20 sticky top-0 z-40" style="background:rgba(3,10,22,0.75);">
                <div class="flex flex-col">
                    <span class="text-[10px] font-display tracking-[0.2em] text-primary/80 uppercase mb-1">System Status: Online</span>
                    <h1 class="text-xl md:text-3xl font-display font-bold text-white uppercase tracking-widest theme-neon-text-glow">Global Rankings</h1>
                </div>
            </header>
            <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-8 pb-24 space-y-8">
                <div class="flex flex-col sm:flex-row sm:items-end justify-between border-l-2 border-primary pl-4 py-1">
                    <div class="space-y-1">
                        <div class="flex items-center space-x-2 text-primary">
                            <span class="material-symbols-outlined text-sm animate-pulse">wifi_tethering</span>
                            <span class="text-xs font-mono tracking-widest uppercase">Live Data Feed // Encrypted</span>
                        </div>
                        <h2 class="text-xl sm:text-2xl font-display font-bold text-white">Top Performing Factions & Operatives</h2>
                    </div>
                </div>
                <!-- CLAN PANEL -->
                <section id="clan-panel" class="backdrop-blur border border-primary/30 relative flex flex-col theme-neon-shadow" style="background:rgba(10,16,30,0.72);">
                    <div class="p-5 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent flex justify-between items-center">
                        <h3 class="font-display font-bold text-xl uppercase tracking-wider text-white flex items-center">
                            <span class="material-symbols-outlined text-primary mr-3 shadow-neon rounded-sm p-1 bg-primary/10">groups</span>
                            Ranking Clans
                        </h3>
                    </div>
                    <div>
                        <div class="text-xs font-mono uppercase text-primary/70 border-b border-primary/20" style="display:grid;grid-template-columns:${CLAN_GRID};align-items:center;background:rgba(5,12,24,0.8);">
                            <div style="padding:14px 8px 14px 24px;text-align:center;">Rank</div>
                            <div style="padding:14px 16px;">Faction</div>
                            <div style="padding:14px 16px;text-align:center;">Operativos</div>
                            <div style="padding:14px 24px 14px 16px;text-align:right;" class="text-primary">Influencia</div>
                        </div>
                        <div id="clan-tbody">${generateClanRows(clans)}</div>
                    </div>
                </section>
                <!-- CODERS PANEL (hidden) -->
                <section id="coders-panel" style="display:none;" class="backdrop-blur border border-blue-500/30 relative flex flex-col theme-blue-shadow" style="background:rgba(10,16,30,0.72);">
                    <div class="p-5 border-b border-blue-500/20 bg-gradient-to-r from-transparent to-blue-500/10 flex justify-between items-center">
                        <h3 class="font-display font-bold text-xl uppercase tracking-wider text-white" id="coders-title">Ranking Coders</h3>
                        <button id="back-btn" class="flex items-center gap-1 text-xs font-mono border border-gray-600 px-3 py-1.5 text-gray-300 hover:opacity-80">
                            <span class="material-symbols-outlined text-sm leading-none">arrow_back</span>
                            Volver
                        </button>
                    </div>
                    <div class="overflow-x-auto overflow-y-auto max-h-[600px]">
                        <table class="w-full text-left">
                            <thead class="sticky top-0 bg-black/80 backdrop-blur-md">
                                <tr class="text-xs font-mono uppercase text-blue-500/70 border-b border-blue-500/20">
                                    <th class="py-4 pl-6 pr-2 text-center w-16">Rank</th>
                                    <th class="py-4 px-4 font-medium">Operativo</th>
                                    <th class="py-4 px-4 text-center">Clan</th>
                                    <th class="py-4 px-4 pr-6 text-right text-blue-500">Pts</th>
                                </tr>
                            </thead>
                            <tbody id="coders-tbody" class="text-sm font-display divide-y divide-gray-800"></tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    `);

    const clanPanel = container.querySelector('#clan-panel');
    const codersPanel = container.querySelector('#coders-panel');
    const codersTbody = container.querySelector('#coders-tbody');
    const codersTitle = container.querySelector('#coders-title');
    const backBtn = container.querySelector('#back-btn');

    const showCoders = async (clanId) => {
        const clan = clans.find(c => c.id === clanId);
        const label = clan ? clan.name.toUpperCase() : 'FACTION';
        codersTitle.textContent = `${label} // OPERATIVES`;
        codersTbody.innerHTML = `<tr><td colspan="4" class="py-16 text-center"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></td></tr>`;
        clanPanel.style.display = 'none';
        codersPanel.style.display = 'flex';
        try {
            const res = await fetch(`/api/clans/members?clanId=${clanId}`);
            const members = res.ok ? await res.json() : [];
            codersTbody.innerHTML = members.length > 0 ? members.map((m, i) => renderUserRow(m, i)).join('') : `<tr><td colspan="4" class="py-16 text-center text-gray-500 font-mono italic uppercase tracking-widest text-xs">No active operatives found in this sector</td></tr>`;
        } catch (e) {
            console.error('Fetch members failed', e);
            codersTbody.innerHTML = `<tr><td colspan="4" class="py-16 text-center text-red-400 font-mono italic uppercase tracking-widest text-xs">Sector data corrupted</td></tr>`;
        }
    };

    const bindClanRows = () => {
        container.querySelectorAll('.clan-row').forEach(row => {
            row.onclick = () => showCoders(row.dataset.clan);
        });
    };

    if (backBtn) backBtn.onclick = () => { codersPanel.style.display = 'none'; clanPanel.style.display = 'flex'; };
    bindClanRows();

    const unsubscribe = store.subscribe((state) => {
        if (clanPanel.style.display !== 'none') {
            const updatedClans = Object.values(state.clans).sort((a, b) => b.points - a.points);
            const body = container.querySelector('#clan-tbody');
            if (body) {
                body.innerHTML = generateClanRows(updatedClans);
                bindClanRows();
            }
        }
    });

    container.addEventListener('remove', () => unsubscribe());
    return container;
}
