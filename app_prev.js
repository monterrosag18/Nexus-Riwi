import { initRouter } from './router.js';
import { renderSidebar } from './components/Sidebar.js';
import { SpaceBackground } from './components/SpaceBackground.js';
import renderChat from './components/Chat.js';
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

    // const chatContainer = document.getElementById('chat-widget');
    // if (chatContainer) chatContainer.replaceWith(renderChat()); // Chat disabled per user request

    // Render Mini Leaderboard (New)
    const miniLeaderboard = renderMiniLeaderboard();
    appContainer.appendChild(miniLeaderboard);

    // 2. Initialize Router (which renders the initial view)
    initRouter();

    console.log('Riwi Nexus System Online. Warning: Unauthorized access to clan data prohibited.');
});
