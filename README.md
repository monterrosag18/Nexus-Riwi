# NEXUS RIWI 
> **The Definitive Quantum Conquest Ecosystem for the Elite Coders of Riwi.**
> **El Ecosistema Definitivo de Conquista Cuántica para los Coders de Élite de Riwi.**

---

##  The Creators / El Equipo de Élite
**Project developed with engineering excellence by / Proyecto desarrollado con excelencia en ingeniería por:**

*   **Carlos Andres Monterrosa Gallego** —
*   **Camilo Florez** — 
*   **Julian Aponte** — 
*   **Juan Jose** — 
*   **Dhana** — 

---

## 🇬🇧 English Documentation

###  Full Project Overview
Nexus Riwi is a massive scale, gamified educational platform that merges an interactive 3D universe with real-time collaborative development. It is designed to foster a high-performance culture among **Coders**, transforming traditional learning into a strategic battle for galactic supremacy.

###  Faction Lore & Thematic Universe
The Nexus is divided into five legendary factions, each representing a foundational pillar of software engineering:
1.  **TURING (Cyan)**: *The Algorithmic Vanguard.* Focuses on pure logic and computation.
2.  **TESLA (Red)**: *The Industrial Surge.* Represents speed, energy, and rapid innovation.
3.  **McCARTHY (Green)**: *The Recursive Intelligence.* Masters of AI and abstract structures.
4.  **HAMILTON (Yellow)**: *The Precision Navigators.* Dedicated to reliability and complex maneuvers.
5.  **THOMPSON (Purple)**: *The System Sovereigns.* Architects of the foundational layers.

---

###  Advanced Technical Modules

####  1. The Aether 3D Engine (Visual Core)
*   **Volumetric Rendering**: Uses Three.js with **UnrealBloomPass** to create a high-contrast cyberpunk atmosphere with neon glows.
*   **Hexagonal Grid Topology**: A procedurally generated tactical grid with 1,000+ interactable sectors, featuring custom `LineLoop` and `CylinderGeometry` components.
*   **Interaction Layer**: Implements a high-precision `Raycaster` to handle mouse collisions on the 3D grid, enabling real-time sector "Breach" sequences.
*   **Dynamic Background**: `GalaxyBackground.js` manages a 10,000-unit starfield and a central Sun entity that provides global volumetric lighting.

####  2. Nexus Core (Real-time State)
*   **Neural Link (Store)**: A custom-built state management system (`store.js`) using a Pub/Sub pattern to notify UI components of global state changes.
*   **Supabase Realtime Channels**: Bi-directional WebSocket communication for:
    *   **Live Conquests**: Instant color shifts on the map when a sector is captured.
    *   **Neural Chat**: A multi-channel messaging system for faction coordination.
    *   **Champion Updates**: Real-time visual transformation of the central citadel.

####  3. Gamification Mechanics & Economy
*   **Neural Credits (CR)**: The platform's internal currency. Coders earn CR by conquering sectors and lose CR on failed breaches.
*   **The Quantum Gacha**: A randomized reward system using advanced animations and physics to grant rare digital assets.
*   **Boutique Boutique**: A high-end 3D Carousel (`ShopCarousel.js`) for purchasing elite skins, glowing borders, and chat customizers.
*   **Mini-Leaderboards**: Aggregated clan statistics updated every 10 seconds to maintain competitive tension.

####  4. Bastion Protocol (Hardened Security)
*   **DevTools Interception**: Scripts to block Right-Click, F12, and common injection shortcuts.
*   **Shadowing Safeguards**: Uses JavaScript `Object.defineProperty` to shadow the global Supabase object, preventing manual console tampering.
*   **Server-Side Sovereignty**: All conquest logic and economic transactions are validated via JWT-protected Next.js API routes.

---

###  Technical Directory Map (Where is everything?)

####  `public/js/` (The Frontend Brain)
- `/components/HexGrid.js`: The most complex visual file; manages the 3D map engine and grid logic.
- `/components/FuturisticTower.js`: Manages the central Champion Citadel and its dynamic visual states.
- `/components/Login.js`: Handles auth entry, video intro, and the procedurally animated circuit background.
- `/store.js`: The heart of the app; handles all API calls, state management, and Realtime listeners.
- `/router.js`: Manages cinematic transitions using GSAP and enforces route-based access control.

####  `pages/api/` (The Backend Fortress)
- `/territories/`: Logic for conquers, adjacency checks, and server-side validation.
- `/tournament/`: Handles weekly champion logic and live coronation triggers.
- `/auth/`: Secure registration and login using bcrypt and JWT.
- `/shop/`: Secure transaction handling and cosmetic persistence.

---

## 🇪🇸 Documentación en Español

###  Descripción General del Proyecto
Nexus Riwi es una plataforma educativa gamificada de gran escala que fusiona un universo 3D interactivo con un entorno de desarrollo colaborativo en tiempo real. Está diseñado para fomentar una cultura de alto desempeño entre los **Coders**, transformando el aprendizaje tradicional en una batalla estratégica por la supremacía galáctica.

###  Lore de las Facciones
Nexus se divide en cinco facciones legendarias:
1.  **TURING (Cian)**: Vanguardia Algorítmica. Lógica pura.
2.  **TESLA (Rojo)**: Oleada Industrial. Velocidad e innovación.
3.  **McCARTHY (Verde)**: Inteligencia Recursiva. Maestros de la IA.
4.  **HAMILTON (Amarillo)**: Navegantes de Precisión. Confiabilidad absoluta.
5.  **THOMPSON (Púrpura)**: Soberanos del Sistema. Arquitectos de la base.

---

###  Módulos Técnicos Avanzados

####  1. Motor 3D Aether (Núcleo Visual)
*   **Renderizado Volumétrico**: Usa **UnrealBloomPass** para crear una atmósfera cyberpunk con brillos de neón de alto contraste.
*   **Topología de Rejilla**: Una malla táctica hexagonal generada por código con más de 1,000 sectores interactivos.
*   **Capa de Interacción**: Implementa un `Raycaster` de alta precisión para gestionar colisiones del ratón en el grid 3D.

####  2. Nexus Core (Estado en Tiempo Real)
*   **Enlace Neural (Store)**: Sistema de gestión de estado personalizado que reacciona a cambios globales mediante un patrón Pub/Sub.
*   **Canales de Supabase Realtime**: Comunicación vía WebSockets para conquistas en vivo, chat de facción y actualizaciones del campeón.

####  3. Protocolo de Seguridad Bastión
*   **Bloqueo de DevTools**: Scripts avanzados para interceptar F12 y clic derecho.
*   **Ofuscación Sugura**: Uso de `Object.defineProperty` para bloquear el acceso directo a `supabase` desde la consola.
*   **Lógica de Lado del Servidor**: Todas las acciones críticas son validadas en el backend de Next.js.

---

##  Setup & Deployment / Configuración

1.  **Install Dependencies / Instalar Dependencias**: `npm install`
2.  **Environment Setup / Variables de Entorno**: Configura el `.env.local` con tus claves de Supabase.
3.  **Run Development / Iniciar Sistema**: `npm run dev`

---
*Developed with the spirit of excellence by the Nexus Riwi Team to inspire the future of technology.*
