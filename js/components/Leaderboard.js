import { store } from '../store.js';

export default function renderLeaderboard() {
    const container = document.createElement('div');
    container.className = 'view-content fade-in w-full h-full';
    container.style.padding = '0';
    container.style.margin = '0';
    container.classList.add('dark');

    // Get Data
    const state = store.getState();
    const clans = Object.values(state.clans).sort((a, b) => b.points - a.points);
    const currentUser = state.currentUser || { name: 'GUEST', clan: 'undefined' };
    const allUsers = store.getRegisteredUsers().sort((a, b) => (b.points || 0) - (a.points || 0));

    // Filter state — null = todos
    let activeClanFilter = null;

    // Helpers
    const getClanStyles = (clanName) => {
        const name = (clanName || '').toLowerCase();
        if (name === 'turing')   return { icon: 'security',  colorClass: 'text-primary',    bgClass: 'bg-primary/10 border-primary',       glowClass: 'shadow-[0_0_10px_rgba(0,240,255,0.8)]',   badgeClass: 'bg-primary/10 text-primary border-primary/40',          accentColor: 'rgba(0,240,255,0.12)',  borderHex: '#00f0ff' };
        if (name === 'tesla')    return { icon: 'bolt',       colorClass: 'text-blue-400',   bgClass: 'bg-blue-500/10 border-blue-500',     glowClass: 'shadow-[0_0_10px_rgba(41,121,255,0.8)]',  badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/40',       accentColor: 'rgba(41,121,255,0.12)', borderHex: '#2979ff' };
        if (name === 'mccarthy') return { icon: 'code',       colorClass: 'text-green-400',  bgClass: 'bg-green-400/10 border-green-400',   glowClass: 'shadow-[0_0_10px_rgba(74,222,128,0.8)]',  badgeClass: 'bg-green-400/10 text-green-400 border-green-400/40',    accentColor: 'rgba(74,222,128,0.12)', borderHex: '#4ade80' };
        if (name === 'thompson') return { icon: 'memory',     colorClass: 'text-purple-400', bgClass: 'bg-purple-400/10 border-purple-400', glowClass: 'shadow-[0_0_10px_rgba(192,132,252,0.8)]', badgeClass: 'bg-purple-400/10 text-purple-400 border-purple-400/40', accentColor: 'rgba(192,132,252,0.12)',borderHex: '#c084fc' };
        if (name === 'halmiton') return { icon: 'lightbulb',  colorClass: 'text-yellow-400', bgClass: 'bg-yellow-400/10 border-yellow-400', glowClass: 'shadow-[0_0_10px_rgba(250,204,21,0.8)]',  badgeClass: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/40', accentColor: 'rgba(250,204,21,0.12)', borderHex: '#facc15' };
        return { icon: 'shield', colorClass: 'text-gray-400', bgClass: 'bg-gray-400/10', glowClass: '', badgeClass: 'bg-gray-400/10 text-gray-400 border-gray-400/40', accentColor: 'rgba(150,150,150,0.1)', borderHex: '#6b7280' };
    };

    const getAvatarBg = (clanName) => {
        const name = (clanName || '').toLowerCase();
        if (name === 'turing')   return 'from-cyan-500/40 to-cyan-900/60';
        if (name === 'tesla')    return 'from-blue-500/40 to-blue-900/60';
        if (name === 'mccarthy') return 'from-green-500/40 to-green-900/60';
        if (name === 'thompson') return 'from-purple-500/40 to-purple-900/60';
        if (name === 'halmiton') return 'from-yellow-500/40 to-yellow-900/60';
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
        const initials = user.name.slice(0, 2).toUpperCase();
        const isCurrentUser = currentUser.name && currentUser.name.toLowerCase() === user.name.toLowerCase();
        const pointsColor = index === 0 ? 'text-pink-500' : isTop3 ? 'text-gray-300' : 'text-gray-400';

        return `
            <tr class="hover:bg-blue-500/5 transition-colors group/row border-l-2 ${isCurrentUser ? 'border-blue-400 bg-blue-500/5' : 'border-transparent hover:border-blue-500'}">
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
                            ${isCurrentUser ? '<div class="absolute inset-0 border border-blue-400 opacity-60"></div>' : ''}
                        </div>
                        <span class="font-bold ${isTop3 ? 'text-white' : 'text-gray-300'} tracking-wide group-hover/row:text-blue-400 transition-colors">
                            ${user.name}
                            ${isCurrentUser ? '<span class="ml-2 text-[9px] text-blue-400 font-mono uppercase tracking-widest border border-blue-500/40 px-1 py-0.5">YOU</span>' : ''}
                        </span>
                    </div>
                </td>
                <td class="py-4 px-4 text-center">
                    <span class="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider border ${styles.badgeClass}">${user.clan || 'N/A'}</span>
                </td>
                <td class="py-4 px-4 pr-6 text-right font-bold ${pointsColor} font-mono tracking-wider">${(user.points || 0).toLocaleString()}</td>
            </tr>
        `;
    };

    const emptyState = (msg = 'No operatives registered yet') => `
        <tr>
            <td colspan="4" class="py-16 text-center">
                <span class="material-symbols-outlined text-4xl text-gray-700 block mb-3">person_off</span>
                <p class="text-gray-600 font-mono text-sm uppercase tracking-widest">${msg}</p>
            </td>
        </tr>
    `;

    // Clan rows as divs with CSS grid for guaranteed alignment
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
        return '<div data-clan="' + clan.name.toLowerCase() + '" class="clan-row cursor-pointer transition-all border-l-2 border-transparent select-none border-b border-gray-800 hover:bg-white/5" style="display:grid;grid-template-columns:' + CLAN_GRID + ';align-items:center;">'
            + '<div style="padding:14px 8px 14px 24px;display:flex;justify-content:center;">'
            +   '<div class="w-8 h-8 flex items-center justify-center border text-sm font-bold font-mono ' + rankClass + '">' + (index+1) + '</div>'
            + '</div>'
            + '<div style="padding:14px 16px;display:flex;align-items:center;gap:12px;overflow:hidden;">'
            +   '<div class="p-1.5 bg-gray-900 border border-gray-700 flex-shrink-0"><span class="material-symbols-outlined ' + styles.colorClass + ' text-sm">' + styles.icon + '</span></div>'
            +   '<span class="font-bold font-display tracking-wide ' + (isTop3 ? 'text-white text-lg' : 'text-gray-300') + '" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + clan.name.toUpperCase() + '</span>'
            + '</div>'
            + '<div style="padding:14px 16px;text-align:center;" class="text-gray-400 font-mono text-sm">' + clan.members + '</div>'
            + '<div style="padding:14px 24px 14px 16px;text-align:right;display:flex;align-items:center;justify-content:flex-end;gap:8px;">'
            +   '<span class="font-bold font-mono tracking-wider ' + styles.colorClass + ' ' + (isTop3 ? 'text-lg' : 'text-sm') + ' ' + styles.glowClass + '">' + clan.points.toLocaleString() + '</span>'
            +   '<span class="material-symbols-outlined text-sm" style="color:#374151;">chevron_right</span>'
            + '</div>'
            + '</div>';
    }).join('');

    container.innerHTML = `
        <div class="flex-1 flex flex-col w-full h-full text-gray-100 font-body antialiased selection:bg-primary selection:text-black overflow-y-auto custom-scrollbar relative" style="background-color: #050509; background-image: linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px); background-size: 40px 40px; min-height: 100vh;">
            
            <header class="w-full pt-4 pb-4 px-6 flex justify-between items-center bg-surface-dark/90 backdrop-blur-md border-b border-primary/20 sticky top-0 z-40" style="box-shadow: 0 0 10px rgba(0, 240, 255, 0.2), inset 0 0 20px rgba(0, 240, 255, 0.05);">
                <div class="flex flex-col">
                    <span class="text-[10px] font-display tracking-[0.2em] text-primary/80 uppercase mb-1">System Status: Online</span>
                    <h1 class="text-xl md:text-3xl font-display font-bold text-white uppercase tracking-widest" style="text-shadow: 0 0 5px rgba(0, 240, 255, 0.7);">Global Rankings</h1>
                </div>
                <div class="flex items-center space-x-4 z-50">
                    <div class="text-right hidden sm:block">
                        <p class="text-sm font-bold text-primary font-display tracking-wide uppercase">COMMANDER ${currentUser.name}</p>
                        <div class="flex items-center justify-end space-x-1">
                            <span class="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <p class="text-xs text-gray-400 font-mono">Lvl 42 // ${currentUser.clan.toUpperCase()}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 mb-8 pb-24">
                <div class="flex flex-col sm:flex-row sm:items-end justify-between border-l-2 border-primary pl-4 py-1">
                    <div class="space-y-1">
                        <div class="flex items-center space-x-2 text-primary">
                            <span class="material-symbols-outlined text-sm animate-pulse">wifi_tethering</span>
                            <span class="text-xs font-mono tracking-widest uppercase" style="text-shadow: 0 0 5px rgba(0,240,255,0.7);">Live Data Feed // Encrypted</span>
                        </div>
                        <h2 class="text-xl sm:text-2xl font-display font-bold text-white">Top Performing Factions & Operatives</h2>
                    </div>
                    <p class="text-xs text-gray-500 font-mono mt-2 sm:mt-0">CYCLE: 42.1 // SECTOR: GLOBAL</p>
                </div>

                <div class="grid grid-cols-1 gap-8">
                    <!-- CLAN RANKING -->
                    <section class="bg-gray-900/80 backdrop-blur border border-primary/30 relative group h-full flex flex-col" style="box-shadow: 0 0 10px rgba(0, 240, 255, 0.2), inset 0 0 20px rgba(0, 240, 255, 0.05);">
                        <div class="absolute top-0 left-0 w-full h-[1px] bg-primary/50 shadow-neon"></div>
                        <div class="absolute bottom-0 left-0 w-full h-[1px] bg-primary/50 shadow-neon"></div>
                        <div class="absolute top-0 left-0 h-full w-[1px] bg-primary/50 shadow-neon"></div>
                        <div class="absolute top-0 right-0 h-full w-[1px] bg-primary/50 shadow-neon"></div>
                        
                        <div class="p-5 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent flex justify-between items-center">
                            <h3 class="font-display font-bold text-xl uppercase tracking-wider text-white flex items-center">
                                <span class="material-symbols-outlined text-primary mr-3 shadow-neon rounded-sm p-1 bg-primary/10">groups</span>
                                Ranking Clans
                            </h3>
                            <span class="text-[10px] font-mono text-primary/40 tracking-widest uppercase border border-primary/20 px-2 py-1">Tap row to filter ↓</span>
                        </div>
                        
                        <div class="flex-1">
                            <div class="text-xs font-mono uppercase text-primary/70 border-b border-primary/20 bg-gray-900" style="display:grid;grid-template-columns:80px 1fr 130px 150px;align-items:center;">
                                <div style="padding:14px 8px 14px 24px;text-align:center;">Rank</div>
                                <div style="padding:14px 16px;">Faction</div>
                                <div style="padding:14px 16px;text-align:center;">Operatives</div>
                                <div style="padding:14px 24px 14px 16px;text-align:right;color:var(--primary,#00f0ff);">Influence</div>
                            </div>
                            <div id="clan-tbody">
                                ${clanRowsHTML}
                            </div>
                        </div>
                    </section>

                    <!-- OPERATIVES RANKING — Dynamic + filterable -->
                    <section id="coders-section" class="bg-gray-900/80 backdrop-blur border border-blue-500/30 relative h-full flex flex-col mt-4 transition-all duration-300" style="box-shadow: 0 0 15px rgba(41,121,255,0.15);">
                        <div id="coders-top-line"    class="absolute top-0 left-0 w-full h-[1px] bg-blue-500/50"></div>
                        <div id="coders-bottom-line" class="absolute bottom-0 left-0 w-full h-[1px] bg-blue-500/50"></div>
                        <div id="coders-left-line"   class="absolute top-0 left-0 h-full w-[1px] bg-blue-500/50"></div>
                        <div id="coders-right-line"  class="absolute top-0 right-0 h-full w-[1px] bg-blue-500/50"></div>
                        
                        <div class="p-5 border-b border-blue-500/20 bg-gradient-to-r from-transparent to-blue-500/10 flex justify-between items-center">
                            <h3 class="font-display font-bold text-xl uppercase tracking-wider text-white flex items-center">
                                <span class="material-symbols-outlined text-blue-500 mr-3 p-1 bg-blue-500/10" id="coders-icon">terminal</span>
                                <span id="coders-title">Ranking Coders</span>
                                <span id="coders-count" class="ml-3 text-xs font-mono text-blue-500/60 border border-blue-500/20 px-2 py-0.5">${allUsers.length} OPS</span>
                            </h3>
                            <button id="clear-filter-btn" class="hidden items-center gap-1 text-xs font-mono border px-3 py-1.5 transition-all uppercase tracking-wider hover:opacity-80">
                                <span class="material-symbols-outlined text-sm leading-none">close</span>
                                Ver todos
                            </button>
                        </div>
                        
                        <div class="overflow-x-auto flex-1 relative">
                            <table class="w-full text-left border-collapse">
                                <thead class="sticky top-0 z-10">
                                    <tr id="coders-thead-row" class="text-xs font-mono uppercase text-blue-500/70 border-b border-blue-500/20 bg-gray-900">
                                        <th class="py-4 pl-6 pr-2 font-medium w-16 text-center">Rank</th>
                                        <th class="py-4 px-4 font-medium">Operative</th>
                                        <th class="py-4 px-4 font-medium text-center">Clan</th>
                                        <th class="py-4 px-4 pr-6 font-medium text-right text-blue-500">Pts</th>
                                    </tr>
                                </thead>
                                <tbody id="coders-tbody" class="text-sm font-display divide-y divide-gray-800">
                                    ${allUsers.length > 0
                                        ? allUsers.map((u, i) => renderUserRow(u, i)).join('')
                                        : emptyState()
                                    }
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    `;

    // ── Interactivity ────────────────────────────────────────────────────────

    const codersSection   = container.querySelector('#coders-section');
    const codersTbody     = container.querySelector('#coders-tbody');
    const codersTitle     = container.querySelector('#coders-title');
    const codersCount     = container.querySelector('#coders-count');
    const codersIcon      = container.querySelector('#coders-icon');
    const clearBtn        = container.querySelector('#clear-filter-btn');
    const clanTbody       = container.querySelector('#clan-tbody');
    const theadRow        = container.querySelector('#coders-thead-row');

    const borderLines = ['#coders-top-line','#coders-bottom-line','#coders-left-line','#coders-right-line']
        .map(id => container.querySelector(id));

    const setLineColors = (hex) => {
        borderLines.forEach(el => { if (el) el.style.background = hex; });
    };

    const highlightClanRow = (clanKey) => {
        clanTbody.querySelectorAll('.clan-row').forEach(row => {
            const active = row.dataset.clan === clanKey;
            const s = getClanStyles(row.dataset.clan);
            row.style.borderLeftColor = active ? s.borderHex : 'transparent';
            row.style.backgroundColor = active ? s.accentColor : '';
        });
    };

    const resetClanRows = () => {
        clanTbody.querySelectorAll('.clan-row').forEach(row => {
            row.style.borderLeftColor = 'transparent';
            row.style.backgroundColor = '';
        });
    };

    const applyFilter = (clanKey) => {
        const s = getClanStyles(clanKey);
        const filtered = allUsers.filter(u => (u.clan || '').toLowerCase() === clanKey);

        // Coders table
        codersTbody.innerHTML = filtered.length > 0
            ? filtered.map((u, i) => renderUserRow(u, i)).join('')
            : emptyState(`No operatives in ${clanKey.toUpperCase()} yet`);

        // Header
        const label = clanKey.charAt(0).toUpperCase() + clanKey.slice(1);
        codersTitle.textContent = `${label} Coders`;
        codersCount.textContent = `${filtered.length} OPS`;
        codersCount.style.color       = s.borderHex;
        codersCount.style.borderColor = s.borderHex + '55';
        codersIcon.style.color        = s.borderHex;

        // Section border + glow
        codersSection.style.borderColor = s.borderHex + '70';
        codersSection.style.boxShadow   = `0 0 20px ${s.accentColor}`;
        setLineColors(s.borderHex + '80');

        // Thead accent
        theadRow.style.color = s.borderHex + 'aa';

        // Clear button
        clearBtn.style.color       = s.borderHex;
        clearBtn.style.borderColor = s.borderHex + '60';
        clearBtn.classList.remove('hidden');
        clearBtn.classList.add('flex');

        // Highlight row
        highlightClanRow(clanKey);

        // Scroll
        codersSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    const clearFilter = () => {
        activeClanFilter = null;

        codersTbody.innerHTML = allUsers.length > 0
            ? allUsers.map((u, i) => renderUserRow(u, i)).join('')
            : emptyState();

        codersTitle.textContent = 'Ranking Coders';
        codersCount.textContent = `${allUsers.length} OPS`;
        codersCount.style.color       = '';
        codersCount.style.borderColor = '';
        codersIcon.style.color        = '';

        codersSection.style.borderColor = '';
        codersSection.style.boxShadow   = '0 0 15px rgba(41,121,255,0.15)';
        setLineColors('');

        theadRow.style.color = '';

        clearBtn.classList.add('hidden');
        clearBtn.classList.remove('flex');

        resetClanRows();
    };

    // Bind clan row clicks
    clanTbody.querySelectorAll('.clan-row').forEach(row => {
        row.addEventListener('click', () => {
            const clanKey = row.dataset.clan;
            if (activeClanFilter === clanKey) {
                clearFilter(); // toggle off
            } else {
                activeClanFilter = clanKey;
                applyFilter(clanKey);
            }
        });
    });

    clearBtn.addEventListener('click', clearFilter);

    return container;
}