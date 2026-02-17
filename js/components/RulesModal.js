export default function createRulesModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay fade-in';

    // Auto-close on outside click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.remove();
    });

    modalOverlay.innerHTML = `
        <div class="cyber-modal rules-modal" style="width: 800px; max-width: 90vw;">
            <div class="modal-header">
                <h3><i class="fa-solid fa-book-journal-whills"></i> NEXUS PROTOCOLS: GAME GUIDE</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="rules-grid">
                    <div class="rule-card">
                        <div class="rule-icon"><i class="fa-solid fa-flag"></i></div>
                        <h4>TERRITORIES</h4>
                        <p>Expand your Clan's influence. Conquer neutral sectors to gain strategic positioning.</p>
                    </div>
                    
                    <div class="rule-card">
                        <div class="rule-icon"><i class="fa-solid fa-map"></i></div>
                        <h4>THE MAP</h4>
                        <p>
                            <span class="text-neon-blue">Turing (Code)</span>, 
                            <span class="text-neon-red">Tesla (English)</span>, 
                            <span class="text-neon-green">McCarthy (Skills)</span>.
                            <br>Target adjacent sectors to spread.
                        </p>
                    </div>

                    <div class="rule-card">
                        <div class="rule-icon"><i class="fa-solid fa-trophy"></i></div>
                        <h4>POINTS & SCORING</h4>
                        <p>Solve challenges to earn XP. 
                        <br>Correct Answer: <span class="text-neon-green">+50 XP</span>
                        <br>Territory Control: <span class="text-neon-blue">+100 XP / hr</span></p>
                    </div>

                    <div class="rule-card">
                        <div class="rule-icon"><i class="fa-solid fa-cart-shopping"></i></div>
                        <h4>THE SHOP</h4>
                        <p>Exchange points for Hacks, Shields, and System Overrides to aid your conquest.</p>
                    </div>
                </div>

                <div class="rules-footer-note">
                    <p><i class="fa-solid fa-circle-info"></i> RULE #1: KNOWLEDGE IS POWER. RULE #2: DON'T GET CAUGHT.</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="cyber-btn" id="ack-rules">ACKNOWLEDGE</button>
            </div>
        </div>
    `;

    // Interaction
    const closeBtn = modalOverlay.querySelector('.close-modal');
    closeBtn.onclick = () => modalOverlay.remove();

    const ackBtn = modalOverlay.querySelector('#ack-rules');
    ackBtn.onclick = () => modalOverlay.remove();

    return modalOverlay;
}
