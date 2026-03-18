const THREE = window.THREE;

export class InfiniteGrid {
    constructor(scene) {
        this.scene = scene;
        this.count = 500; // Large number of hexes for the "Infinity" look
        this.mesh = null;
        
        this.init();
    }

    init() {
        // 1. HEXAGON GEOMETRY (Optimized 4-triangle version)
        const shape = new THREE.Shape();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * 10;
            const y = Math.sin(angle) * 10;
            if (i === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
        }
        const geometry = new THREE.ShapeGeometry(shape);
        geometry.rotateX(-Math.PI / 2); // Lay flat

        // 2. CUSTOM SHADER MATERIAL (The Glow)
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                uColor: { value: new THREE.Color(0x00f3ff) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float time;
                uniform vec3 uColor;
                void main() {
                    // Calculate distance from center [0.5, 0.5]
                    float d = length(vUv - 0.5) * 2.0;
                    
                    // EDGE GLOW
                    float edge = smoothstep(0.85, 1.0, d);
                    
                    // PULSE
                    float pulse = sin(time * 2.0) * 0.1 + 0.9;
                    
                    vec3 color = uColor * edge * pulse;
                    gl_FragColor = vec4(color, edge > 0.1 ? 0.6 : 0.1);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        // 3. INSTANCED MESH
        this.mesh = new THREE.InstancedMesh(geometry, material, this.count);
        
        const matrix = new THREE.Matrix4();
        const hexSpacing = 18;
        let idx = 0;
        
        // Arrange in a large hex grid pattern
        const size = Math.floor(Math.sqrt(this.count));
        for (let q = -size; q <= size; q++) {
            for (let r = -size; r <= size; r++) {
                if (idx >= this.count) break;
                
                const x = hexSpacing * (q + r/2);
                const z = hexSpacing * (Math.sqrt(3)/2) * r;
                
                matrix.setPosition(x, 0, z);
                this.mesh.setMatrixAt(idx, matrix);
                idx++;
            }
        }

        this.scene.add(this.mesh);
    }

    update(time) {
        if (this.mesh) {
            this.mesh.material.uniforms.time.value = time;
        }
    }
}
