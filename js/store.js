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

        // Bridge to Admin Dashboard DB
        let clansDB;
        try {
            const rawClans = localStorage.getItem('riwi_clans_db');
            if (rawClans) {
                clansDB = JSON.parse(rawClans);
            } else {
                // Initial Default
                clansDB = {
                    turing: { name: 'Turing', color: '#2D9CDB', points: 2606, members: 25, icon: '\uf2db' },
                    tesla: { name: 'Tesla', color: '#EB5757', points: 1932, members: 28, icon: '\uf0e7' },
                    mccarthy: { name: 'McCarthy', color: '#27AE60', points: 1373, members: 22, icon: '\uf544' },
                    lovelace: { name: 'Lovelace', color: '#9B51E0', points: 1105, members: 18, icon: '\uf121' },
                    neumann: { name: 'Neumann', color: '#F2C94C', points: 940, members: 15, icon: '\uf0c3' }
                };
                localStorage.setItem('riwi_clans_db', JSON.stringify(clansDB));
            }
        } catch (e) {
            clansDB = {
                turing: { name: 'Turing', color: '#2D9CDB', points: 0, members: 0, icon: '\uf2db' }
            };
        }

        this.state = {
            currentView: savedUser ? 'map' : 'login',
            currentUser: savedUser,
            clans: clansDB,
            territories: [],
        };
        this.listeners = [];

        // Build the dynamic map now that state is defined
        this.state.territories = this.initializeMap();
    }

    getRandomType() {
        const r = Math.random();
        if (r > 0.6) return 'code';
        if (r > 0.3) return 'english';
        return 'soft-skills';
    }

    getMockQuestion(type) {
        const questions = {
            'code': [
                { q: "What does HTML stand for?", options: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup"], correct: 0 },
                { q: "Which property changes text color in CSS?", options: ["text-style", "color", "font-color"], correct: 1 },
                { q: "Inside which HTML element do we put JavaScript?", options: ["<js>", "<scripting>", "<script>"], correct: 2 },
                { q: "How do you call a function named 'myFunction'?", options: ["call myFunction()", "myFunction()", "call function myFunction()"], correct: 1 },
                { q: "What is the correct syntax for referring to an external script called 'xxx.js'?", options: ["<script href='xxx.js'>", "<script name='xxx.js'>", "<script src='xxx.js'>"], correct: 2 }
            ],
            'english': [
                { q: "Select the synonym for 'Happy'", options: ["Sad", "Joyful", "Angry"], correct: 1 },
                { q: "Past tense of 'Run'", options: ["Runned", "Ran", "Running"], correct: 1 },
                { q: "Which is a correct sentence?", options: ["She don't like apples.", "She doesn't like apples.", "She no like apples."], correct: 1 },
                { q: "Select the antonym for 'Expand'", options: ["Shrink", "Grow", "Increase"], correct: 0 },
                { q: "What is a 'noun'?", options: ["Action word", "Descriptive word", "Person, place, or thing"], correct: 2 }
            ],
            'soft-skills': [
                { q: "A teammate is not contributing. What do you do?", options: ["Ignore them", "Report them immediately", "Talk to them privately to understand"], correct: 2 },
                { q: "You missed a deadline. Best reaction?", options: ["Blame the internet", "Own it and communicate new timeline", "Hide until finished"], correct: 1 },
                { q: "Effective communication involves...", options: ["Speaking constantly", "Active listening", "Using big words"], correct: 1 },
                { q: "How to handle constructive criticism?", options: ["Get defensive", "Listen and improve", "Ignore it"], correct: 1 },
                { q: "What is 'empathy'?", options: ["Feeling sorry for someone", "Understanding someone else's feelings", "Ignoring emotions"], correct: 1 }
            ]
        };
        const pool = questions[type] || questions['code'];
        return pool[Math.floor(Math.random() * pool.length)];
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

        // Ensure math lines up for points based on HexGrid's forced 5
        clanIds.forEach(id => {
            if (this.state.clans[id]) {
                const legacyMembers = this.state.clans[id].members || 0;
                // Preserve stats if regenerating, just reset map specific points
                this.state.clans[id].points = baseHexesPerClan * 50;
            }
        });

        // Clear flag if it was set by admin dashboard
        localStorage.removeItem('riwi_force_regen');

        this.notify();
    }

    addClan(name, color) {
        let id = name.toLowerCase().replace(/\s+/g, '');
        if (id && !this.state.clans[id]) {
            this.state.clans[id] = {
                name: name,
                color: color,
                points: 0,
                members: 0
            };
            this.notify();
        }
    }

    removeClan(id) {
        if (this.state.clans[id]) {
            delete this.state.clans[id];

            // Orphan any territories owned by them
            this.state.territories.forEach(t => {
                if (t.owner === id) t.owner = 'neutral';
            });
            this.notify();
        }
    }

    initializeMap() {
        // Obsolete static generator. Forward to dynamic.
        if (!this.state.territories || this.state.territories.length === 0) {
            this.regenerateMapDynamic();
        }
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

    conquerTerritory(id, clan) {
        const terr = this.state.territories.find(t => t.id == id);
        if (terr && terr.owner !== clan) {
            if (terr.owner !== 'neutral') {
                this.addPoints(terr.owner, -20);
            }
            terr.owner = clan;
            this.addPoints(clan, 50);
            this.notify();
            return true;
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
    registerUser(username, clan) {
        const users = this.getRegisteredUsers();
        if (users.find(u => u.name.toLowerCase() === username.toLowerCase())) {
            return { success: false, message: 'CODENAME ALREADY TAKEN' };
        }

        const newUser = {
            name: username,
            clan: clan,
            points: 0,
            credits: 2000,
            joinedAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('riwi_users_db', JSON.stringify(users));
        this.setUser(newUser);
        return { success: true };
    }

    loginUser(username) {
        const users = this.getRegisteredUsers();
        const user = users.find(u => u.name.toLowerCase() === username.toLowerCase());

        if (user) {
            this.setUser(user);
            return { success: true };
        } else {
            return { success: false, message: 'CODENAME NOT FOUND' };
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
            this.notify();
        }
    }

    addPoints(clanId, amount) {
        if (this.state.clans[clanId]) {
            this.state.clans[clanId].points += amount;
            this.notify();
        }
    }

    // --- TACTICAL MARKET ECONOMY --- //

    purchaseItem(cost) {
        if (this.state.currentUser && this.state.currentUser.credits >= cost) {
            this.state.currentUser.credits -= cost;
            this.setUser(this.state.currentUser);
            return true;
        }
        return false;
    }

    executeTacticalStrike(targetClanId, stolenAmount) {
        if (!this.state.currentUser) return { success: false, message: 'NO OPERATOR ACTIVE' };
        if (!this.state.clans[targetClanId]) return { success: false, message: 'INVALID TARGET SECTOR' };

        const myClanId = this.state.currentUser.clan;
        const actualStolen = Math.min(this.state.clans[targetClanId].points, stolenAmount);

        this.state.clans[targetClanId].points -= actualStolen;

        if (this.state.clans[myClanId]) {
            this.state.clans[myClanId].points += actualStolen;
        }

        this.state.currentUser.credits += 500;
        this.setUser(this.state.currentUser);

        this.notify();
        return { success: true, actualStolen };
    }
}

export const store = new Store();
