const THREE = window.THREE;

/**
 * AsteroidField — procedural 3D rocky asteroids floating in the galaxy.
 *
 * No external GLB needed. Each asteroid is an IcosahedronGeometry
 * whose vertices are randomly displaced to create a cratered, lumpy rock shape.
 * They orbit at different radii and speeds (Keplerian-ish motion) with
 * random tilt, giving a believable debris field.
 *
 * Two populations:
 *  - CLOSE ring  (500–1500 units from center) — larger, slower, fewer
 *  - FAR belt    (2000–5000 units)            — smaller, faster, many
 */
export class AsteroidField {
    constructor(scene) {
        this.scene    = scene;
        this.group    = new THREE.Group();
        scene.add(this.group);

        this.asteroids = []; // { mesh, orbitRadius, orbitSpeed, orbitAngle, spinX, spinZ, selfRotX, selfRotY }
        this._build();
    }

    _build() {
        // ── Rocky material (dark basaltic rock) ─────────────────────────
        const rockMat = new THREE.MeshStandardMaterial({
            color: 0x3a3530,
            metalness: 0.05,
            roughness: 0.95
        });

        const highGlowMat = new THREE.MeshStandardMaterial({
            color: 0x554e40,
            emissive: 0x221a0a,
            emissiveIntensity: 0.3,
            metalness: 0.15,
            roughness: 0.85
        });

        // ── Helper: make one procedural asteroid ────────────────────────
        const makeAsteroid = (radius, detail) => {
            const geo = new THREE.IcosahedronGeometry(radius, detail);

            // Displace every vertex by noise → lumpy rock shape
            const pos = geo.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const x = pos.getX(i);
                const y = pos.getY(i);
                const z = pos.getZ(i);
                const len = Math.sqrt(x * x + y * y + z * z);

                // multi-frequency displacement
                const n1 = Math.sin(x * 3.1 + y * 2.7) * 0.12;
                const n2 = Math.cos(y * 5.3 + z * 4.1) * 0.07;
                const n3 = Math.sin(z * 7.7 + x * 6.2) * 0.04;
                const disp = 1.0 + n1 + n2 + n3;

                pos.setXYZ(i, x * disp, y * disp, z * disp);
            }
            geo.computeVertexNormals();
            return geo;
        };

        // ── CLOSE ring: 18 bigger asteroids ─────────────────────────────
        for (let i = 0; i < 18; i++) {
            const r   = 8  + Math.random() * 20;
            const geo = makeAsteroid(r, Math.random() > 0.5 ? 2 : 1);
            const mat = Math.random() > 0.3 ? rockMat : highGlowMat;
            const mesh = new THREE.Mesh(geo, mat);

            const orbitR = 600 + Math.random() * 900;
            const angle  = Math.random() * Math.PI * 2;
            const tiltX  = (Math.random() - 0.5) * 0.5;
            const tiltZ  = (Math.random() - 0.5) * 0.5;
            const speed  = (0.02 + Math.random() * 0.04) * (Math.random() > 0.5 ? 1 : -1);

            mesh.position.set(
                Math.cos(angle) * orbitR,
                (Math.random() - 0.5) * 300,
                Math.sin(angle) * orbitR
            );
            mesh.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );

            this.group.add(mesh);
            this.asteroids.push({
                mesh,
                orbitRadius: orbitR,
                orbitAngle: angle,
                orbitSpeed: speed,
                tiltX, tiltZ,
                selfRotX: (Math.random() - 0.5) * 0.008,
                selfRotY: (Math.random() - 0.5) * 0.012
            });
        }

        // ── FAR belt: 35 smaller asteroids ──────────────────────────────
        for (let i = 0; i < 35; i++) {
            const r   = 3 + Math.random() * 10;
            const geo = makeAsteroid(r, 1);
            const mesh = new THREE.Mesh(geo, rockMat.clone());

            const orbitR = 1800 + Math.random() * 3200;
            const angle  = Math.random() * Math.PI * 2;
            const speed  = (0.005 + Math.random() * 0.02) * (Math.random() > 0.5 ? 1 : -1);

            mesh.position.set(
                Math.cos(angle) * orbitR,
                (Math.random() - 0.5) * 800,
                Math.sin(angle) * orbitR
            );
            mesh.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );

            this.group.add(mesh);
            this.asteroids.push({
                mesh,
                orbitRadius: orbitR,
                orbitAngle: angle,
                orbitSpeed: speed,
                tiltX: (Math.random() - 0.5) * 0.3,
                tiltZ: (Math.random() - 0.5) * 0.3,
                selfRotX: (Math.random() - 0.5) * 0.015,
                selfRotY: (Math.random() - 0.5) * 0.02
            });
        }
    }

    update(dt) {
        this.asteroids.forEach(a => {
            // Advance orbital angle
            a.orbitAngle += a.orbitSpeed * dt;

            // Elliptical orbit position (slight tilt plane)
            const ca = Math.cos(a.orbitAngle);
            const sa = Math.sin(a.orbitAngle);
            a.mesh.position.x = ca * a.orbitRadius;
            a.mesh.position.z = sa * a.orbitRadius;
            a.mesh.position.y += (a.tiltX * ca + a.tiltZ * sa) * a.orbitRadius * 0.001;

            // Self-rotation (tumbling)
            a.mesh.rotation.x += a.selfRotX;
            a.mesh.rotation.y += a.selfRotY;
        });
    }
}
