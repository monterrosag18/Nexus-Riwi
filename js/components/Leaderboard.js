import { store } from '../store.js';

export default function renderLeaderboard() {
    const container = document.createElement('div');
    container.className = 'view-content fade-in w-full h-full';
    container.style.padding = '0';
    container.style.margin = '0';

    // Add dark class for Tailwind
    container.classList.add('dark');

    // Get Data
    const state = store.getState();
    const clans = Object.values(state.clans).sort((a, b) => b.points - a.points);
    const currentUser = state.currentUser || { name: 'GUEST', clan: 'undefined' };

    // Function to get Clan specific colors and icons
    const getClanStyles = (clanName) => {
        const name = clanName.toLowerCase();
        if (name === 'turing') return { icon: 'security', colorClass: 'text-primary', bgClass: 'bg-primary/10 border-primary', glowClass: 'shadow-[0_0_10px_rgba(0,240,255,0.8)]' };
        if (name === 'tesla') return { icon: 'bolt', colorClass: 'text-electric-blue', bgClass: 'bg-electric-blue/10 border-electric-blue', glowClass: 'shadow-[0_0_10px_rgba(41,121,255,0.8)]' };
        if (name === 'mccarthy') return { icon: 'code', colorClass: 'text-green-400', bgClass: 'bg-green-400/10 border-green-400', glowClass: 'shadow-[0_0_10px_rgba(74,222,128,0.8)]' };
        if (name === 'lovelace') return { icon: 'memory', colorClass: 'text-purple-400', bgClass: 'bg-purple-400/10 border-purple-400', glowClass: 'shadow-[0_0_10px_rgba(192,132,252,0.8)]' };
        if (name === 'neumann') return { icon: 'lightbulb', colorClass: 'text-yellow-400', bgClass: 'bg-yellow-400/10 border-yellow-400', glowClass: 'shadow-[0_0_10px_rgba(250,204,21,0.8)]' };
        return { icon: 'shield', colorClass: 'text-gray-400', bgClass: 'bg-gray-400/10', glowClass: '' };
    };

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
                            <h3 class="font-display font-bold text-xl uppercase tracking-wider text-white flex items-center"><span class="material-symbols-outlined text-primary mr-3 shadow-neon rounded-sm p-1 bg-primary/10">groups</span>Ranking Clans</h3>
                            <button class="text-xs font-mono text-primary border border-primary/50 px-3 py-1 hover:bg-primary hover:text-black transition-all uppercase tracking-wider">Expand View</button>
                        </div>
                        
                        <div class="overflow-x-auto flex-1">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="text-xs font-mono uppercase text-primary/70 border-b border-primary/20 bg-gray-900">
                                        <th class="py-4 pl-6 pr-2 font-medium w-16 text-center">Rank</th>
                                        <th class="py-4 px-4 font-medium">Faction</th>
                                        <th class="py-4 px-4 font-medium text-center">Operatives</th>
                                        <th class="py-4 px-4 pr-6 font-medium text-right text-primary">Influence</th>
                                    </tr>
                                </thead>
                                <tbody class="text-sm font-display divide-y divide-gray-800">
                                    ${clans.map((clan, index) => {
        const styles = getClanStyles(clan.name);
        const rankColors = [
            'bg-yellow-500/10 text-yellow-500 border-yellow-500 shadow-[0_0_10px_rgba(255,215,0,0.3)]', // Gold
            'bg-gray-400/10 text-gray-400 border-gray-400 shadow-[0_0_10px_rgba(192,192,192,0.3)]', // Silver
            'bg-orange-700/10 text-orange-700 border-orange-700 shadow-[0_0_10px_rgba(205,127,50,0.3)]'  // Bronze
        ];
        const isTop3 = index < 3;
        const rankClass = isTop3 ? rankColors[index] : 'text-gray-500 border-transparent';

        return `
                                        <tr class="hover:bg-primary/5 transition-colors group/row border-l-2 border-transparent hover:border-primary">
                                            <td class="py-4 pl-6 pr-2 text-center">
                                                <div class="w-8 h-8 mx-auto flex items-center justify-center border text-sm font-bold ${rankClass}">
                                                    ${index + 1}
                                                </div>
                                            </td>
                                            <td class="py-4 px-4">
                                                <div class="flex items-center space-x-3">
                                                    <div class="p-1.5 bg-gray-900 border border-gray-700">
                                                        <span class="material-symbols-outlined ${styles.colorClass} text-sm">${styles.icon}</span>
                                                    </div>
                                                    <span class="font-bold ${isTop3 ? 'text-white text-lg' : 'text-gray-300'} tracking-wide group-hover/row:${styles.colorClass} transition-colors">${clan.name.toUpperCase()}</span>
                                                </div>
                                            </td>
                                            <td class="py-4 px-4 text-center text-gray-400 font-mono">${clan.members}</td>
                                            <td class="py-4 px-4 pr-6 text-right font-bold ${styles.colorClass} ${isTop3 ? 'text-lg' : ''} font-mono tracking-wider ${styles.glowClass}">${clan.points.toLocaleString()}</td>
                                        </tr>
                                        `;
    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <!-- OPERATIVES RANKING -->
                    <section class="bg-gray-900/80 backdrop-blur border border-blue-500/30 relative group h-full flex flex-col mt-4" style="box-shadow: 0 0 15px rgba(41,121,255,0.15);">
                        <div class="absolute top-0 left-0 w-full h-[1px] bg-blue-500/50 shadow-neon-blue"></div>
                        <div class="absolute bottom-0 left-0 w-full h-[1px] bg-blue-500/50 shadow-neon-blue"></div>
                        <div class="absolute top-0 left-0 h-full w-[1px] bg-blue-500/50 shadow-neon-blue"></div>
                        <div class="absolute top-0 right-0 h-full w-[1px] bg-blue-500/50 shadow-neon-blue"></div>
                        
                        <div class="p-5 border-b border-blue-500/20 bg-gradient-to-r from-transparent to-blue-500/10 flex justify-between items-center">
                            <h3 class="font-display font-bold text-xl uppercase tracking-wider text-white flex items-center"><span class="material-symbols-outlined text-blue-500 mr-3 shadow-neon-blue p-1 bg-blue-500/10">terminal</span>Ranking Coders</h3>
                            <button class="text-gray-400 hover:text-white p-1 transition-colors"><span class="material-symbols-outlined text-sm">filter_list</span></button>
                        </div>
                        
                        <div class="overflow-x-auto flex-1 relative">
                            <table class="w-full text-left border-collapse">
                                <thead class="sticky top-0 z-10">
                                    <tr class="text-xs font-mono uppercase text-blue-500/70 border-b border-blue-500/20 bg-gray-900">
                                        <th class="py-4 pl-6 pr-2 font-medium w-16 text-center">Rank</th>
                                        <th class="py-4 px-4 font-medium">Operative</th>
                                        <th class="py-4 px-4 font-medium text-center">Clan</th>
                                        <th class="py-4 px-4 pr-6 font-medium text-right text-blue-500">Pts</th>
                                    </tr>
                                </thead>
                                <tbody class="text-sm font-display divide-y divide-gray-800">
                                    <!-- Using STATIC user data requested from external project to match visual -->
                                    <tr class="hover:bg-blue-500/5 transition-colors group/row border-l-2 border-transparent hover:border-blue-500">
                                        <td class="py-4 pl-6 pr-2 text-center">
                                            <div class="w-8 h-8 mx-auto bg-yellow-500/10 text-yellow-500 flex items-center justify-center border border-yellow-500 shadow-[0_0_10px_rgba(255,215,0,0.3)] text-sm font-bold">1</div>
                                        </td>
                                        <td class="py-4 px-4">
                                            <div class="flex items-center space-x-3">
                                                <div class="w-8 h-8 bg-gray-800 border border-gray-600 overflow-hidden relative">
                                                    <div class="absolute inset-0 bg-gradient-to-tr from-yellow-500/20 to-transparent z-10"></div>
                                                    <img alt="avatar" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrxjpTUcCth9eqfx_X6Z5FZ_jrAluC5QC0sXDpHTPbaF4BFJG37YuokGkQG2rvTeGr4Dd7rL0ZS1i2_7MSg-zlNLvNtCHRxi_6jc8zq_qqDk-A_p75rTxsTgMIIMyUVxUP7u0IpkZvI-dwCTJdjys4m4y0upBEG75BxJ-Iy3QKT1GNs7Bva2SOU-p3j8FWYjgnyhhWvyLp5p58xyhnUMTfKPW4-fCZRSFzlUBLtDCOxQgr5TdNAmVSHgYlb4NFYol8_BeoKw5zngXC" />
                                                </div>
                                                <span class="font-bold text-white tracking-wide group-hover/row:text-blue-500 transition-colors">Monterrosa</span>
                                            </div>
                                        </td>
                                        <td class="py-4 px-4 text-center">
                                            <span class="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/40 shadow-[0_0_5px_rgba(0,240,255,0.2)]">Turing</span>
                                        </td>
                                        <td class="py-4 px-4 pr-6 text-right font-bold text-pink-500 font-mono tracking-wider shadow-neon-magenta text-base">1000</td>
                                    </tr>
                                    <tr class="hover:bg-blue-500/5 transition-colors group/row border-l-2 border-transparent hover:border-blue-500">
                                        <td class="py-4 pl-6 pr-2 text-center">
                                            <div class="w-8 h-8 mx-auto bg-gray-400/10 text-gray-400 flex items-center justify-center border border-gray-400 shadow-[0_0_10px_rgba(192,192,192,0.3)] text-sm font-bold">2</div>
                                        </td>
                                        <td class="py-4 px-4">
                                            <div class="flex items-center space-x-3">
                                                <div class="w-8 h-8 bg-gray-800 border border-gray-600 overflow-hidden relative">
                                                    <div class="absolute inset-0 bg-gradient-to-tr from-gray-400/20 to-transparent z-10"></div>
                                                    <img alt="avatar" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpe8O6FzyD8i9CmhdzUOexqFw0rRKdOX6hh53LFrKjjtzVXWBFFaNHBOL9nEgcYET9smLerzYXF233PQZr3s_CoS-Y8SJOWNL_ImKX8luj3fFcsje97V7YF7w-3QHpoeLDPlfKLRQ_Op-04-U8-3Ri8TkyRBxvGyDtlAviCo58hR5K0hGdDJZRRQl_7SHvu4DHdtA_WNeAceUcnFL7eOEoUKXW5xX0KfWD8jbZXCUp8q8xbuUUMrEngFvN0I55iEBonicic9H7pSSk" />
                                                </div>
                                                <span class="font-bold text-white tracking-wide group-hover/row:text-blue-500 transition-colors">JuanJosé</span>
                                            </div>
                                        </td>
                                        <td class="py-4 px-4 text-center">
                                            <span class="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-green-400/10 text-green-400 border border-green-400/40">McCarthy</span>
                                        </td>
                                        <td class="py-4 px-4 pr-6 text-right font-bold text-gray-300 font-mono tracking-wider">1000</td>
                                    </tr>
                                    <tr class="hover:bg-blue-500/5 transition-colors group/row border-l-2 border-transparent hover:border-blue-500">
                                        <td class="py-4 pl-6 pr-2 text-center">
                                            <div class="w-8 h-8 mx-auto bg-orange-700/10 text-orange-700 flex items-center justify-center border border-orange-700 shadow-[0_0_10px_rgba(205,127,50,0.3)] text-sm font-bold">3</div>
                                        </td>
                                        <td class="py-4 px-4">
                                            <div class="flex items-center space-x-3">
                                                <div class="w-8 h-8 bg-gray-800 border border-gray-600 overflow-hidden relative">
                                                    <div class="absolute inset-0 bg-gradient-to-tr from-orange-700/20 to-transparent z-10"></div>
                                                    <img alt="avatar" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0cYp-cOx3QrTLfQi67B4u6Qm-V8_QENM_q9igAlmJWFKLP23ZXdQ1r-rubkmMzFId2pnRYDCHgwfaMlyLuO0kLWnr4F6fU67XHNWDcv4NOgh_QACM2vcY0MpjtIsvw46Bl9Z4FqKvJDJHznBm0VE4gNUNsJvVFyzz5X_rbFcTNipacNjiE1sA15ThW-fIbTU5Z2-vNaLHCnEC_j_V1vy5W_9l6QWNmrGRe6xvbOLlC76p1unUSMqNBk8MAJBsswUwTDmgoa3PrKhY" />
                                                </div>
                                                <span class="font-bold text-white tracking-wide group-hover/row:text-blue-500 transition-colors">Danna</span>
                                            </div>
                                        </td>
                                        <td class="py-4 px-4 text-center">
                                            <span class="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-green-400/10 text-green-400 border border-green-400/40">McCarthy</span>
                                        </td>
                                        <td class="py-4 px-4 pr-6 text-right font-bold text-gray-300 font-mono tracking-wider">1000</td>
                                    </tr>
                                    <tr class="hover:bg-blue-500/5 transition-colors group/row border-l-2 border-transparent hover:border-blue-500">
                                        <td class="py-4 pl-6 pr-2 text-center text-gray-500 font-bold font-mono text-lg">4</td>
                                        <td class="py-4 px-4">
                                            <div class="flex items-center space-x-3">
                                                <div class="w-8 h-8 bg-gray-800 border border-gray-600 overflow-hidden">
                                                    <img alt="avatar" class="w-full h-full object-cover opacity-60 group-hover/row:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOhGH5rMurR5z_3KTKHDyt8ZHfC_FByb2qY-5UruyboLbOfPHBGwEul3knpV4W57SHK1vsj6vF8t-ybZD365qF05rxlz1WmM23-0X-YUdw7bbedB4pRs1Ef_PbEHOEjW5mIIUchhycOCqwiwvNX2iFlr9y2jlmsoDUTF9ai1wYcpqWdKSlHiY6f9AiLH-7UtGhh5kvXNPPxGa6p7xrkY_uu-v8hUJjl4VtltTYgEy-rZ986DSKiBX8CdEWX4EWEmcjh_P2ViE4dfLr" />
                                                </div>
                                                <span class="font-bold text-gray-300 tracking-wide group-hover/row:text-white transition-colors">Camilo</span>
                                            </div>
                                        </td>
                                        <td class="py-4 px-4 text-center">
                                            <span class="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/40">Turing</span>
                                        </td>
                                        <td class="py-4 px-4 pr-6 text-right font-bold text-gray-400 font-mono tracking-wider">1000</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    `;

    return container;
}
