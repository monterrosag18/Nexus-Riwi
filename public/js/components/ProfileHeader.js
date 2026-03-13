import { store } from '../store.js';

export function createProfileHeader() {
    const container = document.createElement('div');
    container.className = 'profile-header-container';
    
    // Subscribe to store updates
    const unsubscribe = store.subscribe(() => {
        updateContent(container);
    });

    // Cleanup on remove
    container.addEventListener('remove', () => unsubscribe());

    updateContent(container);
    return container;
}

function updateContent(container) {
    const user = store.getState().currentUser;
    const clans = store.getState().clans;
    const clanData = user ? clans[user.clan] : null;
    const clanColor = clanData ? clanData.color : '#00f0ff';
    const clanIcon = clanData ? clanData.icon : '\uf544';

    const borderStyle = user && user.activeBorderColor ? 
        `border: 2px solid ${user.activeBorderColor}; box-shadow: 0 0 25px ${user.activeBorderColor}66, inset 0 0 15px ${user.activeBorderColor}22;` : 
        `border: 1px solid ${clanColor}44; box-shadow: 0 0 20px ${clanColor}22, inset 0 0 10px ${clanColor}11;`;

    const shieldHTML = user && user.activeShieldColor ? `
        <div class="shield-active-indicator" style="
            width: 20px; height: 20px; background: ${user.activeShieldColor}44; 
            border: 1px solid ${user.activeShieldColor}; border-radius: 4px; 
            display: flex; align-items: center; justify-content: center;
            font-size: 0.6rem; color: ${user.activeShieldColor}; text-shadow: 0 0 5px ${user.activeShieldColor};
        ">
            <i class="fa-solid fa-shield-halved"></i>
        </div>
    ` : '';

    // COSMETIC EFFECTS (BOUTIQUE)
    let extraEffectStyle = '';
    let effectOverlayHTML = '';
    
    if (user) {
        if (user.active_skin === 'skin_neon_pink') {
            extraEffectStyle = `box-shadow: 0 0 40px #ff00ff88, inset 0 0 20px #ff00ff44; border-color: #ff00ff;`;
        } else if (user.active_skin === 'skin_matrix_rain') {
            effectOverlayHTML = `<div class="matrix-rain-overlay" style="position:absolute; inset:0; pointer-events:none; opacity:0.15; overflow:hidden; border-radius:40px; background: linear-gradient(180deg, transparent 0%, #00ff4111 100%);"></div>`;
        } else if (user.active_skin === 'skin_gold_glitch') {
            extraEffectStyle = `box-shadow: 0 0 40px #ffd70088; border-color: #ffd700; animation: pulse-gold 2s infinite;`;
        }
    }

    container.innerHTML = `
        <div class="profile-hud-wrapper" style="
            position: relative;
            display: flex;
            align-items: center;
            background: rgba(0, 10, 20, 0.85);
            backdrop-filter: blur(15px);
            ${borderStyle}
            ${extraEffectStyle}
            padding: 8px 20px;
            border-radius: 40px;
            clip-path: polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%);
            gap: 15px;
            pointer-events: auto;
            transition: all 0.5s ease;
        ">
            ${effectOverlayHTML}
            <!-- Clan Emblem -->
            <div class="clan-emblem-glow" style="
                width: 38px;
                height: 38px;
                background: ${clanColor}22;
                border: 2px solid ${clanColor};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: ${clanIcon.startsWith('3d_') ? "'Share Tech Mono'" : "'Font Awesome 6 Free'"};
                font-weight: 900;
                color: ${clanColor};
                font-size: ${clanIcon.startsWith('3d_') ? '0.7rem' : '1rem'};
                text-shadow: 0 0 10px ${clanColor};
                box-shadow: 0 0 15px ${clanColor}44;
            ">
                ${clanIcon.startsWith('3d_') ? clanIcon.split('_')[1].toUpperCase() : clanIcon}
            </div>

            <!-- Player Status -->
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: #fff; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 1.1rem; letter-spacing: 1px;">
                        ${user ? user.name.toUpperCase() : 'GUEST_OPERATOR'}
                    </span>
                    ${shieldHTML}
                    <button id="global-edit-name-btn" style="
                        background: none;
                        border: none;
                        color: #555;
                        cursor: pointer;
                        font-size: 0.8rem;
                        transition: color 0.3s;
                    ">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                </div>
                <div style="color: ${clanColor}bb; font-family: 'Share Tech Mono', monospace; font-size: 0.7rem; letter-spacing: 1.5px; text-transform: uppercase;">
                    SECTOR: ${user ? user.clan : 'NOT_ASSIGNED'}
                </div>
            </div>

            <div style="width: 1px; height: 30px; background: rgba(255,255,255,0.1); margin: 0 5px;"></div>

            <!-- Credits Display -->
            <div style="text-align: right;">
                <div style="color: #00ff88; font-family: 'Share Tech Mono', monospace; font-size: 1.1rem; font-weight: bold; text-shadow: 0 0 10px rgba(0,255,136,0.3);">
                    ${(user && typeof user.credits !== 'undefined') ? user.credits.toLocaleString() : '0'} <span style="font-size: 0.7rem; color: #555;">CR</span>
                </div>
            </div>
        </div>
    `;

    // Bind Edit Action
    const editBtn = container.querySelector('#global-edit-name-btn');
    if (editBtn && user) {
        editBtn.addEventListener('click', () => {
            const newName = prompt("RE-ESTABLISH CODENAME:", user.name);
            if (newName && newName.length >= 3 && newName !== user.name) {
                store.updateUserName(newName);
            }
        });

        editBtn.onmouseover = () => editBtn.style.color = clanColor;
        editBtn.onmouseout = () => editBtn.style.color = '#555';
    }
}
