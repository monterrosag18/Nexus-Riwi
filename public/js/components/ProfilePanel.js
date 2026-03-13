import { store } from '../store.js';

export default function createProfilePanel() {
    const panel = document.createElement('div');
    panel.className = 'nexus-modal-overlay fade-in';
    panel.id = 'profile-panel';

    function render() {
        const state = store.getState();
        const user = state.currentUser;
        if (!user) return;

        const clanData = state.clans[user.clan] || { name: 'Neutral', color: '#888' };
        
        panel.innerHTML = `
            <div class="nexus-modal-card profile-card">
                <div class="modal-header">
                    <div class="modal-title"><i class="fa-solid fa-user-gear"></i> OPERATOR PROFILE</div>
                    <button class="modal-close-btn">&times;</button>
                </div>
                
                <div class="modal-body profile-body">
                    <!-- LEFT: AVATAR & BASIC INFO -->
                    <div class="profile-sidebar">
                        <div class="profile-avatar-container" style="--avatar-color: ${user.active_skin || clanData.color}">
                            <i class="fa-solid fa-user-vneck"></i>
                            <div class="avatar-glow"></div>
                        </div>
                        <div class="profile-main-info">
                            <div class="profile-codename">${user.name.toUpperCase()}</div>
                            <div class="profile-clan-tag" style="color: ${clanData.color}">AFFILIATION: ${clanData.name.toUpperCase()}</div>
                        </div>
                    </div>

                    <!-- RIGHT: STATS & CUSTOMIZATION -->
                    <div class="profile-details">
                        <div class="stats-grid">
                            <div class="stat-box">
                                <span class="stat-label">NET WORTH</span>
                                <span class="stat-value">${user.credits} CR</span>
                            </div>
                            <div class="stat-box">
                                <span class="stat-label">EXP. POINTS</span>
                                <span class="stat-value">${user.points} XP</span>
                            </div>
                            <div class="stat-box">
                                <span class="stat-label">NEURAL SPINS</span>
                                <span class="stat-value">${user.total_spins || 0}</span>
                            </div>
                        </div>

                        <div class="customization-section">
                            <div class="section-title">ACTIVE ENHANCEMENTS</div>
                            <div class="custom-options">
                                <div class="custom-group">
                                    <label>SKIN SHADER</label>
                                    <div class="color-preview" style="background: ${user.active_skin || clanData.color}"></div>
                                    <button class="small-nexus-btn" id="btn-change-skin">MODIFY</button>
                                </div>
                                <div class="custom-group">
                                    <label>CHAT FREQUENCY</label>
                                    <div class="color-preview" style="background: ${user.active_chat_color || '#fff'}"></div>
                                    <button class="small-nexus-btn" id="btn-change-chat">MODIFY</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        attachEvents();
    }

    function attachEvents() {
        const closeBtn = panel.querySelector('.modal-close-btn');
        closeBtn.onclick = () => panel.remove();

        const skinBtn = panel.querySelector('#btn-change-skin');
        const chatBtn = panel.querySelector('#btn-change-chat');

        skinBtn.onclick = () => alert("COSMETIC INVENTORY COMING IN PHASE 12");
        chatBtn.onclick = skinBtn.onclick;
    }

    render();
    return panel;
}
