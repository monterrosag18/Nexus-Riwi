// Obtener el canvas del HTML
const canvas = document.getElementById("stars");

// Obtener el contexto 2D (herramienta para dibujar)
const ctx = canvas.getContext("2d");

// Ajustar el tamaño del canvas al tamaño de la ventana
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Array donde se guardarán las estrellas
const stars = [];

// Cantidad de estrellas
const STAR_COUNT = 4000;

// Crear las estrellas
for (let i = 0; i < STAR_COUNT; i++) {
  stars.push({
    // Posición horizontal aleatoria
    x: Math.random() * canvas.width,

    // Posición vertical aleatoria
    y: Math.random() * canvas.height,

    // Tamaño de la estrella (radio)
    radius: Math.random() * 1.5,

    // Nivel de transparencia (0 = invisible, 1 = totalmente visible)
    alpha: Math.random(),

    // Velocidad con la que cambia la transparencia (titilar)
    speed: Math.random() * 0.200
  });
}

// Función que dibuja y anima las estrellas
function drawStars() {
  // Limpia todo el canvas antes de volver a dibujar
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Recorrer cada estrella del arreglo
  stars.forEach(star => {

    // Iniciar un nuevo dibujo
    ctx.beginPath();

    // Dibujar un círculo (estrella)
    // arc(x, y, radio, inicio, fin)
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);

    // Definir color blanco con transparencia
    ctx.fillStyle = `rgba(255, 255, 175, ${star.alpha})`;

    // Rellenar la estrella
    ctx.fill();

    // Cambiar la transparencia poco a poco (efecto titilar)
    star.alpha += star.speed;

    // Si llega a 0 o a 1, invertir la velocidad
    if (star.alpha <= 0 || star.alpha >= 1) {
      star.speed *= -1;
    }
  });

  // Volver a llamar a la función para crear animación infinita
  requestAnimationFrame(drawStars);
}

// Iniciar la animación
drawStars();

// Ajustar el canvas si se cambia el tamaño de la ventana
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});