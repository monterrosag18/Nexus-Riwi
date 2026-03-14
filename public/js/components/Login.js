import { store } from "../store.js";

export default function renderLogin() {
  const container = document.createElement("div");
  container.className = "container-fluid fade-in";
  container.style.padding = "0";
  container.style.margin = "0";
  container.style.height = "100vh";
  container.style.width = "100vw";
  container.style.overflow = "hidden";

  container.innerHTML = `
      <div class="flex w-full h-full m-0 p-0">
        
        <!-- Intro Video Modal overlay -->
        <div id="introVideoModal" class="absolute inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity duration-500">
            <div class="relative w-full max-w-5xl mx-auto px-4">
                <video id="introVideo" src="/assets/video/login.mp4" autoplay preload="auto" playsinline muted controls class="w-full h-auto max-h-[85vh] rounded-lg border border-primary/30 object-cover"></video>
                <button id="closeVideoBtn" class="absolute top-2 right-6 p-2 text-white cursor-pointer z-10 bg-black/80 rounded-full border border-white/30">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
        </div>

        <div class="flex w-full h-full items-center justify-center relative circuit-wrapper" style="min-height: 100vh;">
          <svg id="circuit" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;"></svg>
          <div class="w-[90%] sm:w-[80%] md:w-[60%] lg:w-[400px] p-6 sm:p-10 rounded-2xl login-card z-10 mx-auto" style="max-width: 500px;">
            <div class="flex justify-center mb-2">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00b4ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 6px #00b4ff);">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
            </div>
            <div class="tag" id="tag">
              <span class="cursor" id="cursor"></span>
            </div>

            <!-- Tabs -->
            <div class="login-tabs">
              <button id="tabLogin" class="tab-btn active" type="button">Login</button>
              <button id="tabRegister" class="tab-btn" type="button">Sign Up</button>
            </div>

            <form id="loginForm" method="post" action="">
              <div class="mb-3">
                <input type="text" class="form-control" id="username" name="username" required placeholder="Codename / Alias" autocomplete="off" />
              </div>

              <div class="mb-3">
                <input type="password" class="form-control" id="password" name="password" required placeholder="Security Key / Password" />
              </div>

              <div class="register-only">
                <div class="mb-3">
                   <select id="clanSelect" class="form-control">
                        <option value="" disabled selected>Select Clan / Faction</option>
                        <option value="turing">TURING</option>
                        <option value="tesla">TESLA</option>
                        <option value="mccarthy">McCARTHY</option>
                        <option value="thompson">THOMPSON</option>
                        <option value="hamilton">HAMILTON</option>
                   </select>
                </div>
              </div>
              
              <div class="form-error"></div>

              <!-- BOTONES LOGIN -->
              <div class="my-4 login-actions text-center">
                <button id="btnLogin" type="submit" class="super-button" style="width: 100%; margin-bottom: 10px;">
                  <span>Log In</span>
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

                <button id="btnBackToLogin" type="button" class="super-button btn-back" style="width: 100%;">
                  <svg fill="none" viewBox="0 0 24 24" class="arrow" style="transform: rotate(180deg);">
                    <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2" stroke="currentColor" d="M5 12h14M13 6l6 6-6 6"></path>
                  </svg>
                  <span>Back to Login</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

  const bindEvents = () => {
    const loginCard = container.querySelector(".login-card");
    const form = container.querySelector("#loginForm");
    const tabLogin = container.querySelector("#tabLogin");
    const tabRegister = container.querySelector("#tabRegister");
    const btnBackToLogin = container.querySelector("#btnBackToLogin");
    const errorMsg = container.querySelector(".form-error");

    tabLogin?.addEventListener("click", () => {
      loginCard.classList.remove("is-register");
      tabLogin.classList.add("active");
      tabRegister.classList.remove("active");
      errorMsg.textContent = "";
    });

    tabRegister?.addEventListener("click", () => {
      loginCard.classList.add("is-register");
      tabRegister.classList.add("active");
      tabLogin.classList.remove("active");
      errorMsg.textContent = "";
    });

    btnBackToLogin?.addEventListener("click", () => {
      loginCard.classList.remove("is-register");
      tabLogin.classList.add("active");
      tabRegister.classList.remove("active");
      errorMsg.textContent = "";
    });

    function isRegisterMode() {
      return loginCard.classList.contains("is-register");
    }

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorMsg.textContent = "";
        const usernameInput = container.querySelector("#username").value.trim();
        const passwordInput = container.querySelector("#password").value;
        if (!passwordInput) { errorMsg.textContent = "SECURITY KEY REQUIRED"; return; }

        if (isRegisterMode()) {
          const clan = container.querySelector("#clanSelect").value;
          if (!clan) { errorMsg.textContent = "ALLEGIANCE REQUIRED"; return; }
          try {
            const result = await store.registerUser(usernameInput, clan, passwordInput);
            if (result.success) { window.location.hash = "#map"; }
            else {
              errorMsg.textContent = `ERROR: ${result.message}`;
              if (window.gsap) gsap.fromTo(loginCard, { x: -8 }, { x: 8, duration: 0.08, yoyo: true, repeat: 4 });
            }
          } catch (err) { errorMsg.textContent = "SYSTEM ERROR"; }
        } else {
          try {
            const result = await store.loginUser(usernameInput, passwordInput);
            if (result.success) { window.location.hash = "#map"; }
            else {
              errorMsg.textContent = `ERROR: ${result.message}`;
              if (window.gsap) gsap.fromTo(loginCard, { x: -8 }, { x: 8, duration: 0.08, yoyo: true, repeat: 4 });
            }
          } catch (err) { errorMsg.textContent = "SYSTEM ERROR"; }
        }
      });
    }

    // Video Modal
    const videoModal = container.querySelector("#introVideoModal");
    const video = container.querySelector("#introVideo");
    const closeBtn = container.querySelector("#closeVideoBtn");

    const closeVideoModal = () => {
      if (!videoModal) return;
      videoModal.classList.add("opacity-0");
      videoModal.style.pointerEvents = "none";
      setTimeout(() => { video.pause(); videoModal.remove(); generateCircuit(); }, 500);
    };

    if (videoModal && video) {
      video.play().catch((e) => console.warn("Autoplay prevented:", e));
      video.addEventListener("ended", closeVideoModal);
      if (closeBtn) closeBtn.addEventListener("click", closeVideoModal);
    } else {
      generateCircuit();
    }

    // Typewriter
    const fullText = "</Riwi> Nexus";
    const tag = container.querySelector("#tag");
    const cursor = container.querySelector("#cursor");
    let index = 0;
    let chars = [];

    function typeNext() {
      if (index < fullText.length) {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = fullText[index];
        tag.insertBefore(span, cursor);
        chars.push(span);
        index++;
        setTimeout(typeNext, 120);
      } else {
        setTimeout(reset, 2200);
      }
    }

    function reset() {
      chars.forEach((c) => c.remove());
      chars = []; index = 0;
      setTimeout(typeNext, 400);
    }

    setTimeout(typeNext, 600);
  };

  // ---------------------------------------------------------
  // Circuit PCB ÔÇö trazas en esquinas, pocas l├¡neas, estilo placa
  // ---------------------------------------------------------
  const generateCircuit = () => {
    const svg = container.querySelector("#circuit");
    if (!svg) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML = "";

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
      <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="2.5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    `;
    svg.appendChild(defs);

    const COLOR      = "#00f0ff";
    const COLOR_BASE = "rgba(0,240,255,0.2)";

    // Dibuja una traza PCB con ├íngulos de 90┬░ y nodo circular al final
    function drawTrace(points, animDelay, animDuration) {
      if (points.length < 2) return;

      let d = `M ${points[0][0]} ${points[0][1]}`;
      for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i][0]} ${points[i][1]}`;
      }

      // L├¡nea base (siempre visible, tenue)
      const base = document.createElementNS("http://www.w3.org/2000/svg", "path");
      base.setAttribute("d", d);
      base.setAttribute("fill", "none");
      base.setAttribute("stroke", COLOR_BASE);
      base.setAttribute("stroke-width", "1.2");
      base.setAttribute("stroke-linecap", "round");
      base.setAttribute("stroke-linejoin", "round");
      svg.appendChild(base);

      // L├¡nea animada (fluye sobre la base)
      const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
      line.setAttribute("d", d);
      line.setAttribute("fill", "none");
      line.setAttribute("stroke", COLOR);
      line.setAttribute("stroke-width", "1.8");
      line.setAttribute("stroke-linecap", "round");
      line.setAttribute("stroke-linejoin", "round");
      line.setAttribute("filter", "url(#glow)");
      svg.appendChild(line);

      try {
        const len = line.getTotalLength();
        line.style.strokeDasharray = len;
        line.style.strokeDashoffset = len;
        line.style.animation = `flowLine ${animDuration}s ${animDelay}s ease-in-out infinite`;
      } catch(e) {}

      // Nodo circular en el extremo final
      const last = points[points.length - 1];
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", last[0]);
      dot.setAttribute("cy", last[1]);
      dot.setAttribute("r", 4);
      dot.setAttribute("fill", COLOR_BASE.replace("0.3", "0.15"));
      dot.setAttribute("stroke", COLOR);
      dot.setAttribute("stroke-width", "1.5");
      dot.setAttribute("filter", "url(#glow)");
      svg.appendChild(dot);

      // Nodo peque├▒o relleno en el inicio
      const first = points[0];
      const dotStart = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dotStart.setAttribute("cx", first[0]);
      dotStart.setAttribute("cy", first[1]);
      dotStart.setAttribute("r", 2.5);
      dotStart.setAttribute("fill", COLOR);
      dotStart.setAttribute("filter", "url(#glow)");
      dotStart.style.opacity = "0.5";
      svg.appendChild(dotStart);
    }

    // ÔöÇÔöÇ ESQUINA SUPERIOR IZQUIERDA ÔöÇÔöÇ
    drawTrace([[0, 80], [70, 80], [70, 160], [160, 160], [160, 240], [260, 240]], 0, 7);
    drawTrace([[0, 220], [50, 220], [50, 300], [130, 300], [130, 380], [220, 380]], 1.5, 8);
    drawTrace([[0, 380], [80, 380], [80, 460]], 3, 6.5);
    drawTrace([[100, 0], [100, 80], [190, 80], [190, 160], [280, 160]], 0.8, 7.5);
    drawTrace([[220, 0], [220, 60], [300, 60], [300, 140], [380, 140]], 2.2, 7);

    // ÔöÇÔöÇ ESQUINA SUPERIOR DERECHA ÔöÇÔöÇ
    drawTrace([[W, 80], [W - 70, 80], [W - 70, 160], [W - 160, 160], [W - 160, 240], [W - 260, 240]], 0.5, 7);
    drawTrace([[W, 220], [W - 50, 220], [W - 50, 300], [W - 130, 300], [W - 130, 380], [W - 220, 380]], 1.8, 8);
    drawTrace([[W - 100, 0], [W - 100, 80], [W - 190, 80], [W - 190, 160], [W - 280, 160]], 1, 7.5);
    drawTrace([[W - 220, 0], [W - 220, 60], [W - 300, 60], [W - 300, 140], [W - 380, 140]], 2.5, 7);
    drawTrace([[W, 380], [W - 80, 380], [W - 80, 460]], 3.5, 6.5);

    // ÔöÇÔöÇ ESQUINA INFERIOR IZQUIERDA ÔöÇÔöÇ
    drawTrace([[0, H - 80], [70, H - 80], [70, H - 160], [160, H - 160], [160, H - 240], [260, H - 240]], 0.6, 7);
    drawTrace([[0, H - 240], [55, H - 240], [55, H - 320], [140, H - 320], [140, H - 400]], 2, 8);
    drawTrace([[90, H], [90, H - 80], [180, H - 80], [180, H - 160], [270, H - 160]], 0.4, 7.5);
    drawTrace([[210, H], [210, H - 65], [300, H - 65], [300, H - 145]], 2.8, 6.5);

    // ÔöÇÔöÇ ESQUINA INFERIOR DERECHA ÔöÇÔöÇ
    drawTrace([[W, H - 80], [W - 70, H - 80], [W - 70, H - 160], [W - 160, H - 160], [W - 160, H - 240], [W - 260, H - 240]], 0.9, 7);
    drawTrace([[W, H - 240], [W - 55, H - 240], [W - 55, H - 320], [W - 140, H - 320], [W - 140, H - 400]], 2.3, 8);
    drawTrace([[W - 90, H], [W - 90, H - 80], [W - 180, H - 80], [W - 180, H - 160], [W - 270, H - 160]], 0.7, 7.5);
    drawTrace([[W - 210, H], [W - 210, H - 65], [W - 300, H - 65], [W - 300, H - 145]], 3, 6.5);

    window.addEventListener("resize", generateCircuit, { once: true });
  };

  setTimeout(bindEvents, 0);
  return container;
}
