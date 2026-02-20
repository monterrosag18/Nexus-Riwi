import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export class VolumetricBeam {
    constructor(color = 0x00f0ff) {
        this.color = new THREE.Color(color);
        this.mesh = this.createMesh();
    }

    createMesh() {
        // Cone pointing UP (Standard Cylinder trick)
        // CylinderGeometry(radiusTop, radiusBottom, height, segments)
        const geometry = new THREE.CylinderGeometry(15, 40, 100, 32, 10, true);

        // Translate geometry so pivot is at the bottom (for scaling/pointing)
        geometry.translate(0, 50, 0);

        const material = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: this.color },
                power: { value: 1.0 }, // Intensity
                decay: { value: 0.95 },
                time: { value: 0 }
            },
            vertexShader: `
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    vNormal = normal;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform float power;
                uniform float decay;
                uniform float time;
                varying vec3 vPosition;
                varying vec2 vUv;

                void main() {
                    // Soft fade from bottom (source) to top
                    float fade = 1.0 - smoothstep(0.0, 1.0, vUv.y);
                    
                    // Intensity falloff from center (Fresnel-ish)
                    float viewAngle = dot(normalize(vPosition), vec3(0.0, 1.0, 0.0));
                    float ray = pow(fade, decay) * power;

                    // Add some "dust" noise
                    float noise = sin(vUv.y * 50.0 - time * 2.0) * 0.1;
                    
                    gl_FragColor = vec4(color, (ray * 0.3) + noise);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const mesh = new THREE.Mesh(geometry, material);
        return mesh;
    }

    update(time) {
        if (this.mesh.material.uniforms) {
            this.mesh.material.uniforms.time.value = time;
        }
    }
}
