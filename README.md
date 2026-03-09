# NEXUS PROTOCOLS -- Field Manual

Interfaz web temática estilo **cyberpunk / sci-fi** que presenta
información sobre los clanes, poderes y eventos dentro del universo **Riwi-Nexus**.

El proyecto utiliza **HTML, CSS, JavaScript y TailwindCSS** para crear
una experiencia visual interactiva con efectos **glitch**, animaciones y
tarjetas dinámicas.

------------------------------------------------------------------------

# Vista del Proyecto

La aplicación muestra un **manual visual** donde cada
tarjeta representa información sobre el universo del juego,
como:

-   Clanes
-   Conquista
-   Poderes
-   Ausencia
-   Mapas

Cada sección está acompañada de **imágenes y efectos visuales glitch**
para dar una estética futurista.

------------------------------------------------------------------------

# Tecnologías utilizadas

-   HTML5
-   CSS3
-   JavaScript (Vanilla)
-   TailwindCSS
-   Google Fonts
-   Material Symbols

------------------------------------------------------------------------

# Estructura del proyecto

    project/
    │
    ├── index.html        # Estructura principal de la página
    ├── style.css         # Estilos personalizados y animaciones glitch
    ├── script.js         # Lógica de efectos visuales
    │
    ├── img/              # Imágenes utilizadas en las tarjetas
    │   ├── ausencia.jpg
    │   ├── clanes.jpg
    │   ├── conquista.jpg
    │   ├── mapa_clanes.jpg
    │   └── poderes.jpg
    │
    └── README.md

------------------------------------------------------------------------

# Funcionalidades

## Tarjetas interactivas

Cada tarjeta contiene:

-   Imagen
-   Información
-   Animaciones visuales
-   Efectos glitch

Las tarjetas usan **CSS animations y JavaScript** para generar efectos
visuales aleatorios.

------------------------------------------------------------------------

## Efecto Glitch Dinámico

El archivo `script.js` genera efectos glitch automáticamente.

Características:

-   Delay aleatorio en cada tarjeta
-   Activación periódica del glitch
-   Animaciones del borde
-   Animación del título

Ejemplo:

``` javascript
const randomDelay = (Math.random() * 3).toFixed(2);
card.style.setProperty('--glitch-delay', `${randomDelay}s`);
```

------------------------------------------------------------------------

## Animaciones CSS

El archivo `style.css` define animaciones como:

-   glitch-border-pulse
-   vibración
-   flicker
-   efectos de recorte tipo glitch

Ejemplo:

``` css
.glitch-card.active-glitch-border {
 animation: glitch-border-pulse 0.6s steps(3, end);
}
```

------------------------------------------------------------------------

# Personalización

## Colores

En configuración de Tailwind:

``` javascript
colors: {
 primary: "#ec5b13",
 "neon-cyan": "#00f3ff",
 "neon-magenta": "#ff00ff",
}
```

------------------------------------------------------------------------

## Animaciones

En `style.css` puedes cambiar:

-   velocidad del glitch
-   intensidad del borde
-   colores de los efectos

------------------------------------------------------------------------

## Contenido

Las tarjetas pueden editarse directamente en:

    index.html

Cambiando:

-   texto
-   imágenes
-   títulos

------------------------------------------------------------------------
