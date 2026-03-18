const THREE = window.THREE;

export class StarSystem {
    constructor(scene) {
        this.scene = scene;
        this.planets = [];
        this.init();
    }

    init() {
        // 1. HIGH-RES STARFIELD (Not too neon)
        const loader = new THREE.TextureLoader();
        const starsGeo = new THREE.SphereGeometry(6000, 32, 32);
        const starsMat = new THREE.MeshBasicMaterial({
            map: loader.load('./assets/textures/8k_stars.jpg'), 
            color: 0x222222, // Dimmed down for contrast
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.8
        });
        const stars = new THREE.Mesh(starsGeo, starsMat);
        this.scene.add(stars);

        // 2. DISTANT NEBULA (Subtle)
        const nebulaGeo = new THREE.SphereGeometry(5900, 64, 64);
        const nebulaMat = new THREE.MeshBasicMaterial({
            color: 0x110022,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        this.scene.add(new THREE.Mesh(nebulaGeo, nebulaMat));

        // 3. FEATURE PLANET (Gas Giant style)
        this.createPlanet(
            {x: -1200, y: 400, z: -800}, 
            300, 
            0x442255, 
            0.8 // Atmosphere intensity
        );

        // 4. MOON
        this.createPlanet(
            {x: 800, y: -200, z: -1500}, 
            150, 
            0x444444, 
            0.3
        );
    }

    createPlanet(pos, size, color, atm) {
        const group = new THREE.Group();
        group.position.set(pos.x, pos.y, pos.z);

        // Surface
        const geo = new THREE.SphereGeometry(size, 64, 64);
        const mat = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.8,
            metalness: 0.2
        });
        const surface = new THREE.Mesh(geo, mat);
        group.add(surface);

        // Atmosphere Glow (Layer 1 - Bloom enabled)
        const atmGeo = new THREE.SphereGeometry(size * 1.05, 64, 64);
        const atmMat = new THREE.ShaderMaterial({
            uniforms: {
                c: { value: 0.1 },
                p: { value: 4.5 },
                glowColor: { value: new THREE.Color(color) },
                viewVector: { value: new THREE.Vector3() }
            },
            vertexShader: `
                uniform vec3 viewVector;
                varying float intensity;
                void main() {
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                    vec3 vNormal = normalize( normalMatrix * normal );
                    vec3 vNormel = normalize( viewVector );
                    intensity = pow( 0.6 - dot(vNormal, vNormel), 4.0 );
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                varying float intensity;
                void main() {
                    gl_FragColor = vec4( glowColor, intensity );
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        const atmosphere = new THREE.Mesh(atmGeo, atmMat);
        atmosphere.layers.set(1); // BLOOM LAYER
        group.add(atmosphere);

        this.scene.add(group);
        this.planets.push({group, atmosphere});
    }

    update(camera) {
        this.planets.forEach(p => {
            p.atmosphere.material.uniforms.viewVector.value = 
                new THREE.Vector3().subVectors(camera.position, p.group.position);
        });
    }
}
