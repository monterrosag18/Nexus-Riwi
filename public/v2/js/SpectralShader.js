export const SpectralShader = {
    uniforms: {
        "tDiffuse": { value: null },
        "time": { value: 0.0 },
        "uColor": { value: new THREE.Color(0x00f3ff) },
        "uDispersion": { value: 0.5 }
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        uniform float time;
        uniform vec3 uColor;

        void main() {
            // 1. FRESNEL EFFECT (Edge Glow)
            float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
            
            // 2. SPECTRAL DISPERSION (Fake Rainbow)
            vec3 spectral = vec3(
                sin(time * 0.5 + vUv.y * 10.0) * 0.5 + 0.5,
                sin(time * 0.5 + vUv.y * 10.0 + 2.0) * 0.5 + 0.5,
                sin(time * 0.5 + vUv.y * 10.0 + 4.0) * 0.5 + 0.5
            );

            // 3. SCANLINES
            float scanline = sin(vUv.y * 400.0 + time * 5.0) * 0.1 + 0.9;

            vec3 finalColor = mix(uColor, spectral, 0.3) * fresnel * scanline;
            gl_FragColor = vec4(finalColor, fresnel * 0.8);
        }
    `
};
