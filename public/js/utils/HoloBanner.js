// REMOVED IMPORT: Using global THREE from index.html to avoid instance conflicts
// import * as THREE from '...';

export class HoloBanner {
    constructor(scene, position, color, label, iconChar) {
        this.scene = scene;
        this.position = position;
        this.color = new THREE.Color(color);
        this.label = label || "NEXUS";
        this.iconChar = (iconChar || "\uf007").toString().trim(); 
        
        // --- FAIL-SAFE: Official Clans MUST use 3D Icons ---
        const officialClans = {
            'turing': '3d_atom',
            'tesla': '3d_bolt',
            'mccarthy': '3d_gem',
            'thompson': '3d_shield',
            'hamilton': '3d_pyramid'
        };
        const lowerLabel = this.label.toLowerCase();
        if (!this.iconChar.toLowerCase().startsWith('3d_') && officialClans[lowerLabel]) {
            this.iconChar = officialClans[lowerLabel];
            console.log(`[HoloBanner] Fail-safe active for ${this.label}: forced icon ${this.iconChar}`);
        }

        this.mesh = null;
        this.icon3d = null; // New property for 3D Geometry Icons
        this.uniforms = null;
        this.standGroup = null; // Pivot for stand and 3D icons

        console.log(`[HoloBanner] Init: ${label} | Icon: ${this.iconChar}`);
        this.init();
    }

    init() {
        // --- 1. GEOMETRY (The Flag) ---
        // High segment count for smooth waving
        const geometry = new THREE.PlaneGeometry(15, 25, 20, 20);

        // --- 2. SHADER MATERIAL (The Magic) ---
        this.uniforms = {
            time: { value: 0 },
            color: { value: this.color },
            textureMap: { value: this.createIconTexture() } // Procedural Icon Texture
        };

        const material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: `
                uniform float time;
                varying vec2 vUv;
                varying float vWave;

                void main() {
                    vUv = uv;

                    // WAVE LOGIC - Vertical Flag
                    vec3 pos = position;
                    
                    // Wave intensity increases towards bottom (UV.y = 0)
                    float waveIntensity = (1.0 - vUv.y) * 2.0; 
                    
                    // Main Wave
                    float wave = sin(pos.y * 0.2 + time * 3.0) * waveIntensity;
                    // Secondary Ripple
                    float ripple = sin(pos.x * 0.5 + time * 5.0) * (waveIntensity * 0.5);

                    pos.z += wave + ripple;

                    vWave = wave; // Pass to frag for lighting

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform float time;
                uniform sampler2D textureMap;
                varying vec2 vUv;
                varying float vWave;

                void main() {
                    // 1. Base Hologram Color
                    vec3 baseColor = color;
                    
                    // 2. Sample Icon Texture
                    vec4 texColor = texture2D(textureMap, vUv);
                    
                    // Luminance logic: 
                    // texColor.rgb near white (1.0) -> Bright Highlight
                    // texColor.rgb near black (0.0) -> Dark Contrast Plate
                    float lum = (texColor.r + texColor.g + texColor.b) / 3.0;
                    float iconAlpha = texColor.a;
                    
                    // 3. Effects
                    float alphaBase = 0.20; // Lowered further for subtler look
                    
                    // Scanlines
                    float scan = sin(vUv.y * 300.0 + time * 5.0) * 0.08;
                    
                    // Technology Edge Fade
                    float edge = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
                    
                    // Highlight peaks of wave
                    float highlight = vWave * 0.15;

                    // MIXING
                    vec3 finalColor = color;
                    if (iconAlpha > 0.01) {
                        if (lum > 0.4) {
                            // Text/Icon: Bright White Glow
                            finalColor = mix(finalColor, vec4(1.0, 1.0, 1.0, 1.0).rgb, iconAlpha * 0.9);
                        } else {
                            // Dark Plate: Deep Contrast
                            finalColor = mix(finalColor, vec3(0.0), iconAlpha * 0.7);
                        }
                    }
                    
                    finalColor += vec3(scan + highlight);
                    
                    // Boost alpha where text/plate is
                    float finalAlpha = alphaBase + (iconAlpha * 0.5);
                    
                    // Bottom fade out
                    float fade = smoothstep(0.0, 0.2, vUv.y);
                    
                    gl_FragColor = vec4(finalColor, (finalAlpha * edge * fade));
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false, // For hologram transparency overlap
            blending: THREE.NormalBlending
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.position.y += 15; // Lift up so bottom isn't in floor

        // Add to Scene
        this.scene.add(this.mesh);

        // --- 2.5 REAL 3D ICON (Optional Highlight) ---
        const is3D = this.iconChar.toLowerCase().startsWith('3d_');
        if (is3D) {
            this.create3DIcon();
        }

        // --- 3. THE STAND (POLE) ---
        this.createStand();
    }

    create3DIcon() {
        let geometry;
        const mat = new THREE.MeshBasicMaterial({ 
            color: this.color, 
            transparent: true,
            opacity: 0.9
        });
        
        // Emissive-like glow group
        const glowGroup = new THREE.Group();

        if (this.iconChar === '3d_shield') {
            geometry = new THREE.BoxGeometry(6, 8, 2); // Bigger
        } else if (this.iconChar === '3d_pyramid') {
            geometry = new THREE.ConeGeometry(5, 8, 4); // Square base pyramid
        } else if (this.iconChar === '3d_gem') {
            geometry = new THREE.OctahedronGeometry(5); // Bigger
        } else if (this.iconChar === '3d_atom') {
            geometry = new THREE.SphereGeometry(2.5, 16, 16);
            // Add Rings for Atom
            const ringGeo = new THREE.TorusGeometry(5.5, 0.2, 8, 32);
            const ring1 = new THREE.Mesh(ringGeo, mat);
            const ring2 = new THREE.Mesh(ringGeo, mat);
            ring2.rotation.x = Math.PI / 2;
            glowGroup.add(new THREE.Mesh(geometry, mat));
            glowGroup.add(ring1);
            glowGroup.add(ring2);
            this.icon3d = glowGroup;
        } else if (this.iconChar === '3d_bolt') {
            const shape = new THREE.Shape();
            shape.moveTo(0, 6);
            shape.lineTo(3, 0);
            shape.lineTo(1, 0);
            shape.lineTo(2, -6);
            shape.lineTo(-1, 0);
            shape.lineTo(1, 0);
            shape.lineTo(0, 6);
            geometry = new THREE.ExtrudeGeometry(shape, { depth: 1.5, bevelEnabled: false });
            this.icon3d = new THREE.Mesh(geometry, mat);
        }

        if (!this.icon3d && geometry) {
            this.icon3d = new THREE.Mesh(geometry, mat);
        }

        if (this.icon3d) {
            // Adjust position relative to local center
            this.icon3d.position.set(0, 38, 0); 
            if (this.standGroup) {
                this.standGroup.add(this.icon3d);
            } else {
                this.icon3d.position.add(this.position);
                this.scene.add(this.icon3d);
            }
            
            // Add a point light to the icon itself - Lowered intensity further (0.8 -> 0.4)
            const light = new THREE.PointLight(this.color, 0.4, 30);
            this.icon3d.add(light);
            console.log(`[HoloBanner] 3D Icon Attached: ${this.iconChar}`);
        }
    }

    createStand() {
        this.standGroup = new THREE.Group();
        this.standGroup.position.copy(this.position);

        // Crossbar (Top)
        const barGeo = new THREE.BoxGeometry(16, 0.5, 1);
        const barMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.1 });
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.position.y = 27.5; // Top of banner (15 base + 12.5 half height)
        this.standGroup.add(bar);

        // Vertical Poles (Frame)
        const poleGeo = new THREE.CylinderGeometry(0.3, 0.3, 30, 8);

        const pole1 = new THREE.Mesh(poleGeo, barMat);
        pole1.position.set(-8, 15, 0);
        this.standGroup.add(pole1);

        const pole2 = new THREE.Mesh(poleGeo, barMat);
        pole2.position.set(8, 15, 0);
        this.standGroup.add(pole2);

        // Base
        const baseGeo = new THREE.CylinderGeometry(3, 5, 2, 16);
        const baseMesh = new THREE.Mesh(baseGeo, barMat);
        baseMesh.position.y = 1;
        this.standGroup.add(baseMesh);

        // Clan Light Hologram Emitter
        const emitterGeo = new THREE.ConeGeometry(2, 4, 32, 1, true);
        const emitterMat = new THREE.MeshBasicMaterial({ color: this.color, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
        const emitter = new THREE.Mesh(emitterGeo, emitterMat);
        emitter.position.y = 3;
        emitter.rotation.x = Math.PI; // Point up
        emitter.material.opacity = 0.3; // Lowered emitter opacity (0.5 -> 0.3)
        this.standGroup.add(emitter);

        this.scene.add(this.standGroup);
    }

    createIconTexture() {
        // Create a canvas to draw the FontAwesome icon
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 1024; // Tall aspect ratio for flag
        const ctx = canvas.getContext('2d');

        // 1. Clear
        ctx.clearRect(0, 0, 512, 1024);

        // 2. Setup Font - FontAwesome is loaded in index.html, so '900 200px "Font Awesome 6 Free"' should work
        // Note: We need to use valid unicode chars or ensure the font is ready. 
        // We will assume the unicode string is passed.
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw Icon (Centered in top half)
        const is3D = this.iconChar.toLowerCase().startsWith('3d_');
        if (!is3D) {
            ctx.font = '900 300px "Font Awesome 6 Free"';
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 10;
            ctx.fillText(this.iconChar, 256, 400);
        }

        // Draw Label (Below icon) - Enhanced Visibility
        const labelY = 750;
        
        ctx.shadowBlur = 0; // Disable shadow for background plate
        
        // Background plate for text contrast (Darker for the shader to interpret correctly)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'; 
        ctx.fillRect(40, labelY - 75, 432, 150);
        
        ctx.font = '900 110px "Rajdhani"'; 
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(this.label, 256, labelY + 10);

        // Create Texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    update(time) {
        if (this.uniforms) {
            this.uniforms.time.value = time;
        }
        if (this.icon3d) {
            this.icon3d.rotation.y = time * 2;
            if (this.iconChar === '3d_atom') {
                this.icon3d.rotation.z = time;
            }
        }
    }
}
