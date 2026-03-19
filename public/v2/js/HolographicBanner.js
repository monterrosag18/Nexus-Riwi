const THREE = window.THREE;

const CLAN_ICONS = {
    'turing':   { type: '3d_atom',    unicode: null },
    'tesla':    { type: '3d_bolt',    unicode: null },
    'mccarthy': { type: '3d_gem',     unicode: null },
    'thompson': { type: '3d_shield',  unicode: null },
    'hamilton': { type: '3d_pyramid', unicode: null },
    'lovelace': { type: '3d_gem',     unicode: null },
};

export class HolographicBanner {
    constructor(scene, color = 0x00f3ff, position = {x: 0, y: 0, z: 0}, label = "CLAN") {
        this.scene = scene;
        this.group = new THREE.Group();
        this.color = new THREE.Color(color);
        this.colorHex = color;
        this.label = label;
        this.mesh = null;
        this.icon3d = null;
        this.uniforms = null;

        this.init(position);
    }

    init(pos) {
        const origin = new THREE.Vector3(pos.x, 0, pos.z);

        // ── 1. WAVING FLAG (from original HoloBanner) ──
        const flagGeo = new THREE.PlaneGeometry(20, 32, 20, 20);
        this.uniforms = {
            time:       { value: 0 },
            uColor:     { value: this.color },
            textureMap: { value: this.createFlagTexture() }
        };
        const flagMat = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: `
                uniform float time;
                varying vec2 vUv;
                varying float vWave;
                void main() {
                    vUv = uv;
                    vec3 p = position;
                    float intensity = (1.0 - vUv.y) * 2.2;
                    float wave = sin(p.y * 0.2 + time * 3.0) * intensity;
                    float ripple = sin(p.x * 0.5 + time * 5.0) * (intensity * 0.4);
                    p.z += wave + ripple;
                    vWave = wave;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                uniform float time;
                uniform sampler2D textureMap;
                varying vec2 vUv;
                varying float vWave;
                void main() {
                    vec4 tex = texture2D(textureMap, vUv);
                    float lum = (tex.r + tex.g + tex.b) / 3.0;
                    float scan = sin(vUv.y * 250.0 + time * 4.0) * 0.06;
                    float edge = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);
                    float fade = smoothstep(0.0, 0.15, vUv.y);
                    vec3 finalColor = uColor;
                    if (tex.a > 0.01) {
                        finalColor = lum > 0.4
                            ? mix(finalColor, vec3(1.0), tex.a * 0.9)
                            : mix(finalColor, vec3(0.0), tex.a * 0.7);
                    }
                    finalColor += vec3(scan + vWave * 0.1);
                    float alpha = 0.22 + (tex.a * 0.5);
                    gl_FragColor = vec4(finalColor, alpha * edge * fade);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.NormalBlending
        });
        this.mesh = new THREE.Mesh(flagGeo, flagMat);
        this.mesh.position.set(pos.x, 28, pos.z);
        this.scene.add(this.mesh);

        // ── 2. POLE + CROSSBAR ──
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.1 });
        const barGeo = new THREE.BoxGeometry(22, 0.6, 1);
        const bar = new THREE.Mesh(barGeo, poleMat);
        bar.position.set(pos.x, 44, pos.z);
        this.scene.add(bar);

        const poleGeo = new THREE.CylinderGeometry(0.4, 0.4, 46, 8);
        [pos.x - 11, pos.x + 11].forEach(px => {
            const p = new THREE.Mesh(poleGeo, poleMat);
            p.position.set(px, 23, pos.z);
            this.scene.add(p);
        });

        // ── 3. GLOWING PLATFORM BASE (from original createBannerBase) ──
        const platformGeo = new THREE.CylinderGeometry(14, 16, 3, 8);
        const platformMat = new THREE.MeshStandardMaterial({
            color: 0x111111, metalness: 0.9, roughness: 0.2,
            emissive: this.colorHex, emissiveIntensity: 0.08
        });
        const platform = new THREE.Mesh(platformGeo, platformMat);
        platform.position.set(pos.x, 1.5, pos.z);
        this.scene.add(platform);

        const glowGeo = new THREE.TorusGeometry(11, 0.6, 16, 32);
        const glowMat = new THREE.MeshBasicMaterial({ color: this.colorHex, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.rotation.x = Math.PI / 2;
        glow.position.set(pos.x, 3.2, pos.z);
        this.scene.add(glow);

        // Pillars around base
        const toothGeo = new THREE.BoxGeometry(2.5, 5, 2.5);
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const t = new THREE.Mesh(toothGeo, platformMat);
            t.position.set(pos.x + Math.cos(angle) * 15, 2.5, pos.z + Math.sin(angle) * 15);
            this.scene.add(t);
        }

        // Energy beam
        const beamGeo = new THREE.CylinderGeometry(0.1, 12, 130, 32, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({ color: this.colorHex, transparent: true, opacity: 0.08, side: THREE.DoubleSide });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set(pos.x, 65, pos.z);
        this.scene.add(beam);

        // ── 4. 3D ICON ABOVE FLAG ──
        this.create3DIcon(pos);
    }

    create3DIcon(pos) {
        const mat = new THREE.MeshBasicMaterial({ color: this.colorHex, transparent: true, opacity: 0.95 });
        const lowerLabel = this.label.toLowerCase();
        const iconType = (CLAN_ICONS[lowerLabel] || { type: '3d_gem' }).type;

        let geo;
        const glowGroup = new THREE.Group();

        if (iconType === '3d_atom') {
            const sphere = new THREE.Mesh(new THREE.SphereGeometry(3.5, 16, 16), mat);
            glowGroup.add(sphere);
            [0, Math.PI / 2].forEach(rx => {
                const ring = new THREE.Mesh(new THREE.TorusGeometry(7, 0.25, 8, 32), mat);
                ring.rotation.x = rx;
                glowGroup.add(ring);
            });
        } else if (iconType === '3d_bolt') {
            const shape = new THREE.Shape();
            shape.moveTo(0, 8); shape.lineTo(4, 0); shape.lineTo(2, 0);
            shape.lineTo(3, -8); shape.lineTo(-2, 0); shape.lineTo(1, 0); shape.lineTo(0, 8);
            geo = new THREE.ExtrudeGeometry(shape, { depth: 2, bevelEnabled: false });
        } else if (iconType === '3d_gem') {
            geo = new THREE.OctahedronGeometry(6);
        } else if (iconType === '3d_shield') {
            geo = new THREE.BoxGeometry(8, 10, 2.5);
        } else if (iconType === '3d_pyramid') {
            geo = new THREE.ConeGeometry(6, 10, 4);
        } else {
            geo = new THREE.OctahedronGeometry(5);
        }

        if (geo) glowGroup.add(new THREE.Mesh(geo, mat));
        this.icon3d = glowGroup;
        this.icon3d.position.set(pos.x, 52, pos.z);
        this.scene.add(this.icon3d);
    }

    createFlagTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 768;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 512, 768);

        // Background plate
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(30, 540, 452, 180);

        // Clan name
        ctx.font = '900 100px "Rajdhani", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 8;
        ctx.fillText(this.label.toUpperCase(), 256, 630);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    update(time) {
        if (this.uniforms) this.uniforms.time.value = time;
        if (this.mesh) {
            this.mesh.position.y = 28 + Math.sin(time * 1.2) * 3;
        }
        if (this.icon3d) {
            this.icon3d.rotation.y = time * 1.5;
        }
    }
}
