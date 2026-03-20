const THREE = window.THREE;

export class InfiniteGrid {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.scene.add(this.group);
        this.count = 1800;
        this.lines = null;
        this.fills = null;
        this.hexPositions = []; // store {x,z,dist} for wave animation
        this.init();
    }

    init() {
        const hexR       = 20;
        const hexSpacing = 42;
        const gridRadius = 600;
        const centerClear = 160;

        // Pre-build coordinates
        const positions = [];
        for (let q = -15; q <= 15; q++) {
            for (let r = -15; r <= 15; r++) {
                const x = hexSpacing * (q + r / 2);
                const z = hexSpacing * (Math.sqrt(3) / 2) * r;
                const dist = Math.sqrt(x * x + z * z);
                if (dist < gridRadius && dist > centerClear) {
                    positions.push({ x, z, dist });
                }
            }
        }
        this.hexPositions = positions;

        // ── 1. WIREFRAME LINES ─────────────────────────────────────────────
        const linePositions = [];
        const lineColors    = [];
        const baseR = 0.0, baseG = 0.25, baseB = 0.45;

        positions.forEach(({ x, z }) => {
            for (let i = 0; i <= 6; i++) {
                const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
                linePositions.push(
                    x + Math.cos(angle) * hexR,
                    -3,
                    z + Math.sin(angle) * hexR
                );
                lineColors.push(baseR, baseG, baseB);
            }
        });

        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        lineGeo.setAttribute('color',    new THREE.Float32BufferAttribute(lineColors, 3));

        const indices = [];
        for (let h = 0; h < positions.length; h++) {
            const base = h * 7;
            for (let v = 0; v < 6; v++) {
                indices.push(base + v, base + v + 1);
            }
        }
        lineGeo.setIndex(indices);

        const lineMat = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.lines = new THREE.LineSegments(lineGeo, lineMat);
        this.group.add(this.lines);

        // ── 2. HEX FILLS ───────────────────────────────────────────────────
        // Use a FIXED opacity — no runtime changes → no camera-move flicker
        const fillGeo = new THREE.CylinderGeometry(hexR * 0.90, hexR * 0.90, 0.5, 6);
        const fillMat = new THREE.MeshStandardMaterial({
            color: 0x0a1520,
            metalness: 0.05,
            roughness: 0.95,
            transparent: true,
            opacity: 0.45,
            depthWrite: false   // prevents z-fight with the lines above it
        });

        this.fills = new THREE.InstancedMesh(fillGeo, fillMat, positions.length);
        this._fillMatrix = new THREE.Matrix4();
        positions.forEach(({ x, z }, i) => {
            this._fillMatrix.setPosition(x, -4.5, z);
            this.fills.setMatrixAt(i, this._fillMatrix);
        });
        this.fills.instanceMatrix.needsUpdate = true;
        this.fills.renderOrder = -1; // draw fills first so lines render on top
        this.group.add(this.fills);
    }

    setTerritoryColor(hexIndices, color) {
        if (!this.lines) return;
        const colors = this.lines.geometry.attributes.color;
        const c = new THREE.Color(color);
        hexIndices.forEach(h => {
            const base = h * 7;
            for (let v = 0; v < 7; v++) {
                colors.setXYZ(base + v, c.r, c.g, c.b);
            }
        });
        colors.needsUpdate = true;
    }

    update(time) {
        // ── OUTWARD RIPPLE WAVE ─────────────────────────────────────────────
        // Height of each fill hex oscillates as a wave moving outward from center.
        // Period = 4 s, speed = outward. No opacity change → no flicker.
        if (!this.fills || !this.hexPositions.length) return;

        const WAVE_SPEED    = 80;   // units per second
        const WAVE_PERIOD   = 120;  // wave width in world units
        const WAVE_HEIGHT   = 3;    // max y displacement
        const BASE_Y        = -4.5;

        for (let i = 0; i < this.hexPositions.length; i++) {
            const { x, z, dist } = this.hexPositions[i];
            // Phase offset by distance: wave front moves outward
            const phase = dist - time * WAVE_SPEED;
            const wave  = Math.sin((phase / WAVE_PERIOD) * Math.PI * 2);
            // Clamp so only the wave front is bright (envelope)
            const envelope = Math.max(0, wave);

            const y = BASE_Y + envelope * WAVE_HEIGHT;
            this._fillMatrix.setPosition(x, y, z);
            this.fills.setMatrixAt(i, this._fillMatrix);
        }
        this.fills.instanceMatrix.needsUpdate = true;
    }
}
