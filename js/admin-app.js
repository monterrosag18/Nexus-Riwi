/**
 * admin-app.js
 * Complete Admin Cockpit: Login, Faction CRUD, Question Bank, News, Points Reset.
 * All localStorage-backed, structured for future DB migration.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ═══════════════════════════════════════════
    // CONSTANTS & KEYS
    // ═══════════════════════════════════════════
    const CLANS_KEY = 'riwi_clans_db';
    const QUESTIONS_KEY = 'riwi_questions_db';
    const NEWS_KEY = 'riwi_admin_news';
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = '1234';

    // Default Factions (all points at 0 for fresh start)
    const defaultClans = {
        turing:   { name: 'Turing',   color: '#2D9CDB', points: 0, members: 0, icon: '\uf2db' },
        tesla:    { name: 'Tesla',    color: '#EB5757', points: 0, members: 0, icon: '\uf0e7' },
        mccarthy: { name: 'McCarthy', color: '#27AE60', points: 0, members: 0, icon: '\uf544' },
        thompson: { name: 'Thompson', color: '#9B51E0', points: 0, members: 0, icon: '\uf085' },
        halmiton: { name: 'Halmiton', color: '#F2C94C', points: 0, members: 0, icon: '\uf06d' }
    };

    // ═══════════════════════════════════════════
    // 1. ADMIN LOGIN
    // ═══════════════════════════════════════════
    const loginGate = document.getElementById('admin-login-gate');
    const dashboard = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('admin-login-form');
    const gateError = document.getElementById('gate-error');

    // Check session
    if (sessionStorage.getItem('nexus_admin_auth') === 'true') {
        loginGate.style.display = 'none';
        dashboard.style.display = 'grid';
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('admin-user').value.trim();
        const pass = document.getElementById('admin-pass').value;

        if (user === ADMIN_USER && pass === ADMIN_PASS) {
            sessionStorage.setItem('nexus_admin_auth', 'true');
            loginGate.style.display = 'none';
            dashboard.style.display = 'grid';
            renderRoster();
        } else {
            gateError.textContent = 'ACCESS DENIED — INVALID CREDENTIALS';
            const card = loginGate.querySelector('.gate-card');
            card.style.animation = 'shake 0.4s ease';
            setTimeout(() => card.style.animation = '', 400);
        }
    });

    // ═══════════════════════════════════════════
    // 2. DATA ACCESS LAYER (localStorage)
    // ═══════════════════════════════════════════
    function getClans() {
        try {
            const raw = localStorage.getItem(CLANS_KEY);
            return raw ? JSON.parse(raw) : { ...defaultClans };
        } catch (e) { return { ...defaultClans }; }
    }

    function saveClans(clans) {
        localStorage.setItem(CLANS_KEY, JSON.stringify(clans));
    }

    function getQuestions() {
        try {
            const raw = localStorage.getItem(QUESTIONS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    }

    function saveQuestions(questions) {
        localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
    }

    function getNews() {
        try {
            const raw = localStorage.getItem(NEWS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    }

    function saveNews(news) {
        localStorage.setItem(NEWS_KEY, JSON.stringify(news));
    }

    // ═══════════════════════════════════════════
    // 3. NAVIGATION ROUTING
    // ═══════════════════════════════════════════
    const navLinks = document.querySelectorAll('.admin-nav a[data-view]');
    const views = {
        roster: document.getElementById('roster-view'),
        create: document.getElementById('create-view'),
        questions: document.getElementById('questions-view'),
        news: document.getElementById('news-view')
    };

    function showView(viewName) {
        Object.values(views).forEach(v => v.style.display = 'none');
        if (views[viewName]) views[viewName].style.display = 'block';
        navLinks.forEach(l => l.classList.remove('active'));
        navLinks.forEach(l => { if (l.dataset.view === viewName) l.classList.add('active'); });

        // Refresh data when switching
        if (viewName === 'roster') renderRoster();
        if (viewName === 'questions') renderQuestions();
        if (viewName === 'news') renderNews();
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.classList.contains('danger-zone')) return;
            e.preventDefault();
            showView(link.dataset.view);
        });
    });

    // ═══════════════════════════════════════════
    // 4. FACTION ROSTER (CRUD)
    // ═══════════════════════════════════════════
    const rosterGrid = document.getElementById('faction-grid-container');
    const createForm = document.getElementById('create-clan-form');
    const nameInput = document.getElementById('clan-name');
    const iconSelect = document.getElementById('clan-icon');
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const hiddenColorInput = document.getElementById('clan-color');
    const regenBtn = document.getElementById('btn-force-regenerate');
    const resetBtn = document.getElementById('btn-reset-points');

    let editingClanId = null;

    // Icon map for display
    const iconMap = {
        '\uf521': 'fa-solid fa-crown', '\uf6d5': 'fa-solid fa-dragon',
        '\uf54c': 'fa-solid fa-skull', '\uf3ed': 'fa-solid fa-shield-halved',
        '\uf3a5': 'fa-solid fa-gem', '\uf06d': 'fa-solid fa-fire',
        '\uf0e7': 'fa-solid fa-bolt', '\uf5fc': 'fa-solid fa-jedi',
        '\uf441': 'fa-solid fa-chess-knight', '\uf70c': 'fa-solid fa-meteor',
        '\uf70b': 'fa-solid fa-ring', '\uf185': 'fa-solid fa-sun',
        '\uf186': 'fa-solid fa-moon', '\uf005': 'fa-solid fa-star',
        '\uf06e': 'fa-solid fa-eye', '\uf5a6': 'fa-solid fa-monument',
        '\uf504': 'fa-solid fa-user-ninja', '\uf4fb': 'fa-solid fa-user-astronaut',
        '\uf24e': 'fa-solid fa-scale-balanced', '\uf1e2': 'fa-solid fa-bomb',
        '\uf0c3': 'fa-solid fa-flask', '\uf21e': 'fa-solid fa-heartbeat',
        '\uf5d2': 'fa-solid fa-atom', '\uf0eb': 'fa-solid fa-lightbulb',
        '\uf2db': 'fa-solid fa-microchip', '\uf544': 'fa-solid fa-brain',
        '\uf085': 'fa-solid fa-gears'
    };

    function getIcon(unicode) { return iconMap[unicode] || 'fa-solid fa-shield-halved'; }

    // Color picker
    if (colorSwatches.length > 0) {
        colorSwatches[0].classList.add('selected');
        hiddenColorInput.value = colorSwatches[0].dataset.color;
    }
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            colorSwatches.forEach(s => s.classList.remove('selected'));
            e.target.classList.add('selected');
            hiddenColorInput.value = e.target.dataset.color;
        });
    });

    // Render Roster
    function renderRoster() {
        const clans = getClans();
        rosterGrid.innerHTML = '';
        const clanIds = Object.keys(clans);

        if (clanIds.length === 0) {
            rosterGrid.innerHTML = '<div style="padding:2rem;color:#666;">No active factions found.</div>';
            return;
        }

        clanIds.forEach(id => {
            const clan = clans[id];
            const htmlIcon = getIcon(clan.icon);
            const card = document.createElement('div');
            card.className = 'faction-card';
            card.style.borderLeft = `4px solid ${clan.color}`;

            card.innerHTML = `
                <div class="card-header">
                    <div class="faction-identity">
                        <i class="${htmlIcon}" style="color: ${clan.color}; font-size: 1.5rem;"></i>
                        <h4 style="margin:0;">${clan.name.toUpperCase()}</h4>
                    </div>
                </div>
                <div class="card-stats">
                    <div class="stat-block">
                        <span class="label">INFLUENCE</span>
                        <span class="value" style="color: ${clan.color};">${clan.points}</span>
                    </div>
                    <div class="stat-block">
                        <span class="label">OPERATORS</span>
                        <span class="value">${clan.members || 0}</span>
                    </div>
                </div>
                <div class="card-actions" style="display:flex;gap:0.5rem;justify-content:center;">
                    <button class="delete-btn btn-decommission" style="flex:1;" data-id="${id}">
                        <i class="fa-solid fa-trash-can"></i> DELETE
                    </button>
                    <button class="action-button btn-reconfigure" style="flex:1;padding:0.5rem;font-size:0.8rem;border-color:${clan.color};color:${clan.color};background:rgba(0,0,0,0.3);" data-id="${id}">
                        <i class="fa-solid fa-pen-to-square"></i> EDIT
                    </button>
                </div>
            `;
            rosterGrid.appendChild(card);
        });

        rosterGrid.querySelectorAll('.btn-decommission').forEach(btn => {
            btn.addEventListener('click', (e) => removeClan(e.currentTarget.dataset.id));
        });
        rosterGrid.querySelectorAll('.btn-reconfigure').forEach(btn => {
            btn.addEventListener('click', (e) => editClan(e.currentTarget.dataset.id));
        });
    }

    function removeClan(id) {
        if (confirm(`WARNING: Delete FACTION ${id.toUpperCase()}? This is irreversible.`)) {
            const clans = getClans();
            delete clans[id];
            saveClans(clans);
            if (editingClanId === id) resetCreateForm();
            renderRoster();
            localStorage.setItem('riwi_force_regen', 'true');
        }
    }

    function editClan(id) {
        const clans = getClans();
        const clan = clans[id];
        if (!clan) return;

        editingClanId = id;
        nameInput.value = clan.name;
        hiddenColorInput.value = clan.color.toUpperCase();
        colorSwatches.forEach(s => {
            s.classList.remove('selected');
            if (s.dataset.color.toUpperCase() === clan.color.toUpperCase()) s.classList.add('selected');
        });
        iconSelect.value = clan.icon;

        document.getElementById('create-submit-btn').innerHTML = '<i class="fa-solid fa-pen-nib"></i> UPDATE DESIGNATION';
        document.getElementById('create-panel-title').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Reconfigure Active Designation';
        showView('create');
    }

    function resetCreateForm() {
        editingClanId = null;
        createForm.reset();
        document.getElementById('create-submit-btn').innerHTML = '<i class="fa-solid fa-upload"></i> INJECT TO MATRIX';
        document.getElementById('create-panel-title').innerHTML = '<i class="fa-solid fa-folder-plus"></i> Initialize New Designation';
        colorSwatches.forEach(s => s.classList.remove('selected'));
        if (colorSwatches.length > 0) {
            colorSwatches[0].classList.add('selected');
            hiddenColorInput.value = colorSwatches[0].dataset.color;
        }
    }

    // Create/Update faction
    createForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const color = hiddenColorInput.value;
        const icon = iconSelect.value;
        const id = name.toLowerCase().replace(/\s+/g, '');
        if (!name || !color || !id) return;

        const currentClans = getClans();

        // Validate duplicates
        if (currentClans[id] && editingClanId !== id) {
            alert('A faction with this designation already exists.'); return;
        }
        const nameDup = Object.values(currentClans).find(
            c => c.name.toLowerCase() === name.toLowerCase() && (!editingClanId || currentClans[editingClanId]?.name.toLowerCase() !== name.toLowerCase())
        );
        if (nameDup && !editingClanId) { alert(`Name "${name}" is already in use.`); return; }

        let clanData = { name, color, icon, points: 0, members: 0 };

        if (editingClanId) {
            clanData.points = currentClans[editingClanId].points;
            clanData.members = currentClans[editingClanId].members;
            if (editingClanId !== id) delete currentClans[editingClanId];
        }

        currentClans[id] = clanData;
        saveClans(currentClans);
        localStorage.setItem('riwi_force_regen', 'true');

        resetCreateForm();
        showView('roster');
    });

    // Reset all points
    resetBtn.addEventListener('click', () => {
        if (confirm('⚠️ RESET ALL FACTION POINTS TO ZERO? This cannot be undone.')) {
            const clans = getClans();
            Object.keys(clans).forEach(id => { clans[id].points = 0; });
            saveClans(clans);
            renderRoster();
            resetBtn.innerHTML = '<i class="fa-solid fa-check"></i> POINTS RESET';
            setTimeout(() => {
                resetBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> RESET ALL POINTS';
            }, 2000);
        }
    });

    // Force grid regen
    regenBtn.addEventListener('click', () => {
        regenBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> RECALCULATING...';
        localStorage.setItem('riwi_force_regen', 'true');
        setTimeout(() => {
            regenBtn.innerHTML = '<i class="fa-solid fa-check"></i> OVERRIDE SUCCESS';
            setTimeout(() => {
                regenBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> FORCE GRID REGEN';
            }, 2000);
        }, 1500);
    });

    // ═══════════════════════════════════════════
    // 5. QUESTION BANK MANAGER
    // ═══════════════════════════════════════════
    const questionFormContainer = document.getElementById('question-form-container');
    const questionForm = document.getElementById('question-form');
    const btnAddQuestion = document.getElementById('btn-add-question');
    const qCancelBtn = document.getElementById('q-cancel-btn');

    let editingQuestionId = null;

    btnAddQuestion.addEventListener('click', () => {
        editingQuestionId = null;
        questionForm.reset();
        document.getElementById('q-edit-id').value = '';
        document.getElementById('q-submit-btn').innerHTML = '<i class="fa-solid fa-save"></i> SAVE QUESTION';
        questionFormContainer.style.display = 'block';
    });

    qCancelBtn.addEventListener('click', () => {
        questionFormContainer.style.display = 'none';
        questionForm.reset();
        editingQuestionId = null;
    });

    questionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const questions = getQuestions();

        const qData = {
            id: editingQuestionId || Date.now(),
            type: document.getElementById('q-type').value,
            difficulty: parseInt(document.getElementById('q-difficulty').value),
            q: document.getElementById('q-text').value.trim(),
            options: [
                document.getElementById('q-opt-a').value.trim(),
                document.getElementById('q-opt-b').value.trim(),
                document.getElementById('q-opt-c').value.trim()
            ],
            correct: parseInt(document.getElementById('q-correct').value)
        };

        if (editingQuestionId) {
            const idx = questions.findIndex(q => q.id === editingQuestionId);
            if (idx !== -1) questions[idx] = qData;
        } else {
            questions.push(qData);
        }

        saveQuestions(questions);
        questionFormContainer.style.display = 'none';
        questionForm.reset();
        editingQuestionId = null;
        renderQuestions();
    });

    function editQuestion(id) {
        const questions = getQuestions();
        const q = questions.find(q => q.id === id);
        if (!q) return;

        editingQuestionId = id;
        document.getElementById('q-type').value = q.type;
        document.getElementById('q-difficulty').value = q.difficulty || 1;
        document.getElementById('q-text').value = q.q;
        document.getElementById('q-opt-a').value = q.options[0];
        document.getElementById('q-opt-b').value = q.options[1];
        document.getElementById('q-opt-c').value = q.options[2];
        document.getElementById('q-correct').value = q.correct;
        document.getElementById('q-submit-btn').innerHTML = '<i class="fa-solid fa-pen-nib"></i> UPDATE QUESTION';
        questionFormContainer.style.display = 'block';
    }

    function deleteQuestion(id) {
        if (confirm('Delete this question?')) {
            let questions = getQuestions();
            questions = questions.filter(q => q.id !== id);
            saveQuestions(questions);
            renderQuestions();
        }
    }

    function renderQuestions() {
        const container = document.getElementById('questions-list');
        const questions = getQuestions();

        if (questions.length === 0) {
            container.innerHTML = `
                <div style="padding:2rem;text-align:center;color:#666;">
                    <i class="fa-solid fa-inbox" style="font-size:2rem;margin-bottom:0.5rem;display:block;"></i>
                    No questions in the bank. Click "ADD QUESTION" to start.
                </div>`;
            return;
        }

        const typeLabels = { code: 'CODE', english: 'ENGLISH', 'soft-skills': 'SOFT SKILLS' };
        const typeColors = { code: '#00f0ff', english: '#05ffa1', 'soft-skills': '#ff2a6d' };
        const grouped = {};

        questions.forEach(q => {
            if (!grouped[q.type]) grouped[q.type] = [];
            grouped[q.type].push(q);
        });

        let html = '';
        Object.keys(grouped).forEach(type => {
            const color = typeColors[type] || '#00f0ff';
            html += `<div class="q-group">
                <div class="q-group-header" style="color:${color};border-color:${color};">
                    <i class="fa-solid fa-tag"></i> ${typeLabels[type] || type.toUpperCase()} (${grouped[type].length})
                </div>`;
            grouped[type].forEach(q => {
                const correctLabel = ['A', 'B', 'C'][q.correct] || '?';
                html += `
                    <div class="q-item">
                        <div class="q-item-text">
                            <span class="q-difficulty">LVL ${q.difficulty || 1}</span>
                            ${q.q}
                        </div>
                        <div class="q-item-options">
                            ${q.options.map((opt, i) => `<span class="q-opt ${i === q.correct ? 'correct' : ''}">[${['A','B','C'][i]}] ${opt}</span>`).join('')}
                        </div>
                        <div class="q-item-actions">
                            <button class="q-edit-btn" data-id="${q.id}"><i class="fa-solid fa-pen"></i> Edit</button>
                            <button class="q-del-btn" data-id="${q.id}"><i class="fa-solid fa-trash"></i> Delete</button>
                        </div>
                    </div>`;
            });
            html += '</div>';
        });

        container.innerHTML = html;

        container.querySelectorAll('.q-edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editQuestion(parseInt(btn.dataset.id) || btn.dataset.id));
        });
        container.querySelectorAll('.q-del-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteQuestion(parseInt(btn.dataset.id) || btn.dataset.id));
        });
    }

    // ═══════════════════════════════════════════
    // 6. NEWS & ANNOUNCEMENTS
    // ═══════════════════════════════════════════
    const newsForm = document.getElementById('news-form');

    newsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = document.getElementById('news-msg').value.trim();
        const type = document.getElementById('news-type').value;
        if (!msg) return;

        const news = getNews();
        news.unshift({ id: Date.now(), msg, type, time: Date.now() });
        if (news.length > 20) news.length = 20;
        saveNews(news);
        newsForm.reset();
        renderNews();
    });

    function deleteNewsItem(id) {
        let news = getNews();
        news = news.filter(n => n.id !== id);
        saveNews(news);
        renderNews();
    }

    function renderNews() {
        const container = document.getElementById('news-list');
        const news = getNews();

        if (news.length === 0) {
            container.innerHTML = '<div style="padding:2rem;text-align:center;color:#666;">No active broadcasts.</div>';
            return;
        }

        const typeLabels = { warning: '⚠️ WARNING', info: 'ℹ️ INFO', alert: '🚨 ALERT' };
        const typeColors = { warning: '#ff8c00', info: '#00f0ff', alert: '#ff3b5c' };

        container.innerHTML = news.map(n => {
            const color = typeColors[n.type] || '#888';
            const label = typeLabels[n.type] || 'INFO';
            const ago = getTimeAgo(n.time);
            return `
                <div class="news-item" style="border-left:3px solid ${color};">
                    <div class="news-item-header">
                        <span class="news-type" style="color:${color};">${label}</span>
                        <span class="news-time">${ago}</span>
                    </div>
                    <div class="news-item-msg">${n.msg}</div>
                    <button class="news-del-btn" data-id="${n.id}"><i class="fa-solid fa-xmark"></i></button>
                </div>`;
        }).join('');

        container.querySelectorAll('.news-del-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteNewsItem(parseInt(btn.dataset.id)));
        });
    }

    function getTimeAgo(timestamp) {
        const diff = Date.now() - timestamp;
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    }

    // ═══════════════════════════════════════════
    // 7. INIT
    // ═══════════════════════════════════════════
    if (sessionStorage.getItem('nexus_admin_auth') === 'true') {
        renderRoster();
    }
});
