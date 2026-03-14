import { store } from '../store.js';

export default async function createQuestionModal(hexData, hitMesh) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'question-modal-overlay';
    modalOverlay.id = 'active-question-modal';

    // Prevent background clicks
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.inset = '0';
    modalOverlay.style.backgroundColor = 'rgba(0, 5, 10, 0.85)';
    modalOverlay.style.backdropFilter = 'blur(10px)';
    modalOverlay.style.zIndex = '9999';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.opacity = '0';
    modalOverlay.style.transition = 'opacity 0.4s ease';

    // Current User
    const user = store.getState().currentUser;
    const clanColors = {
        'turing': '#00c3ff',
        'tesla': '#ff0000',
        'mccarthy': '#00ff44',
        'thompson': '#9B51E0',
        'hamilton': '#F2C94C'
    };
    const activeColor = clanColors[user.clan.toLowerCase()] || '#00f0ff';

    // Fetch REAL question from DB
    const questionData = await store.getQuestionForTerritory(hexData);

    modalOverlay.innerHTML = `
        <div class="cyber-question-panel" style="--theme-color: ${activeColor}">
            <div class="panel-header">
                <span class="glitch-text" data-text="SYSTEM BREACH INITIATED">SYSTEM BREACH INITIATED</span>
                <button class="close-btn" id="closeQuestionBtn">&times;</button>
            </div>
            
            <div class="panel-body">
                <div class="target-info">
                    <div class="target-status">TARGET STATUS: <span style="color: #ff3366">HOSTILE</span></div>
                    <div class="target-encryption">ENCRYPTION: LEVEL ${hexData.difficulty} (${hexData.type.toUpperCase()})</div>
                </div>

                <div class="question-container">
                    <h3 class="the-question">> ${questionData.q}</h3>
                    
                    <div class="options-grid">
                        ${questionData.options.map((opt, i) => `
                            <button class="cyber-option-btn" data-index="${i}">
                                <span class="opt-prefix">[${String.fromCharCode(65 + i)}]</span> ${opt}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="panel-footer">
                <div class="hacking-progress">
                    <div class="progress-bar-fill" id="timer-fill" style="width: 100%;"></div>
                </div>
                <div class="status-msg blink" id="status-text">AWAITING INPUT... <span id="timer-secs">10s</span></div>
            </div>
        </div>
    `;

    // Interaction Logic
    setTimeout(() => {
        modalOverlay.style.opacity = '1';

        // Setup GSAP entrance if available
        if (window.gsap) {
            const panel = modalOverlay.querySelector('.cyber-question-panel');
            gsap.fromTo(panel,
                { scale: 0.9, y: 50, opacity: 0 },
                { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' }
            );
        }
    }, 10);

    const closeBtn = modalOverlay.querySelector('#closeQuestionBtn');
    const optionBtns = modalOverlay.querySelectorAll('.cyber-option-btn');
    const statusMsg = modalOverlay.querySelector('.status-msg');

    const closeModal = () => {
        modalOverlay.style.opacity = '0';
        hitMesh.userData.isUnderAttack = false;
        hitMesh.material.emissiveIntensity = hitMesh.userData.isTerritory ? 0.4 : 0; // Reset visual
        setTimeout(() => modalOverlay.remove(), 400);
    };

    closeBtn.addEventListener('click', closeModal);

    let timeLeft = 10;
    let timerActive = true;
    const timerFill = modalOverlay.querySelector('#timer-fill');
    const timerText = modalOverlay.querySelector('#timer-secs');
    const statusMsgText = modalOverlay.querySelector('#status-text');
    let failedAttempts = 0;

    const startTimer = () => {
        const interval = setInterval(() => {
            if (!timerActive || !modalOverlay.isConnected) {
                clearInterval(interval);
                return;
            }
            timeLeft -= 0.1;
            if (timerText) timerText.textContent = `${Math.ceil(timeLeft)}s`;
            if (timerFill) timerFill.style.width = `${(timeLeft / 10) * 100}%`;

            if (timeLeft <= 0) {
                clearInterval(interval);
                handleFailure("ENCRYPTION TIMEOUT. OVERRIDE FAILED.");
            }
        }, 100);
    };

    const handleFailure = (msg) => {
        timerActive = false;
        failedAttempts++;
        statusMsgText.textContent = msg;
        statusMsgText.style.color = '#ff0000';
        
        // Apply Penalty
        store.penalizeUser(10);
        
        // Disable buttons
        optionBtns.forEach(b => b.style.pointerEvents = 'none');

        if (failedAttempts >= 3) {
            statusMsgText.textContent = "CRITICAL FAILURE - CONNECTION TERMINATED.";
            setTimeout(closeModal, 2000);
            return;
        }

        // Wait 2 seconds then reload question
        setTimeout(async () => {
            statusMsgText.textContent = "GENERATING NEW ENCRYPTION KEY...";
            statusMsgText.style.color = '#00f0ff';
            
            const newQuestion = await store.getQuestionForTerritory(hexData);
            // Replace inner HTML of question container
            const container = modalOverlay.querySelector('.question-container');
            if (container) {
                container.innerHTML = `
                    <h3 class="the-question">> ${newQuestion.q}</h3>
                    <div class="options-grid">
                        ${newQuestion.options.map((opt, i) => `
                            <button class="cyber-option-btn" data-index="${i}">
                                <span class="opt-prefix">[${String.fromCharCode(65 + i)}]</span> ${opt}
                            </button>
                        `).join('')}
                    </div>
                `;
                // Re-attach events
                const newBtns = container.querySelectorAll('.cyber-option-btn');
                newBtns.forEach(btn => btn.addEventListener('click', () => handleOptionClick(btn, newBtns, newQuestion)));
            }
            
            timeLeft = 10;
            timerActive = true;
            startTimer();
        }, 2000);
    };

    const handleOptionClick = (btn, allBtns, qData) => {
        timerActive = false;
        allBtns.forEach(b => b.style.pointerEvents = 'none');
        const selectedIndex = parseInt(btn.getAttribute('data-index'));

        if (selectedIndex === qData.correct) {
            btn.classList.add('correct-choice');
            statusMsgText.textContent = 'ACCESS GRANTED. OVERRIDING PROTOCOLS...';
            statusMsgText.style.color = '#00ff44';
            
            // ACCESS GRANTED. Now update server.
            setTimeout(async () => {
                const winningClanId = user.clan.toLowerCase();
                const success = await store.conquerTerritory(hexData.id, winningClanId);
                if (success) {
                    // Update visuals ONLY on success
                    const { executeConquest } = await import('./HexGrid.js');
                    executeConquest(hexData, hitMesh, winningClanId);
                    closeModal();
                } else {
                    statusMsgText.textContent = 'SYNC ERROR. TRY AGAIN.';
                    btn.classList.remove('correct-choice');
                    allBtns.forEach(b => b.style.pointerEvents = 'auto');
                }
            }, 800);
        } else {
            btn.classList.add('wrong-choice');
            allBtns[qData.correct].classList.add('correct-choice');
            handleFailure("ACCESS DENIED. INTRUSION DETECTED.");
        }
    };

    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => handleOptionClick(btn, optionBtns, questionData));
    });

    startTimer();

    return modalOverlay;
}

