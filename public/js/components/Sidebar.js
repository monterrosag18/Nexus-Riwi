import { store } from '../store.js';
import createRulesModal from './RulesModal.js';
import createGachaModal from './GachaModal.js';
import createProfilePanel from './ProfilePanel.js';

export function renderSidebar() {
    const nav = document.createElement('nav');
    nav.className = 'sidebar-nav';
    nav.id = 'sidebar'; // Ensure ID for toggling

    const menuItems = [
        { icon: 'fa-map', route: 'map', label: 'Map' },
        { icon: 'fa-trophy', route: 'leaderboard', label: 'Ranking' },
        { icon: 'fa-dungeon', route: 'shop', label: 'Shop' },
        { icon: 'fa-comments', route: 'chat', label: 'Chat' },
        { icon: 'fa-book-atlas', route: 'rules', label: 'Rules' }
    ];

    menuItems.forEach(item => {
        const link = document.createElement('a');
        link.href = `#${item.route}`;
        link.className = 'nav-item';
        link.innerHTML = `
            <i class="fa-solid ${item.icon}"></i>
            <span class="tooltip">${item.label}</span>
        `;

        // Handle specific actions
        if (item.route === 'shop') {
            link.href = '#shop';
            // No custom onclick needed, router handles #shop -> renderShop()
        }

        if (item.route === 'chat') {
            link.href = '#';
            link.onclick = (e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('nexus:toggleChat'));
            };
        }

        if (item.route === 'rules') {
            link.href = '#';
            link.onclick = (e) => {
                e.preventDefault();
                const modal = createRulesModal();
                document.body.appendChild(modal);
            };
        }

        nav.appendChild(link);
    });

    // Profile Trigger (Pinned to bottom-ish)
    const profileLink = document.createElement('a');
    profileLink.href = '#';
    profileLink.className = 'nav-item';
    profileLink.innerHTML = `<i class="fa-solid fa-user-gear"></i><span class="tooltip">PROFILE</span>`;
    profileLink.onclick = (e) => {
        e.preventDefault();
        const modal = createProfilePanel();
        document.body.appendChild(modal);
    };
    nav.appendChild(profileLink);

    // Spacer
    const spacer = document.createElement('div');
    spacer.style.flex = '1';
    nav.appendChild(spacer);

    // Logout Button
    const logoutBtn = document.createElement('a');
    logoutBtn.href = '#';
    logoutBtn.className = 'nav-item logout-btn';
    logoutBtn.innerHTML = `
        <i class="fa-solid fa-power-off text-neon-red"></i>
        <span class="tooltip">LOGOUT</span>
    `;
    logoutBtn.onclick = (e) => {
        e.preventDefault();
        if (confirm('TERMINATE UPLINK?')) {
            store.logout();
        }
    };
    nav.appendChild(logoutBtn);

    return nav;
}
