const THREE = window.THREE;

/**
 * ClanStandard — premium 3D holographic clan banner
 *
 * Architecture:
 *  1. Metal pole (beveled cylinder + decorative tip spire + base pedestal)
 *  2. Waving ShaderMaterial flag with multi-octave GLSL noise displacement,
 *     Fresnel edge glow, scanlines, and a canvas‑drawn texture per clan
 *  3. Floating 3D clan icon above the flag (unique shape per clan)
 *  4. Base ring + glowing emitter cone
 *  5. Vertical energy beam (AdditiveBlending)
 */

const CLAN_ICON_TYPE = {
    turing:   'atom',
    tesla:    'bolt',
    mccarthy: 'gem',
    hamilton: 'pyramid',
    thompson: 'shield',
};

export class ClanStandard {
    constructor(scene, name, colorHex, position) {
        this.scene    = scene;
        this.name     = name;
        this.colorHex = colorHex;
        this.color    = new THREE.Color(colorHex);
        this.pos      = new THREE.Vector3(position.x, 0, position.z);

        this.flagUniforms = null;
        this.icon3d       = null;
        this.group        = new THREE.Group();
        this.group.position.copy(this.pos);
        this.scene.add(this.group);

        this._build();
    }

    _build() {
        this._buildPole();
        this._buildFlag();
        this._buildIcon();
        this._buildBase();
        this._buildBeam();
    }

    // ── 1. DECORATIVE METAL POLE ──────────────────────────────────────────
    _buildPole() {
        const metalMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            metalness: 0.95,
            roughness: 0.05,
            emissive: this.colorHex,
            emissiveIntensity: 0.08
        });

        // Main pole
        const poleGeo = new THREE.CylinderGeometry(0.8, 1.2, 70, 12);
        const pole = new THREE.Mesh(poleGeo, metalMat);
        pole.position.y = 35;
        this.group.add(pole);

        // Decorative bands
        [15, 30, 45].forEach(y => {
            const bandGeo = new THREE.TorusGeometry(1.6, 0.4, 8, 24);
            const bandMat = new THREE.MeshStandardMaterial({
                color: this.colorHex,
                emissive: this.colorHex,
                emissiveIntensity: 0.6,
                metalness: 0.9, roughness: 0.1
            });
            const band = new THREE.Mesh(bandGeo, bandMat);
            band.rotation.x = Math.PI / 2;
            band.position.y = y;
            this.group.add(band);
        });

        // Spire tip
        const spireGeo = new THREE.ConeGeometry(1.5, 14, 8);
        const spireMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: this.colorHex,
            emissiveIntensity: 1.2,
            metalness: 0.8, roughness: 0.1
        });
        const spire = new THREE.Mesh(spireGeo, spireMat);
        spire.position.y = 77;
        this.group.add(spire);

        // Crossbar (top horizontal bar)
        const barGeo = new THREE.CylinderGeometry(0.5, 0.5, 34, 8);
        const bar = new THREE.Mesh(barGeo, metalMat);
        bar.rotation.z = Math.PI / 2;
        bar.position.set(17, 62, 0);
        this.group.add(bar);
    }

    // ── 2. WAVING FLAG (multi-octave noise GLSL) ─────────────────────────
    _buildFlag() {
        const flagGeo = new THREE.PlaneGeometry(32, 20, 32, 20);

        this.flagUniforms = {
            uTime:    { value: 0 },
            uColor:   { value: this.color.clone() },
            uTex:     { value: this._buildFlagTexture() }
        };

        const flagMat = new THREE.ShaderMaterial({
            uniforms: this.flagUniforms,
            vertexShader: `
                uniform float uTime;
                varying vec2  vUv;
                varying float vFresnelFactor;
                varying float vWave;

                // Simplex-like 2D noise approximation
                float hash(vec2 p) {
                    p = fract(p * vec2(127.1, 311.7));
                    p += dot(p, p + 19.19);
                    return fract(p.x * p.y);
                }
                float noise(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    f = f * f * (3.0 - 2.0 * f); // smooth
                    return mix(
                        mix(hash(i), hash(i + vec2(1,0)), f.x),
                        mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
                        f.y
                    );
                }

                void main() {
                    vUv = uv;

                    // Wave displaces along Z; intensity grows toward free end (high U)
                    float windFactor = uv.x; 
                    float n1 = noise(vec2(uv.x * 3.0 + uTime * 1.5, uv.y * 2.0 + uTime * 0.8));
                    float n2 = noise(vec2(uv.x * 6.0 - uTime * 2.0, uv.y * 4.0));
                    float wave = (n1 * 0.7 + n2 * 0.3) * windFactor * 6.0;

                    vWave = wave;

                    // Fake Fresnel: angle-based edge highlight
                    vec3 worldNormal = normalize(normalMatrix * normal);
                    vFresnelFactor = 1.0 - abs(dot(worldNormal, vec3(0.0, 0.0, 1.0)));

                    vec3 displaced = position;
                    displaced.z += wave;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3      uColor;
                uniform float     uTime;
                uniform sampler2D uTex;
                varying vec2      vUv;
                varying float     vFresnelFactor;
                varying float     vWave;

                void main() {
                    vec4 texSample = texture2D(uTex, vUv);

                    // Base hologram gradient
                    vec3 baseColor = uColor;

                    // Scanlines — horizontal bars
                    float scan = sin(vUv.y * 180.0 + uTime * 4.0) * 0.04 + 0.96;

                    // Edge fade (prevent hard square outline)
                    float edgeX = smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x);
                    float edgeY = smoothstep(0.0, 0.05, vUv.y) * smoothstep(1.0, 0.95, vUv.y);
                    float edge  = edgeX * edgeY;

                    // Mix texture colour with clan colour
                    vec3 finalColor = mix(baseColor, texSample.rgb, texSample.a * 0.9);

                    // Fresnel shimmer
                    finalColor += uColor * vFresnelFactor * 0.35;

                    // Wave highlight
                    finalColor += vec3(vWave * 0.04);

                    finalColor *= scan;

                    // Alpha: semi-transparent flag with full-alpha text areas
                    float alpha = (0.3 + texSample.a * 0.65) * edge;

                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.NormalBlending
        });

        const flag = new THREE.Mesh(flagGeo, flagMat);
        // Offset so the left edge aligns with the pole
        flag.position.set(17, 52, 1.5);
        this.group.add(flag);
    }

    // ── 3. 3D CLAN ICON (unique geometry per clan) ────────────────────────
    _buildIcon() {
        const iconKey  = this.name.toLowerCase();
        const iconType = CLAN_ICON_TYPE[iconKey] || 'gem';
        const matIcon  = new THREE.MeshStandardMaterial({
            color: this.colorHex,
            emissive: this.colorHex,
            emissiveIntensity: 0.8,
            metalness: 0.7,
            roughness: 0.2
        });

        const iconGroup = new THREE.Group();

        switch (iconType) {
            case 'atom': {
                const core = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 16), matIcon);
                iconGroup.add(core);
                // 3 orbital rings
                [0, Math.PI / 3, -Math.PI / 3].forEach(rx => {
                    const rGeo = new THREE.TorusGeometry(8, 0.5, 8, 32);
                    const ring = new THREE.Mesh(rGeo, matIcon);
                    ring.rotation.x = rx;
                    iconGroup.add(ring);
                });
                break;
            }
            case 'bolt': {
                const shape = new THREE.Shape();
                shape.moveTo(0, 10); shape.lineTo(5, 0); shape.lineTo(2, 0);
                shape.lineTo(4, -10); shape.lineTo(-2, 0); shape.lineTo(1, 0);
                shape.closePath();
                const boltGeo = new THREE.ExtrudeGeometry(shape, { depth: 2.5, bevelEnabled: true, bevelSize: 0.4, bevelThickness: 0.4 });
                boltGeo.center();
                iconGroup.add(new THREE.Mesh(boltGeo, matIcon));
                break;
            }
            case 'gem': {
                const gem = new THREE.Mesh(new THREE.OctahedronGeometry(7, 0), matIcon);
                iconGroup.add(gem);
                break;
            }
            case 'pyramid': {
                const pyr = new THREE.Mesh(new THREE.ConeGeometry(7, 12, 4, 1), matIcon);
                iconGroup.add(pyr);
                break;
            }
            case 'shield': {
                // Shield = box with rounded top approximation
                const sh = new THREE.Mesh(new THREE.BoxGeometry(10, 13, 3), matIcon);
                iconGroup.add(sh);
                const top = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 3, 16, 1, false, 0, Math.PI), matIcon);
                top.rotation.z = -Math.PI / 2;
                top.position.y = 7.5;
                iconGroup.add(top);
                break;
            }
        }

        iconGroup.position.y = 86;
        this.icon3d = iconGroup;
        this.group.add(iconGroup);
    }

    // ── 4. BASE PLATFORM + GLOW RING ─────────────────────────────────────
    _buildBase() {
        // Hexagonal pedestal
        const platGeo = new THREE.CylinderGeometry(18, 22, 3, 6);
        const platMat = new THREE.MeshStandardMaterial({
            color: 0x0d0d1a,
            metalness: 0.95,
            roughness: 0.1,
            emissive: this.colorHex,
            emissiveIntensity: 0.05
        });
        const plat = new THREE.Mesh(platGeo, platMat);
        plat.position.y = 1.5;
        this.group.add(plat);

        // Glowing toroidal ring on platform surface
        const ringGeo = new THREE.TorusGeometry(15, 0.8, 16, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: this.colorHex,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 3.2;
        this.group.add(ring);

        // 8 pillar teeth around the platform
        const toothGeo = new THREE.BoxGeometry(2.5, 6, 2.5);
        const toothMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e, metalness: 0.9, roughness: 0.15
        });
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            const t = new THREE.Mesh(toothGeo, toothMat);
            t.position.set(Math.cos(a) * 19, 3, Math.sin(a) * 19);
            this.group.add(t);
        }

        // Small point light at base for local colour cast
        const ptLight = new THREE.PointLight(this.colorHex, 2.5, 120);
        ptLight.position.y = 10;
        this.group.add(ptLight);
    }

    // ── 5. ENERGY BEAM (vertical AdditiveBlending cone) ───────────────────
    _buildBeam() {
        const beamGeo = new THREE.CylinderGeometry(0.2, 16, 160, 32, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
            color: this.colorHex,
            transparent: true,
            opacity: 0.07,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.y = 80;
        this.group.add(beam);
    }

    // ── CANVAS FLAG TEXTURE ───────────────────────────────────────────────
    _buildFlagTexture() {
        const W = 512, H = 320;
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d');

        const hex = '#' + this.color.getHexString();

        // Background — dark with clan colour tint
        const bgGrad = ctx.createLinearGradient(0, 0, W, 0);
        bgGrad.addColorStop(0, 'rgba(0,0,0,0)');
        bgGrad.addColorStop(0.15, hex + 'aa');
        bgGrad.addColorStop(0.85, hex + 'dd');
        bgGrad.addColorStop(1, hex + 'ff');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // Dark inner panel
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(20, 20, W - 40, H - 40);

        // Decorative border
        ctx.strokeStyle = hex;
        ctx.lineWidth = 3;
        ctx.shadowColor = hex;
        ctx.shadowBlur = 12;
        ctx.strokeRect(12, 12, W - 24, H - 24);
        ctx.shadowBlur = 0;

        // Corner accents
        [[12,12],[W-12,12],[12,H-12],[W-12,H-12]].forEach(([cx, cy]) => {
            ctx.beginPath();
            ctx.arc(cx, cy, 8, 0, Math.PI * 2);
            ctx.fillStyle = hex;
            ctx.fill();
        });

        // Top label — "NEXUS"
        ctx.font = '700 22px "Rajdhani", "Orbitron", monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'center';
        ctx.fillText('◆ NEXUS ALLIANCE ◆', W / 2, 52);

        // Divider line
        ctx.beginPath();
        ctx.moveTo(40, 65); ctx.lineTo(W - 40, 65);
        ctx.strokeStyle = hex + 'aa';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Clan name — large centred
        ctx.font = '900 78px "Rajdhani", "Orbitron", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = hex;
        ctx.shadowBlur = 25;
        ctx.textAlign = 'center';
        ctx.fillText(this.name.toUpperCase(), W / 2, H / 2 + 10);

        // Bottom subtitle
        ctx.font = '600 20px "Rajdhani", monospace';
        ctx.fillStyle = hex;
        ctx.shadowBlur = 8;
        ctx.fillText('[ CLAN TERRITORY ]', W / 2, H - 35);
        ctx.shadowBlur = 0;

        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }

    update(time) {
        // Animate flag shader
        if (this.flagUniforms) {
            this.flagUniforms.uTime.value = time;
        }

        // Rotate icon slowly
        if (this.icon3d) {
            this.icon3d.rotation.y = time * 1.2;
            // Gentle bob
            this.icon3d.position.y = 86 + Math.sin(time * 1.5) * 3;
        }
    }
}
