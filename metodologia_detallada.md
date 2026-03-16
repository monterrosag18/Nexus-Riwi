# ESTRATEGIA DE DESARROLLO: NEXUS - AGILIDAD RADICAL

En lugar de utilizar marcos de trabajo tradicionales como Scrum, que requieren ceremonias extensas (Sprints de 2 semanas, Daily stand-ups largos, Retrospectivas), el equipo de <NEXUS> optó por una metodología de **Prototipado Rápido y Entrega Continua (RPCD)**. 

Esta decisión fue estratégica para maximizar la productividad en un entorno de tiempo limitado.

### ¿Por qué NO usamos Scrum?
1. **Rigidez de Ciclos**: Scrum depende de Sprints cerrados. En Nexus, necesitábamos cambios en tiempo real; si una función 3D fallaba, no podíamos esperar al siguiente Sprint para pivotar.
2. **Ceremonias Costosas**: Las reuniones diarias y de planificación consumen un tiempo valioso que dedicamos a la implementación técnica pura (coding time).
3. **Escalabilidad Inmediata**: Nexus creció de un MVP a una plataforma compleja con Supabase en días. Una metodología basada en Sprints hubiera ralentizado esta migración crítica.

### Nuestra Alternativa: Prototipado Rápido y Entrega Continua (RPCD)

Nuestra metodología se basó en tres pilares:

1. **Desarrollo Atómico y Paralelo**:
   Dividimos el proyecto en "Módulos de Élite" (Mapa, Auth, Shop, etc.). Cada integrante operó como un "Full-stack Lead" de su área, integrando cambios directamente en la rama principal mediante micro-commits, evitando cuellos de botella.

2. **Validación de Ciclo Corto (Hot-Fixing)**:
   En lugar de esperar al fin de semana para una "Review", realizábamos pruebas de integración continuas. Si el chat rompía el mapa, se corregía en el momento (Push & Verify), manteniendo el sistema "Online" el 99% del tiempo.

3. **Arquitectura Orientada a Eventos (Real-time Focus)**:
   Al usar Supabase y Three.js, priorizamos que la base de datos dictara el estado de la aplicación. Esto nos permitió desarrollar funciones de forma independiente que se sincronizaron automáticamente al conectarse a la nube.

### Resultados de esta Estrategia:
*   **Velocidad**: Logramos una migración completa de LocalStorage a PostgreSQL/Supabase en menos de 48 horas.
*   **Calidad Visual**: Al no estar atados a tareas rígidas, Carlos y Camilo pudieron dedicar tiempo extra al pulido de shaders y efectos glitch que no estaban en el alcance inicial.
*   **Resiliencia**: El sistema es capaz de soportar resets de temporada y cambios de lógica de puntos sin downtime.

**Conclusión para la presentación:** "No seguimos Scrum porque Nexus necesitaba la velocidad de una startup tecnológica real. Elegimos la **Agilidad Radical** para que el código dictara el ritmo, no las reuniones."
