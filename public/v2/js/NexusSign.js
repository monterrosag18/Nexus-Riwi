const THREE = window.THREE;

/**
 * NexusSign — Cinematic Holographic Signage for the Nexus Core.
 * Features 'NEXUS' (top) and 'CAMPEÓN' (bottom) with scanning/glitch effects.
 */

export class NexusSign {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.uniforms = {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color('#00f3ff') },
            uGlitch: { value: 0.0 }
        };

        this._init();
    }

    _init() {
        // ── 1. NEXUS (TOP) ────────────────────────────────────────────────
        const nexusTex = this._createTextTexture('NEXUS', 512, 128, 90, '#00f3ff', true);
        this.nexusSign = this._createHologramPlane(nexusTex, 400, 100);
        this.nexusSign.position.y = 480; // Above Nexus Core
        this.group.add(this.nexusSign);

        // ── 2. DECORATIVE ENERGY BEAMS ────────────────────────────────────
        this._addSupportBeams();
    }

    _createTextTexture(text, width, height, fontSize, color, glow) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Font & Style
        ctx.font = `900 ${fontSize}px Rajdhani`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // High Quality Glow
        if (glow) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 25;
        }

        // Main Text
        ctx.fillStyle = color;
        ctx.fillText(text, width / 2, height / 2);

        // Scanning Line Detail on Texture
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < height; i += 4) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }

        return new THREE.CanvasTexture(canvas);
    }

    _createHologramPlane(texture, width, height) {
        const geo = new THREE.PlaneGeometry(width, height);
        const mat = new THREE.ShaderMaterial({
            uniforms: {
                ...this.uniforms,
                uMap: { value: texture }
            },
            vertexShader: `
                varying vec2 vUv;
                uniform float uGlitch;
                uniform float uTime;
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    
                    // Subtle Glitch Shift
                    if (fract(uTime * 10.0) < 0.1 && fract(uTime * 3.4) > 0.8) {
                        pos.x += sin(vUv.y * 50.0) * 8.0;
                    }

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D uMap;
                uniform float uTime;
                varying vec2 vUv;
                void main() {
                    vec2 uv = vUv;
                    
                    // Moving Scanlines
                    float scanline = sin(uv.y * 300.0 - uTime * 60.0) * 0.15;
                    
                    // Vignette/Fading transparency
                    float alpha = texture2D(uMap, uv).a;
                    alpha *= (0.8 + scanline);
                    
                    // Flickering
                    float flicker = fract(uTime * 1.5) > 0.02 ? 1.0 : 0.4;
                    
                    vec4 texColor = texture2D(uMap, uv);
                    gl_FragColor = texColor * flicker;
                    gl_FragColor.a *= alpha;
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        return new THREE.Mesh(geo, mat);
    }

    _addSupportBeams() {
        const geo = new THREE.CylinderGeometry(1, 1, 1000, 8);
        const mat = new THREE.MeshBasicMaterial({ color: '#00f3ff', transparent: true, opacity: 0.15 });
        
        const beamL = new THREE.Mesh(geo, mat);
        beamL.position.set(-200, 0, -20);
        this.group.add(beamL);

        const beamR = beamL.clone();
        beamR.position.x = 200;
        this.group.add(beamR);
    }

    update(time) {
        this.uniforms.uTime.value = time;
        
        // Random glitch frequency
        if (Math.random() > 0.98) {
            this.uniforms.uGlitch.value = Math.random();
        } else {
            this.uniforms.uGlitch.value *= 0.9;
        }

        // Billboarding
        if (this.camera) {
            this.nexusSign.lookAt(this.camera.position);
        }
    }
}
