export default function createChallengeModal(territory, onComplete) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay fade-in';

    // Quick question format
    const q = territory.question || {
        q: "System Override Required. Solve verification hash.",
        options: ["0xA4F2", "0xB3C1", "0x99D0"],
        correct: 0
    };

    modalOverlay.innerHTML = `
        <div class="cyber-modal">
            <div class="modal-header">
                <h3><i class="fa-solid fa-shield-halved"></i> SECURITY CHALLENGE</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <p class="challenge-text">${q.q}</p>
                <div class="options-grid">
                    ${q.options.map((opt, i) => `
                        <button class="cyber-option" data-index="${i}">
                            <span class="opt-label">${String.fromCharCode(65 + i)}</span>
                            <span class="opt-text">${opt}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <div class="timer-bar"><div class="progress"></div></div>
                <p class="status-text">WAITING FOR INPUT...</p>
            </div>
        </div>
    `;

    // Interaction
    const options = modalOverlay.querySelectorAll('.cyber-option');
    const statusText = modalOverlay.querySelector('.status-text');

    options.forEach(btn => {
        btn.addEventListener('click', () => {
            // Disable all
            options.forEach(b => b.disabled = true);

            const selected = parseInt(btn.dataset.index);
            if (selected === q.correct) {
                btn.classList.add('correct');
                statusText.innerHTML = '<span class="text-neon-green">ACCESS GRANTED</span>';
                setTimeout(() => {
                    onComplete(true);
                    close();
                }, 1000);
            } else {
                btn.classList.add('wrong');
                statusText.innerHTML = '<span class="text-neon-red">ACCESS DENIED</span>';
                setTimeout(() => {
                    onComplete(false);
                    close();
                }, 1000);
            }
        });
    });

    const closeBtn = modalOverlay.querySelector('.close-modal');
    closeBtn.onclick = close;

    function close() {
        modalOverlay.remove();
    }

    return modalOverlay;
}
