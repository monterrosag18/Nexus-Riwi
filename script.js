    // Inicialización de efectos glitch para tarjetas y título

    document.addEventListener('DOMContentLoaded', function() {
    // Asignar delays aleatorios a cada tarjeta
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        const randomDelay = (Math.random() * 3).toFixed(2); // Rango 0-3 segundos
        card.style.setProperty('--glitch-delay', `${randomDelay}s`);
        card.style.setProperty('--glitch-duration', '3s');
        console.log(`Card ${index + 1} - Delay: ${randomDelay}s`);
    });

    console.log('✓ Efectos glitch inicializados');

    // Efecto glitch del título cada 3 segundos
    const glitchTitle = document.querySelector('.glitch-title');
    if (glitchTitle) {
        setInterval(() => {
            glitchTitle.classList.remove('active-glitch');
            setTimeout(() => {
                glitchTitle.classList.add('active-glitch');
            }, 10);
        }, 3000);
    }

    // Efecto glitch del borde con delay aleatorio para cada card
    cards.forEach((card, index) => {
        // Delay aleatorio entre 2 y 5 segundos para cada card
        const randomDelay = Math.random() * 3000 + 2000;
        // Intervalo aleatorio entre 3 y 6 segundos
        const randomInterval = Math.random() * 3000 + 3000;
        
        // Iniciar después del delay inicial
        setTimeout(() => {
            card.classList.add('active-glitch-border');
            setTimeout(() => {
                card.classList.remove('active-glitch-border');
            }, 600);
            
            // Repetir con intervalo aleatorio
            setInterval(() => {
                card.classList.add('active-glitch-border');
                setTimeout(() => {
                    card.classList.remove('active-glitch-border');
                }, 600);
            }, randomInterval);
        }, randomDelay);
    });

    // Efecto de dimming cuando se hoverea una card
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            cards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.classList.add('dimmed');
                } else {
                    card.classList.add('active-hover');
                }
            });
        });

        card.addEventListener('mouseleave', () => {
            cards.forEach(otherCard => {
                otherCard.classList.remove('dimmed');
                otherCard.classList.remove('active-hover');
            });
        });
    });
    });