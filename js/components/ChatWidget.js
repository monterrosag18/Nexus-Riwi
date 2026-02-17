export function initChatWidget() {
    const chatContainer = document.getElementById('chat-widget');

    // Create Button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'chat-toggle-btn';
    toggleBtn.innerHTML = '<i class="fa-solid fa-comments"></i>';
    toggleBtn.title = 'Open Clan Comms';

    // Create Window
    const chatWindow = document.createElement('div');
    chatWindow.className = 'chat-window hidden'; // Hidden by default
    chatWindow.innerHTML = `
        <div class="chat-header">
            <span><i class="fa-solid fa-shield-halved"></i> TURING_OPS_CHANNEL</span>
            <span class="close-chat"><i class="fa-solid fa-chevron-down"></i></span>
        </div>
        <div class="chat-messages">
            <div class="msg system">Encrypted Connection Established...</div>
            <div class="msg incoming">
                <span class="sender">Dev_Ninja:</span>
                <span class="text">We need 500 more points for Sector 12!</span>
            </div>
            <div class="msg incoming">
                <span class="sender">CodeMaster_T:</span>
                <span class="text">On it. Finishing the JS Kata now.</span>
            </div>
             <div class="msg incoming">
                <span class="sender">Sarah_Bot:</span>
                <span class="text">Don't forget the English daily challenge. double XP!</span>
            </div>
        </div>
        <div class="chat-input">
            <input type="text" placeholder="Enter strategy command..." id="chat-input-field">
            <button><i class="fa-solid fa-paper-plane"></i></button>
        </div>
    `;

    // Logic
    toggleBtn.onclick = () => {
        chatWindow.classList.remove('hidden');
        toggleBtn.classList.add('hidden');
    };

    chatWindow.querySelector('.close-chat').onclick = () => {
        chatWindow.classList.add('hidden');
        toggleBtn.classList.remove('hidden');
    };

    const input = chatWindow.querySelector('input');
    const sendBtn = chatWindow.querySelector('.chat-input button');
    const msgsContainer = chatWindow.querySelector('.chat-messages');

    const sendMsg = () => {
        const text = input.value.trim();
        if (text) {
            const msgDiv = document.createElement('div');
            msgDiv.className = 'msg outgoing';
            msgDiv.innerHTML = `<span class="text">${text}</span>`;
            msgsContainer.appendChild(msgDiv);
            input.value = '';
            msgsContainer.scrollTop = msgsContainer.scrollHeight;
        }
    };

    sendBtn.onclick = sendMsg;
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMsg(); };

    chatContainer.appendChild(chatWindow);
    chatContainer.appendChild(toggleBtn);
}
