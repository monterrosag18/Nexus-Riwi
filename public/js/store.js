/**
 * Simple Pub/Sub State Management
 */
class Store {
    constructor() {
        let savedUser = null;
        try {
            const stored = localStorage.getItem('riwi_user');
            if (stored) {
                savedUser = JSON.parse(stored);
                if (typeof savedUser.credits === 'undefined') savedUser.credits = 2000;
            }
        } catch (e) {
            console.error('Error loading user', e);
        }

        this.state = {
            currentView: savedUser ? 'leaderboard' : 'login',
            currentUser: savedUser,
            clans: {}, // Loaded via API
            territories: [], // Loaded via API
            cosmetics: [
                { id: 'skin_neon_pink', name: 'NEON PINK OVERLAY', cost: 1500, type: 'skin', color: '#ff00ff' },
                { id: 'skin_gold_glitch', name: 'GOLDEN GLITCH', cost: 3000, type: 'skin', color: '#ffd700' },
                { id: 'skin_matrix_rain', name: 'MATRIX RAIN', cost: 5000, type: 'skin', color: '#00ff41' },
                { id: 'chat_cyan', name: 'CYAN CHAT MOD', cost: 800, type: 'chat', color: '#00ffff' },
                { id: 'chat_lava', name: 'LAVA CHAT MOD', cost: 1200, type: 'chat', color: '#ff4400' },
                { id: 'chat_toxic', name: 'TOXIC GREEN CHAT', cost: 900, type: 'chat', color: '#39ff14' },
                { id: 'border_shimmer', name: 'SHIMMER BORDER', cost: 2500, type: 'border', color: '#ffffff' },
                { id: 'border_obsidian', name: 'OBSIDIAN BORDER', cost: 3500, type: 'border', color: '#1a1a1a' },
                { id: 'shield_plasma', name: 'PLASMA SHIELD', cost: 4000, type: 'shield', color: '#7b61ff' }
            ]
        };
        this.listeners = [];

        // --- ASYNC INIT ---
        // We start loading immediately, but we don't block the UI threads.
        // Views that need this data should await store.initialLoadPromise if necessary.
        this.initialLoadPromise = this.loadInitialData();

        // --- EVENT LOG SYSTEM ---
        try {
            this.eventLog = JSON.parse(localStorage.getItem('riwi_events')) || [];
        } catch(e) { this.eventLog = []; }

        // --- CHAT SYSTEM ---
        this.chatDB = {}; // Will be handled via API
    }

    // --- EVENT LOG METHODS ---
    getEventLog() {
        return this.eventLog || [];
    }

    logEvent(msg, type = 'info') {
        const event = { msg, type, time: new Date().toISOString() };
        this.eventLog.unshift(event);
        if (this.eventLog.length > 50) this.eventLog.pop(); // Keep last 50
        
        try {
            localStorage.setItem('riwi_events', JSON.stringify(this.eventLog));
        } catch(e) {}
        
        this.notify();
    }

    async loadInitialData() {
        console.log('Syncing database in background...');
        try {
            const [clansRes, territoriesRes] = await Promise.all([
                fetch('/api/clans'),
                fetch('/api/territories')
            ]);
            
            this.state.clans = (clansRes.ok) ? await clansRes.json() : {};
            const rawTerritories = (territoriesRes.ok) ? await territoriesRes.json() : [];

            // If we have no territories in DB, but we have clans, maybe this is a fresh start?
            // However, we should be careful about auto-generating here during sync.
            
            // Map territories to local structure
            if (Array.isArray(rawTerritories)) {
                this.state.territories = rawTerritories.map(t => ({
                    id: parseInt(t.id),
                    owner: t.owner_id || 'neutral',
                    type: t.type || 'code',
                    biome: t.biome || 'city',
                    difficulty: t.difficulty || 1,
                    question: t.question || this.getMockQuestion(t.type || 'code')
                }));
            } else {
                console.error('Expected territories array, got:', rawTerritories);
                this.state.territories = [];
            }

            // Sync User profile if logged in
            if (this.state.currentUser) {
                await this.syncUserProfile();
            }

            console.log('Database sync complete');
            this.notify();
        } catch (error) {
            console.error('CRITICAL: Sync failed', error);
        }
    }

    async syncUserProfile() {
        if (!this.state.currentUser) return;
        try {
            const res = await fetch(`/api/user/profile?username=${this.state.currentUser.name}`);
            const profile = await res.json();
            if (profile.name) {
                this.setUser(profile);
            }
        } catch (e) {
            console.error('User sync failed', e);
        }
    }

    getRandomType() {
        const r = Math.random();
        if (r > 0.6) return 'code';
        if (r > 0.3) return 'english';
        return 'soft-skills';
    }

        return this.getMockQuestion(type);
    }

    // --- DYNAMIC CLAN & MAP MANAGEMENT --- //

    regenerateMapDynamic() {
        const clanIds = Object.keys(this.state.clans);
        const totalClans = clanIds.length;

        // Let HexGrid compute the geometric allocation.
        // We just need to give it a pool of unassigned territories to work with.

        const baseHexesPerClan = 5;
        const totalBaseHexes = totalClans * baseHexesPerClan;
        // The outer ring needs to grow significantly as more factions pile in
        const totalBufferHexes = Math.max(30, totalClans * 10);
        const targetHexCount = totalBaseHexes + totalBufferHexes;

        const territories = [];

        // Generate Pool
        for (let i = 0; i < targetHexCount; i++) {
            let type = this.getRandomType();
            let biome = 'city';
            if (type === 'code') biome = 'city';
            else if (type === 'english') biome = 'library';
            else biome = 'park';

            territories.push({
                id: i,
                owner: 'neutral', // HexGrid will forcefully seize the 5 closest to banners later
                type: type,
                biome: biome,
                difficulty: Math.floor(Math.random() * 3) + 1,
                question: this.getMockQuestion(type)
            });
        }

        this.state.territories = territories;

        // Ensure math lines up for initial points IF they were 0, otherwise preserve legacy
        clanIds.forEach(id => {
            if (this.state.clans[id]) {
                // Only set default points if they currently have 0 or are new
                if (!this.state.clans[id].points || this.state.clans[id].points === 0) {
                    this.state.clans[id].points = baseHexesPerClan * 50;
                }
            }
        });

        // Clear flag if it was set by admin dashboard
        localStorage.removeItem('riwi_force_regen');

        this.notify();
    }

    async addClan(name, color) {
        let id = name.toLowerCase().replace(/\s+/g, '');
        if (id && !this.state.clans[id]) {
            const clanData = {
                name: name,
                color: color,
                points: 0,
                members: 0,
                icon: '\uf3ed' // Default shield
            };

            try {
                // Persist to API
                await fetch('/api/clans', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, ...clanData })
                });

                this.state.clans[id] = clanData;
                this.notify();
            } catch (e) {
                console.error('API Add Clan failed', e);
            }
        }
    }

    async removeClan(id) {
        if (this.state.clans[id]) {
            try {
                // Persist to API
                await fetch(`/api/clans?id=${id}`, { method: 'DELETE' });

                delete this.state.clans[id];

                // Orphan any territories owned by them locally
                this.state.territories.forEach(t => {
                    if (t.owner === id) t.owner = 'neutral';
                });
                this.notify();
            } catch (e) {
                console.error('API Remove Clan failed', e);
            }
        }
    }

    initializeMap() {
        return this.state.territories;
    }

    // Check if a target hex ID is adjacent to any hex owned by the clan
    checkAdjacency(targetId, clan) {
        const neighbors = this.getNeighbors(targetId);
        const ownedIds = this.state.territories
            .filter(t => t.owner === clan)
            .map(t => t.id);

        return neighbors.some(nId => ownedIds.includes(nId));
    }

    getNeighbors(index) {
        const width = 9;
        const candidates = [
            index - 1, index + 1,
            index - width, index - width + 1, index - width - 1,
            index + width, index + width + 1, index + width - 1
        ];
        return candidates.filter(c => c >= 0 && c < 100); // Expanded boundary
    }

    async conquerTerritory(id, clan) {
        try {
            const response = await fetch('/api/territories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, clanId: clan })
            });
            const result = await response.json();
            if (result.success) {
                // Optimistic Update locally
                const terr = this.state.territories.find(t => t.id == id);
                if (terr) {
                    if (terr.owner !== 'neutral') this.addPoints(terr.owner, -20);
                    terr.owner = clan;
                    this.addPoints(clan, 50);
                    this.notify();
                }
                return true;
            }
        } catch (error) {
            console.error('Conquest sync failed', error);
        }
        return false;
    }

    getState() {
        return this.state;
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    // Actions
    async registerUser(username, clan, password) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, clan, password })
            });
            const result = await response.json();
            if (result.success) {
                // For now, auto-login after register (simplified)
                return await this.loginUser(username, password);
            }
            return { success: false, message: result.message || 'REGISTRATION FAILED' };
        } catch (error) {
            return { success: false, message: 'NETWORK/SYSTEM ERROR' };
        }
    }

    async loginUser(username, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await response.json();
            if (result.success) {
                this.setUser(result.user);
                if (result.token) localStorage.setItem('riwi_token', result.token);
                return { success: true };
            }
            return { success: false, message: result.message || 'LOGIN FAILED' };
        } catch (error) {
            return { success: false, message: 'NETWORK/SYSTEM ERROR' };
        }
    }

    getRegisteredUsers() {
        try {
            return JSON.parse(localStorage.getItem('riwi_users_db')) || [];
        } catch (e) {
            return [];
        }
    }

    setUser(user) {
        this.state.currentUser = user;
        localStorage.setItem('riwi_user', JSON.stringify(user));
        this.notify();
    }

    async updateUserName(newName) {
        if (this.state.currentUser) {
            const oldName = this.state.currentUser.name;
            try {
                const response = await fetch('/api/user/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: oldName, updates: { newName } })
                });
                const result = await response.json();
                if (result.success) {
                    this.state.currentUser.name = newName;
                    this.setUser(this.state.currentUser);
                }
            } catch (e) {
                console.error('Update name failed', e);
            }
        }
    }

    async purchaseCosmetic(item) {
        const user = this.state.currentUser;
        if (!user || user.credits < item.cost) return false;
        
        try {
            const response = await fetch('/api/shop/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: user.name,
                    itemId: item.id,
                    cost: item.cost,
                    type: item.type,
                    color: item.color
                })
            });
            const result = await response.json();
            if (result.success) {
                // Refresh local profile
                await this.syncUserProfile();
                return true;
            }
        } catch (e) {
            console.error('Purchase failed', e);
        }
        return false;
    }

    logout() {
        this.state.currentUser = null;
        localStorage.removeItem('riwi_user');
        this.notify();
        window.location.href = window.location.origin + window.location.pathname + '#login';
        window.location.reload();
    }

    setView(viewName) {
        if (this.state.currentView !== viewName) {
            this.state.currentView = viewName;
            // NOTE: Do NOT call notify() here — view changes are transient
            // and triggering all listeners causes infinite re-render loops
            // this.notify();
        }
    }

    async addPoints(clanId, amount) {
        if (amount === 0) return; // Prevent useless cycles
        if (this.state.clans[clanId]) {
            try {
                // Optimistically update locally
                this.state.clans[clanId].points += amount;
                this.notify();

                await fetch('/api/clans/points', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clanId, amount })
                });
            } catch (e) {
                console.error('Points increment failed', e);
                // Rollback on failure if needed, but for game points we often just let it sync next load
            }
        }
    }

    // --- CHAT SYSTEM METHODS ---
    async addChatMessage(clanId, user, msg) {
        try {
            await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clanId, username: user.name, content: msg })
            });
            
            // Polling will handle getting the message back
        } catch (e) {
            console.error('Chat post failed', e);
        }
    }

    async getChatMessages(clanId) {
        try {
            const res = await fetch(`/api/chat?clanId=${clanId}`);
            const messages = await res.json();
            return messages.map(m => ({
                id: m.id,
                user: m.user_username,
                clan: m.clan_id,
                msg: m.content,
                time: m.created_at
            }));
        } catch (e) {
            console.error('Chat fetch failed', e);
            return [];
        }
    }
    // --- QUESTION SYSTEM ---
    async getQuestionForTerritory(territory) {
        try {
            const res = await fetch(`/api/questions/random?type=${territory.type}&difficulty=${territory.difficulty}`);
            if (res.ok) {
                return await res.json();
            }
        } catch (e) {
            console.error('Fetch question failed, using mock', e);
        }
        return this.getMockQuestion(territory.type);
    }
}

export const store = new Store();