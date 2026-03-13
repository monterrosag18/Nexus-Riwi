document.addEventListener('DOMContentLoaded', () => {
    initCosmicBackground();

    const cards = Array.from(document.querySelectorAll('.card'));
    if (cards.length === 0) return;

    // Random glitch delays for each card
    cards.forEach((card) => {
        const randomDelay = (Math.random() * 3).toFixed(2);
        card.style.setProperty('--glitch-delay', `${randomDelay}s`);
        card.style.setProperty('--glitch-duration', '3s');
    });

    // Title glitch every 3 seconds
    const glitchTitle = document.querySelector('.glitch-title');
    if (glitchTitle) {
        setInterval(() => {
            glitchTitle.classList.remove('active-glitch');
            setTimeout(() => {
                glitchTitle.classList.add('active-glitch');
            }, 10);
        }, 3000);
    }

    // Glitch border per card with random timings
    cards.forEach((card) => {
        const randomDelay = Math.random() * 3000 + 2000;
        const randomInterval = Math.random() * 3000 + 3000;

        setTimeout(() => {
            card.classList.add('active-glitch-border');
            setTimeout(() => {
                card.classList.remove('active-glitch-border');
            }, 600);

            setInterval(() => {
                card.classList.add('active-glitch-border');
                setTimeout(() => {
                    card.classList.remove('active-glitch-border');
                }, 600);
            }, randomInterval);
        }, randomDelay);
    });

    // Dimming effect on hover
    cards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
            cards.forEach((otherCard) => {
                if (otherCard !== card) {
                    otherCard.classList.add('dimmed');
                } else {
                    card.classList.add('active-hover');
                }
            });
        });

        card.addEventListener('mouseleave', () => {
            cards.forEach((otherCard) => {
                otherCard.classList.remove('dimmed');
                otherCard.classList.remove('active-hover');
            });
        });
    });
});

function initCosmicBackground() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    let particles = [];
    let lastTime = 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const createParticles = () => {
        const count = Math.max(240, Math.min(720, Math.floor((width * height) / 3200)));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.0 + 0.4,
            alpha: Math.random() * 0.7 + 0.2,
            twinkle: Math.random() * 1.8 + 0.6,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.03 + 0.006,
            drift: (Math.random() - 0.5) * 0.015
        }));
    };

    const resize = () => {
        width = canvas.clientWidth || window.innerWidth;
        height = canvas.clientHeight || window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        createParticles();
    };

    const renderStars = (now) => {
        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'lighter';

        particles.forEach((particle) => {
            const pulse = (Math.sin(now * 0.0018 * particle.twinkle + particle.phase) + 1) / 2;
            const twinkle = 0.15 + Math.pow(pulse, 1.7) * 0.85;
            ctx.beginPath();
            ctx.fillStyle = `rgba(220, 240, 255, ${particle.alpha * twinkle})`;
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalCompositeOperation = 'source-over';
    };

    const draw = (time) => {
        if (prefersReducedMotion) {
            renderStars(time || 0);
            return;
        }

        const now = time || 0;
        const delta = (now - lastTime) / 1000;
        lastTime = now;

        particles.forEach((particle) => {
            particle.y += particle.speed * (delta * 60);
            particle.x += particle.drift * (delta * 60);

            if (particle.y > height + 4) particle.y = -4;
            if (particle.x < -4) particle.x = width + 4;
            if (particle.x > width + 4) particle.x = -4;
        });

        renderStars(now);
        requestAnimationFrame(draw);
    };

    resize();
    requestAnimationFrame(draw);

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
    });
}
