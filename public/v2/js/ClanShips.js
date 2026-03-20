export class ClanShips {
    constructor(scene, camera, clans) {
        this.scene = scene;
        this.camera = camera;
        this.clans = clans;
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.ships = [];
        // Use global THREE.GLTFLoader from script tag
        this.loader = new THREE.GLTFLoader();
        this.isReady = false;

        this._init();
    }

    async _init() {
        // Load all 5 ships in parallel
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
                    resolve(); // Continue even if one fails
                });
            });
        });

        await Promise.all(loadPromises);
        this.isReady = true;
    }

    _setupShip(model, clan) {
        const color = new THREE.Color(clan.color);
        const shipGroup = new THREE.Group();

        // ── 1. MATERIAL PROCESSING ─────────────────────────────────────────
        // We traverse the model and inject clan colors into emissive channels
        model.traverse((child) => {
            if (child.isMesh) {
                // Ensure metallic look
                child.material.metalness = 0.9;
                child.material.roughness = 0.2;
                
                // If it looks like a painted part or window, add emissive glow
                if (child.name.toLowerCase().includes('glass') || child.name.toLowerCase().includes('light')) {
                    child.material.emissive = color;
                    child.material.emissiveIntensity = 2.0;
                } else if (Math.random() > 0.7) {
                    // Add subtle clan color accents to a few parts
                    child.material.emissive = color;
                    child.material.emissiveIntensity = 0.2;
                }
            }
        });

        const SCALE = 12.0; // Significant scale for "Brutal" presence
        model.scale.setScalar(SCALE);
        model.rotation.y = Math.PI; // Orient forward
        shipGroup.add(model);

        // ── 2. ENGINE GLOW (Plasma Shader) ──────────────────────────────────
        // We add two glow cylinders at the back for engines
        const engineGeo = new THREE.CylinderGeometry(0.1, 4.0, 35, 16, 1, true);
        const engineMat = new THREE.ShaderMaterial({
            uniforms: {
                uColor: { value: color },
                uTime:  { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                uniform float uTime;
                varying vec2 vUv;
                void main() {
                    float noise = sin(vUv.x * 30.0 + uTime * 20.0) * 0.5 + 0.5;
                    float alpha = pow(1.0 - vUv.y, 2.0) * 0.6;
                    alpha *= (0.7 + 0.3 * noise);
                    vec3 finalColor = mix(uColor, vec3(1.0), (1.0 - vUv.y) * 0.4);
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        // Add two engine trails
        const trail1 = new THREE.Mesh(engineGeo, engineMat);
        trail1.rotation.x = -Math.PI / 2;
        trail1.position.set(-2, 0, -10);
        shipGroup.add(trail1);

        const trail2 = trail1.clone();
        trail2.position.x = 2;
        shipGroup.add(trail2);

        // ── 3. FLIGHT PATH ──────────────────────────────────────────────────
        const points = [];
        const orbitRadius = 1000 + Math.random() * 500;
        const orbitHeight = 200 + Math.random() * 300;
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(angle) * (orbitRadius + (Math.random()-0.5)*400),
                orbitHeight + (Math.random()-0.5)*200,
                Math.sin(angle) * (orbitRadius + (Math.random()-0.5)*400)
            ));
        }
        const path = new THREE.CatmullRomCurve3(points, true);

        // ── 4. LABEL ────────────────────────────────────────────────────────
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
            new THREE.PlaneGeometry(80, 20),
            new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, side: THREE.DoubleSide, depthWrite: false })
        );
        label.position.y = 35;
        shipGroup.add(label);

        return {
            mesh: shipGroup,
            path: path,
            t: Math.random(),
            speed: 0.005 + Math.random() * 0.008,
            label: label,
            engineMat: engineMat,
            bobOffset: Math.random() * 1000
        };
    }

    update(time) {
        if (!this.isReady) return;

        const delta = 0.016;
        const up = new THREE.Vector3(0, 1, 0);

        this.ships.forEach(s => {
            s.t = (s.t + delta * s.speed) % 1.0;

            const pos = s.path.getPoint(s.t);
            const nextT = (s.t + 0.01) % 1.0;
            const nextPos = s.path.getPoint(nextT);
            const moveDir = new THREE.Vector3().subVectors(nextPos, pos).normalize();
            
            // Subtle Bobbing
            const bob = Math.sin(time * 0.4 + s.bobOffset) * 10;
            s.mesh.position.set(pos.x, pos.y + bob, pos.z);
            
            s.mesh.lookAt(nextPos);

            // Advanced Banking Physics
            const futureT = (s.t + 0.04) % 1.0;
            const futurePos = s.path.getPoint(futureT);
            const futureDir = new THREE.Vector3().subVectors(futurePos, nextPos).normalize();
            const turnIntensity = moveDir.cross(futureDir).y;
            
            const bankAngle = turnIntensity * 70; // Even more dynamic banking for larger ships
            s.mesh.rotateZ(bankAngle);

            // Update Shader
            s.engineMat.uniforms.uTime.value = time;

            // Billboard label
            if (this.camera) {
                s.label.lookAt(this.camera.position);
            }
        });
    }
}
