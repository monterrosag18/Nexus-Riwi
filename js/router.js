import { store } from './store.js';

// Import View Components
import renderMap from './components/HexGrid.js';
import renderLeaderboard from './components/Leaderboard.js';
import renderShop from './components/RewardShop.js';
import renderLogin from './components/Login.js';

const routes = {
    'login': renderLogin,
    'map': renderMap,
    'leaderboard': renderLeaderboard,
    'shop': renderShop
};

export function initRouter() {
    // Handle initial load
    handleRoute();

    // Handle hash changes
    window.addEventListener('hashchange', handleRoute);
}

function handleRoute() {
    let hash = window.location.hash.slice(1);

    // Auth Guard
    const user = store.getState().currentUser;

    // If no user, force login
    if (!user) {
        if (hash !== 'login') {
            window.location.hash = '#login';
            return; // hashchange will fire again
        }
    } else {
        // If user logged in and tries to go to login, redirect to map
        if (hash === 'login' || !hash) {
            window.location.hash = '#map';
            return;
        }
    }

    // Default to map if empty hash and logged in
    if (!hash && user) hash = 'map';

    // Update store state
    store.setView(hash);

    // Render view
    const viewContainer = document.getElementById('view-container');
    const renderFunction = routes[hash];

    if (renderFunction) {
        viewContainer.innerHTML = ''; // Clear current
        viewContainer.appendChild(renderFunction());
    } else {
        viewContainer.innerHTML = '<h2>404 - Sector Not Found</h2>';
    }

    // Sidebar/Topbar/Chat Visibility Control
    const sidebar = document.getElementById('sidebar');
    const topBar = document.getElementById('top-bar');
    const chatWidget = document.getElementById('chat-widget');

    if (hash === 'login') {
        if (sidebar) sidebar.style.display = 'none';
        if (topBar) topBar.style.display = 'none';
        if (chatWidget) chatWidget.style.display = 'none';
    } else {
        if (sidebar) sidebar.style.display = 'flex';
        if (topBar) topBar.style.display = 'flex';
        if (chatWidget) chatWidget.style.display = 'block';
    }

    updateSidebarActiveState(hash);
}

function updateSidebarActiveState(route) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${route}`) {
            item.classList.add('active');
        }
    });
}
