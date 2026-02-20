// REMOVED IMPORT: Using global THREE from index.html to avoid instance conflicts
// import * as THREE from '...';

export class HoloBanner {
    constructor(scene, position, color, label, iconChar) {
        this.scene = scene;
        this.position = position;
        this.color = new THREE.Color(color);
        this.label = label || "NEXUS";
        this.iconChar = iconChar || "\uf007"; // Default user icon if missing
        this.mesh = null;
        this.uniforms = null;

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
                    vec4 iconSample = texture2D(textureMap, vUv);
                    
                    // Icon is white on transparent background. 
                    // We want the icon to be brighter and white/tinted.
                    float iconStrength = iconSample.a; // Use alpha channel
                    
                    // 3. Effects
                    float alpha = 0.6;
                    
                    // Scanlines
                    float scan = sin(vUv.y * 300.0 + time * 5.0) * 0.1;
                    
                    // Hologram Edge Fade (Sides)
                    float edge = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
                    
                    // Tech Grid Pattern
                    float grid = step(0.95, fract(vUv.y * 10.0)) * 0.2;

                    // Highlight peaks of wave
                    float highlight = vWave * 0.2;

                    // MIXING
                    // If pixel is part of icon, make it white/bright. Else use base clan color.
                    vec3 finalColor = mix(baseColor, vec3(1.0, 1.0, 1.0), iconStrength * 0.8);
                    
                    // Add effects
                    finalColor += vec3(scan + grid + highlight);
                    
                    // Boost alpha where icon is
                    float finalAlpha = alpha + (iconStrength * 0.4);
                    
                    // Bottom fade out
                    float fade = smoothstep(0.0, 0.2, vUv.y);
                    
                    gl_FragColor = vec4(finalColor, (finalAlpha * edge * fade));
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false, // For hologram transparency overlap
            blending: THREE.AdditiveBlending
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.position.y += 15; // Lift up so bottom isn't in floor

        // Add to Scene
        this.scene.add(this.mesh);

        // --- 3. THE STAND (POLE) ---
        this.createStand();
    }

    createStand() {
        const group = new THREE.Group();
        group.position.copy(this.position);

        // Crossbar (Top)
        const barGeo = new THREE.BoxGeometry(16, 0.5, 1);
        const barMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.1 });
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.position.y = 27.5; // Top of banner (15 base + 12.5 half height)
        group.add(bar);

        // Vertical Poles (Frame)
        const poleGeo = new THREE.CylinderGeometry(0.3, 0.3, 30, 8);

        const pole1 = new THREE.Mesh(poleGeo, barMat);
        pole1.position.set(-8, 15, 0);
        group.add(pole1);

        const pole2 = new THREE.Mesh(poleGeo, barMat);
        pole2.position.set(8, 15, 0);
        group.add(pole2);

        // Base
        const baseGeo = new THREE.CylinderGeometry(3, 5, 2, 16);
        const baseMesh = new THREE.Mesh(baseGeo, barMat);
        baseMesh.position.y = 1;
        group.add(baseMesh);

        // Clan Light Hologram Emitter
        const emitterGeo = new THREE.ConeGeometry(2, 4, 32, 1, true);
        const emitterMat = new THREE.MeshBasicMaterial({ color: this.color, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
        const emitter = new THREE.Mesh(emitterGeo, emitterMat);
        emitter.position.y = 3;
        emitter.rotation.x = Math.PI; // Point up
        group.add(emitter);

        this.scene.add(group);
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

        // Glow Effect
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 20;

        // Draw Icon (Centered in top half)
        ctx.font = '900 300px "Font Awesome 6 Free"';
        ctx.fillText(this.iconChar, 256, 400);

        // Draw Label (Below icon)
        ctx.font = '700 80px "Rajdhani"';
        // Reset shadow for cleaner text
        ctx.shadowBlur = 10;
        ctx.fillText(this.label, 256, 700);

        // Create Texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    update(time) {
        if (this.uniforms) {
            this.uniforms.time.value = time;
        }
    }
}
