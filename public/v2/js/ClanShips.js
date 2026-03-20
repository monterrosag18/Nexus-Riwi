const THREE = window.THREE;

/**
 * ClanShips — Cinematic 3D ships patrolling the Nexus.
 * [UPGRADED] - 5x Scale, Procedural Greeble Details, Plasma Trails.
 */

const SHIP_TYPES = {
    turing:   'interceptor',
    tesla:    'needle',
    mccarthy: 'scout',
    hamilton: 'commando',
    thompson: 'shield',
};

export class ClanShips {
    constructor(scene, camera, clans) {
        this.scene = scene;
        this.camera = camera;
        this.clans = clans;
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.ships = [];
        this._init();
    }

    _init() {
        this.clans.forEach((clan) => {
            const shipData = this._createShip(clan);
            this.ships.push(shipData);
            this.group.add(shipData.mesh);
        });
    }

    _createShip(clan) {
        const type = SHIP_TYPES[clan.name.toLowerCase()] || 'interceptor';
        const color = new THREE.Color(clan.color);
        const shipGroup = new THREE.Group();

        // ── 1. MATERIALS ──────────────────────────────────────────────────
        // Metallic hull
        const hullMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a35,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x000000
        });

        // Painted accents (clan color)
        const paintMat = new THREE.MeshStandardMaterial({
            color: clan.color,
            metalness: 0.5,
            roughness: 0.3,
            emissive: clan.color,
            emissiveIntensity: 0.2
        });

        // Glowing windows/panels
        const windowMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            emissive: 0xffffff
        });

        // ── 2. DETAILED PROCEDURAL MODELS ─────────────────────────────────
        const createGreeble = (parent, count, sizeRange) => {
            for (let i = 0; i < count; i++) {
                const s = Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
                const greeble = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), hullMat);
                greeble.position.set(
                    (Math.random() - 0.5) * 4,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 8
                );
                parent.add(greeble);
            }
        };

        const addWindowLights = (parent, count, area) => {
            for (let i = 0; i < count; i++) {
                const dot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), windowMat);
                dot.position.set(
                    (Math.random() - 0.5) * area.x,
                    (Math.random() - 0.5) * area.y,
                    (Math.random() - 0.5) * area.z
                );
                parent.add(dot);
            }
        };

        const SCALE = 6.0; // 6x from original

        switch (type) {
            case 'interceptor': { // Turing
                const body = new THREE.Mesh(new THREE.ConeGeometry(2, 10, 4), hullMat);
                body.rotation.x = Math.PI / 2;
                shipGroup.add(body);
                // Wings
                const wingShape = new THREE.Shape();
                wingShape.moveTo(0,0); wingShape.lineTo(8, -4); wingShape.lineTo(2, -10); wingShape.closePath();
                const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.8, bevelEnabled: true, bevelSize: 0.2 });
                const w1 = new THREE.Mesh(wingGeo, paintMat);
                w1.position.set(1.5, 0, 2);
                const w2 = w1.clone(); w2.scale.x = -1; w2.position.x = -1.5;
                shipGroup.add(w1, w2);
                createGreeble(shipGroup, 10, [0.5, 1.5]);
                break;
            }
            case 'needle': { // Tesla
                const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 1.5, 18, 6), hullMat);
                body.rotation.x = Math.PI / 2;
                shipGroup.add(body);
                // Stabilizers
                for (let i = 0; i < 3; i++) {
                    const r = (i / 3) * Math.PI * 2;
                    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 3), paintMat);
                    fin.position.set(Math.cos(r) * 2, Math.sin(r) * 2, -4);
                    fin.rotation.z = r;
                    shipGroup.add(fin);
                }
                const emitter = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), paintMat);
                emitter.position.z = 9;
                shipGroup.add(emitter);
                break;
            }
            case 'scout': { // McCarthy
                const h1 = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 12), hullMat);
                h1.position.x = 4;
                const h2 = h1.clone(); h2.position.x = -4;
                const bridge = new THREE.Mesh(new THREE.BoxGeometry(8, 0.8, 4), paintMat);
                bridge.position.z = -2;
                shipGroup.add(h1, h2, bridge);
                createGreeble(h1, 5, [0.4, 1.0]);
                createGreeble(h2, 5, [0.4, 1.0]);
                break;
            }
            case 'commando': { // Hamilton
                const core = new THREE.Mesh(new THREE.BoxGeometry(5, 4, 14), hullMat);
                shipGroup.add(core);
                const bridge = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 4), paintMat);
                bridge.position.y = 2.5;
                bridge.position.z = 1;
                shipGroup.add(bridge);
                const gun1 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 6), hullMat);
                gun1.rotation.x = Math.PI / 2;
                gun1.position.set(3, -1.5, 5);
                const gun2 = gun1.clone(); gun2.position.x = -3;
                shipGroup.add(gun1, gun2);
                createGreeble(core, 15, [0.6, 2.0]);
                addWindowLights(core, 12, new THREE.Vector3(4, 3, 10));
                break;
            }
            case 'shield': { // Thompson
                const saucer = new THREE.Mesh(new THREE.CylinderGeometry(6, 7, 2, 8), hullMat);
                saucer.rotation.x = Math.PI / 2;
                shipGroup.add(saucer);
                const wing1 = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 6), paintMat);
                wing1.position.x = 8;
                const wing2 = wing1.clone(); wing2.position.x = -8;
                shipGroup.add(wing1, wing2);
                const top = new THREE.Mesh(new THREE.SphereGeometry(3, 8, 8), paintMat);
                top.position.y = 1.5;
                top.scale.y = 0.5;
                shipGroup.add(top);
                break;
            }
        }

        shipGroup.scale.setScalar(SCALE);

        // ── 3. PLASMA ENGINE TRAIL (Improved GLSL) ────────────────────────
        const trailGeo = new THREE.CylinderGeometry(0.1, 4.5, 40, 16, 1, true);
        const trailMat = new THREE.ShaderMaterial({
            uniforms: {
                uColor: { value: color },
                uTime:  { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    // Taper end of trail
                    vec3 pos = position;
                    float taper = 1.0 - uv.y; 
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                uniform float uTime;
                varying vec2 vUv;

                void main() {
                    // Moving noise texture
                    float noise = sin(vUv.x * 20.0 + uTime * 15.0) * cos(vUv.y * 10.0 - uTime * 10.0) * 0.5 + 0.5;
                    float alpha = (1.0 - vUv.y) * 0.45; // Fade over length
                    alpha *= (0.7 + 0.3 * noise); // Flicker
                    
                    // Central bright core
                    float core = smoothstep(0.4, 0.5, 1.0 - abs(vUv.x - 0.5) * 2.0);
                    vec3 finalColor = mix(uColor, vec3(1.0), core * 0.4);

                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const trail = new THREE.Mesh(trailGeo, trailMat);
        trail.rotation.x = -Math.PI / 2;
        trail.position.z = -25; // Adjusted for new scale
        shipGroup.add(trail);

        // ── 4. FLIGHT PATH ──────────────────────────────────────────────
        const points = [];
        const orbitRadius = 800 + Math.random() * 400;
        const orbitHeight = 150 + Math.random() * 200;
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(angle) * (orbitRadius + (Math.random()-0.5)*250),
                orbitHeight + (Math.random()-0.5)*150,
                Math.sin(angle) * (orbitRadius + (Math.random()-0.5)*250)
            ));
        }
        const path = new THREE.CatmullRomCurve3(points, true);

        // ── 5. HOLOGRAPHIC LABEL (Larger) ────────────────────────────────
        const labelCanvas = document.createElement('canvas');
        labelCanvas.width = 512; labelCanvas.height = 128;
        const ctx = labelCanvas.getContext('2d');
        ctx.fillStyle = clan.color;
        ctx.font = '900 64px Rajdhani';
        ctx.textAlign = 'center';
        ctx.shadowColor = clan.color;
        ctx.shadowBlur = 20;
        ctx.fillText(`◆ ${clan.name.toUpperCase()} ◆`, 256, 80);
        
        const labelTex = new THREE.CanvasTexture(labelCanvas);
        const label = new THREE.Mesh(
            new THREE.PlaneGeometry(60, 15),
            new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, side: THREE.DoubleSide, depthWrite: false })
        );
        label.position.y = 20;
        shipGroup.add(label);

        return {
            mesh: shipGroup,
            path: path,
            t: Math.random(),
            speed: 0.008 + Math.random() * 0.012, // Slower for "massive" feel
            label: label,
            trail: trail,
            bobOffset: Math.random() * 1000
        };
    }

    update(time) {
        const delta = 0.016; 
        const up = new THREE.Vector3(0, 1, 0);

        this.ships.forEach(s => {
            s.t = (s.t + delta * s.speed) % 1.0;

            const pos = s.path.getPoint(s.t);
            const nextT = (s.t + 0.01) % 1.0;
            const nextPos = s.path.getPoint(nextT);
            const moveDir = new THREE.Vector3().subVectors(nextPos, pos).normalize();
            
            // Subtle Bobbing
            const bob = Math.sin(time * 0.5 + s.bobOffset) * 5;
            s.mesh.position.set(pos.x, pos.y + bob, pos.z);
            
            s.mesh.lookAt(nextPos);

            // Improved Banking
            // Normal of the path compared to global Up
            const right = new THREE.Vector3().crossVectors(moveDir, up).normalize();
            const curUp = new THREE.Vector3().crossVectors(right, moveDir).normalize();
            
            // Lookahead banking: calculate turn intensity
            const futureT = (s.t + 0.04) % 1.0;
            const futurePos = s.path.getPoint(futureT);
            const futureDir = new THREE.Vector3().subVectors(futurePos, nextPos).normalize();
            const turnIntensity = moveDir.cross(futureDir).y;
            
            const bankAngle = turnIntensity * 45; // Max 45 degrees
            s.mesh.rotateZ(bankAngle);

            // Update Shader
            s.trail.material.uniforms.uTime.value = time;

            // Billboard label
            if (this.camera) {
                s.label.lookAt(this.camera.position);
            }
        });
    }
}
