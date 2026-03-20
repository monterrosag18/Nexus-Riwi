const THREE = window.THREE;

export class InfiniteGrid {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.scene.add(this.group);
        this.count = 1800;
        this.lines = null;
        this.fills = null;
        this.init();
    }

    init() {
        const hexR = 10;       // outer radius of each hex
        const hexSpacing = 21; // center-to-center distance
        const gridRadius = 600;
        const centerClear = 140;

        // Pre-build coordinates
        const positions = [];
        for (let q = -30; q <= 30; q++) {
            for (let r = -30; r <= 30; r++) {
                const x = hexSpacing * (q + r / 2);
                const z = hexSpacing * (Math.sqrt(3) / 2) * r;
                const dist = Math.sqrt(x * x + z * z);
                if (dist < gridRadius && dist > centerClear) {
                    positions.push({ x, z });
                }
            }
        }

        // ── 1. WIREFRAME LINES (neon glow via AdditiveBlending) ────────────
        // Build one big BufferGeometry with all hex outlines concatenated
        const linePositions = [];
        const lineColors = [];

        // Neutral hex colour (dim blue-cyan) for unowned territory
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
        lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

        // Draw as LineSegments pairs (each hex = 7 verts with GL_LINE_STRIP-like pairs)
        // We'll use LineSegments with manually paired indices
        const indices = [];
        const vertsPerHex = 7;
        for (let h = 0; h < positions.length; h++) {
            const base = h * vertsPerHex;
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

        // ── 2. HEX FILLS (very transparent flat cylinders for surface) ──────
        const fillGeo = new THREE.CylinderGeometry(hexR * 0.92, hexR * 0.92, 0.5, 6);
        const fillMat = new THREE.MeshStandardMaterial({
            color: 0x0a1a2a,
            metalness: 0.1,
            roughness: 0.9,
            transparent: true,
            opacity: 0.55
        });

        const fillMesh = new THREE.InstancedMesh(fillGeo, fillMat, positions.length);
        const mat4 = new THREE.Matrix4();
        positions.forEach(({ x, z }, i) => {
            mat4.setPosition(x, -4, z);
            fillMesh.setMatrixAt(i, mat4);
        });
        fillMesh.instanceMatrix.needsUpdate = true;
        this.fills = fillMesh;
        this.group.add(this.fills);
    }

    /**
     * Color a set of hexes with a clan color (called when territory is claimed).
     * This is a simplified version — in production you'd map hex IDs to indices.
     */
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
        // Subtle pulse on the fill opacity
        if (this.fills) {
            this.fills.material.opacity = 0.45 + Math.sin(time * 0.8) * 0.05;
        }
    }
}
