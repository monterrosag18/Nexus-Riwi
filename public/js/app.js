import { initRouter } from './router.js';
import { renderSidebar } from './components/Sidebar.js';
import { SpaceBackground } from './components/SpaceBackground.js';
import createFactionChat from './components/FactionChat.js';
import renderMiniLeaderboard from './components/MiniLeaderboard.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Nexus...');

    // 0. Init 3D Universe
    try {
        const spaceBg = new SpaceBackground();
        spaceBg.init();
        console.log('SpaceBackground initialized.');
    } catch (e) {
        console.error('Failed to init SpaceBackground:', e);
    }

    // 1. Render Static Shell Components
    const appContainer = document.getElementById('app');

    const sidebarContainer = document.getElementById('sidebar');
    if (sidebarContainer) sidebarContainer.appendChild(renderSidebar());

    const topBar = document.getElementById('top-bar');
    if (topBar) {
        topBar.innerHTML = ''; // Clear hardcoded HTML
        import('./components/ProfileHeader.js').then(m => {
            topBar.appendChild(m.createProfileHeader());
        });
    }
    // 2. Init Global Faction Chat
    const chatWidget = document.getElementById('chat-widget');
    if (chatWidget) {
        chatWidget.innerHTML = '';
        chatWidget.className = 'faction-chat-wrapper minimized'; // Start closed
        chatWidget.appendChild(createFactionChat());

        // Toggle Listener
        window.addEventListener('nexus:toggleChat', () => {
            chatWidget.classList.toggle('active');
            chatWidget.classList.toggle('minimized');
            console.log('Chat toggle triggered');
        });
    }

    // 2. Initialize Router (which renders the initial view)
    initRouter();

    console.log('Riwi Nexus System Online. Warning: Unauthorized access to clan data prohibited.');
});
