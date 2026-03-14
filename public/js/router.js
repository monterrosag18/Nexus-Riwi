import { store } from './store.js';

// Import View Components
import renderMap from './components/HexGrid.js';
import renderLeaderboard from './components/Leaderboard.js';
import renderShop from './components/ShopCarousel.js'; // Updated to new 3D Carousel
import renderLogin from './components/Login.js';
import renderAdminDashboard from './components/AdminDashboard.js';
import renderFieldManual from './components/FieldManual.js';

const routes = {
    'login': renderLogin,
    'map': renderMap,
    'leaderboard': renderLeaderboard,
    'shop': renderShop,
    'admin': renderAdminDashboard,
    'manual': renderFieldManual
};

export function initRouter() {
    // Handle initial load
    handleRoute();

    // Handle hash changes
    window.addEventListener('hashchange', handleRoute);
}

let isInitialLoad = true;

function handleRoute() {
    const rawHash = window.location.hash;
    let hash = rawHash.slice(1);
    const user = store.getState().currentUser;

    console.log(`[Router] Navigating to: ${hash || 'root'} | User: ${user ? user.name : 'None'}`);

    // 1. Redirection Logic (Auth Guards)
    // If NO user and NOT on login page -> Force #login
    const isValidUser = user && (user.name || user.id);

    if (!isValidUser && hash !== 'login') {
        console.log("[Router] Unauthenticated access. Redirecting to #login.");
        window.location.hash = '#login';
        return; 
    }

    // If USER exists and IS on login page or root -> Force #map
    if (isValidUser && (hash === 'login' || !hash)) {
        console.log("[Router] Authenticated user on login/root. Redirecting to #map.");
        window.location.hash = '#map';
        return;
    }

    // 2. Admin Role Guard
    if (hash === 'admin' && isValidUser && user.role !== 'SUPER_USER') {
        console.log("[Router] Insufficient privileges for #admin. Redirecting to #map.");
        window.location.hash = '#map';
        return;
    }

    // Default hash fallback
    if (!hash) hash = 'login';

    const doors = document.getElementById('transition-doors');

    // INITIAL LOAD OPTIMIZATION: 
    // If it's the first time loading and we are at login, we skip the heavy slam animation.
    if (isInitialLoad && hash === 'login') {
        console.log("[Router] Initial Load: Login detected. Fast rendering.");
        isInitialLoad = false;
        changeViewContent(hash);
        updateUIState(hash);
        if (doors) {
            gsap.set(['.door-left', '.door-right'], { x: (i) => i === 0 ? "-100%" : "100%" });
            gsap.set(doors, { pointerEvents: "none" });
        }
        return;
    }

    isInitialLoad = false;

    // Transition Logic
    if (doors && window.gsap) {
        console.log(`[Router] Transitioning to ${hash} via Blast Doors.`);
        
        const tl = gsap.timeline({
            onComplete: () => {
                gsap.set(doors, { pointerEvents: "none" });
                console.log(`[Router] Transition to ${hash} complete.`);
            }
        });

        // Fail-safe: Force doors open after 4s
        const failSafe = setTimeout(() => {
            console.warn("[Router] Door transition timed out. Forcing open.");
            gsap.to(['.door-left', '.door-right'], { x: (i) => i === 0 ? "-100%" : "100%", duration: 0.5 });
            gsap.set(doors, { pointerEvents: "none" });
        }, 4000);

        gsap.set(doors, { pointerEvents: "all" });

        tl.to(['.door-left', '.door-right'], {
            x: 0,
            duration: 0.4,
            ease: "power4.in", 
        })
        .add(() => {
            const flash = document.querySelector('.door-flash');
            if (flash) gsap.fromTo(flash, { opacity: 1 }, { opacity: 0, duration: 0.2 });

            gsap.to('body', {
                x: "random(-10, 10)",
                y: "random(-10, 10)",
                duration: 0.1,
                repeat: 3,
                yoyo: true,
                clearProps: "x,y"
            });
            gsap.to('.door-emblem', { opacity: 1, duration: 0.2 });
        })
        .add(() => {
            changeViewContent(hash);
            updateUIState(hash);
        }, "+=0.3")
        .to('.lock-mechanism', {
            scale: 1.2,
            opacity: 1,
            duration: 0.4,
            ease: "back.out(1.7)"
        }, "+=0.5")
        .to('.door-emblem', { opacity: 0, duration: 0.2 })
        .to(['.door-left', '.door-right'], {
            x: (i) => i === 0 ? "-100%" : "100%",
            duration: 0.8,
            ease: "power2.inOut",
            stagger: 0.1,
            onComplete: () => clearTimeout(failSafe)
        });
    } else {
        console.log(`[Router] Fast jumping to ${hash} (No Doors/GSAP).`);
        changeViewContent(hash);
        updateUIState(hash);
    }
}

function changeViewContent(hash) {
    try {
        store.setView(hash);
        const viewContainer = document.getElementById('view-container');
        const renderFunction = routes[hash];

        if (renderFunction) {
            console.log(`[Router] Rendering component for: ${hash}`);
            viewContainer.innerHTML = ''; 
            const content = renderFunction();
            if (content) {
                viewContainer.appendChild(content);
            } else {
                console.error(`[Router] Render function for ${hash} returned null/undefined.`);
            }
        } else {
            console.error(`[Router] No route found for: ${hash}`);
            viewContainer.innerHTML = '<h2>404 - Sector Not Found</h2>';
        }
    } catch (err) {
        console.error(`[Router] Critical failure rendering ${hash}:`, err);
        document.getElementById('view-container').innerHTML = `<div class='error-view'>SYSTEM ERROR: UNABLE TO INITIALIZE SECTOR ${hash.toUpperCase()}</div>`;
    }
}

function updateUIState(hash) {
    // Sidebar/Topbar/Chat Visibility Control
    const sidebar = document.getElementById('sidebar');
    const topBar = document.getElementById('top-bar');
    const chatWidget = document.getElementById('chat-widget');
    const viewContainer = document.getElementById('view-container');

    if (hash === 'login') {
        if (sidebar) sidebar.style.display = 'none';
        if (topBar) topBar.style.display = 'none';
        if (chatWidget) chatWidget.style.display = 'none';
        if (viewContainer) {
            viewContainer.style.padding = '0';
            viewContainer.style.overflow = 'hidden';
        }
    } else {
        if (sidebar) sidebar.style.display = 'flex';
        if (topBar) topBar.style.display = 'flex';
        if (chatWidget) chatWidget.style.display = 'block';
        if (viewContainer) {
            viewContainer.style.padding = '';
            viewContainer.style.overflow = '';
        }
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
