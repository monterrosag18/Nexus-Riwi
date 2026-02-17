/**
 * Simple Pub/Sub State Management
 */
class Store {
    constructor() {
        // Load user from localStorage
        let savedUser = null;
        try {
            const stored = localStorage.getItem('riwi_user');
            if (stored) savedUser = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading user', e);
        }

        this.state = {
            currentView: savedUser ? 'map' : 'login',
            currentUser: savedUser,
            clans: {
                turing: { name: 'Turing', color: 'var(--primary-blue)', points: 2606, members: 25 },
                tesla: { name: 'Tesla', color: 'var(--primary-red)', points: 1932, members: 28 },
                mccarthy: { name: 'McCarthy', color: 'var(--primary-green)', points: 1373, members: 22 }
            },
            // Initial Map State: mostly neutral
            territories: this.initializeMap(),
        };
        this.listeners = [];
    }

    initializeMap() {
        const total = 50;
        const territories = [];

        // Define starting bases (indices)
        const bases = {
            turing: [0, 1, 8, 9],
            tesla: [4, 5, 13, 14],
            mccarthy: [40, 41, 48, 49] // Bottom corners logic approx
        };

        for (let i = 0; i < total; i++) {
            let owner = 'neutral';
            if (bases.turing.includes(i)) owner = 'turing';
            if (bases.tesla.includes(i)) owner = 'tesla';
            if (bases.mccarthy.includes(i)) owner = 'mccarthy';

            territories.push({
                id: i,
                owner: owner,
                type: this.getRandomType(),
                difficulty: Math.floor(Math.random() * 3) + 1, // 1-3 stars
                question: this.getMockQuestion()
            });
        }
        return territories;
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
                { q: "Best way to lead a team?", options: ["Dictate all tasks", "Support and empower members", "Do everything yourself"], correct: 1 }
            ]
        };

        const category = questions[type] || questions['code'];
        return category[Math.floor(Math.random() * category.length)];
    }

    initializeMap() {
        const territories = [];

        // Initialize 63 hexes (Solid Map, No Voids) 9 cols x 7 rows
        const cols = 9;

        // const rows = 7; // Height (Implicit)

        for (let i = 0; i < 63; i++) { // 7 rows * 9 cols = 63
            let owner = 'neutral';

            // Assign Main Bases (Fixed Positions)
            if (i === 0) owner = 'turing';      // Top-Left (Code)
            if (i === 4) owner = 'tesla';       // Top-Center (English)
            if (i === 8) owner = 'mccarthy';    // Top-Right (Skills)
            // Spread them out more? 
            // Let's put them in the middle of their zones
            if (i === 10) owner = 'turing';     // Left Col 1, Row 1
            if (i === 13) owner = 'tesla';      // Mid Col 4, Row 1
            if (i === 16) owner = 'mccarthy';   // Right Col 7, Row 1

            /* --- Zoned Generation Logic (Solid) --- */
            // Left (Cols 0-2): Code / Syntax Valley
            // Middle (Cols 3-5): English / Lingua Nexus
            // Right (Cols 6-8): Soft Skills / Mind Peaks

            const col = i % cols;
            let type = 'code';
            let biome = 'city';

            if (col <= 2) {
                type = 'code';
                biome = 'city'; // Cyber City
            } else if (col <= 5) {
                type = 'english';
                biome = 'library'; // Knowledge Sanctum
            } else {
                type = 'soft-skills';
                biome = 'park'; // Harmony Gardens
            }

            territories.push({
                id: i,
                owner: owner,
                type: type,
                biome: biome,
                difficulty: Math.floor(Math.random() * 3) + 1, // 1-3 stars
                question: this.getMockQuestion(type)
            });
        }
        return territories;
    }

    // Check if a target hex ID is adjacent to any hex owned by the clan
    checkAdjacency(targetId, clan) {
        // Mock grid adjacency logic. 
        // For a simple list, we'll assume row-based proximity or use a proper hex math if needed.
        // For MVP: simple +/- 1 and row offset simulation.
        // A better approach for 1D array hex grid:
        // Neighbors are typically: i-1, i+1, i-width, i-width+1, i+width, i+width-1 (depending on even/odd rows)

        // Simplified: User can click any neutral hex for now to test, 
        // OR we implement strict neighbors. Let's do strict neighbors for quality.
        const neighbors = this.getNeighbors(targetId);
        const ownedIds = this.state.territories
            .filter(t => t.owner === clan)
            .map(t => t.id);

        return neighbors.some(nId => ownedIds.includes(nId));
    }

    getNeighbors(index) {
        // Assuming chunk pattern [9, 8] repeated.
        // This is complex to calculate perfectly without a fixed grid Class.
        // Let's approximate: a neighbor is within +/- 1 OR +/- 8/9 distance.
        // This is a "fuzzy" adjacency for MVP speed.
        const width = 9;
        const candidates = [
            index - 1, index + 1,
            index - width, index - width + 1, index - width - 1,
            index + width, index + width + 1, index + width - 1
        ];
        // Filter out of bounds
        return candidates.filter(c => c >= 0 && c < 50);
    }

    conquerTerritory(id, clan) {
        const terr = this.state.territories.find(t => t.id == id);
        if (terr && terr.owner !== clan) {
            // Logic for points: 
            // If stealing from another clan, maybe reduce their points?
            // For now, just add points to conqueror.
            if (terr.owner !== 'neutral') {
                // Stealing!
                this.addPoints(terr.owner, -20); // Penalty for losing?
            }

            terr.owner = clan;
            this.addPoints(clan, 50); // XP for conquest
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
        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    // Actions
    // Auth: Register a new recruit
    registerUser(username, clan) {
        const users = this.getRegisteredUsers();
        if (users.find(u => u.name.toLowerCase() === username.toLowerCase())) {
            return { success: false, message: 'CODENAME ALREADY TAKEN' };
        }

        const newUser = {
            name: username,
            clan: clan,
            points: 0,
            joinedAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('riwi_users_db', JSON.stringify(users));

        // Auto login
        this.setUser(newUser);
        return { success: true };
    }

    // Auth: Login existing agent
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
        window.location.hash = '#login';
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
}

export const store = new Store();
