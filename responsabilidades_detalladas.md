# REPORTE TÉCNICO DE ÉLITE: RESPONSABILIDADES <NEXUS>

Este documento proporciona el desglose más profundo de la arquitectura técnica y los logros individuales para la presentación ante el jurado.

---

## 🗺️ CARLOS: ARQUITECTURA TÁCTICA Y COMUNICACIÓN (MAPA, CHAT, PERFIL)
Responsable del núcleo interactivo y la persistencia de identidad.

### 1. El Mapa Hexagonal 3D (Motor de Conquista)
*   **Archivos**: `public/js/components/HexGrid.js` | `pages/api/territories/index.js`
*   **Profundidad Técnica**: Carlos implementó un motor de renderizado 3D basado en **Three.js** que utiliza un sistema de **coordenadas axiales (q, r)**. Esto permite cálculos matemáticos rápidos para determinar la adyacencia.
*   **Logro Crítico**: Logró que cada uno de los 150+ hexágonos sea una entidad independiente con metadatos de bioma y dificultad, sincronizados mediante **Supabase Realtime**. Si un usuario conquista una zona, el color cambia en las pantallas de todos los demás operativos en milisegundos.

### 2. Hub de Comunicación y Perfil Operativo
*   **Archivos**: `Chat.js`, `FactionChat.js`, `ProfilePanel.js`
*   **Profundidad Técnica**: Desarrolló una arquitectura de mensajería con **filtrado de eventos por clan**. Implementó un sistema de "Optimistic Updates" en el perfil, permitiendo que la interfaz se sienta fluida mientras las estadísticas (CR, Puntos) se validan en el servidor de forma asíncrona.

---

## 🔐 DANA: PROTOCOLO DE ACCESO Y SEGURIDAD (AUTH Y ROUTING)
Responsable de la integridad de la plataforma y el control de flujos.

### 1. Sistema de Autenticación de Grado Militar
*   **Archivos**: `Login.js` | `pages/api/auth/` | `public/js/store.js`
*   **Profundidad Técnica**: Implementó un flujo de seguridad basado en **JWT (JSON Web Tokens)**. Dana diseñó el sistema para que las credenciales nunca se expongan, manejando la persistencia a través de un **Store centralizado** que se limpia automáticamente al cerrar sesión.
*   **Logro Crítico**: Resolvió el complejo problema de las redirecciones infinitas mediante un **Router Guard modular**. Este componente intercepta cada intento de navegación y verifica si el usuario tiene el "Token de Acceso" activo, expulsando a intrusos instantáneamente.

---

## 🛒 JUAN JOSÉ: ECONOMÍA DE GUERRA Y BOUTIQUE (SHOP Y GACHA)
Responsable del ecosistema financiero y la gratificación del usuario.

### 1. El Motor Gacha (Aleatoriedad Controlada)
*   **Archivos**: `public/js/components/GachaModal.js` | `pages/api/shop/purchase.js`
*   **Profundidad Técnica**: Juan José desarrolló la lógica de "Probabilidades Dinámicas". Creó un sistema de validación doble (Client-Side para la animación y Server-Side para la transacción) que asegura que nadie pueda obtener cosméticos sin tener los créditos necesarios en Supabase.
*   **Logro Crítico**: Implementó efectos visuales de alta gama (Glassmorphism y Neon Glow) en las tarjetas de recompensa, utilizando **CSS Custom Properties** para que los colores se sincronicen con la facción ganadora del usuario.

---

## 📕 CAMILO: INTELIGENCIA OPERATIVA (FIELD MANUAL)
Responsable de la narrativa técnica y la estética premium.

### 1. Guía de Campo SPA (Single Page Application)
*   **Archivos**: `FieldManual.js` | `public/css/manual.css`
*   **Profundidad Técnica**: Reconstruyó la sección de reglas como un módulo SPA independiente. Utilizó un **Sistema de Partículas en Three.js** para crear un fondo estelar que no consume recursos excesivos de CPU, optimizando el rendimiento mediante `requestAnimationFrame`.
*   **Logro Crítico**: Diseñó los "Glitch Artifacts" (efectos de distorsión visual) que definen la marca NEXUS, asegurando que el contenido sea legible mediante el uso de tipografía **Rajdhani** y una jerarquía de información lógica para los nuevos operativos.

---

## 📊 JULIÁN: MÉTRICAS DE ÉXITO Y CICLOS (RANKING Y COUNTDOWN)
Responsable del motor competitivo y la analítica de datos.

### 1. Algoritmos de Clasificación en Tiempo Real
*   **Archivos**: `Leaderboard.js` | `WeeklyCountdown.js` | `pages/api/clans/index.js`
*   **Profundidad Técnica**: Julián implementó consultas SQL complejas mediante **agregaciones de Supabase** para calcular los puntos totales de los clanes sumando las conquistas de sus miembros de forma masiva.
*   **Logro Crítico**: Desarrolló el **Reloj de Conteo Regresivo Táctico**. Este componente maneja objetos de tiempo nativos de JavaScript para coordinar el fin de ciclo los viernes a las 11:59:59 PM, gestionando automáticamente el cambio de estado de la aplicación a "Modo Coronación" sin intervención manual.
