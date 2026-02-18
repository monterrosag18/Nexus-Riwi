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

    // 1. Activate Blast Doors (GSAP Heavy Physics)
    const doors = document.getElementById('transition-doors');

    // Only animate if moving between views
    if (doors) {
        // GSAP Timeline for cinematic entry
        const tl = gsap.timeline({
            onComplete: () => {
                // Animation sequence complete (Open)
                gsap.set(doors, { pointerEvents: "none" });
            }
        });

        // --- STEP 1: SLAM SHUT (Heavy Impact) ---
        gsap.set(doors, { pointerEvents: "all" });

        tl.to(['.door-left', '.door-right'], {
            x: 0,
            duration: 0.4,
            ease: "power4.in", // Accelerate heavily
        })

            // --- STEP 2: IMPACT SHOCKWAVE (Camera Shake + Spark) ---
            .add(() => {
                // Flash of light at center
                const flash = document.querySelector('.door-flash');
                if (flash) {
                    gsap.fromTo(flash, { opacity: 1 }, { opacity: 0, duration: 0.2 });
                }

                // Shake the whole body slightly
                gsap.to('body', {
                    x: "random(-10, 10)",
                    y: "random(-10, 10)",
                    duration: 0.1,
                    repeat: 3,
                    yoyo: true,
                    clearProps: "x,y"
                });

                // Show Loading HUD
                gsap.to('.door-emblem', { opacity: 1, duration: 0.2 });
            })

            // --- STEP 3: CHANGE CONTENT (Hidden) ---
            .add(() => {
                changeViewContent(hash);
                updateUIState(hash);
            }, "+=0.3") // Wait a bit in dark

            // --- STEP 4: UNLOCK & OPEN (Mechanical Release) ---
            .to('.lock-mechanism', {
                rotation: 180,
                duration: 0.4,
                ease: "back.in(1.7)"
            }, "+=0.5") // Wait for load

            .to('.door-emblem', {
                opacity: 0,
                duration: 0.2
            })

            .to(['.door-left', '.door-right'], {
                x: (i) => i === 0 ? "-100%" : "100%",
                duration: 0.8,
                ease: "power2.inOut", // Smooth heavy open
                stagger: 0.1 // One opens slightly before other
            });

    } else {
        // Fallback if no doors found
        changeViewContent(hash);
        updateUIState(hash);
    }
}

function changeViewContent(hash) {
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
}

function updateUIState(hash) {
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
