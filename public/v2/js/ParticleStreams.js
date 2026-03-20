const THREE = window.THREE;

/**
 * ParticleStreams — replaces EnergyArcs
 *
 * Particles flow along Cubic Bezier curves from the Nexus center outward
 * to nodes on the hex grid inner ring. Each stream has ~80 particles that
 * travel at staggered phases so the stream looks continuous.
 *
 * Technique: one large Points object per stream, BufferAttribute positions
 * updated every frame as t moves from 0 → 1 along the Bezier.
 */
export class ParticleStreams {
    constructor(scene) {
        this.scene   = scene;
        this.group   = new THREE.Group();
        scene.add(this.group);
        this.streams = [];
        this._build();
    }

    _build() {
        const PARTICLES_PER_STREAM = 80;

        // Stream endpoints + colours
        const streamDefs = [
            { color: 0x00f3ff, endX: 160,  endZ:   0   },
            { color: 0x00c3ff, endX: 113,   endZ: 113   },
            { color: 0x7b2fff, endX:   0,   endZ: 160   },
            { color: 0xff33aa, endX: -113,  endZ: 113   },
            { color: 0x00ffaa, endX: -160,  endZ:   0   },
            { color: 0xffffff, endX: -113,  endZ: -113  },
            { color: 0x33ccff, endX:   0,   endZ: -160  },
            { color: 0xaa44ff, endX:  113,  endZ: -113  },
            // outer secondary
            { color: 0x4488ff, endX: 280,   endZ:   0   },
            { color: 0x4488ff, endX:   0,   endZ: 280   },
            { color: 0x4488ff, endX: -280,  endZ:   0   },
            { color: 0x4488ff, endX:   0,   endZ: -280  },
            { color: 0x4488ff, endX:  200,  endZ:  200  },
        ];

        streamDefs.forEach(def => {
            const start = new THREE.Vector3(0, 80, 0);  // Nexus hover height
            const end   = new THREE.Vector3(def.endX, -3, def.endZ);

            // Bezier control points — arc upward then down
            const mid1 = start.clone().lerp(end, 0.33).add(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 60,
                    60 + Math.random() * 40,
                    (Math.random() - 0.5) * 60
                )
            );
            const mid2 = start.clone().lerp(end, 0.66).add(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 40,
                    20 + Math.random() * 30,
                    (Math.random() - 0.5) * 40
                )
            );

            const curve = new THREE.CubicBezierCurve3(start, mid1, mid2, end);

            // Positions buffer — one vec3 per particle
            const positions = new Float32Array(PARTICLES_PER_STREAM * 3);
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            // Staggered phase offsets so particles spread along the whole path
            const phases = new Float32Array(PARTICLES_PER_STREAM);
            for (let i = 0; i < PARTICLES_PER_STREAM; i++) {
                phases[i] = i / PARTICLES_PER_STREAM; // 0 → 1
            }

            const mat = new THREE.PointsMaterial({
                color: def.color,
                size: 2.5,
                sizeAttenuation: true,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const points = new THREE.Points(geo, mat);
            this.group.add(points);

            this.streams.push({ curve, geo, phases, points, speed: 0.25 + Math.random() * 0.15 });
        });
    }

    update(dt) {
        const tmp = new THREE.Vector3();

        this.streams.forEach(s => {
            const pos = s.geo.attributes.position;

            for (let i = 0; i < s.phases.length; i++) {
                // Advance phase
                s.phases[i] = (s.phases[i] + dt * s.speed) % 1.0;

                // Sample Bezier position
                s.curve.getPoint(s.phases[i], tmp);
                pos.setXYZ(i, tmp.x, tmp.y, tmp.z);
            }

            pos.needsUpdate = true;

            // Flicker opacity for electricity feel
            s.points.material.opacity = 0.6 + Math.sin(Date.now() * 0.01 + s.speed * 10) * 0.3;
        });
    }
}
