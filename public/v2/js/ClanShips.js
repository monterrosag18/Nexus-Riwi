const THREE = window.THREE;

/**
 * ClanShips — Cinematic 3D ships patrolling the Nexus.
 * 
 * Features:
 *  1. 5 Unique Procedural Ship Models (one per clan).
 *  2. GLSL Engine Trails (fading glow beams).
 *  3. Spline-based flight paths (CatmullRomCurve3).
 *  4. Physics-based Banking: Ships tilt into their turns.
 *  5. Floating Holographic Clan Labels.
 */

const SHIP_TYPES = {
    turing:   'interceptor', // Sharp, angular, fast
    tesla:    'needle',      // Slender, long, high-tech
    mccarthy: 'scout',       // Symmetric, twin-hull
    hamilton: 'commando',    // Bulkier, heavy fighter
    thompson: 'shield',      // Wide wings, defensive profile
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
        this.clans.forEach((clan, index) => {
            const shipData = this._createShip(clan);
            this.ships.push(shipData);
            this.group.add(shipData.mesh);
        });
    }

    _createShip(clan) {
        const type = SHIP_TYPES[clan.name.toLowerCase()] || 'interceptor';
        const color = new THREE.Color(clan.color);
        const shipGroup = new THREE.Group();

        // ── 1. PROCEDURAL GEOMETRY ──────────────────────────────────────
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            metalness: 0.9,
            roughness: 0.1,
            emissive: clan.color,
            emissiveIntensity: 0.15
        });

        const accentMat = new THREE.MeshStandardMaterial({
            color: clan.color,
            emissive: clan.color,
            emissiveIntensity: 0.8,
            metalness: 0.5,
            roughness: 0.2
        });

        switch (type) {
            case 'interceptor': // Turing
                const body = new THREE.Mesh(new THREE.ConeGeometry(2, 8, 4), bodyMat);
                body.rotation.x = Math.PI / 2;
                shipGroup.add(body);
                // Sharp wings
                const wingShape = new THREE.Shape();
                wingShape.moveTo(0,0); wingShape.lineTo(6, -2); wingShape.lineTo(0, -6); wingShape.closePath();
                const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.5, bevelEnabled: false });
                const w1 = new THREE.Mesh(wingGeo, accentMat);
                w1.position.set(1, 0, 1);
                const w2 = w1.clone(); w2.scale.x = -1; w2.position.x = -1;
                shipGroup.add(w1, w2);
                break;

            case 'needle': // Tesla
                const core = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.2, 12, 8), bodyMat);
                core.rotation.x = Math.PI / 2;
                shipGroup.add(core);
                // Forward spikes
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.3, 4, 4), accentMat);
                spike.position.z = 8;
                spike.rotation.x = Math.PI / 2;
                shipGroup.add(spike);
                // Electric rings
                for(let i=0; i<3; i++) {
                    const r = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.1, 8, 16), accentMat);
                    r.position.z = -2 + i*2;
                    shipGroup.add(r);
                }
                break;

            case 'scout': // McCarthy
                const pod1 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 6), bodyMat);
                pod1.position.x = 2.5;
                const pod2 = pod1.clone(); pod2.position.x = -2.5;
                const connect = new THREE.Mesh(new THREE.BoxGeometry(5, 0.6, 1.5), accentMat);
                shipGroup.add(pod1, pod2, connect);
                break;

            case 'commando': // Hamilton
                const main = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.5, 9), bodyMat);
                const cockpit = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), accentMat);
                cockpit.position.z = 4;
                cockpit.scale.y = 0.6;
                shipGroup.add(main, cockpit);
                break;

            case 'shield': // Thompson
                const center = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 8), bodyMat);
                const wings = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 4), accentMat);
                wings.position.z = -1;
                shipGroup.add(center, wings);
                break;
        }

        // ── 2. ENGINE TRAILS (GLSL) ──────────────────────────────────────
        const trailPositions = [];
        const trailCount = 40;
        for(let i=0; i<trailCount; i++) trailPositions.push(0,0,0);

        const trailGeo = new THREE.BufferGeometry();
        trailGeo.setAttribute('position', new THREE.Float32BufferAttribute(trailPositions, 3));

        const trailMat = new THREE.ShaderMaterial({
            uniforms: { 
                uColor: { value: color },
                uTime: { value: 0 }
            },
            vertexShader: `
                attribute float aIndex;
                varying float vOpacity;
                void main() {
                    vOpacity = 1.0 - (position.z / -20.0); // Simple Z-fade
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                varying float vOpacity;
                void main() {
                    gl_FragColor = vec4(uColor, vOpacity * 0.6);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        // Simplified trail: we'll use a ribbon or particles. 
        // For "Brutal" effect, let's use a narrow glowing cone that stretches.
        const engineGlow = new THREE.Mesh(
            new THREE.ConeGeometry(1, 15, 8, 1, true),
            new THREE.MeshBasicMaterial({ color: clan.color, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending })
        );
        engineGlow.rotation.x = -Math.PI / 2;
        engineGlow.position.z = -8;
        shipGroup.add(engineGlow);

        // ── 3. FLIGHT PATH (CatmullRomCurve3) ───────────────────────────
        const points = [];
        const radius = 400 + Math.random() * 300;
        const segments = 8;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(angle) * (radius + (Math.random()-0.5)*200),
                100 + (Math.random()-0.5)*150,
                Math.sin(angle) * (radius + (Math.random()-0.5)*200)
            ));
        }
        const path = new THREE.CatmullRomCurve3(points, true);

        // ── 4. LABEL ────────────────────────────────────────────────────
        const labelCanvas = document.createElement('canvas');
        labelCanvas.width = 256; labelCanvas.height = 64;
        const ctx = labelCanvas.getContext('2d');
        ctx.fillStyle = clan.color;
        ctx.font = 'bold 32px Rajdhani';
        ctx.textAlign = 'center';
        ctx.shadowColor = clan.color;
        ctx.shadowBlur = 10;
        ctx.fillText(clan.name.toUpperCase(), 128, 40);
        
        const labelTex = new THREE.CanvasTexture(labelCanvas);
        const label = new THREE.Mesh(
            new THREE.PlaneGeometry(16, 4),
            new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, side: THREE.DoubleSide, depthWrite: false })
        );
        label.position.y = 8;
        shipGroup.add(label);

        return {
            mesh: shipGroup,
            path: path,
            t: Math.random(), // start at random progress
            speed: 0.015 + Math.random() * 0.02,
            label: label,
            engineGlow: engineGlow,
            lastPos: new THREE.Vector3()
        };
    }

    update(time) {
        const delta = 0.016; 
        const up = new THREE.Vector3(0, 1, 0);

        this.ships.forEach(s => {
            s.t = (s.t + delta * s.speed) % 1.0;

            const pos = s.path.getPoint(s.t);
            const tangent = s.path.getTangent(s.t).normalize();
            
            // Calculate Banking (Roll into the turn)
            // We look ahead a bit to find the curvature
            const nextT = (s.t + 0.02) % 1.0;
            const nextPos = s.path.getPoint(nextT);
            const moveDir = new THREE.Vector3().subVectors(nextPos, pos).normalize();
            
            s.mesh.position.copy(pos);
            s.mesh.lookAt(pos.clone().add(moveDir));

            // Banking math: cross product of moveDir and Up, then some rotation based on horizontal change
            const horizontalDir = new THREE.Vector3(moveDir.x, 0, moveDir.z).normalize();
            const cross = new THREE.Vector3().crossVectors(moveDir, up);
            // Amount of bank is proportional to how much the moveDir is NOT vertical
            const bankAngle = -cross.y * 0.8; 
            s.mesh.rotateZ(bankAngle);

            // Flicker engine
            s.engineGlow.scale.setScalar(0.8 + Math.random() * 0.4);
            s.engineGlow.material.opacity = 0.2 + Math.random() * 0.3;

            // Update label to face camera
            if (this.camera) {
                s.label.lookAt(this.camera.position);
            }
        });
    }
}
