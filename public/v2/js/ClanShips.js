const THREE = window.THREE;

/**
 * ClanShips — Cinematic Orbital Fleet with Landing/Refueling Logic.
 * Ships patrol the sky and periodically land at their clan's hexagonal pad to 'refuel'.
 */

export class ClanShips {
    constructor(scene, camera, clans) {
        this.scene = scene;
        this.camera = camera;
        this.clans = clans;
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.ships = [];
        this.pads = [];
        this.loader = new THREE.GLTFLoader();
        this.isReady = false;

        this._init();
    }

    async _init() {
        // ── 1. CREATE LANDING PADS ───────────────────────────────────────
        this.clans.forEach(clan => {
            const pad = this._createLandingPad(clan);
            this.pads.push(pad);
            this.group.add(pad);
        });

        // ── 2. LOAD SHIPS ────────────────────────────────────────────────
        const loadPromises = this.clans.map((clan, index) => {
            const shipIndex = (index % 5) + 1;
            const modelUrl = `assets/models/ship_${shipIndex}.glb`;
            
            return new Promise((resolve) => {
                this.loader.load(modelUrl, (gltf) => {
                    const shipData = this._setupShip(gltf.scene, clan);
                    this.ships.push(shipData);
                    this.group.add(shipData.mesh);
                    resolve();
                }, undefined, (error) => {
                    console.error(`Error loading ship ${shipIndex}:`, error);
                    resolve();
                });
            });
        });

        await Promise.all(loadPromises);
        this.isReady = true;
    }

    _createLandingPad(clan) {
        const group = new THREE.Group();
        const color = new THREE.Color(clan.color);

        // Hexagon Base
        const hexGeo = new THREE.CylinderGeometry(80, 90, 10, 6);
        const hexMat = new THREE.MeshPhongMaterial({ 
            color: 0x111111, 
            emissive: color, 
            emissiveIntensity: 0.2,
            shininess: 100
        });
        const platform = new THREE.Mesh(hexGeo, hexMat);
        group.add(platform);

        // Glowing Ring
        const ringGeo = new THREE.TorusGeometry(75, 2, 16, 6);
        const ringMat = new THREE.MeshBasicMaterial({ color: color });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 6;
        group.add(ring);

        // Support Hologram (Mini-pillars)
        const pillarGeo = new THREE.BoxGeometry(5, 40, 5);
        const pillarMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.3 });
        for(let i=0; i<6; i++) {
            const angle = (i/6) * Math.PI * 2;
            const p = new THREE.Mesh(pillarGeo, pillarMat);
            p.position.set(Math.cos(angle)*70, 20, Math.sin(angle)*70);
            group.add(p);
        }

        group.position.set(clan.pos.x, 5, clan.pos.z);
        return group;
    }

    _setupShip(model, clan) {
        const color = new THREE.Color(clan.color);
        const shipGroup = new THREE.Group();

        // Traverse and color
        model.traverse((child) => {
            if (child.isMesh) {
                child.material.metalness = 0.9;
                child.material.roughness = 0.2;
                if (child.name.toLowerCase().includes('glass') || child.name.toLowerCase().includes('light')) {
                    child.material.emissive = color;
                    child.material.emissiveIntensity = 4.0;
                }
            }
        });

        const SCALE = 12.0;
        model.scale.setScalar(SCALE);
        model.rotation.y = Math.PI;
        shipGroup.add(model);

        // Engine Trail (Simplified for landing/takeoff compatibility)
        const engineGeo = new THREE.CylinderGeometry(0.5, 4.0, 40, 16, 1, true);
        const engineMat = new THREE.ShaderMaterial({
            uniforms: { uColor: { value: color }, uTime: { value: 0 }, uIntensity: { value: 1.0 } },
            vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
            fragmentShader: `
                uniform vec3 uColor; uniform float uTime; uniform float uIntensity; varying vec2 vUv;
                void main() {
                    float noise = sin(vUv.x * 20.0 + uTime * 25.0);
                    float alpha = pow(1.0 - vUv.y, 2.5) * 0.7 * uIntensity;
                    gl_FragColor = vec4(mix(uColor, vec3(1.0), 0.3), alpha);
                }
            `,
            transparent: true, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
        });

        const trail = new THREE.Mesh(engineGeo, engineMat);
        trail.rotation.x = -Math.PI / 2;
        trail.position.set(0, 0, -15);
        shipGroup.add(trail);

        // Label
        const labelText = this._createLabel(clan.name, clan.color);
        labelText.position.y = 40;
        shipGroup.add(labelText);

        return {
            mesh: shipGroup,
            clan: clan,
            state: 'PATROL', // PATROL, APPROACH, REFUEL, TAKEOFF
            t: Math.random(),
            speed: 0.005 + Math.random() * 0.005,
            targetPad: new THREE.Vector3(clan.pos.x, 30, clan.pos.z),
            waitTimer: 0,
            engineMat: engineMat,
            label: labelText,
            velocity: new THREE.Vector3()
        };
    }

    _createLabel(text, color) {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.font = 'bold 50px Rajdhani';
        ctx.textAlign = 'center';
        ctx.fillText(text.toUpperCase(), 256, 80);
        const tex = new THREE.CanvasTexture(canvas);
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(80, 20), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
        return mesh;
    }

    update(time) {
        if (!this.isReady) return;

        const delta = 0.016;
        this.ships.forEach(s => {
            const currentPos = s.mesh.position;
            let targetPos = new THREE.Vector3();

            // ── STATE MACHINE ──────────────────────────────────────────────
            switch(s.state) {
                case 'PATROL':
                    // Wide orbit around center
                    const orbitR = 1200 + Math.sin(time * 0.1 + s.clan.id*2) * 200;
                    const angle = time * 0.05 + (s.clan.id * Math.PI * 0.4);
                    targetPos.set(Math.cos(angle) * orbitR, 400 + Math.sin(time * 0.2) * 50, Math.sin(angle) * orbitR);
                    
                    // Periodically decide to refuel (every ~30-60 secs)
                    if (Math.random() > 0.9995) s.state = 'APPROACH';
                    break;

                case 'APPROACH':
                    targetPos.copy(s.targetPad);
                    const distToPad = currentPos.distanceTo(targetPos);
                    if (distToPad < 10) {
                        s.state = 'REFUEL';
                        s.waitTimer = time + 8; // Wait 8 seconds
                    }
                    break;

                case 'REFUEL':
                    targetPos.set(s.clan.pos.x, 15, s.clan.pos.z);
                    s.engineMat.uniforms.uIntensity.value = 0.2; // Dim engines
                    if (time > s.waitTimer) s.state = 'TAKEOFF';
                    break;

                case 'TAKEOFF':
                    targetPos.set(s.clan.pos.x, 500, s.clan.pos.z);
                    s.engineMat.uniforms.uIntensity.value = 1.0; 
                    if (currentPos.y > 450) s.state = 'PATROL';
                    break;
            }

            // ── SMOOTH MOVEMENT & ROTATION ──────────────────────────────────
            const lerpFactor = s.state === 'REFUEL' ? 0.1 : 0.02;
            s.mesh.position.lerp(targetPos, lerpFactor);

            // Look at direction of travel (unless refueling)
            if (s.state !== 'REFUEL') {
                const lookTarget = targetPos.clone();
                s.mesh.lookAt(lookTarget);
                
                // Banking effect
                const moveDir = targetPos.clone().sub(currentPos).normalize();
                const bank = (moveDir.x * moveDir.z) * 50.0;
                s.mesh.rotateZ(bank);
            } else {
                // Static on pad, subtle hover
                s.mesh.position.y = 20 + Math.sin(time * 2) * 2;
                s.mesh.rotation.y += 0.005;
            }

            // Update visuals
            s.engineMat.uniforms.uTime.value = time;
            if (this.camera) s.label.lookAt(this.camera.position);
        });
    }
}
