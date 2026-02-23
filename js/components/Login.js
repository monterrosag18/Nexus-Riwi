import { store } from '../store.js';

export default function renderLogin() {
  const container = document.createElement('div');
  container.className = 'container-fluid fade-in';
  container.style.padding = '0';
  container.style.margin = '0';
  container.style.height = '100vh';
  container.style.width = '100vw';
  container.style.overflow = 'hidden';

  // Ensure GSAP is loaded for circuit animation
  if (!window.gsap) {
    console.warn("GSAP is not loaded globally. Circuit animation may not work.");
  }

  container.innerHTML = `
      <div class="flex w-full h-full m-0 p-0 bg-[#05050a]">
        
        <!-- Intro Video Modal overlay -->
        <div id="introVideoModal" class="absolute inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity duration-500">
            <div class="relative w-full max-w-5xl mx-auto px-4 group">
                <video id="introVideo" src="../assets/video/login.mp4" autoplay preload="auto" playsinline muted controls class="w-full h-auto max-h-[85vh] rounded-lg shadow-[0_0_50px_rgba(0,240,255,0.4)] border border-primary/30 object-cover"></video>
                <button id="closeVideoBtn" class="absolute top-2 right-6 p-2 text-white hover:text-primary transition-colors cursor-pointer z-10 bg-black/80 rounded-full border border-white/30 backdrop-blur-sm">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
        </div>

        <div class="flex w-full h-full items-center justify-center relative circuit-wrapper" style="min-height: 100vh;">
          <svg id="circuit" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;"></svg>
          <div class="w-[90%] sm:w-[80%] md:w-[60%] lg:w-[400px] p-6 sm:p-10 rounded-2xl login-card z-10 mx-auto" style="max-width: 500px;">
            <div class="flex justify-center mb-2">
            
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 5px #00f0ff);">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
            </div>
            <h1 class="auth-brand" style="text-transform: lowercase; font-size: 2.5rem; letter-spacing: 2px;">
                <span style="color: #00f0ff;">&lt;/</span><span class="text-white">riwi</span><span style="color: #00f0ff;">&gt;</span>
                <span style="font-size: 1.2rem; vertical-align: middle; margin-left: 10px; color: #6a00ff; letter-spacing: 4px; text-transform: uppercase;">NEXUS</span>
            </h1>

            <form id="loginForm" method="post" action="">
              <div class="mb-3">
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  name="username"
                  required
                  placeholder="Codename / Alias"
                  autocomplete="off"
                />
              </div>

              <!-- LOGIN OVERRIDE (Current Nexus doesn't use passwords, we can hide this or keep it visually if we want, but logic will just use username for now to stay compatible with store.js) -->
              <div class="mb-3" style="display: none;">
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  name="password"
                  placeholder="Contraseña"
                />
              </div>

              <!-- CAMPOS REGISTRO -->
              <div class="register-only">
                <div class="mb-3">
                   <select id="clanSelect" class="form-control" style="background: rgba(0,0,0,0.5); border: 1px solid rgba(210, 110, 255, 0.35); color: #fff;">
                        <option value="" disabled selected>Select Clan / Faction</option>
                        <option value="turing" style="color: black;">TURING</option>
                        <option value="tesla" style="color: black;">TESLA</option>
                        <option value="mccarthy" style="color: black;">McCARTHY</option>
                   </select>
                </div>
              </div>
              
              <div class="form-error text-neon-red blink" style="text-align: center; min-height: 20px; font-size: 0.8rem; margin-bottom: 10px;"></div>

              <!-- BOTONES LOGIN -->
              <div class="my-4 login-actions text-center">
                <button id="btnLogin" type="submit" class="super-button" style="width: 100%; margin-bottom: 10px;">
                  <span>Log In</span>
                  <svg fill="none" viewBox="0 0 24 24" class="arrow">
                    <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2" stroke="currentColor" d="M5 12h14M13 6l6 6-6 6"></path>
                  </svg>
                </button>

                <button id="btnRegisterMode" type="button" class="super-button" style="width: 100%; background: linear-gradient(145deg, #111, #333);">
                  <span>Register</span>
                  <svg fill="none" viewBox="0 0 24 24" class="arrow">
                    <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2" stroke="currentColor" d="M5 12h14M13 6l6 6-6 6"></path>
                  </svg>
                </button>
              </div>

              <!-- BOTONES REGISTRO -->
              <div class="my-4 register-actions register-only text-center">
                <button id="btnConfirmRegister" type="submit" class="super-button" style="width: 100%; margin-bottom: 10px;">
                  <span>Confirm Registration</span>
                  <svg fill="none" viewBox="0 0 24 24" class="arrow">
                    <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2" stroke="currentColor" d="M5 12h14M13 6l6 6-6 6"></path>
                  </svg>
                </button>

                <button id="btnBackToLogin" type="button" class="super-button" style="width: 100%; background: linear-gradient(145deg, #111, #333);">
                  <span>Back to Login</span>
                  <svg fill="none" viewBox="0 0 24 24" class="arrow">
                    <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2" stroke="currentColor" d="M19 12H5M11 18l-6-6 6-6"></path>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

  // ---------------------------------------------------------
  // Event Handlers & Animation Logic
  // ---------------------------------------------------------
  const bindEvents = () => {
    const loginCard = container.querySelector('.login-card');
    const form = container.querySelector('#loginForm');
    const btnRegisterMode = container.querySelector('#btnRegisterMode');
    const btnBackToLogin = container.querySelector('#btnBackToLogin');
    const errorMsg = container.querySelector('.form-error');

    // Toggle Modes
    btnRegisterMode?.addEventListener("click", () => {
      loginCard.classList.add("is-register");
      errorMsg.textContent = "";
    });

    btnBackToLogin?.addEventListener("click", () => {
      loginCard.classList.remove("is-register");
      errorMsg.textContent = "";
    });

    function isRegisterMode() {
      return loginCard.classList.contains("is-register");
    }

    // Form Submit
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        errorMsg.textContent = "";

        const usernameInput = container.querySelector('#username').value.trim();
        if (!usernameInput) {
          errorMsg.textContent = "CODENAME REQUIRED";
          return;
        }

        if (isRegisterMode()) {
          const clan = container.querySelector('#clanSelect').value;
          if (!clan) {
            errorMsg.textContent = "ALLEGIANCE REQUIRED";
            return;
          }

          try {
            const result = store.registerUser(usernameInput, clan);
            if (result.success) {
              window.location.hash = '#map';
            } else {
              errorMsg.textContent = `ERROR: ${result.message}`;
              gsap.fromTo(loginCard, { x: -10 }, { x: 10, duration: 0.1, yoyo: true, repeat: 3 });
            }
          } catch (err) {
            errorMsg.textContent = 'SYSTEM ERROR';
          }
        } else {
          // Login Mode
          try {
            const result = store.loginUser(usernameInput);
            if (result.success) {
              window.location.hash = '#map';
            } else {
              errorMsg.textContent = `ERROR: ${result.message}`;
              gsap.fromTo(loginCard, { x: -10 }, { x: 10, duration: 0.1, yoyo: true, repeat: 3 });
            }
          } catch (err) {
            errorMsg.textContent = 'SYSTEM ERROR';
          }
        }
      });
    }

    // GSAP Parallax
    if (window.gsap) {
      window.addEventListener("mousemove", (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 12;
        const y = (e.clientY / window.innerHeight - 0.5) * 12;
        gsap.to(loginCard, { x, y, duration: 0.35, ease: "power2.out", overwrite: "auto" });
      });
    }

    // SVG Circuit Animation will be deferred until the video is closed

    // -------------------------
    // Video Modal Logic
    // -------------------------
    const videoModal = container.querySelector('#introVideoModal');
    const video = container.querySelector('#introVideo');
    const closeBtn = container.querySelector('#closeVideoBtn');

    const closeVideoModal = () => {
      if (!videoModal) return;
      videoModal.classList.add('opacity-0');
      videoModal.style.pointerEvents = 'none';
      setTimeout(() => {
        video.pause();
        videoModal.remove();
        // Start background circuit animation only AFTER video is removed
        generateCircuit();
      }, 500);
    };

    // Video always plays on load as requested by user
    if (videoModal && video) {
      video.play().catch(e => {
        console.warn('Autoplay prevented:', e);
      });

      video.addEventListener('ended', closeVideoModal);
      if (closeBtn) closeBtn.addEventListener('click', closeVideoModal);
    } else {
      generateCircuit();
    }
  };

  const generateCircuit = () => {
    const svg = container.querySelector("#circuit");
    if (!svg) return;

    // Use window size since it's full screen
    const width = window.innerWidth;
    const height = window.innerHeight;

    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.innerHTML = "";

    const nodeCount = 20;
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      nodes.push({ x, y });

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", x);
      circle.setAttribute("cy", y);
      circle.setAttribute("r", 3);
      circle.setAttribute("class", "node");
      svg.appendChild(circle);
    }

    for (let i = 0; i < nodes.length - 1; i++) {
      const start = nodes[i];
      const end = nodes[i + 1];
      const midX = end.x;
      const midY = start.y;

      const pathData = `M ${start.x} ${start.y} L ${midX} ${midY} L ${end.x} ${end.y}`;

      const pathGlow = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathGlow.setAttribute("d", pathData);
      pathGlow.setAttribute("class", "line");
      svg.appendChild(pathGlow);

      const pathCore = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathCore.setAttribute("d", pathData);
      pathCore.setAttribute("class", "line-core");
      svg.appendChild(pathCore);

      const durationGlow = 1.5 + Math.random() * 2; // 1.5s to 3.5s
      const durationCore = 1.5 + Math.random() * 2;

      pathGlow.style.strokeDasharray = pathGlow.getTotalLength();
      pathGlow.style.strokeDashoffset = pathGlow.getTotalLength();
      pathGlow.style.animation = `pulseLine ${durationGlow}s linear infinite`;

      pathCore.style.strokeDasharray = pathCore.getTotalLength();
      pathCore.style.strokeDashoffset = pathCore.getTotalLength();
      pathCore.style.animation = `pulseLine ${durationCore}s linear infinite`;
    }
  };

  setTimeout(bindEvents, 0);

  return container;
}
