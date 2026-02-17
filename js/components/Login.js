import { store } from '../store.js';

export default function renderLogin() {
    const container = document.createElement('div');
    container.className = 'login-wrapper fade-in';

    // State for this view
    let isRegisterMode = true;

    const renderFormContent = () => `
        <div class="cyber-grid-bg"></div>
        <div class="login-frame">
            <div class="login-header">
                <div class="cyber-glitch" data-text="RIWI NEXUS">RIWI NEXUS</div>
                <p class="cyber-subtitle">${isRegisterMode ? 'NEW RECRUIT REGISTRATION' : 'AGENT AUTHENTICATION'}</p>
            </div>
            
            <form id="login-form">
                <div class="input-group">
                    <label>CODENAME // </label>
                    <input type="text" id="username" placeholder="ENTER ALIAS" autocomplete="off" required>
                    <span class="input-border"></span>
                </div>
                
                ${isRegisterMode ? `
                <div class="clan-section fade-in">
                    <label class="section-label">SELECT ALLEGIANCE</label>
                    <div class="clan-selector">
                        <div class="clan-card turing" data-clan="turing">
                            <div class="clan-icon"><i class="fa-solid fa-code"></i></div>
                            <div class="clan-name">TURING</div>
                        </div>
                        <div class="clan-card tesla" data-clan="tesla">
                            <div class="clan-icon"><i class="fa-solid fa-bolt"></i></div>
                            <div class="clan-name">TESLA</div>
                        </div>
                        <div class="clan-card mccarthy" data-clan="mccarthy">
                            <div class="clan-icon"><i class="fa-solid fa-brain"></i></div>
                            <div class="clan-name">MCCARTHY</div>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <div class="form-error text-neon-red" style="text-align: center; margin-bottom: 15px; min-height: 20px; font-size: 0.8rem; font-family: var(--font-heading); letter-spacing: 1px;"></div>

                <button type="submit" class="cyber-btn">
                    <span class="btn-content">${isRegisterMode ? 'INITIALIZE UPLINK' : 'ACCESS SYSTEM'}</span>
                    <span class="btn-glitch"></span>
                </button>
            </form>
            
            <div class="login-toggle" style="text-align: center; margin-top: 20px; cursor: pointer;">
                <p class="text-muted hover-glow" style="font-size: 0.8rem;">
                    ${isRegisterMode ? 'ALREADY AN AGENT? <span class="text-neon-blue" style="text-decoration: underline;">LOGIN</span>' : 'OBTAINING ACCESS? <span class="text-neon-blue" style="text-decoration: underline;">REGISTER</span>'}
                </p>
            </div>

            <div class="login-footer">
                <span class="status-dot"></span> SECURE CONNECTION v4.5.3
            </div>
        </div>
    `;

    container.innerHTML = renderFormContent();

    // Event Handlers
    const bindEvents = () => {
        const form = container.querySelector('#login-form');
        const toggleBtn = container.querySelector('.login-toggle');
        const errorMsg = container.querySelector('.form-error');
        let selectedClan = null;

        // Toggle Mode
        if (toggleBtn) {
            toggleBtn.onclick = () => {
                isRegisterMode = !isRegisterMode;
                container.innerHTML = renderFormContent();
                bindEvents(); // Re-bind after re-render
            };
        }

        // Clan Selection logic
        if (isRegisterMode) {
            const currentCards = container.querySelectorAll('.clan-card');
            currentCards.forEach(card => {
                card.onclick = () => {
                    currentCards.forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    selectedClan = card.dataset.clan;
                };
            });
        }

        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const usernameInput = container.querySelector('#username');
                const username = usernameInput.value.trim();
                const submitBtn = container.querySelector('button[type="submit"]');

                errorMsg.textContent = ''; // Clear previous errors

                if (!username) return;

                // Visual Feedback
                submitBtn.style.opacity = '0.5';
                submitBtn.disabled = true;

                if (isRegisterMode) {
                    // Registration Logic
                    if (!selectedClan) {
                        errorMsg.textContent = 'ERROR: ALLEGIANCE REQUIRED';
                        const selector = container.querySelector('.clan-selector');
                        if (selector) {
                            selector.style.animation = 'shake 0.5s';
                            setTimeout(() => selector.style.animation = '', 500);
                        }
                        submitBtn.style.opacity = '1';
                        submitBtn.disabled = false;
                        return;
                    }

                    try {
                        const result = store.registerUser(username, selectedClan);
                        if (result.success) {
                            window.location.hash = '#map';
                        } else {
                            errorMsg.textContent = `ERROR: ${result.message}`;
                            submitBtn.style.opacity = '1';
                            submitBtn.disabled = false;
                            // Shake form
                            const frame = container.querySelector('.login-frame');
                            if (frame) {
                                frame.style.animation = 'shake 0.3s';
                                setTimeout(() => frame.style.animation = '', 300);
                            }
                        }
                    } catch (err) {
                        console.error(err);
                        errorMsg.textContent = 'SYSTEM ERROR: RETRY UPLINK';
                        submitBtn.style.opacity = '1';
                        submitBtn.disabled = false;
                    }

                } else {
                    // Login Logic
                    try {
                        const result = store.loginUser(username);
                        if (result.success) {
                            window.location.hash = '#map';
                        } else {
                            errorMsg.textContent = `ERROR: ${result.message}`;
                            submitBtn.style.opacity = '1';
                            submitBtn.disabled = false;
                            // Shake form
                            const frame = container.querySelector('.login-frame');
                            if (frame) {
                                frame.style.animation = 'shake 0.3s';
                                setTimeout(() => frame.style.animation = '', 300);
                            }
                        }
                    } catch (err) {
                        console.error(err);
                        errorMsg.textContent = 'SYSTEM ERROR: RETRY UPLINK';
                        submitBtn.style.opacity = '1';
                        submitBtn.disabled = false;
                    }
                }
            };
        }
    };

    // Initial binding
    setTimeout(bindEvents, 0);

    return container;
}
