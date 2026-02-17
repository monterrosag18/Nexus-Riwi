export default function renderChat() {
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chat-widget';
    chatContainer.className = 'cyber-chat-widget minimized'; // Start minimized

    chatContainer.innerHTML = `
        <!-- Floating Toggle Icon -->
        <div class="chat-toggle-btn">
            <i class="fa-solid fa-comments"></i>
            <span class="notification-dot"></span>
        </div>

        <!-- Main Chat Window -->
        <div class="chat-window">
            <div class="chat-header">
                <span><i class="fa-solid fa-tower-broadcast"></i> NEURAL LINK</span>
                <div class="chat-controls">
                    <span class="minimize-chat-btn"><i class="fa-solid fa-xmark"></i></span>
                    <span class="status-indicator online"></span>
                </div>
            </div>
            <div class="chat-body-container">
                <div class="chat-messages" id="chat-messages">
                    <div class="msg system">
                        <span class="msg-time">${new Date().toLocaleTimeString()}</span>
                        <span class="msg-content">System initialized. Secure channel established.</span>
                    </div>
                </div>
                <input type="text" id="chat-input" placeholder="Transmit message..." autocomplete="off">
            </div>
        </div>
    `;

    // Interaction
    const toggleBtn = chatContainer.querySelector('.chat-toggle-btn');
    const closeBtn = chatContainer.querySelector('.minimize-chat-btn');
    const input = chatContainer.querySelector('#chat-input');
    const messages = chatContainer.querySelector('#chat-messages');

    // Toggle Logic
    toggleBtn.addEventListener('click', () => {
        chatContainer.classList.remove('minimized');
        chatContainer.classList.add('expanded');
    });

    closeBtn.addEventListener('click', () => {
        chatContainer.classList.remove('expanded');
        chatContainer.classList.add('minimized');
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
            addMessage(messages, input.value.trim(), 'user');
            input.value = '';

            // Mock response
            setTimeout(() => {
                addMessage(messages, "Copy that, agent.", 'system');
            }, 1000);
        }
    });

    return chatContainer;
}

function addMessage(container, text, type) {
    const msg = document.createElement('div');
    msg.className = `msg ${type}`;
    msg.innerHTML = `
        <span class="msg-time">${new Date().toLocaleTimeString()}</span>
        <span class="msg-content">${text}</span>
    `;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}
