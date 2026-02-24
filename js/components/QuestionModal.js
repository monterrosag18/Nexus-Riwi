import { store } from '../store.js';

export default function createQuestionModal(hexData, hitMesh) {
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
        'lovelace': '#aa00ff',
        'neumann': '#ff6600'
    };
    const activeColor = clanColors[user.clan.toLowerCase()] || '#00f0ff';

    // The single default English question requested by the user
    // We can pull from store realistically, but user specifically asked to "leave 1 default in english" for testing
    const defaultQuestion = {
        q: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup"],
        correct: 0
    };

    modalOverlay.innerHTML = `
        <div class="cyber-question-panel" style="--theme-color: ${activeColor}">
            <div class="panel-header">
                <span class="glitch-text" data-text="SYSTEM BREACH INITIATED">SYSTEM BREACH INITIATED</span>
                <button class="close-btn" id="closeQuestionBtn">&times;</button>
            </div>
            
            <div class="panel-body">
                <div class="target-info">
                    <div class="target-status">TARGET STATUS: <span style="color: #ff3366">HOSTILE</span></div>
                    <div class="target-encryption">ENCRYPTION: LEVEL 1 (ENGLISH)</div>
                </div>

                <div class="question-container">
                    <h3 class="the-question">> ${defaultQuestion.q}</h3>
                    
                    <div class="options-grid">
                        ${defaultQuestion.options.map((opt, i) => `
                            <button class="cyber-option-btn" data-index="${i}">
                                <span class="opt-prefix">[${String.fromCharCode(65 + i)}]</span> ${opt}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="panel-footer">
                <div class="hacking-progress">
                    <div class="progress-bar-fill"></div>
                </div>
                <div class="status-msg blink">AWAITING INPUT...</div>
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

    optionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Disable buttons to prevent double click
            optionBtns.forEach(b => b.style.pointerEvents = 'none');

            const selectedIndex = parseInt(btn.getAttribute('data-index'));

            if (selectedIndex === defaultQuestion.correct) {
                // SUCCESS
                btn.classList.add('correct-choice');
                statusMsg.textContent = 'ACCESS GRANTED. OVERRIDING PROTOCOLS...';
                statusMsg.style.color = '#00ff44';

                // Execute Conquest
                setTimeout(() => {
                    executeConquest(hexData, hitMesh, user.clan);
                    closeModal();
                }, 1500);

            } else {
                // FAILURE
                btn.classList.add('wrong-choice');
                statusMsg.textContent = 'ACCESS DENIED. INTRUSION DETECTED.';
                statusMsg.style.color = '#ff0000';

                // Show correct one
                optionBtns[defaultQuestion.correct].classList.add('correct-choice');

                setTimeout(() => {
                    closeModal();
                }, 2000);
            }
        });
    });

    return modalOverlay;
}

function executeConquest(hexData, hitMesh, winningClan) {
    // 1. Update the Store State (if territories are fully mapped)
    // For now, this is a visual override demo per user request

    // 2. Change Visuals in 3D Scene
    const clanColors = {
        'turing': 0x00c3ff,
        'tesla': 0xff0000,
        'mccarthy': 0x00ff44,
        'lovelace': 0xaa00ff,
        'neumann': 0xff6600
    };

    const newColorHex = clanColors[winningClan.toLowerCase()] || 0x00f0ff;

    // We expect hitMesh (Fill) and its parent group to contain the LineLoop

    // CLONE the materials to prevent global coloring (BUG FIX)
    hitMesh.material = hitMesh.material.clone();
    hitMesh.material.color.setHex(newColorHex);
    hitMesh.material.emissive.setHex(newColorHex);
    hitMesh.material.opacity = 0.3;
    hitMesh.material.emissiveIntensity = 0.4;

    // Find sibling LineLoop by checking exact same position
    hitMesh.parent.children.forEach(child => {
        if (child.type === 'LineLoop' && child.position.distanceToSquared(hitMesh.position) < 0.1) {
            child.material = child.material.clone(); // CLONE LINE
            child.material.color.setHex(newColorHex);
            child.material.opacity = 1.0;
            child.material.linewidth = 3;
        }
    });

    // Update Metadata
    hitMesh.userData.isTerritory = true;
    hitMesh.userData.owner = winningClan;
    hitMesh.userData.baseColor = newColorHex;

    // Victory Visual Flair
    if (window.gsap) {
        gsap.fromTo(hitMesh.scale,
            { x: 1, y: 1, z: 1 },
            { x: 1.5, y: 1.5, z: 1.5, duration: 0.3, yoyo: true, repeat: 1, ease: "power2.out" }
        );
    }
}
