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
const STAR_COUNT = 500;

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

const inner = document.getElementById("inner");
const winner = document.querySelectorAll(".card");


let cartaGanadora = 0;
let angulo = 0;
let rapido = 0;
//let lento = 1.0;
let pausado = false;
let seguir = true;
let anguloFinal = 0;
let calculado = false;
let llegue  = false;

function girar (){
  if (pausado == false){   
  angulo+=rapido;
  rapido -= 0.01;
  //lento - angulo;
if (angulo >= 360 ){
    angulo = 0;
  }  
requestAnimationFrame(girar);
  if (anguloFinal >= 360)
     anguloFinal -= 360;

  if (rapido <=0){
    rapido = 0;

  if (calculado == false) {
    anguloFinal = Math.round(angulo / 36) * 36 + 5;
    calculado = true;
    cartaGanadora = Math.round(anguloFinal / 36)
    alert(cartaGanadora)
    if (cartaGanadora >= 10) cartaGanadora = 0;
      

    
    winner[cartaGanadora].addEventListener("click",function click(){
     winner[cartaGanadora].querySelector(".reverse").style.opacity = 1;
    })
      // alert(winner[cartaGanadora])
    }

if (Math.abs (angulo - anguloFinal) < 0.5){
    angulo = anguloFinal;
    llegue = true;
}

if (llegue == false)
   if (angulo < anguloFinal) {
    angulo += 0.5;
  } else {
    angulo -= 0.5;
  }

  

  }
  
  


  inner.style.transform = `perspective(1000px)  rotateX(-1deg) rotateY(${angulo}deg)`


  
  }
}
 winner.forEach(function(card){
  card.querySelector(".reverse").style.opacity = 0;
  card.addEventListener("click", function(){
    if (card === winner[cartaGanadora]) {
      // alert(cartaGanadora);
      card.querySelector(".reverse").style.backfaceVisibility = "visible";
    }
  })
 })


const touch = document.getElementById("touch")
touch.addEventListener("click",function(event){
  alert("carta clickeada")
  event.stopPropagation();
    rapido = 5.0;
    llegue = false;
    calculado = false;
    angulo = 0;
    winner.forEach(function(card){
      card.querySelector(".reverse").style.backfaceVisibility = "hidden";
    })
    girar()
  })

