import { store } from '../store.js';

export default function createFactionChat() {
    const chatPanel = document.createElement('div');
    chatPanel.className = 'faction-chat-container';
    
    let activeTab = 'clan'; // 'clan' or 'global'

    function render() {
        const state = store.getState();
        const user = state.currentUser || { name: 'GUEST', clan: 'neutral' };
        const clanInfo = state.clans[user.clan] || { name: 'Neutral', color: '#8b9bb4' };
        
        chatPanel.innerHTML = `
            <div class="chat-header-main">
                <div class="chat-header-title">
                    <i class="fa-solid fa-comments"></i> ${clanInfo.name.toUpperCase()} CHANNEL
                </div>
                <button class="chat-close-btn"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="chat-tabs">
                <button class="chat-tab ${activeTab === 'clan' ? 'active' : ''}" data-tab="clan">
                    <i class="fa-solid fa-tower-broadcast"></i> CLAN
                </button>
                <button class="chat-tab ${activeTab === 'global' ? 'active' : ''}" data-tab="global">
                    <i class="fa-solid fa-globe"></i> GLOBAL
                </button>
            </div>
            
            <div class="chat-view ${activeTab === 'clan' ? 'active' : ''}" id="clan-view">
                <div class="chat-history" id="faction-chat-history">
                    ${renderMessagesFromList([])}
                </div>
                <div class="chat-input-area">
                    <input type="text" id="faction-chat-input" placeholder="Secure transmit..." autocomplete="off">
                    <button id="btn-send-chat"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
            
            <div class="chat-view ${activeTab === 'global' ? 'active' : ''}" id="global-view">
                <div class="global-placeholder">
                    <i class="fa-solid fa-lock"></i>
                    <p>ENCRYPTION ACTIVE</p>
                    <span>CHANNEL OFFLINE (COMING SOON)</span>
                </div>
            </div>
        `;

        attachEvents();
    }

    async function updateChatDisplay() {
        if (activeTab === 'clan') {
            const history = chatPanel.querySelector('#faction-chat-history');
            if (history) {
                const user = store.getState().currentUser;
                if (user) {
                    const messages = await store.getChatMessages(user.clan);
                    history.innerHTML = renderMessagesFromList(messages);
                    history.scrollTop = history.scrollHeight;
                }
            }
        }
    }

    function renderMessagesFromList(messages) {
        if (messages.length === 0) {
            return `<div class="chat-empty">ENCRYPTED CHANNEL SECURED. READY FOR INPUT.</div>`;
        }

        return messages.map(m => {
            const time = new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const myName = (store.getState().currentUser?.name || '').toLowerCase();
            const msgUser = (m.user || '').toLowerCase();
            const isMe = msgUser === myName;
            const chatColor = (isMe && store.getState().currentUser?.active_chat_color) || '';
            
            return `
                <div class="chat-message ${isMe ? 'own' : ''}">
                    <div class="msg-meta">
                        <span class="msg-user">${m.user.toUpperCase()}</span>
                        <span class="msg-time">${time}</span>
                    </div>
                    <div class="msg-bubble" style="${chatColor ? `border-color: ${chatColor}; box-shadow: 0 0 10px ${chatColor}44; color: ${chatColor};` : ''}">${m.msg}</div>
                </div>
            `;
        }).join('');
    }

    function attachEvents() {
        const tabs = chatPanel.querySelectorAll('.chat-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                activeTab = tab.dataset.tab;
                render();
            });
        });

        const closeBtn = chatPanel.querySelector('.chat-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('nexus:toggleChat'));
            });
        }

        const input = chatPanel.querySelector('#faction-chat-input');
        const sendBtn = chatPanel.querySelector('#btn-send-chat');

        if (input && sendBtn) {
            const sendMessage = async () => {
                const text = input.value.trim();
                const user = store.getState().currentUser;
                if (text && user) {
                    await store.addChatMessage(user.clan, user, text);
                    input.value = '';
                    // Force immediate update
                    await updateChatDisplay();
                }
            };

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
            sendBtn.addEventListener('click', sendMessage);
        }
    }

    // Subscribe to store changes to refresh messages
    store.subscribe(() => {
        updateChatDisplay();
    });

    // Initial load
    setTimeout(() => updateChatDisplay(), 100);

    render();
    return chatPanel;
}
