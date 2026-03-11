# 🎮 Leaderboard — Animated Hex Background

Documentación de los cambios realizados al componente de leaderboard para agregar un fondo animado estilo neón inspirado en la imagen de referencia (hexágonos flotantes, circuitos y partículas cian/azul sobre fondo navy oscuro).

---

## 📁 Archivos Modificados

### `renderLeaderboard.js`
Archivo principal del componente. Se agregó la función `injectHexBackground()` y se ajustó la forma en que se monta el HTML del container.

### `leaderboard.css`
Archivo de estilos del leaderboard. Se reescribió completamente la clase `.theme-leaderboard-bg` y se agregaron todas las clases de animación del fondo.

---

## 🔧 Qué se editó y por qué

### 1. `container.className` — JS

**Antes:**
```js
container.className = 'view-content fade-in w-full h-full';
container.classList.add('dark', 'shared-theme');
```

**Después:**
```js
container.className = 'view-content fade-in w-full h-full theme-leaderboard-bg dark shared-theme';
```

**Por qué:** La clase `theme-leaderboard-bg` es el punto de entrada de todo el sistema de fondo en CSS. Sin ella en el container raíz, ninguna de las animaciones ni capas de fondo se aplicaban.

---

### 2. `innerHTML +=` → `insertAdjacentHTML()` — JS

**Antes:**
```js
container.innerHTML += `...html...`;
```

**Después:**
```js
container.insertAdjacentHTML('beforeend', `...html...`);
```

**Por qué:** `innerHTML +=` serializa y re-parsea todo el DOM del container, destruyendo en el proceso cualquier elemento que haya sido inyectado previamente con `appendChild` (en este caso, los divs del fondo). `insertAdjacentHTML('beforeend')` agrega el HTML al final sin tocar lo que ya existe.

---

### 3. `injectHexBackground()` — función nueva en JS

```js
function injectHexBackground(container) {
    // Inyecta: 8 orbs SVG, 10 líneas de circuito, 8 nodos, 12 partículas
}
```

**Por qué:** El fondo requiere elementos HTML reales en el DOM (divs con clases CSS) para que las animaciones `@keyframes` y los estilos posicionados funcionen. Esta función crea y hace `appendChild` de cada elemento antes de que se monte el contenido principal del leaderboard.

**Elementos inyectados:**
- `.hex-orb-1` a `.hex-orb-8` — hexágonos SVG con glow pulsante
- `.hex-circuit-1` a `.hex-circuit-10` — líneas de circuito horizontales y verticales
- `.hex-node-1` a `.hex-node-8` — puntos luminosos en los nodos de circuito
- `.hex-particle-1` a `.hex-particle-12` — partículas flotantes tipo polvo

---

### 4. `.theme-leaderboard-bg` — CSS reescrito

**Antes:** Solo definía `background: #02040a` y `overflow: hidden`.

**Después:** Sistema de capas completo:

```css
.theme-leaderboard-bg {
    position: relative;
    background: #02040a;
    overflow: hidden;
}

/* Capa 1: gradientes radiales de ambiente */
.theme-leaderboard-bg::before { ... }

/* Capa 2: grid de hexágonos como background-image SVG */
.theme-leaderboard-bg::after { ... animation: hexDrift ... }
```

**Por qué capas con `::before` y `::after`:** Permiten renderizar fondos complejos sin agregar elementos extra al DOM. El pseudo-elemento `::before` maneja los gradientes de luz ambiental (glows laterales azules como en la imagen de referencia) y `::after` el grid de hexágonos de fondo.

---

### 5. Grid de hexágonos con SVG en `background-image` — CSS

```css
.theme-leaderboard-bg::after {
    background-image: url("data:image/svg+xml,...polygon hexágono...");
    background-size: 120px 104px;
    animation: hexDrift 30s linear infinite;
}
```

**Por qué SVG en data URI:** Es la única forma de usar formas vectoriales (hexágonos) como patrón de fondo repetible en CSS puro, sin JS ni archivos externos. El tamaño `120x104` corresponde a las proporciones exactas de un hexágono regular. La animación `hexDrift` desplaza el `background-position` para simular movimiento continuo.

---

### 6. `.hex-orb-*` — hexágonos flotantes con `hexPulse` — CSS

```css
@keyframes hexPulse {
    0%, 100% { opacity: 0.25; filter: drop-shadow(0 0 6px currentColor); }
    50%       { opacity: 0.75; filter: drop-shadow(0 0 18px currentColor) drop-shadow(0 0 35px currentColor); }
}
```

**Por qué `filter: drop-shadow` en lugar de `box-shadow`:** `box-shadow` aplica la sombra al bounding box rectangular del elemento. `drop-shadow` sigue la forma del contenido, en este caso el trazo del SVG hexagonal, generando el glow neón exacto alrededor del hexágono.

**Por qué `currentColor`:** Los orbs tienen colores distintos (`#00d4ff`, `#0099ff`, `#00e5ff`, etc.) definidos con `color:` en cada clase. Usar `currentColor` en el `drop-shadow` hace que el glow herede ese color automáticamente sin repetir valores.

---

### 7. `.hex-circuit-*` — líneas de circuito — CSS

```css
.hex-circuit-h {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,212,255,0.8), transparent);
    animation: circuitPulse 3s ease-in-out infinite;
}
```

**Por qué gradiente en lugar de `border`:** Un `border` de 1px tiene opacidad uniforme. El gradiente de transparente a cian a transparente replica el efecto de "traza de señal" que se ve en los circuitos de la imagen, donde la línea se desvanece en los extremos.

---

### 8. `.hex-particle-*` con CSS custom properties — CSS

```css
.hex-particle-1 { --dx: 15px; --dy: -40px; animation-duration: 8s; }

@keyframes particleDrift {
    100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
}
```

**Por qué custom properties (`--dx`, `--dy`):** Permiten que cada partícula tenga una dirección de movimiento única reutilizando el mismo `@keyframes`. Sin esto, habría que definir 12 keyframes distintos, uno por partícula.

---

## 🎨 Por qué CSS puro en lugar de Canvas

| Criterio | Canvas (descartado) | CSS puro (elegido) |
|---|---|---|
| **Compatibilidad con el DOM** | Requiere `requestAnimationFrame` y gestión manual de ciclo de vida | Las animaciones las maneja el browser nativamente |
| **Problema con `innerHTML`** | El canvas se destruía al reasignar `innerHTML` | Los divs CSS sobreviven a `insertAdjacentHTML` |
| **Performance** | Corre en el main thread de JS | Animaciones CSS corren en el compositor del browser (GPU) |
| **Mantenimiento** | JS de ~150 líneas para dibujo manual | Estilos declarativos, fácil de editar colores/posiciones |
| **Cleanup** | Requería `cancelAnimationFrame` y observer de mutaciones | No requiere cleanup, el browser lo gestiona |

---

## 🖼️ Referencia visual

El fondo fue diseñado para replicar la imagen de referencia con:
- Fondo navy muy oscuro (`#02040a` → `#010308`)
- Hexágonos de distintos tamaños agrupados en los bordes izquierdo y derecho
- Glows radiales azules sutiles en los laterales
- Grid de hexágonos tenue moviéndose lentamente en el fondo
- Líneas de circuito PCB saliendo desde los bordes
- Partículas flotantes tipo polvo estelar