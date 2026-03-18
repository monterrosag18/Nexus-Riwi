const THREE = window.THREE;

export class EnergyNetwork {
    constructor(scene, centers) {
        this.scene = scene;
        this.centers = centers; // Array of clan center positions
        this.lines = [];
        
        this.init();
    }

    init() {
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0x00f3ff) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform float time;
                uniform vec3 color;
                void main() {
                    float pulse = step(0.9, fract(vUv.x * 2.0 - time * 2.0));
                    float glow = sin(vUv.x * 20.0 + time * 5.0) * 0.2 + 0.8;
                    vec3 finalColor = color * (glow + pulse * 4.0);
                    gl_FragColor = vec4(finalColor, 0.6);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.centers.forEach(pos => {
            // Create a curve from center to origin (tower)
            const curve = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(pos.x, 2, pos.z),
                new THREE.Vector3(pos.x * 0.5, 50, pos.z * 0.5),
                new THREE.Vector3(0, 5, 0)
            );

            const points = curve.getPoints(50);
            const geometry = new THREE.TubeGeometry(curve, 50, 0.4, 8, false);
            
            const mesh = new THREE.Mesh(geometry, material.clone());
            mesh.material.uniforms.color.value = new THREE.Color(0xffffff).lerp(new THREE.Color(0x00f3ff), 0.5);
            
            this.scene.add(mesh);
            this.lines.push(mesh);
        });
    }

    update(time) {
        this.lines.forEach(line => {
            line.material.uniforms.time.value = time;
        });
    }
}
