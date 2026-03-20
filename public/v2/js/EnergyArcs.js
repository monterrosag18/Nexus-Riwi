const THREE = window.THREE;

/**
 * EnergyArcs — animated lightning bolts from the Nexus center to hex grid nodes.
 *
 * Technique:
 *  - Each arc is a LineSegments object whose vertex positions are mutated every
 *    few frames using randomised displacement (classic "jagged lightning" trick).
 *  - AdditiveBlending + high-saturation colours make them glow under bloom.
 *  - Node spheres mark the connection points on the hex grid.
 *  - Arcs flicker (random opacity / visibility) for a realistic electricity feel.
 */
export class EnergyArcs {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.arcs = [];          // { line, geo, startPt, endPt, timer, interval }
        this.nodes = [];         // glowing sphere meshes at endpoints

        // Target points on the inner ring of the hex grid (radius ~150)
        const numArcs = 8;
        const arcRadius = 160;
        const arcColors = [
            0x00f3ff, 0x00c3ff, 0x7b2fff,
            0xff33aa, 0x00ffaa, 0xffffff,
            0x33ccff, 0xaa44ff
        ];

        for (let i = 0; i < numArcs; i++) {
            const angle = (i / numArcs) * Math.PI * 2;
            const endX = Math.cos(angle) * arcRadius;
            const endZ = Math.sin(angle) * arcRadius;

            const color = arcColors[i % arcColors.length];

            // Nexus hovers at y ≈ 80; endpoint is on the grid at y = -3
            const start = new THREE.Vector3(0, 80, 0);
            const end   = new THREE.Vector3(endX, -3, endZ);

            this._createArc(start, end, color);
            this._createNode(end, color);
        }

        // Extra secondary arcs (shorter, from mid-air to outer hex ring)
        const numSecondary = 5;
        const outerRadius = 300;
        for (let i = 0; i < numSecondary; i++) {
            const angle = ((i + 0.5) / numSecondary) * Math.PI * 2;
            const endX = Math.cos(angle) * outerRadius;
            const endZ = Math.sin(angle) * outerRadius;
            const color = 0x4488ff;
            const start = new THREE.Vector3(
                Math.cos(angle) * 80, 30, Math.sin(angle) * 80
            );
            const end = new THREE.Vector3(endX, -3, endZ);
            this._createArc(start, end, color, 6); // fewer segments
            this._createNode(end, color, 3);
        }
    }

    /** Build one jagged lightning arc between start and end. */
    _createArc(start, end, color, segments = 10) {
        const positions = new Float32Array((segments + 1) * 3);

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            linewidth: 1   // note: most browsers cap at 1
        });

        const line = new THREE.Line(geo, mat);
        this.group.add(line);

        this.arcs.push({
            line,
            geo,
            start: start.clone(),
            end: end.clone(),
            segments,
            timer: 0,
            interval: 0.04 + Math.random() * 0.04,  // regenerate every ~40-80 ms
            flickerTimer: 0,
            flickerInterval: 0.1 + Math.random() * 0.15
        });

        // Write initial positions
        this._regenerateArc(this.arcs[this.arcs.length - 1]);
    }

    /** Glowing sphere node at the endpoint. */
    _createNode(position, color, radius = 5) {
        const geo = new THREE.SphereGeometry(radius, 8, 8);
        const mat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(position);
        this.group.add(mesh);
        this.nodes.push(mesh);
    }

    /**
     * Mutate the arc's vertex buffer with a new jagged path.
     * Classic "recursive midpoint displacement" for lightning:
     *   - Divide the straight line from start→end into N segments
     *   - Displace each intermediate vertex perpendicularly by a random amount
     *   - Amount of displacement falls off toward the endpoints
     */
    _regenerateArc(arc) {
        const { start, end, segments } = arc;
        const positions = arc.geo.attributes.position.array;

        const dir = end.clone().sub(start);
        const len = dir.length();

        // Perpendicular plane: use a temp vector orthogonal to dir
        const up = Math.abs(dir.y / len) < 0.9
            ? new THREE.Vector3(0, 1, 0)
            : new THREE.Vector3(1, 0, 0);
        const right = new THREE.Vector3().crossVectors(dir.normalize(), up).normalize();
        const perp2 = new THREE.Vector3().crossVectors(dir, right).normalize();

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const base = start.clone().lerp(end, t);

            if (i > 0 && i < segments) {
                // Displacement magnitude tapers at endpoints (sine envelope)
                const envelope = Math.sin(t * Math.PI);
                const maxDisp = len * 0.25 * envelope;

                const dx = (Math.random() * 2 - 1) * maxDisp;
                const dz = (Math.random() * 2 - 1) * maxDisp;

                base.addScaledVector(right, dx);
                base.addScaledVector(perp2, dz);
            }

            positions[i * 3]     = base.x;
            positions[i * 3 + 1] = base.y;
            positions[i * 3 + 2] = base.z;
        }

        arc.geo.attributes.position.needsUpdate = true;
    }

    update(dt) {
        this.arcs.forEach(arc => {
            // Regenerate the jagged path at high frequency → lightning flicker
            arc.timer += dt;
            if (arc.timer >= arc.interval) {
                arc.timer = 0;
                this._regenerateArc(arc);

                // Randomise interval slightly each time
                arc.interval = 0.03 + Math.random() * 0.05;
            }

            // Flicker opacity independently
            arc.flickerTimer += dt;
            if (arc.flickerTimer >= arc.flickerInterval) {
                arc.flickerTimer = 0;
                arc.flickerInterval = 0.08 + Math.random() * 0.12;

                const visible = Math.random() > 0.15; // 85% chance visible
                arc.line.visible = visible;
                if (visible) {
                    arc.line.material.opacity = 0.4 + Math.random() * 0.6;
                }
            }
        });

        // Pulse node spheres
        this.nodes.forEach((node, i) => {
            const pulse = 0.7 + Math.abs(Math.sin(Date.now() * 0.003 + i)) * 0.5;
            node.material.opacity = pulse * 0.9;
            const s = 0.8 + Math.sin(Date.now() * 0.005 + i * 1.3) * 0.2;
            node.scale.setScalar(s);
        });
    }
}
