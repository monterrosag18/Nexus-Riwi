const THREE = window.THREE;

/**
 * SpaceBackground — multi-layer realistic space environment
 *
 * Layers (back → front):
 *  1. Equirectangular star-photo sphere  (8k_stars.jpg from project assets)
 *  2. GLSL volumetric nebula sphere      (FBM noise — purple/teal/gold clouds)
 *  3. Milky Way band                     (gradient arc across the sky)
 *  4. Point-cloud stars                  (large bright + small dim, additive)
 *  5. Slow rotation                      (the whole group drifts imperceptibly)
 */
export class SpaceBackground {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        scene.add(this.group);
        this._init();
    }

    _init() {
        this._addStarPhoto();
        this._addNebula();
        this._addMilkyWayBand();
        this._addStarPoints();
    }

    // ── Layer 1: high-res photo sphere ──────────────────────────────────
    _addStarPhoto() {
        const loader = new THREE.TextureLoader();
        loader.load(
            'assets/8k_stars.jpg',
            (tex) => {
                tex.mapping = THREE.EquirectangularReflectionMapping;
                const geo  = new THREE.SphereGeometry(8000, 64, 64);
                const mat  = new THREE.MeshBasicMaterial({
                    map:  tex,
                    side: THREE.BackSide
                });
                this.group.add(new THREE.Mesh(geo, mat));
            }
        );
    }

    // ── Layer 2: volumetric GLSL nebula ──────────────────────────────────
    _addNebula() {
        const mat = new THREE.ShaderMaterial({
            uniforms: { uTime: { value: 0 } },
            side: THREE.BackSide,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,

            vertexShader: `
                varying vec3 vWorldDir;
                void main() {
                    // Pass the direction vector to fragment shader
                    vWorldDir = normalize((modelMatrix * vec4(position, 0.0)).xyz);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,

            fragmentShader: `
                uniform float uTime;
                varying vec3  vWorldDir;

                // Hash & FBM (Fractional Brownian Motion) for volumetric nebula
                float hash(float n) { return fract(sin(n) * 43758.5453123); }

                float noise(vec3 p) {
                    vec3 i = floor(p);
                    vec3 f = fract(p);
                    f = f * f * (3.0 - 2.0 * f);
                    float n = i.x + i.y * 57.0 + i.z * 113.0;
                    return mix(
                        mix(mix(hash(n),       hash(n+1.0),   f.x),
                            mix(hash(n+57.0),  hash(n+58.0),  f.x), f.y),
                        mix(mix(hash(n+113.0), hash(n+114.0), f.x),
                            mix(hash(n+170.0), hash(n+171.0), f.x), f.y),
                        f.z
                    );
                }

                // 6-octave FBM — gives the wispy cloud look
                float fbm(vec3 p) {
                    float v = 0.0, a = 0.5;
                    vec3  shift = vec3(100.0);
                    for (int i = 0; i < 6; i++) {
                        v += a * noise(p);
                        p  = p * 2.0 + shift;
                        a *= 0.5;
                    }
                    return v;
                }

                void main() {
                    vec3 dir = normalize(vWorldDir);

                    // Slow drift
                    float t = uTime * 0.015;

                    // Primary nebula cloud — purple / violet lobe
                    vec3  pA = dir * 3.5 + vec3(t, t * 0.4, 0.0);
                    float nA = fbm(pA);
                    nA = smoothstep(0.40, 0.72, nA);
                    vec3  colorA = vec3(0.28, 0.05, 0.55) * nA; // deep purple

                    // Secondary — teal / cyan lobe (shifted sample)
                    vec3  pB = dir * 2.8 + vec3(-t * 0.7, 0.5, t * 0.3);
                    float nB = fbm(pB);
                    nB = smoothstep(0.42, 0.70, nB);
                    vec3  colorB = vec3(0.0, 0.35, 0.55) * nB; // deep teal

                    // Tertiary — warm gold / amber accent
                    vec3  pC = dir * 4.2 + vec3(0.3, -t * 0.5, t * 0.6);
                    float nC = fbm(pC);
                    nC = smoothstep(0.48, 0.75, nC);
                    vec3  colorC = vec3(0.55, 0.35, 0.0) * nC; // ochre/gold

                    // Mix all lobes — additive so they layer without masking stars
                    vec3  nebula = colorA + colorB + colorC;

                    // Soften overall opacity so stars show through
                    float alpha = clamp(length(nebula) * 1.4, 0.0, 0.65);

                    gl_FragColor = vec4(nebula, alpha);
                }
            `
        });

        const geo = new THREE.SphereGeometry(7500, 64, 64);
        this._nebulaMesh = new THREE.Mesh(geo, mat);
        this.group.add(this._nebulaMesh);
    }

    // ── Layer 3: Milky Way band (canvas gradient arc) ────────────────────
    _addMilkyWayBand() {
        const W = 2048, H = 512;
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d');

        // Transparent base
        ctx.clearRect(0, 0, W, H);

        // Glowing diagonal band
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0,    'rgba(0,0,0,0)');
        grad.addColorStop(0.20, 'rgba(120,110,180,0.04)');
        grad.addColorStop(0.38, 'rgba(200,195,240,0.12)');
        grad.addColorStop(0.50, 'rgba(220,215,255,0.18)');
        grad.addColorStop(0.62, 'rgba(200,195,240,0.12)');
        grad.addColorStop(0.80, 'rgba(120,110,180,0.04)');
        grad.addColorStop(1,    'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Micro-stars inside the band
        for (let i = 0; i < 4000; i++) {
            const sx = Math.random() * W;
            const sy = H * 0.3 + Math.random() * H * 0.4;
            const r  = Math.random() * 0.9 + 0.1;
            ctx.beginPath();
            ctx.arc(sx, sy, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${(Math.random() * 0.6 + 0.1).toFixed(2)})`;
            ctx.fill();
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;

        // Map onto a wide flat torus slice
        const geo = new THREE.TorusGeometry(6000, 800, 2, 128);
        const mat = new THREE.MeshBasicMaterial({
            map: tex,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        const band = new THREE.Mesh(geo, mat);
        band.rotation.x = Math.PI / 3.5; // tilt like a real band
        this.group.add(band);
    }

    // ── Layer 4: Star point clouds ────────────────────────────────────────
    _addStarPoints() {
        // Dim distant stars
        const dimPts = [];
        for (let i = 0; i < 18000; i++) {
            const th = Math.random() * Math.PI * 2;
            const ph = Math.acos(2 * Math.random() - 1);
            const r  = 3000 + Math.random() * 3500;
            dimPts.push(
                r * Math.sin(ph) * Math.cos(th),
                r * Math.sin(ph) * Math.sin(th),
                r * Math.cos(ph)
            );
        }
        const dimGeo = new THREE.BufferGeometry();
        dimGeo.setAttribute('position', new THREE.Float32BufferAttribute(dimPts, 3));
        this.group.add(new THREE.Points(dimGeo, new THREE.PointsMaterial({
            color: 0xddeeff, size: 1.2, sizeAttenuation: true,
            transparent: true, opacity: 0.7
        })));

        // Bright featured stars (blue-white glow)
        const brightPts = [];
        for (let i = 0; i < 2000; i++) {
            const th = Math.random() * Math.PI * 2;
            const ph = Math.acos(2 * Math.random() - 1);
            const r  = 2000 + Math.random() * 4000;
            brightPts.push(
                r * Math.sin(ph) * Math.cos(th),
                r * Math.sin(ph) * Math.sin(th),
                r * Math.cos(ph)
            );
        }
        const brightGeo = new THREE.BufferGeometry();
        brightGeo.setAttribute('position', new THREE.Float32BufferAttribute(brightPts, 3));
        this._brightStars = new THREE.Points(brightGeo, new THREE.PointsMaterial({
            color: 0xaaddff, size: 3.5, sizeAttenuation: true,
            transparent: true, opacity: 0.8,
            blending: THREE.AdditiveBlending, depthWrite: false
        }));
        this.group.add(this._brightStars);
    }

    update(camera) {
        // Keep background centred on camera (parallax-free)
        this.group.position.copy(camera.position);

        // Very slow universe rotation (cinematic drift)
        this.group.rotation.y += 0.00008;

        // Animate nebula
        if (this._nebulaMesh) {
            this._nebulaMesh.material.uniforms.uTime.value += 0.016;
        }

        // Twinkle
        if (this._brightStars) {
            this._brightStars.material.opacity = 0.6 + Math.sin(Date.now() * 0.001) * 0.2;
        }
    }
}
