import { store } from '../store.js';

// ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
//  CSS-BASED HEX BACKGROUND ELEMENTS
// ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
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

// ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
//  RENDER LEADERBOARD
// ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
export default function renderLeaderboard() {
    const container = document.createElement('div');
    container.className = 'view-content fade-in w-full h-full theme-leaderboard-bg dark shared-theme';
    container.style.padding = '0';
    container.style.margin = '0';


    // Inject CSS-based hex background elements
    injectHexBackground(container);

    // Get Data
    const state = store.getState();
    const clans = Object.values(state.clans).sort((a, b) => b.points - a.points);
    const currentUser = state.currentUser || { name: 'GUEST', clan: 'UNASSIGNED' };
    const allUsers = store.getRegisteredUsers().sort((a, b) => (b.points || 0) - (a.points || 0));
    const userClanKey = (currentUser.clan || '').toLowerCase();

    // Helpers (colors controlled in css/rules.css)
    const getClanStyles = (clanName) => {
        const name = (clanName || '').toLowerCase();
        if (name === 'turing') {
            return {
                icon: 'security',
                colorClass: 'text-primary',
                bgClass: 'bg-primary/10 border-primary',
                glowClass: 'theme-neon-glow',
                badgeClass: 'bg-primary/10 text-primary border-primary/40 theme-neon-soft-glow',
                accentColor: 'rgba(0,245,255,0.12)',
                borderHex: '#00f5ff'
            };
        }
        if (name === 'tesla') {
            return {
                icon: 'bolt',
                colorClass: 'text-blue-500',
                bgClass: 'bg-blue-500/10 border-blue-500',
                glowClass: 'theme-blue-glow',
                badgeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/40',
                accentColor: 'rgba(123,97,255,0.12)',
                borderHex: '#7b61ff'
            };
        }
        if (name === 'mccarthy') {
            return {
                icon: 'code',
                colorClass: 'text-green-400',
                bgClass: 'bg-green-400/10 border-green-400',
                glowClass: 'shadow-[0_0_10px_rgba(74,222,128,0.8)]',
                badgeClass: 'bg-green-400/10 text-green-400 border-green-400/40',
                accentColor: 'rgba(74,222,128,0.12)',
                borderHex: '#4ade80'
            };
        }
        if (name === 'lovelace' || name === 'thompson') {
            return {
                icon: 'memory',
                colorClass: 'text-purple-400',
                bgClass: 'bg-purple-400/10 border-purple-400',
                glowClass: 'shadow-[0_0_10px_rgba(192,132,252,0.8)]',
                badgeClass: 'bg-purple-400/10 text-purple-400 border-purple-400/40',
                accentColor: 'rgba(192,132,252,0.12)',
                borderHex: '#c084fc'
            };
        }
        if (name === 'neumann' || name === 'hamilton' || name === 'halmiton') {
            return {
                icon: 'lightbulb',
                colorClass: 'text-yellow-400',
                bgClass: 'bg-yellow-400/10 border-yellow-400',
                glowClass: 'shadow-[0_0_10px_rgba(250,204,21,0.8)]',
                badgeClass: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/40',
                accentColor: 'rgba(250,204,21,0.12)',
                borderHex: '#facc15'
            };
        }
        return {
            icon: 'shield',
            colorClass: 'text-gray-400',
            bgClass: 'bg-gray-400/10 border-gray-400',
            glowClass: '',
            badgeClass: 'bg-gray-400/10 text-gray-400 border-gray-400/40',
            accentColor: 'rgba(150,150,150,0.1)',
            borderHex: '#6b7280'
        };
    };

    const getAvatarBg = (clanName) => {
        const name = (clanName || '').toLowerCase();
        if (name === 'turing') return 'from-cyan-500/40 to-cyan-900/60';
        if (name === 'tesla') return 'from-blue-500/40 to-blue-900/60';
        if (name === 'mccarthy') return 'from-green-500/40 to-green-900/60';
        if (name === 'lovelace' || name === 'thompson') return 'from-purple-500/40 to-purple-900/60';
        if (name === 'neumann' || name === 'hamilton' || name === 'halmiton') return 'from-yellow-500/40 to-yellow-900/60';
        return 'from-gray-500/40 to-gray-900/60';
    };

    const renderUserRow = (user, index) => {
        const rankColors = [
            'bg-yellow-500/10 text-yellow-500 border-yellow-500 shadow-[0_0_10px_rgba(255,215,0,0.3)]',
            'bg-gray-400/10 text-gray-400 border-gray-400 shadow-[0_0_10px_rgba(192,192,192,0.3)]',
            'bg-orange-700/10 text-orange-700 border-orange-700 shadow-[0_0_10px_rgba(205,127,50,0.3)]'
        ];
        const isTop3 = index < 3;
        const rankClass = isTop3 ? rankColors[index] : 'text-gray-500 border-transparent';
        const styles = getClanStyles(user.clan);
        const avatarBg = getAvatarBg(user.clan);
        const initials = (user.name || '??').slice(0, 2).toUpperCase();
        const isCurrentUser = currentUser.name && user.name && currentUser.name.toLowerCase() === user.name.toLowerCase();
        const pointsColor = index === 0 ? 'text-pink-500' : isTop3 ? 'text-gray-300' : 'text-gray-400';
        const pointsGlow = index === 0 ? 'shadow-neon-magenta text-base' : '';

        return `
            <tr class="hover:bg-blue-500/5 transition-colors group/row border-l-2 ${isCurrentUser ? 'border-blue-500 bg-blue-500/5' : 'border-transparent hover:border-blue-500'}">
                <td class="py-4 pl-6 pr-2 text-center">
                    ${isTop3
                        ? `<div class="w-8 h-8 mx-auto flex items-center justify-center border text-sm font-bold ${rankClass}">${index + 1}</div>`
                        : `<span class="text-gray-500 font-bold font-mono text-lg">${index + 1}</span>`
                    }
                </td>
                <td class="py-4 px-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 border border-gray-600 overflow-hidden relative flex items-center justify-center bg-gradient-to-tr ${avatarBg}">
                            <span class="text-xs font-bold text-white font-mono">${initials}</span>
                            ${isCurrentUser ? '<div class="absolute inset-0 border border-blue-500 opacity-60"></div>' : ''}
                        </div>
                        <span class="font-bold ${isTop3 ? 'text-white' : 'text-gray-300'} tracking-wide group-hover/row:text-blue-500 transition-colors">
                            ${user.name || 'Unknown'}
                            ${isCurrentUser ? '<span class="ml-2 text-[9px] text-blue-500 font-mono uppercase tracking-widest border border-blue-500/40 px-1 py-0.5">YOU</span>' : ''}
                        </span>
                    </div>
                </td>
                <td class="py-4 px-4 text-center">
                    <span class="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider border ${styles.badgeClass}">${user.clan || 'N/A'}</span>
                </td>
                <td class="py-4 px-4 pr-6 text-right font-bold ${pointsColor} ${pointsGlow} font-mono tracking-wider">${(user.points || 0).toLocaleString()}</td>
            </tr>
        `;
    };

    const emptyState = (msg = 'No hay operativos registrados') => `
        <tr>
            <td colspan="4" class="py-16 text-center">
                <span class="material-symbols-outlined text-4xl text-gray-700 block mb-3">person_off</span>
                <p class="text-gray-600 font-mono text-sm uppercase tracking-widest">${msg}</p>
            </td>
        </tr>
    `;

    // Clan rows
    const CLAN_GRID = '80px 1fr 130px 150px';
    const clanRowsHTML = clans.map((clan, index) => {
        const styles = getClanStyles(clan.name);
        const rankColors = [
            'bg-yellow-500/10 text-yellow-500 border-yellow-500 shadow-[0_0_10px_rgba(255,215,0,0.3)]',
            'bg-gray-400/10 text-gray-400 border-gray-400 shadow-[0_0_10px_rgba(192,192,192,0.3)]',
            'bg-orange-700/10 text-orange-700 border-orange-700 shadow-[0_0_10px_rgba(205,127,50,0.3)]'
        ];
        const isTop3 = index < 3;
        const rankClass = isTop3 ? rankColors[index] : 'text-gray-500 border-transparent';
        const isOwnClan = (clan.name || '').toLowerCase() === userClanKey;
        return '<div data-clan="' + (clan.name || '').toLowerCase() + '" class="clan-row transition-all border-l-2 border-transparent select-none border-b border-gray-800" style="display:grid;grid-template-columns:' + CLAN_GRID + ';align-items:center;cursor:' + (isOwnClan ? 'pointer' : 'not-allowed') + ';opacity:' + (isOwnClan ? '1' : '0.35') + ';filter:' + (isOwnClan ? 'none' : 'grayscale(0.6)') + ';background-color:' + (isOwnClan ? styles.accentColor : '') + ';border-left-color:' + (isOwnClan ? styles.borderHex + '55' : 'transparent') + ';">'
            + '<div style="padding:14px 8px 14px 24px;display:flex;justify-content:center;">'
            +   '<div class="w-8 h-8 flex items-center justify-center border text-sm font-bold font-mono ' + rankClass + '">' + (index + 1) + '</div>'
            + '</div>'
            + '<div style="padding:14px 16px;display:flex;align-items:center;gap:12px;overflow:hidden;">'
            +   '<div class="p-1.5 bg-gray-900 border border-gray-700 flex-shrink-0"><span class="material-symbols-outlined ' + styles.colorClass + ' text-sm">' + styles.icon + '</span></div>'
            +   '<span class="font-bold font-display tracking-wide ' + (isTop3 ? 'text-white text-lg' : 'text-gray-300') + '" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (clan.name || '').toUpperCase() + '</span>'
            + '</div>'
            + '<div style="padding:14px 16px;text-align:center;" class="text-gray-400 font-mono text-sm">' + (clan.members || 0) + '</div>'
            + '<div style="padding:14px 24px 14px 16px;text-align:right;display:flex;align-items:center;justify-content:flex-end;gap:8px;">'
            +   '<span class="font-bold font-mono tracking-wider ' + styles.colorClass + ' ' + (isTop3 ? 'text-lg' : 'text-sm') + ' ' + styles.glowClass + '">' + (clan.points || 0).toLocaleString() + '</span>'
            +   '<span class="material-symbols-outlined text-sm" style="color:#374151;">' + (isOwnClan ? 'chevron_right' : 'lock') + '</span>'
            + '</div>'
            + '</div>';
    }).join('');

    const currentClanLabel = (currentUser.clan || 'UNASSIGNED').toUpperCase();

    container.insertAdjacentHTML('beforeend', `
        <div class="flex-1 flex flex-col w-full h-full text-gray-100 font-body antialiased overflow-y-auto custom-scrollbar relative" style="z-index:1;background:transparent;">
            
            <header class="w-full pt-4 pb-4 px-6 flex justify-between items-center backdrop-blur-md border-b border-primary/20 sticky top-0 z-40 theme-neon-shadow" style="background:rgba(3,10,22,0.75);">
                <div class="flex flex-col">
                    <span class="text-[10px] font-display tracking-[0.2em] text-primary/80 uppercase mb-1 glitch-title" data-text="System Status: Online">System Status: Online</span>
                    <h1 class="text-xl md:text-3xl font-display font-bold text-white uppercase tracking-widest theme-neon-text-glow glitch-title" data-text="Global Rankings">Global Rankings</h1>
                </div>
                <div class="flex items-center space-x-4 z-50">
                    <!-- Clean state: Header details moved to global ProfileHeader -->
                </div>
            </header>

            <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-8 pb-24 space-y-8">
                <div class="flex flex-col sm:flex-row sm:items-end justify-between border-l-2 border-primary pl-4 py-1">
                    <div class="space-y-1">
                        <div class="flex items-center space-x-2 text-primary">
                            <span class="material-symbols-outlined text-sm animate-pulse glitch-title" data-text="wifi_tethering">wifi_tethering</span>
                            <span class="text-xs font-mono tracking-widest uppercase theme-neon-text-glow glitch-title" data-text="Live Data Feed // Encrypted">Live Data Feed // Encrypted</span>
                        </div>
                        <h2 class="text-xl sm:text-2xl font-display font-bold text-white glitch-title" data-text="Top Performing Factions & Operatives">Top Performing Factions & Operatives</h2>
                    </div>
                    <p class="text-xs text-gray-500 font-mono mt-2 sm:mt-0">CYCLE: 42.1 // SECTOR: GLOBAL</p>
                </div>

                <!-- PANEL 1: CLAN RANKING -->
                <section id="clan-panel" class="backdrop-blur border border-primary/30 relative flex flex-col theme-neon-shadow" style="background:rgba(10,16,30,0.72);">
                    <div class="absolute top-0 left-0 w-full h-[1px] bg-primary/50 shadow-neon"></div>
                    <div class="absolute bottom-0 left-0 w-full h-[1px] bg-primary/50 shadow-neon"></div>
                    <div class="absolute top-0 left-0 h-full w-[1px] bg-primary/50 shadow-neon"></div>
                    <div class="absolute top-0 right-0 h-full w-[1px] bg-primary/50 shadow-neon"></div>
                    <div class="p-5 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent flex justify-between items-center">
                        <h3 class="font-display font-bold text-xl uppercase tracking-wider text-white flex items-center">
                            <span class="material-symbols-outlined text-primary mr-3 shadow-neon rounded-sm p-1 bg-primary/10">groups</span>
                            Ranking Clans
                        </h3>
                        <span class="text-[10px] font-mono text-primary/70 tracking-widest uppercase border border-primary/20 px-2 py-1">Selecciona tu clan</span>
                    </div>
                    <div class="flex-1">
                        <div class="text-xs font-mono uppercase text-primary/70 border-b border-primary/20" style="display:grid;grid-template-columns:${CLAN_GRID};align-items:center;background:rgba(5,12,24,0.8);">
                            <div style="padding:14px 8px 14px 24px;text-align:center;">Rank</div>
                            <div style="padding:14px 16px;">Faction</div>
                            <div style="padding:14px 16px;text-align:center;">Operativos</div>
                            <div style="padding:14px 24px 14px 16px;text-align:right;" class="text-primary">Influencia</div>
                        </div>
                        <div id="clan-tbody">${clanRowsHTML}</div>
                    </div>
                </section>

                <!-- PANEL 2: OPERATIVES (hidden by default) -->
                <section id="coders-section" style="display:none;" class="backdrop-blur border border-blue-500/30 relative flex-col transition-all duration-300 theme-blue-shadow" style="background:rgba(10,16,30,0.72);">
                    <div id="coders-top-line" class="absolute top-0 left-0 w-full h-[1px] bg-blue-500/50 shadow-neon-blue"></div>
                    <div id="coders-bottom-line" class="absolute bottom-0 left-0 w-full h-[1px] bg-blue-500/50 shadow-neon-blue"></div>
                    <div id="coders-left-line" class="absolute top-0 left-0 h-full w-[1px] bg-blue-500/50 shadow-neon-blue"></div>
                    <div id="coders-right-line" class="absolute top-0 right-0 h-full w-[1px] bg-blue-500/50 shadow-neon-blue"></div>
                    <div class="p-5 border-b border-blue-500/20 bg-gradient-to-r from-transparent to-blue-500/10 flex justify-between items-center">
                        <h3 class="font-display font-bold text-xl uppercase tracking-wider text-white flex items-center">
                            <span class="material-symbols-outlined text-blue-500 mr-3 p-1 bg-blue-500/10" id="coders-icon">terminal</span>
                            <span id="coders-title">Ranking Coders</span>
                            <span id="coders-count" class="ml-3 text-xs font-mono text-blue-500/60 border border-blue-500/20 px-2 py-0.5">0 OPS</span>
                        </h3>
                        <button id="back-btn" class="flex items-center gap-1 text-xs font-mono border border-gray-600 px-3 py-1.5 text-gray-300 transition-all uppercase tracking-wider hover:opacity-80">
                            <span class="material-symbols-outlined text-sm leading-none">arrow_back</span>
                            Volver
                        </button>
                    </div>
                    <div class="overflow-x-auto flex-1 relative">
                        <table class="w-full text-left border-collapse">
                            <thead class="sticky top-0 z-10">
                                <tr id="coders-thead-row" class="text-xs font-mono uppercase text-blue-500/70 border-b border-blue-500/20" style="background:rgba(5,12,24,0.8);">
                                    <th class="py-4 pl-6 pr-2 font-medium w-16 text-center">Rank</th>
                                    <th class="py-4 px-4 font-medium">Operativo</th>
                                    <th class="py-4 px-4 font-medium text-center">Clan</th>
                                    <th class="py-4 px-4 pr-6 font-medium text-right text-blue-500">Pts</th>
                                </tr>
                            </thead>
                            <tbody id="coders-tbody" class="text-sm font-display divide-y divide-gray-800"></tbody>
                        </table>
                    </div>
                </section>

            </main>
        </div>
    `);

    // Glitch animation for leaderboard labels (staggered timings)
    const glitchTargets = container.querySelectorAll('.glitch-title');
    const scheduleGlitch = (el) => {
        const run = () => {
            if (!container.isConnected) return;
            el.classList.remove('active-glitch');
            void el.offsetWidth;
            el.classList.add('active-glitch');
            const nextDelay = 1800 + Math.random() * 3200;
            setTimeout(run, nextDelay);
        };
        const initialDelay = 400 + Math.random() * 2400;
        setTimeout(run, initialDelay);
    };
    glitchTargets.forEach(scheduleGlitch);

    const clanPanel = container.querySelector('#clan-panel');
    const codersSection = container.querySelector('#coders-section');
    const codersTbody = container.querySelector('#coders-tbody');
    const codersTitle = container.querySelector('#coders-title');
    const codersCount = container.querySelector('#coders-count');
    const codersIcon = container.querySelector('#coders-icon');
    const theadRow = container.querySelector('#coders-thead-row');
    const backBtn = container.querySelector('#back-btn');
    const borderLines = ['#coders-top-line', '#coders-bottom-line', '#coders-left-line', '#coders-right-line']
        .map((id) => container.querySelector(id));

    const setLineColors = (hex) => borderLines.forEach((el) => { if (el) el.style.background = hex; });

    // Show operatives panel and hide clans
    const showCoders = (clanKey) => {
        const s = getClanStyles(clanKey);
        const filtered = allUsers.filter((u) => (u.clan || '').toLowerCase() === clanKey);
        const label = clanKey ? clanKey.charAt(0).toUpperCase() + clanKey.slice(1) : 'Clan';

        // Populate table
        codersTbody.innerHTML = filtered.length > 0
            ? filtered.map((u, i) => renderUserRow(u, i)).join('')
            : emptyState(`No hay operativos en ${label} aun`);

        // Update header
        codersTitle.textContent = `${label} - Operativos`;
        codersCount.textContent = `${filtered.length} OPS`;
        codersCount.style.color = s.borderHex;
        codersCount.style.borderColor = s.borderHex + '55';
        codersIcon.style.color = s.borderHex;
        codersSection.style.borderColor = s.borderHex + '70';
        codersSection.style.boxShadow = `0 0 20px ${s.accentColor}`;
        theadRow.style.color = s.borderHex + 'aa';
        setLineColors(s.borderHex + '80');
        backBtn.style.color = s.borderHex;
        backBtn.style.borderColor = s.borderHex + '60';

        // Swap panels
        clanPanel.style.display = 'none';
        codersSection.style.display = 'flex';
    };

    // Back to clans panel
    const showClans = () => {
        codersSection.style.display = 'none';
        clanPanel.style.display = 'flex';
    };

    // Bind clan rows - only own clan is clickable
    const clanBody = container.querySelector('#clan-tbody');
    if (clanBody) {
        clanBody.querySelectorAll('.clan-row').forEach((row) => {
            const clanKey = row.dataset.clan;
            if (clanKey === userClanKey) {
                row.addEventListener('click', () => showCoders(clanKey));
            }
        });
    }

    if (backBtn) backBtn.addEventListener('click', showClans);

    return container;
}
