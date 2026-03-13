# RIWI NEXUS -- Field Manual (Tech README)

## Proposito
Construir una experiencia web sci-fi de alto impacto visual (cards + glitch + background espacial) con el menor costo de complejidad posible, priorizando:
- Entrega rapida (sin build step)
- Control artistico directo
- Performance estable en navegadores modernos
- Facilidad de mantenimiento y extension

## Decisiones tecnicas (y por que)

### 1) HTML + CSS + JS vanilla (sin framework)
**Decision:** Se uso HTML/CSS/JS nativo en vez de React/Vue/Svelte.
**Por que:**
- No hay estado complejo ni routing avanzado que justifique un framework.
- Menos dependencias y menor bundle => mejor performance y carga inicial.
- Iteracion visual mas rapida (ideal para un pitch/demo).
**Tradeoff:** Si la app crece a un sistema con datos/estado complejo, podria migrarse a un framework.

### 2) Tailwind via CDN
**Decision:** Tailwind por CDN en vez de build con PostCSS.
**Por que:**
- Prototipado rapido y consistente sin configurar tooling.
- Reduce CSS manual y acelera iteraciones de UI.
**Tradeoff:** No hay purge automático; para produccion real, conviene build con purge para reducir CSS.

### 3) Canvas 2D para starfield
**Decision:** Canvas 2D para las estrellas en vez de SVG o imágenes estáticas.
**Por que:**
- Rendimiento mejor para cientos de particulas animadas.
- Permite twinkle y movimiento suave con requestAnimationFrame.
- Control total de densidad y comportamiento.
**Tradeoff:** No es accesible por DOM; se complementa con overlays CSS para atmósfera.

### 4) Overlays de fondo en CSS (glow, nebulosa, vignette)
**Decision:** Capas CSS para la atmósfera, no imágenes de fondo pesadas.
**Por que:**
- Menor peso de red, sin assets extra.
- Ajuste rápido de color/posición por variables CSS.
- Compatible con distintos tamaños de pantalla.
**Tradeoff:** Requiere afinación manual para lograr un look consistente.

### 5) Variables CSS para tema
**Decision:** Definir colores en :root (tema compartido).
**Por que:**
- Consistencia en cards, botones, glow y glitch.
- Cambios globales de paleta sin tocar muchos selectores.
- Base para futuros temas (dark/light) si se requiere.

### 6) Animaciones CSS para hover y glitch
**Decision:** Usar CSS para hover/efectos en cards, JS solo para timings.
**Por que:**
- CSS es más eficiente para transiciones y evita reflows grandes.
- JS se limita a delays aleatorios (mejor control sin saturar el main thread).
**Tradeoff:** Efectos muy complejos pueden requerir JS o WebGL.

### 7) Lazy loading en imagenes
**Decision:** `loading="lazy"` en imágenes de cards.
**Por que:**
- Reduce carga inicial.
- Mejora performance en dispositivos lentos.

### 8) Preferencias de movimiento
**Decision:** Respetar `prefers-reduced-motion` en el starfield.
**Por que:**
- Mejor accesibilidad sin sacrificar el diseño.

## Rol de cada archivo

### index.html
- Estructura principal: hero, grid de cards y CTAs (shop/map).
- Contenedor del background: `space-bg` + canvas + overlays.
- Navegación sencilla sin routing complejo.

### style.css
- Sistema de variables de tema.
- Estilos de cards (hover con zoom, sombras, fondo negro para legibilidad).
- Overlays del fondo (glow, nebulosa sutil, vignette).
- Botones CTA (shop/map) con estilo consistente.

### script.js
- Starfield en Canvas 2D.
- Densidad de estrellas ajustada por viewport.
- Twinkle con fase individual para parpadeo natural.
- requestAnimationFrame y devicePixelRatio para rendimiento y nitidez.

## Performance (resumen)
- Un solo canvas (O(N) por frame), con limites de densidad.
- Animaciones CSS para hover, sin JS pesado.
- Sin dependencias de runtime externas.

## Extensibilidad
- Nuevas cards: duplicar bloque HTML.
- Nuevas paginas: agregar carpeta + index.html simple.
- Cambios de estética: ajustar variables y overlays en CSS.

## Estructura del proyecto
```
Nexus-Riwi/
  index.html
  style.css
  script.js
  img/
  shop/index.html
  map/index.html
  README.md
```

## Preguntas tipicas (y respuestas cortas)
- Por que no framework? Porque no hay estado complejo; se priorizo velocidad de entrega y performance.
- Por que Canvas y no SVG? Canvas escala mejor con muchas particulas animadas.
- Como escalar? Separar componentes y migrar a build con Tailwind purge si se crece.
- Que pasa con accesibilidad? Se respeta prefers-reduced-motion y se mantiene contraste alto.

## Ejecucion local
Usar servidor local (Live Server) para rutas consistentes y carga de assets.