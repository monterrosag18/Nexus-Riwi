const THREE = window.THREE;

export class InfiniteGrid {
    constructor(scene) {
        this.scene = scene;
        this.count = 800; 
        this.mesh = null;
        this.territories = [
            { id: 1, color: new THREE.Color(0x00f3ff), center: new THREE.Vector3(-150, 0, 0) },   // Turing
            { id: 2, color: new THREE.Color(0xff0000), center: new THREE.Vector3(150, 0, -100) }, // Tesla
            { id: 3, color: new THREE.Color(0x00ff00), center: new THREE.Vector3(50, 0, 150) },  // McCarthy
            { id: 4, color: new THREE.Color(0xffff00), center: new THREE.Vector3(-100, 0, -150) },// Hamilton
            { id: 5, color: new THREE.Color(0xff00ff), center: new THREE.Vector3(200, 0, 100) }   // Lovelace
        ];
        
        this.init();
    }

    init() {
        const shape = new THREE.Shape();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * 8.5; // Slightly smaller hexes
            const y = Math.sin(angle) * 8.5;
            if (i === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
        }
        const geometry = new THREE.ShapeGeometry(shape);
        geometry.rotateX(-Math.PI / 2);

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                uTerritories: { value: this.territories.map(t => t.center) },
                uColors: { value: this.territories.map(t => t.color) }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vWorldPos;
                void main() {
                    vUv = uv;
                    vWorldPos = (instanceMatrix * vec4(position, 1.0)).xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                varying vec3 vWorldPos;
                uniform float time;
                uniform vec3 uTerritories[5];
                uniform vec3 uColors[5];

                void main() {
                    float d = length(vUv - 0.5) * 2.1;
                    float edge = smoothstep(0.85, 1.0, d);
                    
                    // Determine territory color based on proximity
                    vec3 finalColor = vec3(0.05, 0.05, 0.1); // Default dark
                    float minDist = 9999.0;
                    
                    for(int i = 0; i < 5; i++) {
                        float dist = distance(vWorldPos.xz, uTerritories[i].xz);
                        if(dist < 120.0) { // Territory radius
                            float influence = 1.0 - (dist / 120.0);
                            finalColor = mix(finalColor, uColors[i], influence * 0.4);
                        }
                    }

                    // Glow effect
                    float pulse = sin(time * 1.5) * 0.1 + 0.9;
                    vec3 glow = finalColor * (1.0 + edge * 2.0) * pulse;
                    
                    gl_FragColor = vec4(glow, edge > 0.1 ? 0.7 : 0.2);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.mesh = new THREE.InstancedMesh(geometry, material, this.count);
        const matrix = new THREE.Matrix4();
        const hexSpacing = 16;
        let idx = 0;
        
        // Arrange in a large circular pattern
        const radius = 250;
        for (let q = -20; q <= 20; q++) {
            for (let r = -20; r <= 20; r++) {
                const x = hexSpacing * (q + r/2);
                const z = hexSpacing * (Math.sqrt(3)/2) * r;
                
                if (Math.sqrt(x*x + z*z) < radius) {
                    if (idx >= this.count) break;
                    matrix.setPosition(x, 0, z);
                    this.mesh.setMatrixAt(idx, matrix);
                    idx++;
                }
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
